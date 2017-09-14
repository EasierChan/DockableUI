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
    selector: "riskfactor",
    templateUrl: "riskfactor.component.html",
    styleUrls: ["home.component.css", "riskfactor.component.css"],
    providers: [DatePipe],
    inputs: ["activeTab"]
})

export class RiskFactorComponent implements OnDestroy {
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
    static opendateStat: string;
    static closedateStat: string;
    static productIndex: number;
    static strategyIndex: number;

    rfrDateIndex: number = 0; // 保存风险因子收益日期的索引

    styleObj: any;
    dataSource: any;

    startdate: string;
    enddate: string;
    startDate: string;
    endDate: string;
    opendate: string;
    closedate: string;
    openDate: string;
    closeDate: string;
    hedges: string[] = ["沪深300", "中证500", "上证50"];
    hedge: string = "沪深300";
    hedgeRadio: number;

    riskFactorReturnEchart: any; // echart
    everyDayReturnEchart: any;
    everyDayYearReturnEchart: any;    // 一年中每一天的风险因子收益折线图
    lastDayYearReturnEchart: any;  // 一年中最后一天的风险因子收益柱状图图
    riskFactorExposureEchart: any;  // 最后选中天风险因子暴露柱状图
    everyDayRFEEchart: any;         // 每一天的风险因子的暴露折线图
    riskFactorReturnAttrEchart: any;  // 风险因子收益归因柱状图
    everyDayRFRAttrEchart: any;   // 每一天风险因子归因折线图
    stockAttrEchart: any;   // 股票归因柱状图
    alphaHotChart: any;
    alphaChart: any;

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
    alphaRelevance: any[] = []; // alpha相关性
    alphaRelevanceResult: any[] = []; // alpha相关性结果
    hotChartData: any[] = []; // 存放图标的data
    alphaData: any[] = []; // alpha

    /* 保存所有的股票持仓数组
    * 每一个数组元素为对象,对象包含一下元素
    * stockCode,stockWeight,stockExposure,returnAttr --保存股票在每一个风险因子下的归因,allRiskFactorReturnAttr--单个股票在所有风险因子下的归因,
    * 这是一个初始化实例  let obj = {stockCode: currentValue.marketcode.toUpperCase(), stockWeight: currentValue.cost_rate, stockExposure:[], returnAttr:[], allRiskFactorReturnAttr:0};
    */
    groupPosition: any[] = [];
    futurePosition: any[] = [];
    netTableValue: any[] = [];

    dataDir: string; // added by cl
    productAppID: number; // added by cl

    constructor(private tradePoint: TradeService, private appsrv: AppStoreService, private datePipe: DatePipe) {
        RiskFactorComponent.self = this;
        // this.loadData();
        this.iproducts = [];
        this.productfuturehold = "";
        this.productstockhold = "";
        this.strategyfuturehold = "";
        this.strategystockhold = "";

    }

