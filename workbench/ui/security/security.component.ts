"use strict";

import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from "@angular/core";
import { DataTable, DataTableColumn, ChartViewer, Section, ListItem } from "../../../base/controls/control";
import { SecuMasterService } from "../../../base/api/services/backend.service";
import { TradeService, QuoteService } from "../../bll/services";
import { ECharts } from "echarts";

@Component({
    moduleId: module.id,
    selector: "security-master",
    templateUrl: "security.component.html",
    styleUrls: ["../home/home.component.css", "security.component.css"]
})
export class SecurityComponent implements OnInit, OnDestroy {
    symbol: string;
    code: string;
    contractSummary: Section;
    summary: Section;
    keyInfo: Section;
    baseInfo: Section;
    mainIncome: Section;
    tenInfo: Section;
    marketPerformance: Section;
    numberInfo: Section;
    instituteInfo: Section;
    structureInfo: Section;
    currentInfo: Section;
    standardInfo: Section;
    marketInfo: Section;
    resList: Section;
    selectedItem: any;
    marketChart: ECharts;
    mainIncomChart: ECharts;
    isStock: boolean;
    timeout: any;
    MarketID: number;

    constructor(private quote: QuoteService) {
    }

    ngOnInit() {
        this.symbol = "--";
        this.code = "--";
        this.summary = new Section();
        this.summary.title = "公司简介";
        this.summary.content = "";

        this.contractSummary = new Section();
        this.contractSummary.title = "合约描述";
        this.contractSummary.content = "";
        // this.contractSummary.content.push({
        //     name: "--",
        //     value: "--"
        // });  
        // this.contractSummary.content.push({
        //     name: "--",            
        //     value: "--"
        // });    
        // this.contractSummary.content.push({
        //     name: "--",            
        //     value: "--"
        // });        
        // this.contractSummary.content.push({
        //     name: "--",            
        //     value: "--"
        // });        
        // this.contractSummary.content.push({
        //     name: "--",            
        //     value: "--"
        // });        
        // this.contractSummary.content.push({
        //     name: "--",            
        //     value: "--"
        // });        
        // this.contractSummary.content.push({
        //     name: "--",            
        //     value: "--"
        // });        
        // this.contractSummary.content.push({
        //     name: "--",            
        //     value: "--"
        // });        
        // this.contractSummary.content.push({
        //     name: "--",            
        //     value: "--"
        // });        
        // this.contractSummary.content.push({
        //     name: "--",            
        //     value: "--"
        // });        
        // this.contractSummary.content.push({
        //     name: "--",            
        //     value: "--"
        // });        
        // this.contractSummary.content.push({
        //     name: "--",            
        //     value: "--"
        // });        
        // this.contractSummary.content.push({
        //     name: "--",            
        //     value: "--"
        // });        
        // this.contractSummary.content.push({
        //     name: "--",            
        //     value: "--"
        // });        

        this.keyInfo = new Section();
        this.keyInfo.title = "其他指标";
        this.keyInfo.content = new Array<ListItem>();
        this.keyInfo.content.push({
            name: "总股本",
            value: "--"
        });
        this.keyInfo.content.push({
            name: "流通股本",
            value: "--"
        });
        this.keyInfo.content.push({
            name: "关联编码",
            value: "--"
        });
        this.keyInfo.content.push({
            name: "行权价",
            value: "--"
        });
        this.keyInfo.content.push({
            name: "最小单笔成交量",
            value: "--"
        });
        this.keyInfo.content.push({
            name: "最大单笔成交量",
            value: "--"
        });
        this.keyInfo.content.push({
            name: "每手股数",
            value: "--"
        });
        this.keyInfo.content.push({
            name: "资金用于交易时间",
            value: "--"
        });
        this.keyInfo.content.push({
            name: "证券用于交易时间",
            value: "--"
        });
        this.keyInfo.content.push({
            name: "资金到账日期延时",
            value: "--"
        });
        this.keyInfo.content.push({
            name: "证券到账日期延时",
            value: "--"
        });

        this.baseInfo = new Section();
        this.baseInfo.title = "基本信息";
        this.baseInfo.content = new Array<ListItem>();
        this.baseInfo.content.push({
            name: "公司名称",
            value: "--"
        });
        this.baseInfo.content.push({
            name: "英文名",
            value: "--"
        });
        this.baseInfo.content.push({
            name: "上市日期",
            value: "--"
        });
        this.baseInfo.content.push({
            name: "聚源证券代码",
            value: "--"
        });
        this.baseInfo.content.push({
            name: "wind证券代码",
            value: "--"
        });
        this.baseInfo.content.push({
            name: "中文拼写",
            value: "--"
        });
        this.baseInfo.content.push({
            name: "板块",
            value: "--"
        });
        this.baseInfo.content.push({
            name: "品种状态",
            value: "--"
        });
        this.baseInfo.content.push({
            name: "大类型",
            value: "--"
        });
        this.baseInfo.content.push({
            name: "小类型",
            value: "--"
        });
        this.baseInfo.content.push({
            name: "交易时间",
            value: "--"
        });
        this.baseInfo.content.push({
            name: "结算和交易货币",
            value: "--"
        });
        this.baseInfo.content.push({
            name: "ukey码",
            value: "--"
        });
        this.baseInfo.content.push({
            name: "交易所标识",
            value: "--"
        });
        this.baseInfo.content.push({
            name: "市场",
            value: "--"
        });
        this.baseInfo.content.push({
            name: "退市时间",
            value: "--"
        });

        this.marketInfo = new Section();
        this.marketInfo.title = "市场表现";
        this.marketInfo.content = new Array<ListItem>();
        this.marketInfo.content.push({
            name: "交易日",
            value: "--"
        });
        this.marketInfo.content.push({
            name: "上个交易日",
            value: "--"
        });
        this.marketInfo.content.push({
            name: "涨停价格",
            value: "--"
        });
        this.marketInfo.content.push({
            name: "跌停价格",
            value: "--"
        });
        this.marketInfo.content.push({
            name: "昨收盘",
            value: "--"
        });
        this.marketInfo.content.push({
            name: "昨结算",
            value: "--"
        });
        this.marketInfo.content.push({
            name: "昨持仓",
            value: "--"
        });
        this.marketInfo.content.push({
            name: "上次交易总量",
            value: "--"
        });

        this.mainIncome = new Section();
        this.mainIncome.title = "主营构成";
        this.mainIncome.content = this.createMainIncome();

        this.tenInfo = new Section();
        this.tenInfo.title = "十大股东";
        this.tenInfo.content = new DataTable();
        this.tenInfo.content.backgroundColor = "transparent";
        this.tenInfo.content.addColumn("股东名称", "股本数量", "占比%");
        this.tenInfo.content.columns[0].maxWidth = 100;

        this.marketPerformance = new Section();
        this.marketPerformance.title = "市场表现";
        this.marketPerformance.content = this.createMarketChart();

        this.numberInfo = new Section();
        this.numberInfo.title = "现任高管";
        this.numberInfo.content = new DataTable();
        this.numberInfo.content.backgroundColor = "transparent";
        this.numberInfo.content.addColumn("姓名", "职务", "任职日期");

        this.instituteInfo = new Section();
        this.instituteInfo.title = "机构持股";
        this.instituteInfo.content = this.createInstituteInfo();

        this.structureInfo = new Section();
        this.structureInfo.title = "股本结构";
        this.structureInfo.content = this.createStructureInfo();

        this.currentInfo = new Section();
        this.currentInfo.title = "当前合约";
        this.currentInfo.content = new DataTable();
        this.currentInfo.content.addColumn("合约名称", "合约代码", "合约交割月份", "合约上市日", "最后交易日期", "最后交割日"); // "涨跌幅限制(%)", "交易保证金(%)",

        this.standardInfo = new Section();
        this.standardInfo.title = "当前合约";
        // this.standardInfo.content = [];
        // this.standardInfo.content.push(["交易品种", "", "最后交易日期", ""]);
        // this.standardInfo.content.push(["交易单位", "", "交割日期", ""]);
        // this.standardInfo.content.push(["报价单位", "", "交割地点", ""]);
        // this.standardInfo.content.push(["最小变动价位", "", "最初交易保证金", ""]);
        // this.standardInfo.content.push(["涨跌停板幅度", "", "交割方式", ""]);
        // this.standardInfo.content.push(["合约交割月份", "", "交易代码", ""]);
        // this.standardInfo.content.push(["交易时间", "", "上市交易所", ""]);
        this.standardInfo.content = new Array<ListItem>();
        this.standardInfo.content.push({
            name: "合约编码",
            value: "--"
        });
        this.standardInfo.content.push({
            name: "市场编码",
            value: "--"
        });
        this.standardInfo.content.push({
            name: "标的中文名称",
            value: "--"
        });
        this.standardInfo.content.push({
            name: "标的英文名称",
            value: "--"
        });
        this.standardInfo.content.push({
            name: "报价单位",
            value: "--"
        });
        this.standardInfo.content.push({
            name: "最小变动价位",
            value: "--"
        });
        this.standardInfo.content.push({
            name: "每日价格最大波动限制",
            value: "--"
        });
        this.standardInfo.content.push({
            name: "合约交割月份",
            value: "--"
        });
        this.standardInfo.content.push({
            name: "交易时间",
            value: "--"
        });
        this.standardInfo.content.push({
            name: "最后交易日",
            value: "--"
        });
        this.standardInfo.content.push({
            name: "交割日期",
            value: "--"
        });
        this.standardInfo.content.push({
            name: "交割品级",
            value: "--"
        });
        this.standardInfo.content.push({
            name: "交割地点",
            value: "--"
        });
        this.standardInfo.content.push({
            name: "最低交易保证金",
            value: "--"
        });
        this.standardInfo.content.push({
            name: "交易手续费",
            value: "--"
        });
        this.standardInfo.content.push({
            name: "交割方式",
            value: "--"
        });
        this.standardInfo.content.push({
            name: "上市日期",
            value: "--"
        });
        this.standardInfo.content.push({
            name: "下市日期",
            value: "--"
        });
        this.standardInfo.content.push({
            name: "交易货币",
            value: "--"
        });

        this.isStock = true;
        this.registerListener();
    }

