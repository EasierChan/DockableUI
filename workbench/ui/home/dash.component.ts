"use strict";

import { Component, OnInit, OnDestroy } from "@angular/core";
import { QtpService, QuoteService } from "../../bll/services";
import { DataTable, DataTableColumn, DataTableRow, ChartViewer, Section, ListItem } from "../../../base/controls/control";
import { SecuMasterService, AppStoreService } from "../../../base/api/services/backend.service";
import { ConfigurationBLL } from "../../bll/strategy.server";
import { ServiceType } from "../../../base/api/model";
import * as echarts from "echarts";
import { ECharts } from "echarts";

@Component({
    moduleId: module.id,
    selector: "dashboard",
    templateUrl: "dash.html",
    styleUrls: ["home.component.css", "dash.css"]
})
export class DashboardComponent implements OnInit, OnDestroy {
    alarmTable: DataTable;
    todoList: DataTable;
    worstStockList: DataTable;
    bestStockList: DataTable;
    selfStockTable: DataTable;
    productNet: Section;//产品净值
    productNetChart: ECharts;
    selfStockMarket: Section;
    selfStockMarketChart: ECharts;
    allProductWeight: Section;//产品资产比重
    allProductWeightGauge: ECharts;
    productScale: Section;//产品资产规模
    productScaleBar: ECharts;
    totalProfitAndLoss: number;//总盈亏
    floatProfitAndLoss: number;//浮动盈亏
    riskExposure: number;//敞口率
    riskDegree: number;//风险率
    futuresProfit: number;//期货权益
    productNetW: Section;
    aiStockDate: any = {};
    productData: any = [];
    monitorProductsData: any[];
    nowMonitorProductsData: any[];
    productNetData: any[];
    todoListData: any[];
    addTodoContent: string = "";
    alarmTableData: any[] = [];
    selfStockData: any = [];
    todoRowIndex: number;
    ukCodeList: any[] = [];
    productDataSort: any[] = []
    nowProductCaid: string = "";
    nowProductIndex: number;
    nowOperateStat: number;
    nowOperateId: number;
    preTurnOver: number = 0;//上一时刻的成交金额
    preMarketTime: string = ""//上一时刻的时间
    preMarketTimestamp: number;
    nowTurnover: number = 0;//时刻的成交金额
    bestStockUkMap: any = {};
    worstStockUkMap: any = {};
    selfStockUkMap: any = {};
    refStockIncrease: number;
    selfStockXdata: any[] = [];
    selfStockUkList: number[] = [];
    dashAllUkcodeList: number[] = [];
    mainStockUk: number;
    preMainStockUk: number;
    userId: number;//
    timeoutId: any;
    nowDate: any;
    nowTimeStamp: any;//当前时间戳
    nowTime: any;
    refStock: any = {};
    mainStock: any = {};
    todoCellIndex: number;
    referStockUk: number = 2490646;
    hasHistoryMarket: boolean = false;

    alarmlvObj: any = { "0": "一般", "1": "警告", "2": "严重", "3": "致命" };
    statObj: any = { "0": "未处理", "1": "处理中" };
    marketIndex: number;
    historyMarketIndex: number;

    constructor(private tradePoint: QtpService, private quote: QuoteService, private config: ConfigurationBLL,
        private secuinfo: SecuMasterService, private appsvr: AppStoreService) {

    }