    ngOnInit() {
        this.productAppID = this.appsrv.getSetting().endpoints[0].tgw_apps.ids;
        this.dataDir = this.appsrv.getSetting().riskDataDir ? this.appsrv.getSetting().riskDataDir : "/mnt/dropbox/risk";
        console.info(this.activeTab, this.dataDir);

        this.readAndHandleRiskReturn();

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

        let date1 = new Date().setMonth((new Date().getMonth() - 1));
        let date2 = new Date();
        // this.startdate = this.datePipe.transform(date1, "yyyy-MM-dd");
        // this.enddate = this.datePipe.transform(date2, "yyyy-MM-dd");
        this.startdate = "2017-06-26";
        this.enddate = "2017-07-26";
        this.hedgeRadio = 1;

        if (this.activeTab === "风险因子分析") {
            // receive holdlist
            this.tradePoint.addSlot({
                appid: this.productAppID,
                packid: 224,
                callback: (msg) => {
                    let data = JSON.parse(msg.content.body);
                    if (data.msret.msgcode === "00") {
                        RiskFactorComponent.self.productData = data.body;
                        console.log(RiskFactorComponent.self.productData);
                        console.log(RiskFactorComponent.self.productData[0].tblock_full_name);
                        for (let i = 0; i < RiskFactorComponent.self.productData.length; i++) {
                            RiskFactorComponent.self.iproducts.push(RiskFactorComponent.self.productData[i].tblock_full_name);
                        }
                    } else {
                        alert("Get product info Failed! " + data.msret.msg);
                    }
                    RiskFactorComponent.self.iproduct = RiskFactorComponent.self.iproducts[0];
                    let tblockId = 0;
                    if (RiskFactorComponent.productIndex === undefined) {
                        tblockId = RiskFactorComponent.self.productData[0].tblock_id;
                    } else {
                        tblockId = RiskFactorComponent.self.productData[RiskFactorComponent.productIndex].tblock_id;
                    }
                    console.log(tblockId);
                    console.log(RiskFactorComponent.self.istrategys);
                    RiskFactorComponent.self.istrategy = RiskFactorComponent.self.istrategys[0];
                    this.tradePoint.send(this.productAppID, 218, { body: { tblock_id: tblockId } });
                }
            });

            // index strategies
            this.tradePoint.addSlot({
                appid: this.productAppID,
                packid: 218,
                callback: (msg) => {
                    console.log(msg);
                    let data = JSON.parse(msg.content.body);
                    if (data.msret.msgcode === "00") {
                        RiskFactorComponent.self.strategyData = data.body;
                        for (let i = 0; i < RiskFactorComponent.self.strategyData.length; i++) {
                            RiskFactorComponent.self.istrategys.push(RiskFactorComponent.self.strategyData[i].strategy_name);
                        }
                    } else {
                        alert("Get product info Failed! " + data.msret.msg);
                    }

                    if (RiskFactorComponent.startdateStat !== undefined) {
                        console.log(RiskFactorComponent.startdateStat);
                        this.startdate = RiskFactorComponent.startdateStat;
                    }
                    if (RiskFactorComponent.enddateStat !== undefined) {
                        console.log(RiskFactorComponent.enddateStat);
                        this.enddate = RiskFactorComponent.enddateStat;
                    }
                    if (RiskFactorComponent.hedgeStat !== undefined) {
                        console.log(RiskFactorComponent.hedgeStat);
                        this.hedge = RiskFactorComponent.hedgeStat;
                    }
                    if (RiskFactorComponent.hedgeratioStat !== undefined) {
                        console.log(RiskFactorComponent.hedgeratioStat);
                        this.hedgeRadio = RiskFactorComponent.hedgeratioStat;
                    }
                    if (RiskFactorComponent.productsStat !== undefined) {
                        console.log(RiskFactorComponent.productsStat);
                        this.iproducts = RiskFactorComponent.productsStat;
                    }
                    if (RiskFactorComponent.strategiesStat !== undefined) {
                        console.log(RiskFactorComponent.strategiesStat);
                        this.istrategys = RiskFactorComponent.strategiesStat;
                    }
                    if (RiskFactorComponent.productStat !== undefined) {
                        console.log(RiskFactorComponent.productStat);
                        this.iproduct = RiskFactorComponent.productStat;
                    }
                    if (RiskFactorComponent.strategyStat !== undefined) {
                        console.log(RiskFactorComponent.strategyStat);
                        this.istrategy = RiskFactorComponent.strategyStat;
                    }

                    this.lookReturn();
                }
            });
            this.tradePoint.send(this.productAppID, 224, { body: { tblock_type: 2 } });
        }

        this.riskFactorReturnEchart = echarts.init(document.getElementById("riskFactorReturnEchart") as HTMLDivElement);
        this.everyDayReturnEchart = echarts.init(document.getElementById("everyDayReturnEchart") as HTMLDivElement);
        this.everyDayYearReturnEchart = echarts.init(document.getElementById("everyDayYearReturnEchart") as HTMLDivElement);
        this.lastDayYearReturnEchart = echarts.init(document.getElementById("lastDayYearReturnEchart") as HTMLDivElement);

        this.riskFactorExposureEchart = echarts.init(document.getElementById("riskFactorExposureEchart") as HTMLDivElement);
        this.everyDayRFEEchart = echarts.init(document.getElementById("everyDayRFEEchart") as HTMLDivElement);
        this.riskFactorReturnAttrEchart = echarts.init(document.getElementById("riskFactorReturnAttrEchart") as HTMLDivElement);
        this.everyDayRFRAttrEchart = echarts.init(document.getElementById("everyDayRFRAttrEchart") as HTMLDivElement);

        this.stockAttrEchart = echarts.init(document.getElementById("stockAttrEchart") as HTMLDivElement);
        // alpha
        this.alphaHotChart = echarts.init(document.getElementById("alphahotchart") as HTMLDivElement);
        this.alphaChart = echarts.init(document.getElementById("alphachart") as HTMLDivElement);


        if (this.activeTab === "Profit" || this.activeTab === "风险因子收益") {
            this.setriskFactorReturnEchart(this.riskFactorReturn);
        }
        else if (this.activeTab === "RiskFactors" || this.activeTab === "风险因子分析") {

        }
        if (this.activeTab === "Alpha因子") {
            console.log(this.activeTab);
            this.opendate = "2017-06-26";
            this.closedate = "2017-07-26";
            if (RiskFactorComponent.opendateStat !== undefined) {
                console.log(RiskFactorComponent.opendateStat);
                this.opendate = RiskFactorComponent.opendateStat;
            }
            if (RiskFactorComponent.closedateStat !== undefined) {
                console.log(RiskFactorComponent.closedateStat);
                this.closedate = RiskFactorComponent.closedateStat;
            }
            this.searchresult();
        }

        window.onresize = () => {
            this.resizeFunction();
        };
    }

