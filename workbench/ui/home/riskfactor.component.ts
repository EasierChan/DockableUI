"use strict";

import { Component } from "@angular/core";
//import { File } from "../../../base/api/services/backend.service"; // File operator
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

    posWeightIndex: number=1;
    rfrDateIndex: number=0;
    rfeDateIndex: number=0;
    rfeStockIndex: number=1;

    styleObj: any;
    dataSource: any;

    startDate: string = "20090115";
    endDate: string = "20090116";

    hedgeRadio: number;

    riskFactorReturnEchart: any;//echart
    allDayReturnEchart: any;
    stockAttrEchart: any;

    productData:any[];
    iproducts:string[];
    iproduct:string;
    istrategys:string[]=["all"];
    istrategy:string="all";

    riskFactorReturnAttr:  any[] = [];//风险因子收益归因
    riskFactorReturn: any[] =[];
    riskFactorExpose: any[] = [];

    groupPosition: any[] =[ {stockCode:'000001.SZ',stockWeight:0.1}, {stockCode:'000002.SZ', stockWeight:0.6 } ];

    constructor(private tradePoint: TradeService, private tgw: IP20Service) {
        RiskFactorComponent.self = this;
        //this.loadData();

        this.iproducts = [];
        //this.riskFactorReturn=this.readDataFromCsvFile("/mnt/dropbox/risk/riskreturn.csv");

        this.readAndHandleRiskReturn();

    }

    ngOnInit() {
        console.info(this.activeTab);
        // receive holdlist
         this.tradePoint.addSlot({
            appid: 260,
            packid: 224,
            callback: (msg) =>{
            let data = JSON.parse(msg.content.body);
            if (data.msret.msgcode === "00") {
                console.log(msg);
                RiskFactorComponent.self.productData = data.body;
                  console.log(RiskFactorComponent.self.productData);
                console.log(RiskFactorComponent.self.productData[0].tblock_full_name);
                for(let i = 0; i < RiskFactorComponent.self.productData.length; i++){
                  RiskFactorComponent.self.iproducts.push(RiskFactorComponent.self.productData[i].tblock_full_name);

                }
            } else {
                alert("Get product info Failed! " + data.msret.msg);
            }
            console.log(RiskFactorComponent.self.iproducts)
            RiskFactorComponent.self.iproduct = RiskFactorComponent.self.iproducts[0];
            }
         });
        // request holdlist
        // this.tradePoint.addSlot({
        //    appid: 260,
        //    packid: 218,
        //    callback: (msg) =>{
        //    let data = JSON.parse(msg.content.body);
        //    if (data.msret.msgcode === "00") {
        //        console.log("strategy_id",msg);
        //        let productData = data.body;
        //
        //        for(let i = 0; i < productData.length; i++){
        //          console.log("strategy_id strategy_id",productData[i].strategy_id,productData[i].strategy_name);
        //
        //        }
        //    } else {
        //        alert("Get strategy_id info Failed! " + data.msret.msg);
        //    }
        //
        //    }
        // });
        //
        // this.tradePoint.send(260, 218, { body: { tblock_id:203 } });

        this.riskFactorReturnEchart=echarts.init( document.getElementById("riskFactorReturnEchart") );
        this.allDayReturnEchart=echarts.init( document.getElementById("allDayReturnEchart") );
        this.riskFactorExposureEchart=echarts.init( document.getElementById("riskFactorExposureEchart") );
        this.riskFactorReturnAttrEchart=echarts.init( document.getElementById("riskFactorReturnAttrEchart") );
        this.stockAttrEchart=echarts.init( document.getElementById("stockAttrEchart") );

        this.tradePoint.send(260, 224, { body: { tblock_type: 2 } });


    }

    loadData() {
        // to read a file line by line.
        // File.readLineByLine("", (linestr) => {

        // });
    }


    nextDropdown(){
    //get strategies of this product
    console.log(RiskFactorComponent.self.iproduct);
    var productlist = document.getElementById("product");
    var productIndex = productlist.selectedIndex;
    var tblockId = RiskFactorComponent.self.productData[productIndex].tblock_id;

    // strategies
     this.tradePoint.addSlot({
        appid: 260,
        packid: 218,
        callback: (msg) =>{
          console.log(msg);
          let data = JSON.parse(msg.content.body);
          if (data.msret.msgcode === "00") {
              console.log(msg);
          } else {
                alert("Get product info Failed! " + data.msret.msg);
            }
        }
     });
    console.log(tblockId);
    this.tradePoint.send(260, 218, { body: { tblock_id:tblockId } });

    }

    readAndHandleRiskReturn() {
        this.riskFactorReturn = this.readDataFromCsvFile("/mnt/dropbox/risk/riskreturn.csv");
        //处理获取的风险因子收益数据
        if (this.riskFactorReturn.length < 2) {
            alert("风险因子收益没有数据,请导入数据后重试");
            return;
        }
        for (let i = 0; i < this.riskFactorReturn[0].length; ++i) {
            this.riskFactorReturn[0][i] = this.riskFactorReturn[0][i].slice(1, this.riskFactorReturn[0][i].length - 1);
        }

        for (let i = 1; i < this.riskFactorReturn.length; ++i) {

            for(let j=1; j<this.riskFactorReturn[0].length; ++j ){
                var value= parseFloat(this.riskFactorReturn[i][j]);
                if( isNaN(value)){
                    this.riskFactorReturn[i][j]=0;
                } else {
                    this.riskFactorReturn[i][j]=value;
                }

            }
        }

        let startDateIndex=this.binarySearchStock(this.riskFactorReturn,this.startDate,this.rfrDateIndex,1);//查找指定日期的风险因子收益

        if(startDateIndex === -1) {
            startDateIndex=1;
            this.startDate=this.riskFactorReturn[startDateIndex];
        }

        let endDateIndex=this.binarySearchStock(this.riskFactorReturn,this.endDate,this.rfrDateIndex,1);//查找指定日期的风险因子收益

        if(endDateIndex === -1) {
            endDateIndex=this.riskFactorReturn.length-1;
            this.endDate=this.riskFactorReturn[endDateIndex];
        }
        console.log("this.endDate", this.endDate);
        console.log("handled riskFactorReturn", this.riskFactorReturn);
    }


    readAndHandleRiskExposure(exposureFilePath) {
        this.riskFactorExposure=this.readDataFromCsvFile(exposureFilePath);

        if(this.riskFactorExposure.length < 2 ){
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
            this.riskFactorExposure[i][this.rfeStockIndex]=this.riskFactorExposure[i][this.rfeStockIndex].slice(1,this.riskFactorExposure[i][this.rfeStockIndex].length-1);

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

    calculateRiskFactor(riskFactorReturn,riskFactorExposure,groupPosition,sumOfDayExposure,currDate){
        console.log("权重与暴露之乘积");

        //权重与暴露之乘积
        for(let index=0; index<groupPosition.length; ++index){    //遍历所有的持仓权重
            const singleStock=groupPosition[index];
            let rfeIndex=this.binarySearchStock(riskFactorExposure,singleStock.stockCode,1,0);

            if(rfeIndex === -1) {
                alert("没有找到"+singleStock.stockCode+"的暴露,请补全信息!");

                return;
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
              sumOfDayExposure[i-2].exposure += groupPosition[stockExpIndex]["stockExposure"][i-2];
            }

        }

      let returnDateIndex=this.binarySearchStock(riskFactorReturn,currDate,this.rfrDateIndex,1);//查找指定日期的风险因子收益

        if (returnDateIndex === -1) {
            return;
        }

        //计算单个风险因子在所有股票下暴露和风险因子的乘积--也就是收益归因
        for(let i=1;i<riskFactorReturn[returnDateIndex].length;++i){    //循环风险因子收益
            //计算对于组合的收益归因
            for(let stockIndex = 0; stockIndex < groupPosition.length; ++stockIndex){   //循环持仓股票的暴露
                this.riskFactorReturnAttr[i-1].returnAttr += riskFactorReturn[returnDateIndex][i] * groupPosition[stockIndex]["stockExposure"][i-1];
            }

        }

        console.log("riskFactorReturnAttr",this.riskFactorReturnAttr);

        this.sumOfStockFactorReturnAttr(groupPosition,riskFactorReturn,returnDateIndex);
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

    binarySearchStock(arr,source,member,start,end){
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
      // futurehold
      //  this.tradePoint.addSlot({
      //     appid: 260,
      //     packid: 220,
      //     callback: (msg) =>{
      //     console.log(msg);
      //     }
      //  });
      //
      //this.tradePoint.send(260, 220, { body: { strategy_id:strategyId,trday:date } });

      // stockhold
       this.tradePoint.addSlot({
          appid: 260,
          packid: 222,
          callback: (msg) =>{
          console.log('tradePoint.addSlot',msg);
          }
       });

      this.tradePoint.send(260, 222, { body: { strategy_id:116,trday:this.startDate } });


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
        for(let i=1; i< this.riskFactorReturn[0].length; ++i){
            sumOfDayExposure.push( {name: this.riskFactorReturn[0][i], exposure:0} );
            this.riskFactorReturnAttr.push( {name: this.riskFactorReturn[0][i], returnAttr:0} )
        }


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
            this.calculateRiskFactor(this.riskFactorReturn,this.riskFactorExposure,this.groupPosition,sumOfDayExposure,exposureFile[fileIndex].split(".")[0]);
        }
        console.log("sumOfDayExposure second",sumOfDayExposure);
        console.log("this.groupPosition,",this.groupPosition);

        this.setriskFactorReturnEchart(this.riskFactorReturn,this.startDate,this.endDate);
        this.setriskFactorExposureEchart(sumOfDayExposure);
        this.setRiskFactorAttrEchart(this.riskFactorReturnAttr);
        this.setStockAttrEchart(this.groupPosition);


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
    setriskFactorReturnEchart(riskFactorReturn,startDate,endDate){
      console.log("setriskFactorReturnEchart");

      let startDateIndex=this.binarySearchStock(riskFactorReturn,startDate,this.rfrDateIndex,1);//查找指定日期的风险因子收益

      if(startDateIndex === -1) {
          startDateIndex=1;
      }

      let endDateIndex=this.binarySearchStock(riskFactorReturn,endDate,this.rfrDateIndex,1);//查找指定日期的风险因子收益

      if(endDateIndex === -1) {
          endDateIndex=riskFactorReturn.length-1;
      }

      let chartLegendData=[],xAxisDatas[],series=[];    //分别连续多天对应图例组件数组,x坐标数组,和具体每一条曲线的数据

      let allRiskReturnSeries=[],allRiskReturnXAxis=[];   //统计总共的x坐标数组,和具体每一条曲线的数据


      for(let riskIndex=1; riskIndex<riskFactorReturn[0].length; ++riskIndex){    //遍历每一个风险因子

          let lengendData={name:riskFactorReturn[0][riskIndex]}; // ,textStyle: { color: "#F3F3F5" }
          chartLegendData.push(lengendData);

          allRiskReturnXAxis.push( riskFactorReturn[0][riskIndex] );  //柱状图的x轴分类

          //具体每一条曲线的数据
          let seriesData={name:riskFactorReturn[0][riskIndex] ,type: "line", data: []};
          let riskFactorAllDateReturn=0;

          for(let i=startDateIndex; i<=endDateIndex; ++i){
              seriesData.data.push(riskFactorReturn[i][riskIndex]);
              riskFactorAllDateReturn += riskFactorReturn[i][riskIndex];
          }
          series.push(seriesData);

          allRiskReturnSeries.push(riskFactorAllDateReturn);
      }

      //设置x坐标日期数组
      for(let i=startDateIndex;i<=endDateIndex;++i){
          xAxisDatas.push(riskFactorReturn[i][this.rfrDateIndex]);
      }

      console.log("allRiskReturnSeries,allRiskReturnXAxis",allRiskReturnSeries,allRiskReturnXAxis)

      let option= {
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
                position: "right",
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
            series: series,
            // color: [
            //     "#00b", "#0b0"
            // ]
        }

        this.riskFactorReturnEchart.setOption(option);

        let allDayOption= {
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
                  axisLabel: {
                      textStyle: { color: "#F3F3F5" }
                  },
                  axisLine: {
                      lineStyle: { color: "#F3F3F5" }
                  }
              },
              yAxis: {
                  position: "right",
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
                      name: "风险因子收益",
                      type: "bar",
                      data: allRiskReturnSeries
                  }
              ],
              color: [
                  "#00b", "#0b0"
              ]
          }

        this.allDayReturnEchart.setOption(allDayOption);
    }

    //设置风险因子暴露的两个图表
    setriskFactorExposureEchart(riskFactorExposure){

        let riskFactorExposureXAxis=[],riskFactorExposureSeries=[];


        for (var i = 0; i < riskFactorExposure.length; i++) {
          riskFactorExposureXAxis.push( riskFactorExposure[i].name );
          riskFactorExposureSeries.push( riskFactorExposure[i].exposure );

        }

        let riskFactorExposureOption= {
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
                  axisLabel: {
                      textStyle: { color: "#F3F3F5" }
                  },
                  axisLine: {
                      lineStyle: { color: "#F3F3F5" }
                  }
              },
              yAxis: {
                  position: "right",
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
                      name: "风险因子暴露",
                      type: "bar",
                      data: riskFactorExposureSeries
                  }
              ],
              color: [
                  "#00b", "#0b0"
              ]
          }

          this.riskFactorExposureEchart.setOption(riskFactorExposureOption);
    }

    setRiskFactorAttrEchart(riskFactorAttr){
        let riskFactorAttrXAxis=[],riskFactorAttrSeries=[];


        for (var i = 0; i < riskFactorAttr.length; i++) {
          riskFactorAttrXAxis.push( riskFactorAttr[i].name );
          riskFactorAttrSeries.push( riskFactorAttr[i].returnAttr );

        }

        let riskFactorAttrOption= {
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
                  axisLabel: {
                      textStyle: { color: "#F3F3F5" }
                  },
                  axisLine: {
                      lineStyle: { color: "#F3F3F5" }
                  }
              },
              yAxis: {
                  position: "right",
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
                      name: "风险因子归因",
                      type: "bar",
                      data: riskFactorAttrSeries
                  }
              ],
              color: [
                  "#00b", "#0b0"
              ]
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
                axisLabel: {
                    textStyle: { color: "#F3F3F5" }
                },
                axisLine: {
                    lineStyle: { color: "#F3F3F5" }
                }
            },
            yAxis: {
                position: "right",
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
            color: [
                "#00b", "#0b0"
            ]
        }

        this.stockAttrEchart.setOption(stockAttrEchart);

    }

}
