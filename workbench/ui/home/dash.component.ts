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
    ukCodeList: any[] = [];
    productDataSort: any[] = []
    nowDate: any;
    nowProductCaid: string = '';
    nowProductIndex: number;
    nowOperateStat: number;
    nowOperateId: number;
    preTurnOver: number = 0;//上一时刻的成交金额
    preMarketTime: string = ''//上一时刻的时间
    nowTurnover: number = 0;//上一时刻的成交金额
    mainStockPreclose: number = 0;//主要指数的昨收


    bestStockUktoIndex: any = {};
    worstStockUktoIndex: any = {};

    refStockIncrease: number = 0;
    selfStockXdata: any[] = [];


    selfStockUkList: number[] = [];
    dashAllUkcodeList: number[] = [];

    mainStockUk: number;
    preMainStockUk: number;
    maid: number;//
    userId: number;//



    //千分符
    toThousands(num) {
        var number = typeof (num) != 'String' ? num.toString() : num;
        var numArr = number.split('.');
        var newstr = numArr[0].replace(/\d{1,3}(?=(\d{3})+$)/g, function (s) {
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
        this.tradePoint.send(260, 251, { head: { realActor: "createTodo" }, body: { content: this.addTodoContent, stat: '0', maid: this.maid, oid: this.userId } });
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
        return function (a, b) {
            return b[property] - a[property];
        }
    }

    myGetTime(tm) {
        let myDate = new Date(tm * 1000);
        let h = (myDate.getHours() < 10) ? ('0' + myDate.getHours()) : myDate.getHours();
        let m = (myDate.getMinutes() < 10) ? ('0' + myDate.getMinutes()) : myDate.getMinutes();
        return h + ':' + m;
    }

    initSelfStockBar() {
        this.preTurnOver = 0;
        this.nowTurnover = 0;
        this.selfStockBarChange.series[0].data = [];
        this.selfStockBarChange.series[0].data.length = this.selfStockXdata.length;
        this.selfStockBarChange.yAxis.max = 0;
    }
    initSelfStockLine(pre_close) {
        this.selfStockLineChange.series[0].data = [];
        this.selfStockLineChange.series[0].data.length = this.selfStockXdata.length;
        this.selfStockLineChange.yAxis.min = Math.ceil(pre_close) - 2;
        this.selfStockLineChange.yAxis.max = Math.ceil(pre_close) + 2;
        this.selfStockLineChange.yAxis.interval = 1;
    }
    selfStockLineChange = {
        title: {
            text: ''
        },
        grid: {
            bottom: 10,
            top: 30,
        },
        xAxis: {
            show: false
        },
        yAxis: {
            min: 0,
            max: 1,
            interval: 0.5
        },
        series: [
            {
                data: [],
                connectNulls: true,
                markLine: {
                    data: [
                        {
                            name: '昨收值',
                            yAxis: 1
                        }
                    ],
                    label: {
                        normal: {
                            show: false
                        }
                    },
                    lineStyle: {
                        normal: {
                            color: '#f3c239'
                        }
                    }
                }
            }
        ]
    }
    selfStockBarChange = {
        grid: {
            top: 0
        },
        series: [
            {
                name: '成交金额',
                type: 'bar',
                data: []
            }
        ],
        yAxis: {
            axisLabel: {
                showMinLabel: false,
                formatter: function (value, index) {
                    return value.toFixed(0) + '万';
                },
                showMaxLabel: false
            },
            interval: 1,
            min: 0,
            max: 0
        }
    }

    historyMarkey() {
        //接历史行情
        this.quote.send(181, 10001, { requestId: 1, ukeyCode: this.mainStockUk, dateFrom: 20171102, dateTo: 20171102, timeTo: 113000000, timeFrom: 93000000, dataType: 101001 });
        this.quote.addSlot({
            appid: 181,
            packid: 10002,
            callback: (msg) => {
                console.log(msg.content.data);
                let historyStockLineData;
                let yData = [];
                historyStockLineData = msg.content.data.filter((item, index, arr) => {
                    if (index < msg.content.data.length - 2) {
                        let time = this.myGetTime(arr[index].t / 1000);
                        let nextTime = this.myGetTime(arr[index + 1].t / 1000);
                        item.time = time;
                        if (time != nextTime) {
                            yData.push(item.p);
                            return item;
                        }
                    }
                })
                let min = Math.min.apply(null, yData);
                let max = Math.max.apply(null, yData);
                let middle = Number(this.mainStockPreclose);

                historyStockLineData.forEach((item, index) => {
                    let marketIndex = this.selfStockXdata.indexOf(item.time);//当前行情在echarts中的位置
                    this.selfStockLineChange.series[0].data[marketIndex] = item.p;
                })

                let abs = Math.abs(middle - min) >= Math.abs(middle - max) ? Math.ceil(Math.abs(middle - min)) : Math.ceil(Math.abs(middle - max));
                this.selfStockLineChange.yAxis.min = middle - abs;
                this.selfStockLineChange.yAxis.max = middle + abs;
                this.selfStockLineChange.yAxis.interval = abs / 2;
                if (this.selfStockPriceLine) {
                    this.selfStockPriceLine.setOption(this.selfStockLineChange);
                }
            }
        })
    }
    ngOnInit() {

        this.maid = Number(this.config.get("user").maid);
        this.userId = Number(this.config.get("user").userid.split('.').join(''));
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
        //重要指数的uk列表
        this.selfStockUkList = [2490369, 1441794, 2490383, 2490381, 1441854, 1441876, 1441949];
        this.dashAllUkcodeList.push(2490646);
        this.dashAllUkcodeList = this.dashAllUkcodeList.concat(this.selfStockUkList);



        let d = new Date();
        this.nowDate = d.getFullYear() + '-' + (Number(d.getMonth()) + 1) + '-' + d.getDate();

        let selfStockSecuInfo = this.secuinfo.getSecuinfoByUKey(2490369, 1441794, 2490383, 2490381, 1441854, 1441876, 1441949);
        for (let i in selfStockSecuInfo) {
            let item: any = {};
            item.name = selfStockSecuInfo[i].SecuAbbr;
            item.stockCode = selfStockSecuInfo[i].SecuCode;
            item.ukey = selfStockSecuInfo[i].ukey;
            item.pre_close = selfStockSecuInfo[i].PreClose
            this.selfStockData.push(item)
        }

        this.selfStockLineChange.title.text = this.selfStockData[0].stockCode + '[' + this.selfStockData[0].name + ']';
        this.mainStockPreclose = this.selfStockData[0].pre_close;
        this.mainStockUk = this.selfStockData[0].ukey;

        this.bestStockList = new DataTable("table2");
        this.worstStockList = new DataTable("table2");
        this.worstStockList.addColumn("股票代码", "价格", "涨幅", "超额收益");
        this.worstStockList.columns[1].align = 'right';
        this.worstStockList.columns[2].align = 'right';
        this.worstStockList.columns[3].align = 'right';
        this.worstStockList.columns[0].maxWidth = 80;
        this.bestStockList.addColumn("股票代码", "价格", "涨幅", "超额收益");
        this.bestStockList.columns[1].align = 'right';
        this.bestStockList.columns[2].align = 'right';
        this.bestStockList.columns[3].align = 'right';

        this.bestStockList.columns[0].maxWidth = 80;

        this.selfStockTable = new DataTable("table2");
        this.selfStockTable.addColumn('代码', '名称', '现价', '涨跌', '涨跌幅', '成交量', '成交金额');

        this.selfStockTable.columns[2].align = 'right';
        this.selfStockTable.columns[3].align = 'right';
        this.selfStockTable.columns[4].align = 'right';
        this.selfStockTable.columns[5].align = 'right';
        this.selfStockTable.columns[6].align = 'right';
        this.selfStockTable.columns[0].maxWidth = 100;
        this.selfStockData.forEach(item => {
            let row = this.selfStockTable.newRow();
            row.cells[0].Text = item.stockCode;
            row.cells[1].Text = item.name;
            row.cells[1].Color = '#f3c239';
            row.cells[1].Data = item.ukey;
            row.cells[2].Data = (item.pre_close / 10000).toFixed(2);
            row.cells[2].Text = '--';
            row.cells[3].Text = '--';
            row.cells[4].Text = '--';
            row.cells[5].Text = '--';
            row.cells[6].Text = '--';
        })

        this.selfStockTable.onRowDBClick = (rowItem, rowIndex) => {//点击切换指数行情

            this.selfStockLineChange.title.text = rowItem.cells[0].Text + '[' + rowItem.cells[1].Text + ']';

            this.mainStockUk = rowItem.cells[1].Data;
            this.mainStockPreclose = rowItem.cells[2].Data;

            console.log(rowIndex);
            this.initSelfStockLine(this.mainStockPreclose);

            this.selfStockPriceLine.setOption(this.selfStockLineChange);
            this.initSelfStockBar();
            this.selfStockMoneyBar.setOption(this.selfStockBarChange);
            this.preMainStockUk = this.mainStockUk;
            this.historyMarkey();
        }

        this.todoList = new DataTable("table2");
        this.todoList.RowIndex = false; // 去除序列
        this.todoList.addColumn("是否完成", "消息", "创建时间", "操作");
        this.todoList.ColumnHeader = false;
        this.todoList.columns[1].maxWidth = 250;
        this.todoList.columns[0].maxWidth = 20;
        this.todoList.columns[3].maxWidth = 50;

        //复选框单击事件，颜色变化和请求的发送
        this.todoList.onCellClick = (cellItem, cellIndex, rowIndex) => {
            this.todoRowIndex = rowIndex;
            this.nowOperateId = cellItem.Data;
            this.nowOperateStat = cellItem.dataSource.text == true ? 1 : 0;
            if (cellIndex == 0) {
                this.tradePoint.send(260, 251, {
                    head: { realActor: "editTodo" }, body: {
                        id: this.nowOperateId,
                        stat: this.nowOperateStat,
                        maid: this.maid,
                        oid: this.userId,
                        content: this.todoList.rows[rowIndex].cells[1].Text,
                        createtime: this.todoList.rows[rowIndex].cells[2].Text
                    }
                });
            }
        }

        this.alarmTable = new DataTable("table2");
        this.alarmTable.RowIndex = false; // 去除序列
        this.alarmTable.addColumn("来源", "内容", "严重程度", "状态", "时间");

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


        //接实时行情
        this.quote.addSlot({
            appid: 17,
            packid: 110,
            callback: (msg) => {
                let stockIncrease = msg.content.last > msg.content.pre_close ? '+' + Math.round(1000 * (msg.content.last - msg.content.pre_close) / msg.content.pre_close) / 100 : Math.round(1000 * (msg.content.last - msg.content.pre_close) / msg.content.pre_close) / 100;
                // this.currentMarketData[msg.content.ukey] = { 'stockPrice': msg.content.last, 'stockIncrease': stockIncrease };

                let marketTime = this.myGetTime(msg.content.time);//当前行情的时间
                let marketIndex = this.selfStockXdata.indexOf(marketTime);//当前行情在echarts中的位置
                if (marketIndex != -1) {//找到相应的时间轴索引
                    if (this.selfStockUkList.indexOf(msg.content.ukey) != -1) {//主要指数
                        //主要指数列表
                        this.mainStockUk = this.selfStockData[0].ukey;
                        this.selfStockData.forEach((item, index) => {
                            if (item.ukey == msg.content.ukey) {
                                this.selfStockTable.rows[index].cells[2].Text = (msg.content.last / 10000).toFixed(2);
                                this.selfStockTable.rows[index].cells[3].Text = ((msg.content.last - msg.content.pre_close) / 10000).toFixed(2);
                                this.selfStockTable.rows[index].cells[4].Text = (100 * (msg.content.last - msg.content.pre_close) / msg.content.pre_close).toFixed(2) + '%';
                                this.selfStockTable.rows[index].cells[5].Text = (msg.content.volume / 10000).toFixed(2) + '万';
                                this.selfStockTable.rows[index].cells[6].Text = (msg.content.turnover / 10000).toFixed(2) + '万';
                                if (msg.content.last > msg.content.pre_close) {
                                    this.selfStockTable.rows[index].cells[2].Color = 'rgb(234, 47, 47)';
                                    this.selfStockTable.rows[index].cells[3].Color = 'rgb(234, 47, 47)';
                                    this.selfStockTable.rows[index].cells[4].Color = 'rgb(234, 47, 47)';
                                    this.selfStockTable.rows[index].cells[3].Text = '+' + ((msg.content.last - msg.content.pre_close) / 10000).toFixed(2);
                                    this.selfStockTable.rows[index].cells[4].Text = '+' + (100 * (msg.content.last - msg.content.pre_close) / msg.content.pre_close).toFixed(2) + '%';
                                } else if (msg.content.last < msg.content.pre_close) {
                                    this.selfStockTable.rows[index].cells[2].Color = 'rgb(55, 177, 78)';
                                    this.selfStockTable.rows[index].cells[3].Color = 'rgb(55, 177, 78)';
                                    this.selfStockTable.rows[index].cells[4].Color = 'rgb(55, 177, 78)';
                                }
                            }
                        })

                        if (msg.content.ukey == this.mainStockUk) {//主要指数的实时行情
                            console.log('this.mainStockUk' + this.mainStockUk)
                            let middle = Math.round(msg.content.pre_close / 10000);//昨收值
                            let turnover = Math.round(msg.content.turnover / 100) / 100;//当前时刻行情的成交金额


                            if (this.preMarketTime != marketTime) {
                                console.log('zong=======成交金额' + this.nowTurnover);
                                this.nowTurnover = 0;//一分钟内的累计成交量
                                this.preMarketTime = marketTime;//上一时刻的时间
                            }
                            let lastPrice = Number((msg.content.last / 10000).toFixed(2));//现价
                            this.selfStockLineChange.series[0].data[marketIndex] = lastPrice;
                            if (this.selfStockLineChange.yAxis.min > lastPrice) {
                                this.selfStockLineChange.yAxis.min = lastPrice;
                            }
                            if (this.selfStockLineChange.yAxis.max < lastPrice) {
                                this.selfStockLineChange.yAxis.max = lastPrice;
                            }

                            let abs = Math.abs(middle - this.selfStockLineChange.yAxis.min) >= Math.abs(middle - this.selfStockLineChange.yAxis.max) ? Math.ceil(Math.abs(middle - this.selfStockLineChange.yAxis.min)) : Math.ceil(Math.abs(middle - this.selfStockLineChange.yAxis.max));
                            //纵轴显示整数
                            abs = Math.ceil(abs / 4) * 4;
                            this.selfStockLineChange.yAxis.interval = abs / 2;
                            this.selfStockLineChange.yAxis.min = middle - abs;
                            this.selfStockLineChange.yAxis.max = middle + abs;
                            if (this.selfStockPriceLine) {
                                this.selfStockPriceLine.setOption(this.selfStockLineChange);
                            }
                            console.log(marketTime)
                            console.log(marketIndex)
                            console.log('现价' + lastPrice)
                            if (marketIndex == 0 && this.preTurnOver == 0) {//找到的是第一个值的时候，比如第二天
                                // this.initSelfStockLine(middle);
                                this.preTurnOver = turnover;//上一时刻的成交量
                                if (this.selfStockPriceLine) {
                                    this.selfStockPriceLine.setOption(this.selfStockLineChange);
                                }

                                this.initSelfStockBar();
                                if (this.selfStockMoneyBar) {
                                    this.selfStockMoneyBar.setOption(this.selfStockBarChange);
                                }
                            }
                            //切换页面或刚进入页面的时候初始化
                            if (this.preTurnOver == 0 && marketIndex != 0) {
                                this.preTurnOver = turnover;//上一时刻的成交金额
                                this.selfStockLineChange.series[0].markLine.data[0].yAxis = msg.content.pre_close / 10000;//zuoshou
                                this.selfStockLineChange.yAxis.min = middle - 2;
                                this.selfStockLineChange.yAxis.max = middle + 2;
                                this.selfStockLineChange.yAxis.interval = 1;
                                if (this.selfStockPriceLine) {
                                    this.selfStockPriceLine.setOption(this.selfStockLineChange);
                                }

                            } else if (this.preTurnOver != 0) {
                                this.nowTurnover = Number((turnover - this.preTurnOver + this.nowTurnover).toFixed(2));//当前时间的成金额
                                this.preTurnOver = turnover;//上一时刻的成交量

                                if (this.selfStockBarChange.yAxis.max < this.nowTurnover) {//设置成交金额的最大值
                                    this.selfStockBarChange.yAxis.max = this.nowTurnover;
                                }
                                //
                                this.selfStockBarChange.yAxis.max = Math.ceil(this.selfStockBarChange.yAxis.max / 2) * 2;
                                this.selfStockBarChange.yAxis.interval = this.selfStockBarChange.yAxis.max / 2;
                                this.selfStockBarChange.series[0].data[marketIndex] = this.nowTurnover;
                                if (this.selfStockMoneyBar) {
                                    this.selfStockMoneyBar.setOption(this.selfStockBarChange);
                                }

                                console.log('成交金额' + this.nowTurnover);
                            }

                        }
                    }

                    if (msg.content.ukey == 2490646) {//中证1000的涨幅
                        this.refStockIncrease = Number(stockIncrease);
                        console.log('this.refStockIncrease' + this.refStockIncrease);
                    }

                    if (this.ukCodeList.indexOf(msg.content.ukey) != -1) {//AI看盘的实时行情
                        let ukInBestIndex = this.bestStockUktoIndex[msg.content.ukey];
                        let ukInWorstIndex = this.worstStockUktoIndex[msg.content.ukey];
                        if (this.refStockIncrease != 0) {//参考股的数值回来才有超额涨幅
                            //超额涨幅
                            let overStockIncrease = Number((Number(stockIncrease) - this.refStockIncrease).toFixed(2));
                            if (ukInBestIndex != undefined) {
                                if (overStockIncrease > 0) {
                                    this.bestStockList.rows[ukInBestIndex].cells[3].Text = '+' + overStockIncrease + '%';
                                    this.bestStockList.rows[ukInBestIndex].cells[3].Color = 'rgb(234, 47, 47)';
                                } else if (overStockIncrease < 0) {
                                    this.bestStockList.rows[ukInBestIndex].cells[3].Text = overStockIncrease + '%';
                                    this.bestStockList.rows[ukInBestIndex].cells[3].Color = 'rgb(55, 177, 78)';
                                }
                            }
                            if (ukInWorstIndex != undefined) {
                                if (overStockIncrease > 0) {
                                    this.worstStockList.rows[ukInWorstIndex].cells[3].Text = '+' + overStockIncrease + '%';
                                    this.worstStockList.rows[ukInWorstIndex].cells[3].Color = 'rgb(234, 47, 47)';
                                } else if (overStockIncrease < 0) {
                                    this.worstStockList.rows[ukInWorstIndex].cells[3].Text = overStockIncrease + '%';
                                    this.worstStockList.rows[ukInWorstIndex].cells[3].Color = 'rgb(55, 177, 78)';
                                }
                            }
                        }
                        if (ukInBestIndex != undefined) {
                            this.bestStockList.rows[ukInBestIndex].cells[1].Text = (msg.content.last / 10000).toFixed(2);
                            this.bestStockList.rows[ukInBestIndex].cells[2].Text = stockIncrease + '%';
                            if (Number(stockIncrease) > 0) {
                                this.bestStockList.rows[ukInBestIndex].cells[2].Color = 'rgb(234, 47, 47)';
                            } else if (Number(stockIncrease) < 0) {
                                this.bestStockList.rows[ukInBestIndex].cells[2].Color = 'rgb(55, 177, 78)';
                            }
                        }
                        if (ukInWorstIndex != undefined) {
                            this.worstStockList.rows[ukInWorstIndex].cells[1].Text = (msg.content.last / 10000).toFixed(2);
                            this.worstStockList.rows[ukInWorstIndex].cells[2].Text = stockIncrease + '%';
                            if (Number(stockIncrease) > 0) {
                                this.worstStockList.rows[ukInWorstIndex].cells[2].Color = 'rgb(234, 47, 47)';
                            } else if (Number(stockIncrease) < 0) {
                                this.worstStockList.rows[ukInWorstIndex].cells[2].Color = 'rgb(55, 177, 78)';
                            }
                        }
                    }
                }
            }
        });

        //预警接口 
        this.config.on("getAlarmMessageAns", (data) => {
            if (data.msret.msgcode != '00') {
                alert(data.msret.msg)
                return;
            }

            let alarmlvObj = { '0': '不重要', '1': '一般', '2': '危险', '3': '紧急' };
            let statObj = { '0': '未处理', '1': '处理中' };

            this.alarmTableData = data.body;
            if (this.alarmTableData.length > 0) {
                this.alarmTableData.forEach(item => {
                    if (item.stat == '0' || item.stat == '1') {
                        let alarmtime = item.alarmtime.substring(0, 10);
                        let row = this.alarmTable.newRow();
                        row.cells[0].Text = item.appname;
                        row.cells[1].Text = item.content;
                        row.cells[2].Text = alarmlvObj[item.alarmlv];
                        row.cells[3].Text = statObj[item.stat];
                        if (this.nowDate == alarmtime) {
                            row.cells[4].Text = item.alarmtime.substring(10);
                        } else {
                            row.cells[4].Text = alarmtime;
                        }
                    }
                })
            }
        });

        //产品信息
        this.config.on("getProductAns", (data) => {
            if (data.msret.msgcode != '00') {
                alert(data.msret.msg)
                return;
            }
            let productScaleChangeOpt = {
                yAxis: { data: [] },
                series: [{ data: [] }]
            }

            this.productData = data.body;
            if (this.productData.length > 0) {
                this.nowProductIndex = this.productData.length;
                this.productDataSort = this.productData.sort(this.compare('totalint'));
                this.productDataSort.forEach(item => {
                    productScaleChangeOpt.yAxis.data.push(item.caname);
                    productScaleChangeOpt.series[0].data.push(Math.log(item.totalint < 1 ? 1 : item.totalint) / Math.log(2));
                })
                this.productScaleBar.setOption(productScaleChangeOpt);
                this.nowProductCaid = this.productData[0].caid;
                this.productNetData = [];
                this.tradePoint.send(260, 251, { head: { realActor: "getMonitorProducts" }, body: {} });
                this.tradePoint.send(260, 251, { head: { realActor: "getMonitorProducts" }, body: { caid: this.nowProductCaid } });
                this.tradePoint.send(260, 251, { head: { realActor: "getProductNet" }, body: { caid: this.nowProductCaid } });
            }
        })

        //产品净值
        this.config.on("getProductNetAns", (data) => {
            if (data.msret.msgcode != '00') {
                alert(data.msret.msg)
                return;
            }
            let productNetChangeOpt = {
                title: { text: '' },
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
        })

        //getMonitorProductsAns
        this.config.on("getMonitorProductsAns", (data) => {
            if (data.msret.msgcode != '00') {
                alert(data.msret.msg)
                return;
            }
            this.monitorProductsData = data.body;
            if (this.monitorProductsData.length > 0) {
                if (this.monitorProductsData[0].caid == this.nowProductCaid && this.monitorProductsData.length == 1) {//获取单个产品数据

                    this.nowMonitorProductsData = this.monitorProductsData;
                    //期货权益
                    this.futuresProfit = Number(this.nowMonitorProductsData[0].futures_validamt) + Number(this.nowMonitorProductsData[0].futures_value);
                    //风险度
                    this.riskDegree = (this.futuresProfit == 0) ? 0 : Number(Math.round(10000 * (Number(this.nowMonitorProductsData[0].totalmargin) / this.futuresProfit)) / 100)
                    //当日盈亏

                    this.totalProfitAndLoss = this.toThousands(((Number(this.nowMonitorProductsData[0].hold_closepl) + Number(this.nowMonitorProductsData[0].hold_posipl)) / 1000).toFixed(1));
                    //浮动盈亏 
                    this.floatProfitAndLoss = this.toThousands((this.nowMonitorProductsData[0].hold_posipl / 1000).toFixed(1));

                    //敞口比例
                    this.riskExposure = (Number(this.nowMonitorProductsData[0].totalint) == 0) ? 0 : Math.round(10000 * Number(Number(this.nowMonitorProductsData[0].risk_exposure) / Number(this.nowMonitorProductsData[0].totalint))) / 100;

                } else {
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
                            if (totalMoney == 0) {
                                totalMoney = 1;
                            }
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
                }
            }
        })

        //最好的30股票

        this.config.on('getBestStocksAns', data => {
            if (data.msret.msgcode != '00') {
                alert(data.msret.msg)
                return;
            }
            this.aiStockDate.bestStockListData = data.body;
            this.bestStockList.RowIndex = false; // 去除序列


            this.bestStockList.backgroundColor = '#fff'
            if (this.aiStockDate.bestStockListData.length > 0) {
                this.aiStockDate.bestStockListData.forEach((item, index) => {
                    this.ukCodeList.push(Number(item.ukcode));
                    this.dashAllUkcodeList.push(Number(item.ukcode));
                    let row = this.bestStockList.newRow();
                    this.bestStockUktoIndex[item.ukcode] = index;

                    row.cells[0].Text = item.windcode;
                    row.cells[0].Color = "rgb(234, 47, 47)";
                    row.cells[1].Text = '--';
                    row.cells[2].Text = '--';
                    row.cells[3].Text = '--';
                })
            }
            this.quote.send(17, 101, { topic: 3112, kwlist: this.dashAllUkcodeList });
        })

        //最差的30股
        this.config.on('getWorstStocksAns', data => {
            if (data.msret.msgcode != '00') {
                alert(data.msret.msg)
                return;
            }
            this.aiStockDate.worstStockListData = data.body;
            this.worstStockList.RowIndex = false; // 去除序列
            if (this.aiStockDate.worstStockListData.length > 0) {
                this.aiStockDate.worstStockListData.forEach((item, index) => {
                    this.ukCodeList.push(Number(item.ukcode));
                    this.dashAllUkcodeList.push(Number(item.ukcode));
                    let row = this.worstStockList.newRow();
                    this.worstStockUktoIndex[item.ukcode] = index;

                    row.cells[0].Text = item.windcode;
                    row.cells[0].Color = "rgb(55, 177, 78)";
                    row.cells[1].Text = '--';
                    row.cells[2].Text = '--';
                    row.cells[3].Text = '--';
                })
            }
            this.quote.send(17, 101, { topic: 3112, kwlist: this.dashAllUkcodeList });

        })

        //todo列表
        this.config.on('getTodoListAns', data => {
            if (data.msret.msgcode != '00') {
                alert(data.msret.msg)
                return;
            }
            this.todoListData = data.body.reverse();
            this.todoList.rows.length = 0;
            if (this.todoListData.length > 0) {
                this.todoListData.forEach((item, itemIndex) => {
                    let row = this.todoList.newRow();
                    let todoTime = new Date(item.createtime.substring(0, 10));

                    if (item.stat == '1') {
                        row.cells[1].Color = 'rgb(93, 83, 84)';
                        row.cells[2].Color = 'rgb(93, 83, 84)';
                    } else {
                        if (new Date(this.nowDate) > todoTime) {
                            row.cells[1].Color = 'rgb(234, 47, 47)';
                            row.cells[2].Color = 'rgb(234, 47, 47)';
                        } else {
                            row.cells[1].Color = 'rgb(208, 208, 208)';
                            row.cells[2].Color = 'rgb(208, 208, 208)';
                        }
                    }

                    row.cells[0].Type = "checkbox";
                    row.cells[0].Text = item.stat;
                    row.cells[0].Data = item.id;
                    row.cells[0].Text = (item.stat == '1') ? true : false;

                    row.cells[1].Text = item.content;
                    row.cells[1].Type == "plaintext"
                    row.cells[2].Text = item.createtime.substring(0, 10);
                    row.cells[3].Type = "button-group";
                    row.cells[3].Class = 'default';
                    row.cells[3].Text = ["edit", "trash"];

                    row.cells[3].OnClick = (index, cellIndex, rowIndex) => {
                        this.todoRowIndex = rowIndex;
                        this.nowOperateId = item.id;
                        this.nowOperateStat = item.stat;

                        if (row.cells[1].Type == "textbox") {
                            if (index == 0) {//确认编辑
                                this.tradePoint.send(260, 251, {
                                    head: { realActor: "editTodo" }, body: {
                                        id: this.nowOperateId,
                                        stat: this.nowOperateStat,
                                        content: row.cells[1].Text,
                                        createtime: row.cells[2].Text,
                                        maid: this.maid,
                                        oid: this.userId

                                    }
                                });
                            } else if (index == 1) {//取消编辑
                                row.cells[1].Text = item.content;
                                row.cells[2].Text = item.createtime.substring(0, 10);
                                row.cells[3].Text = ["edit", "trash"];
                                row.cells[1].Type = "plaintext";
                                row.cells[2].Type = "plaintext";
                            }
                        } else if (row.cells[1].Type == "plaintext") {
                            if (index == 1) {//删除操作
                                this.tradePoint.send(260, 251, { head: { realActor: "deleteTodo" }, body: { id: this.nowOperateId } });
                            } else if (index == 0) {//编辑
                                row.cells[1].Type = "textbox";
                                row.cells[2].Type = "date";
                                row.cells[3].Text = ["ok", "remove"];
                            }
                        }
                    };
                })
            }
            this.addTodoContent = '';
        })

        //addTodo
        this.config.on('createTodoAns', data => {
            if (data.msret.msgcode != '00') {
                alert(data.msret.msg)
                return;
            }
            this.tradePoint.send(260, 251, { head: { realActor: "getTodoList" }, body: {} });
        })

        //editTodo
        this.config.on('editTodoAns', data => {
            if (data.msret.msgcode != '00') {
                alert(data.msret.msg)
                return;
            }
            let isPast = new Date(this.nowDate) > new Date(this.todoList.rows[this.todoRowIndex].cells[2].Text);
            this.todoList.rows[this.todoRowIndex].cells[3].Text = ["edit", "trash"];;
            this.todoList.rows[this.todoRowIndex].cells[1].Type = "plaintext";
            this.todoList.rows[this.todoRowIndex].cells[2].Type = "plaintext";
            this.nowOperateStat = this.todoList.rows[this.todoRowIndex].cells[0].Text
            if (this.nowOperateStat) {//已完成
                this.todoList.rows[this.todoRowIndex].cells[1].Color = 'rgb(93, 83, 84)';
                this.todoList.rows[this.todoRowIndex].cells[2].Color = 'rgb(93, 83, 84)';
            } else {//未完成
                if (isPast) {//已过期
                    this.todoList.rows[this.todoRowIndex].cells[1].Color = 'rgb(234, 47, 47)';
                    this.todoList.rows[this.todoRowIndex].cells[2].Color = 'rgb(234, 47, 47)';
                } else {
                    this.todoList.rows[this.todoRowIndex].cells[1].Color = 'rgb(208, 208, 208)';
                    this.todoList.rows[this.todoRowIndex].cells[2].Color = 'rgb(208, 208, 208)';
                }
            }
        })

        //删除todo列表
        this.config.on('deleteTodoAns', data => {
            if (data.msret.msgcode != '00') {
                alert(data.msret.msg)
                return;
            }
            this.todoList.rows.splice(this.todoRowIndex, 1);
        })
        this.tradePoint.send(260, 251, { head: { realActor: "getAlarmMessage" }, body: {} });

        this.tradePoint.send(260, 251, { head: { realActor: "getProduct" }, body: {} });
        //AI看盘数据
        this.tradePoint.send(260, 251, { head: { realActor: "getWorstStocks" }, body: {} });
        this.tradePoint.send(260, 251, { head: { realActor: "getBestStocks" }, body: {} });
        //获取todo列表
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
    createSelfStockPriceChart() {
        return {
            option: {
                title: {
                    top: 10,
                    left: '40',
                    textStyle: {
                        color: '#d0d0d0',
                        fontSize: 12
                    }
                },
                grid: {
                    left: 40,
                    right: 20,
                    top: 10,
                    bottom: 30
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
                    axisPointer: {
                        label: {
                            precision: 2
                        }
                    },
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
                        textStyle: { color: "#717171" },
                        formatter: function (value, index) {
                            return value.toFixed(0);
                        }
                    },
                    axisTick: {
                        inside: true
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
                                color: '#d0d0d0'
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
                    formatter: function (series) {
                        let data = series[0].data;
                        return '总资产：<br/>' + Math.round(Math.pow(2, data)).toString().replace(/\d{1,3}(?=(\d{3})+$)/g, function (s) {
                            return s + ','
                        })
                    }
                },
                grid: {
                    containLabel: true,
                    top: 10,
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
                        },
                        axisTick: {
                            inside: true
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
        if (this.selfStockPriceLine) {
            this.selfStockPriceLine.dispose();
            this.selfStockPriceLine = null;
        }
        if (this.selfStockMoneyBar) {
            this.selfStockMoneyBar.dispose();
            this.selfStockMoneyBar = null;
        }
    }
}