    loadData() {
        // to read a file line by line.
        let arr = [];
        File.readLineByLine(path.join(this.dataDir, "riskreturn.csv"), (linestr) => {
            console.log("readLineByLine", linestr);
            arr.push(linestr);

        }, () => { console.info("finished"); });
        console.log("console.log(arr);", arr);
    }

    // 界面变化时,重置而echart的大小
    resizeFunction() {
        this.riskFactorReturnEchart.resize();
        this.everyDayReturnEchart.resize();
        this.everyDayYearReturnEchart.resize();
        this.lastDayYearReturnEchart.resize();

        this.riskFactorExposureEchart.resize();
        this.everyDayRFEEchart.resize();
        this.riskFactorReturnAttrEchart.resize();
        this.everyDayRFRAttrEchart.resize();

        this.stockAttrEchart.resize();
        this.alphaHotChart.resize();
        this.alphaChart.resize();

    }


    nextDropdown() {
        // get strategies of this product
        RiskFactorComponent.self.istrategys = ["选择所有策略"];
        console.log(RiskFactorComponent.self.productData);
        let productlist = document.getElementById("product") as HTMLSelectElement;
        RiskFactorComponent.productIndex = productlist.selectedIndex;
        let tblockId = RiskFactorComponent.self.productData[RiskFactorComponent.productIndex].tblock_id;
        console.log(RiskFactorComponent.productIndex);
        // strategies
        this.tradePoint.addSlot({
            appid: this.productAppID,
            packid: 218,
            callback: (msg) => {
                console.log(msg);
                let data = JSON.parse(msg.content.body);
                if (data.msret.msgcode === "00") {
                    RiskFactorComponent.self.strategyData = data.body;
                    for (let i = 0; i < RiskFactorComponent.self.strategyData.length; i++) {
                        RiskFactorComponent.self.istrategys.push(RiskFactorComponent.self.strategyData[i].strategy_name);
                    }
                } else {
                    alert("Get product info Failed! " + data.msret.msg);
                }
            }
        });
        console.log(RiskFactorComponent.self.istrategys);
        RiskFactorComponent.self.istrategy = RiskFactorComponent.self.istrategys[0];
        this.tradePoint.send(this.productAppID, 218, { body: { tblock_id: tblockId } });
        RiskFactorComponent.strategyIndex = 0;
    }

