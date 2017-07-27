"use strict";

import { Component, HostListener } from "@angular/core";
import { File } from "../../../base/api/services/backend.service"; // File operator
import { TradeService } from "../../bll/services";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { IP20Service } from "../../../base/api/services/ip20.service";
import * as echarts from "echarts";
import fs = require("@node/fs");
import path = require("path");


@Component({
    moduleId: module.id,
    selector: "riskfactor",
    templateUrl: "riskfactor.component.html",
    styleUrls: ["home.component.css", "riskfactor.component.css"],
    providers: [IP20Service],
    inputs: ["activeTab"]
})

export class RiskFactorComponent {
    activeTab: string;

    static self: any;
    posStockIndex: number = 0;

    posWeightIndex: number = 1;
    rfrDateIndex: number = 0;
    rfeDateIndex: number = 0;
    rfeStockIndex: number = 1;

    styleObj: any;
    dataSource: any;

    startDate: string = "20090115";
    endDate: string = "20090116";

    hedgeRadio: number;

    riskFactorReturnEchart: any;//echart
    allDayReturnEchart: any;
    yearReturnEchart: any;
    allDayYearReturnEchart: any;
    riskFactorExposureEchart: any;
    everyDayRFEEchart: any;
    riskFactorReturnAttrEchart: any;
    everyDayRFRAttrEchart: any;

    defaultMedia: any;

    stockAttrEchart: any;

    productData: any[];
    strategyData: any[];
    iproducts: string[];
    iproduct: string;
    istrategys: string[] = ["选择所有策略"];
    istrategy: string;

    riskFactorReturnAttr: any[] = [];// 风险因子收益归因
    riskFactorReturn: any[] = [];
    riskFactorExpose: any[] = [];

    groupPosition: any[] = [{ stockCode: "000001.SZ", stockWeight: 0.1 }, { stockCode: "000002.SZ", stockWeight: 0.6 }];

    constructor(private tradePoint: TradeService, private tgw: IP20Service) {
        RiskFactorComponent.self = this;
        // this.loadData();
        this.iproducts = [];

        this.readAndHandleRiskReturn();

        this.defaultMedia= [{
              option: {
                grid: {
                  left: "10%",
                 right: "10%"
                }
              }
          } , {
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

    }

    ngOnInit() {
        console.info(this.activeTab);

        // receive holdlist
        this.tradePoint.addSlot({
            appid: 260,
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

                let tblockId = RiskFactorComponent.self.productData[0].tblock_id;
                // index strategies
                this.tradePoint.addSlot({
                    appid: 260,
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
                        this.lookReturn();
                    }
                });
                console.log(RiskFactorComponent.self.istrategys);
                RiskFactorComponent.self.istrategy = RiskFactorComponent.self.istrategys[0];
                this.tradePoint.send(260, 218, { body: { tblock_id: tblockId } });
            }
        });



        this.riskFactorReturnEchart=echarts.init( document.getElementById("riskFactorReturnEchart") as HTMLDivElement );
        this.allDayReturnEchart=echarts.init( document.getElementById("allDayReturnEchart") as HTMLDivElement );
        this.yearReturnEchart=echarts.init( document.getElementById("yearReturnEchart") as HTMLDivElement );
        this.allDayYearReturnEchart=echarts.init( document.getElementById("allDayYearReturnEchart") as HTMLDivElement );

        this.riskFactorExposureEchart=echarts.init( document.getElementById("riskFactorExposureEchart") as HTMLDivElement );
        this.everyDayRFEEchart=echarts.init( document.getElementById("everyDayRFEEchart") as HTMLDivElement );
        this.riskFactorReturnAttrEchart=echarts.init( document.getElementById("riskFactorReturnAttrEchart") as HTMLDivElement );
        this.everyDayRFRAttrEchart=echarts.init( document.getElementById("everyDayRFRAttrEchart") as HTMLDivElement );

        this.stockAttrEchart=echarts.init( document.getElementById("stockAttrEchart") as HTMLDivElement );


        if (this.activeTab === "Profit") {
            this.setriskFactorReturnEchart(this.riskFactorReturn);
        }
        else if (this.activeTab === "RiskFactors") {

        }

        this.tradePoint.send(260, 224, { body: { tblock_type: 2 } });

        this.hedgeRadio = 1;
        window.onresize = () => {
            this.resizeFunction();
        };
    }

