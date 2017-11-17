"use strict";

import { Component, OnInit, OnDestroy } from "@angular/core";
import { TradeService, QuoteService } from "../../bll/services";
import { DataTable, DataTableColumn, DataTableRow, ChartViewer, Section, ListItem } from "../../../base/controls/control";
import * as echarts from "echarts";
import { ECharts } from "echarts";

@Component({
    moduleId: module.id,
    selector: "dashboard",
    templateUrl: "dash.html",
    styleUrls: ["home.component.css", "dash.css"]
})
export class DashboardComponent implements OnInit, OnDestroy {
    riskTable: DataTable;
    todoList: DataTable;
    worstStockList: DataTable;
    bestStockList: DataTable;

    productNet: Section;//产品净值
    productNetChart: ECharts;


    productWeight: Section;//产品仓位比重
    productWeightGauge: ECharts;

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
    productNetData: any[];
    seriesIndex: number;
    todoListData: any[];
    addTodoContent: string = '';

    todoRowIndex: number;
    bestUkCodeList: any[];
    worstUkCodeList: any[];
    nowDate: any;


    constructor(private tradePoint: TradeService, private quote: QuoteService) {

    }
    addTodoEvent() {
        this.tradePoint.send(260, 251, { head: { realActor: "createTodo" }, body: { content: this.addTodoContent, stat: '0' } });
    }

