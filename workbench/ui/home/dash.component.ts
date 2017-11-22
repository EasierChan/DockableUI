"use strict";

import { Component, OnInit, OnDestroy } from "@angular/core";
import { TradeService, QuoteService } from "../../bll/services";
import { DataTable, DataTableColumn, DataTableRow, ChartViewer, Section, ListItem } from "../../../base/controls/control";
import { SecuMasterService, AppStoreService } from "../../../base/api/services/backend.service";
import { ConfigurationBLL } from "../../bll/strategy.server";
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

    selfStockPrice: Section;
    selfStockPriceLine: ECharts;
    selfStockMoney: Section;
    selfStockMoneyBar: ECharts;


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
    productData: any[];
    monitorProductsData: any[];
    nowMonitorProductsData: any[];
    productNetData: any[];
    todoListData: any[];
    addTodoContent: string = '';
    alarmTableData: any[] = [];
    selfStockData: any[] = [];

    todoRowIndex: number;
    ukCodeList: any[] = [2490887, 1441857];
    productDataSort: any[] = [];
    nowDate: any;
    nowProductCaid: string = '';
    nowProductIndex: number;
    nowOperateStat: number;
    nowOperateId: number;
    preTurnOver: number = 0;//
    preMarketTime: string = ''
    nowTurnover: number = 0;

    currentMarketData: any = {};
    bestStockUktoIndex: any = {};
    worstStockUktoIndex: any = {};

    refStockIncrease: number = 0;
    selfStockXdata: any[] = [];
    selfStockLineData: any[] = [];
    selfStockBarData: any[] = [];

    selfStockLineyAxisMin: number = 0;
    selfStockLineyAxisMax: number = 0;


    //千分符
    toThousands(num) {
        var number = typeof (num) != 'String' ? num.toString() : num;

        var numArr = number.split('.');
        var newstr = numArr[0].replace(/\d{1,3}(?=(\d{3})+$)/g, function(s) {
            return s + ','
        })
        if (numArr.length == 2) {
            newstr = newstr + '.' + numArr[1];
        }
        return newstr;
    }

    constructor(private tradePoint: TradeService, private quote: QuoteService, private config: ConfigurationBLL,
        private secuinfo: SecuMasterService, private appsvr: AppStoreService) {

    }

    addTodoEvent() {
        this.tradePoint.send(260, 251, { head: { realActor: "createTodo" }, body: { content: this.addTodoContent, stat: '0' } });
    }

    getNowProductDataBefore() {

        this.nowProductIndex = this.nowProductIndex + this.productData.length - 1;
        this.nowProductIndex = this.nowProductIndex % this.productData.length;
        this.nowProductCaid = this.productData[this.nowProductIndex].caid;
        this.tradePoint.send(260, 251, { head: { realActor: "getMonitorProducts" }, body: { caid: this.nowProductCaid } });
        this.tradePoint.send(260, 251, { head: { realActor: "getProductNet" }, body: { caid: this.nowProductCaid } });
    }

    getNowProductDataNext() {

        this.nowProductIndex++;
        this.nowProductIndex = this.nowProductIndex % this.productData.length;
        this.nowProductCaid = this.productData[this.nowProductIndex].caid;
        this.tradePoint.send(260, 251, { head: { realActor: "getMonitorProducts" }, body: { caid: this.nowProductCaid } });
        this.tradePoint.send(260, 251, { head: { realActor: "getProductNet" }, body: { caid: this.nowProductCaid } });
    }

    compare(property) {
        return function(a, b) {
            return b[property] - a[property];
        }
    }

    myGetTime(tm) {
        let myDate = new Date(tm * 1000);
        let h = (myDate.getHours() < 10) ? ('0' + myDate.getHours()) : myDate.getHours();
        let m = (myDate.getMinutes() < 10) ? ('0' + myDate.getMinutes()) : myDate.getMinutes();
        return h + ':' + m;
    }

    ngOnInit() {
        for (var i = 9; i <= 14; i++) {
            if (i != 12) {
                for (var j = 0; j < 60; j++) {
                    if (i == 11 && j >= 30) {
                    } else if (i == 9 && j < 30) {
                    } else {
                        let time = (i < 10 ? '0' + i : i) + ':' + (j < 10 ? '0' + j : j);
                        this.selfStockXdata.push(time);
                    }
                }
            }
        }
        this.selfStockXdata.push('15:00');

        this.selfStockLineData.length = this.selfStockXdata.length;
        this.selfStockBarData.length = this.selfStockXdata.length;


        let d = new Date();
        this.nowDate = d.getFullYear() + '-' + (Number(d.getMonth()) + 1) + '-' + d.getDate();
        this.selfStockData = ['', '', '', '', '']

        console.log(this.secuinfo.getSecuinfoByUKey(2490887, 1115753));
        this.bestStockList = new DataTable("table2");
        this.worstStockList = new DataTable("table2");
        this.worstStockList.align = 'right';
        this.bestStockList.align = 'right';
        this.selfStockTable = new DataTable("table2");
        this.selfStockTable.addColumn('代码', '名称', '现价', '涨跌', '涨跌幅', '成交量', '成交金额');

        this.selfStockData.forEach(item => {
            let row = this.selfStockTable.newRow();
            row.cells[0].Text = 'item.appname';
            row.cells[1].Text = 'item.content';
            row.cells[2].Text = 'alarmlvObj[item.alarmlv]';
        })
        this.todoList = new DataTable("table2");
        this.todoList.RowIndex = false; // 去除序列
        this.todoList.addColumn("是否完成", "消息", "创建时间", "操作");
        this.todoList.ColumnHeader = false;
        this.todoList.columns[0].maxWidth = 20;
        this.todoList.columns[3].maxWidth = 50;

        //复选框单击事件，颜色变化和请求的发送
        this.todoList.onCellClick = (cellItem, cellIndex, rowIndex) => {
            console.log(cellIndex)
            console.log(cellItem)
            this.todoRowIndex = rowIndex;
            this.nowOperateId = cellItem.Data;
            this.nowOperateStat = cellItem.dataSource.text == true ? 1 : 0;
            if (cellIndex == 0) {
                this.tradePoint.send(260, 251, {
                    head: { realActor: "editTodo" }, body: {
                        id: this.nowOperateId,
                        stat: this.nowOperateStat,
                        content: this.todoList.rows[rowIndex].cells[1].Text,
                        createtime: this.todoList.rows[rowIndex].cells[2].Text
                    }
                });
            }

        }


        this.alarmTable = new DataTable("table2");
        this.alarmTable.RowIndex = false; // 去除序列
        this.alarmTable.addColumn("来源", "内容", "严重程度", "状态", "时间");

        // this.alarmTable.ColumnHeader = false;


        this.selfStockPrice = new Section();
        this.selfStockPrice.content = this.createSelfStockPriceChart();


        this.selfStockMoney = new Section();
        this.selfStockMoney.content = this.createSelfStockPriceChart();

        this.productNet = new Section();
        this.productNet.content = this.createProductNetChart();



        this.allProductWeight = new Section();
        this.allProductWeight.content = this.createAllProductWeight();

        this.productScale = new Section();
        this.productScale.content = this.createProductScale();


        this.registerListener();

        //require data
        this.quote.send(181, 10001, { requestId: 1, ukeyCode: 1441857, dateFrom: 20171102, dateTo: 20171102, timeTo: 113000000, timeFrom: 93000000 });
        this.quote.addSlot({
            appid: 181,
            packid: 10002,
            callback: (msg) => {
                console.log(msg)
            }
        })

        this.quote.addSlot({
            appid: 17,
            packid: 110,
            callback: (msg) => {
                let stockIncrease = msg.content.last > msg.content.pre_close ? '+' + Math.round(1000 * (msg.content.last - msg.content.pre_close) / msg.content.pre_close) / 100 : Math.round(1000 * (msg.content.last - msg.content.pre_close) / msg.content.pre_close) / 100;
                this.currentMarketData[msg.content.ukey] = { 'stockPrice': msg.content.last, 'stockIncrease': stockIncrease };
                // console.log(msg.content);
                // 1441857
                if (msg.content.ukey == 1441857) {
                    this.refStockIncrease = Number(stockIncrease);

                    let selfStockLineChange = {
                        grid: {
                            bottom: 10,
                            top: 30
                        },
                        xAxis: {
                            show: false
                        },
                        yAxis: {
                            min: 0,
                            max: 100
                        },
                        series: [
                            {
                                data: this.selfStockLineData
                            }
                        ]
                    }
                    let selfStockBarChange = {
                        grid: {
                            bottom: 30,
                            top: 0
                        },
                        series: [
                            {
                                name: '成交量',
                                type: 'bar',
                                data: this.selfStockBarData
                            }
                        ]
                    }


                    let marketTime = this.myGetTime(msg.content.time);

                    let marketIndex = this.selfStockXdata.indexOf(marketTime);
                    let turnover = msg.content.turnover;

                    if (this.preMarketTime != marketTime) {
                        this.nowTurnover = 0;
                        let lastPrice = Number((msg.content.last / 10000).toFixed(2));
                        selfStockLineChange.series[0].data[marketIndex] = lastPrice;
                        if (this.selfStockLineyAxisMin > lastPrice) {
                            this.selfStockLineyAxisMin = lastPrice;
                        }
                        if (this.selfStockLineyAxisMax < lastPrice) {
                            this.selfStockLineyAxisMax = lastPrice;
                        }

                        if (this.selfStockLineyAxisMin == 0 && this.selfStockLineyAxisMax != 0) {
                            this.selfStockLineyAxisMin = this.selfStockLineyAxisMax;
                        }


                        let middle = Math.round(msg.content.pre_close / 100) / 100;

                        let abs = Math.abs(middle - this.selfStockLineyAxisMin) >= Math.abs(middle - this.selfStockLineyAxisMax) ? Math.abs(middle - this.selfStockLineyAxisMin) : Math.abs(middle - this.selfStockLineyAxisMax);
                        selfStockLineChange.yAxis.min = middle - abs;
                        selfStockLineChange.yAxis.max = middle + abs;



                        this.selfStockPriceLine.setOption(selfStockLineChange);
                        console.log(marketIndex)
                        console.log('现价' + lastPrice)
                    }
                    if (this.preTurnOver != 0) {
                        let nowMarketVolume = turnover - this.preTurnOver + this.nowTurnover;
                        this.nowTurnover = nowMarketVolume;
                    }

                    this.preTurnOver = turnover;
                    this.preMarketTime = marketTime;
                    selfStockBarChange.series[0].data[marketIndex] = this.nowTurnover / 10000;
                    this.selfStockMoneyBar.setOption(selfStockBarChange);
                    console.log('现金额' + this.nowTurnover);

                }
                //超额涨幅
                let overStockIncrease = Math.round(100 * (Number(this.currentMarketData[msg.content.ukey].stockIncrease) - this.refStockIncrease)) / 100;

                if (this.bestStockUktoIndex[msg.content.ukey] != undefined) {
                    this.bestStockList.rows[this.bestStockUktoIndex[msg.content.ukey]].cells[1].Text = (this.currentMarketData[msg.content.ukey].stockPrice / 10000).toFixed(2);
                    this.bestStockList.rows[this.bestStockUktoIndex[msg.content.ukey]].cells[2].Text = this.currentMarketData[msg.content.ukey].stockIncrease + '%';
                    if (Number(this.currentMarketData[msg.content.ukey].stockIncrease) > 0) {
                        this.bestStockList.rows[this.bestStockUktoIndex[msg.content.ukey]].cells[2].Color = 'rgb(234, 47, 47)';
                    } else if (Number(this.currentMarketData[msg.content.ukey].stockIncrease) < 0) {
                        this.bestStockList.rows[this.bestStockUktoIndex[msg.content.ukey]].cells[2].Color = 'rgb(55, 177, 78)';
                    }

                    if (overStockIncrease > 0) {
                        this.bestStockList.rows[this.bestStockUktoIndex[msg.content.ukey]].cells[3].Text = '+' + overStockIncrease + '%';
                        this.bestStockList.rows[this.bestStockUktoIndex[msg.content.ukey]].cells[3].Color = 'rgb(234, 47, 47)';
                    } else if (overStockIncrease < 0) {
                        this.bestStockList.rows[this.bestStockUktoIndex[msg.content.ukey]].cells[3].Text = overStockIncrease + '%';
                        this.bestStockList.rows[this.bestStockUktoIndex[msg.content.ukey]].cells[3].Color = 'rgb(55, 177, 78)';
                    }

                }
                if (this.worstStockUktoIndex[msg.content.ukey] != undefined) {
                    this.worstStockList.rows[this.worstStockUktoIndex[msg.content.ukey]].cells[1].Text = (this.currentMarketData[msg.content.ukey].stockPrice / 10000).toFixed(2);
                    this.worstStockList.rows[this.worstStockUktoIndex[msg.content.ukey]].cells[2].Text = this.currentMarketData[msg.content.ukey].stockIncrease + "%";
                    if (Number(this.currentMarketData[msg.content.ukey].stockIncrease) > 0) {
                        this.worstStockList.rows[this.worstStockUktoIndex[msg.content.ukey]].cells[2].Color = 'rgb(234, 47, 47)';
                    } else if (Number(this.currentMarketData[msg.content.ukey].stockIncrease) < 0) {
                        this.worstStockList.rows[this.worstStockUktoIndex[msg.content.ukey]].cells[2].Color = 'rgb(55, 177, 78)';
                    }
                    if (overStockIncrease > 0) {
                        this.worstStockList.rows[this.worstStockUktoIndex[msg.content.ukey]].cells[3].Text = '+' + overStockIncrease + '%';
                        this.worstStockList.rows[this.worstStockUktoIndex[msg.content.ukey]].cells[3].Color = 'rgb(234, 47, 47)';
                    } else if (overStockIncrease < 0) {
                        this.worstStockList.rows[this.worstStockUktoIndex[msg.content.ukey]].cells[3].Text = overStockIncrease + '%';
                        this.worstStockList.rows[this.worstStockUktoIndex[msg.content.ukey]].cells[3].Color = 'rgb(55, 177, 78)';
                    }
                }
            }
        });

        //预警接口
        this.config.on("getAlarmMessageAns", (data) => {
            console.log('getAlarmMessageAns--------------');
            let alarmlvObj = { '0': '不重要', '1': '一般', '2': '危险', '3': '紧急' };
            let statObj = { '0': '未处理', '1': '处理中' };
            this.alarmTableData = data.body;
            console.log(this.alarmTableData)


            this.alarmTableData.forEach(item => {
                if (item.stat == '0' || item.stat == '1') {
                    let alarmtime = item.alarmtime.substring(0, 10);
                    let row = this.alarmTable.newRow();
                    row.cells[0].Text = item.appname;
                    row.cells[1].Text = item.content;
                    row.cells[2].Text = alarmlvObj[item.alarmlv];

                    row.cells[3].Text = statObj[item.stat];
                    console.log(new Date(this.nowDate));
                    console.log(alarmtime);

                    if (this.nowDate == alarmtime) {
                        row.cells[4].Text = item.alarmtime.substring(10);
                    } else {
                        row.cells[4].Text = alarmtime;
                    }
                }

            })
        });

        //产品信息
        this.config.on("getProductAns", (data) => {
            let productScaleChangeOpt = {
                yAxis: { data: [] },
                series: [{ data: [] }]
            }

            this.productData = data.body;
            this.nowProductIndex = this.productData.length;
            this.productDataSort = this.productData.sort(this.compare('totalint'));
            this.productDataSort.forEach(item => {
                productScaleChangeOpt.yAxis.data.push(item.caname);

                productScaleChangeOpt.series[0].data.push(Math.log(item.totalint < 1 ? 1 : item.totalint) / Math.log(2));
            })
            console.log('getProductAns');
            console.log(this.productData)
            this.productScaleBar.setOption(productScaleChangeOpt);
            this.nowProductCaid = this.productData[0].caid;
            this.productNetData = [];
            // this.tradePoint.send(260, 251, { head: { realActor: "getMonitorProducts" }, body: { caid: this.nowProductCaid } });
            this.tradePoint.send(260, 251, { head: { realActor: "getMonitorProducts" }, body: {} });
            this.tradePoint.send(260, 251, { head: { realActor: "getProductNet" }, body: { caid: this.nowProductCaid } });

        })

        //产品净值
        this.config.on("getProductNetAns", (data) => {
            let productNetChangeOpt = {
                title: { text: '' },
                xAxis: [{ data: [] }],
                series: [{ data: [] }]
            }
            this.productNetData = data.body;
            this.productNetData.forEach(item => {
                productNetChangeOpt.xAxis[0].data.push(item.trday);
                productNetChangeOpt.title.text = item.caname;
                productNetChangeOpt.series[0].data.push(item.netvalue);
            })
            this.productNetChart.setOption(productNetChangeOpt);
        })

        //getMonitorProductsAns
        this.config.on("getMonitorProductsAns", (data) => {

            this.monitorProductsData = data.body;

            this.nowMonitorProductsData = this.monitorProductsData.filter(item => {
                return item.caid == this.nowProductCaid;
            })

            console.log(this.nowMonitorProductsData)

            //期货权益
            this.futuresProfit = Number(this.nowMonitorProductsData[0].futures_validamt) + Number(this.nowMonitorProductsData[0].futures_value);
            //风险度
            this.riskDegree = (this.futuresProfit == 0) ? 0 : Number(Math.round(10000 * (Number(this.nowMonitorProductsData[0].totalmargin) / this.futuresProfit)) / 100)
            //当日盈亏
            //  this.totalProfitAndLoss = this.toThousands(88888888);
            this.totalProfitAndLoss = this.toThousands((Number(this.nowMonitorProductsData[0].hold_closepl) + Number(this.nowMonitorProductsData[0].hold_posipl)) / 1000);
            //浮动盈亏 
            this.floatProfitAndLoss = this.toThousands(this.nowMonitorProductsData[0].hold_posipl / 1000);
            //  this.floatProfitAndLoss = this.toThousands(9999999999);
            //敞口率
            this.riskExposure = (Number(this.nowMonitorProductsData[0].totalint) == 0) ? 0 : Math.round(10000 * Number(Number(this.nowMonitorProductsData[0].risk_exposure) / Number(this.nowMonitorProductsData[0].totalint))) / 100;

            let allProWeightGaugeChangeOpt = {
                xAxis: [{ data: [] }],
                series: [{ data: [] }, { data: [] }, { data: [] }, { data: [] }]
            }
            //产品资产比重改变值
            if (this.monitorProductsData.length > 1) {
                this.monitorProductsData.forEach(item => {
                    allProWeightGaugeChangeOpt.xAxis[0].data.push(item.caname);
                    let money = Number(item.stock_validamt) + Number(item.futures_validamt) + Number(item.futures_value) - Number(item.totalmargin);
                    let totalMoney = money + Number(item.stock_validamt) + Number(item.totalmargin) + Number(item.subject_amount);
                    //股票可用资金
                    allProWeightGaugeChangeOpt.series[0].data.push(Math.round(10000 * Number(item.stock_validamt) / totalMoney) / 100);
                    //期货保证金
                    allProWeightGaugeChangeOpt.series[1].data.push(Math.round(10000 * Number(item.totalmargin) / totalMoney) / 100);
                    //现金
                    allProWeightGaugeChangeOpt.series[2].data.push(Math.round(10000 * money / totalMoney) / 100);
                    //其他资产
                    allProWeightGaugeChangeOpt.series[3].data.push(Math.round(10000 * Number(item.subject_amount) / totalMoney) / 100);
                })
                this.allProductWeightGauge.setOption(allProWeightGaugeChangeOpt);
            }
        })

        //最好的30股票

        this.config.on('getBestStocksAns', data => {
            this.aiStockDate.bestStockListData = data.body;
            this.bestStockList.RowIndex = false; // 去除序列
            this.bestStockList.addColumn("股票代码", "价格", "涨幅", "超额收益");
            this.bestStockList.columns[0].maxWidth = 80;

            this.bestStockList.backgroundColor = '#fff'
            // this.bestStockList.columns[1].hidden = true;
            this.aiStockDate.bestStockListData.forEach((item, index) => {
                this.ukCodeList.push(Number(item.ukcode));
                let row = this.bestStockList.newRow();
                this.bestStockUktoIndex[item.ukcode] = index;

                row.cells[0].Text = item.windcode;
                row.cells[0].Color = "rgb(234, 47, 47)";
                row.cells[1].Text = '--';
                row.cells[2].Text = '--';
                row.cells[3].Text = '--';

            })
            console.log(this.ukCodeList)
            console.log(this.bestStockUktoIndex)
            this.quote.send(17, 101, { topic: 3112, kwlist: this.ukCodeList });
        })

        //最差的30股
        this.config.on('getWorstStocksAns', data => {
            this.aiStockDate.worstStockListData = data.body;
            console.log('===================')
            console.log(this.aiStockDate.worstStockListData)
            this.worstStockList.RowIndex = false; // 去除序列
            this.worstStockList.addColumn("股票代码", "价格", "涨幅", "超额收益");
            this.worstStockList.columns[0].maxWidth = 80;
            this.aiStockDate.worstStockListData.forEach((item, index) => {
                this.ukCodeList.push(Number(item.ukcode));
                let row = this.worstStockList.newRow();
                this.worstStockUktoIndex[item.ukcode] = index;

                row.cells[0].Text = item.windcode;
                row.cells[0].Color = "rgb(55, 177, 78)";
                row.cells[1].Text = '--';
                row.cells[2].Text = '--';
                row.cells[3].Text = '--';
            })

            this.quote.send(17, 101, { topic: 3112, kwlist: this.ukCodeList });
        })

        //todo列表
        this.config.on('getTodoListAns', data => {
            console.log('todolist ------------- ')
            console.log(data)
            this.todoListData = data.body;
            this.todoList.rows.length = 0;

            this.todoListData.forEach((item, itemIndex) => {
                let row = this.todoList.newRow();
                let todoTime = new Date(item.createtime.substring(0, 10));
                if (item.stat == '1') {
                    row.cells[1].Color = 'rgb(93, 83, 84)';
                    row.cells[2].Color = 'rgb(93, 83, 84)';
                } else if (new Date(this.nowDate) > todoTime) {
                    row.cells[1].Color = 'rgb(234, 47, 47)';
                    row.cells[2].Color = 'rgb(234, 47, 47)';
                }

                row.cells[0].Type = "checkbox";
                row.cells[0].Text = item.stat;
                row.cells[0].Data = item.id;
                row.cells[0].Text = (item.stat == '1') ? true : false;

                row.cells[1].Text = item.content;
                row.cells[1].Type == "plaintext"
                row.cells[2].Text = item.createtime.substring(0, 10);
                row.cells[3].Type = "button-group";
                row.cells[3].Text = ["remove", "edit"];


                row.cells[3].OnClick = (index) => {
                    this.todoRowIndex = itemIndex;
                    this.nowOperateId = item.id
                    this.nowOperateStat = item.stat;

                    console.info(index);
                    if (row.cells[1].Type == "textbox") {
                        if (index == 0) {//确认编辑
                            console.log('sure');
                            this.tradePoint.send(260, 251, {
                                head: { realActor: "editTodo" }, body: {
                                    id: this.nowOperateId,
                                    stat: this.nowOperateStat,
                                    content: row.cells[1].Text,
                                    createtime: row.cells[2].Text
                                }
                            });
                        } else if (index == 1) {//取消编辑
                            console.log('cancel');
                            row.cells[1].Text = item.content;
                            row.cells[2].Text = item.createtime.substring(0, 10);
                            row.cells[3].Text = ["remove", "edit"];
                            row.cells[1].Type = "plaintext";
                            row.cells[2].Type = "plaintext";
                        }

                    } else if (row.cells[1].Type == "plaintext") {
                        if (index == 0) {//删除操作
                            console.log('delete');
                            this.tradePoint.send(260, 251, { head: { realActor: "deleteTodo" }, body: { id: this.nowOperateId } });
                        } else if (index == 1) {
                            console.log('edit');
                            row.cells[1].Type = "textbox";
                            row.cells[2].Type = "date";
                            row.cells[3].Text = ["ok-circle", "remove-circle"];
                        }
                    }
                };
            })

            this.addTodoContent = '';
        })

        //addTodo
        this.config.on('createTodoAns', data => {
            if (data.msret.msgcode == '00') {
                this.tradePoint.send(260, 251, { head: { realActor: "getTodoList" }, body: {} });
            }
        })

        //editTodo
        this.config.on('editTodoAns', data => {
            console.log(data)
            if (data.msret.msgcode == '00') {
                this.todoList.rows[this.todoRowIndex].cells[3].Text = ["remove", "edit"];
                this.todoList.rows[this.todoRowIndex].cells[1].Type = "plaintext";
                this.todoList.rows[this.todoRowIndex].cells[2].Type = "plaintext";
                if (this.nowOperateStat == 1) {//已完成
                    this.todoList.rows[this.todoRowIndex].cells[1].Color = 'rgb(93, 83, 84)';
                    this.todoList.rows[this.todoRowIndex].cells[2].Color = 'rgb(93, 83, 84)';
                } else if (this.nowOperateStat == 0 && new Date(this.nowDate) > new Date(this.todoList.rows[this.todoRowIndex].cells[2].Text)) {//未完成已过期
                    this.todoList.rows[this.todoRowIndex].cells[1].Color = 'rgb(234, 47, 47)';
                    this.todoList.rows[this.todoRowIndex].cells[2].Color = 'rgb(234, 47, 47)';
                } else {
                    this.todoList.rows[this.todoRowIndex].cells[1].Color = 'rgb(208, 208, 208)';
                    this.todoList.rows[this.todoRowIndex].cells[2].Color = 'rgb(208, 208, 208)';
                }
            }
        })

        //deleteTodo
        this.config.on('deleteTodoAns', data => {
            if (data.msret.msgcode == '00') {
                // this.todoList.rows.splice(this.todoRowIndex, 1);
                this.tradePoint.send(260, 251, { head: { realActor: "getTodoList" }, body: {} });
            }
        })

        this.tradePoint.send(260, 251, { head: { realActor: "getAlarmMessage" }, body: {} });
        // console.log('!!!!!!!!!!!!!!!')
        // setTimeout(() => {
        //     console.log(this.config.getProducts())
        // }, 1000);
        this.tradePoint.send(260, 251, { head: { realActor: "getProduct" }, body: {} });
        // //AI看盘数据
        this.tradePoint.send(260, 251, { head: { realActor: "getWorstStocks" }, body: {} });
        this.tradePoint.send(260, 251, { head: { realActor: "getBestStocks" }, body: {} });
        // //获取todo列表
        this.tradePoint.send(260, 251, { head: { realActor: "getTodoList" }, body: {} });



    }

    registerListener() {

        this.selfStockPrice.content.onInit = (chart: ECharts) => {
            this.selfStockPriceLine = chart;
        }

        this.selfStockMoney.content.onInit = (chart: ECharts) => {
            this.selfStockMoneyBar = chart;
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

    //         console.log(xData)
    // console.log(objArr)
    // myChart.setOption(option)
    // myChart2.setOption(option)
    // var data = [], data1 = [];
    // for (var i = 0; i < xData.length; i++) {
    //     data.push(Math.random() * 10);
    // }
    // for (var i = 0; i < xData.length; i++) {
    //     data1.push(Math.random());
    // }
    // console.log(data)


    createSelfStockPriceChart() {
        return {
            option: {
                grid: {
                    left: 60,
                    right: 10,
                    top: 0,
                    bottom: 0
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        animation: false,
                        label: {
                            backgroundColor: '#505765'
                        }
                    }
                },
                xAxis: {

                    axisLine: {
                        lineStyle: { color: "#717171" }
                    },
                    type: 'category',
                    data: this.selfStockXdata,
                    axisLabel: {
                        interval: 29,
                        showMaxLable: true,
                        textStyle: { color: "#717171" }
                    }
                },
                yAxis:
                {
                    type: 'value',
                    axisLine: {
                        lineStyle: { color: "#717171" }
                    },
                    splitLine: {
                        lineStyle: {
                            type: 'dashed',
                            color: 'rgb(56, 63, 84)'
                        }
                    },
                    axisLabel: {
                        textStyle: { color: "#717171" }
                    }
                }
                ,
                series: [
                    {
                        name: '现价',
                        type: 'line',
                        data: [0],
                        itemStyle: {
                            normal: {
                                color: '#fff'
                            }
                        }
                    }
                ]
            }

        }
    }

    createProductScale() {
        return {
            option: {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' },
                    formatter: function(series) {
                        let data = series[0].data;
                        return '总资产：<br/>' + Math.round(Math.pow(2, data)).toString().replace(/\d{1,3}(?=(\d{3})+$)/g, function(s) {
                            return s + ','
                        })
                    }

                },

                grid: {
                    containLabel: true,
                    top: 10,
                    //height: 300,
                    left: 20,
                    bottom: 10
                },
                yAxis:
                {
                    axisLabel: {
                        show: true,
                        textStyle: { color: "#717171" }
                    },
                    axisLine: {
                        show: false
                    },

                    type: 'category',
                    //show:false,
                    data: [0],
                    inverse: true,
                    axisTick: {
                        show: false
                    }
                }
                ,
                xAxis: {
                    show: false
                },
                series: [
                    {
                        name: '总资产',
                        type: 'bar',
                        itemStyle: {
                            normal: {
                                color: '#83bff6'
                            },
                            emphasis: {
                                color: '#2378f7'
                            }

                        },
                        stack: '广告',
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
                    trigger: 'axis',
                    axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                        type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                    },
                    formatter: "{b}<br/> {a0}:{c0}%<br/>{a1}:{c1}%<br/>{a2}:{c2}%<br/>{a3}:{c3}%"
                },
                legend: {
                    data: ['股票可用资金', '期货保证金', '现金', '其他资产'],
                    textStyle: {
                        color: '#717171'
                    }
                },
                grid: {
                    containLabel: true,
                    top: 50,
                    right: 10,
                    // height: 200,
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
                        type: 'category',
                        data: [0]
                    }
                ],
                yAxis: [
                    {
                        axisLabel: {
                            show: true,
                            textStyle: { color: "#717171" },
                            formatter: '{value}%'
                        },
                        axisLine: {
                            lineStyle: { color: "#717171" }
                        },
                        type: 'value',
                        splitLine: {
                            lineStyle: {
                                type: 'dashed',
                                color: 'rgb(56, 63, 84)'
                            }
                        }
                    }
                ],

                series: [

                    {
                        name: '股票可用资金',
                        type: 'bar',
                        stack: '广告',
                        data: [0]
                    },
                    {
                        name: '期货保证金',
                        type: 'bar',
                        stack: '广告',
                        data: [0]
                    },
                    {
                        name: '现金',
                        type: 'bar',
                        stack: '广告',
                        barWidth: 15,
                        data: [0]
                    },
                    {
                        name: '其他资产',
                        type: 'bar',
                        stack: '广告',
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
                    text: '',
                    x: 'center',
                    align: 'right',
                    textStyle: {
                        color: '#717171'
                    }
                },
                grid: {
                    bottom: 20
                },

                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: ['净值'],
                    right: 0,
                    textStyle: {
                        color: '#717171'
                    }
                },
                dataZoom: {
                    type: 'inside'
                    // start: 65,
                    // end: 85
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
                            // lineStyle: {
                            //     type: 'dashed',
                            //     color: '#ff5564'
                            // }
                        },
                        name: '净值',
                        type: 'value',
                        nameLocation: 'end'
                    }
                ],
                series: [
                    {
                        name: '净值',
                        type: 'line',
                        data: [0],
                        itemStyle: {
                            normal: {
                                color: '#2378f7'
                            }
                        },
                        areaStyle: {
                            normal: {
                                color: '#83bff6'
                            }
                        }
                    }
                ]
            }

        }
    }




    ngOnDestroy() {

    }
}


