"use strict";

import { Component, HostListener, OnDestroy } from "@angular/core";
import { File, path } from "../../../base/api/services/backend.service"; // File operator
import { TradeService } from "../../bll/services";
import { FormsModule } from "@angular/forms";
import { CommonModule, DatePipe } from "@angular/common";
import { AppStoreService } from "../../../base/api/services/backend.service";
import * as echarts from "echarts";
const fs = require("@node/fs");

@Component({
    moduleId: module.id,
    selector: "rf-profit",
    templateUrl: "rf-profit.html",
    styleUrls: ["home.component.css", "riskfactor.component.css"],
    providers: [DatePipe],
    inputs: ["activeTab"]
})
export class FactorProfitComponent implements OnDestroy {
    activeTab: string;
    static self: any;
    rfrDateIndex: number = 0; // 保存风险因子收益日期的索引
    styleObj: any;
    dataSource: any;
    riskFactorReturnEchart: any; // echart
    everyDayReturnEchart: any;
    everyDayYearReturnEchart: any;    
    lastDayYearReturnEchart: any;  
    defaultMedia: any;
    dataDir: string;
    getFactorInfoString: string = "";
    getRiskFactorReturnString: string = ""; 
    riskFactorInfoArray: any[] = [];
    alphaFactorInfoArray: any[] = [];

    constructor(private tradePoint: TradeService, private datePipe: DatePipe) {
        FactorProfitComponent.self = this;
    }

    ngOnInit() {
        this.defaultMedia = [{
            option: {
                grid: {
                    left: "10%",
                    right: "10%"
                }
            }
        }, {
            query: {
                maxWidth: 650
            },
            option: {
                grid: {
                    left: 65,
                    right: 65
                }
            }
        }];

        this.tradePoint.addSlot({
            appid: 260,
            packid: 251,
            callback: (msg) => {
                // console.log(msg);
                switch (msg.content.head.actor) {
                    case "getFactorInfoAns":
                        this.getFactorInfoString += msg.content.body;
                        if (msg.content.head.pkgIdx === (msg.content.head.pkgCnt - 1)) {
                            let data1 = JSON.parse(this.getFactorInfoString);
                            if (data1.msret.msgcode === "00") {
                                data1.body.forEach( function(factorInfo) {
                                    factorInfo.factorid = parseInt(factorInfo.factorid);
                                    factorInfo.factortype = parseInt(factorInfo.factortype);
                                    factorInfo.returns = [];
                                    if (factorInfo.factortype === 1) {
                                        FactorProfitComponent.self.alphaFactorInfoArray.push(factorInfo);
                                    } else if (factorInfo.factortype === 2) {
                                        FactorProfitComponent.self.riskFactorInfoArray.push(factorInfo);
                                    }
                                });
                                // console.log("riskFactorInfoArray, alphaFactorInfoArray",data1.body, FactorProfitComponent.self.riskFactorInfoArray, FactorProfitComponent.self.alphaFactorInfoArray);
                            } else {
                                alert("Get getFactorInfo Failed! " + data1.msret.msg);
                            }
                        }
                        break;
                    case "getRiskFactorReturnAns":
                        this.getRiskFactorReturnString += msg.content.body;
                        if (msg.content.head.pkgIdx === (msg.content.head.pkgCnt - 1)) {
                            let data2 = JSON.parse(this.getRiskFactorReturnString);
                            if (data2.msret.msgcode === "00") {
                                let i = 0 , j = 0;
                                for (; i < FactorProfitComponent.self.riskFactorInfoArray.length; i++) {
                                    for (; j < data2.body.length; j++) {
                                        if (FactorProfitComponent.self.riskFactorInfoArray[i].factorid == data2.body[j].factorid ) {
                                            data2.body[j].factor_returns = parseFloat(data2.body[j].factor_returns);
                                            FactorProfitComponent.self.riskFactorInfoArray[i].returns.push(data2.body[j]) ;
                                        } else if (FactorProfitComponent.self.riskFactorInfoArray[i].factorid > data2.body[j].factorid) {
                                            continue;
                                        } else {
                                            break;
                                        }
                                    }
                                }
                                this.setRiskFactorReturnEchart(this.riskFactorInfoArray);
                            } else {
                                alert("Get getRiskFactorReturn Failed! " + data2.msret.msg);
                            }
                        }
                        break;
                    default:

                }
            }
        });
        this.tradePoint.send(260, 251, {head:{realActor:"getFactorInfo"}, body: {} });
        this.tradePoint.send(260, 251, {head:{realActor:"getRiskFactorReturn"}, body: {} });


        this.riskFactorReturnEchart = echarts.init(document.getElementById("riskFactorReturnEchart") as HTMLDivElement);
        this.everyDayReturnEchart = echarts.init(document.getElementById("everyDayReturnEchart") as HTMLDivElement);
        this.everyDayYearReturnEchart = echarts.init(document.getElementById("everyDayYearReturnEchart") as HTMLDivElement);
        this.lastDayYearReturnEchart = echarts.init(document.getElementById("lastDayYearReturnEchart") as HTMLDivElement);

        window.onresize = () => {
            this.resizeFunction();
        };
    }

    // 界面变化时,重置而echart的大小
    resizeFunction() {
        this.riskFactorReturnEchart.resize();
        this.everyDayReturnEchart.resize();
        this.everyDayYearReturnEchart.resize();
        this.lastDayYearReturnEchart.resize();
    }

    /* 二分查看法
    * arr表示要查找的数组,source表示要查找的目标,member表示要在数组中对比的具体的属性,start,end表示查找范围[start,end],包括end
    */
    binarySearchStock(arr, source, member, start = 0, end = arr.length - 1) {

        let mid = -1;

        while (start <= end) {
            mid = Math.floor((start + end) / 2);

            if (arr[mid][member] < source) {
                start = mid + 1;
            } else if (arr[mid][member] > source) {
                end = mid - 1;
            } else {
                return mid;
            }
        }
        return -1;
    }

    // 设置收益的两个图表
    setRiskFactorReturnEchart(riskFactorInfoArray) {
        console.log(this.riskFactorInfoArray);

        if (riskFactorInfoArray.length === 0 || riskFactorInfoArray[0].returns.length === 0) {
            console.log("风险因子收益没有数据,请检查重试!");
            return;
        }
        let startDateIndex = 0, endDateIndex = riskFactorInfoArray[0].returns.length - 1;

        this.setReturnEchart(riskFactorInfoArray, startDateIndex, endDateIndex, this.everyDayReturnEchart, this.riskFactorReturnEchart);

        // 初始化最近一年的数据
        let today = new Date(), rfrIndex = 0;
        let thisYearFirstDay = today.getFullYear() + "0101";

        for (let dateIndex = endDateIndex; dateIndex >= 0; --dateIndex) {

            if (riskFactorInfoArray[0].returns[dateIndex].trday < thisYearFirstDay) {
                rfrIndex = dateIndex + 1;
                break;
            }

        }

        if (rfrIndex > endDateIndex ) {
            alert("没有找到当年的收益数据");
            return;
        }

        this.setReturnEchart(riskFactorInfoArray, rfrIndex, endDateIndex, this.everyDayYearReturnEchart, this.lastDayYearReturnEchart);


    }

    // 设置收益的两个图表
    setReturnEchart(riskFactorInfoArray, startIndex, endIndex, lineChart, barChart) {
        let chartLegendData = [], xAxisDatas = [], series = [];    // 分别连续多天对应图例组件数组,x坐标数组,和具体每一条曲线的数据
        let allRiskReturnXAxis = [], allRiskReturnSeries = [];   // 统计总共的x坐标数组,和具体每一条曲线的数据

        for (let riskIndex = 0; riskIndex < riskFactorInfoArray.length; ++riskIndex) {    // 遍历每一个风险因子
            let lengendData = { name: riskFactorInfoArray[riskIndex].factorname }; // ,textStyle: { color: "#F3F3F5" }
            chartLegendData.push(lengendData);
            allRiskReturnXAxis.push(riskFactorInfoArray[riskIndex].factorname);  // 柱状图的x轴分类

            // 具体每一条曲线的数据
            let seriesData = { name: riskFactorInfoArray[riskIndex].factorname, type: "line", data: [] };
            let riskFactorAllDateReturn = 0;

            for (let i = startIndex; i <= endIndex; ++i) {
                riskFactorAllDateReturn += riskFactorInfoArray[riskIndex].returns[i].factor_returns;
                seriesData.data.push(riskFactorAllDateReturn);
            }

            series.push(seriesData);
            allRiskReturnSeries.push(riskFactorAllDateReturn);
        }

        // 设置x坐标日期数组
        for (let i = startIndex; i <= endIndex; ++i) {
            xAxisDatas.push(riskFactorInfoArray[0].returns[i].trday);
        }
        console.log(chartLegendData, allRiskReturnXAxis, series, allRiskReturnSeries, xAxisDatas);

        let option = {
            baseOption: {
                title: {
                    show: false,
                },
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "cross",
                        label: { show: true, backgroundColor: "rgba(0,0,0,1)" }
                    },
                    textStyle: {
                        align: "left"
                    }
                },
                legend: {
                    data: chartLegendData,
                    textStyle: { color: "#F3F3F5" }
                },
                xAxis: [{
                    data: xAxisDatas,
                    axisLabel: {
                        textStyle: { color: "#F3F3F5" }
                    },
                    axisLine: {
                        lineStyle: { color: "#F3F3F5" }
                    }
                }],
                yAxis: [{
                    axisLabel: {
                        show: true,
                        textStyle: { color: "#F3F3F5" }
                    },
                    axisLine: {
                        lineStyle: { color: "#F3F3F5" }
                    },
                    scale: true,
                    boundaryGap: [0.2, 0.2]
                }],
                dataZoom: [{
                    type: "inside",
                    xAxisIndex: 0,
                    start: 0,
                    end: 100
                }, {
                    start: 0,
                    end: 10,
                    handleIcon: "M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
                    handleSize: "60%",
                    textStyle: {
                        color: "#FFF"
                    },
                    handleStyle: {
                        color: "#fff",
                        shadowBlur: 3,
                        shadowColor: "rgba(0, 0, 0, 0.6)",
                        shadowOffsetX: 2,
                        shadowOffsetY: 2
                    },
                    type: "inside"
                }],
                series: series,
                animationThreshold: 10000
                // color: [
                //     "#00b", "#0b0"
                // ]
            },
            media: this.defaultMedia

        };

        lineChart.setOption(option);


        let allDayOption = {
            baseOption: {
                title: {
                    show: false,
                },
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "cross",
                        label: { show: true, backgroundColor: "rgba(0,0,0,1)" }
                    }
                },
                legend: {
                    data: ["风险因子收益"],
                    textStyle: { color: "#F3F3F5" }
                },
                xAxis: {
                    data: allRiskReturnXAxis,
                    type: "category",
                    axisLabel: {
                        rotate: -30,
                        interval: 0,
                        textStyle: { color: "#F3F3F5" }
                    },
                    axisLine: {
                        lineStyle: { color: "#F3F3F5" }
                    },
                    axisTick: {
                        alignWithLabel: true
                    },
                    boundaryGap: true
                },
                yAxis: {

                    axisLabel: {
                        show: true,
                        textStyle: { color: "#F3F3F5" }
                    },
                    axisLine: {
                        lineStyle: { color: "#F3F3F5" }
                    },
                    scale: true,
                    boundaryGap: [0.2, 0.2]
                },
                // dataZoom: [{
                //   type: 'inside',
                //   xAxisIndex: 0 ,
                //   start: 0,
                //   end: 100
                // }, {
                //     start: 0,
                //     end: 10,
                //     show: false,
                //     handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                //     handleSize: '60%',
                //     textStyle: {
                //       color: "#FFF"
                //     }
                //     handleStyle: {
                //         color: '#fff',
                //         shadowBlur: 3,
                //         shadowColor: 'rgba(0, 0, 0, 0.6)',
                //         shadowOffsetX: 2,
                //         shadowOffsetY: 2
                //     }
                // }],
                series: [{
                    name: "风险因子收益",
                    type: "bar",
                    data: allRiskReturnSeries
                }
                ],
                // color: [
                //     "#00b", "#0b0"
                // ],
                backgroundColor: {
                    color: "blue"
                }
            },
            media: this.defaultMedia

        };

        barChart.setOption(allDayOption);
    }

    /**
     * disp
     */
    ngOnDestroy() {
        // TODO dispose resource.
        console.log("destroy");
    }
}



