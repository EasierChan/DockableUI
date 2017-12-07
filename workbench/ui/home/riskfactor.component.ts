"use strict";

import { Component, HostListener, OnDestroy } from "@angular/core";
import { File, path } from "../../../base/api/services/backend.service"; // File operator
import { QtpService } from "../../bll/services";
import { ServiceType } from "../../../base/api/model";
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

    constructor(private tradePoint: QtpService, private datePipe: DatePipe) {
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


        this.tradePoint.addSlotOfCMS("getFactorInfo", (body) => {
            let data = JSON.parse(body.toString());
            if (data.msret.msgcode === "00") {
                data.body.forEach(function (factorInfo) {
                    factorInfo.factorid = parseInt(factorInfo.factorid);
                    factorInfo.factortype = parseInt(factorInfo.factortype);
                    factorInfo.returns = [];
                    if (factorInfo.factortype === 1) {
                        FactorProfitComponent.self.alphaFactorInfoArray.push(factorInfo);
                    } else if (factorInfo.factortype === 2) {
                        FactorProfitComponent.self.riskFactorInfoArray.push(factorInfo);
                    }
                });
            } else {
                alert("Get getFactorInfo Failed! " + data.msret.msg);
            }
        }, this);

        this.tradePoint.addSlotOfCMS("getRiskFactorReturn", (body) => {
            let data = JSON.parse(body.toString());
            if (data.msret.msgcode === "00") {
                let i = 0, j = 0;
                for (; i < FactorProfitComponent.self.riskFactorInfoArray.length; i++) {
                    for (; j < data.body.length; j++) {
                        if (FactorProfitComponent.self.riskFactorInfoArray[i].factorid == data.body[j].factorid) {
                            data.body[j].factor_returns = parseFloat(data.body[j].factor_returns);
                            FactorProfitComponent.self.riskFactorInfoArray[i].returns.push(data.body[j]);
                        } else if (FactorProfitComponent.self.riskFactorInfoArray[i].factorid > data.body[j].factorid) {
                            continue;
                        } else {
                            break;
                        }
                    }
                }
                this.setRiskFactorReturnEchart(this.riskFactorInfoArray);
            } else {
                alert("Get getRiskFactorReturn Failed! " + data.msret.msg);
            }
        }, this);

        this.tradePoint.sendToCMS("getFactorInfo", JSON.stringify({ data: { body: {} } }));
        this.tradePoint.sendToCMS("getRiskFactorReturn", JSON.stringify({ data: { body: {} } }));

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

        if (rfrIndex > endDateIndex) {
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
                    textStyle: { color: "#717171" }
                },
                xAxis: [{
                    data: xAxisDatas,
                    axisLabel: {
                        textStyle: { color: "#717171" }
                    },
                    axisLine: {
                        lineStyle: { color: "#717171" }
                    }
                }],
                yAxis: [{
                    axisLabel: {
                        show: true,
                        textStyle: { color: "#717171" }
                    },
                    axisLine: {
                        lineStyle: { color: "#717171" }
                    },
                    scale: true,
                    splitLine: {
                        lineStyle: {
                            type: 'dashed',
                            color: 'rgb(56, 63, 84)'
                        }
                    }
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
                    textStyle: { color: "#717171" }
                },
                xAxis: {
                    data: allRiskReturnXAxis,
                    type: "category",
                    axisLabel: {
                        rotate: -30,
                        interval: 0,
                        textStyle: { color: "#717171" }
                    },
                    axisLine: {
                        lineStyle: { color: "#717171" }
                    },
                    axisTick: {
                        alignWithLabel: true
                    },
                    boundaryGap: true
                },
                yAxis: {

                    axisLabel: {
                        show: true,
                        textStyle: { color: "#717171" }
                    },
                    axisLine: {
                        lineStyle: { color: "#717171" }
                    },
                    scale: true,
                    splitLine: {
                        lineStyle: {
                            type: 'dashed',
                            color: 'rgb(56, 63, 84)'
                        }
                    }
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
    defaultMedia: any;
    productData: any[];
    strategyData: any[];
    iproducts: string[];
    iproduct: string;
    istrategys: string[] = ["选择所有策略"];
    istrategy: string;
    riskFactorReturnAttr: any[] = []; // 风险因子收益归因
    riskFactorExposure: any[] = [];
    riskFactorInfoArray: any[] = [];
    factorAnalysisData: any[] = [];
    getfactorAnalysisString: string = "";

    constructor(private tradePoint: QtpService, private appsrv: AppStoreService, private datePipe: DatePipe) {
        FactorAnalysisComponent.self = this;
        // this.loadData();
        this.iproducts = [];
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

        let date1 = new Date().setMonth((new Date().getMonth() - 3));
        let date2 = new Date();
        this.startdate = this.datePipe.transform(date1, "yyyy-MM-dd");
        this.enddate = this.datePipe.transform(date2, "yyyy-MM-dd");
        this.startDate = this.startdate.replace(/-/g, "");
        this.endDate = this.enddate.replace(/-/g, "");
        this.hedgeRadio = 1;

        // receive holdlist
        // index strategies
        this.tradePoint.addSlotOfCMS("getFactorInfo", (body) => {
            let data = JSON.parse(body.toString());
            if (data.msret.msgcode === "00") {
                data.body.forEach(function (factorInfo) {
                    factorInfo.factorid = parseInt(factorInfo.factorid);
                    factorInfo.factortype = parseInt(factorInfo.factortype);
                    factorInfo.returns = [];
                    if (factorInfo.factortype === 1) {

                    } else if (factorInfo.factortype === 2) {
                        FactorAnalysisComponent.self.riskFactorInfoArray.push(factorInfo);
                    }
                });
            } else {
                alert("Get getFactorInfo Failed! " + data.msret.msg);
            }
        }, this);
        
        this.tradePoint.addSlotOfCMS("getProduct", (body) => {
            let data = JSON.parse(body.toString());
            if (data.msret.msgcode === "00") {
                FactorAnalysisComponent.self.productData = data.body;
                console.log(FactorAnalysisComponent.self.productData);
                console.log(FactorAnalysisComponent.self.productData[0].caname);
                FactorAnalysisComponent.self.iproducts = [];
                for (let i = 0; i < FactorAnalysisComponent.self.productData.length; i++) {
                    FactorAnalysisComponent.self.iproducts.push(FactorAnalysisComponent.self.productData[i].caname);
                }
            } else {
                alert("Get product info Failed! " + data.msret.msg);
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
            this.tradePoint.sendToCMS("getCombStrategy", JSON.stringify({ data: { body: { userid: 19999, caid: tblockId } } }));
        }, this);

        this.tradePoint.addSlotOfCMS("getCombStrategy", (body) => {
            let data = JSON.parse(body.toString());
            if (data.msret.msgcode === "00") {
                FactorAnalysisComponent.self.strategyData = data.body;
                for (let i = 0; i < FactorAnalysisComponent.self.strategyData.length; i++) {
                    FactorAnalysisComponent.self.istrategys.push(FactorAnalysisComponent.self.strategyData[i].trname);
                }
            } else {
                alert("Get product info Failed! " + data.msret.msg);
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
        }, this);

        this.tradePoint.sendToCMS("getFactorInfo", JSON.stringify({ data: { body: {} } }));
        this.tradePoint.sendToCMS("getProduct", JSON.stringify({ data: { body: {userid: 19999} } }));

        this.riskFactorExposureEchart = echarts.init(document.getElementById("riskFactorExposureEchart") as HTMLDivElement);
        this.everyDayRFEEchart = echarts.init(document.getElementById("everyDayRFEEchart") as HTMLDivElement);
        this.riskFactorReturnAttrEchart = echarts.init(document.getElementById("riskFactorReturnAttrEchart") as HTMLDivElement);
        this.everyDayRFRAttrEchart = echarts.init(document.getElementById("everyDayRFRAttrEchart") as HTMLDivElement);

        window.onresize = () => {
            this.resizeFunction();
        };
    }

    // 界面变化时,重置而echart的大小
    resizeFunction() {
        this.riskFactorExposureEchart.resize();
        this.everyDayRFEEchart.resize();
        this.riskFactorReturnAttrEchart.resize();
        this.everyDayRFRAttrEchart.resize();
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
        this.tradePoint.addSlotOfCMS("getCombStrategy", (body) => {
            let data = JSON.parse(body.toString());
            if (data.msret.msgcode === "00") {
                FactorAnalysisComponent.self.strategyData = data.body;
                for (let i = 0; i < FactorAnalysisComponent.self.strategyData.length; i++) {
                    FactorAnalysisComponent.self.istrategys.push(FactorAnalysisComponent.self.strategyData[i].trname);
                }
            } else {
                alert("Get product info Failed! " + data.msret.msg);
            }
        }, this);

        console.log(FactorAnalysisComponent.self.istrategys);
        FactorAnalysisComponent.self.istrategy = FactorAnalysisComponent.self.istrategys[0];
        this.tradePoint.sendToCMS("getCombStrategy", JSON.stringify({ data: { body: { userid: 19999, caid: tblockId } } }));
        FactorAnalysisComponent.strategyIndex = 0;
    }

    nextStrategyDropdown() {
        let strategylist = document.getElementById("strategy") as HTMLSelectElement;
        FactorAnalysisComponent.strategyIndex = strategylist.selectedIndex;
    }

    // 点击搜索按钮后的操作
    lookReturn() {
        let ratioId = "";
        switch (this.hedge) {
            case "沪深300":
                ratioId = "000300";
                break;
            case "中证500":
                ratioId = "000905";
                break;
            case "上证50":
                ratioId = "000016";
                break;
            default:

        }
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
            let strategylist = document.getElementById("strategy") as HTMLSelectElement;
            if (FactorAnalysisComponent.strategyIndex === undefined) {
                FactorAnalysisComponent.strategyIndex = strategylist.selectedIndex;
            }
            console.log(this.istrategy);
            console.log(FactorAnalysisComponent.strategyIndex);

            if (FactorAnalysisComponent.strategyIndex > 0) {
                console.log(FactorAnalysisComponent.strategyIndex - 1);
                let strategyId = FactorAnalysisComponent.self.strategyData[FactorAnalysisComponent.strategyIndex - 1].trid;
                console.log(strategyId);
                this.tradePoint.addSlotOfCMS("getUnitFactorAnalysis", (body) => {
                    let data = JSON.parse(body.toString());
                    console.log(data)
                }, this);
                this.factorAnalysisData = [];
                this.getfactorAnalysisString = "";
                this.tradePoint.sendToCMS("getUnitFactorAnalysis", JSON.stringify({ data: { body: { begin_date: this.startDate, end_date: this.endDate, cellid: strategyId, celltype: 3, hedgingIndex: ratioId } } }));
                console.log("send strategy", strategyId, this.startDate, this.endDate, ratioId);
            } else {
                console.log(tblockId);
                this.tradePoint.addSlotOfCMS("getUnitFactorAnalysis", (body) => {
                    let data = JSON.parse(body.toString());
                    console.log(data)
                }, this);
                this.factorAnalysisData = [];
                this.getfactorAnalysisString = "";
                this.tradePoint.sendToCMS("getUnitFactorAnalysis", JSON.stringify({ data: { body: { begin_date: this.startDate, end_date: this.endDate, cellid: tblockId, celltype: 2, hedgingIndex: ratioId } } }));
                console.log("send product", tblockId, this.startDate, this.endDate, ratioId);
            }
        } else {
            alert("对冲比例必须为数字或空！");
        }
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
                    textStyle: { color: "#717171" }
                },
                xAxis: {
                    data: everydayExposureXAxis,
                    type: "category",
                    axisLabel: {
                        textStyle: { color: "#717171" }
                    },
                    axisLine: {
                        lineStyle: { color: "#717171" }
                    },
                    axisTick: {
                        alignWithLabel: true
                    }
                },
                yAxis: {

                    axisLabel: {
                        show: true,
                        textStyle: { color: "#717171" }
                    },
                    axisLine: {
                        lineStyle: { color: "#717171" }
                    },
                    scale: true,
                    splitLine: {
                        lineStyle: {
                            type: 'dashed',
                            color: 'rgb(56, 63, 84)'
                        }
                    }
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
                    textStyle: { color: "#717171" }
                },
                xAxis: {
                    data: riskFactorExposureXAxis,
                    type: "category",
                    axisLabel: {
                        rotate: -30,
                        interval: 0,
                        textStyle: { color: "#717171" }
                    },
                    axisLine: {
                        lineStyle: { color: "#717171" }
                    },
                    axisTick: {
                        alignWithLabel: true
                    },
                    boundaryGap: true
                },
                yAxis: {

                    axisLabel: {
                        show: true,
                        textStyle: { color: "#717171" }
                    },
                    axisLine: {
                        lineStyle: { color: "#717171" }
                    },
                    scale: true,
                    splitLine: {
                        lineStyle: {
                            type: 'dashed',
                            color: 'rgb(56, 63, 84)'
                        }
                    }
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
                    textStyle: { color: "#717171" }
                },
                xAxis: {
                    data: everyDayReturnAttrXAxis,
                    type: "category",
                    axisLabel: {
                        textStyle: { color: "#717171" }
                    },
                    axisLine: {
                        lineStyle: { color: "#717171" }
                    },
                    axisTick: {
                        alignWithLabel: true
                    }
                },
                yAxis: {

                    axisLabel: {
                        show: true,
                        textStyle: { color: "#717171" }
                    },
                    axisLine: {
                        lineStyle: { color: "#717171" }
                    },
                    scale: true,
                    splitLine: {
                        lineStyle: {
                            type: 'dashed',
                            color: 'rgb(56, 63, 84)'
                        }
                    }
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
                    textStyle: { color: "#717171" }
                },
                xAxis: {
                    data: riskFactorAttrXAxis,
                    type: "category",
                    axisLabel: {
                        rotate: -30,
                        interval: 0,
                        textStyle: { color: "#717171" }
                    },
                    axisLine: {
                        lineStyle: { color: "#717171" }
                    },
                    axisTick: {
                        alignWithLabel: true
                    },
                    boundaryGap: true
                },
                yAxis: {
                    axisLabel: {
                        show: true,
                        textStyle: { color: "#717171" }
                    },
                    axisLine: {
                        lineStyle: { color: "#717171" }
                    },
                    scale: true,
                    splitLine: {
                        lineStyle: {
                            type: 'dashed',
                            color: 'rgb(56, 63, 84)'
                        }
                    }
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

    constructor(private tradePoint: QtpService, private datePipe: DatePipe) {
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

        this.tradePoint.addSlotOfCMS("getFactorInfo", (body) => {
            let data = JSON.parse(body.toString());
            if (data.msret.msgcode === "00") {
                data.body.forEach(function (factorInfo) {
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
                alert("Get getFactorInfo Failed! " + data.msret.msg);
            }
        }, this);

        this.tradePoint.sendToCMS("getFactorInfo", JSON.stringify({ data: { body: {} } }));

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

        this.tradePoint.addSlotOfCMS("getAlphaFactorReturn", (body) => {
            let data = JSON.parse(body.toString());
            if (data.msret.msgcode === "00") {
                let i = 0, j = 0;
                for (; i < FactorAlphaComponent.self.alphaFactorInfoArray.length; i++) {
                    for (; j < data.body.length; j++) {
                        if (FactorAlphaComponent.self.alphaFactorInfoArray[i].factorid == data.body[j].factorid) {
                            data.body[j].factor_returns = parseFloat(data.body[j].factor_returns);
                            FactorAlphaComponent.self.alphaFactorInfoArray[i].returns.push(data.body[j]);
                        } else if (FactorAlphaComponent.self.alphaFactorInfoArray[i].factorid > data.body[j].factorid) {
                            continue;
                        } else {
                            break;
                        }
                    }
                }
                this.setRiskFactorReturnEchart(this.alphaFactorInfoArray);
            } else {
                alert("Get getAlphaFactorReturn Failed! " + data.msret.msg);
            }
        }, this);

        this.tradePoint.addSlotOfCMS("getFactorCorrelation", (body) => {
            let data = JSON.parse(body.toString());
            if (data.msret.msgcode === "00") {
                console.log(data.body);
                data.body.forEach((item) => {
                    let relevanceArr = [parseInt(item.factorid1) - 1, parseInt(item.factorid2) - 1, parseFloat(item.value)];
                    this.alphaRelevance.push(relevanceArr);
                });
                console.log(this.alphaRelevance);
                this.averageValue(this.alphaRelevance);
            } else {
                alert("Get getFactorCorrelation Failed! " + data.msret.msg);
            }
        }, this);

        this.getAlphaFactorReturnString = "";
        FactorAlphaComponent.self.alphaFactorInfoArray.forEach((item) => {
            item.returns = [];
        });
        this.tradePoint.sendToCMS("getAlphaFactorReturn", JSON.stringify({ data: { body: { begin_date: this.openDate, end_date: this.closeDate } } }));

        this.getFactorCorrelationString = "";
        this.alphaRelevance = [];
        this.hotChartData = [];
        this.tradePoint.sendToCMS("getFactorCorrelation", JSON.stringify({ data: { body: { begin_date: this.openDate, end_date: this.closeDate } } }));
    }

    // 计算平均值
    averageValue(arr) {
        let id1 = 1, id2 = 0, flag = 0;
        for (let i = 0; i < arr.length; ++i) {
            if (arr[i][0] === id1 && arr[i][1] === id2) {
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
                    textStyle: { color: "#717171" }
                },
                xAxis: [{
                    data: xAxisDatas,
                    axisLabel: {
                        textStyle: { color: "#717171" }
                    },
                    axisLine: {
                        lineStyle: { color: "#717171" }
                    }
                }],
                yAxis: [{
                    axisLabel: {
                        show: true,
                        textStyle: { color: "#717171" }
                    },
                    axisLine: {
                        lineStyle: { color: "#717171" }
                    },
                    scale: true,
                    splitLine: {
                        lineStyle: {
                            type: 'dashed',
                            color: 'rgb(56, 63, 84)'
                        }
                    }
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
                    textStyle: { color: "#717171" }
                },
                axisLine: {
                    lineStyle: { color: "#717171" }
                }
            },
            yAxis: {
                type: "category",
                data: ydata,
                splitArea: {
                    show: true
                },
                axisLabel: {
                    textStyle: { color: "#717171" }
                },
                axisLine: {
                    lineStyle: { color: "#717171" }
                }
            },
            visualMap: {
                min: -1,
                max: 1,
                calculable: true,
                orient: "horizontal",
                left: "center",
                top: "1%",
                textStyle: { color: "#717171" }
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