    ngOnDestroy() {
        if (this.marketChart) {
            this.marketChart = null;
        }

        if (this.mainIncomChart) {
            this.mainIncomChart = null;
        }
    }

    registerListener() {
        // this.mainIncome.content.onInit = (chart: ECharts) => {
        //     this.mainIncomChart = chart;
        // };

        // this.marketPerformance.content.onInit = (chart: ECharts) => {
        //     this.marketChart = chart;
        // };

        this.quote.addSlot({
            appid: 142,
            packid: 27,
            callback: (msg) => {
                if (msg.content.Structs[0]) {
                    if (msg.content.Seqno === 1) {
                        console.log(msg);
                        if (!this.isStock) {
                            this.quote.send(142, 26, { Seqno: 2, SecurityID: msg.content.Structs[0].contract_id, TableType: 1, MarketID: this.MarketID, Date: 0, SerialID: 0, PackSize: 10, Field: "*" });
                        }
                        this.baseInfo.content[0].value = msg.content.Structs[0].chinese_name;
                        this.baseInfo.content[1].value = msg.content.Structs[0].english_name;

                        let listDate = msg.content.Structs[0].list_date.toString().substr(0, 4) + "," + msg.content.Structs[0].list_date.toString().substr(4, 2) +
                            "," + msg.content.Structs[0].list_date.toString().substr(6, 2);
                        this.baseInfo.content[2].value = listDate;

                        this.baseInfo.content[3].value = msg.content.Structs[0].jy_code;
                        this.baseInfo.content[4].value = msg.content.Structs[0].wind_code;
                        this.baseInfo.content[5].value = msg.content.Structs[0].input_code;

                        switch (msg.content.Structs[0].board) {
                            case 1:
                                this.baseInfo.content[6].value = "主板";
                                break;
                            case 2:
                                this.baseInfo.content[6].value = "中小板";
                                break;
                            case 3:
                                this.baseInfo.content[6].value = "创业板";
                                break;
                            case 4:
                                this.baseInfo.content[6].value = "三板";
                                break;
                        }

                        switch (msg.content.Structs[0].state) {
                            case 0:
                                this.baseInfo.content[7].value = "正常";
                                break;
                            case 1:
                                this.baseInfo.content[7].value = "普通";
                                break;
                            case 2:
                                this.baseInfo.content[7].value = "ST";
                                break;
                            case 3:
                                this.baseInfo.content[7].value = "*ST";
                                break;
                            case 4:
                                this.baseInfo.content[7].value = "**ST";
                                break;
                            case 5:
                                this.baseInfo.content[7].value = "暂停";
                                break;
                            case 6:
                                this.baseInfo.content[7].value = "停止";
                                break;
                        }

                        switch (msg.content.Structs[0].major_type) {
                            case 1:
                                this.baseInfo.content[8].value = "股票";
                                switch (msg.content.Structs[0].minor_type) {
                                    case 1:
                                        this.baseInfo.content[9].value = "普通股票";
                                        break;
                                    case 2:
                                        this.baseInfo.content[9].value = "优先股";
                                        break;
                                }
                                break;
                            case 2:
                                this.baseInfo.content[8].value = "债券";
                                switch (msg.content.Structs[0].minor_type) {
                                    case 1:
                                        this.baseInfo.content[9].value = "国债";
                                        break;
                                    case 2:
                                        this.baseInfo.content[9].value = "企业债";
                                        break;
                                    case 3:
                                        this.baseInfo.content[9].value = "转债";
                                        break;
                                    case 4:
                                        this.baseInfo.content[9].value = "地方债";
                                        break;
                                    case 5:
                                        this.baseInfo.content[9].value = "金融债";
                                        break;
                                }
                                break;
                            case 3:
                                this.baseInfo.content[8].value = "基金";
                                switch (msg.content.Structs[0].minor_type) {
                                    case 1:
                                        this.baseInfo.content[9].value = "封闭基金";
                                        break;
                                    case 2:
                                        this.baseInfo.content[9].value = "开放基金";
                                        break;
                                    case 3:
                                        this.baseInfo.content[9].value = "分级基金";
                                        break;
                                    case 4:
                                        this.baseInfo.content[9].value = "lof基金";
                                        break;
                                    case 5:
                                        this.baseInfo.content[9].value = "etf基金";
                                        break;
                                }
                                break;
                            case 4:
                                this.baseInfo.content[8].value = "现货";
                                switch (msg.content.Structs[0].minor_type) {
                                    case 1:
                                        this.baseInfo.content[9].value = "商品现货-即期交易";
                                        break;
                                    case 2:
                                        this.baseInfo.content[9].value = "贵金属现货-即期交易";
                                        break;
                                    case 3:
                                        this.baseInfo.content[9].value = "商品现货-延期交易";
                                        break;
                                    case 4:
                                        this.baseInfo.content[9].value = "贵金属现货-延期交易";
                                        break;
                                    case 5:
                                        this.baseInfo.content[9].value = "贵金属现货实盘合约";
                                        break;
                                    case 6:
                                        this.baseInfo.content[9].value = "商品现货实盘合约";
                                        break;
                                }
                                break;
                            case 5:
                                this.baseInfo.content[8].value = "货币市场工具";
                                switch (msg.content.Structs[0].minor_type) {
                                    case 1:
                                        this.baseInfo.content[9].value = "质押式回购";
                                        break;
                                    case 2:
                                        this.baseInfo.content[9].value = "短期债券";
                                        break;
                                    case 3:
                                        this.baseInfo.content[9].value = "票据";
                                        break;
                                    case 4:
                                        this.baseInfo.content[9].value = "大额存单";
                                        break;
                                    case 5:
                                        this.baseInfo.content[9].value = "货币基金";
                                        break;
                                    case 6:
                                        this.baseInfo.content[9].value = "买断式回购";
                                        break;
                                }
                                break;
                            case 6:
                                this.baseInfo.content[8].value = "指数";
                                switch (msg.content.Structs[0].minor_type) {
                                    case 1:
                                        this.baseInfo.content[9].value = "综合指数";
                                        break;
                                    case 2:
                                        this.baseInfo.content[9].value = "行业指数";
                                        break;
                                }
                                break;
                            case 10:
                                this.baseInfo.content[8].value = "期货";
                                switch (msg.content.Structs[0].minor_type) {
                                    case 1:
                                        this.baseInfo.content[9].value = "股指期货";
                                        break;
                                    case 2:
                                        this.baseInfo.content[9].value = "商品期货";
                                        break;
                                    case 3:
                                        this.baseInfo.content[9].value = "国债期货";
                                        break;
                                    case 4:
                                        this.baseInfo.content[9].value = "利率期货";
                                        break;
                                    case 5:
                                        this.baseInfo.content[9].value = "汇率期货";
                                        break;
                                }
                                break;
                            case 11:
                                this.baseInfo.content[8].value = "期权";
                                switch (msg.content.Structs[0].minor_type) {
                                    case 1:
                                        this.baseInfo.content[9].value = "指数期权";
                                        break;
                                    case 2:
                                        this.baseInfo.content[9].value = "ETF期权";
                                        break;
                                    case 3:
                                        this.baseInfo.content[9].value = "二元期权";
                                        break;
                                    case 4:
                                        this.baseInfo.content[9].value = "商品期货期权";
                                        break;
                                    case 5:
                                        this.baseInfo.content[9].value = "利率期权";
                                        break;
                                    case 6:
                                        this.baseInfo.content[9].value = "汇率期权";
                                        break;
                                }
                                break;
                            case 12:
                                this.baseInfo.content[8].value = "权证";
                                switch (msg.content.Structs[0].minor_type) {
                                    case 1:
                                        this.baseInfo.content[9].value = "股票认购权证";
                                        break;
                                }
                                break;
                            case 15:
                                this.baseInfo.content[8].value = "个股期权";
                                break;
                        }

                        let tradingTime = msg.content.Structs[0].trading_time.substr(0, 3) + ":" + msg.content.Structs[0].trading_time.substr(3, 5) + ":" +
                            msg.content.Structs[0].trading_time.substr(8, 7) + ":" + msg.content.Structs[0].trading_time.substr(15, 5) + ":" +
                            msg.content.Structs[0].trading_time.substr(20, 3);
                        this.baseInfo.content[10].value = tradingTime;

                        switch (msg.content.Structs[0].currency_id) {
                            case 1:
                                this.baseInfo.content[11].value = "人民币";
                                break;
                            case 2:
                                this.baseInfo.content[11].value = "美元";
                                break;
                            case 3:
                                this.baseInfo.content[11].value = "欧元";
                                break;
                            case 4:
                                this.baseInfo.content[11].value = "日元";
                                break;
                            case 5:
                                this.baseInfo.content[11].value = "英镑";
                                break;
                            case 6:
                                this.baseInfo.content[11].value = "卢布";
                                break;
                            case 7:
                                this.baseInfo.content[11].value = "瑞士法郎";
                                break;
                            case 8:
                                this.baseInfo.content[11].value = "港币";
                                break;
                            case 9:
                                this.baseInfo.content[11].value = "澳元";
                                break;
                            case 10:
                                this.baseInfo.content[11].value = "韩元";
                                break;
                            case 11:
                                this.baseInfo.content[11].value = "泰铢";
                                break;
                            case 12:
                                this.baseInfo.content[11].value = "巴西雷亚尔";
                                break;
                            case 13:
                                this.baseInfo.content[11].value = "新西兰元";
                                break;
                            case 14:
                                this.baseInfo.content[11].value = "新加坡元";
                                break;
                            case 15:
                                this.baseInfo.content[11].value = "马来西亚林吉特";
                                break;
                            case 16:
                                this.baseInfo.content[11].value = "加元";
                                break;
                        }

                        this.baseInfo.content[12].value = msg.content.Structs[0].ukey;
                        this.baseInfo.content[13].value = msg.content.Structs[0].market_code;

                        switch (msg.content.Structs[0].market_id) {
                            case 1:
                                this.baseInfo.content[14].value = "深圳交易所A股";
                                break;
                            case 2:
                                this.baseInfo.content[14].value = "上海交易所A股";
                                break;
                            case 3:
                                this.baseInfo.content[14].value = "中国金融期货交易所";
                                break;
                            case 4:
                                this.baseInfo.content[14].value = "上海金属期货交易所";
                                break;
                            case 5:
                                this.baseInfo.content[14].value = "郑州商品交易所";
                                break;
                            case 6:
                                this.baseInfo.content[14].value = "大连商品交易所";
                                break;
                            case 7:
                                this.baseInfo.content[14].value = "上海黄金交易所";
                                break;
                            case 8:
                                this.baseInfo.content[14].value = "深圳交易所B股";
                                break;
                            case 9:
                                this.baseInfo.content[14].value = "上海交易所B股";
                                break;
                            case 10:
                                this.baseInfo.content[14].value = "香港联合交易所";
                                break;
                            case 11:
                                this.baseInfo.content[14].value = "银行间债券市场";
                                break;
                            case 15:
                                this.baseInfo.content[14].value = "中国股转系统（三版交易）";
                                break;
                            case 16:
                                this.baseInfo.content[14].value = "台湾期货交易所";
                                break;
                            case 20:
                                this.baseInfo.content[14].value = "新加坡交易所";
                                break;
                            case 21:
                                this.baseInfo.content[14].value = "新加坡商品交易所";
                                break;
                            case 30:
                                this.baseInfo.content[14].value = "日本交易所集团";
                                break;
                            case 31:
                                this.baseInfo.content[14].value = "东京商品交易所";
                                break;
                            case 40:
                                this.baseInfo.content[14].value = "马来西亚衍生品交易所";
                                break;
                            case 50:
                                this.baseInfo.content[14].value = "泰国期货交易所";
                                break;
                            case 51:
                                this.baseInfo.content[14].value = "泰国农业期货交易所";
                                break;
                            case 60:
                                this.baseInfo.content[14].value = "韩国交易所";
                                break;
                            case 257:
                                this.baseInfo.content[14].value = "伦敦金属交易所";
                                break;
                            case 258:
                                this.baseInfo.content[14].value = "伦敦洲际交易所";
                                break;
                            case 259:
                                this.baseInfo.content[14].value = "伦敦国际金融期货交易所";
                                break;
                            case 260:
                                this.baseInfo.content[14].value = "欧洲期货交易所";
                                break;
                            case 513:
                                this.baseInfo.content[14].value = "芝加哥商业交易所";
                                break;
                            case 514:
                                this.baseInfo.content[14].value = "芝加哥期货交易所";
                                break;
                            case 515:
                                this.baseInfo.content[14].value = "纽约期货交易所";
                                break;
                            case 516:
                                this.baseInfo.content[14].value = "纽约商业交易所";
                                break;
                            case 517:
                                this.baseInfo.content[14].value = "加拿大油菜籽期货交易所";
                                break;
                            case 518:
                                this.baseInfo.content[14].value = "芝加哥电子交易所";
                                break;
                            case 520:
                                this.baseInfo.content[14].value = "芝加哥期权交易所";
                                break;
                            case 768:
                                this.baseInfo.content[14].value = "澳洲交易所";
                                break;
                            case 769:
                                this.baseInfo.content[14].value = "阿联酋迪拜商品交易所";
                                break;
                            case 770:
                                this.baseInfo.content[14].value = "迪拜黄金和商品交易所";
                                break;
                        }

                        if (msg.content.Structs[0].delist_date === 99999999) {
                            this.baseInfo.content[15].value = "未退市";
                        }

                        let tradingDay = msg.content.Structs[0].trading_day.toString().substr(0, 4) + "," + msg.content.Structs[0].trading_day.toString().substr(4, 2) +
                            "," + msg.content.Structs[0].trading_day.toString().substr(6, 2);
                        this.marketInfo.content[0].value = tradingDay;

                        let preTradingDay = msg.content.Structs[0].pre_trading_day.toString().substr(0, 4) + "," + msg.content.Structs[0].pre_trading_day.toString().substr(4, 2) +
                            "," + msg.content.Structs[0].pre_trading_day.toString().substr(6, 2);
                        this.marketInfo.content[1].value = preTradingDay;

                        this.marketInfo.content[2].value = msg.content.Structs[0].upper_limit;
                        this.marketInfo.content[3].value = msg.content.Structs[0].lower_limit;
                        this.marketInfo.content[4].value = msg.content.Structs[0].pre_close;
                        this.marketInfo.content[5].value = msg.content.Structs[0].pre_settlement;
                        this.marketInfo.content[6].value = msg.content.Structs[0].pre_interest;
                        this.marketInfo.content[7].value = msg.content.Structs[0].pre_volume;
                        this.keyInfo.content[0].value = msg.content.Structs[0].total_share;
                        this.keyInfo.content[1].value = msg.content.Structs[0].float_share;
                        this.keyInfo.content[2].value = msg.content.Structs[0].associate_code;
                        this.keyInfo.content[3].value = msg.content.Structs[0].exercise_price;
                        this.keyInfo.content[4].value = msg.content.Structs[0].min_order_size;
                        this.keyInfo.content[5].value = msg.content.Structs[0].max_order_size;
                        this.keyInfo.content[6].value = msg.content.Structs[0].lot_size;
                        this.keyInfo.content[7].value = msg.content.Structs[0].money_avail;
                        this.keyInfo.content[8].value = msg.content.Structs[0].share_avail;
                        this.keyInfo.content[9].value = msg.content.Structs[0].money_arrive;
                        this.keyInfo.content[10].value = msg.content.Structs[0].share_arrive;
                    } else if (msg.content.Seqno === 2) {
                        this.contractSummary.content = msg.content.Structs[0].contract_desc;
                        this.standardInfo.content[0].value = msg.content.Structs[0].contract_id;
                        this.standardInfo.content[1].value = msg.content.Structs[0].contract_code;
                        this.standardInfo.content[2].value = msg.content.Structs[0].chinese_name;
                        this.standardInfo.content[3].value = msg.content.Structs[0].english_name;
                        this.standardInfo.content[4].value = msg.content.Structs[0].price_unit_desc;
                        this.standardInfo.content[5].value = msg.content.Structs[0].tick_size_desc;
                        this.standardInfo.content[6].value = msg.content.Structs[0].max_fluctuation_limit_desc;
                        this.standardInfo.content[7].value = msg.content.Structs[0].contract_month_desc;
                        this.standardInfo.content[8].value = msg.content.Structs[0].trading_time_desc;
                        this.standardInfo.content[9].value = msg.content.Structs[0].last_trading_date_desc;
                        this.standardInfo.content[10].value = msg.content.Structs[0].delivery_date_desc;
                        this.standardInfo.content[11].value = msg.content.Structs[0].delivery_grade_desc;
                        this.standardInfo.content[12].value = msg.content.Structs[0].delivery_points_desc;
                        this.standardInfo.content[13].value = msg.content.Structs[0].min_trading_margin_desc;
                        this.standardInfo.content[14].value = msg.content.Structs[0].trading_fee_desc;
                        this.standardInfo.content[15].value = msg.content.Structs[0].delivery_methods_desc;
                        this.standardInfo.content[16].value = msg.content.Structs[0].list_date;
                        this.standardInfo.content[17].value = msg.content.Structs[0].delist_date;
                        this.standardInfo.content[18].value = msg.content.Structs[0].currency_id;
                        // console.log(msg, msg.content.Structs[0].contract_desc);
                        // // this.contractSummary.content = msg.content.Structs[0].contract_desc;
                        // let descArr = msg.content.Structs[0].contract_desc.split("\r\n");
                        // console.log(descArr);
                        // for (let i = 0; i < descArr.length; ++i) {
                        //     if (descArr[i] !==  "") {
                        //         let subArr = descArr[i].split(" ");
                        //         console.log(subArr);
                        //         this.contractSummary.content[i].name = subArr[0];
                        //         if (subArr[2] !== "") {
                        //             let sumArr = subArr[1] + subArr[2];
                        //             this.contractSummary.content[i].value = sumArr;
                        //         }  else {
                        //             this.contractSummary.content[i].value = subArr[1];
                        //         }
                        //     }
                        // }
                    }
                } else {
                    alert("未找到" + this.selectedItem.symbolCode + "的证券信息！");
                }

                // switch (msg.content.type) {
                //     case 1:
                //         this.summary.content = msg.content.array[0].S_INFO_CHINESEINTRODUCTION;
                //         this.baseInfo.content[3].value = msg.content.array[0].S_INFO_FOUNDDATE.substr(0, 4) + "-" + msg.content.array[0].S_INFO_FOUNDDATE.substr(4, 2) + "-" + msg.content.array[0].S_INFO_FOUNDDATE.substr(6, 2);
                //         this.baseInfo.content[5].value = msg.content.array[0].S_INFO_REGCAPITAL;
                //         this.baseInfo.content[6].value = msg.content.array[0].S_INFO_OFFICE;
                //         this.baseInfo.content[7].value = msg.content.array[0].S_INFO_TOTALEMPLOYEES;
                //         this.baseInfo.content[8].value = msg.content.array[0].S_INFO_CHAIRMAN;
                //         this.baseInfo.content[9].value = msg.content.array[0].S_INFO_PRESIDENT;
                //         // this.baseInfo.content[10].value = msg.content.S_INFO_PRESIDENT;
                //         this.baseInfo.content[11].value = msg.content.array[0].S_INFO_WEBSITE;
                //         break;
                //     case 2:
                //         this.keyInfo.content[1].value = msg.content.array[0].TOT_SHR;
                //         this.structureInfo.content.rows[0].cells[1].Text = msg.content.array[0].FLOAT_SHR;
                //         this.structureInfo.content.rows[0].cells[2].Text = (msg.content.array[0].FLOAT_SHR / msg.content.array[0].TOT_SHR).toFixed(2) + "%";
                //         this.structureInfo.content.rows[1].cells[1].Text = msg.content.array[0].FLOAT_A_SHR;
                //         this.structureInfo.content.rows[1].cells[2].Text = (msg.content.array[0].FLOAT_A_SHR / msg.content.array[0].TOT_SHR).toFixed(2) + "%";
                //         this.structureInfo.content.rows[2].cells[1].Text = msg.content.array[0].FLOAT_B_SHR;
                //         this.structureInfo.content.rows[2].cells[2].Text = (msg.content.array[0].FLOAT_B_SHR / msg.content.array[0].TOT_SHR).toFixed(2) + "%";
                //         this.structureInfo.content.rows[3].cells[1].Text = msg.content.array[0].FLOAT_H_SHR;
                //         this.structureInfo.content.rows[3].cells[2].Text = (msg.content.array[0].FLOAT_H_SHR / msg.content.array[0].TOT_SHR).toFixed(2) + "%";
                //         this.structureInfo.content.rows[4].cells[1].Text = msg.content.array[0].FLOAT_OVERSEAS_SHR;
                //         this.structureInfo.content.rows[4].cells[2].Text = (msg.content.array[0].FLOAT_OVERSEAS_SHR / msg.content.array[0].TOT_SHR).toFixed(2) + "%";
                //         this.structureInfo.content.rows[5].cells[1].Text = msg.content.array[0].RESTRICTED_A_SHR;
                //         this.structureInfo.content.rows[5].cells[2].Text = (msg.content.array[0].RESTRICTED_A_SHR / msg.content.array[0].TOT_SHR).toFixed(2) + "%";
                //         this.structureInfo.content.rows[6].cells[1].Text = msg.content.array[0].S_SHARE_NTRD_PRFSHARE;
                //         this.structureInfo.content.rows[6].cells[2].Text = (msg.content.array[0].S_SHARE_NTRD_PRFSHARE / msg.content.array[0].TOT_SHR).toFixed(2) + "%";
                //         this.structureInfo.content.rows[7].cells[1].Text = msg.content.array[0].NON_TRADABLE_SHR;
                //         this.structureInfo.content.rows[7].cells[2].Text = (msg.content.array[0].NON_TRADABLE_SHR / msg.content.array[0].TOT_SHR).toFixed(2) + "%";
                //         this.structureInfo.content.rows[8].cells[1].Text = msg.content.array[0].TOT_SHR;
                //         this.structureInfo.content.rows[8].cells[2].Text = (msg.content.array[0].TOT_SHR / msg.content.array[0].TOT_SHR).toFixed(2) + "%";
                //         break;
                //     case 3:
                //         this.keyInfo.content[0].value = msg.content.array[0].S_VAL_MV;
                //         this.keyInfo.content[2].value = msg.content.array[0].S_VAL_PE_TTM;
                //         this.keyInfo.content[3].value = msg.content.array[0].S_VAL_PE;
                //         this.keyInfo.content[4].value = msg.content.array[0].S_VAL_PB_NEW;
                //         this.keyInfo.content[5].value = msg.content.array[0].S_VAL_PS;
                //         break;
                //     case 4:
                //         this.mainIncome.content.option.legend.data = [];
                //         this.mainIncome.content.option.series[0].data = [];

                //         msg.content.array.forEach(item => {
                //             this.mainIncome.content.option.legend.data.push(item.S_SEGMENT_ITEM);
                //             this.mainIncome.content.option.series[0].data.push({ value: item.S_SEGMENT_SALES / 1000, name: item.S_SEGMENT_ITEM });
                //         });

                //         this.mainIncomChart.setOption(this.mainIncome.content.option);
                //         break;
                //     case 6:
                //         this.baseInfo.content[4].value = msg.content.array[0].S_INFO_LISTDATE.substr(0, 4) + "-" + msg.content.array[0].S_INFO_LISTDATE.substr(4, 2) + "-" + msg.content.array[0].S_INFO_LISTDATE.substr(6, 2);
                //         this.baseInfo.content[0].value = msg.content.array[0].S_INFO_COMPNAME;
                //         break;
                //     case 8:
                //         this.baseInfo.content[1].value = msg.content.array[0].S_INFO_NAME;
                //         break;
                //     case 9:
                //         this.tenInfo.content.rows.length = 0;

                //         msg.content.array.forEach(item => {
                //             let row = this.tenInfo.content.newRow();
                //             row.cells[0].Text = item.S_HOLDER_NAME;
                //             row.cells[1].Text = item.S_HOLDER_QUANTITY;
                //             row.cells[2].Text = item.S_HOLDER_PCT;
                //         });
                //         break;
                //     case 10:
                //         this.numberInfo.content.rows.length = 0;
                //         msg.content.array.slice(0, 10).forEach(item => {
                //             let row = this.numberInfo.content.newRow();
                //             row.cells[0].Text = item.S_INFO_MANAGER_NAME;
                //             row.cells[1].Text = item.S_INFO_MANAGER_POST;
                //             row.cells[2].Text = item.S_INFO_MANAGER_STARTDATE;
                //         });
                //         break;
                //     case 12:
                //         this.marketPerformance.content.option.xAxis.data = [];
                //         msg.content.array.forEach(item => {
                //             this.marketPerformance.content.option.xAxis.data.push(item.TRADE_DT);
                //             this.marketPerformance.content.option.series[0].data.push(item.S_DQ_CLOSE);
                //         });

                //         this.marketChart.setOption(this.marketPerformance.content.option);
                //         break;
                //     case 100:
                //         this.currentInfo.content.rows.length = 0;
                //         msg.content.array.forEach(item => {
                //             let row = this.currentInfo.content.newRow();
                //             row.cells[0].Text = item.S_INFO_FULLNAME;
                //             row.cells[1].Text = item.S_INFO_CODE;
                //             row.cells[2].Text = item.FS_INFO_DLMONTH;
                //             // row.cells[3].Text = item.FS_INFO_DLMONTH;
                //             // row.cells[4].Text = item.S_INFO_FULLNAME;
                //             row.cells[3].Text = item.S_INFO_LISTDATE;
                //             row.cells[4].Text = item.S_INFO_DELISTDATE;
                //             row.cells[5].Text = item.FS_INFO_LTDLDATE;
                //         });
                //         break;
                //     case 101:
                //         this.standardInfo.content[0][1] = msg.content.array[0].S_INFO_NAME;
                //         this.standardInfo.content[0][3] = msg.content.array[0].S_INFO_LTDATED;
                //         this.standardInfo.content[1][1] = msg.content.array[0].S_INFO_PUNIT + msg.content.array[0].S_INFO_TUNIT;
                //         this.standardInfo.content[1][3] = msg.content.array[0].S_INFO_DDATE;
                //         this.standardInfo.content[2][1] = msg.content.array[0].FS_INFO_PUNIT;
                //         this.standardInfo.content[2][3] = msg.content.array[0].S_INFO_DSITE;
                //         this.standardInfo.content[3][1] = msg.content.array[0].S_INFO_MFPRICE;
                //         this.standardInfo.content[3][3] = msg.content.array[0].S_INFO_FTMARGINS;
                //         this.standardInfo.content[4][1] = msg.content.array[0].S_INFO_MAXPRICEFLUCT;
                //         this.standardInfo.content[4][3] = msg.content.array[0].S_INFO_DMEAN;
                //         this.standardInfo.content[5][1] = msg.content.array[0].S_INFO_CDMONTHS;
                //         this.standardInfo.content[5][3] = msg.content.array[0].S_INFO_CODE;
                //         this.standardInfo.content[6][1] = msg.content.array[0].S_INFO_LTDATEHOUR;
                //         this.standardInfo.content[6][3] = msg.content.array[0].S_INFO_EXNAME;
                //         break;
                // }
            }
        });
    }