    ngOnInit() {
        this.userId = Number(this.config.get("user").userid);
        this.config.on("toggle-view", () => {
            this.timeoutId = setTimeout(() => {
                this.selfStockMarketChart.resize();
                this.productNetChart.resize();
                this.productScaleBar.resize();
                this.allProductWeightGauge.resize();
            }, 300);
        });
        this.mainStock.todayClose = "--";

        //重要指数的uk列表
        this.selfStockUkList = [2490369, 1441794, 1441876, 1441949, 2490383, 2490381, 1441854];
        this.dashAllUkcodeList.push(this.referStockUk);
        this.dashAllUkcodeList = this.dashAllUkcodeList.concat(this.selfStockUkList);
        this.quote.send(17, 101, { topic: 3112, kwlist: this.dashAllUkcodeList });
        if (this.selfStockXdata.indexOf(this.nowTime) == -1) {//今天非交易时间段请求当日最后一条数据
            this.historyMarket("lastDate");
        }
        let d = new Date();
        this.nowDate = d.getFullYear() + "-" + (Number(d.getMonth()) + 1) + "-" + d.getDate();
        this.nowTime = d.getHours() + ":" + d.getMinutes();
        this.nowTimeStamp = d.getTime();

        let selfStockSecuInfo = this.secuinfo.getSecuinfoByUKey(2490369, 1441794, 1441876, 1441949, 2490383, 2490381, 1441854, this.referStockUk);
        this.selfStockUkList.forEach((item) => {
            let newItem: any = {};
            newItem.name = selfStockSecuInfo[item].SecuAbbr;
            newItem.stockCode = selfStockSecuInfo[item].SecuCode;
            newItem.ukey = selfStockSecuInfo[item].ukey;
            newItem.pre_close = (selfStockSecuInfo[item].PreClose / 10000).toFixed(2);
            newItem.tradeTime = selfStockSecuInfo[item].TradeTime;
            this.selfStockData.push(newItem)
        })
        this.refStock.name = selfStockSecuInfo[this.referStockUk].SecuCode + " [ " + selfStockSecuInfo[this.referStockUk].SecuAbbr + " ]";
        this.mainStock.preClose = this.selfStockData[0].pre_close;
        this.initSelfStockMarket(this.mainStock.preClose);
        this.mainStock.name = this.selfStockData[0].stockCode + "[" + this.selfStockData[0].name + "]";
        this.mainStockUk = this.selfStockData[0].ukey;
        this.selfStockXdata = this.getXDate(this.selfStockData[0].tradeTime);
        this.selfStockMarketChange.xAxis[0].data = this.selfStockXdata;
        this.selfStockMarketChange.xAxis[1].data = this.selfStockXdata;

        if (this.selfStockXdata.indexOf(this.nowTime) == -1) {//今天非交易时间段请求历史数据
            this.historyMarket("all");
        }

        this.bestStockList = new DataTable("table2");
        this.worstStockList = new DataTable("table2");
        this.worstStockList.addColumn("证券代码", "证券名称", "价格", "涨幅", "超额收益");
        this.worstStockList.columns[2].align = "right";
        this.worstStockList.columns[3].align = "right";
        this.worstStockList.columns[4].align = "right";
        this.worstStockList.columns[0].maxWidth = 80;
        this.bestStockList.addColumn("证券代码", "证券名称", "价格", "涨幅", "超额收益");
        this.bestStockList.columns[2].align = "right";
        this.bestStockList.columns[3].align = "right";
        this.bestStockList.columns[4].align = "right";
        this.bestStockList.columns[0].maxWidth = 80;
        this.selfStockTable = new DataTable("table2");
        this.selfStockTable.addColumn("代码", "名称", "现价", "涨跌", "涨跌幅", "成交量", "成交金额");

        this.selfStockTable.columns[2].align = "right";
        this.selfStockTable.columns[3].align = "right";
        this.selfStockTable.columns[4].align = "right";
        this.selfStockTable.columns[5].align = "right";
        this.selfStockTable.columns[6].align = "right";
        this.selfStockTable.columns[0].maxWidth = 100;
        this.selfStockData.forEach((item, index) => {
            let row = this.selfStockTable.newRow();
            if (index == 0) {
                row.backgroundColor = "#333";
            }
            row.cells[0].Text = item.stockCode;
            row.cells[1].Text = item.name;
            row.cells[1].Color = "#f3c239";
            row.cells[1].Data = item.ukey;
            row.cells[2].Data = item.pre_close;
            row.cells[2].Text = "--";
            row.cells[3].Text = "--";
            row.cells[3].Data = item.tradeTime;
            row.cells[4].Text = "--";
            row.cells[5].Text = "--";
            row.cells[6].Text = "--";
            this.selfStockUkMap[item.ukey] = {};
            this.selfStockUkMap[item.ukey].order = index;
            this.selfStockUkMap[item.ukey].type = "self";

        })
        this.mainStockUk = this.selfStockData[0].ukey;
        this.selfStockTable.onRowDBClick = (rowItem, rowIndex) => {//点击切换指数行情
            this.mainStock.preClose = rowItem.cells[2].Data;
            this.initSelfStockMarket(this.mainStock.preClose);
            this.selfStockTable.rows.forEach((item, index) => {
                item.backgroundColor = "rgba(0,0,0,0)";
            })
            rowItem.backgroundColor = "#333";
            this.mainStock.name = rowItem.cells[0].Text + "[" + rowItem.cells[1].Text + "]";
            this.mainStockUk = rowItem.cells[1].Data;

            this.selfStockXdata = this.getXDate(rowItem.cells[3].Data);
            this.selfStockMarketChange.xAxis[0].data = this.selfStockXdata;
            this.selfStockMarketChange.xAxis[1].data = this.selfStockXdata;
            this.selfStockMarketChart.setOption(this.selfStockMarketChange);
            this.preMainStockUk = this.mainStockUk;

            if (this.selfStockXdata.indexOf(this.nowTime) == -1) {//今天非交易时间内请求历史数据
                this.historyMarket("all");
            }
        }
        this.todoList = new DataTable("table2");

        this.todoList.RowIndex = false; // 去除序列
        this.todoList.addColumn("", "Todo内容", "计划完成时间", "编辑");
        this.todoList.columns[2].sortable = true;
        // this.todoList.ColumnHeader = false;
        this.todoList.columns[1].maxWidth = 250;
        this.todoList.columns[0].maxWidth = 20;
        this.todoList.columns[3].maxWidth = 50;
        this.todoList.columns[1].align = "center";
        this.todoList.columns[2].align = "center";
        this.todoList.columns[3].align = "center";
        this.alarmTable = new DataTable("table2");

        this.alarmTable.RowIndex = false; // 去除序列
        this.alarmTable.addColumn("来源", "内容", "严重程度", "状态", "时间");
        this.alarmTable.height = 300;
        this.selfStockMarket = new Section();
        this.selfStockMarket.content = this.createSelfStockMarketChart();
        this.productNet = new Section();
        this.productNet.content = this.createProductNetChart();
        this.allProductWeight = new Section();
        this.allProductWeight.content = this.createAllProductWeight();
        this.productScale = new Section();
        this.productScale.content = this.createProductScale();
        this.registerListener();
        //接实时行情
        this.quote.addSlot({
            appid: 17,
            packid: 110,
            callback: (msg) => {
                let d = new Date();
                this.nowTimeStamp = d.getTime();
                let stockIncrease = (100 * (msg.content.last - msg.content.pre_close) / msg.content.pre_close).toFixed(2);
                // this.currentMarketData[msg.content.ukey] = { "stockPrice": msg.content.last, "stockIncrease": stockIncrease };
                let test = Math.abs(this.nowTimeStamp - msg.content.time * 1000);
                // console.log("系统时间和实时行情时间差：" + test);
                if (Math.abs(this.nowTimeStamp - msg.content.time * 1000) <= 30000) {
                    // if (1) {
                    let marketTime = this.dashGetTime(msg.content.time + 60);//当前行情的时间
                    this.marketIndex = this.selfStockXdata.indexOf(marketTime);//当前行情在echarts中的位置
                    let lastPrice = Number((msg.content.last / 10000).toFixed(2));//现价
                    if (this.marketIndex != -1) {//找到相应的时间轴索引
                        if (this.selfStockUkList.indexOf(msg.content.ukey) != -1) {//主要指数
                            //主要指数列表
                            let increase = ((msg.content.last - msg.content.pre_close) / 10000).toFixed(2);
                            this.selfStockData.forEach((item, index) => {
                                if (item.ukey == msg.content.ukey) {
                                    this.selfStockTable.rows[index].cells[2].Text = (msg.content.last / 10000).toFixed(2);
                                    this.selfStockTable.rows[index].cells[2].Color = this.dashGetColor(increase, "color");
                                    this.selfStockTable.rows[index].cells[3].Text = this.dashGetColor(increase, "value");
                                    this.selfStockTable.rows[index].cells[3].Color = this.dashGetColor(increase, "color");
                                    this.selfStockTable.rows[index].cells[4].Text = this.dashGetColor(stockIncrease, "value") + '%';
                                    this.selfStockTable.rows[index].cells[4].Color = this.dashGetColor(stockIncrease, "color");
                                    this.selfStockTable.rows[index].cells[5].Text = this.barginPriceUnit(msg.content.volume);
                                    this.selfStockTable.rows[index].cells[6].Text = this.barginPriceUnit(msg.content.turnover * 100);
                                }
                            })
                            if (msg.content.ukey == this.mainStockUk) {//主要指数的实时行情
                                if (msg.content.time < this.preMarketTimestamp) {
                                    this.initSelfStockMarket(this.mainStock.preClose);//当回放行情的时候初始化图形
                                    return;
                                }
                                // console.log("now=====" + marketTime);
                                // console.log("pre=====" + this.preMarketTime)
                                let middle = Math.round(msg.content.pre_close / 10000);//昨收值
                                let turnover = msg.content.turnover * 100;//当前时刻行情的成交金额
                                if (this.preMarketTime != marketTime && this.selfStockXdata.indexOf(this.preMarketTime)) {
                                    this.nowTurnover = 0;//一分钟内的累计成交量
                                    this.preMarketTime = marketTime;//上一时刻的时间
                                    this.preMarketTimestamp = msg.content.time;
                                }
                                if (this.marketIndex == this.selfStockXdata.length - 1) {
                                    this.mainStock.todayClose = lastPrice;
                                }
                                if (this.marketIndex == 0 && this.nowTurnover == 0) {
                                    this.mainStock.open = lastPrice;
                                }
                                //切换页面或刚进入页面的时候
                                if (this.preTurnOver == 0 && this.marketIndex != 0) {
                                    this.historyMarket("all");
                                    if (!this.hasHistoryMarket) {
                                        this.mainStock.minPrice = lastPrice;
                                        this.mainStock.maxPrice = lastPrice;
                                    }
                                    this.preTurnOver = turnover;//上一时刻的成交金额
                                    return;
                                }
                                this.selfStockMarketChange.series[0].data[this.marketIndex] = lastPrice;

                                if (this.mainStock.minPrice > lastPrice) {
                                    this.mainStock.minPrice = lastPrice;
                                }
                                if (this.mainStock.maxPrice < lastPrice) {
                                    this.mainStock.maxPrice = lastPrice;
                                }

                                let abs = Math.abs(middle - this.mainStock.minPrice) >= Math.abs(middle - this.mainStock.maxPrice) ? Math.ceil(Math.abs(middle - this.mainStock.minPrice)) : Math.ceil(Math.abs(middle - this.mainStock.maxPrice));
                                //纵轴最大最小值
                                abs = Math.ceil(abs / 4) * 4;
                                this.selfStockMarketChange.yAxis[0].interval = abs / 2;
                                this.selfStockMarketChange.yAxis[0].min = middle - abs;
                                this.selfStockMarketChange.yAxis[0].max = middle + abs;
                                this.nowTurnover = Number((turnover - this.preTurnOver + this.nowTurnover).toFixed(2));//当前时间的成金额
                                this.preTurnOver = turnover;//上一时刻的成交量
                                let barUnit;
                                let unitObj = { "10000": "万", "100000000": "亿" }
                                if (this.selfStockMarketChange.yAxis[1].max < this.nowTurnover) {//设置成交金额的最大值
                                    this.selfStockMarketChange.yAxis[1].max = this.nowTurnover;
                                    if (this.selfStockMarketChange.yAxis[1].max > 100000000) {
                                        barUnit = 100000000;
                                    } else if (this.selfStockMarketChange.yAxis[1].max > 20000) {
                                        barUnit = 10000;
                                    }
                                    this.selfStockMarketChange.yAxis[1].axisLabel.formatter = function (value) {
                                        return (value / barUnit).toFixed(0) + unitObj[barUnit];
                                    }
                                    // this.selfStockMarketChange.tooltip.formatter = function (series) {
                                    //     let ret = "";
                                    //     ret += series[0].seriesIndex === 0 ? "现价：" + series[0].value : ("成交金额:" + (series[1].value / barUnit).toFixed(0) + unitObj[barUnit]);
                                    //     ret += series[1].seriesIndex === 1 ? ("成交金额:" + (series[1].value / barUnit).toFixed(0) + unitObj[barUnit])  : "现价：" + series[0].value;
                                    //     return ret;
                                    // }

                                }
                                let barColor = "#e3b93b";
                                if (lastPrice > this.selfStockMarketChange.series[0].data[this.marketIndex - 1]) {
                                    barColor = "rgb(234, 47, 47)";
                                } else if (lastPrice < this.selfStockMarketChange.series[0].data[this.marketIndex - 1]) {
                                    barColor = "rgb(55, 177, 78)";
                                }
                                this.selfStockMarketChange.series[1].data[this.marketIndex] = {
                                    value: this.nowTurnover,
                                    itemStyle: {
                                        normal: {
                                            color: barColor
                                        }
                                    }
                                };
                                this.selfStockMarketChange.yAxis[1].max = Math.ceil(this.selfStockMarketChange.yAxis[1].max / 2) * 2;
                                this.selfStockMarketChange.yAxis[1].interval = this.selfStockMarketChange.yAxis[1].max / 2;
                                if (this.selfStockMarketChart) {
                                    this.selfStockMarketChart.setOption(this.selfStockMarketChange);
                                }
                                // console.log("成交金额" + this.nowTurnover);
                            }
                        }
                    }
                    if (msg.content.ukey == this.referStockUk) {//中证1000的涨幅
                        this.refStockIncrease = Number(stockIncrease);
                        this.refStock.price = lastPrice;
                        this.refStock.increase = this.refStockIncrease;
                    }
                    if (this.ukCodeList.indexOf(msg.content.ukey) != -1) {//AI看盘的实时行情
                        let ukInBestIndex, ukInWorstIndex;
                        if (this.bestStockUkMap[msg.content.ukey]) {
                            ukInBestIndex = this.bestStockUkMap[msg.content.ukey].order;
                        }
                        if (this.worstStockUkMap[msg.content.ukey]) {
                            ukInWorstIndex = this.worstStockUkMap[msg.content.ukey].order;
                        }

                        if (this.refStockIncrease) {//参考股的数值回来才有超额涨幅
                            //超额涨幅
                            let overStockIncrease = Number(Number(stockIncrease) - this.refStockIncrease).toFixed(2);
                            if (ukInBestIndex != undefined) {
                                this.bestStockList.rows[ukInBestIndex].cells[4].Text = this.dashGetColor(overStockIncrease, "value") + "%";
                                this.bestStockList.rows[ukInBestIndex].cells[4].Color = this.dashGetColor(overStockIncrease, "color");
                            }
                            if (ukInWorstIndex != undefined) {
                                this.worstStockList.rows[ukInWorstIndex].cells[4].Text = this.dashGetColor(overStockIncrease, "value") + "%";
                                this.worstStockList.rows[ukInWorstIndex].cells[4].Color = this.dashGetColor(overStockIncrease, "color");
                            }
                        }
                        if (ukInBestIndex != undefined) {
                            this.bestStockList.rows[ukInBestIndex].cells[2].Text = (msg.content.last / 10000).toFixed(2);
                            this.bestStockList.rows[ukInBestIndex].cells[3].Text = this.dashGetColor(stockIncrease, "value") + "%";
                            this.bestStockList.rows[ukInBestIndex].cells[3].Color = this.dashGetColor(stockIncrease, "color");
                        }
                        if (ukInWorstIndex != undefined) {
                            this.worstStockList.rows[ukInWorstIndex].cells[2].Text = (msg.content.last / 10000).toFixed(2);
                            this.worstStockList.rows[ukInWorstIndex].cells[3].Text = this.dashGetColor(stockIncrease, "value") + "%";
                            this.worstStockList.rows[ukInWorstIndex].cells[3].Color = this.dashGetColor(stockIncrease, "color");
                        }
                    }
                }
            }
        });

        //预警接口 
        this.tradePoint.addSlotOfCMS("getAlarmMessage", (msg) => {
            let data = JSON.parse(msg.toString());
            if (data.msret.msgcode != "00") {
                alert("getAlarmMessage:msgcode = " + data.msret.msgcode + "; msg = " + data.msret.msg);
                return;
            }

            this.alarmTableData = data.body;
            if (this.alarmTableData.length > 0) {
                this.alarmTableData.forEach(item => {
                    this.createAlarmRow(item);
                })
            }
            this.tradePoint.subscribeCom(1002, { data: { keys: [{ maid: "*" }] } })
        }, this);


        //告警消息订阅
        this.tradePoint.onTopic(1002, (key, data) => {
            let keyObj = JSON.parse(key.toString());
            let dataObj = JSON.parse(data.toString()).data;
            let changeIndex;
            let isExist = this.alarmTable.rows.some((item, index) => {
                if (item.cells[0].Data == dataObj.id) {
                    changeIndex = index;
                }
                return item.cells[0].Data == dataObj.id;
            })
            // console.info(dataObj.id);
            // console.info(dataObj);

            if (!isExist) {
                this.alarmTableData.push(dataObj);
                this.createAlarmRow(dataObj);
            } else {
                // console.log(changeIndex)
                let changeRow = this.alarmTable.rows[changeIndex];
                if (this.statObj[dataObj.stat]) {
                    let alarmDate = dataObj.alarmtime.substring(0, 10);
                    changeRow.cells[0].Text = dataObj.appname;
                    changeRow.cells[0].Data = dataObj.id;
                    changeRow.cells[1].Text = dataObj.content;
                    changeRow.cells[2].Text = this.alarmlvObj[dataObj.alarmlv];
                    changeRow.cells[3].Text = this.statObj[dataObj.stat];
                    if (this.nowDate == alarmDate) {
                        changeRow.cells[4].Text = dataObj.alarmtime.substring(10);
                    } else {
                        changeRow.cells[4].Text = alarmDate;
                    }
                }
            }



        }, this);

        //产品信息
        this.tradePoint.sendToCMS("getMonitorProducts", JSON.stringify({ data: { head: { userid: this.userId }, body: {} } }));
        this.config.on("getProduct", (data) => {
            if (data.length > 0) {
                this.nowProductIndex = data.length;
                this.nowProductCaid = data[0].caid;
                this.productNetData = [];
                this.tradePoint.sendToCMS("getMonitorProducts", JSON.stringify({ data: { head: { userid: this.userId }, body: { caid: this.nowProductCaid } } }));
                this.tradePoint.sendToCMS("getProductNet", JSON.stringify({ data: { head: { userid: this.userId }, body: { caid: this.nowProductCaid } } }));
            }
        })

        //产品净值
        this.tradePoint.addSlotOfCMS("getProductNet", (msg) => {
            let data = JSON.parse(msg.toString());
            if (data.msret.msgcode != "00") {
                alert("getProductNet:msgcode = " + data.msret.msgcode + "; msg = " + data.msret.msg);
                return;
            }
            let productNetChangeOpt = {
                title: { text: "" },
                xAxis: [{ data: [] }],
                series: [{ data: [] }]
            }
            this.productNetData = data.body;
            if (this.productNetData.length > 0) {
                this.productNetData.forEach(item => {
                    productNetChangeOpt.xAxis[0].data.push(item.trday);
                    productNetChangeOpt.title.text = item.caname;
                    productNetChangeOpt.series[0].data.push(item.netvalue);
                })
                this.productNetChart.setOption(productNetChangeOpt);
            }
        }, this)

        //getMonitorProductsAns
        this.tradePoint.addSlotOfCMS("getMonitorProducts", (msg) => {
            let data = JSON.parse(msg.toString());
            if (data.msret.msgcode != "00") {
                alert("getMonitorProducts:msgcode = " + data.msret.msgcode + "; msg = " + data.msret.msg);
                return;
            }
            this.monitorProductsData = data.body;
            if (this.monitorProductsData.length > 0) {
                // if (this.monitorProductsData[0].caid == this.nowProductCaid && this.monitorProductsData.length == 1) {//获取单个产品数据
                if (this.monitorProductsData[0].caid == this.nowProductCaid && this.monitorProductsData.length == 1) {//获取单个产品数据
                    this.nowMonitorProductsData = this.monitorProductsData;
                    //期货权益
                    this.futuresProfit = Number(this.nowMonitorProductsData[0].futures_validamt) + Number(this.nowMonitorProductsData[0].futures_value);
                    //风险度
                    this.riskDegree = (this.futuresProfit == 0) ? 0 : 100 * this.nowMonitorProductsData[0].totalmargin / this.futuresProfit;
                    this.riskDegree = Math.abs(this.riskDegree) > 100 ? Number(this.riskDegree.toFixed(0)) : Number(this.riskDegree.toFixed(2));
                    //当日盈亏
                    this.totalProfitAndLoss = this.toThousands(((Number(this.nowMonitorProductsData[0].hold_closepl) + Number(this.nowMonitorProductsData[0].hold_posipl)) / 1000).toFixed(1));
                    //浮动盈亏 
                    this.floatProfitAndLoss = this.toThousands((this.nowMonitorProductsData[0].hold_posipl / 1000).toFixed(1));
                    //敞口比例
                    this.riskExposure = (Number(this.nowMonitorProductsData[0].totalint) == 0) ? 0 : 100 * Number(Number(this.nowMonitorProductsData[0].risk_exposure) / Number(this.nowMonitorProductsData[0].totalint));
                    this.riskExposure = Math.abs(this.riskExposure) > 100 ? Number(this.riskExposure.toFixed(0)) : Number(this.riskExposure.toFixed(2));
                } else if (this.monitorProductsData.length > 1) {
                    let productScaleChangeOpt = {
                        yAxis: { data: [] },
                        series: [{ data: [] }]
                    }
                    data.body.forEach((item, index) => {
                        let newItem: any = {};
                        newItem.totalAssets = Number(item.totalint) + Number(item.subject_amount);
                        newItem.caid = item.caid;
                        newItem.caname = item.caname;
                        // console.log(newItem);
                        this.productData.push(newItem);
                    })
                    this.productDataSort = this.productData.sort(this.compare("totalAssets"));
                    this.productDataSort.forEach(item => {
                        productScaleChangeOpt.yAxis.data.push(item.caname);
                        productScaleChangeOpt.series[0].data.push(Math.log(item.totalAssets < 1 ? 1 : item.totalAssets) / Math.log(2));
                    })
                    this.productScaleBar.setOption(productScaleChangeOpt);

                    let allProWeightGaugeChangeOpt = {
                        xAxis: [{ data: [] }],
                        series: [{ data: [] }, { data: [] }, { data: [] }, { data: [] }]
                    }
                    //产品资产比重改变值
                    if (this.monitorProductsData.length > 1) {
                        this.monitorProductsData.forEach(item => {
                            allProWeightGaugeChangeOpt.xAxis[0].data.push(item.caname);
                            let money = Number(item.stock_validamt) + Number(item.futures_validamt);
                            let totalMoney = money + Number(item.stock_value) + Number(item.totalmargin) + Number(item.subject_amount);
                            if (totalMoney == 0) {
                                totalMoney = 1;
                            }
                            //股票市值
                            allProWeightGaugeChangeOpt.series[0].data.push(Math.round(10000 * Number(item.stock_value) / totalMoney) / 100);
                            //期货保证金
                            allProWeightGaugeChangeOpt.series[1].data.push(Math.round(10000 * Number(item.totalmargin) / totalMoney) / 100);
                            //现金
                            allProWeightGaugeChangeOpt.series[2].data.push(Math.round(10000 * money / totalMoney) / 100);
                            //其他资产
                            allProWeightGaugeChangeOpt.series[3].data.push(Math.round(10000 * Number(item.subject_amount) / totalMoney) / 100);
                        })
                        this.allProductWeightGauge.setOption(allProWeightGaugeChangeOpt);
                    }
                }
            }
        }, this)



        //最好的30股票
        this.tradePoint.addSlotOfCMS("getBestStocks", msg => {
            let data = JSON.parse(msg.toString());
            if (data.msret.msgcode != "00") {
                alert("getBestStocks:msgcode = " + data.msret.msgcode + "; msg = " + data.msret.msg);
                return;
            }
            this.aiStockDate.bestStockListData = data.body;
            this.bestStockList.RowIndex = false; // 去除序列
            if (this.aiStockDate.bestStockListData.length > 0) {
                this.aiStockDate.bestStockListData.forEach((item, index) => {
                    this.ukCodeList.push(Number(item.ukcode));
                    this.dashAllUkcodeList.push(Number(item.ukcode));
                    let row = this.bestStockList.newRow();
                    this.bestStockUkMap[item.ukcode] = {};
                    this.bestStockUkMap[item.ukcode].order = index;
                    this.bestStockUkMap[item.ukcode].type = "best";
                    row.cells[0].Text = item.windcode;
                    row.cells[0].Color = "rgb(234, 47, 47)";
                    row.cells[1].Text = item.chabbr;
                    row.cells[2].Text = "--";
                    row.cells[3].Text = "--";
                    row.cells[4].Text = "--";
                })
            }
            this.quote.send(17, 101, { topic: 3112, kwlist: this.dashAllUkcodeList });
            if (this.selfStockXdata.indexOf(this.nowTime) == -1) {//今天非交易时间段请求当日最后一条数据
                this.historyMarket("lastDate");
            }
        }, this)

        //最差的30股
        this.tradePoint.addSlotOfCMS("getWorstStocks", msg => {
            let data = JSON.parse(msg.toString());
            if (data.msret.msgcode != "00") {
                alert("getWorstStocks:msgcode = " + data.msret.msgcode + "; msg = " + data.msret.msg);
                return;
            }
            this.aiStockDate.worstStockListData = data.body;
            this.worstStockList.RowIndex = false; // 去除序列
            if (this.aiStockDate.worstStockListData.length > 0) {
                this.aiStockDate.worstStockListData.forEach((item, index) => {
                    this.ukCodeList.push(Number(item.ukcode));
                    this.dashAllUkcodeList.push(Number(item.ukcode));
                    let row = this.worstStockList.newRow();
                    this.worstStockUkMap[item.ukcode] = {};
                    this.worstStockUkMap[item.ukcode].order = index;
                    this.worstStockUkMap[item.ukcode].type = "worst";
                    row.cells[0].Text = item.windcode;
                    row.cells[0].Color = "rgb(55, 177, 78)";
                    row.cells[1].Text = item.chabbr;
                    row.cells[2].Text = "--";
                    row.cells[3].Text = "--";
                })
            }
            this.quote.send(17, 101, { topic: 3112, kwlist: this.dashAllUkcodeList });
            if (this.selfStockXdata.indexOf(this.nowTime) == -1) {//今天非交易时间段请求当日最后一条数据
                this.historyMarket("lastDate");
            }
        }, this)

        //todo列表
        this.tradePoint.addSlotOfCMS("getTodoList", msg => {
            let data = JSON.parse(msg.toString());
            if (data.msret.msgcode != "00") {
                alert("getTodoList:msgcode = " + data.msret.msgcode + "; msg = " + data.msret.msg);
                return;
            }
            this.todoListData = data.body;
            this.todoList.rows.length = 0;
            if (this.todoListData.length > 0) {
                this.todoListData.forEach((item, itemIndex) => {
                    if (item.updatetime < this.nowDate && item.stat == "1") {
                        return;
                    }
                    let row = this.todoList.newRow();
                    let todoTime = new Date(item.todotime.substring(0, 10));
                    if (item.stat == "1") {
                        row.cells[1].Color = "rgb(93, 83, 84)";
                        row.cells[2].Color = "rgb(93, 83, 84)";
                    } else {
                        if (new Date(this.nowDate) > todoTime) {
                            row.cells[1].Color = "rgb(234, 47, 47)";
                            row.cells[2].Color = "rgb(234, 47, 47)";
                        } else {
                            row.cells[1].Color = "rgb(208, 208, 208)";
                            row.cells[2].Color = "rgb(208, 208, 208)";
                        }
                    }
                    row.cells[0].Type = "icon";
                    row.cells[0].Data = { id: item.id, stat: item.stat };
                    if (row.cells[0].Data.stat == "1") {
                        row.cells[0].Title = "check";
                        row.cells[0].Color = "rgb(93, 83, 84)";
                    } else {
                        row.cells[0].Title = "unchecked";
                        if (new Date(this.nowDate) > todoTime) {
                            row.cells[0].Color = "rgb(234, 47, 47)";
                        } else {
                            row.cells[0].Color = "rgb(208, 208, 208)";
                        }
                    }
                    //复选框单击事件，颜色变化和请求的发送
                    row.cells[0].OnClick = (event, cellIndex, rowIndex) => {
                        this.todoCellIndex = cellIndex;
                        this.todoRowIndex = rowIndex;
                        this.nowOperateId = this.todoList.rows[rowIndex].cells[0].Data.id;
                        this.nowOperateStat = this.todoList.rows[rowIndex].cells[0].Data.stat == "1" ? 0 : 1;
                        this.tradePoint.sendToCMS("editTodo", JSON.stringify({
                            data: {
                                head: { userid: this.userId },
                                body: {
                                    id: this.nowOperateId,
                                    stat: this.nowOperateStat,
                                    content: this.todoList.rows[rowIndex].cells[1].Text,
                                    todotime: this.todoList.rows[rowIndex].cells[2].Text
                                }
                            }
                        }));
                    }
                    row.cells[1].Text = item.content;
                    row.cells[1].Type == "plaintext"
                    row.cells[2].Text = item.todotime.substring(0, 10);
                    row.cells[3].Type = "button-group";
                    row.cells[3].Class = "default";
                    row.cells[3].Text = ["pencil", "trash"];
                    row.cells[3].OnClick = (index, cellIndex, rowIndex) => {
                        this.todoCellIndex = cellIndex;
                        this.todoRowIndex = rowIndex;
                        this.nowOperateId = this.todoList.rows[rowIndex].cells[0].Data.id;
                        this.nowOperateStat = this.todoList.rows[rowIndex].cells[0].Data.stat;
                        if (row.cells[1].Type == "textbox") {
                            if (index == 0) {//确认编辑
                                if (row.cells[1].Text.length == 0) {
                                    alert("Todo内容不能为空！")
                                    return;
                                }
                                this.tradePoint.sendToCMS("editTodo", JSON.stringify({
                                    data: {
                                        head: { userid: this.userId },
                                        body: {
                                            id: this.nowOperateId,
                                            stat: this.nowOperateStat,
                                            content: row.cells[1].Text,
                                            todotime: row.cells[2].Text
                                        }
                                    }
                                }));
                            } else if (index == 1) {//取消编辑
                                row.cells[1].Text = item.content;
                                row.cells[2].Text = item.todotime.substring(0, 10);
                                row.cells[3].Text = ["pencil", "trash"];
                                row.cells[1].Type = "plaintext";
                                row.cells[2].Type = "plaintext";
                                return ;
                            }
                        } else if (row.cells[1].Type == "plaintext") {
                            if (index == 1) {//删除操作
                                this.tradePoint.sendToCMS("deleteTodo", JSON.stringify({ data: { head: { userid: this.userId }, body: { id: this.nowOperateId } } }));
                            } else if (index == 0) {//编辑
                                row.cells[1].Type = "textbox";
                                row.cells[2].Type = "date";
                                row.cells[3].Text = ["ok", "remove"];
                            }
                        }
                    };
                })
            }

        }, this)
        //addTodo
        this.tradePoint.addSlotOfCMS("createTodo", msg => {
            let data = JSON.parse(msg.toString());
            if (data.msret.msgcode != "00") {
                alert("createTodo:msgcode = " + data.msret.msgcode + "; msg = " + data.msret.msg);
                return;
            }

            this.tradePoint.sendToCMS("getTodoList", JSON.stringify({ data: { head: { userid: this.userId }, body: {} } }));
        }, this)
        //editTodo
        this.tradePoint.addSlotOfCMS("editTodo", msg => {
            let data = JSON.parse(msg.toString());
            if (data.msret.msgcode != "00") {
                alert("editTodo:msgcode = " + data.msret.msgcode + "; msg = " + data.msret.msg);
                return;
            }
            if (this.todoCellIndex == 0)
                this.todoList.rows[this.todoRowIndex].cells[0].Data.stat = this.todoList.rows[this.todoRowIndex].cells[0].Data.stat == "0" ? "1" : "0";

            let isPast = new Date(this.nowDate) > new Date(this.todoList.rows[this.todoRowIndex].cells[2].Text);
            this.todoList.rows[this.todoRowIndex].cells[3].Text = ["pencil", "trash"];;
            this.todoList.rows[this.todoRowIndex].cells[1].Type = "plaintext";
            this.todoList.rows[this.todoRowIndex].cells[2].Type = "plaintext";
            this.nowOperateStat = Number(this.todoList.rows[this.todoRowIndex].cells[0].Data.stat);
            if (this.nowOperateStat) {//已完成
                this.todoList.rows[this.todoRowIndex].cells[0].Title = "check";
                this.todoList.rows[this.todoRowIndex].cells[0].Color = "rgb(93, 83, 84)";
                this.todoList.rows[this.todoRowIndex].cells[1].Color = "rgb(93, 83, 84)";
                this.todoList.rows[this.todoRowIndex].cells[2].Color = "rgb(93, 83, 84)";
            } else {//未完成
                this.todoList.rows[this.todoRowIndex].cells[0].Title = "unchecked";
                if (isPast) {//已过期
                    this.todoList.rows[this.todoRowIndex].cells[1].Color = "rgb(234, 47, 47)";
                    this.todoList.rows[this.todoRowIndex].cells[2].Color = "rgb(234, 47, 47)";
                    this.todoList.rows[this.todoRowIndex].cells[0].Color = "rgb(234, 47, 47)";
                } else {
                    this.todoList.rows[this.todoRowIndex].cells[1].Color = "rgb(208, 208, 208)";
                    this.todoList.rows[this.todoRowIndex].cells[2].Color = "rgb(208, 208, 208)";
                    this.todoList.rows[this.todoRowIndex].cells[0].Color = "rgb(208, 208, 208)";
                }
            }
        }, this)
        //删除todo列表
        this.tradePoint.addSlotOfCMS("deleteTodo", msg => {
            let data = JSON.parse(msg.toString());
            if (data.msret.msgcode != "00") {
                alert("deleteTodo:msgcode = " + data.msret.msgcode + "; msg = " + data.msret.msg);
                return;
            }
            this.todoList.rows.splice(this.todoRowIndex, 1);
        }, this)
        this.tradePoint.sendToCMS("getAlarmMessage", JSON.stringify({ data: { head: { userid: this.userId }, body: {} } }));
        this.tradePoint.sendToCMS("getProduct", JSON.stringify({ data: { head: { userid: this.userId }, body: {} } }));
        //AI看盘数据
        this.tradePoint.sendToCMS("getWorstStocks", JSON.stringify({ data: { head: { userid: this.userId }, body: {} } }));
        this.tradePoint.sendToCMS("getBestStocks", JSON.stringify({ data: { head: { userid: this.userId }, body: {} } }));
        //获取todo列表
        this.tradePoint.sendToCMS("getTodoList", JSON.stringify({ data: { head: { userid: this.userId }, body: {} } }));
    }
    createAlarmRow(item) {
        if (this.statObj[item.stat]) {
            let alarmDate = item.alarmtime.substring(0, 10);
            let row = this.alarmTable.newRow();
            row.cells[0].Text = item.appname;
            row.cells[0].Data = item.id;
            row.cells[1].Text = item.content;
            row.cells[2].Text = this.alarmlvObj[item.alarmlv];
            row.cells[3].Text = this.statObj[item.stat];
            if (this.nowDate == alarmDate) {
                row.cells[4].Text = item.alarmtime.substring(10);
            } else {
                row.cells[4].Text = alarmDate;
            }
        }
    }
    //千分符
    toThousands(num) {
        var number = typeof (num) != "String" ? num.toString() : num;
        var numArr = number.split(".");
        var newstr = numArr[0].replace(/\d{1,3}(?=(\d{3})+$)/g, function (s) {
            return s + ","
        })
        if (numArr.length == 2) {
            newstr = newstr + "." + numArr[1];
        }
        return newstr;
    }
    addTodoEvent(event) {
        if (event && event.keyCode != 13) {
            return;
        }
        if (this.addTodoContent.length == 0) {
            alert("Todo内容不能为空！")
            return;
        }
        console.log((this.nowDate))
        this.tradePoint.sendToCMS("createTodo", JSON.stringify({
            data: {
                head: { userid: this.userId },
                body: { content: this.addTodoContent, stat: "0", oid: this.userId, todotime: this.nowDate }
            }
        }));

        // event.blur();
        this.addTodoContent = "";
    }

