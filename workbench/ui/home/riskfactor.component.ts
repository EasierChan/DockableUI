"use strict";

import { Component } from "@angular/core";
//import { File } from "../../../base/api/services/backend.service"; // File operator
import { TradeService } from "../../bll/services";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { IP20Service } from "../../../base/api/services/ip20.service";
import fs = require("@node/fs");
import path = require("path");


@Component({
    moduleId: module.id,
    selector: "riskfactor",
    templateUrl: "riskfactor.component.html",
    styleUrls: ["home.component.css", "riskfactor.component.css"],
    providers: [IP20Service]
})

export class RiskFactorComponent {
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


    iproducts: string[] = ['a', 'b'];
    iproduct: string = 'a';
    info: string = '';
    istrategys: string[] = ['aa', 'bb'];
    istrategy: string = 'aa';

    allRfeResult: array = [];//所有风险因子的收益

    note: string = "hello xiaobo!";

    riskFactorReturn: array = [];
    riskFactorExpose: array = [];
    groupPosition: array = [['000001.SZ', 0.1], ['000002.SZ', 0.6]];

    constructor(private tradePoint: TradeService, private tgw: IP20Service) {
        //this.tgw.connect(12);
        RiskFactorComponent.self = this;
        //this.loadData();

        this.readAndHandleRiskReturn();
    }

    ngOnInit() {
        // receive holdlist
        // this.tradePoint.addSlot({
        //    appid: 123,
        //    packid:   ,
        //    callback: (msg) =>{

        //      }
        // });
        // request holdlist
        // this.tradePoint.send(260, 218, { body: { tblockid: 201 } });
    }

    loadData() {
        // to read a file line by line.
        // File.readLineByLine("", (linestr) => {

        // });
    }


    nextDropdown() {
        //get strategies of this product
        alert("Pl!")
    }

    readAndHandleRiskReturn() {
        this.riskFactorReturn = this.readDataFromCsvFile("/home/muxb/project/riskreturn.csv");
        //处理获取的风险因子收益数据
        if (this.riskFactorReturn.length < 2) {
            alert("风险因子收益没有数据,请导入数据后重试");
            return;
        }
        for (let i = 0; i < this.riskFactorReturn[0].length; ++i) {
            this.riskFactorReturn[0][i] = this.riskFactorReturn[0][i].slice(1, this.riskFactorReturn[0][i].length - 1);
        }

        for (let i = 1; i < this.riskFactorReturn.length; ++i) {

            for (let j = 1; j < this.riskFactorReturn[0].length; ++j) {
                this.riskFactorReturn[i][j] = parseFloat(this.riskFactorReturn[i][j]);
            }
        }
        console.log("handled riskFactorReturn", this.riskFactorReturn);
    }