    nextStrategyDropdown() {
        let strategylist = document.getElementById("strategy") as HTMLSelectElement;
        RiskFactorComponent.strategyIndex = strategylist.selectedIndex;
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
        console.log("handled riskFactorReturn", this.riskFactorReturn);
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

    // 读取alpha相关性数据
    readAndHandleAlphaRelevance(exposureFilePath) {
        this.alphaRelevance = this.readDataFromCsvFile(exposureFilePath);


    }

    // 读取alpha因子数据
    readAndHandleAlpha() {
        this.alphaData = this.readDataFromCsvFile(path.join(this.dataDir, "alpha", "alpha_ret.csv"));
        // 处理获取的风险因子收益数据
        if (this.riskFactorReturn.length < 2) {
            alert("风险因子收益没有数据,请导入数据后重试");
            return;
        }

        for (let i = 1; i < this.alphaData.length; ++i) {

            for (let j = 1; j < this.alphaData[0].length; ++j) {
                let value = parseFloat(this.alphaData[i][j]);

                if (isNaN(value)) {
                    this.alphaData[i][j] = 0;
                } else {
                    this.alphaData[i][j] = value;
                }

                // if (i > 1) {
                //     this.riskFactorReturn[i][j] += this.riskFactorReturn[i-1][j];
                // }

            }
        }
        console.log(this.alphaData);
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
                alert("没有找到" + singleStock.stockCode + "的暴露,请补全信息!");

                return false;
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

        if (returnDateIndex === -1) {
            alert("没有找到" + currDate + "的风险因子收益!");
            return false;
        }

        // 计算单个股票在所有风险因子下暴露和风险因子的乘积--也就是收益归因
        this.sumOfStockFactorReturnAttr(groupPosition, riskFactorReturn, returnDateIndex);

        let dayOfAllAttr = 0;
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
        if (RiskFactorComponent.productIndex === undefined) {
            RiskFactorComponent.productIndex = productlist.selectedIndex;
        }
        console.log(this.iproduct);
        console.log(RiskFactorComponent.productIndex);
        if (RiskFactorComponent.productIndex === -1) {
            return;
        }
        let tblockId = RiskFactorComponent.self.productData[RiskFactorComponent.productIndex].tblock_id;

        if (!isNaN(this.hedgeRadio)) {
            let strategylist = document.getElementById("strategy") as HTMLSelectElement;
            if (RiskFactorComponent.strategyIndex === undefined) {
                RiskFactorComponent.strategyIndex = strategylist.selectedIndex;
            }
            console.log(this.istrategy);
            console.log(RiskFactorComponent.strategyIndex);
            // setNetTableValue
            this.tradePoint.addSlot({
                appid: this.productAppID,
                packid: 226,
                callback: (msg) => {
                    console.log("receive setNetTableValue", msg);
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
                            console.log(this.hadNetData, this.hadStockHold, (!this.needFutures || this.needFutures && this.hadFutureHold), this.hadNetData && this.hadStockHold && (!this.needFutures || this.needFutures && this.hadFutureHold));
                            if (this.hadNetData && this.hadStockHold && (!this.needFutures || this.needFutures && this.hadFutureHold)) {
                                this.beginCalculateRiskFactor();
                            }

                        } else {
                            alert("获取净值数据失败：" + netTableValue.msret.msg);
                        }
                    }

                }
            });

            if (RiskFactorComponent.strategyIndex > 0) {
                console.log(RiskFactorComponent.strategyIndex - 1);
                let strategyId = RiskFactorComponent.self.strategyData[RiskFactorComponent.strategyIndex - 1].strategy_id;
                console.log(this.startDate, strategyId);
                console.log(this.startDate, tblockId);
                // strategyfuturehold
                this.tradePoint.addSlot({
                    appid: this.productAppID,
                    packid: 220,
                    callback: (msg) => {
                        console.log("strategyfuturehold", msg, msg.content.head.pkgCnt, msg.content.head.pkgIdx);
                        this.strategyfuturehold += msg.content.body;
                        if (msg.content.head.pkgIdx === (msg.content.head.pkgCnt - 1)) {
                            msg.content.body = this.strategyfuturehold;
                            // console.log(this.strategyfuturehold);
                            console.log("strategyfuturehold", msg);
                            this.hadFutureHold = true;

                            if (msg.content.msret.msgcode !== "00") {
                                alert("获取策略期货持仓失败：" + msg.content.msret.msg);
                                return;
                            }

                            let strategyFutureHold = JSON.parse(msg.content.body);

                            if (strategyFutureHold.msret.msgcode === "00") {
                                this.futurePosition = strategyFutureHold.body;
                                console.log(this.hadNetData, this.hadStockHold, (!this.needFutures || this.needFutures && this.hadFutureHold), this.hadNetData && this.hadStockHold && (!this.needFutures || this.needFutures && this.hadFutureHold));

                                if (this.hadNetData && this.hadStockHold && (!this.needFutures || this.needFutures && this.hadFutureHold)) {
                                    this.beginCalculateRiskFactor();
                                }
                            } else {
                                alert("获取策略期货持仓失败：" + msg.content.msret.msg);
                            }
                        }
                    }
                });
                this.strategyfuturehold = "";
                this.hadFutureHold = false;
                this.futurePosition = [];
                this.tradePoint.send(this.productAppID, 220, { body: { strategy_id: strategyId, begin_date: this.startDate, end_date: this.startDate, product_id: tblockId } });

                // strategystockhold
                this.tradePoint.addSlot({
                    appid: this.productAppID,
                    packid: 222,
                    callback: (msg) => {
                        console.log("strategystockhold", msg, msg.content.head.pkgCnt, msg.content.head.pkgIdx);
                        this.strategystockhold += msg.content.body;
                        if (msg.content.head.pkgIdx === (msg.content.head.pkgCnt - 1)) {
                            msg.content.body = this.strategystockhold;

                            console.log("strategystockhold", msg);
                            this.hadStockHold = true;

                            if (msg.content.msret.msgcode !== "00") {
                                alert("获取策略股票持仓失败：" + msg.content.msret.msg);
                                return;
                            }

                            let strategystockhold = JSON.parse(msg.content.body);

                            if (strategystockhold.msret.msgcode === "00") {
                                this.getGroupPosition(strategystockhold.body);
                                console.log(this.hadNetData, this.hadStockHold, (!this.needFutures || this.needFutures && this.hadFutureHold), this.hadNetData && this.hadStockHold && (!this.needFutures || this.needFutures && this.hadFutureHold));
                                if (this.hadNetData && this.hadStockHold && (!this.needFutures || this.needFutures && this.hadFutureHold)) {

                                    this.beginCalculateRiskFactor();
                                }
                            } else {
                                alert("获取策略股票持仓失败：" + strategystockhold.msret.msg);
                            }
                            console.log("strategystockhold", strategystockhold, this.groupPosition);
                        }
                    }
                });
                this.strategystockhold = "";
                this.hadStockHold = false;
                this.groupPosition = [];
                this.tradePoint.send(this.productAppID, 222, { body: { strategy_id: strategyId, product_id: tblockId, begin_date: this.startDate, end_date: this.startDate } });

                this.hadNetData = false;
                this.netTableValue = [];
                this.netValueString = "";
                this.tradePoint.send(this.productAppID, 226, { body: { type: 1, id: strategyId, begin_date: this.startDate, end_date: this.endDate } });
                console.log("send setNetTableValue strategy", tblockId, this.startDate, this.endDate);
            } else {
                console.log(this.startDate, tblockId);
                // productfuturehold
                this.tradePoint.addSlot({
                    appid: this.productAppID,
                    packid: 228,
                    callback: (msg) => {

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
                                console.log(this.hadNetData, this.hadStockHold, (!this.needFutures || this.needFutures && this.hadFutureHold), this.hadNetData && this.hadStockHold && (!this.needFutures || this.needFutures && this.hadFutureHold));
                                if (this.hadNetData && this.hadStockHold && (!this.needFutures || this.needFutures && this.hadFutureHold)) {
                                    this.beginCalculateRiskFactor();
                                }
                            } else {
                                alert("获取产品期货持仓失败：" + productFutureHold.msret.msg);
                            }
                            console.log("productFutureHold", productFutureHold, this.groupPosition);
                        }
                    }
                });
                this.productfuturehold = "";
                this.hadFutureHold = false;
                this.futurePosition = [];
                this.tradePoint.send(this.productAppID, 228, { body: { begin_date: this.startDate, end_date: this.startDate, tblock_id: tblockId } });

