"use strict";

import { Component } from "@angular/core";
import { File } from "../../../base/api/services/backend.service"; // File operator
import { TradeService } from "../../bll/services";
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

    posStockIndex: number=0;
    posWeightIndex: number=1;
    rfrDateIndex: number=0;
    rfeDateIndex: number=0;
    rfeStockIndex: number=1;

    styleObj: any;
    dataSource: any;
    note: string = "hello xiaobo!";
    riskFactorReturn: array =[];
    riskFactorExpose: array =[];
    groupPosition: array =[["000001.SZ",0.1],["000002.SZ",0.6],["000004.SZ",0.2]];

    constructor(private tradePoint: TradeService,private tgw: IP20Service) {
        //this.tgw.connect(12);

        this.loadData();
        //this.calculateRiskFactor(this);
        this.riskFactorReturn=this.readDataFromCsvFile("/home/muxb/project/riskreturn.csv");
        this.riskFactorExpose=this.readDataFromCsvFile("/home/muxb/project/20090115.csv");

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
        this.calculateRiskFactor(this.riskFactorReturn,this.riskFactorExpose,this.groupPosition);


    }

    ngOnInit() {
        // receive holdlist
        // this.tradePoint.addSlot({
        //
        // });
        // request holdlist
        // this.tradePoint.send();
    }

    loadData() {
        // to read a file line by line.
        // File.readLineByLine("", (linestr) => {

        // });
    }

    calculateRiskFactor(riskFactorReturn,riskFactorExpose,groupPosition){
        console.log("calculateRiskFactor");
        let subCodeExpose=[];//保存拥有的所有股票的权重与暴露之乘积
        let sumOfDayExpose=[];//保存风险因子的权重与暴露之乘积的和
        for(let i=1;i<riskFactorReturn[0].length;++i){
            sumOfDayExpose.push([ riskFactorReturn[0][i], 0 ]);
        }



        //权重与暴露之乘积
        groupPosition.forEach(function(singleWeight,index,array){
            var binarySearchStock(riskFactorExpose,singleWeight[0],1,1);
            if(binarySearchStock === -1){
                return;
            }
            else{
                //var singleExpose={};
                //singleExpose.stockCode=singleWeight[ 0 ];
                for(let i=2;i<riskFactorExpose[binarySearchStock].length;++i){

                    //singleExpose[ (""+riskFactorExpose[0][i]) ]=riskFactorExpose[binarySearchStock][i] * singleWeight[1];//这里有一个假设，假定所有数据都不会重复哦
                    sumOfDayExpose[i-2][1]+=riskFactorExpose[binarySearchStock][i] * singleWeight[1];
                }
                console.log("sumOfDayExpose",sumOfDayExpose);
                //subCodeExpose.push(singleExpose);
            }


      });

      let riskFactorReturnResult=[];
      //计算暴露和风险因子的乘积
      for(let i=1;i<riskFactorReturn[1].length;++i){
          riskFactorReturnResult[ riskFactorReturn[0][i] ]=riskFactorReturn[1][i] * sumOfDayExpose[i-1][1];
      }
      console.log("riskFactorReturnResult",riskFactorReturnResult);
    }


    readDataFromCsvFile(csvFilePath){

        console.log("csvFilePath",csvFilePath);
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


        let resultData=[],fileContent="";
        try{
            fileContent= fs.readFileSync(csvFilePath,"utf-8");
            console.log("fileContent",fileContent);
        }catch(err){
            console.log("fileContent err",err);
        }

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

        console.log("resultData",resultData);
        return resultData;
    }

    binarySearchStock(arr,source,member,start,end){
      start=start||0;
      end=end||arr.length-1;
      var mid=-1;

      while(start<=end){
        mid=Math.floor((start+end)/2);

        if (arr[mid][member] < source) {
          return mid+1;
        }else if (arr[mid][member]>source){
          end=mid-1;
        }else{
          start=mid;
        }
      }
      return -1;
    }



}