    calculateRiskFactor(riskFactorReturn, riskFactorExpose, groupPosition, currDate) {
        console.log("calculateRiskFactor");
        let subCodeExpose = [];//保存拥有的所有股票的权重与暴露之乘积
        //let sumOfDayExpose=[];//保存风险因子的权重与暴露之乘积的和
        //for(let i=1;i<riskFactorReturn[0].length;++i){
        //    sumOfDayExpose.push( 0 );
        //}

        console.log("权重与暴露之乘积");

        //权重与暴露之乘积
        for (let index = 0; index < groupPosition.length; ++index) {    //遍历所有的持仓权重
            const singleWeight = groupPosition[index];
            let rfeIndex = this.binarySearchStock(riskFactorExpose, singleWeight[this.posStockIndex], 1, 0);

            if (rfeIndex === -1) {
                alert("没有找到" + singleWeight[this.posStockIndex] + "的暴露,请补全信息!");
                return;
            }
            else {
                let singleExpose = [];
                singleExpose["stockCode"] = singleWeight[this.posStockIndex];

                for (let i = 2; i < riskFactorExpose[rfeIndex].length; ++i) {   //遍历制定暴露的风险因子的暴露
                    console.log("遍历制定暴露的风险因子的暴露", riskFactorExpose[rfeIndex][i], singleWeight[this.posWeightIndex]);

                    singleExpose[i - 2] = riskFactorExpose[rfeIndex][i] * singleWeight[this.posWeightIndex];//这里有一个假设，假定所有数据都不会重复哦  //股票在每个风险因子下的暴露
                    //sumOfDayExpose[i-2]+=riskFactorExpose[rfeIndex][i] * singleWeight[this.posWeightIndex];  //所有的股票在风险因子下的暴露,数据可能不是数字哦
                }

                subCodeExpose.push(singleExpose);
                //console.log("sumOfDayExpose",sumOfDayExpose);
                console.log("subCodeExpose", subCodeExpose);
            }
        }


        let stockReturnAttr = [];//收益归因 riskFactorReturnResult=[],
        //riskFactorReturnResult["date"]=currDate;
        let returnDateIndex = this.binarySearchStock(riskFactorReturn, currDate, this.rfrDateIndex, 1);//查找指定日期的风险因子收益

        if (returnDateIndex === -1) {
            return;
        }

        //计算单个风险因子在所有股票下暴露和风险因子的乘积--也就是收益归因
        for (let i = 1; i < riskFactorReturn[returnDateIndex].length; ++i) {    //循环风险因子收益
            //计算对于组合的收益归因
            //riskFactorReturnResult[ i-1 ]=riskFactorReturn[returnDateIndex][i] * sumOfDayExpose[i-1];


            let allStockReturn = { stockReturn: 0 };
            for (let stockIndex = 0; stockIndex < subCodeExpose.length; ++stockIndex) {   //循环持仓股票
                allStockReturn.stockReturn += riskFactorReturn[returnDateIndex][i] * subCodeExpose[stockIndex][i - 1];  //计算单个股票在所有收益因子下的收益归因
                console.log("allStockReturn", riskFactorReturn[returnDateIndex][i], subCodeExpose[stockIndex][i - 1]);
            }
            stockReturnAttr.push(allStockReturn);
        }
        //this.allRfeResult.push(riskFactorReturnResult);
        console.log("stockReturnAttr", stockReturnAttr);

        let allStockAttr = this.sumOfStockFactor(subCodeExpose, riskFactorReturn, returnDateIndex);
        console.log("allStockAttr", allStockAttr);


        this.setriskFactorReturnEchart(riskFactorReturn, this.startDate, this.endDate);
    }