    listClick(item) {
        console.info(item);
        this.selectedItem = item;
        this.search();
        this.resList = null;
    }

    search() {
        this.symbol = this.selectedItem.SecuAbbr;
        this.code = this.selectedItem.symbolCode;
        this.isStock = (this.selectedItem.ukey & 0x00010000) > 0 ? true : false;

        if (this.isStock) {
            // this.marketPerformance.content.option.legend.data = [this.symbol, "沪深300"];
            // this.marketPerformance.content.option.series = [{
            //     name: this.symbol,
            //     type: "line",
            //     data: []
            // }, {
            //     name: "沪深300",
            //     type: "line",
            //     data: []
            // }];

            // // this.marketChart.setOption(this.marketPerformance.content.option);
        }

        // this.quote.send(140, 10, { ukey: parseInt(this.selectedItem.ukey), reqtype: 2, reqno: 1 });
        // this.quote.addSlot({
        //     appid: 142,
        //     packid: 27,
        //     callback: (msg) => {
        //         console.log(msg);
        //     }
        // });

        this.MarketID = (parseInt(this.selectedItem.ukey) & 0x3ff00000) / 1048576;
        this.quote.send(142, 26, { Seqno: 1, SecurityID: parseInt(this.selectedItem.ukey), TableType: 5, MarketID: this.MarketID, Date: 0, SerialID: 0, PackSize: 10, Field: "*" });
        console.log(this.selectedItem.ukey, this.MarketID);
    }