@Component({
    moduleId: module.id,
    selector: "rf-analysis",
    templateUrl: "rf-analysis.html",
    styleUrls: ["home.component.css", "riskfactor.component.css"],
    providers: [DatePipe],
    inputs: ["activeTab"]
})
export class FactorAnalysisComponent implements OnDestroy {
    activeTab: string;
    static self: any;
    static productStat: string;
    static strategyStat: string;
    static startdateStat: string;
    static enddateStat: string;
    static hedgeStat: string;
    static hedgeratioStat: number;
    static productsStat: string[];
    static strategiesStat: string[];
    static productIndex: number;
    static strategyIndex: number;
    rfrDateIndex: number = 0; // 保存风险因子收益日期的索引
    styleObj: any;
    dataSource: any;
    startdate: string;
    enddate: string;
    startDate: string;
    endDate: string;
    hedges: string[] = ["沪深300", "中证500", "上证50"];
    hedge: string = "沪深300";
    hedgeRadio: number;
    riskFactorExposureEchart: any;  // 最后选中天风险因子暴露柱状图
    everyDayRFEEchart: any;         // 每一天的风险因子的暴露折线图
    riskFactorReturnAttrEchart: any;  // 风险因子收益归因柱状图
    everyDayRFRAttrEchart: any;   // 每一天风险因子归因折线图
    stockAttrEchart: any;   // 股票归因柱状图
    defaultMedia: any;

    /* 当选择了期货对冲时,hadStockHold,hadFutureHold,hadNetData,必须全为true才能计算.
    *   没有选择时,hadFutureHold可以为false
    */
    hadStockHold: boolean = false;
    hadFutureHold: boolean = false;
    hadNetData: boolean = false;
    needFutures: boolean = false;
    productData: any[];
    strategyData: any[];
    iproducts: string[];
    iproduct: string;
    istrategys: string[] = ["选择所有策略"];
    istrategy: string;
    productfuturehold: string;
    productstockhold: string;
    strategyfuturehold: string;
    strategystockhold: string;
    netValueString: string;
    riskFactorReturnAttr: any[] = []; // 风险因子收益归因
    riskFactorReturn: any[] = [];
    riskFactorExposure: any[] = [];
    HedgeRatioData: any[] = [];
    getRiskFactorReturnString: string = "";

    /* 保存所有的股票持仓数组
    * 每一个数组元素为对象,对象包含一下元素
    * stockCode,stockWeight,stockExposure,returnAttr --保存股票在每一个风险因子下的归因,allRiskFactorReturnAttr--单个股票在所有风险因子下的归因,
    * 这是一个初始化实例  let obj = {stockCode: currentValue.marketcode.toUpperCase(), stockWeight: currentValue.cost_rate, stockExposure:[], returnAttr:[], allRiskFactorReturnAttr:0};
    */
    groupPosition: any[] = [];
    futurePosition: any[] = [];
    netTableValue: any[] = [];
    dataDir: string; // added by cl
    // this.groupPosition = [ {stockCode:'000001.SZ',stockWeight:0.1}, {stockCode:'000002.SZ', stockWeight:0.6 } ];  // 重新获取组合持仓
    // groupPosition: any[] = [{stockDate:"20170704",stockHold: [{ stockCode: "000001.SZ", stockWeight: 0.1 }, { stockCode: "000002.SZ", stockWeight: 0.6 }]},
    //                        {stockDate:"20170705",stockHold: [{ stockCode: "000001.SZ", stockWeight: 0.1 }, { stockCode: "000002.SZ", stockWeight: 0.6 }]} ];

    riskFactorInfoArray: any[] = [];

    constructor(private tradePoint: TradeService, private appsrv: AppStoreService, private datePipe: DatePipe) {
        FactorAnalysisComponent.self = this;
        // this.loadData();
        this.iproducts = [];
        this.productfuturehold = "";
        this.productstockhold = "";
        this.strategyfuturehold = "";
        this.strategystockhold = "";

    }

    ngOnInit() {
        this.dataDir = this.appsrv.getSetting().riskDataDir ? this.appsrv.getSetting().riskDataDir : "/mnt/dropbox/risk";
        console.info(this.activeTab, this.dataDir);

        this.defaultMedia = [{
            option: {
                grid: {
                    left: "10%",
                    right: "10%"
                }
            }
        }, {
            query: {
                maxWidth: 650
            },
            option: {
                grid: {
                    left: 65,
                    right: 65
                }
            }
        }];

        let date1 = new Date().setMonth((new Date().getMonth() - 3));
        let date2 = new Date();
        this.startdate = this.datePipe.transform(date1, "yyyy-MM-dd");
        this.enddate = this.datePipe.transform(date2, "yyyy-MM-dd");
        this.startDate = this.startdate.replace(/-/g, "");
        this.endDate = this.enddate.replace(/-/g, "");
        this.hedgeRadio = 1;

        // receive holdlist
        // index strategies
        this.tradePoint.addSlot({
            appid: 260,
            packid: 251,
            callback: (msg) => {
                switch (msg.content.head.actor) {
                    case "getProductAns":
                        console.log("product",msg);
                        let data1 = JSON.parse(msg.content.body);
                        if (data1.msret.msgcode === "00") {
                            FactorAnalysisComponent.self.productData = data1.body;
                            console.log(FactorAnalysisComponent.self.productData);
                            console.log(FactorAnalysisComponent.self.productData[0].caname);
                            FactorAnalysisComponent.self.iproducts = [];
                            for (let i = 0; i < FactorAnalysisComponent.self.productData.length; i++) {
                                FactorAnalysisComponent.self.iproducts.push(FactorAnalysisComponent.self.productData[i].caname);
                            }
                        } else {
                            alert("Get product info Failed! " + data1.msret.msg);
                        }
                        FactorAnalysisComponent.self.iproduct = FactorAnalysisComponent.self.iproducts[0];
                        let tblockId = 0;
                        if (FactorAnalysisComponent.productIndex === undefined) {
                            tblockId = FactorAnalysisComponent.self.productData[0].caid;
                        } else {
                            tblockId = FactorAnalysisComponent.self.productData[FactorAnalysisComponent.productIndex].caid;
                        }
                        console.log(tblockId);
                        console.log(FactorAnalysisComponent.self.istrategys);
                        FactorAnalysisComponent.self.istrategy = FactorAnalysisComponent.self.istrategys[0];
                        this.tradePoint.send(260, 251, {head:{realActor:"getCombStrategy"}, body: {caid: tblockId} });
                        break;
                    case "getCombStrategyAns":
                        console.log("strategy",msg);
                        let data2 = JSON.parse(msg.content.body);
                        if (data2.msret.msgcode === "00") {
                            FactorAnalysisComponent.self.strategyData = data2.body;
                            for (let i = 0; i < FactorAnalysisComponent.self.strategyData.length; i++) {
                                FactorAnalysisComponent.self.istrategys.push(FactorAnalysisComponent.self.strategyData[i].trname);
                            }
                        } else {
                            alert("Get product info Failed! " + data2.msret.msg);
                        }

                        if (FactorAnalysisComponent.startdateStat !== undefined) {
                            console.log(FactorAnalysisComponent.startdateStat);
                            this.startdate = FactorAnalysisComponent.startdateStat;
                        }
                        if (FactorAnalysisComponent.enddateStat !== undefined) {
                            console.log(FactorAnalysisComponent.enddateStat);
                            this.enddate = FactorAnalysisComponent.enddateStat;
                        }
                        if (FactorAnalysisComponent.hedgeStat !== undefined) {
                            console.log(FactorAnalysisComponent.hedgeStat);
                            this.hedge = FactorAnalysisComponent.hedgeStat;
                        }
                        if (FactorAnalysisComponent.hedgeratioStat !== undefined) {
                            console.log(FactorAnalysisComponent.hedgeratioStat);
                            this.hedgeRadio = FactorAnalysisComponent.hedgeratioStat;
                        }
                        if (FactorAnalysisComponent.productsStat !== undefined) {
                            console.log(FactorAnalysisComponent.productsStat);
                            this.iproducts = FactorAnalysisComponent.productsStat;
                        }
                        if (FactorAnalysisComponent.strategiesStat !== undefined) {
                            console.log(FactorAnalysisComponent.strategiesStat);
                            this.istrategys = FactorAnalysisComponent.strategiesStat;
                        }
                        if (FactorAnalysisComponent.productStat !== undefined) {
                            console.log(FactorAnalysisComponent.productStat);
                            this.iproduct = FactorAnalysisComponent.productStat;
                        }
                        if (FactorAnalysisComponent.strategyStat !== undefined) {
                            console.log(FactorAnalysisComponent.strategyStat);
                            this.istrategy = FactorAnalysisComponent.strategyStat;
                        }

                        this.lookReturn();
                        break;
                    case "getFactorInfoAns":
                        let data3 = JSON.parse(msg.content.body);
                        if (data3.msret.msgcode === "00") {
                            data3.body.forEach( function(factorInfo) {
                                factorInfo.factorid = parseInt(factorInfo.factorid);
                                factorInfo.factortype = parseInt(factorInfo.factortype);
                                factorInfo.returns = [];
                                if (factorInfo.factortype === 1) {
                                    
                                } else if (factorInfo.factortype === 2) {
                                    FactorAnalysisComponent.self.riskFactorInfoArray.push(factorInfo);
                                }
                            });
                        } else {
                            alert("Get getFactorInfo Failed! " + data3.msret.msg);
                        }
                        break;
                    case "getRiskFactorReturnAns":
                        console.log(msg);
                        this.getRiskFactorReturnString += msg.content.body;
                        if (msg.content.head.pkgIdx === (msg.content.head.pkgCnt - 1)) {
                            let data4 = JSON.parse(this.getRiskFactorReturnString);
                            if (data4.msret.msgcode === "00") {
                                let i = 0 , j = 0;
                                for (; i < FactorAnalysisComponent.self.riskFactorInfoArray.length; i++) {
                                    for (; j < data4.body.length; j++) {
                                        if (FactorAnalysisComponent.self.riskFactorInfoArray[i].factorid == data4.body[j].factorid ) {
                                            data4.body[j].factor_returns = parseFloat(data4.body[j].factor_returns);
                                            FactorAnalysisComponent.self.riskFactorInfoArray[i].returns.push(data4.body[j]);
                                        } else if (FactorAnalysisComponent.self.riskFactorInfoArray[i].factorid > data4.body[j].factorid) {
                                            continue;
                                        } else {
                                            break;
                                        }
                                    }
                                }
                                this.readAndHandleRiskReturn();
                            } else {
                                alert("Get getRiskFactorReturn Failed! " + data4.msret.msg);
                            }
                        }
                        break;                          
                    default:

                }
            }
        });

        this.tradePoint.send(260, 251, {head:{realActor:"getFactorInfo"}, body: {} });
        this.getRiskFactorReturnString = "";
        this.tradePoint.send(260, 251, {head:{realActor:"getRiskFactorReturn"}, body: {begin_date: this.startDate, end_date: this.endDate} });
        this.tradePoint.send(260, 251, {head:{realActor:"getProduct"}, body: {} });

        this.riskFactorExposureEchart = echarts.init(document.getElementById("riskFactorExposureEchart") as HTMLDivElement);
        this.everyDayRFEEchart = echarts.init(document.getElementById("everyDayRFEEchart") as HTMLDivElement);
        this.riskFactorReturnAttrEchart = echarts.init(document.getElementById("riskFactorReturnAttrEchart") as HTMLDivElement);
        this.everyDayRFRAttrEchart = echarts.init(document.getElementById("everyDayRFRAttrEchart") as HTMLDivElement);
        this.stockAttrEchart = echarts.init(document.getElementById("stockAttrEchart") as HTMLDivElement);

        window.onresize = () => {
            this.resizeFunction();
        };
    }