    readDataFromCsvFile(csvFilePath) {

        console.log("csvFilePath", csvFilePath);
        /*const thisRef=this;
        fs.readFile(csvFilePath,"utf-8",function(err,fileContent){
            if(err){
                console.log("err",err);
                return;
            }
            //console.log("fileContent",fileContent);
            let rowDatas=fileContent.split("\r");

            //分割多行数据
            for(let i=0;i<rowDatas.length;++i){
                if(rowDatas[i] != ""){

                    let splitData=rowDatas[i].split("\n")；
                    for(let j=0;j<splitData.length;++j){
                        if(splitData[j] != ""){
                          resultData.push(splitData[j].split(","));
                        }
                    }
                }
            }
            console.log("csvFilePath resultData",resultData);
            if(callback){
              callback(thisRef);
            }
        });*/


        let resultData = [], fileContent = "";
        try {
            fileContent = fs.readFileSync(csvFilePath, "utf-8");
            console.log("fileContent", fileContent);
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

        console.log("resultData",resultData);
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
        console.log("OnClick",this,this.startDate,this.endDate);
        let exposeFile=[],dirFiles=[];

        try{
            dirFiles=fs.readdirSync("/home/muxb/project/expose");
        }catch(err){
            console.log("err",err);
        }
        console.log("dirFiles",dirFiles);
        for(let fileIndex=0;fileIndex<dirFiles.length;++fileIndex){
            if( (this.startDate !=="" || this.startDate !=="") &&
                (this.startDate !=="" && dirFiles[fileIndex] >= (this.startDate+".csv")) &&
                (this.endDate !=="" && dirFiles[fileIndex] <= (this.endDate+".csv")) ){
                //console.log(dirFiles[fileIndex],fileIndex);
                exposeFile.push( dirFiles[fileIndex] );
            }

        }
        exposeFile.sort();
        console.log("exposeFile",exposeFile);
        for(let fileIndex=0;fileIndex<exposeFile.length;++fileIndex){

            this.riskFactorExpose=this.readDataFromCsvFile("/home/muxb/project/expose/"+exposeFile[fileIndex]);

            if(this.riskFactorReturn.length < 2 ||this.riskFactorExpose.length < 2 ||this.groupPosition.length < 2 ){
                console.log("有数据为空，不能计算数据。");
                return；
            }
            this.riskFactorExpose.splice(0,1);//直接删除掉第一列,应该保证风险因子的顺序给的一致
            this.riskFactorExpose.sort( function (perv,next){
                    if(perv[1]>next[1]){
                        return 1;
                    }else if(perv[1]<next[1]){
                        return -1;
                    }
                    else
                        return 0;
                });

            for(let i=0;i<this.riskFactorExpose.length;++i){
                this.riskFactorExpose[i][this.rfeStockIndex]=this.riskFactorExpose[i][this.rfeStockIndex].slice(1,this.riskFactorExpose[i][this.rfeStockIndex].length-1);
            }
            console.log("modify riskFactorExpose",this.riskFactorExpose);
            this.calculateRiskFactor(this.riskFactorReturn,this.riskFactorExpose,this.groupPosition,exposeFile[fileIndex].split(".")[0]);
        }


    }

    //计算单个股票在所有风险因子下暴露和风险因子的乘积--也就是收益归因
    sumOfStockFactor(holdStockExpose,riskFactorReturn,returnDateIndex){
        let allStockAttr=[];

        for(let stockIndex=0;stockIndex<holdStockExpose.length;++stockIndex){   //循环持仓股票

            let singleStockReturn={stockReturn:0};
            singleStockReturn.stockCode=holdStockExpose[stockIndex].stockCode;

            for(let i=1;i<riskFactorReturn[returnDateIndex].length;++i){    //循环风险因子收益
                singleStockReturn.stockReturn+=riskFactorReturn[returnDateIndex][i]*holdStockExpose[stockIndex][i-1];   //累加单个股票在所有收益因子下的收益归因
                console.log("sumOfStockFactor",riskFactorReturn[returnDateIndex][i],holdStockExpose[stockIndex][i-1],riskFactorReturn[returnDateIndex][i]*holdStockExpose[stockIndex][i-1]);
            }
            allStockAttr.push(singleStockReturn);
        }

        return allStockAttr;

    }

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

          let lengendData={name:riskFactorReturn[0][riskIndex],textStyle: { color: "#F3F3F5" }};
          chartLegendData.push(lengendData);

          allRiskReturnXAxis.push( riskFactorReturn[0][riskIndex] );  //柱状图的x轴分类

          //具体每一条曲线的数据
          let seriesData={name:riskFactorReturn[0][riskIndex] ,type: "line", data: []};
          let riskFactorAllDateReturn=0;

          for(let i=startDateIndex;i<=endDateIndex;++i){
              seriesData.data.push(riskFactorReturn[i][riskIndex]);
              riskFactorAllDateReturn+=riskFactorReturn[i][riskIndex];
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
            color: [
                "#00b", "#0b0"
            ]
        }

        this.riskFactorReturnEchart=echarts.init( document.getElementById("riskFactorReturnEchart") );
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
        this.allDayReturnEchart = echarts.init( document.getElementById("allDayReturnEchart") );
        this.allDayReturnEchart.setOption(allDayOption);
    }


}