    getNowProductDataBefore() {
        this.nowProductIndex = this.nowProductIndex + this.productData.length - 1;
        this.nowProductIndex = this.nowProductIndex % this.productData.length;
        this.nowProductCaid = this.productData[this.nowProductIndex].caid;
        this.tradePoint.sendToCMS("getMonitorProducts", JSON.stringify({ data: { head: { userid: this.userId }, body: { caid: this.nowProductCaid } } }));
        this.tradePoint.sendToCMS("getProductNet", JSON.stringify({ data: { head: { userid: this.userId }, body: { caid: this.nowProductCaid } } }));
    }

    getNowProductDataNext() {
        this.nowProductIndex++;
        this.nowProductIndex = this.nowProductIndex % this.productData.length;
        this.nowProductCaid = this.productData[this.nowProductIndex].caid;
        this.tradePoint.sendToCMS("getMonitorProducts", JSON.stringify({ data: { head: { userid: this.userId }, body: { caid: this.nowProductCaid } } }));
        this.tradePoint.sendToCMS("getProductNet", JSON.stringify({ data: { head: { userid: this.userId }, body: { caid: this.nowProductCaid } } }));
    }

    compare(property) {
        return function (a, b) {
            return b[property] - a[property];
        }
    }

    dashGetColor(num, flag) {
        if (flag == "color") {
            if (Number(num) > 0) {
                return "rgb(234, 47, 47)";
            }
            return "rgb(55, 177, 78)";
        }
        if (Number(num) > 0) {
            return "+" + num;
        }
        return num;
    }
    dashGetTime(tm) {
        let myDate = new Date(tm * 1000);
        let h = (myDate.getHours() < 10) ? ("0" + myDate.getHours()) : myDate.getHours();
        let m = (myDate.getMinutes() < 10) ? ("0" + myDate.getMinutes()) : myDate.getMinutes();
        return h + ":" + m;
    }
    barginPriceUnit(price) {
        let numLength = (price + "").length;
        price = Number(price);
        if (numLength >= 9) {
            return (price / 100000000).toFixed(2) + "亿";
        } else if (numLength >= 4) {
            return (price / 10000).toFixed(2) + "万";
        } else {
            return price.toFixed(2);
        }
    }