    registerListener() {
        this.tradePoint.addSlot({
            appid: 260,
            packid: 251,
            callback: (msg) => {
                switch (msg.content.head.actor) {
                    case "getProductNetAns":
                        console.log("NetTableValue", msg);
                        this.netValueString += msg.content.body;

                        if (msg.content.head.pkgIdx === (msg.content.head.pkgCnt - 1)) {
                            msg.content.body = this.netValueString;
                            this.hadNetData = true;
                            if (msg.content.msret.msgcode !== "00") {
                                alert("获取净值数据失败：" + msg.content.msret.msg);
                                return;
                            }

                            let netTableValue = JSON.parse(msg.content.body);
                            if (netTableValue.msret.msgcode === "00") {
                                this.netTableValue = netTableValue.body;

                                this.netTableValue.forEach((currentValue, index, array) => {
                                    let netvalue = parseFloat(currentValue.netvalue);
                                    if (isNaN(netvalue)) {
                                        currentValue.netvalue = 0;
                                    } else {
                                        currentValue.netvalue = netvalue;
                                    }
                                });
                                // console.log(this.hadNetData, this.hadStockHold, (!this.needFutures || this.needFutures && this.hadFutureHold), this.hadNetData && this.hadStockHold && (!this.needFutures || this.needFutures && this.hadFutureHold));
                                if (this.hadNetData && this.hadStockHold && (!this.needFutures || this.needFutures && this.hadFutureHold)) {
                                    this.beginCalculateRiskFactor();
                                }

                            } else {
                                alert("获取净值数据失败：" + netTableValue.msret.msg);
                            }
                        }
                        break;

                    case "getStrategyFuturesHoldWeightAns": 
                        console.log("strategyfuturehold", msg);
                        this.strategyfuturehold += msg.content.body;
                        if (msg.content.head.pkgIdx === (msg.content.head.pkgCnt - 1)) {
                            msg.content.body = this.strategyfuturehold;
                            // console.log(this.strategyfuturehold);
                            // console.log("strategyfuturehold", msg);
                            this.hadFutureHold = true;

                            if (msg.content.msret.msgcode !== "00") {
                                alert("获取策略期货持仓失败：" + msg.content.msret.msg);
                                return;
                            }

                            let strategyFutureHold = JSON.parse(msg.content.body);

                            if (strategyFutureHold.msret.msgcode === "00") {
                                this.futurePosition = strategyFutureHold.body;
                                // console.log(this.hadNetData, this.hadStockHold, (!this.needFutures || this.needFutures && this.hadFutureHold), this.hadNetData && this.hadStockHold && (!this.needFutures || this.needFutures && this.hadFutureHold));

                                if (this.hadNetData && this.hadStockHold && (!this.needFutures || this.needFutures && this.hadFutureHold)) {
                                    this.beginCalculateRiskFactor();
                                }
                            } else {
                                alert("获取策略期货持仓失败：" + msg.content.msret.msg);
                            }
                        }
                        break;

                    case "getStrategyStockHoldWeightAns":
                        console.log("strategystockhold", msg);
                        this.strategystockhold += msg.content.body;
                        if (msg.content.head.pkgIdx === (msg.content.head.pkgCnt - 1)) {
                            msg.content.body = this.strategystockhold;

                            // console.log("strategystockhold", msg);
                            this.hadStockHold = true;

                            if (msg.content.msret.msgcode !== "00") {
                                alert("获取策略股票持仓失败：" + msg.content.msret.msg);
                                return;
                            }

                            let strategystockhold = JSON.parse(msg.content.body);

                            if (strategystockhold.msret.msgcode === "00") {
                                this.getGroupPosition(strategystockhold.body);
                                // console.log(this.hadNetData, this.hadStockHold, (!this.needFutures || this.needFutures && this.hadFutureHold), this.hadNetData && this.hadStockHold && (!this.needFutures || this.needFutures && this.hadFutureHold));
                                if (this.hadNetData && this.hadStockHold && (!this.needFutures || this.needFutures && this.hadFutureHold)) {

                                    this.beginCalculateRiskFactor();
                                }
                            } else {
                                alert("获取策略股票持仓失败：" + strategystockhold.msret.msg);
                            }
                            // console.log("strategystockhold", strategystockhold, this.groupPosition);
                        }
                        break;

                    case "getProductFuturesHoldWeightAns":
                        console.log("productfuture",msg);
                        this.productfuturehold += msg.content.body;
                        if (msg.content.head.pkgIdx === (msg.content.head.pkgCnt - 1)) {
                            msg.content.body = this.productfuturehold;

                            this.hadFutureHold = true;
                            if (msg.content.msret.msgcode !== "00") {
                                alert("获取产品期货持仓失败：" + msg.content.msret.msg);
                                return;
                            }
                            let productFutureHold = JSON.parse(msg.content.body);
                            if (productFutureHold.msret.msgcode === "00") {
                                this.futurePosition = productFutureHold.body;
                                // console.log(this.hadNetData, this.hadStockHold, (!this.needFutures || this.needFutures && this.hadFutureHold), this.hadNetData && this.hadStockHold && (!this.needFutures || this.needFutures && this.hadFutureHold));
                                if (this.hadNetData && this.hadStockHold && (!this.needFutures || this.needFutures && this.hadFutureHold)) {
                                    this.beginCalculateRiskFactor();
                                }
                            } else {
                                alert("获取产品期货持仓失败：" + productFutureHold.msret.msg);
                            }
                            // console.log("productFutureHold", productFutureHold, this.groupPosition);
                        }
                        break;

                    case "getProductStockHoldWeightAns":
                        console.log("productstockhold",msg);
                        this.productstockhold += msg.content.body;
                        if (msg.content.head.pkgIdx === (msg.content.head.pkgCnt - 1)) {
                            msg.content.body = this.productstockhold;

                            // console.log("productstockhold", msg);
                            this.hadStockHold = true;
                            if (msg.content.msret.msgcode !== "00") {
                                alert("获取产品股票持仓失败：" + msg.content.msret.msg);
                                return;
                            }
                            let productStockHold = JSON.parse(msg.content.body);
                            if (productStockHold.msret.msgcode === "00") {
                                this.getGroupPosition(productStockHold.body);
                                // console.log(this.hadNetData, this.hadStockHold, (!this.needFutures || this.needFutures && this.hadFutureHold), this.hadNetData && this.hadStockHold && (!this.needFutures || this.needFutures && this.hadFutureHold));
                                if (this.hadNetData && this.hadStockHold && (!this.needFutures || this.needFutures && this.hadFutureHold)) {
                                    this.beginCalculateRiskFactor();
                                }

                            } else {
                                alert("获取产品股票持仓失败：" + productStockHold.msret.msg);
                            }
                            // console.log("productStockHold", productStockHold, this.groupPosition);
                        }
                        break;

                    case "getFactorStockExposureAns":
                        console.log("expo", msg);
                        if (msg.content.head.pkgIdx === (msg.content.head.pkgCnt - 1)) {
                            console.log("the last msg");
                        }
                        break;    

                    default: 

                }
            }
        });
    }

    // 界面变化时,重置而echart的大小
    resizeFunction() {
        this.riskFactorExposureEchart.resize();
        this.everyDayRFEEchart.resize();
        this.riskFactorReturnAttrEchart.resize();
        this.everyDayRFRAttrEchart.resize();
        this.stockAttrEchart.resize();
    }


    nextDropdown() {
        // get strategies of this product
        FactorAnalysisComponent.self.istrategys = ["选择所有策略"];
        console.log(FactorAnalysisComponent.self.productData);
        let productlist = document.getElementById("product") as HTMLSelectElement;
        FactorAnalysisComponent.productIndex = productlist.selectedIndex;
        let tblockId = FactorAnalysisComponent.self.productData[FactorAnalysisComponent.productIndex].caid;
        console.log(FactorAnalysisComponent.productIndex);
        // strategies
        this.tradePoint.addSlot({
            appid: 260,
            packid: 251,
            callback: (msg) => {
                if (msg.content.head.actor === "getCombStrategyAns") {
                    console.log("strategy",msg);
                    let data = JSON.parse(msg.content.body);
                    if (data.msret.msgcode === "00") {
                        FactorAnalysisComponent.self.strategyData = data.body;
                        for (let i = 0; i < FactorAnalysisComponent.self.strategyData.length; i++) {
                            FactorAnalysisComponent.self.istrategys.push(FactorAnalysisComponent.self.strategyData[i].trname);
                        }
                    } else {
                        alert("Get product info Failed! " + data.msret.msg);
                    }
                }
            }
        });
        console.log(FactorAnalysisComponent.self.istrategys);
        FactorAnalysisComponent.self.istrategy = FactorAnalysisComponent.self.istrategys[0];
        this.tradePoint.send(260, 251, {head:{realActor:"getCombStrategy"}, body: {caid: tblockId} });
        FactorAnalysisComponent.strategyIndex = 0;
    }