    ngOnInit() {
        let d = new Date();
        this.nowDate = d.getFullYear() + '-' + (Number(d.getMonth()) + 1) + '-' + d.getDate();
        let vertual = {
            totalProfitAndLoss: 11,
            floatProfitAndLoss: 2,
            riskDate: [
                {
                    id: 1,
                    content: '产品净值产品净值产品净值产品净值',
                    level: 1,
                    kind: '123',
                    time: '2017/01/21',
                    operation: 'lal'
                },
                {
                    id: 1,
                    content: '产品净值产品净值产品净值产品净值',
                    level: 1,
                    kind: '123',
                    time: '2017/01/21',
                    operation: 'lal'
                },
                {
                    id: 1,
                    content: '111',
                    level: 1,
                    kind: '123',
                    time: '2017/01/21',
                    operation: 'lal'
                },
                {
                    id: 1,
                    content: '111',
                    level: 1,
                    kind: '123',
                    time: '2017/01/21',
                    operation: 'lal'
                },
                {
                    id: 1,
                    content: '111',
                    level: 1,
                    kind: '123',
                    time: '2017/01/21',
                    operation: 'lal'
                },
                {
                    id: 1,
                    content: '111',
                    level: 1,
                    kind: '123',
                    time: '2017/01/21',
                    operation: 'lal'
                },
                {
                    id: 1,
                    content: '111',
                    level: 1,
                    kind: '123',
                    time: '2017/01/21',
                    operation: 'lal'
                },
                {
                    id: 1,
                    content: '111',
                    level: 1,
                    kind: '123',
                    time: '2017/01/21',
                    operation: 'lal'
                }
            ]

        }


        this.bestStockList = new DataTable("table2");
        this.worstStockList = new DataTable("table2");

        this.todoList = new DataTable("table2");
        this.todoList.RowIndex = false; // 去除序列
        this.todoList.addColumn("是否完成", "消息", "创建时间", "操作");


        this.todoList.onCellClick = (cellItem, cellIndex, rowIndex) => {

            this.todoRowIndex = rowIndex;
            let operateId = this.todoList.rows[rowIndex].cells[0].Data;
            let operateStat = cellItem.dataSource.text == true ? 1 : 0;

            if (cellIndex == 0) {
                this.tradePoint.send(260, 251, {
                    head: { realActor: "editTodo" }, body: {
                        id: operateId,
                        stat: operateStat,
                        content: this.todoList.rows[rowIndex].cells[1].Text,
                        createtime: this.todoList.rows[rowIndex].cells[2].Text
                    }
                });
            } else if (cellIndex == 3) {

                if (this.todoList.rows[rowIndex].cells[3].Text == 'update') {
                    this.tradePoint.send(260, 251, {
                        head: { realActor: "editTodo" }, body: {
                            id: operateId,
                            stat: operateStat,
                            content: this.todoList.rows[rowIndex].cells[1].Text,
                            createtime: this.todoList.rows[rowIndex].cells[2].Text
                        }
                    });
                } else if (this.todoList.rows[rowIndex].cells[3].Text == 'delete') {
                    this.tradePoint.send(260, 251, { head: { realActor: "deleteTodo" }, body: { id: operateId } });
                }
            }
        }

        this.todoList.onCellDBClick = (cellItem, cellIndex, rowIndex) => {
            if (cellIndex == 1) {
                cellItem.Type = "textbox";
            } else if (cellIndex == 2) {
                cellItem.Type = "date";
            }
            this.todoList.rows[rowIndex].cells[3].Text = 'update'

        }
        this.riskTable = new DataTable("table2");
        this.riskTable.backgroundColor = '#ff0'
        this.riskTable.RowIndex = false; // 去除序列
        this.riskTable.addColumn("ID", "content", "level", "kind", "time", "operation");

        vertual.riskDate.forEach(item => {
            let row = this.riskTable.newRow();
            //  row.backgroundColor = 'red';//设置行的背景色
            row.cells[0].Text = item.id;
            // row.cells[0].Type = "textbox";
            // row.cells[0].Title = item.id.toString();
            row.cells[1].Text = item.content;
            row.cells[2].Text = item.level;
            row.cells[3].Text = item.kind;
            row.cells[4].Text = item.time;
            row.cells[5].Text = item.operation;
        })



        this.productNet = new Section();
        this.productNet.title = "主营构成";
        this.productNet.content = this.createProductNetChart();

        this.productWeight = new Section();
        this.productWeight.title = "ddd";
        this.productWeight.content = this.creatProductWeight();



        this.allProductWeight = new Section();
        this.allProductWeight.title = "主营构成";
        this.allProductWeight.content = this.createAllProductWeight();

        this.productScale = new Section();
        this.productScale.title = "主营构成";
        this.productScale.content = this.createProductScale();


        this.registerListener();

        //require data

        this.quote.addSlot({
            appid: 17,
            packid: 110,
            callback: (msg) => {
                console.log('================++++++++++++++++++++++=============================');
                console.log(msg)
            }
        });
        this.tradePoint.addSlot({
            appid: 260,
            packid: 251,
            callback: (msg) => {
                switch (msg.content.head.actor) {
                    case 'getAlarmMessageAns':
                    console.log('getAlarmMessageAns--------------');
                    console.log(JSON.parse(msg.content.body).body)
                        break;

                    case 'getProductAns':
                        let productScaleChangeOpt = {
                            yAxis: { data: [] },
                            series: [{ data: [] }]
                        }
                        this.productData = JSON.parse(msg.content.body).body;
                        this.productData.forEach(item => {
                            productScaleChangeOpt.yAxis.data.push(item.caname);

                            productScaleChangeOpt.series[0].data.push(Math.log(item.totalint < 1 ? 1 : item.totalint) / Math.log(2));
                        })
                        console.log('getProductAns');
                        console.log(this.productData)
                        this.productScaleBar.setOption(productScaleChangeOpt);
                        this.seriesIndex = 0;
                        this.productNetData = [];
                        this.tradePoint.send(260, 251, { head: { realActor: "getMonitorProducts" }, body: { caid: '20001' } });
                        this.tradePoint.send(260, 251, { head: { realActor: "getMonitorProducts" }, body: {} });
                        this.tradePoint.send(260, 251, { head: { realActor: "getProductNet" }, body: { caid: '20001' } });
                        break;
                    case 'getProductNetAns':
                        let productNetChangeOpt = {
                            title: { text: '' },
                            xAxis: [{ data: [] }],
                            series: [{ data: [] }, { data: [] }]
                        }
                        this.productNetData = JSON.parse(msg.content.body).body;
                        this.productNetData.forEach(item => {
                            productNetChangeOpt.xAxis[0].data.push(item.trday);
                            productNetChangeOpt.title.text = item.caname;
                            productNetChangeOpt.series[0].data.push(item.netvalue);
                            productNetChangeOpt.series[1].data.push(item.netvalue - 1);
                        })
                        this.productNetChart.setOption(productNetChangeOpt);
                        break;
                    case 'getMonitorProductsAns':
                        let productWeightChangeOpt = {
                            series: [{
                                data: [{
                                    value: 0
                                }]
                            }]
                        }

                        this.monitorProductsData = JSON.parse(msg.content.body).body;
                        if (this.monitorProductsData.length == 1 && this.monitorProductsData[0].caid == '20001') {
                            //期货权益
                            this.futuresProfit = Number(this.monitorProductsData[0].futures_validamt) + Number(this.monitorProductsData[0].futures_value);
                            //风险度
                            this.riskDegree = (this.futuresProfit == 0) ? 0 : Number((100 * (Number(this.monitorProductsData[0].totalmargin) / this.futuresProfit)).toFixed(2))
                            //总盈亏
                            this.totalProfitAndLoss = Number(this.monitorProductsData[0].hold_closepl) + Number(this.monitorProductsData[0].hold_posipl);
                            //浮动盈亏
                            this.floatProfitAndLoss = Number(this.monitorProductsData[0].hold_posipl);
                            //敞口率
                            this.riskExposure = (Number(this.monitorProductsData[0].totalint) == 0) ? 0 : 100 * Number((Number(this.monitorProductsData[0].risk_exposure) / Number(this.monitorProductsData[0].totalint)).toFixed(4))
                            //产品仓位比重改变值
                            productWeightChangeOpt.series[0].data[0].value = Number(this.monitorProductsData[0].totalint) == 0 ? 0 : 100 * Number(((Number(this.monitorProductsData[0].stock_value) + Number(this.monitorProductsData[0].totalmargin)) / Number(this.monitorProductsData[0].totalint)).toFixed(4));
                            this.productWeightGauge.setOption(productWeightChangeOpt);
                        } else {
                            let allProWeightGaugeChangeOpt = {
                                xAxis: [{ data: [] }],
                                series: [{ data: [] }, { data: [] }, { data: [] }, { data: [] }]
                            }
                            //产品资产比重改变值
                            this.monitorProductsData.forEach(item => {
                                allProWeightGaugeChangeOpt.xAxis[0].data.push(item.caname);
                                let money = Number(item.stock_validamt) + Number(item.futures_validamt) + Number(item.futures_value) - Number(item.totalmargin);
                                let totalMoney = money + Number(item.stock_validamt) + Number(item.totalmargin) + Number(item.subject_amount);
                                //股票可用资金
                                allProWeightGaugeChangeOpt.series[0].data.push((100 * Number(item.stock_validamt) / totalMoney).toFixed(2));
                                //期货保证金
                                allProWeightGaugeChangeOpt.series[1].data.push((100 * Number(item.totalmargin) / totalMoney).toFixed(2));
                                //现金
                                allProWeightGaugeChangeOpt.series[2].data.push((100 * money / totalMoney).toFixed(2));
                                //其他资产
                                allProWeightGaugeChangeOpt.series[3].data.push((100 * Number(item.subject_amount) / totalMoney).toFixed(2));
                            })
                            this.allProductWeightGauge.setOption(allProWeightGaugeChangeOpt);
                        }


                        break;
                    case 'getBestStocksAns':
                        this.aiStockDate.bestStockListData = JSON.parse(msg.content.body).body;
                        this.bestStockList.RowIndex = false; // 去除序列
                        this.bestStockList.addColumn("股票代码", "预期收益", "实际收益", "价格");
                        this.bestStockList.backgroundColor = '#fff'
                        // this.bestStockList.columns[1].hidden = true;
                        this.bestUkCodeList = []
                        this.aiStockDate.bestStockListData.forEach((item, index) => {
                            this.bestUkCodeList.push(Number(item.ukcode));
                            let row = this.bestStockList.newRow();
                            if (index % 2 == 1) {
                                row.backgroundColor = 'rgba(88, 171, 136, 0.92)';
                            }

                            row.cells[0].Text = item.windcode;
                            row.cells[1].Text = item.expected_returns;
                            row.cells[2].Text = '--';
                            row.cells[3].Text = '--';

                        })
                        console.log(this.bestUkCodeList)
                        // this.quote.send(17, 101, { topic: 3112, kwlist: this.bestUkCodeList });

                        break;
                    case 'getWorstStocksAns':
                        this.aiStockDate.worstStockListData = JSON.parse(msg.content.body).body;
                        console.log('===================')
                        console.log(this.aiStockDate.worstStockListData)
                        this.worstStockList.RowIndex = false; // 去除序列
                        this.worstStockList.addColumn("股票代码", "预期收益", "实际收益", "价格");
                        this.worstUkCodeList = [];
                        this.aiStockDate.worstStockListData.forEach((item, index) => {
                            this.worstUkCodeList.push(Number(item.ukcode));
                            let row = this.worstStockList.newRow();
                            if (index % 2 == 0) {
                                row.backgroundColor = 'rgb(226, 131, 131)';
                            }


                            row.cells[0].Text = item.windcode;
                            row.cells[1].Text = item.expected_returns;
                            row.cells[2].Text = '--';
                            row.cells[3].Text = '--';
                        })

                        this.quote.send(17, 101, { topic: 3112, kwlist: [1115433] });
                        break;
                    case 'getTodoListAns':
                        this.todoListData = JSON.parse(msg.content.body).body;
                        console.log('rodoLis==============');
                        console.log(this.todoListData)
                        this.todoList.rows.length = 0;




                        this.todoListData.forEach(item => {
                            let row = this.todoList.newRow();
                            let todoTime = new Date(item.createtime.substring(0, 10));
                            if (new Date(this.nowDate) > todoTime) {
                                row.backgroundColor = 'rgb(226, 131, 131)';
                            }

                            row.cells[0].Type = "checkbox";
                            row.cells[0].Text = item.stat;
                            row.cells[0].Data = item.id;
                            if (item.stat == '1') {
                                row.cells[0].Text = true;
                            } else if (item.stat == '0') {
                                row.cells[0].Text = false;
                            }

                            row.cells[1].Text = item.content;
                            row.cells[2].Text = item.createtime.substring(0, 10);
                            row.cells[3].Type = "button";
                            row.cells[3].Text = 'delete';
                        })

                        this.addTodoContent = '';
                        break;
                    case 'createTodoAns':
                        if (JSON.parse(msg.content.body).msret.msgcode == '00') {
                            this.tradePoint.send(260, 251, { head: { realActor: "getTodoList" }, body: {} });
                            // let row = this.todoList.newRow();

                            // row.cells[0].Type = "checkbox";
                            // row.cells[0].Text = false;
                            // row.cells[1].Text = this.addTodoContent;
                            // row.cells[2].Text = this.nowDate;
                            // row.cells[3].Type = "button";
                            // row.cells[3].Text = 'delete';
                        }

                        break;
                    case 'editTodoAns':
                        if (JSON.parse(msg.content.body).msret.msgcode == '00') {
                            this.tradePoint.send(260, 251, { head: { realActor: "getTodoList" }, body: {} });
                        }
                        break;
                    case 'deleteTodoAns':
                        if (JSON.parse(msg.content.body).msret.msgcode == '00') {
                            this.todoList.rows.splice(this.todoRowIndex, 1);
                        }
                        break;
                }
            }
        });



        this.tradePoint.send(260, 251, { head: { realActor: "getAlarmMessage" }, body: {} });
        this.tradePoint.send(260, 251, { head: { realActor: "getProduct" }, body: {} });
        //AI看盘数据
        this.tradePoint.send(260, 251, { head: { realActor: "getWorstStocks" }, body: {} });
        this.tradePoint.send(260, 251, { head: { realActor: "getBestStocks" }, body: {} });
        //获取todo列表
        this.tradePoint.send(260, 251, { head: { realActor: "getTodoList" }, body: {} });






    }