    initSelfStockMarket(pre_close) {
        this.preMarketTimestamp = 0;
        this.mainStock.todayClose = "--";
        this.mainStock.name = "--";
        this.mainStock.open = "--";
        this.mainStock.maxPrice = "--";
        this.mainStock.minPrice = "--";
        this.mainStockUk = this.selfStockData[0].ukey;
        this.preTurnOver = 0;
        this.nowTurnover = 0;
        this.selfStockMarketChange.series[1].data = [];
        this.selfStockMarketChange.series[1].data.length = this.selfStockXdata.length;
        this.selfStockMarketChange.yAxis[1].max = 0;
        this.selfStockMarketChange.series[0].data = [];
        this.selfStockMarketChange.series[0].data.length = this.selfStockXdata.length;
        this.selfStockMarketChange.yAxis[0].min = Math.ceil(pre_close) - 2;
        this.selfStockMarketChange.yAxis[0].max = Math.ceil(pre_close) + 2;
        this.selfStockMarketChange.yAxis[0].interval = 1;
        this.selfStockMarketChange.series[0].markLine.data[0].yAxis = pre_close;
        if (this.selfStockMarketChart) {
            this.selfStockMarketChart.setOption(this.selfStockMarketChange);
        }
    }

    getXDate(tradeTime) {
        var timeArr = tradeTime.match(/\d{4}/ig);
        timeArr.filter(function (item, index) {
            var item = item.split("");
            item.splice(2, 0, ":");
            item = item.join("");
            timeArr[index] = item;
        })
        var d = new Date("2017/11/11 00:00");
        var allTimeArr = []; //总的时间
        var resultArr = [];//结果数据
        var hour;
        var minute;
        for (let time = "00:00"; time <= "23:59";) {
            allTimeArr.push(time);
            if (allTimeArr.length >= 1440) {
                break;
            }
            d.setMinutes(d.getMinutes() + 1);
            hour = (d.getHours() < 10 ? "0" + d.getHours() : d.getHours());
            minute = (d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes());
            time = hour + ":" + minute;
        }
        resultArr.push(timeArr[0]);
        for (var i = 0; i < timeArr.length - 1; i += 2) {
            allTimeArr.forEach(function (item, index) {
                if (item > timeArr[i] && item <= timeArr[i + 1]) {
                    resultArr.push(item);
                }
            })
        }
        return resultArr;
    }
    selfStockMarketChange: any = {
        tooltip: {
            // formatter: function (series) {
            //     return "现价：" + series[0].data + "成交金额:" + series[1].data
            // }
        },
        xAxis: [{
            data: this.selfStockXdata
        }, {
            data: this.selfStockXdata
        }],
        yAxis: [
            {
                interval: 1,
                min: 0,
                max: 4
            }, {
                interval: 1,
                min: 0,
                max: 2,
                axisLabel: {
                    formatter: function (price, index) {
                        return price.toFixed(0);
                    }
                }
            }
        ],
        series: [
            {
                data: [0],
                markLine: { data: [{ yAxis: 2 }] }
            },
            { data: [0] }
        ]
    }