    nextStrategyDropdown() {
        let strategylist = document.getElementById("strategy") as HTMLSelectElement;
        FactorAnalysisComponent.strategyIndex = strategylist.selectedIndex;
    }

    // 读取风险因子收益并格式化数据
    readAndHandleRiskReturn() {
        this.riskFactorReturn = this.readDataFromCsvFile(path.join(this.dataDir, "riskreturn.csv"));
        // 处理获取的风险因子收益数据
        if (this.riskFactorReturn.length < 2) {
            alert("风险因子收益没有数据,请导入数据后重试");
            return;
        }
        this.riskFactorReturn[0][1] = "贝塔(市场)风险";
        this.riskFactorReturn[0][2] = "账面价值比";
        this.riskFactorReturn[0][3] = "盈利";
        this.riskFactorReturn[0][4] = "成长性";
        this.riskFactorReturn[0][5] = "杠杆";
        this.riskFactorReturn[0][6] = "流动性";
        this.riskFactorReturn[0][7] = "动量";
        this.riskFactorReturn[0][8] = "残差波动率";
        this.riskFactorReturn[0][9] = "市值";
        this.riskFactorReturn[0][10] = "非线性市值";

        for (let i = 1; i < this.riskFactorReturn.length; ++i) {

            for (let j = 1; j < this.riskFactorReturn[0].length; ++j) {
                let value = parseFloat(this.riskFactorReturn[i][j]);

                if (isNaN(value)) {
                    this.riskFactorReturn[i][j] = 0;
                } else {
                    this.riskFactorReturn[i][j] = value;
                }

                // if (i>1) {
                //     this.riskFactorReturn[i][j] += this.riskFactorReturn[i-1][j];
                // }

            }
        }

        let startDateIndex = this.binarySearchStock(this.riskFactorReturn, this.startDate, this.rfrDateIndex, 1); // 查找指定日期的风险因子收益

        if (startDateIndex === -1) {
            startDateIndex = 1;

        }

        let endDateIndex = this.binarySearchStock(this.riskFactorReturn, this.endDate, this.rfrDateIndex, 1); // 查找指定日期的风险因子收益

        if (endDateIndex === -1) {
            endDateIndex = this.riskFactorReturn.length - 1;

        }
        console.log("this.endDate", this.endDate);
        console.log("handled riskFactorReturn", this.riskFactorReturn, this.riskFactorInfoArray);
    }

    // 读取股票暴露并格式化数据         ---注意 这里删除了第一列,也就是风险因子名称列,所有的风险因子名称和顺序都依赖与风险因子收益表
    readAndHandleRiskExposure(exposureFilePath) {
        this.riskFactorExposure = this.readDataFromCsvFile(exposureFilePath);

        if (this.riskFactorExposure.length < 2) {
            console.log("暴露数据为空，不能计算数据。");
            return;
        }
        this.riskFactorExposure.splice(0, 1); // 直接删除掉第一列,应该保证风险因子的顺序给的一致
        this.riskFactorExposure.sort(function (perv, next) {
            if (perv[1] > next[1]) {
                return 1;
            } else if (perv[1] < next[1]) {
                return -1;
            }
            else
                return 0;
        });

        for (let i = 0; i < this.riskFactorExposure.length; ++i) {

            for (let j = 2; j < this.riskFactorExposure[0].length; ++j) {
                let value = parseFloat(this.riskFactorExposure[i][j]);
                if (isNaN(value)) {
                    this.riskFactorExposure[i][j] = 0;
                } else {
                    this.riskFactorExposure[i][j] = value;
                }

            }

        }

    }

    // 读取对冲比率并格式化数据
    readAndHandleHedgeRatio(exposureFilePath) {
        this.HedgeRatioData = this.readDataFromCsvFile(exposureFilePath);
        this.HedgeRatioData.splice(0, 1);
        this.HedgeRatioData.sort(function (perv, next) {
            if (perv[1] > next[1]) {
                return 1;
            } else if (perv[1] < next[1]) {
                return -1;
            }
            else
                return 0;
        });
    }

    /*计算各种结果并绘图
    *成功返回true,否则返回false
    */
    calculateRiskFactor(riskFactorReturn, riskFactorExposure, groupPosition, sumOfDayExposure, currDate) {
        let oneDayExposure = [], oneDayReturnAttr = [];

        for (let i = 1; i < riskFactorReturn[0].length; ++i) {
            oneDayExposure.push({ name: riskFactorReturn[0][i], exposure: 0 });
        }

        // 权重与暴露之乘积
        for (let index = 0; index < groupPosition.length; ++index) {    // 遍历所有的持仓权重
            const singleStock = groupPosition[index];
            let rfeIndex = this.binarySearchStock(riskFactorExposure, singleStock.stockCode, 1, 0);

            if (rfeIndex === -1) {
                // alert("没有找到" + singleStock.stockCode + "的暴露,请补全信息!");

                // return false;
                for (let i = 2; i < riskFactorExposure[0].length; ++i) {   // 遍历指定暴露的风险因子的暴露
                    singleStock["stockExposure"][i - 2] = 0; // 这里有一个假设，假定所有数据都不会重复哦  //股票在每个风险因子下的暴露

                }
            }
            else {
                for (let i = 2; i < riskFactorExposure[rfeIndex].length; ++i) {   // 遍历指定暴露的风险因子的暴露
                    singleStock["stockExposure"][i - 2] = riskFactorExposure[rfeIndex][i] * singleStock.stockWeight; // 这里有一个假设，假定所有数据都不会重复哦  //股票在每个风险因子下的暴露

                }
            }

        }

        // 计算各个风险因子当天的总的暴露
        for (let i = 2; i < riskFactorExposure[0].length; i++) {    // 遍历风险因子的暴露

            for (let stockExpIndex = 0; stockExpIndex < groupPosition.length; ++stockExpIndex) {
                oneDayExposure[i - 2].exposure += groupPosition[stockExpIndex]["stockExposure"][i - 2];
            }

        }

        sumOfDayExposure.push(oneDayExposure);
        sumOfDayExposure[sumOfDayExposure.length - 1].date = currDate;

        let returnDateIndex = this.binarySearchStock(riskFactorReturn, currDate, this.rfrDateIndex, 1); // 查找指定日期的风险因子收益

        // if (returnDateIndex === -1) {
        //     alert("没有找到" + currDate + "的风险因子收益!");
        //     return false;
        // }

        // 计算单个股票在所有风险因子下暴露和风险因子的乘积--也就是收益归因
        this.sumOfStockFactorReturnAttr(groupPosition, riskFactorReturn, returnDateIndex);

        let dayOfAllAttr = 0;

        if (returnDateIndex === -1) {
            oneDayReturnAttr.push(0);
        } else {
            // 计算单个风险因子在所有股票下暴露和风险因子的乘积--也就是收益归因
            for (let i = 1; i < riskFactorReturn[returnDateIndex].length; ++i) {    // 循环风险因子收益

                let returnAttr = 0;
                // 计算对于组合的收益归因
                for (let stockIndex = 0; stockIndex < groupPosition.length; ++stockIndex) {   // 循环持仓股票的暴露
                    returnAttr += groupPosition[stockIndex]["returnAttr"][i - 1];
                    dayOfAllAttr += groupPosition[stockIndex]["returnAttr"][i - 1];
                }
                oneDayReturnAttr.push(returnAttr);
            }
        }


        let netIndex = this.binarySearchStock(this.netTableValue, currDate, "trday");
        // 计算残差
        if (netIndex !== -1) {
            oneDayReturnAttr.push(this.netTableValue[netIndex].netvalue - dayOfAllAttr);
        } else {
            oneDayReturnAttr.push(0);
        }

        this.riskFactorReturnAttr.push(oneDayReturnAttr);
        this.riskFactorReturnAttr[this.riskFactorReturnAttr.length - 1].date = currDate;

        return true;

    }

    // 同步读取csv数据文件
    readDataFromCsvFile(csvFilePath) {
        let resultData = [], fileContent = "";
        try {
            fileContent = fs.readFileSync(csvFilePath, "utf-8");

        } catch (err) {
            console.log("fileContent err", err);
        }

        let rowDatas = fileContent.split("\r");

        // 分割多行数据
        for (let i = 0; i < rowDatas.length; ++i) {
            if (rowDatas[i] !== "") {

                let splitData = rowDatas[i].split("\n");
                for (let j = 0; j < splitData.length; ++j) {
                    if (splitData[j] !== "") {
                        resultData.push(splitData[j].split(","));
                    }
                }
            }
        }

        return resultData;
    }

    /* 二分查看法
    * arr表示要查找的数组,source表示要查找的目标,member表示要在数组中对比的具体的属性,start,end表示查找范围[start,end],包括end
    */
    binarySearchStock(arr, source, member, start = 0, end = arr.length - 1) {

        let mid = -1;

        while (start <= end) {
            mid = Math.floor((start + end) / 2);

            if (arr[mid][member] < source) {
                start = mid + 1;
            } else if (arr[mid][member] > source) {
                end = mid - 1;
            } else {
                return mid;
            }
        }
        return -1;
    }

    // 点击搜索按钮后的操作
    lookReturn() {
        console.log(this.activeTab);
        this.startDate = this.startdate.replace(/-/g, "");
        this.endDate = this.enddate.replace(/-/g, "");

        let productlist = document.getElementById("product") as HTMLSelectElement;
        if (FactorAnalysisComponent.productIndex === undefined) {
            FactorAnalysisComponent.productIndex = productlist.selectedIndex;
        }
        console.log(this.iproduct);
        console.log(FactorAnalysisComponent.productIndex);
        if (FactorAnalysisComponent.productIndex === -1) {
            return;
        }
        let tblockId = 0;
        if (FactorAnalysisComponent.self.productData) {
        tblockId = FactorAnalysisComponent.self.productData[FactorAnalysisComponent.productIndex].caid;
        }

        if (!isNaN(this.hedgeRadio)) {
            this.getExposure();
            let strategylist = document.getElementById("strategy") as HTMLSelectElement;
            if (FactorAnalysisComponent.strategyIndex === undefined) {
                FactorAnalysisComponent.strategyIndex = strategylist.selectedIndex;
            }
            console.log(this.istrategy);
            console.log(FactorAnalysisComponent.strategyIndex);
            // setNetTableValue
            this.registerListener();

            if (FactorAnalysisComponent.strategyIndex > 0) {
                console.log(FactorAnalysisComponent.strategyIndex - 1);
                let strategyId = FactorAnalysisComponent.self.strategyData[FactorAnalysisComponent.strategyIndex - 1].trid;
                console.log(this.startDate, strategyId);
                console.log(this.startDate, tblockId);
                // strategyfuturehold
                // strategystockhold
                this.registerListener();

                this.strategyfuturehold = "";
                this.hadFutureHold = false;
                this.futurePosition = [];
                this.tradePoint.send(260, 251, { head:{realActor:"getStrategyFuturesHoldWeight"}, body: { begin_date: this.startDate, end_date: this.endDate, trid: strategyId } });

                this.strategystockhold = "";
                this.hadStockHold = false;
                this.groupPosition = [];
                this.tradePoint.send(260, 251, { head:{realActor:"getStrategyStockHoldWeight"}, body: {begin_date: this.startDate, end_date: this.endDate, trid: strategyId } });

                this.hadNetData = false;
                this.netTableValue = [];
                this.netValueString = "";
                this.tradePoint.send(260, 251, { head:{realActor:"getProductNet"}, body: { begin_date: this.startDate, end_date: this.endDate, caid: tblockId } });
                console.log("send setNetTableValue strategy", tblockId, this.startDate, this.endDate);
            } else {
                console.log(this.startDate, tblockId);
                // productfuturehold
                // productstockhold
                this.registerListener();

                this.productfuturehold = "";
                this.hadFutureHold = false;
                this.futurePosition = [];
                this.tradePoint.send(260, 251, { head:{realActor:"getProductFuturesHoldWeight"}, body: { begin_date: this.startDate, end_date: this.endDate, caid: tblockId } });

                this.productstockhold = "";
                this.hadStockHold = false;
                this.groupPosition = [];
                this.tradePoint.send(260, 251, { head:{realActor:"getProductStockHoldWeight"}, body: { begin_date: this.startDate, end_date: this.endDate, caid: tblockId } });

                this.hadNetData = false;
                this.netTableValue = [];
                this.netValueString = "";
                this.tradePoint.send(260, 251, { head:{realActor:"getProductNet"}, body: { begin_date: this.startDate, end_date: this.endDate, caid: tblockId } });
                console.log("send setNetTableValue", tblockId, this.startDate, this.endDate);
            }
        } else {
            alert("对冲比例必须为数字或空！");
        }
    }