                // productstockhold
                this.tradePoint.addSlot({
                    appid: this.productAppID,
                    packid: 230,
                    callback: (msg) => {

                        this.productstockhold += msg.content.body;
                        if (msg.content.head.pkgIdx === (msg.content.head.pkgCnt - 1)) {
                            msg.content.body = this.productstockhold;

                            console.log("productstockhold", msg);
                            this.hadStockHold = true;
                            if (msg.content.msret.msgcode !== "00") {
                                alert("获取产品股票持仓失败：" + msg.content.msret.msg);
                                return;
                            }
                            let productStockHold = JSON.parse(msg.content.body);
                            if (productStockHold.msret.msgcode === "00") {
                                this.getGroupPosition(productStockHold.body);
                                console.log(this.hadNetData, this.hadStockHold, (!this.needFutures || this.needFutures && this.hadFutureHold), this.hadNetData && this.hadStockHold && (!this.needFutures || this.needFutures && this.hadFutureHold));
                                if (this.hadNetData && this.hadStockHold && (!this.needFutures || this.needFutures && this.hadFutureHold)) {
                                    this.beginCalculateRiskFactor();
                                }

                            } else {
                                alert("获取产品股票持仓失败：" + productStockHold.msret.msg);
                            }
                            console.log("productStockHold", productStockHold, this.groupPosition);
                        }
                    }
                });
                this.productstockhold = "";
                this.hadStockHold = false;
                this.groupPosition = [];
                this.tradePoint.send(this.productAppID, 230, { body: { begin_date: this.startDate, end_date: this.startDate, tblock_id: tblockId } });

