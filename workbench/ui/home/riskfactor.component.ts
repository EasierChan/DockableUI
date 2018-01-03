"use strict";

import { Component, HostListener, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { File, path } from "../../../base/api/services/backend.service"; // File operator
import { QtpService, QuoteService } from "../../bll/services";
import { ServiceType } from "../../../base/api/model";
import { FormsModule } from "@angular/forms";
import { CommonModule, DatePipe } from "@angular/common";
import { SecuMasterService, AppStoreService } from "../../../base/api/services/backend.service";
import { ConfigurationBLL } from "../../bll/strategy.server";
import { DataTable, DataTableColumn, DataTableRow } from "../../../base/controls/control";
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
    userId: number = 0;
    translateResult: string = "";

    constructor(private tradePoint: QtpService, private datePipe: DatePipe, private config: ConfigurationBLL, private ref: ChangeDetectorRef) {
        FactorProfitComponent.self = this;
    }

    ngOnInit() {
        this.userId = Number(this.config.get("user").userid);
        console.log(this.userId);
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
                    FactorProfitComponent.self.translate(factorInfo.factorname);
                    factorInfo.factorname = FactorProfitComponent.self.translateResult;
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

        this.tradePoint.sendToCMS("getFactorInfo", JSON.stringify({ data: { head: {userid: this.userId}, body: {} } }));
        this.tradePoint.sendToCMS("getRiskFactorReturn", JSON.stringify({ data: { head: {userid: this.userId}, body: {} } }));

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

    translate(value) {
        switch (value) {
            case "BETA":
                this.translateResult = "贝塔（市场）风险";
                break;
            case "BTOP":
                this.translateResult = "账面价值比";
                break;
            case "EARNYILD":
                this.translateResult = "盈利";
                break;
            case "GROWTH":
                this.translateResult = "成长性";
                break;
            case "LEVERAGE":
                this.translateResult = "杠杆";
                break;
            case "LIQUIDITY":
                this.translateResult = "流动性";
                break;
            case "MOMENTUM":
                this.translateResult = "动量";
                break;
            case "RESVOL":
                this.translateResult = "残差波动率";
                break;
            case "SIZE":
                this.translateResult = "市值";
                break;
            case "SIZENL":
                this.translateResult = "非线性市值";
                break;
            default:

        }
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
                            type: "dashed",
                            color: "rgb(56, 63, 84)"
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
                            type: "dashed",
                            color: "rgb(56, 63, 84)"
                        }
                    }
                },
                // dataZoom: [{
                //   type: "inside",
                //   xAxisIndex: 0 ,
                //   start: 0,
                //   end: 100
                // }, {
                //     start: 0,
                //     end: 10,
                //     show: false,
                //     handleIcon: "M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
                //     handleSize: "60%",
                //     textStyle: {
                //       color: "#FFF"
                //     }
                //     handleStyle: {
                //         color: "#fff",
                //         shadowBlur: 3,
                //         shadowColor: "rgba(0, 0, 0, 0.6)",
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
    riskFactorInfoArray: any[] = [];
    factorAnalysisData: any[] = [];
    userId: number = 0;
    translateResult: string = "";

    constructor(private tradePoint: QtpService, private appsrv: AppStoreService, private datePipe: DatePipe, private config: ConfigurationBLL, private ref: ChangeDetectorRef) {
        FactorAnalysisComponent.self = this;
        // this.loadData();
        this.iproducts = [];
    }

    ngOnInit() {
        this.userId = Number(this.config.get("user").userid);
        FactorAnalysisComponent.self.productData = this.config.getProducts();
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
                    FactorAnalysisComponent.self.translate(factorInfo.factorname);
                    factorInfo.factorname = FactorAnalysisComponent.self.translateResult;
                    if (factorInfo.factortype === 1) {

                    } else if (factorInfo.factortype === 2) {
                        FactorAnalysisComponent.self.riskFactorInfoArray.push(factorInfo);
                    }
                });
            } else {
                alert("Get getFactorInfo Failed! " + data.msret.msg);
            }
        }, this);
        
        FactorAnalysisComponent.self.iproducts = [];
        for (let i = 0; i < FactorAnalysisComponent.self.productData.length; i++) {
            FactorAnalysisComponent.self.iproducts.push(FactorAnalysisComponent.self.productData[i].caname);
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
        this.tradePoint.sendToCMS("getCombStrategy", JSON.stringify({ data: { head: {userid: this.userId}, body: { caid: tblockId } } }));
       

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

        this.tradePoint.sendToCMS("getFactorInfo", JSON.stringify({ data: { head: {userid: this.userId}, body: {} } }));

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
        this.tradePoint.sendToCMS("getCombStrategy", JSON.stringify({ data: { head: {userid: this.userId}, body: { caid: tblockId } } }));
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
                    this.factorAnalysisData = data.body;
                    console.log(this.factorAnalysisData, this.riskFactorInfoArray);
                    this.setriskFactorExposureEchart();
                    this.setRiskFactorAttrEchart();                    
                }, this);

                this.factorAnalysisData = [];
                this.tradePoint.sendToCMS("getUnitFactorAnalysis", JSON.stringify({ data: { head: {userid: this.userId}, body: { begin_date: this.startDate, end_date: this.endDate, cellid: strategyId, celltype: 3, hedgingIndex: ratioId } } }));
                console.log("send strategy", strategyId, this.startDate, this.endDate, ratioId);
            } else {
                console.log(tblockId);
                this.tradePoint.addSlotOfCMS("getUnitFactorAnalysis", (body) => {
                    let data = JSON.parse(body.toString());
                    this.factorAnalysisData = data.body;
                    console.log(this.factorAnalysisData, this.riskFactorInfoArray);
                    this.setriskFactorExposureEchart();
                    this.setRiskFactorAttrEchart();
                }, this);

                this.factorAnalysisData = [];
                this.tradePoint.sendToCMS("getUnitFactorAnalysis", JSON.stringify({ data: { head: {userid: this.userId}, body: { begin_date: this.startDate, end_date: this.endDate, cellid: tblockId, celltype: 2, hedgingIndex: ratioId } } }));
                console.log("send product", tblockId, this.startDate, this.endDate, ratioId);
            }
        } else {
            alert("对冲比例必须为数字或空！");
        }
    }

    // 设置风险因子暴露的两个图表
    setriskFactorExposureEchart() {
        let xAxisData = [], series = [], lengendData = [], barSeries= [];
        for (let i = 0; i < this.riskFactorInfoArray.length; ++i) {
            let seriesData = {name: "", type: "line", data: []};
            seriesData.name = this.riskFactorInfoArray[i].factorname;
            lengendData.push(this.riskFactorInfoArray[i].factorname);
            for (let j = 0; j < this.factorAnalysisData.length; ++j) {
                if (parseInt(String(j / this.riskFactorInfoArray.length)) == i) {
                    console.log(j ,i);
                    if (i === 0) {
                        xAxisData.push(this.factorAnalysisData[j].trday); 
                    }
                    let exposure = parseFloat(this.factorAnalysisData[j].exposure) - parseFloat(this.factorAnalysisData[j].hedgingExposure) * this.hedgeRadio;
                    seriesData.data.push(exposure);
                    if (j % this.riskFactorInfoArray.length === this.riskFactorInfoArray.length - 1) {
                        let exposure = parseFloat(this.factorAnalysisData[j].exposure) - parseFloat(this.factorAnalysisData[j].hedgingExposure) * this.hedgeRadio;
                        barSeries.push(exposure);
                    }
                }
            } 
            series.push(seriesData);
        }
        console.log(xAxisData, lengendData, series, barSeries);

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
                    data: lengendData,
                    textStyle: { color: "#717171" }
                },
                xAxis: {
                    data: xAxisData,
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
                            type: "dashed",
                            color: "rgb(56, 63, 84)"
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
                series: series
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
                    data: lengendData,
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
                            type: "dashed",
                            color: "rgb(56, 63, 84)"
                        }
                    }
                },
                // dataZoom: [{
                // 	type: "inside",
                // 	xAxisIndex: 0 ,
                // 	start: 0,
                // 	end: 100
                // }, {
                // 		start: 0,
                // 		end: 10,
                //     show: false,
                // 		handleIcon: "M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
                // 		handleSize: "60%",
                //     textStyle: {
                //       color: "#FFF"
                //     }
                // 		handleStyle: {
                // 				color: "#fff",
                // 				shadowBlur: 3,
                // 				shadowColor: "rgba(0, 0, 0, 0.6)",
                // 				shadowOffsetX: 2,
                // 				shadowOffsetY: 2
                // 		}
                // }],
                series: [{
                    name: "风险因子暴露",
                    type: "bar",
                    data: barSeries
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

    setRiskFactorAttrEchart() {
        let xAxisData = [], series = [], lengendData = [], barSeries= [], attributeSum = 0;
        for (let i = 0; i < this.riskFactorInfoArray.length; ++i) {
            let seriesData = {name: "", type: "line", data: []};
            seriesData.name = this.riskFactorInfoArray[i].factorname;
            lengendData.push(this.riskFactorInfoArray[i].factorname);
            for (let j = 0; j < this.factorAnalysisData.length; ++j) {
                if (parseInt(String(j / this.riskFactorInfoArray.length)) == i) {
                    console.log(j ,i);
                    if (i === 0) {
                        xAxisData.push(this.factorAnalysisData[j].trday); 
                    }
                    let attribute = parseFloat(this.factorAnalysisData[j].attribute) - parseFloat(this.factorAnalysisData[j].hedgingAttribute) * this.hedgeRadio;
                    seriesData.data.push(attribute);
                    attributeSum += attribute;
                }
            } 
            series.push(seriesData);
            barSeries.push(attributeSum);
            attributeSum = 0;
        }
        console.log(xAxisData, lengendData, series, barSeries);

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
                    data: lengendData,
                    textStyle: { color: "#717171" }
                },
                xAxis: {
                    data: xAxisData,
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
                            type: "dashed",
                            color: "rgb(56, 63, 84)"
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
                series: series
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
                    data: lengendData,
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
                            type: "dashed",
                            color: "rgb(56, 63, 84)"
                        }
                    }
                },
                // dataZoom: [{
                //   type: "inside",
                //   xAxisIndex: 0 ,
                //   start: 0,
                //   end: 100
                // }, {
                //     start: 0,
                //     end: 10,
                //     show: false,
                //     handleIcon: "M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z",
                //     handleSize: "60%",
                //     textStyle: {
                //       color: "#FFF"
                //     }
                //     handleStyle: {
                //         color: "#fff",
                //         shadowBlur: 3,
                //         shadowColor: "rgba(0, 0, 0, 0.6)",
                //         shadowOffsetX: 2,
                //         shadowOffsetY: 2
                //     }
                // }],
                series: [{
                    name: "风险因子归因",
                    type: "bar",
                    data: barSeries
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

    translate(value) {
        switch (value) {
            case "BETA":
                this.translateResult = "贝塔（市场）风险";
                break;
            case "BTOP":
                this.translateResult = "账面价值比";
                break;
            case "EARNYILD":
                this.translateResult = "盈利";
                break;
            case "GROWTH":
                this.translateResult = "成长性";
                break;
            case "LEVERAGE":
                this.translateResult = "杠杆";
                break;
            case "LIQUIDITY":
                this.translateResult = "流动性";
                break;
            case "MOMENTUM":
                this.translateResult = "动量";
                break;
            case "RESVOL":
                this.translateResult = "残差波动率";
                break;
            case "SIZE":
                this.translateResult = "市值";
                break;
            case "SIZENL":
                this.translateResult = "非线性市值";
                break;
            default:

        }
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
    userId: number = 0;    

    constructor(private tradePoint: QtpService, private datePipe: DatePipe, private config: ConfigurationBLL, private ref: ChangeDetectorRef) {
        FactorAlphaComponent.self = this;
    }

    ngOnInit() {
        this.userId = Number(this.config.get("user").userid);
        console.log(this.userId);
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

        // let date1 = new Date().setMonth((new Date().getMonth() - 3));
        let date2 = new Date();
        // this.opendate = this.datePipe.transform(date1, "yyyy-MM-dd");
        this.opendate = "2009-01-05";
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

        this.tradePoint.sendToCMS("getFactorInfo", JSON.stringify({ data: { head: {userid: this.userId}, body: {} } }));

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
        this.tradePoint.sendToCMS("getAlphaFactorReturn", JSON.stringify({ data: { head: {userid: this.userId}, body: { begin_date: this.openDate, end_date: this.closeDate } } }));

        this.getFactorCorrelationString = "";
        this.alphaRelevance = [];
        this.hotChartData = [];
        this.tradePoint.sendToCMS("getFactorCorrelation", JSON.stringify({ data: { head: {userid: this.userId}, body: { begin_date: this.openDate, end_date: this.closeDate } } }));
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
                            type: "dashed",
                            color: "rgb(56, 63, 84)"
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
    index: string;
    allIndex: string[];
    count: number;
    allCount: number[];
    worstStockList: DataTable;
    bestStockList: DataTable;
    userId: number;
    aiStockDate: any = {};
    ukCodeList: any[] = [];
    aiCodeList: any[] = [];
    bestStockUkMap: any = {};
    worstStockUkMap: any = {};
    selfStockXdata: any[] = [];
    nowTime: any;
    refStock: any = {};
    referStockUk: number;
    refStockIncrease: number;
    preMarketTimestamp: number;
    nowTimeStamp: any;//当前时间戳

    constructor(private tradePoint: QtpService, private quote: QuoteService, private config: ConfigurationBLL,
        private secuinfo: SecuMasterService, private appsvr: AppStoreService, private ref: ChangeDetectorRef) {

    }

    ngOnInit() {
        this.allIndex = ["中证1000", "中证800", "中证500"];
        this.index = this.allIndex[0];
        this.allCount = [10, 30, 50, 100];
        this.count = this.allCount[1];
        this.userId = Number(this.config.get("user").userid); 
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
        this.search();
    }

    search() {
        if (!isNaN(this.count) && this.count > 0) {
            this.count = Math.floor(this.count);
            switch (this.index) {
                case "中证1000":
                    this.referStockUk = 2490646;
                    break;
                case "中证800":
                    this.referStockUk = 2490391;
                    break;
                case "中证500":
                    this.referStockUk = 2490389;
                    break;
                default:
                                            
            }
            this.selfStockXdata = [];
            let selfStockSecuInfo = this.secuinfo.getSecuinfoByUKey(this.referStockUk);
            let tradetime = selfStockSecuInfo[this.referStockUk].TradeTime;
            this.refStock.name = selfStockSecuInfo[this.referStockUk].SecuCode + " [ " + selfStockSecuInfo[this.referStockUk].SecuAbbr + " ]";
            this.refStock.price = "--";
            this.refStock.increase = "--";
            this.selfStockXdata = this.getXDate(tradetime);
            let d = new Date();
            this.nowTime = d.getHours() + ":" + d.getMinutes();
            
            //接实时行情
            this.quote.addSlot({
                appid: 17,
                packid: 110,
                callback: (msg) => {
                    let d = new Date();
                    this.nowTimeStamp = d.getTime();
                    let stockIncrease = msg.content.last > msg.content.pre_close ? "+" + Math.round(10000 * (msg.content.last - msg.content.pre_close) / msg.content.pre_close) / 100 : Math.round(10000 * (msg.content.last - msg.content.pre_close) / msg.content.pre_close) / 100;
                    // this.currentMarketData[msg.content.ukey] = { "stockPrice": msg.content.last, "stockIncrease": stockIncrease };
                    let test = Math.abs(this.nowTimeStamp - msg.content.time * 1000);
                    // console.log("系统时间和实时行情时间差：" + test);
                    if (Math.abs(this.nowTimeStamp - msg.content.time * 1000) <= 30000) {
                        let lastPrice = Number((msg.content.last / 10000).toFixed(2));//现价
                        if (msg.content.ukey == this.referStockUk) {
                            this.refStockIncrease = Number(stockIncrease);
                            this.refStock.price = lastPrice;
                            this.refStock.increase = this.refStockIncrease;
                            console.log(stockIncrease);
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
                                let overStockIncrease = Number((Number(stockIncrease) - this.refStockIncrease).toFixed(2));
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
                                this.bestStockList.rows[ukInBestIndex].cells[3].Text = stockIncrease + "%";
                                this.bestStockList.rows[ukInBestIndex].cells[3].Color = this.dashGetColor(stockIncrease, "color");
                            }
                            if (ukInWorstIndex != undefined) {
                                this.worstStockList.rows[ukInWorstIndex].cells[2].Text = (msg.content.last / 10000).toFixed(2);
                                this.worstStockList.rows[ukInWorstIndex].cells[3].Text = stockIncrease + "%";
                                this.worstStockList.rows[ukInWorstIndex].cells[3].Color = this.dashGetColor(stockIncrease, "color");
                            }
                        }
                    }
                    this.ref.detectChanges();
                }
            });

            //最好的30股票
            this.tradePoint.addSlotOfCMS("getBestStocks", msg => {
                let data = JSON.parse(msg.toString());
                if (data.msret.msgcode != "00") {
                    alert(data.msret.msg)
                    return;
                }
                this.aiStockDate.bestStockListData = data.body;
                this.bestStockList.RowIndex = false; // 去除序列
                if (this.aiStockDate.bestStockListData.length > 0) {
                    this.aiStockDate.bestStockListData.forEach((item, index) => {
                        this.ukCodeList.push(Number(item.ukcode));
                        this.aiCodeList.push(Number(item.ukcode));
                        let row = this.bestStockList.newRow();
                        this.bestStockUkMap[item.ukcode] = {};
                        this.bestStockUkMap[item.ukcode].order = index;
                        this.bestStockUkMap[item.ukcode].type = "best";
                        row.cells[0].Text = item.windcode;
                        row.cells[0].Color = "rgb(234, 47, 47)";
                        row.cells[1].Text = item.chabbr;
                        row.cells[1].Color = "rgb(234, 47, 47)";
                        row.cells[2].Text = "--";
                        row.cells[3].Text = "--";
                        row.cells[4].Text = "--";
                    })
                }

                this.quote.send(17, 101, { topic: 3112, kwlist: this.aiCodeList });
                if (this.selfStockXdata.indexOf(this.nowTime) === -1) {//今天非交易时间段请求当日最后一条数据
                    this.historyMarket();
                }
                this.ref.detectChanges();
            }, this)

            //最差的30股
            this.tradePoint.addSlotOfCMS("getWorstStocks", msg => {
                let data = JSON.parse(msg.toString());
                if (data.msret.msgcode != "00") {
                    alert(data.msret.msg)
                    return;
                }
                this.aiStockDate.worstStockListData = data.body;
                this.worstStockList.RowIndex = false; // 去除序列
                if (this.aiStockDate.worstStockListData.length > 0) {
                    this.aiStockDate.worstStockListData.forEach((item, index) => {
                        this.ukCodeList.push(Number(item.ukcode));
                        this.aiCodeList.push(Number(item.ukcode));
                        let row = this.worstStockList.newRow();
                        this.worstStockUkMap[item.ukcode] = {};
                        this.worstStockUkMap[item.ukcode].order = index;
                        this.worstStockUkMap[item.ukcode].type = "worst";
                        row.cells[0].Text = item.windcode;
                        row.cells[0].Color = "rgb(55, 177, 78)";
                        row.cells[1].Text = item.chabbr;
                        row.cells[1].Color = "rgb(55, 177, 78)";
                        row.cells[2].Text = "--";
                        row.cells[3].Text = "--";
                        row.cells[4].Text = "--";
                    })
                }
                
                this.quote.send(17, 101, { topic: 3112, kwlist: this.aiCodeList });
                if (this.selfStockXdata.indexOf(this.nowTime) === -1) {//今天非交易时间段请求当日最后一条数据
                    this.historyMarket();
                }
                this.ref.detectChanges();
            }, this)

            //AI看盘数据
            this.ukCodeList = [];
            this.aiCodeList = [];
            this.aiCodeList.push(this.referStockUk);
            this.bestStockList.rows = [];
            this.worstStockList.rows = [];
            this.bestStockUkMap = {};
            this.worstStockUkMap = {};
            this.aiStockDate = {};
            this.tradePoint.sendToCMS("getBestStocks", JSON.stringify({ data: { head: {userid: this.userId}, body: { amount: this.count } } }));
            this.tradePoint.sendToCMS("getWorstStocks", JSON.stringify({ data: { head: {userid: this.userId}, body: { amount: this.count } } }));
        } else {
            alert("参考股数必须为数字！");
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

    historyMarket() {
        let d = new Date();
        let time = (d.getHours() < 10 ? ("0" + d.getHours()) : d.getHours()) + "" + (d.getMinutes() < 10 ? ("0" + d.getMinutes()) : d.getMinutes()) + "" + (d.getSeconds() < 10 ? ("0" + d.getSeconds()) : d.getSeconds()) + "000";
        let partIndex = 1;
        //接历史行情 
        this.quote.send(181, 10001, { requestId: 1, dataType: 102001, ukeyList: this.aiCodeList.join(";"), partOrder: -1 });
        
        this.quote.addSlot({
            appid: 181,
            packid: 10002,
            callback: (msg) => {
                console.log(msg);
                let lastDate = msg.content.data;
                let referStock = {};
                referStock[this.referStockUk] = {};
                referStock[this.referStockUk].order = 0;
                referStock[this.referStockUk].type = "refer";
                let allStockUkMap = Object.assign(this.bestStockUkMap, this.worstStockUkMap, referStock);
                lastDate.forEach(item => {
                    let nowPrice = (item.p / 10000).toFixed(2);
                    let increase = ((item.p - item.pc) / 10000).toFixed(2);
                    let increasePer = ((item.p - item.pc) / item.pc).toFixed(2);
                    let referIncrease;
                    if (allStockUkMap[item.k] && allStockUkMap[item.k].type == "worst") {
                        referIncrease = (Number(increasePer) - Number(this.refStock.increase)).toFixed(2);
                        this.worstStockList.rows[allStockUkMap[item.k].order].cells[2].Text = nowPrice;
                        this.worstStockList.rows[allStockUkMap[item.k].order].cells[3].Text = this.dashGetColor(increasePer, "value") + "%";
                        this.worstStockList.rows[allStockUkMap[item.k].order].cells[3].Color = this.dashGetColor(increasePer, "color");
                        if (referIncrease) {
                            this.worstStockList.rows[allStockUkMap[item.k].order].cells[4].Color = this.dashGetColor(referIncrease, "color");
                            this.worstStockList.rows[allStockUkMap[item.k].order].cells[4].Text = this.dashGetColor(referIncrease, "value") + "%";
                        }
                    } else if (allStockUkMap[item.k] && allStockUkMap[item.k].type == "best") {
                        referIncrease = (Number(increasePer) - Number(this.refStock.increase)).toFixed(2);
                        this.bestStockList.rows[allStockUkMap[item.k].order].cells[2].Text = nowPrice;
                        this.bestStockList.rows[allStockUkMap[item.k].order].cells[3].Text = this.dashGetColor(increasePer, "value") + "%";
                        this.bestStockList.rows[allStockUkMap[item.k].order].cells[3].Color = this.dashGetColor(increasePer, "color");
                        if (referIncrease) {
                            this.bestStockList.rows[allStockUkMap[item.k].order].cells[4].Color = this.dashGetColor(referIncrease, "color");
                            this.bestStockList.rows[allStockUkMap[item.k].order].cells[4].Text = this.dashGetColor(referIncrease, "value") + "%";
                        }
                    } else if (allStockUkMap[item.k] && allStockUkMap[item.k].type == "refer") {
                        this.refStock.price = nowPrice;
                        this.refStock.increase = increasePer;
                    }
                })
                console.log(allStockUkMap);
                this.ref.detectChanges();
            }
        })
    }

    ngOnDestroy() {
        // 防止订阅的行情在其他页面的时候回来，离开页面的时候取消订阅
        console.log("destroy");
        this.quote.send(17, 101, { topic: 3112, kwlist: [] });
    }
}