    getExposure() {
        this.tradePoint.send(260, 251, { head:{realActor:"getFactorStockExposure"}, body: { begin_date: this.startDate, end_date: this.endDate } });
    }

    // 开始读取并计算数据
    beginCalculateRiskFactor() {
        // 计算对冲
        console.log(this.hedgeRadio);
        if (!this.hedgeRadio) {
            this.hedgeRadio = 0;
        }
        this.readAndHandleHedgeRatio(path.join(this.dataDir, "idxmbr", this.startDate + ".csv"));
        console.log(this.groupPosition);
        console.log(this.HedgeRatioData);
        switch (this.hedge) {
            case "沪深300":
                for (let i = 0; i < this.HedgeRatioData.length; i++) {
                    if (parseFloat(this.HedgeRatioData[i][2]) === 0) {
                        continue;
                    } else {
                        let IFflag = 0;
                        for (let j = 0; j < this.groupPosition.length; j++) {
                            if (this.groupPosition[j].stockCode === this.HedgeRatioData[i][1]) {
                                this.groupPosition[j].stockWeight -= parseFloat(this.HedgeRatioData[i][2]) * this.hedgeRadio;
                                IFflag++;
                                break;
                            }
                        }
                        if (IFflag === 0) {
                            let addIFObj = { stockCode: this.HedgeRatioData[i][1], stockWeight: -parseFloat(this.HedgeRatioData[i][2]), stockExposure: [], returnAttr: [], allRiskFactorReturnAttr: 0 };
                            for (let k = 0; k < this.groupPosition.length; k++) {
                                if (this.groupPosition[k].stockCode > this.HedgeRatioData[i][1]) {
                                    this.groupPosition.splice(k, 0, addIFObj);
                                    break;
                                }
                            }
                        }
                    }
                }

                break;

            case "中证500":
                for (let i = 0; i < this.HedgeRatioData.length; i++) {
                    if (parseFloat(this.HedgeRatioData[i][3]) === 0) {
                        continue;
                    } else {
                        let ICflag = 0;
                        for (let j = 0; j < this.groupPosition.length; j++) {
                            if (this.groupPosition[j].stockCode === this.HedgeRatioData[i][1]) {
                                this.groupPosition[j].stockWeight -= parseFloat(this.HedgeRatioData[i][3]) * this.hedgeRadio;
                                ICflag++;
                                break;
                            }
                        }
                        if (ICflag === 0) {
                            let addICObj = { stockCode: this.HedgeRatioData[i][1], stockWeight: -parseFloat(this.HedgeRatioData[i][3]), stockExposure: [], returnAttr: [], allRiskFactorReturnAttr: 0 };
                            for (let k = 0; k < this.groupPosition.length; k++) {
                                if (this.groupPosition[k].stockCode > this.HedgeRatioData[i][1]) {
                                    this.groupPosition.splice(k, 0, addICObj);
                                    break;
                                }
                            }
                        }
                    }
                }

                break;

            case "上证50":
                for (let i = 0; i < this.HedgeRatioData.length; i++) {
                    if (parseFloat(this.HedgeRatioData[i][4]) === 0) {
                        continue;
                    } else {
                        let IHflag = 0;
                        for (let j = 0; j < this.groupPosition.length; j++) {
                            if (this.groupPosition[j].stockCode === this.HedgeRatioData[i][1]) {
                                this.groupPosition[j].stockWeight -= parseFloat(this.HedgeRatioData[i][4]) * this.hedgeRadio;
                                IHflag++;
                                break;
                            }
                        }
                        if (IHflag === 0) {
                            let addIHObj = { stockCode: this.HedgeRatioData[i][1], stockWeight: -parseFloat(this.HedgeRatioData[i][4]), stockExposure: [], returnAttr: [], allRiskFactorReturnAttr: 0 };
                            for (let k = 0; k < this.groupPosition.length; k++) {
                                if (this.groupPosition[k].stockCode > this.HedgeRatioData[i][1]) {
                                    this.groupPosition.splice(k, 0, addIHObj);
                                    break;
                                }
                            }
                        }
                    }
                }

                break;
        }

        console.log(this.groupPosition);

        let exposureFile = [], dirFiles = [];
        let sumOfDayExposure = []; // 保存风险因子的权重与暴露之乘积的和
        this.riskFactorReturnAttr = [];

        try {
            dirFiles = fs.readdirSync(path.join(this.dataDir, "expo"));
        } catch (err) {
            console.log("err", err);
            return;
        }

        if (dirFiles.length === 0) {
            alert("您选择的路径内没有暴露文件,无法计算");
            return;
        }

        for (let fileIndex = 0; fileIndex < dirFiles.length; ++fileIndex) {   // csv文件在打开时可能还有其他的文件存在
            if ((this.startDate === "" && this.startDate === "")) {
                alert("请选择时间范围");

                return;
            }

            if (this.startDate !== "" && dirFiles[fileIndex] < (this.startDate + ".csv")) {
                continue;
            }

            if (this.endDate !== "" && dirFiles[fileIndex] > (this.endDate + ".csv")) {
                continue;
            }
            exposureFile.push(dirFiles[fileIndex]);
        }
        exposureFile.sort();
        console.log("exposureFile", exposureFile);

        for (let fileIndex = 0; fileIndex < exposureFile.length; ++fileIndex) {

            this.readAndHandleRiskExposure(path.join(this.dataDir, "expo", exposureFile[fileIndex]));
            let result = this.calculateRiskFactor(this.riskFactorReturn, this.riskFactorExposure, this.groupPosition, sumOfDayExposure, exposureFile[fileIndex].split(".")[0]);
            // if (!result) {
            //     return;
            // }
        }

        this.setriskFactorExposureEchart(sumOfDayExposure, this.groupPosition, this.riskFactorReturn);
        this.setRiskFactorAttrEchart(this.riskFactorReturnAttr, this.riskFactorReturn);
        this.setStockAttrEchart(this.groupPosition);
    }

    // 初始化组合的持仓数据
    getGroupPosition(stockHold) {

        stockHold.forEach((currentValue, index, array) => {
            let tmp = parseFloat(currentValue.cost_rate);
            currentValue.cost_rate = isNaN(tmp) ? 0 : tmp;
            let obj = { stockCode: currentValue.marketcode.toUpperCase(), stockWeight: currentValue.cost_rate, stockExposure: [], returnAttr: [], allRiskFactorReturnAttr: 0 };
            this.groupPosition.push(obj);


        });
        console.log("groupPosition", this.groupPosition);
    }

    // 计算单个股票在所有风险因子下暴露和风险因子的乘积--也就是收益归因
    sumOfStockFactorReturnAttr(holdStockExposure, riskFactorReturn, returnDateIndex) {
        for (let stockIndex = 0; stockIndex < holdStockExposure.length; ++stockIndex) {   // 循环持仓股票


            for (let i = 1; i < riskFactorReturn[0].length; ++i) {    // 循环风险因子收益

                if (typeof holdStockExposure[stockIndex]["returnAttr"][i - 1] === "undefined") {
                    holdStockExposure[stockIndex]["returnAttr"][i - 1] = 0;
                }

                if(returnDateIndex !== -1) {
                    holdStockExposure[stockIndex]["allRiskFactorReturnAttr"] += riskFactorReturn[returnDateIndex][i] * holdStockExposure[stockIndex]["stockExposure"][i - 1];   // 累加单个股票在所有收益因子下的收益归因
                    holdStockExposure[stockIndex]["returnAttr"][i - 1] += riskFactorReturn[returnDateIndex][i] * holdStockExposure[stockIndex]["stockExposure"][i - 1];   // 保存单个股票在各个收益因子下的收益归因
                }
            }

        }


    }