    get codeName() {
        return `${this.symbol}[${this.code}]`;
    }

    createMarketChart() {
        // return {
        //     option: {
        //         title: {
        //             show: false,
        //         },
        //         tooltip: {
        //             trigger: "axis",
        //             axisPointer: {
        //                 type: "cross",
        //                 label: { show: true, backgroundColor: "rgba(0,0,0,1)" }
        //             }
        //         },
        //         legend: {
        //             data: [],
        //             textStyle: { color: "#F3F3F5" }
        //         },
        //         xAxis: {
        //             data: [],
        //             axisLabel: {
        //                 textStyle: { color: "#F3F3F5" },
        //                 interval: (index: number, value: string) => {
        //                     if (value)
        //                         return value.endsWith("01");
        //                 }
        //             },
        //             axisLine: {
        //                 lineStyle: { color: "#8AA4E6" }
        //             }
        //         },
        //         yAxis: {
        //             position: "right",
        //             axisLabel: {
        //                 show: true,
        //                 textStyle: { color: "#F3F3F5" }
        //             },
        //             axisLine: {
        //                 lineStyle: { color: "#F3F3F5" }
        //             },
        //             scale: true,
        //             boundaryGap: [0.2, 0.2]
        //         },
        //         series: [],
        //         color: [
        //             "#fd0", "#0b0"
        //         ]
        //     }
        // };
    }