                this.hadNetData = false;
                this.netTableValue = [];
                this.netValueString = "";
                this.tradePoint.send(this.productAppID, 226, { body: { type: 0, id: tblockId, begin_date: this.startDate, end_date: this.endDate } });
                console.log("send setNetTableValue", tblockId, this.startDate, this.endDate);
            }
        } else {
            alert("对冲比例必须为数字或空！");
        }
    }

    searchresult() {
        console.log(this.activeTab);
        this.openDate = this.opendate.replace(/-/g, "");
        this.closeDate = this.closedate.replace(/-/g, "");
        console.log(this.openDate, this.closeDate);

        this.readAndHandleAlpha();
        let startDateIndex = 1, endDateIndex = this.alphaData.length - 2;
        for (let i = 0; i < this.alphaData.length; i++) {
            if (this.alphaData[i][0] === this.openDate) {
                startDateIndex = i;
            }
            if (this.alphaData[i][0] === this.closeDate) {
                endDateIndex = i;
            }
        }
        console.log(startDateIndex, endDateIndex);
        this.setAlphaEchart(this.alphaData, startDateIndex, endDateIndex, this.alphaChart);

        let alphaRelevanceFile = [], dirAlphaFiles = [];

        try {
            dirAlphaFiles = fs.readdirSync(path.join(this.dataDir, "correlation_matrix"));
        } catch (err) {
            console.log("err", err);
            return;
        }

        if (dirAlphaFiles.length === 0) {
            alert("您选择的路径内没有文件,无法计算");
            return;
        }
        for (let fileIndex = 0; fileIndex < dirAlphaFiles.length; ++fileIndex) {   // csv文件在打开时可能还有其他的文件存在
            if ((this.openDate === "" || this.closeDate === "")) {
                alert("请选择时间范围");
                return;
            }
            if (this.openDate !== "" && dirAlphaFiles[fileIndex] < (this.openDate + ".csv")) {
                continue;
            }
            if (this.closeDate !== "" && dirAlphaFiles[fileIndex] > (this.closeDate + ".csv")) {
                continue;
            }
            alphaRelevanceFile.push(dirAlphaFiles[fileIndex]);
        }
        console.log("alphaRelevanceFile", alphaRelevanceFile);
        for (let fileIndex = 0; fileIndex < alphaRelevanceFile.length; ++fileIndex) {
            this.readAndHandleAlphaRelevance(path.join(this.dataDir, "correlation_matrix", alphaRelevanceFile[fileIndex]));
            if (fileIndex === 0) {
                this.alphaRelevanceResult = this.alphaRelevance;
            }
            this.alphaRelevanceResult = this.averageValue(this.alphaRelevanceResult, this.alphaRelevance);
        }
        for (let i = 1; i < this.alphaRelevanceResult.length; i++) {
            for (let j = 1; j < this.alphaRelevanceResult[1].length; j++) {
                this.alphaRelevanceResult[i][j] = this.alphaRelevanceResult[i][j].toFixed(4);
            }
        }
        this.setAlphaHotEchart(this.alphaRelevanceResult, this.alphaHotChart);

    }

    // 计算平均值
    averageValue(arrA, arrB) {
        for (let i = 1; i < arrB.length; i++) {
            for (let j = 1; j < arrB[i].length; j++) {
                arrA[i][j] = parseFloat(arrA[i][j]);
                arrB[i][j] = parseFloat(arrB[i][j]);
                if (isNaN(arrA[i][j])) {
                    arrA[i][j] = 0;
                }
                if (isNaN(arrB[i][j])) {
                    arrB[i][j] = 0;
                }
                arrA[i][j] = (arrA[i][j] + arrB[i][j]) / 2;
                // arrA[i][j] = arrA[i][j].toFixed(2);
            }
        }
        return arrA;
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
            if (!result) {
                return;
            }
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

            for (let i = 1; i < riskFactorReturn[returnDateIndex].length; ++i) {    // 循环风险因子收益

                if (typeof holdStockExposure[stockIndex]["returnAttr"][i - 1] === "undefined") {
                    holdStockExposure[stockIndex]["returnAttr"][i - 1] = 0;
                }

                holdStockExposure[stockIndex]["allRiskFactorReturnAttr"] += riskFactorReturn[returnDateIndex][i] * holdStockExposure[stockIndex]["stockExposure"][i - 1];   // 累加单个股票在所有收益因子下的收益归因
                holdStockExposure[stockIndex]["returnAttr"][i - 1] += riskFactorReturn[returnDateIndex][i] * holdStockExposure[stockIndex]["stockExposure"][i - 1];   // 保存单个股票在各个收益因子下的收益归因
            }

        }


    }

    // 设置收益的两个图表
    setriskFactorReturnEchart(riskFactorReturn) {

        if (riskFactorReturn.length === 0) {
            console.log("风险因子收益没有数据,请检查重试!");
            return;
        }
        let startDateIndex = 1, endDateIndex = riskFactorReturn.length - 2;

        this.setReturnEchart(riskFactorReturn, startDateIndex, endDateIndex, this.everyDayReturnEchart, this.riskFactorReturnEchart);

        // 初始化最近一年的数据
        let today = new Date(), rfrIndex = 0;
        let thisYearFirstDay = today.getFullYear() + "0101";

        for (let dateIndex = riskFactorReturn.length - 1; dateIndex > 0; --dateIndex) {

            if (riskFactorReturn[dateIndex][this.rfrDateIndex] < thisYearFirstDay) {
                rfrIndex = dateIndex + 1;
                break;
            }

        }

        if (rfrIndex === 0 || rfrIndex === riskFactorReturn.length) {
            alert("没有找到当年的收益数据");
            return;
        }

        this.setReturnEchart(riskFactorReturn, rfrIndex, riskFactorReturn.length - 1, this.everyDayYearReturnEchart, this.lastDayYearReturnEchart);


    }

    // 设置alpha因子展示
    setAlphaEchart(alphaData, startIndex, endIndex, lineChart) {
        let chartLegendData = [], xAxisDatas = [], series = [];    // 分别连续多天对应图例组件数组,x坐标数组,和具体每一条曲线的数据
        let allRiskReturnXAxis = [], allRiskReturnSeries = [];   // 统计总共的x坐标数组,和具体每一条曲线的数据

        for (let riskIndex = 1; riskIndex < alphaData[0].length; ++riskIndex) {    // 遍历每一个风险因子
            let lengendData = { name: alphaData[0][riskIndex] }; // ,textStyle: { color: "#F3F3F5" }
            chartLegendData.push(lengendData);
            allRiskReturnXAxis.push(alphaData[0][riskIndex]);  // 柱状图的x轴分类

            // 具体每一条曲线的数据
            let seriesData = { name: alphaData[0][riskIndex], type: "line", data: [] };
            let riskFactorAllDateReturn = 0;

            for (let i = startIndex; i <= endIndex; ++i) {
                riskFactorAllDateReturn += alphaData[i][riskIndex];
                seriesData.data.push(riskFactorAllDateReturn);
            }

            series.push(seriesData);
            allRiskReturnSeries.push(riskFactorAllDateReturn);
        }

        // 设置x坐标日期数组
        for (let i = startIndex; i <= endIndex; ++i) {
            xAxisDatas.push(alphaData[i][this.rfrDateIndex]);
        }
        console.log(chartLegendData, xAxisDatas, series);
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
                    }
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
    setAlphaHotEchart(alphaArr, hotchart) {
        console.log(alphaArr);
        let xdata = [];
        let ydata = [];
        xdata.push(alphaArr[0][1], alphaArr[0][2], alphaArr[0][3], alphaArr[0][4], alphaArr[0][5], alphaArr[0][6], alphaArr[0][7], alphaArr[0][8], alphaArr[0][9]);
        ydata = xdata;

        for (let i = 0; i < alphaArr.length - 1; i++) {
            for (let j = 0; j < alphaArr[0].length - 1; j++) {
                this.hotChartData.push([i, j, alphaArr[i + 1][j + 1]]);
            }
        }
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
        hotchart.setOption(option);
    }

    // 设置收益的两个图表,有被复用
    setReturnEchart(riskFactorReturn, startIndex, endIndex, lineChart, barChart) {
        let chartLegendData = [], xAxisDatas = [], series = [];    // 分别连续多天对应图例组件数组,x坐标数组,和具体每一条曲线的数据
        let allRiskReturnXAxis = [], allRiskReturnSeries = [];   // 统计总共的x坐标数组,和具体每一条曲线的数据

        for (let riskIndex = 1; riskIndex < riskFactorReturn[0].length; ++riskIndex) {    // 遍历每一个风险因子
            let lengendData = { name: riskFactorReturn[0][riskIndex] }; // ,textStyle: { color: "#F3F3F5" }
            chartLegendData.push(lengendData);
            allRiskReturnXAxis.push(riskFactorReturn[0][riskIndex]);  // 柱状图的x轴分类

            // 具体每一条曲线的数据
            let seriesData = { name: riskFactorReturn[0][riskIndex], type: "line", data: [] };
            let riskFactorAllDateReturn = 0;

            for (let i = startIndex; i <= endIndex; ++i) {
                riskFactorAllDateReturn += riskFactorReturn[i][riskIndex];
                seriesData.data.push(riskFactorAllDateReturn);
            }

            series.push(seriesData);
            allRiskReturnSeries.push(riskFactorAllDateReturn);
        }

        // 设置x坐标日期数组
        for (let i = startIndex; i <= endIndex; ++i) {
            xAxisDatas.push(riskFactorReturn[i][this.rfrDateIndex]);
        }

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
                    }
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
                    }
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
                    }
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
                    }
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
                RiskFactorComponent.productStat = this.iproduct;
            }
            if (this.istrategy) {
                RiskFactorComponent.strategyStat = this.istrategy;
            }
            if (this.iproducts) {
                RiskFactorComponent.productsStat = this.iproducts;
            }
            if (this.istrategys) {
                RiskFactorComponent.strategiesStat = this.istrategys;
            }
            if (this.startdate) {
                RiskFactorComponent.startdateStat = this.startdate;
            }
            if (this.enddate) {
                RiskFactorComponent.enddateStat = this.enddate;
            }
            if (this.hedge) {
                RiskFactorComponent.hedgeStat = this.hedge;
            }
            if (this.hedgeRadio) {
                RiskFactorComponent.hedgeratioStat = this.hedgeRadio;
            } else {
                RiskFactorComponent.hedgeratioStat = 0;
            }
        }
        // 保存用户设置
        if (this.activeTab === "Alpha因子") {
            if (this.opendate) {
                RiskFactorComponent.opendateStat = this.opendate;
            }
            if (this.closedate) {
                RiskFactorComponent.closedateStat = this.closedate;
            }
        }
        // 垃圾回收
        if (this.productData) {
            this.productData = null;
        }
        if (this.strategyData) {
            this.strategyData = null;
        }
        if (this.riskFactorReturnAttr) {
            this.riskFactorReturnAttr = null;
        }
        if (this.riskFactorReturn) {
            this.riskFactorReturn = null;
        }
        if (this.riskFactorExposure) {
            this.riskFactorExposure = null;
        }
        if (this.HedgeRatioData) {
            this.HedgeRatioData = null;
        }
        if (this.alphaRelevance) {
            this.alphaRelevance = null;
        }
        if (this.alphaRelevanceResult) {
            this.alphaRelevanceResult = null;
        }
        if (this.hotChartData) {
            this.hotChartData = null;
        }
        if (this.alphaData) {
            this.alphaData = null;
        }
        if (this.groupPosition) {
            this.groupPosition = null;
        }
        if (this.futurePosition) {
            this.futurePosition = null;
        }
        if (this.netTableValue) {
            this.netTableValue = null;
        }
        if (this.riskFactorReturnEchart) {
            this.riskFactorReturnEchart = null;
        }
        if (this.everyDayReturnEchart) {
            this.everyDayReturnEchart = null;
        }
        if (this.everyDayYearReturnEchart) {
            this.everyDayYearReturnEchart = null;
        }
        if (this.lastDayYearReturnEchart) {
            this.lastDayYearReturnEchart = null;
        }
        if (this.riskFactorExposureEchart) {
            this.riskFactorExposureEchart = null;
        }
        if (this.everyDayRFEEchart) {
            this.everyDayRFEEchart = null;
        }
        if (this.riskFactorReturnAttrEchart) {
            this.riskFactorReturnAttrEchart = null;
        }
        if (this.everyDayRFRAttrEchart) {
            this.everyDayRFRAttrEchart = null;
        }
        if (this.stockAttrEchart) {
            this.stockAttrEchart = null;
        }
        if (this.alphaHotChart) {
            this.alphaHotChart = null;
        }
        if (this.alphaChart) {
            this.alphaChart = null;
        }
    }
}