    // 设置收益的两个图表,有被复用
    setReturnEchart(riskFactorInfoArray, startIndex, endIndex, lineChart, barChart) {
        let chartLegendData = [], xAxisDatas = [], series = [];    // 分别连续多天对应图例组件数组,x坐标数组,和具体每一条曲线的数据
        let allRiskReturnXAxis = [], allRiskReturnSeries = [];   // 统计总共的x坐标数组,和具体每一条曲线的数据

        // for (let riskIndex = 1; riskIndex < riskFactorReturn[0].length; ++riskIndex) {    // 遍历每一个风险因子
        //     let lengendData = { name: riskFactorReturn[0][riskIndex] }; // ,textStyle: { color: "#F3F3F5" }
        //     chartLegendData.push(lengendData);
        //     allRiskReturnXAxis.push(riskFactorReturn[0][riskIndex]);  // 柱状图的x轴分类
        //
        //     // 具体每一条曲线的数据
        //     let seriesData = { name: riskFactorReturn[0][riskIndex], type: "line", data: [] };
        //     let riskFactorAllDateReturn = 0;
        //
        //     for (let i = startIndex; i <= endIndex; ++i) {
        //         riskFactorAllDateReturn += riskFactorReturn[i][riskIndex];
        //         seriesData.data.push(riskFactorAllDateReturn);
        //     }
        //
        //     series.push(seriesData);
        //     allRiskReturnSeries.push(riskFactorAllDateReturn);
        // }

        for (let riskIndex = 0; riskIndex < riskFactorInfoArray.length; ++riskIndex) {    // 遍历每一个风险因子
            let lengendData = { name: riskFactorInfoArray[riskIndex].factorname }; // ,textStyle: { color: "#F3F3F5" }
            chartLegendData.push(lengendData);
            allRiskReturnXAxis.push(riskFactorInfoArray[riskIndex].factorname);  // 柱状图的x轴分类

            // 具体每一条曲线的数据
            let seriesData = { name: riskFactorInfoArray[riskIndex].factorname, type: "line", data: [] };
            let riskFactorAllDateReturn = 0;

            for (let i = startIndex; i <= endIndex; ++i) {
                riskFactorAllDateReturn += riskFactorInfoArray[riskIndex].returns[i].factor_returns;
                seriesData.data.push(riskFactorAllDateReturn);
            }

            series.push(seriesData);
            allRiskReturnSeries.push(riskFactorAllDateReturn);
        }

        // 设置x坐标日期数组
        for (let i = startIndex; i <= endIndex; ++i) {
            xAxisDatas.push(riskFactorInfoArray[0].returns[i].trday);
        }
        console.log(chartLegendData, allRiskReturnXAxis, series, allRiskReturnSeries, xAxisDatas);

        let option = {
            baseOption: {
                title: {
                    show: false,
                },
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "cross",
                        label: { show: true, backgroundColor: "rgba(0,0,0,1)" }
                    },
                    textStyle: {
                        align: "left"
                    }
                },
                legend: {
                    data: chartLegendData,
                    textStyle: { color: "#F3F3F5" }
                },
                xAxis: [{
                    data: xAxisDatas,
                    axisLabel: {
                        textStyle: { color: "#F3F3F5" }
                    },
                    axisLine: {
                        lineStyle: { color: "#F3F3F5" }
                    }
                }],
                yAxis: [{
                    axisLabel: {
                        show: true,
                        textStyle: { color: "#F3F3F5" }
                    },
                    axisLine: {
                        lineStyle: { color: "#F3F3F5" }
                    },
                    scale: true,
                    boundaryGap: [0.2, 0.2]
                }],
                dataZoom: [{
                    type: "inside",
                    xAxisIndex: 0,
                    start: 0,
                    end: 100
                }, {
                    start: 0,
                    end: 10,
                    handleIcon: "M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
                    handleSize: "60%",
                    textStyle: {
                        color: "#FFF"
                    },
                    handleStyle: {
                        color: "#fff",
                        shadowBlur: 3,
                        shadowColor: "rgba(0, 0, 0, 0.6)",
                        shadowOffsetX: 2,
                        shadowOffsetY: 2
                    },
                    type: "inside"
                }],
                series: series,
                animationThreshold: 10000
                // color: [
                //     "#00b", "#0b0"
                // ]
            },
            media: this.defaultMedia

        };

        lineChart.setOption(option);


        let allDayOption = {
            baseOption: {
                title: {
                    show: false,
                },
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "cross",
                        label: { show: true, backgroundColor: "rgba(0,0,0,1)" }
                    }
                },
                legend: {
                    data: ["风险因子收益"],
                    textStyle: { color: "#F3F3F5" }
                },
                xAxis: {
                    data: allRiskReturnXAxis,
                    type: "category",
                    axisLabel: {
                        rotate: -30,
                        interval: 0,
                        textStyle: { color: "#F3F3F5" }
                    },
                    axisLine: {
                        lineStyle: { color: "#F3F3F5" }
                    },
                    axisTick: {
                        alignWithLabel: true
                    },
                    boundaryGap: true
                },
                yAxis: {

                    axisLabel: {
                        show: true,
                        textStyle: { color: "#F3F3F5" }
                    },
                    axisLine: {
                        lineStyle: { color: "#F3F3F5" }
                    },
                    scale: true,
                    boundaryGap: [0.2, 0.2]
                },
                // dataZoom: [{
                //   type: 'inside',
                //   xAxisIndex: 0 ,
                //   start: 0,
                //   end: 100
                // }, {
                //     start: 0,
                //     end: 10,
                //     show: false,
                //     handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                //     handleSize: '60%',
                //     textStyle: {
                //       color: "#FFF"
                //     }
                //     handleStyle: {
                //         color: '#fff',
                //         shadowBlur: 3,
                //         shadowColor: 'rgba(0, 0, 0, 0.6)',
                //         shadowOffsetX: 2,
                //         shadowOffsetY: 2
                //     }
                // }],
                series: [{
                    name: "风险因子收益",
                    type: "bar",
                    data: allRiskReturnSeries
                }
                ],
                // color: [
                //     "#00b", "#0b0"
                // ],
                backgroundColor: {
                    color: "blue"
                }
            },
            media: this.defaultMedia

        };

        barChart.setOption(allDayOption);
    }

    // 设置风险因子暴露的两个图表
    setriskFactorExposureEchart(everyDayExposure, groupPosition, riskFactorReturn) {
        console.log(riskFactorReturn);

        let riskFactorExposureXAxis = [], riskFactorExposureSeries = [],
            chartLegendData = [], everydayExposureXAxis = [], everydayExposureSeries = [];

        // 初始化线图坐标系
        for (let i = 0; i < everyDayExposure.length; i++) {
            everydayExposureXAxis.push(everyDayExposure[i].date);
        }

        for (let riskIndex = 1; riskIndex < riskFactorReturn[0].length; ++riskIndex) {    // 遍历每一个风险因子

            let lengendData = { name: riskFactorReturn[0][riskIndex] }; // ,textStyle: { color: "#F3F3F5" }
            chartLegendData.push(lengendData);

            riskFactorExposureXAxis.push(riskFactorReturn[0][riskIndex]);  // 柱状图的x轴分类

            // 具体每一条曲线的数据
            let seriesData = { name: riskFactorReturn[0][riskIndex], type: "line", data: [] };

            for (let i = 0; i < everyDayExposure.length; i++) {
                seriesData.data.push(everyDayExposure[i][riskIndex - 1].exposure);
            }
            everydayExposureSeries.push(seriesData);
        }

        // 设置最后一天的数据为柱状图
        if (everyDayExposure.length > 1) {
            for (let i = 0; i < everyDayExposure[everyDayExposure.length - 1].length; i++) {
                riskFactorExposureSeries.push(everyDayExposure[everyDayExposure.length - 1][i].exposure);
            }
        }

        let everyDayRFEOption = {
            baseOption: {
                title: {
                    show: false,
                },
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "cross",
                        label: { show: true, backgroundColor: "rgba(0,0,0,1)" }
                    },
                    textStyle: {
                        align: "left"
                    }
                },
                legend: {
                    data: chartLegendData,
                    textStyle: { color: "#F3F3F5" }
                },
                xAxis: {
                    data: everydayExposureXAxis,
                    type: "category",
                    axisLabel: {
                        textStyle: { color: "#F3F3F5" }
                    },
                    axisLine: {
                        lineStyle: { color: "#F3F3F5" }
                    },
                    axisTick: {
                        alignWithLabel: true
                    }
                },
                yAxis: {

                    axisLabel: {
                        show: true,
                        textStyle: { color: "#F3F3F5" }
                    },
                    axisLine: {
                        lineStyle: { color: "#F3F3F5" }
                    },
                    scale: true,
                    boundaryGap: [0.2, 0.2]
                },
                dataZoom: [{
                    type: "inside",
                    xAxisIndex: 0,
                    start: 0,
                    end: 100
                }, {
                    start: 0,
                    end: 10,
                    // show: false,
                    handleIcon: "M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
                    handleSize: "60%",
                    textStyle: {
                        color: "#FFF"
                    },
                    handleStyle: {
                        color: "#fff",
                        shadowBlur: 3,
                        shadowColor: "rgba(0, 0, 0, 0.6)",
                        shadowOffsetX: 2,
                        shadowOffsetY: 2
                    },
                    type: "inside"
                }],
                series: everydayExposureSeries
                // color: [
                //     "#00b", "#0b0"
                // ]
            },
            media: this.defaultMedia

        };

        this.everyDayRFEEchart.setOption(everyDayRFEOption);


        let riskFactorExposureOption = {
            baseOption: {
                title: {
                    show: false,
                },
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "cross",
                        label: { show: true, backgroundColor: "rgba(0,0,0,1)" }
                    }
                },
                legend: {
                    data: ["风险因子暴露"],
                    textStyle: { color: "#F3F3F5" }
                },
                xAxis: {
                    data: riskFactorExposureXAxis,
                    type: "category",
                    axisLabel: {
                        rotate: -30,
                        interval: 0,
                        textStyle: { color: "#F3F3F5" }
                    },
                    axisLine: {
                        lineStyle: { color: "#F3F3F5" }
                    },
                    axisTick: {
                        alignWithLabel: true
                    },
                    boundaryGap: true
                },
                yAxis: {

                    axisLabel: {
                        show: true,
                        textStyle: { color: "#F3F3F5" }
                    },
                    axisLine: {
                        lineStyle: { color: "#F3F3F5" }
                    },
                    scale: true,
                    boundaryGap: [0.2, 0.2]
                },
                // dataZoom: [{
                // 	type: 'inside',
                // 	xAxisIndex: 0 ,
                // 	start: 0,
                // 	end: 100
                // }, {
                // 		start: 0,
                // 		end: 10,
                //     show: false,
                // 		handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                // 		handleSize: '60%',
                //     textStyle: {
                //       color: "#FFF"
                //     }
                // 		handleStyle: {
                // 				color: '#fff',
                // 				shadowBlur: 3,
                // 				shadowColor: 'rgba(0, 0, 0, 0.6)',
                // 				shadowOffsetX: 2,
                // 				shadowOffsetY: 2
                // 		}
                // }],
                series: [{
                    name: "风险因子暴露",
                    type: "bar",
                    data: riskFactorExposureSeries
                }
                ],
                // color: [
                //     "#00b", "#0b0"
                // ]
            },
            media: this.defaultMedia

        };

        this.riskFactorExposureEchart.setOption(riskFactorExposureOption);

    }

    setRiskFactorAttrEchart(everyDayRiskFactorAttr, riskFactorReturn) {
        let everyDayReturnAttrXAxis = [], everyDayReturnAttrSeries = [], chartLegendData = [];
        let riskFactorAttrXAxis = [], riskFactorAttrSeries = [];

        for (let i = 0; i < everyDayRiskFactorAttr.length; i++) {
            everyDayReturnAttrXAxis.push(everyDayRiskFactorAttr[i].date);
        }

        // 计算各种值
        for (let riskIndex = 1; riskIndex < riskFactorReturn[0].length; ++riskIndex) {    // 遍历每一个风险因子

            let lengendData = { name: riskFactorReturn[0][riskIndex] }; // ,textStyle: { color: "#F3F3F5" }
            chartLegendData.push(lengendData);

            riskFactorAttrXAxis.push(riskFactorReturn[0][riskIndex]);  // 柱状图的x轴分类

            // 具体每一条曲线的数据
            let seriesData = { name: riskFactorReturn[0][riskIndex], type: "line", data: [] };
            let allReturnAttr = 0;

            for (let i = 0; i < everyDayRiskFactorAttr.length; i++) {
                seriesData.data.push(everyDayRiskFactorAttr[i][riskIndex - 1]);
                allReturnAttr += everyDayRiskFactorAttr[i][riskIndex - 1];
            }

            riskFactorAttrSeries.push(allReturnAttr);
            everyDayReturnAttrSeries.push(seriesData);
        }

        let seriesData = { name: "残差", type: "line", data: [] };
        // chartLegendData.push(name: "残差"); // 加入残差
        // riskFactorAttrXAxis.push( "残差" );
        let allReturnAttr = 0;

        for (let i = 0; i < everyDayRiskFactorAttr.length; i++) {

            seriesData.data.push(everyDayRiskFactorAttr[i][everyDayRiskFactorAttr[0].length - 1]);
            allReturnAttr += everyDayRiskFactorAttr[i][everyDayRiskFactorAttr[0].length - 1];
        }

        // riskFactorAttrSeries.push(allReturnAttr);
        // everyDayReturnAttrSeries.push(seriesData);

        let everyDayRFROption = {
            baseOption: {
                title: {
                    show: false,
                },
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "cross",
                        label: { show: true, backgroundColor: "rgba(0,0,0,1)" }
                    },
                    textStyle: {
                        align: "left"
                    }
                },
                legend: {
                    data: chartLegendData,
                    textStyle: { color: "#F3F3F5" }
                },
                xAxis: {
                    data: everyDayReturnAttrXAxis,
                    type: "category",
                    axisLabel: {
                        textStyle: { color: "#F3F3F5" }
                    },
                    axisLine: {
                        lineStyle: { color: "#F3F3F5" }
                    },
                    axisTick: {
                        alignWithLabel: true
                    }
                },
                yAxis: {

                    axisLabel: {
                        show: true,
                        textStyle: { color: "#F3F3F5" }
                    },
                    axisLine: {
                        lineStyle: { color: "#F3F3F5" }
                    },
                    scale: true,
                    boundaryGap: [0.2, 0.2]
                },
                dataZoom: [{
                    type: "inside",
                    xAxisIndex: 0,
                    start: 0,
                    end: 100
                }, {
                    start: 0,
                    end: 10,
                    // show: false,
                    handleIcon: "M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
                    handleSize: "60%",
                    textStyle: {
                        color: "#FFF"
                    },
                    handleStyle: {
                        color: "#fff",
                        shadowBlur: 3,
                        shadowColor: "rgba(0, 0, 0, 0.6)",
                        shadowOffsetX: 2,
                        shadowOffsetY: 2
                    },
                    type: "inside"
                }],
                series: everyDayReturnAttrSeries
                // color: [
                //     "#00b", "#0b0"
                // ]
            },
            media: this.defaultMedia

        };

        this.everyDayRFRAttrEchart.setOption(everyDayRFROption);



        let riskFactorAttrOption = {
            baseOption: {
                title: {
                    show: false,
                },
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "cross",
                        label: { show: true, backgroundColor: "rgba(0,0,0,1)" }
                    }
                },
                legend: {
                    data: ["风险因子归因"],
                    textStyle: { color: "#F3F3F5" }
                },
                xAxis: {
                    data: riskFactorAttrXAxis,
                    type: "category",
                    axisLabel: {
                        rotate: -30,
                        interval: 0,
                        textStyle: { color: "#F3F3F5" }
                    },
                    axisLine: {
                        lineStyle: { color: "#F3F3F5" }
                    },
                    axisTick: {
                        alignWithLabel: true
                    },
                    boundaryGap: true
                },
                yAxis: {
                    axisLabel: {
                        show: true,
                        textStyle: { color: "#F3F3F5" }
                    },
                    axisLine: {
                        lineStyle: { color: "#F3F3F5" }
                    },
                    scale: true,
                    boundaryGap: [0.2, 0.2]
                },
                // dataZoom: [{
                //   type: 'inside',
                //   xAxisIndex: 0 ,
                //   start: 0,
                //   end: 100
                // }, {
                //     start: 0,
                //     end: 10,
                //     show: false,
                //     handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                //     handleSize: '60%',
                //     textStyle: {
                //       color: "#FFF"
                //     }
                //     handleStyle: {
                //         color: '#fff',
                //         shadowBlur: 3,
                //         shadowColor: 'rgba(0, 0, 0, 0.6)',
                //         shadowOffsetX: 2,
                //         shadowOffsetY: 2
                //     }
                // }],
                series: [{
                    name: "风险因子归因",
                    type: "bar",
                    data: riskFactorAttrSeries
                }
                ],
                // color: [
                //     "#00b", "#0b0"
                // ]
            },
            media: this.defaultMedia

        };

        this.riskFactorReturnAttrEchart.setOption(riskFactorAttrOption);
    }

    setStockAttrEchart(groupPosition) {
        let stockAttrXAxis = [], stockAttrSeries = [];

        for (let i = 0; i < groupPosition.length; i++) {
            stockAttrXAxis.push(groupPosition[i].stockCode);
            stockAttrSeries.push(groupPosition[i].allRiskFactorReturnAttr);
        }

        let stockAttrEchart = {
            baseOption: {
                title: {
                    show: false,
                },
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "cross",
                        label: { show: true, backgroundColor: "rgba(0,0,0,1)" }
                    }
                },
                legend: {
                    data: ["股票归因"],
                    textStyle: { color: "#F3F3F5" }
                },
                xAxis: {
                    data: stockAttrXAxis,
                    type: "category",
                    axisLabel: {
                        // rotate: -30,
                        // interval: 0,
                        textStyle: { color: "#F3F3F5" }
                    },
                    axisLine: {
                        lineStyle: { color: "#F3F3F5" }
                    },
                    // axisTick: {
                    //     alignWithLabel:true
                    // },
                    // boundaryGap: true
                },
                yAxis: {

                    axisLabel: {
                        show: true,
                        textStyle: { color: "#F3F3F5" }
                    },
                    axisLine: {
                        lineStyle: { color: "#F3F3F5" }
                    },
                    scale: true,
                    boundaryGap: [0.2, 0.2]
                },
                dataZoom: [{
                    type: "inside",
                    xAxisIndex: 0,
                    start: 0,
                    end: 100
                }, {
                    start: 0,
                    end: 10,
                    // show: false,
                    handleIcon: "M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
                    handleSize: "60%",
                    textStyle: {
                        color: "#FFF"
                    },
                    handleStyle: {
                        color: "#fff",
                        shadowBlur: 3,
                        shadowColor: "rgba(0, 0, 0, 0.6)",
                        shadowOffsetX: 2,
                        shadowOffsetY: 2
                    },
                    type: "inside"
                }],
                series: [{
                    name: "股票归因",
                    type: "bar",
                    data: stockAttrSeries
                }
                ],
                // color: [
                //     "#00b", "#0b0"
                // ]
            },
            media: this.defaultMedia

        };

        this.stockAttrEchart.setOption(stockAttrEchart);
    }

    /**
     * disp
     */
    ngOnDestroy() {
        // TODO dispose resource.
        console.log("destroy");
        // 保存用户设置
        if (this.activeTab === "风险因子分析") {
            if (this.iproduct) {
                FactorAnalysisComponent.productStat = this.iproduct;
            }
            if (this.istrategy) {
                FactorAnalysisComponent.strategyStat = this.istrategy;
            }
            if (this.iproducts && this.iproducts !== []) {
                FactorAnalysisComponent.productsStat = this.iproducts;
            }
            if (this.istrategys && this.istrategys !== ["选择所有策略"]) {
                FactorAnalysisComponent.strategiesStat = this.istrategys;
            }
            if (this.startdate) {
                FactorAnalysisComponent.startdateStat = this.startdate;
            }
            if (this.enddate) {
                FactorAnalysisComponent.enddateStat = this.enddate;
            }
            if (this.hedge) {
                FactorAnalysisComponent.hedgeStat = this.hedge;
            }
            if (this.hedgeRadio) {
                FactorAnalysisComponent.hedgeratioStat = this.hedgeRadio;
            } else {
                FactorAnalysisComponent.hedgeratioStat = 0;
            }
        }
    }
}