    registerListener() {

        this.productNet.content.onInit = (chart: ECharts) => {
            this.productNetChart = chart;
        }

        this.productWeight.content.onInit = (chart: ECharts) => {
            this.productWeightGauge = chart;
        }
        this.productScale.content.onInit = (chart: ECharts) => {
            this.productScaleBar = chart;
        }

        this.allProductWeight.content.onInit = (chart: ECharts) => {
            this.allProductWeightGauge = chart;
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
                        return '总资产：<br/>' + Math.round(Math.pow(2, data))
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
                    inverse: true
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
                                type: 'dashed'
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
    creatProductWeight() {
        return {
            option: {
                tooltip: {
                    show: false
                },
                series: [
                    {
                        // name: '业务指标',
                        type: 'gauge',
                        center: ['50%', '55%'],
                        detail: {
                            formatter: '{value}%',
                            offsetCenter: [0, '90%']
                        },
                        axisLine: { // 坐标轴线  
                            lineStyle: { // 属性lineStyle控制线条样式  
                                width: 5
                            }
                        },
                        axisTick: { // 坐标轴小标记  
                            show: false
                        },

                        axisLabel: {
                            show: false
                        },
                        splitLine: {
                            show: false
                        },
                        title: {
                            offsetCenter: [0, '-130%'],
                            textStyle: {
                                color: '#717171'
                            }
                        },
                        pointer: {
                            width: 2
                        },
                        data: [{ value: 50, name: '仓位比重' }]
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
                    data: ['净值', '收益率'],
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
                    },
                    {
                        axisLabel: {
                            show: true,
                            textStyle: { color: "#717171" }
                        },
                        splitLine: {
                            show: false
                            // lineStyle: {
                            //     type: 'dashed',
                            //     color: '#26d288'
                            // }
                        },
                        axisLine: {
                            lineStyle: { color: "#717171" }
                        },
                        name: '收益率',
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
                    },
                    {
                        name: '收益率',
                        type: 'line',
                        yAxisIndex: 1,
                        data: [0],
                        itemStyle: {
                            normal: {
                                color: 'rgba(88, 171, 136, 0.921569)'
                            }
                        },
                        areaStyle: {
                            normal: {
                                color: 'rgba(88, 171, 136, 0.8)'
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