    historyMarket(historyType) {
        let d = new Date();
        let time = (d.getHours() < 10 ? ("0" + d.getHours()) : d.getHours()) + "" + (d.getMinutes() < 10 ? ("0" + d.getMinutes()) : d.getMinutes()) + "" + (d.getSeconds() < 10 ? ("0" + d.getSeconds()) : d.getSeconds()) + "000";
        let partIndex = 1;
        this.selfStockMarketChange.series[0].data = [];
        this.hasHistoryMarket = false;
        //接历史行情 
        if (historyType == "all") {
            this.quote.send(181, 10001, { requestId: 1, dataType: 101002, ukeyCode: this.mainStockUk, timeFrom: 93000000 });
        } else {
            this.quote.send(181, 10001, { requestId: 1, dataType: 102001, ukeyList: this.dashAllUkcodeList.join(";"), partOrder: -1 });
        }
        this.quote.addSlot({
            appid: 181,
            packid: 10002,
            callback: (msg) => {
                if (msg.content.head.dataType == 102001) {
                    // console.log(msg);
                    let lastDate = msg.content.data;
                    let referStock = {};
                    referStock[this.referStockUk] = {};
                    referStock[this.referStockUk].order = 0;
                    referStock[this.referStockUk].type = "refer";
                    let allStockUkMap = Object.assign(this.bestStockUkMap, this.worstStockUkMap, this.selfStockUkMap, referStock);
                    lastDate.forEach(item => {
                        let nowPrice = (item.p / 10000).toFixed(2);
                        let increase = ((item.p - item.pc) / 10000).toFixed(2);
                        let increasePer = ((item.p - item.pc) / item.pc).toFixed(2);
                        let referIncrease;
                        if (this.refStock.increase) {
                            referIncrease = (Number(increasePer) - Number(this.refStock.increase)).toFixed(2);
                        }
                        if (allStockUkMap[item.k].type == "worst") {
                            this.worstStockList.rows[allStockUkMap[item.k].order].cells[1].Text = nowPrice;
                            this.worstStockList.rows[allStockUkMap[item.k].order].cells[2].Text = this.dashGetColor(increasePer, "value") + "%";
                            this.worstStockList.rows[allStockUkMap[item.k].order].cells[2].Color = this.dashGetColor(increasePer, "color");
                            if (referIncrease) {
                                this.worstStockList.rows[allStockUkMap[item.k].order].cells[3].Color = this.dashGetColor(referIncrease, "color");
                                this.worstStockList.rows[allStockUkMap[item.k].order].cells[3].Text = this.dashGetColor(referIncrease, "value") + "%";
                            }
                        } else if (allStockUkMap[item.k].type == "best") {
                            this.bestStockList.rows[allStockUkMap[item.k].order].cells[2].Text = nowPrice;
                            this.bestStockList.rows[allStockUkMap[item.k].order].cells[3].Text = this.dashGetColor(increasePer, "value") + "%";
                            this.bestStockList.rows[allStockUkMap[item.k].order].cells[3].Color = this.dashGetColor(increasePer, "color");
                            if (referIncrease) {
                                this.bestStockList.rows[allStockUkMap[item.k].order].cells[4].Color = this.dashGetColor(referIncrease, "color");
                                this.bestStockList.rows[allStockUkMap[item.k].order].cells[4].Text = this.dashGetColor(referIncrease, "value") + "%";
                            }
                        } else if (allStockUkMap[item.k].type == "self") {
                            this.selfStockTable.rows[allStockUkMap[item.k].order].cells[2].Text = nowPrice;
                            this.selfStockTable.rows[allStockUkMap[item.k].order].cells[5].Text = this.barginPriceUnit(item.v);
                            this.selfStockTable.rows[allStockUkMap[item.k].order].cells[6].Text = this.barginPriceUnit(item.u * 100);
                            this.selfStockTable.rows[allStockUkMap[item.k].order].cells[3].Text = this.dashGetColor(increase, "value");
                            this.selfStockTable.rows[allStockUkMap[item.k].order].cells[4].Text = this.dashGetColor(increasePer, "value") + "%";
                            this.selfStockTable.rows[allStockUkMap[item.k].order].cells[2].Color = this.dashGetColor(increase, "color");
                            this.selfStockTable.rows[allStockUkMap[item.k].order].cells[3].Color = this.dashGetColor(increase, "color");
                            this.selfStockTable.rows[allStockUkMap[item.k].order].cells[4].Color = this.dashGetColor(increasePer, "color");
                        } else if (allStockUkMap[item.k].type == "refer") {
                            this.refStock.price = nowPrice;
                            this.refStock.increase = increasePer;
                        }
                    })
                    // console.log(allStockUkMap)
                } else if (msg.content.head.dataType == 101002) {
                    let historyStockLineData = [];
                    if (partIndex == msg.content.head.partOrder) {
                        historyStockLineData = historyStockLineData.concat(msg.content.data);
                        partIndex++;
                    }
                    if (historyStockLineData.length != 0) {
                        this.hasHistoryMarket = true;
                    }
                    if (msg.content.head.totalParts + 1 == partIndex) {
                        let yData = [];
                        let yBarData = [];
                        if (historyStockLineData.length > 0) {
                            historyStockLineData.forEach((item, index, arr) => {
                                item.u = item.u * 100;
                                item.c = item.c / 10000;
                                yData.push(item.c);
                                yBarData.push(item.u);
                            })
                            let min = Math.min.apply(null, yData);
                            let max = Math.max.apply(null, yData);
                            let middle = Number(this.mainStock.preClose);
                            this.mainStock.open = yData[0];
                            this.mainStock.minPrice = min;
                            this.mainStock.maxPrice = max;
                            let barMax = Math.max.apply(null, yBarData);
                            this.selfStockMarketChange.yAxis[1].max = barMax;
                            this.selfStockMarketChange.yAxis[1].interval = this.selfStockMarketChange.yAxis[1].max / 2;
                            let barUnit;
                            let unitObj = { "10000": "万", "100000000": "亿" }
                            if (barMax >= 200000000) {
                                barUnit = 100000000;
                            } else if (barMax >= 20000) {
                                barUnit = 10000;
                            }
                            this.selfStockMarketChange.yAxis[1].axisLabel.formatter = function (value) {
                                return (value / barUnit).toFixed(0) + unitObj[barUnit];
                            }
                            historyStockLineData.forEach((item, index) => {
                                let time = this.dashGetTime(item.t / 1000);
                                this.preMarketTime = time;
                                this.nowTurnover = item.u;
                                this.historyMarketIndex = this.selfStockXdata.indexOf(time);//当前行情在echarts中的位置
                                this.selfStockMarketChange.series[0].data[this.historyMarketIndex] = item.c;
                                let barColor = "#e3b93b";
                                if (index > 0 && item.c > historyStockLineData[index - 1].c) {
                                    barColor = "rgb(234, 47, 47)";
                                } else if (index > 0 && item.c < historyStockLineData[index - 1].c) {
                                    barColor = "rgb(55, 177, 78)";
                                }
                                this.selfStockMarketChange.series[1].data[this.historyMarketIndex] = {
                                    value: item.u,
                                    itemStyle: {
                                        normal: {
                                            color: barColor
                                        }
                                    }
                                };
                            })
                            if (this.selfStockMarketChange.series[0].data[this.selfStockMarketChange.xAxis[0].data.length - 1]) {
                                this.mainStock.todayClose = this.selfStockMarketChange.series[0].data[this.selfStockMarketChange.xAxis[0].data.length - 1];
                            }
                            let abs = Math.abs(middle - min) >= Math.abs(middle - max) ? Math.ceil(Math.abs(middle - min)) : Math.ceil(Math.abs(middle - max));
                            this.selfStockMarketChange.yAxis[0].min = middle - abs;
                            this.selfStockMarketChange.yAxis[0].max = middle + abs;
                            this.selfStockMarketChange.yAxis[0].interval = abs / 2;
                            this.selfStockMarketChange.series[0].markLine.data[0].yAxis = this.mainStock.preClose;
                            if (this.selfStockMarketChart) {
                                this.selfStockMarketChart.setOption(this.selfStockMarketChange);
                            }
                        }
                    }
                }
            }
        })
    }
    registerListener() {
        this.selfStockMarket.content.onInit = (chart: ECharts) => {
            this.selfStockMarketChart = chart;
        }
        this.productNet.content.onInit = (chart: ECharts) => {
            this.productNetChart = chart;
        }
        this.productScale.content.onInit = (chart: ECharts) => {
            this.productScaleBar = chart;
        }
        this.allProductWeight.content.onInit = (chart: ECharts) => {
            this.allProductWeightGauge = chart;
        }
    }
    createSelfStockMarketChart() {
        return {
            option: {
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "cross",
                        animation: false,
                        label: {
                            backgroundColor: "#505765"
                        }
                    }
                },
                axisPointer: {
                    link: { xAxisIndex: "all" }
                },
                grid: [{
                    left: 50,
                    right: 20,
                    top: 10,
                    height: "50%"
                }, {
                    left: 50,
                    right: 20,
                    top: "55%",
                    bottom: 30,
                    height: "35%"
                }],
                xAxis: [{
                    type: "category",
                    data: [0],
                    show: false

                }, {
                    gridIndex: 1,
                    axisLine: {
                        lineStyle: { color: "#717171" }
                    },
                    type: "category",
                    data: [0],

                    axisLabel: {
                        interval: 29,
                        showMaxLable: true,
                        textStyle: { color: "#717171" }
                    }
                }],
                yAxis: [
                    {
                        axisPointer: {
                            label: {
                                precision: 2
                            }
                        },
                        type: "value",
                        axisLine: {
                            lineStyle: { color: "#717171" }
                        },
                        splitLine: {
                            lineStyle: {
                                type: "dashed",
                                color: "rgb(56, 63, 84)"
                            }
                        },
                        axisLabel: {
                            textStyle: { color: "#717171" },
                            formatter: function (value, index) {
                                return value.toFixed(0);
                            }
                        },
                        interval: 1,
                        min: 0,
                        max: 4,
                        axisTick: {
                            inside: true
                        }
                    }, {
                        gridIndex: 1,
                        axisPointer: {
                            label: {
                                precision: 2
                            }
                        },
                        type: "value",
                        axisLine: {
                            lineStyle: { color: "#717171" }
                        },
                        splitLine: {
                            lineStyle: {
                                type: "dashed",
                                color: "rgb(56, 63, 84)"
                            }
                        },
                        axisLabel: {
                            textStyle: { color: "#717171" },
                            showMinLabel: false,
                            formatter: function (price, index) {
                                return price.toFixed(0);
                            },
                            showMaxLabel: false
                        },
                        axisTick: {
                            inside: true
                        },
                        interval: 1,
                        min: 0,
                        max: 2
                    }
                ],
                series: [
                    {
                        name: "现价",
                        type: "line",
                        data: [0],
                        itemStyle: {
                            normal: {
                                color: "rgb(208, 208, 208)"
                            }
                        },
                        lineStyle: {
                            normal: {
                                width: 1
                            }
                        },
                        connectNulls: true,
                        markLine: {
                            data: [
                                {
                                    name: "昨收值",
                                    yAxis: 2
                                }
                            ],
                            symbol: "none",
                            label: {
                                normal: {
                                    show: false
                                }
                            },
                            lineStyle: {
                                normal: {
                                    color: "rgb(243, 194, 57)",
                                    width: 1
                                }
                            }
                        }
                    },
                    {
                        xAxisIndex: 1,
                        yAxisIndex: 1,
                        name: "成交金额",
                        type: "bar",
                        data: [{
                            value: 0,
                            itemStyle: {
                                normal: {
                                    color: "#e3b93b"
                                }
                            }
                        }]
                    }
                ]
            }
        }
    }
    createProductScale() {
        return {
            option: {
                tooltip: {
                    trigger: "axis",
                    axisPointer: { type: "shadow" },
                    formatter: function (series) {
                        let num = Math.pow(2, series[0].data).toFixed(3);;

                        var number = typeof (num) != "String" ? num.toString() : num;
                        var numArr = number.split(".");
                        var newstr = numArr[0].replace(/\d{1,3}(?=(\d{3})+$)/g, function (s) {
                            return s + ","
                        })
                        if (numArr.length == 2) {
                            newstr = newstr + "." + numArr[1];
                        }
                        return "总资产：<br/>" + newstr;
                    }
                },
                grid: {
                    containLabel: true,
                    top: 10,
                    left: 20,
                    bottom: 10,
                    right: 100
                },
                yAxis: {
                    axisLabel: {
                        show: true,
                        textStyle: { color: "#717171" }
                    },
                    axisLine: {
                        show: false
                    },
                    type: "category",
                    data: [0],
                    inverse: true,
                    axisTick: {
                        show: false
                    }
                },
                xAxis: {
                    show: false
                },
                series: [
                    {
                        name: "总资产",
                        type: "bar",
                        label: {
                            normal: {
                                show: true,
                                position: "right",
                                color: "#fff",
                                formatter: function (series) {
                                    let num = Math.pow(2, series.value).toFixed(3);

                                    var number = typeof (num) != "String" ? num.toString() : num;
                                    var numArr = number.split(".");
                                    var newstr = numArr[0].replace(/\d{1,3}(?=(\d{3})+$)/g, function (s) {
                                        return s + ","
                                    })
                                    if (numArr.length == 2) {
                                        newstr = newstr + "." + numArr[1];
                                    }
                                    return newstr;
                                }
                            }
                        },
                        itemStyle: {
                            normal: {
                                color: "#83bff6"
                            },
                            // emphasis: {
                            //     color: "#2378f7"
                            // }
                        },
                        barWidth: 15,
                        data: [0]
                    }
                ]
            }
        }
    }
    createAllProductWeight() {
        return {
            option: {
                tooltip: {
                    trigger: "axis",
                    axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                        type: "shadow"        // 默认为直线，可选为："line" | "shadow"
                    },
                    formatter: "{b}<br/> {a0}:{c0}%<br/>{a1}:{c1}%<br/>{a2}:{c2}%<br/>{a3}:{c3}%"
                },
                legend: {
                    data: ["股票市值", "期货保证金", "现金", "其他资产"],
                    textStyle: {
                        color: "#717171"
                    }
                },
                grid: {
                    containLabel: true,
                    top: 50,
                    right: 10,
                    left: 10,
                    bottom: 70
                },
                xAxis: [
                    {
                        axisLabel: {
                            show: true,
                            textStyle: { color: "#717171" },
                            interval: 0,
                            rotate: 50
                        },
                        axisLine: {
                            lineStyle: { color: "#717171" }
                        },
                        type: "category",
                        data: [0]
                    }
                ],
                yAxis: [
                    {
                        axisLabel: {
                            show: true,
                            textStyle: { color: "#717171" },
                            formatter: "{value}%"
                        },
                        axisLine: {
                            lineStyle: { color: "#717171" }
                        },
                        type: "value",
                        splitLine: {
                            lineStyle: {
                                type: "dashed",
                                color: "rgb(56, 63, 84)"
                            }
                        },
                        axisTick: {
                            inside: true
                        },
                        max: 100,
                        min: 0
                    }
                ],
                series: [
                    {
                        name: "股票市值",
                        type: "bar",
                        stack: "广告",
                        itemStyle: {
                            normal: {
                                color: "#64a0c9"
                            }
                        },
                        data: [0]
                    },
                    {
                        name: "期货保证金",
                        type: "bar",
                        stack: "广告",
                        itemStyle: {
                            normal: {
                                color: "#e3b93b"
                            }
                        },
                        data: [0]
                    },
                    {
                        name: "现金",
                        type: "bar",
                        stack: "广告",
                        itemStyle: {
                            normal: {
                                color: "#db6a41"
                            }
                        },
                        barWidth: 15,
                        data: [0]
                    },
                    {
                        name: "其他资产",
                        type: "bar",
                        itemStyle: {
                            normal: {
                                color: "#22a96f"
                            }
                        },
                        stack: "广告",
                        data: [0]
                    }
                ]
            }
        }
    }
    createProductNetChart() {
        return {
            option: {
                title: {
                    text: "",
                    x: "center",
                    align: "right",
                    textStyle: {
                        color: "#717171"
                    }
                },
                grid: {
                    bottom: 20
                },
                tooltip: {
                    trigger: "axis"
                },
                dataZoom: {
                    type: "inside"
                },
                xAxis: [
                    {
                        axisLabel: {
                            show: true,
                            textStyle: { color: "#717171" }
                        },
                        axisLine: {
                            lineStyle: { color: "#717171" }
                        },
                        data: [0]
                    }
                ],
                yAxis: [
                    {
                        axisLabel: {
                            show: true,
                            textStyle: { color: "#717171" }
                        },
                        axisLine: {
                            lineStyle: { color: "#717171" }
                        },
                        splitLine: {
                            show: false
                        },
                        name: "净值",
                        type: "value",
                        nameLocation: "end"
                    }
                ],
                series: [
                    {
                        name: "净值",
                        type: "line",
                        data: [0],
                        itemStyle: {
                            normal: {
                                color: "#2378f7"
                            }
                        },
                        areaStyle: {
                            normal: {
                                color: "#83bff6"
                            }
                        }
                    }
                ]
            }
        }
    }

    ngOnDestroy() {
        clearTimeout(this.timeoutId);
        //防止订阅的行情在其他页面的时候回来，离开页面的时候取消订阅，销毁图表。回来时判断
        this.quote.send(17, 101, { topic: 3112, kwlist: [] });
        if (this.productNetChart) {
            this.productNetChart.dispose();
            this.productNetChart = null;
        }
        if (this.allProductWeightGauge) {
            this.allProductWeightGauge.dispose();
            this.allProductWeightGauge = null;
        }
        if (this.productScaleBar) {
            this.productScaleBar.dispose();
            this.productScaleBar = null;
        }
        if (this.selfStockMarketChart) {
            this.selfStockMarketChart.dispose();
            this.selfStockMarketChart = null;
        }
        this.config.on("toggle-view", null);
    }
}