    loadData() {
        // to read a file line by line.
        let arr = [];
        File.readLineByLine("/mnt/dropbox/risk/riskreturn.csv", (linestr) => {
            console.log("readLineByLine", linestr);
            arr.push(linestr);

        });
        console.log("console.log(arr);", arr);
    }

    resizeFunction() {
        this.riskFactorReturnEchart.resize();
        this.allDayReturnEchart.resize();
        this.yearReturnEchart.resize();
        this.allDayYearReturnEchart.resize();

        this.riskFactorExposureEchart.resize();
        this.everyDayRFEEchart.resize();
        this.riskFactorReturnAttrEchart.resize();
        this.everyDayRFRAttrEchart.resize();

        this.stockAttrEchart.resize();

    }


    nextDropdown() {
        //get strategies of this product
        RiskFactorComponent.self.istrategys = ["选择所有策略"];
        console.log(RiskFactorComponent.self.productData);
        let productlist = document.getElementById("product");
        let productIndex = productlist.selectedIndex;
        let tblockId = RiskFactorComponent.self.productData[productIndex].tblock_id;
        console.log(productIndex);
        // strategies
        this.tradePoint.addSlot({
            appid: 260,
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
        this.tradePoint.send(260, 218, { body: { tblock_id: tblockId } });
    }

    readAndHandleRiskReturn() {
        this.riskFactorReturn = this.readDataFromCsvFile("/mnt/dropbox/risk/riskreturn.csv");
        // 处理获取的风险因子收益数据
        if (this.riskFactorReturn.length < 2) {
            alert("风险因子收益没有数据,请导入数据后重试");
            return;
        }

        for (let i = 1; i < this.riskFactorReturn.length; ++i) {

            for (let j = 1; j < this.riskFactorReturn[0].length; ++j) {
                var value = parseFloat(this.riskFactorReturn[i][j]);

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

        let startDateIndex = this.binarySearchStock(this.riskFactorReturn, this.startDate, this.rfrDateIndex, 1);// 查找指定日期的风险因子收益

        if (startDateIndex === -1) {
            startDateIndex = 1;

        }

        let endDateIndex = this.binarySearchStock(this.riskFactorReturn, this.endDate, this.rfrDateIndex, 1);// 查找指定日期的风险因子收益

        if (endDateIndex === -1) {
            endDateIndex = this.riskFactorReturn.length - 1;

        }
        console.log("this.endDate", this.endDate);
        console.log("handled riskFactorReturn", this.riskFactorReturn);
    }


    readAndHandleRiskExposure(exposureFilePath) {
        this.riskFactorExposure = this.readDataFromCsvFile(exposureFilePath);

        if (this.riskFactorExposure.length < 2) {
            console.log("暴露数据为空，不能计算数据。");
            return；
        }
        this.riskFactorExposure.splice(0,1);//直接删除掉第一列,应该保证风险因子的顺序给的一致
        this.riskFactorExposure.sort( function (perv,next){
                if(perv[1]>next[1]){
                    return 1;
                }else if(perv[1]<next[1]){
                    return -1;
                }
                else
                    return 0;
            });

        for(let i=0;i<this.riskFactorExposure.length;++i){

            for(let j=2; j<this.riskFactorExposure[0].length; ++j ){
                var value= parseFloat(this.riskFactorExposure[i][j]);
                if( isNaN(value)){
                    this.riskFactorExposure[i][j]=0;
                } else {
                    this.riskFactorExposure[i][j]=value;
                }

            }

        }
        console.log("modify riskFactorExposure",exposureFilePath,this.riskFactorExposure);
    }


    //成功返回true,否则返回false
    calculateRiskFactor(riskFactorReturn,riskFactorExposure,groupPosition,sumOfDayExposure,currDate){
        let oneDayExposure=[],oneDayReturnAttr=[];

        for(let i=1; i< riskFactorReturn[0].length; ++i){
            oneDayExposure.push( {name: riskFactorReturn[0][i], exposure:0} );
        }

        //权重与暴露之乘积
        for(let index=0; index<groupPosition.length; ++index){    //遍历所有的持仓权重
            const singleStock=groupPosition[index];
            let rfeIndex=this.binarySearchStock(riskFactorExposure,singleStock.stockCode,1,0);

            if(rfeIndex === -1) {
                alert("没有找到"+singleStock.stockCode+"的暴露,请补全信息!");

                return false;
            }
            else{

                for(let i=2;i<riskFactorExposure[rfeIndex].length;++i){   //遍历指定暴露的风险因子的暴露
                    singleStock["stockExposure"][ i-2 ]=riskFactorExposure[rfeIndex][i] * singleStock.stockWeight;//这里有一个假设，假定所有数据都不会重复哦  //股票在每个风险因子下的暴露
                }

            }

        }

        // 计算各个风险因子当天的总的暴露
        for (let i = 2; i < riskFactorExposure[0].length; i++) {    //遍历风险因子的暴露

            for(let stockExpIndex=0; stockExpIndex < groupPosition.length; ++stockExpIndex){
              oneDayExposure[i-2].exposure += groupPosition[stockExpIndex]["stockExposure"][i-2];
            }

        }

        sumOfDayExposure.push(oneDayExposure);
        sumOfDayExposure[sumOfDayExposure.length-1].date=currDate;

        let returnDateIndex=this.binarySearchStock(riskFactorReturn,currDate,this.rfrDateIndex,1);//查找指定日期的风险因子收益

        if (returnDateIndex === -1) {
            return;
        }

        //计算单个股票在所有风险因子下暴露和风险因子的乘积--也就是收益归因
        this.sumOfStockFactorReturnAttr(groupPosition,riskFactorReturn,returnDateIndex);

        //计算单个风险因子在所有股票下暴露和风险因子的乘积--也就是收益归因
        for(let i=1; i<riskFactorReturn[returnDateIndex].length; ++i) {    //循环风险因子收益

            let returnAttr=0 ;
            //计算对于组合的收益归因
            for(let stockIndex = 0; stockIndex < groupPosition.length; ++stockIndex) {   //循环持仓股票的暴露
                returnAttr += groupPosition[stockIndex]["returnAttr"][i-1];
            }
            oneDayReturnAttr.push(returnAttr);

        }

        this.riskFactorReturnAttr.push(oneDayReturnAttr);
        this.riskFactorReturnAttr[this.riskFactorReturnAttr.length-1].date=currDate;

        return true;

    }


    readDataFromCsvFile(csvFilePath) {

        console.log("csvFilePath", csvFilePath);

        let resultData = [], fileContent = "";
        try {
            fileContent = fs.readFileSync(csvFilePath, "utf-8");

        } catch (err) {
            console.log("fileContent err", err);
        }

        let rowDatas = fileContent.split("\r");

        //分割多行数据
        for (let i = 0; i < rowDatas.length; ++i) {
            if (rowDatas[i] != "") {

                let splitData = rowDatas[i].split("\n")；
                for(let j=0;j<splitData.length;++j){
                    if(splitData[j] != ""){
                      resultData.push(splitData[j].split(","));
                    }
                }
            }
        }

        return resultData;
    }

    binarySearchStock(arr,source,member,start,end) {
      start=start||0;
      end=end||arr.length-1;
      let mid=-1;

      while(start<=end){
        mid=Math.floor((start+end)/2);

        if (arr[mid][member] < source) {
           start=mid+1;
        }else if (arr[mid][member]>source){
          end=mid-1;
        }else{
          return mid;
        }
      }
      return -1;
    }

    lookReturn(){
      let productlist = document.getElementById("product");
      let productIndex = productlist.selectedIndex;
      let tblockId = RiskFactorComponent.self.productData[productIndex].tblock_id;
      //console.log(this.startDate,tblockId);
      if(!isNaN(this.hedgeRadio)){
        let strategylist = document.getElementById("strategy");
        let strategyIndex = strategylist.selectedIndex;
        console.log(strategyIndex);
        if(strategyIndex>0){
        let strategyId = RiskFactorComponent.self.strategyData[strategyIndex-1].strategy_id;
        console.log(this.startDate,strategyId);
        console.log(this.startDate,tblockId);
        // strategyfuturehold
        this.tradePoint.addSlot({
            appid: 260,
            packid: 220,
           callback: (msg) =>{
              let productStockHold = JSON.parse(msg.content.body);
              console.log("productStockHold",productStockHold);
            }
         });

        this.tradePoint.send(260, 220, { body: { strategy_id:strategyId,begin_date:this.startDate,end_date:this.startDate,product_id:tblockId}});

        // strategystockhold
        this.tradePoint.addSlot({
            appid: 260,
            packid: 222,
           callback: (msg) =>{
                 let productStockHold = JSON.parse(msg.content.body);
                 console.log("productStockHold",productStockHold);
            }
         });

        this.tradePoint.send(260, 222, { body: { strategy_id:strategyId,product_id:tblockId,begin_date:this.startDate,end_date:this.startDate}});
      }  else {
        console.log(this.startDate,tblockId);
        // productfuturehold
         this.tradePoint.addSlot({
             appid: 260,
             packid: 228,
            callback: (msg) =>{
              let productStockHold = JSON.parse(msg.content.body);
              console.log("productStockHold",productStockHold);
             }
          });

         this.tradePoint.send(260, 228, { body: { begin_date:this.startDate,end_date:this.startDate,tblock_id:tblockId } });

        // productstockhold
         this.tradePoint.addSlot({
            appid: 260,
            packid: 230,
            callback: (msg) =>{
              console.log("msg",msg);
              let productStockHold = JSON.parse(msg.content.body);
              console.log("productStockHold",productStockHold);
            }
         });

        this.tradePoint.send(260, 230, { body: { begin_date:this.startDate,end_date:this.startDate,tblock_id:tblockId } });
      }


      this.groupPosition =[ {stockCode:'000001.SZ',stockWeight:0.1}, {stockCode:'000002.SZ', stockWeight:0.6 } ];  // 重新获取组合持仓
      this.groupPosition.forEach(function(element){
            element.stockExposure=[];
            element.returnAttr=[];
            element.allRiskFactorReturnAttr=0;
          }

      );

      console.log("this.groupPosition",this.groupPosition);

        console.log("OnClick",this,this.startDate,this.endDate);
        let exposureFile=[],dirFiles=[];
        let sumOfDayExposure=[];//保存风险因子的权重与暴露之乘积的和

        this.riskFactorReturnAttr=[];
        // for(let i=1; i< this.riskFactorReturn[0].length; ++i){
        //     // sumOfDayExposure.push( {name: this.riskFactorReturn[0][i], exposure:0} );
        //     this.riskFactorReturnAttr.push( {name: this.riskFactorReturn[0][i], returnAttr:0} )
        // }


        try{
            dirFiles=fs.readdirSync("/mnt/dropbox/risk/expo");
        }catch(err){
            console.log("err",err);
            return;
        }
        console.log("dirFiles",dirFiles);
        for(let fileIndex=0;fileIndex<dirFiles.length;++fileIndex){   // csv文件在打开时可能还有其他的文件存在
            if ( (this.startDate =="" && this.startDate =="") ) {

                console.log("请选择时间范围");
                return ;
            }

            if (this.startDate !=="" && dirFiles[fileIndex] < (this.startDate+".csv")) {
                continue;
            }

            if (this.endDate !=="" && dirFiles[fileIndex] > (this.endDate+".csv")) {
                continue;
            }
            exposureFile.push( dirFiles[fileIndex] );
        }
        exposureFile.sort();
        console.log("exposureFile",exposureFile);

        for(let fileIndex=0;fileIndex<exposureFile.length;++fileIndex){

            this.readAndHandleRiskExposure("/mnt/dropbox/risk/expo/"+exposureFile[fileIndex]);
            let result=this.calculateRiskFactor(this.riskFactorReturn,this.riskFactorExposure,this.groupPosition,sumOfDayExposure,exposureFile[fileIndex].split(".")[0]);
            if (!result) {
              return;
            }
        }
        console.log("sumOfDayExposure second",sumOfDayExposure);
        console.log("this.groupPosition,",this.groupPosition);


        this.setriskFactorExposureEchart(sumOfDayExposure, this.groupPosition, this.riskFactorReturn);
        this.setRiskFactorAttrEchart(this.riskFactorReturnAttr, this.riskFactorReturn);
        this.setStockAttrEchart(this.groupPosition);

     }  else {
       alert("HedgeRadio must be number!")
     }
    }

    //计算单个股票在所有风险因子下暴露和风险因子的乘积--也就是收益归因
    sumOfStockFactorReturnAttr(holdStockExposure,riskFactorReturn,returnDateIndex){
        for(let stockIndex=0;stockIndex<holdStockExposure.length;++stockIndex){   //循环持仓股票

            for(let i=1;i<riskFactorReturn[returnDateIndex].length;++i){    //循环风险因子收益

                if (typeof holdStockExposure[stockIndex]["returnAttr"][i-1] == "undefined") {
                  holdStockExposure[stockIndex]["returnAttr"][i-1]=0;
                }

                holdStockExposure[stockIndex]["allRiskFactorReturnAttr"] += riskFactorReturn[returnDateIndex][i] * holdStockExposure[stockIndex]["stockExposure"][i-1];   //累加单个股票在所有收益因子下的收益归因
                holdStockExposure[stockIndex]["returnAttr"][i-1] += riskFactorReturn[returnDateIndex][i] * holdStockExposure[stockIndex]["stockExposure"][i-1];   //累加单个股票在所有收益因子下的收益归因
            }

        }


    }


    //设置收益的两个图标
    setriskFactorReturnEchart(riskFactorReturn){


      // let startDateIndex=this.binarySearchStock(riskFactorReturn,startDate,this.rfrDateIndex,1);//查找指定日期的风险因子收益
      //
      // if(startDateIndex === -1) {
      //     startDateIndex=1;
      //     this.startDate=this.riskFactorReturn[startDateIndex][0];
      // }
      //
      // let endDateIndex=this.binarySearchStock(riskFactorReturn,endDate,this.rfrDateIndex,1);//查找指定日期的风险因子收益
      //
      // if(endDateIndex === -1) {
      //     endDateIndex=riskFactorReturn.length-1;
      //     this.endDate=this.riskFactorReturn[endDateIndex][0];
      // }
      if (riskFactorReturn.length === 0) {
          console.log("风险因子收益没有数据,请检查重试!");
          return ;
      }
      let startDateIndex=1,endDateIndex=riskFactorReturn.length-1;

      this.setReturnEchart(riskFactorReturn,startDateIndex,endDateIndex,this.riskFactorReturnEchart,this.allDayReturnEchart);

      //初始化最近一年的数据
      let today=new Date(),rfrIndex=0;
      let thisYearFirstDay=today.getFullYear()+"0101";

      for(let dateIndex=riskFactorReturn.length-1; dateIndex>0; --dateIndex) {

          if(riskFactorReturn[dateIndex][this.rfrDateIndex] < thisYearFirstDay) {
            rfrIndex=dateIndex+1;
            break;
          }

      }

      if (rfrIndex ===0 || rfrIndex === riskFactorReturn.length) {
          alert("没有找到当年的收益数据");
          return;
      }

      this.setReturnEchart(riskFactorReturn,rfrIndex,riskFactorReturn.length-1,this.yearReturnEchart,this.allDayYearReturnEchart);


    }

    setReturnEchart(riskFactorReturn,startIndex,endIndex,lineChart,barChart){
      let chartLegendData=[],xAxisDatas[],series=[];    //分别连续多天对应图例组件数组,x坐标数组,和具体每一条曲线的数据

      let allRiskReturnSeries=[],allRiskReturnXAxis=[];   //统计总共的x坐标数组,和具体每一条曲线的数据


      for(let riskIndex=1; riskIndex<riskFactorReturn[0].length; ++riskIndex){    //遍历每一个风险因子

          let lengendData={name:riskFactorReturn[0][riskIndex]}; // ,textStyle: { color: "#F3F3F5" }
          chartLegendData.push(lengendData);

          allRiskReturnXAxis.push( riskFactorReturn[0][riskIndex] );  //柱状图的x轴分类

          //具体每一条曲线的数据
          let seriesData={name:riskFactorReturn[0][riskIndex] ,type: "line", data: []};
          let riskFactorAllDateReturn=0;

          for(let i=startIndex; i<=endIndex; ++i){

              riskFactorAllDateReturn += riskFactorReturn[i][riskIndex];
              seriesData.data.push(riskFactorAllDateReturn);
          }
          series.push(seriesData);

          allRiskReturnSeries.push(riskFactorAllDateReturn);
      }
      //设置x坐标日期数组
      for(let i=startIndex;i<=endIndex;++i){
          xAxisDatas.push(riskFactorReturn[i][this.rfrDateIndex]);
      }

      console.log("allRiskReturnSeries,allRiskReturnXAxis",allRiskReturnSeries,allRiskReturnXAxis)

      let option= {
          baseOption: {
              title: {
                  show: false,
              },
              tooltip: {
                  trigger: "axis",
                  axisPointer: {
                      type: "cross",
                      label: { show: true, backgroundColor: "rgba(0,0,0,1)"}
                  },
                  textStyle:{
                      align:"left"
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
      					type: 'inside',
      					xAxisIndex: 0 ,
      					start: 0,
      					end: 100
      				}, {
      						start: 0,
      						end: 10,
      						handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
      						handleSize: '60%',
                  textStyle: {
                    color: "#FFF"
                  }
      						handleStyle: {
      								color: '#fff',
      								shadowBlur: 3,
      								shadowColor: 'rgba(0, 0, 0, 0.6)',
      								shadowOffsetX: 2,
      								shadowOffsetY: 2
      						}
      				}],
              series: series
              // color: [
              //     "#00b", "#0b0"
              // ]
          },
          media: this.defaultMedia

        }

      lineChart.setOption(option);


        let allDayOption= {
            baseOption: {
              title: {
                  show: false,
              },
              tooltip: {
                  trigger: "axis",
                  axisPointer: {
                      type: "cross",
                      label: { show: true, backgroundColor: "rgba(0,0,0,1)"}
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
                      alignWithLabel:true
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
              dataZoom: [{
                type: 'inside',
                xAxisIndex: 0 ,
                start: 0,
                end: 100
              }, {
                  start: 0,
                  end: 10,
                  show: false,
                  handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                  handleSize: '60%',
                  textStyle: {
                    color: "#FFF"
                  }
                  handleStyle: {
                      color: '#fff',
                      shadowBlur: 3,
                      shadowColor: 'rgba(0, 0, 0, 0.6)',
                      shadowOffsetX: 2,
                      shadowOffsetY: 2
                  }
              }],
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

          }

      barChart.setOption(allDayOption);
    }

    //设置风险因子暴露的两个图表
    setriskFactorExposureEchart(everyDayExposure,groupPosition,riskFactorReturn) {

        let riskFactorExposureXAxis=[],riskFactorExposureSeries=[],
        chartLegendData=[],everydayExposureXAxis=[],everydayExposureSeries=[];

        //初始化线图坐标系　　
        for (var i = 0; i < everyDayExposure.length; i++) {
          everydayExposureXAxis.push( everyDayExposure[i].date );
        }

        for(let riskIndex=1; riskIndex<riskFactorReturn[0].length; ++riskIndex){    //遍历每一个风险因子

            let lengendData={name:riskFactorReturn[0][riskIndex]}; // ,textStyle: { color: "#F3F3F5" }
            chartLegendData.push(lengendData);

            riskFactorExposureXAxis.push( riskFactorReturn[0][riskIndex] );  //柱状图的x轴分类

            //具体每一条曲线的数据
            let seriesData={name:riskFactorReturn[0][riskIndex] ,type: "line", data: []};

            for (var i = 0; i < everyDayExposure.length; i++) {
                seriesData.data.push(everyDayExposure[i][riskIndex-1].exposure);
            }
            everydayExposureSeries.push(seriesData);
        }

        //　设置最后一天的数据为柱状图
        if(everyDayExposure.length>1){
            for (var i = 0; i < everyDayExposure[everyDayExposure.length-1].length; i++) {
              riskFactorExposureSeries.push(everyDayExposure[everyDayExposure.length-1][i].exposure);
            }
        }

        let everyDayRFEOption= {
            baseOption: {
                title: {
                    show: false,
                },
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "cross",
                        label: { show: true, backgroundColor: "rgba(0,0,0,1)"}
                    },
                    textStyle:{
                        align:"left"
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
                        alignWithLabel:true
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
                  type: 'inside',
                  xAxisIndex: 0 ,
                  start: 0,
                  end: 100
                }, {
                    start: 0,
                    end: 10,
                    show: false,
                    handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                    handleSize: '60%',
                    textStyle: {
                      color: "#FFF"
                    }
                    handleStyle: {
                        color: '#fff',
                        shadowBlur: 3,
                        shadowColor: 'rgba(0, 0, 0, 0.6)',
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

          }

        this.everyDayRFEEchart.setOption(everyDayRFEOption);


        let riskFactorExposureOption= {
              baseOption: {
                  title: {
                      show: false,
                  },
                  tooltip: {
                      trigger: "axis",
                      axisPointer: {
                          type: "cross",
                          label: { show: true, backgroundColor: "rgba(0,0,0,1)"}
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
                          alignWithLabel:true
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
                  dataZoom: [{
          					type: 'inside',
          					xAxisIndex: 0 ,
          					start: 0,
          					end: 100
          				}, {
          						start: 0,
          						end: 10,
                      show: false,
          						handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
          						handleSize: '60%',
                      textStyle: {
                        color: "#FFF"
                      },
          						handleStyle: {
          								color: '#fff',
          								shadowBlur: 3,
          								shadowColor: 'rgba(0, 0, 0, 0.6)',
          								shadowOffsetX: 2,
          								shadowOffsetY: 2
          						}
          				}],
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

          }

        this.riskFactorExposureEchart.setOption(riskFactorExposureOption);

    }

    setRiskFactorAttrEchart(everyDayRiskFactorAttr, riskFactorReturn){
        let everyDayReturnAttrXAxis=[],everyDayReturnAttrSeries=[],chartLegendData=[];
        let riskFactorAttrXAxis=[],riskFactorAttrSeries=[];

        for (var i = 0; i < everyDayRiskFactorAttr.length; i++) {
            everyDayReturnAttrXAxis.push( everyDayRiskFactorAttr[i].date );
            // riskFactorAttrSeries.push( everyDayRiskFactorAttr[i].returnAttr );
        }

        //计算各种值
        for(let riskIndex=1; riskIndex<riskFactorReturn[0].length; ++riskIndex){    //遍历每一个风险因子

            let lengendData={name:riskFactorReturn[0][riskIndex]}; // ,textStyle: { color: "#F3F3F5" }
            chartLegendData.push(lengendData);

            riskFactorAttrXAxis.push( riskFactorReturn[0][riskIndex] );  //柱状图的x轴分类

            //具体每一条曲线的数据
            let seriesData={name:riskFactorReturn[0][riskIndex] ,type: "line", data: []};
            let allReturnAttr=0;

            for (var i = 0; i < everyDayRiskFactorAttr.length; i++) {
                seriesData.data.push(everyDayRiskFactorAttr[i][riskIndex-1]);
                allReturnAttr+=everyDayRiskFactorAttr[i][riskIndex-1];
            }

            riskFactorAttrSeries.push( allReturnAttr );
            everyDayReturnAttrSeries.push(seriesData);
        }

        console.log("everyDayReturnAttrSeries",everyDayRiskFactorAttr,everyDayReturnAttrSeries,riskFactorAttrSeries);

        let everyDayRFROption= {
              baseOption: {
                title: {
                    show: false,
                },
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "cross",
                        label: { show: true, backgroundColor: "rgba(0,0,0,1)"}
                    },
                    textStyle:{
                        align:"left"
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
                        alignWithLabel:true
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
                  type: 'inside',
                  xAxisIndex: 0 ,
                  start: 0,
                  end: 100
                }, {
                    start: 0,
                    end: 10,
                    show: false,
                    handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                    handleSize: '60%',
                    textStyle: {
                      color: "#FFF"
                    }
                    handleStyle: {
                        color: '#fff',
                        shadowBlur: 3,
                        shadowColor: 'rgba(0, 0, 0, 0.6)',
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

          }

        this.everyDayRFRAttrEchart.setOption(everyDayRFROption);



        let riskFactorAttrOption= {
              baseOption: {
                  title: {
                      show: false,
                  },
                  tooltip: {
                      trigger: "axis",
                      axisPointer: {
                          type: "cross",
                          label: { show: true, backgroundColor: "rgba(0,0,0,1)"}
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
                          alignWithLabel:true
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
                  dataZoom: [{
                    type: 'inside',
                    xAxisIndex: 0 ,
                    start: 0,
                    end: 100
                  }, {
                      start: 0,
                      end: 10,
                      show: false,
                      handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                      handleSize: '60%',
                      textStyle: {
                        color: "#FFF"
                      }
                      handleStyle: {
                          color: '#fff',
                          shadowBlur: 3,
                          shadowColor: 'rgba(0, 0, 0, 0.6)',
                          shadowOffsetX: 2,
                          shadowOffsetY: 2
                      }
                  }],
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

          }

          this.riskFactorReturnAttrEchart.setOption(riskFactorAttrOption);
    }

    setStockAttrEchart(groupPosition){
      let stockAttrXAxis=[],stockAttrSeries=[];


      for (var i = 0; i < groupPosition.length; i++) {
        stockAttrXAxis.push( groupPosition[i].stockCode );
        stockAttrSeries.push( groupPosition[i].allRiskFactorReturnAttr );

      }

      let stockAttrEchart= {
          baseOption: {
              title: {
                  show: false,
              },
              tooltip: {
                  trigger: "axis",
                  axisPointer: {
                      type: "cross",
                      label: { show: true, backgroundColor: "rgba(0,0,0,1)"}
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
                      rotate: -30,
                      interval: 0,
                      textStyle: { color: "#F3F3F5" }
                  },
                  axisLine: {
                      lineStyle: { color: "#F3F3F5" }
                  },
                  axisTick: {
                      alignWithLabel:true
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

        }

        this.stockAttrEchart.setOption(stockAttrEchart);



    }

}