    createInstituteInfo() {
        // return {
        //     option: {
        //         title: {
        //             show: false,
        //         },
        //         tooltip: {
        //             trigger: "axis",
        //             axisPointer: {
        //                 type: "cross",
        //                 label: { show: true, backgroundColor: "rgba(0,0,0,1)" }
        //             }
        //         },
        //         legend: {
        //             data: [{ name: "一般法人", textStyle: { color: "#F3F3F5" } }, { name: "收盘价", textStyle: { color: "#F3F3F5" } }],
        //             textStyle: { color: "#F3F3F5" }
        //         },
        //         xAxis: [{
        //             data: ["2016-10-01", "2017-01-01", "2017-04-01", "2017-07-01"],
        //             axisLabel: {
        //                 textStyle: { color: "#F3F3F5" }
        //             },
        //             axisLine: {
        //                 lineStyle: { color: "#8AA4E6" }
        //             }
        //         }],
        //         yAxis: [{
        //             name: "一般法人",
        //             position: "left",
        //             axisLabel: {
        //                 show: true,
        //                 textStyle: { color: "#F3F3F5" }
        //             },
        //             axisLine: {
        //                 lineStyle: { color: "#8AA4E6" }
        //             },
        //             splitLine: { show: false },
        //             scale: true,
        //             boundaryGap: [0.2, 0.2]
        //         }, {
        //             name: "收盘价",
        //             position: "right",
        //             axisLabel: {
        //                 show: true,
        //                 textStyle: { color: "#F3F3F5" }
        //             },
        //             axisLine: {
        //                 lineStyle: { color: "#8AA4E6" }
        //             },
        //             splitLine: { show: false },
        //             scale: true,
        //             boundaryGap: [0.2, 0.2]
        //         }],
        //         series: [{
        //             name: "一般法人",
        //             type: "line",
        //             data: [0.05, 0.1, 0.08, 0.15]
        //         }, {
        //             yAxisIndex: 1,
        //             name: "收盘价",
        //             type: "line",
        //             data: [12, 14, 13, 16]
        //         }],
        //         color: [
        //             "#00b", "#0b0"
        //         ]
        //     }
        // };
    }