@Component({
    moduleId: module.id,
    selector: "rf-alpha",
    templateUrl: "rf-alpha.html",
    styleUrls: ["home.component.css", "riskfactor.component.css"],
    providers: [DatePipe],
    inputs: ["activeTab"]
})
export class FactorAlphaComponent {
    activeTab: string;
    static self: any;
    static opendateStat: string;
    static closedateStat: string;
    rfrDateIndex: number = 0; // 保存风险因子收益日期的索引
    styleObj: any;
    dataSource: any;
    opendate: string;
    closedate: string;
    openDate: string;
    closeDate: string;
    alphaHotChart: any;
    alphaChart: any;
    defaultMedia: any;
    getAlphaFactorReturnString: string = "";
    getFactorCorrelationString: string = "";
    riskFactorInfoArray: any[] = [];
    alphaFactorInfoArray: any[] = [];
    alphaRelevance: any[] = []; // alpha相关性
    alphaRelevanceResult: any[] = []; // alpha相关性结果
    hotChartData: any[] = []; // 存放图标的data
    dataDir: string; 
    getFactorInfoString: string = "";

    constructor(private tradePoint: TradeService, private datePipe: DatePipe) {
        FactorAlphaComponent.self = this;
    }

    ngOnInit() {
        this.defaultMedia = [{
            option: {
                grid: {
                    left: "10%",
                    right: "10%"
                }
            }
        }, {
            query: {
                maxWidth: 650
            },
            option: {
                grid: {
                    left: 65,
                    right: 65
                }
            }
        }];
 
         // alpha
        this.alphaHotChart = echarts.init(document.getElementById("alphahotchart") as HTMLDivElement);
        this.alphaChart = echarts.init(document.getElementById("alphachart") as HTMLDivElement);

        let date1 = new Date().setMonth((new Date().getMonth() - 3));
        let date2 = new Date();
        this.opendate = this.datePipe.transform(date1, "yyyy-MM-dd");
        this.closedate = this.datePipe.transform(date2, "yyyy-MM-dd");
        if (FactorAlphaComponent.opendateStat !== undefined) {
            this.opendate = FactorAlphaComponent.opendateStat;
        }
        if (FactorAlphaComponent.closedateStat !== undefined) {
            this.closedate = FactorAlphaComponent.closedateStat;
        }

        this.tradePoint.addSlot({
            appid: 260,
            packid: 251,
            callback: (msg) => {
                console.log(msg);
                switch (msg.content.head.actor) {
                    case "getFactorInfoAns":
                        this.getFactorInfoString += msg.content.body;
                        if (msg.content.head.pkgIdx === (msg.content.head.pkgCnt - 1)) {
                            let data1 = JSON.parse(this.getFactorInfoString);
                            if (data1.msret.msgcode === "00") {
                                data1.body.forEach( function(factorInfo) {
                                    factorInfo.factorid = parseInt(factorInfo.factorid);
                                    factorInfo.factortype = parseInt(factorInfo.factortype);
                                    factorInfo.returns = [];
                                    if (factorInfo.factortype === 1) {
                                        FactorAlphaComponent.self.alphaFactorInfoArray.push(factorInfo);
                                    } else if (factorInfo.factortype === 2) {
                                        FactorAlphaComponent.self.riskFactorInfoArray.push(factorInfo);
                                    }
                                });
                                console.log(FactorAlphaComponent.self.alphaFactorInfoArray);
                                this.searchresult();
                            } else {
                                alert("Get getFactorInfo Failed! " + data1.msret.msg);
                            }
                        }
                        break;
                    default:
 
                }
            }
        });

        this.tradePoint.send(260, 251, {head:{realActor:"getFactorInfo"}, body: {} });

        window.onresize = () => {
            this.resizeFunction();
        };
    }

