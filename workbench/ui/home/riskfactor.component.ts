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
        this.readDataFromCsvFile("/home/muxb/project/riskreturn.csv",this.riskFactorReturn,this.log);
        this.readDataFromCsvFile("/home/muxb/project/20090115.csv",this.riskFactorExpose,this.calculateRiskFactor);
        console.log("riskFactorReturn",this.riskFactorReturn);
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
    log()
    {
        console.log("123",this);
    }

    calculateRiskFactor(thisRef){
      console.log("calculateRiskFactor",thisRef);
      if(thisRef.riskFactorReturn.length < 2 ||thisRef.riskFactorExpose.length < 2 ||thisRef.groupPosition.length < 2 ){
          console.log("有数据为空，不能计算数据。");
          return；
      }
      

    }


    readDataFromCsvFile(csvFilePath,resultData,callback){

        console.log("csvFilePath",csvFilePath);
        const thisRef=this;
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
        });



        /*try{
            let csvData= fs.readFileSync(csvFilePath,"utf-8");
            console.log("csvData",csvData);
        }catch(err){
            console.log("csvData err",err);
        }*/


        //return resultData;
    }
}