    createMainIncome() {
        // return {
        //     option: {
        //         title: { show: false },
        //         tooltip: {
        //             trigger: "item",
        //             formatter: "{a} <br/>{b} : {c} ({d}%)"
        //         },
        //         legend: {
        //             orient: "vertical",
        //             left: "left",
        //             data: [],
        //             textStyle: { color: "#F3F3F5" }
        //         },
        //         series: [{
        //             name: "项目收入",
        //             type: "pie",
        //             radius: "50%",
        //             center: ["60%", "50%"],
        //             data: [],
        //             itemStyle: {
        //                 emphasis: {
        //                     shadowBlur: 10,
        //                     shadowOffsetX: 0,
        //                     shadowColor: "rgba(0, 0, 0, 0.5)"
        //                 }
        //             }
        //         }]
        //     }
        // };
    }

    createStructureInfo() {
        // let table = new DataTable();
        // table.backgroundColor = "transparent";
        // table.addColumn("股本结构", "股本数量(万股)", "占比");
        // let row1 = table.newRow();
        // row1.cells[0].Text = "流通股(非限售)";
        // row1.cells[1].Text = "";
        // row1.cells[2].Text = "";

        // let row2 = table.newRow();
        // row2.cells[0].Text = "流通A股";
        // row2.cells[1].Text = "";
        // row2.cells[2].Text = "";

        // let row3 = table.newRow();
        // row3.cells[0].Text = "流通B股";
        // row3.cells[1].Text = "";
        // row3.cells[2].Text = "";

        // let row4 = table.newRow();
        // row4.cells[0].Text = "流通H股";
        // row4.cells[1].Text = "";
        // row4.cells[2].Text = "";

        // let row5 = table.newRow();
        // row5.cells[0].Text = "境外流通股";
        // row5.cells[1].Text = "";
        // row5.cells[2].Text = "";

        // let row6 = table.newRow();
        // row6.cells[0].Text = "流通股(限售)";
        // row6.cells[1].Text = "";
        // row6.cells[2].Text = "";

        // let row7 = table.newRow();
        // row7.cells[0].Text = "优先股";
        // row7.cells[1].Text = "";
        // row7.cells[2].Text = "";

        // let row8 = table.newRow();
        // row8.cells[0].Text = "非流通股";
        // row8.cells[1].Text = "";
        // row8.cells[2].Text = "";

        // let row9 = table.newRow();
        // row9.cells[0].Text = "总股本（含优先股）";
        // row9.cells[1].Text = "";
        // row9.cells[2].Text = "";

        // return table;
    }
}