    // 界面变化时,重置而echart的大小
    resizeFunction() {
        this.alphaHotChart.resize();
        this.alphaChart.resize();
    }

    searchresult() {
        this.openDate = this.opendate.replace(/-/g, "");
        this.closeDate = this.closedate.replace(/-/g, "");

        this.tradePoint.addSlot({
            appid: 260,
            packid: 251,
            callback: (msg) => {
                switch (msg.content.head.actor) {
                    case "getAlphaFactorReturnAns":
                        this.getAlphaFactorReturnString += msg.content.body;
                        if (msg.content.head.pkgIdx === (msg.content.head.pkgCnt - 1)) {
                            let data2 = JSON.parse(this.getAlphaFactorReturnString);
                            if (data2.msret.msgcode === "00") {
                                let i = 0 , j = 0;
                                for (; i < FactorAlphaComponent.self.alphaFactorInfoArray.length; i++) {
                                    for (; j < data2.body.length; j++) {
                                        if (FactorAlphaComponent.self.alphaFactorInfoArray[i].factorid == data2.body[j].factorid ) {
                                            data2.body[j].factor_returns = parseFloat(data2.body[j].factor_returns);
                                            FactorAlphaComponent.self.alphaFactorInfoArray[i].returns.push(data2.body[j]) ;
                                        } else if (FactorAlphaComponent.self.alphaFactorInfoArray[i].factorid > data2.body[j].factorid) {
                                            continue;
                                        } else {
                                            break;
                                        }
                                    }
                                }
                                this.setRiskFactorReturnEchart(this.alphaFactorInfoArray);
                            } else {
                                alert("Get getAlphaFactorReturn Failed! " + data2.msret.msg);
                            }
                        }
                        break;
                    case "getFactorCorrelationAns":
                        this.getFactorCorrelationString += msg.content.body;
                        if (msg.content.head.pkgIdx === (msg.content.head.pkgCnt - 1)) {
                            let data1 = JSON.parse(this.getFactorCorrelationString);
                            if (data1.msret.msgcode === "00") {
                                console.log(data1.body);
                                data1.body.forEach((item) => {
                                    let relevanceArr = [parseInt(item.factorid1) - 1, parseInt(item.factorid2) - 1, parseFloat(item.value)];
                                    this.alphaRelevance.push(relevanceArr);
                                });
                                console.log(this.alphaRelevance);
                                this.averageValue(this.alphaRelevance);
                            } else {
                                alert("Get getFactorCorrelation Failed! " + data1.msret.msg);
                            }
                        }
                        break;
                    default:

                }
            }
        });

        this.getAlphaFactorReturnString = "";
        FactorAlphaComponent.self.alphaFactorInfoArray.forEach((item) => {
            item.returns = [];
        });
        this.tradePoint.send(260, 251, {head:{realActor:"getAlphaFactorReturn"}, body: { begin_date: this.openDate, end_date: this.closeDate } });

        this.getFactorCorrelationString = "";
        this.alphaRelevance = [];
        this.hotChartData = [];
        this.tradePoint.send(260, 251, {head:{realActor:"getFactorCorrelation"}, body: { begin_date: this.openDate, end_date: this.closeDate } });

    }

    // 计算平均值
    averageValue(arr) {
        let id1 = 1, id2 = 0, flag = 0;
        for (let i = 0; i < arr.length; ++i) {
            if (arr[i][0] === id1 && arr[i][1] === id2){
                flag++;
                id1 = arr[i][0];
                id2 = arr[i][1];
            } else {
                break;
            }
        }
        console.log(flag);
        let result = [];
        for (let i = 0; i < arr.length; i += flag) {
            result.push(arr.slice(i, i + flag));
        }
        for (let j = 0; j < result.length; ++j) {
            let sum = 0, average = 0;
            for (let k = 0; k < result[j].length; ++k) {
                sum += parseFloat(result[j][k][2]);
            }
            console.log(sum);
            average = parseFloat((sum / result[j].length).toFixed(4));
            result[j][0][2] = average;
            result[j][1][0] = result[j][0][1];
            result[j][1][1] = result[j][0][0];
            result[j][1][2] = result[j][0][2];
            this.hotChartData.push(result[j][0], result[j][1]);
        }
        for (let index = 0; index < this.alphaFactorInfoArray.length; ++index) {
            let arr = [index, index, 1];
            this.hotChartData.push(arr);
        }
        console.log(this.hotChartData);
        this.setAlphaHotEchart();
    }

    // 设置alpha因子展示
    setRiskFactorReturnEchart(alphaFactorInfoArray) {
        console.log(this.alphaFactorInfoArray);

        if (alphaFactorInfoArray.length === 0 || alphaFactorInfoArray[0].returns.length === 0) {
            console.log("alpha因子收益没有数据,请检查重试!");
            return;
        }
        let startDateIndex = 0, endDateIndex = alphaFactorInfoArray[0].returns.length - 1;

        this.setAlphaEchart(alphaFactorInfoArray, startDateIndex, endDateIndex, this.alphaChart);
    }

        
    setAlphaEchart(alphaFactorInfoArray, startIndex, endIndex, lineChart) {
        let chartLegendData = [], xAxisDatas = [], series = [];    // 分别连续多天对应图例组件数组,x坐标数组,和具体每一条曲线的数据
        let allRiskReturnXAxis = [], allRiskReturnSeries = [];   // 统计总共的x坐标数组,和具体每一条曲线的数据

        for (let riskIndex = 0; riskIndex < alphaFactorInfoArray.length; ++riskIndex) {    // 遍历每一个风险因子
            let lengendData = { name: alphaFactorInfoArray[riskIndex].factorname }; // ,textStyle: { color: "#F3F3F5" }
            chartLegendData.push(lengendData);
            allRiskReturnXAxis.push(alphaFactorInfoArray[riskIndex].factorname);  // 柱状图的x轴分类

            // 具体每一条曲线的数据
            let seriesData = { name: alphaFactorInfoArray[riskIndex].factorname, type: "line", data: [] };
            let riskFactorAllDateReturn = 0;

            for (let i = startIndex; i <= endIndex; ++i) {
                riskFactorAllDateReturn += alphaFactorInfoArray[riskIndex].returns[i].factor_returns;
                seriesData.data.push(riskFactorAllDateReturn);
            }

            series.push(seriesData);
            allRiskReturnSeries.push(riskFactorAllDateReturn);
        }

        // 设置x坐标日期数组
        for (let i = startIndex; i <= endIndex; ++i) {
            xAxisDatas.push(alphaFactorInfoArray[0].returns[i].trday);
        }
        console.log(chartLegendData, allRiskReturnXAxis, series, allRiskReturnSeries, xAxisDatas);

        let option = {
            baseOption: {
                title: {
                    show: false,
                },
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "cross",
                        label: { show: true, backgroundColor: "rgba(0,0,0,1)" }
                    },
                    textStyle: {
                        align: "left"
                    }
                },
                legend: {
                    data: chartLegendData,
                    textStyle: { color: "#F3F3F5" }
                },
                xAxis: [{
                    data: xAxisDatas,
                    axisLabel: {
                        textStyle: { color: "#F3F3F5" }
                    },
                    axisLine: {
                        lineStyle: { color: "#F3F3F5" }
                    }
                }],
                yAxis: [{
                    axisLabel: {
                        show: true,
                        textStyle: { color: "#F3F3F5" }
                    },
                    axisLine: {
                        lineStyle: { color: "#F3F3F5" }
                    },
                    scale: true,
                    boundaryGap: [0.2, 0.2]
                }],
                dataZoom: [{
                    type: "inside",
                    xAxisIndex: 0,
                    start: 0,
                    end: 100
                }, {
                    start: 0,
                    end: 10,
                    handleIcon: "M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
                    handleSize: "60%",
                    textStyle: {
                        color: "#FFF"
                    },
                    handleStyle: {
                        color: "#fff",
                        shadowBlur: 3,
                        shadowColor: "rgba(0, 0, 0, 0.6)",
                        shadowOffsetX: 2,
                        shadowOffsetY: 2
                    },
                    type: "inside"
                }],
                series: series,
                animationThreshold: 10000
                // color: [
                //     "#00b", "#0b0"
                // ]
            },
            media: this.defaultMedia

        };

        lineChart.setOption(option);
    }

    // 设置热力图
    setAlphaHotEchart() {
        let xdata = [];
        let ydata = [];
        for (let i = 0; i < this.alphaFactorInfoArray.length; ++i) {
            xdata.push(this.alphaFactorInfoArray[i].factorname);
        }
        ydata = xdata;
        console.log(xdata, ydata, this.hotChartData);
        this.hotChartData = this.hotChartData.map(function (item) {
            return [item[1], item[0], item[2] || "-"];
        });


        let option = {
            tooltip: {
                trigger: "item",
                position: "top",
                confine: true
            },
            animation: false,
            grid: {
                height: "80%",
                y: "11%"
            },
            xAxis: {
                type: "category",
                data: xdata,
                splitArea: {
                    show: true
                },
                axisLabel: {
                    textStyle: { color: "#F3F3F5" }
                },
                axisLine: {
                    lineStyle: { color: "#F3F3F5" }
                }
            },
            yAxis: {
                type: "category",
                data: ydata,
                splitArea: {
                    show: true
                },
                axisLabel: {
                    textStyle: { color: "#F3F3F5" }
                },
                axisLine: {
                    lineStyle: { color: "#F3F3F5" }
                }
            },
            visualMap: {
                min: -1,
                max: 1,
                calculable: true,
                orient: "horizontal",
                left: "center",
                top: "1%",
                textStyle: { color: "#F3F3F5" }
            },
            series: [{
                name: "alpha因子相关性",
                type: "heatmap",
                data: this.hotChartData,
                label: {
                    normal: {
                        show: true,
                        textStyle: {
                            color: "black"
                        }
                    }
                },
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowColor: "rgba(0,0,0,0.5)"
                    }
                }
            }]
        };
        this.alphaHotChart.setOption(option);
    }

    /**
     * disp
     */
    ngOnDestroy() {
        // TODO dispose resource.
        console.log("destroy");
        // 保存用户设置
        if (this.activeTab === "Alpha因子") {
            if (this.opendate) {
                FactorAlphaComponent.opendateStat = this.opendate;
            }
            if (this.closedate) {
                FactorAlphaComponent.closedateStat = this.closedate;
            }
        }
    }
}

@Component({
    moduleId: module.id,
    selector: "rf-aibrand",
    templateUrl: "rf-aibrand.html",
    styleUrls: ["home.component.css", "riskfactor.component.css"],
    providers: [DatePipe],
    inputs: ["activeTab"]
})
export class AIBrandComponent {
    constructor() {

    }

    ngOnInit() {

    }
}