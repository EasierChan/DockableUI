"use strict";

import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from "@angular/core";
import { DatePipe } from "@angular/common";
import { DataTable, DataTableColumn, ChartViewer, Section, ListItem } from "../../../base/controls/control";
import { SecuMasterService, File } from "../../../base/api/services/backend.service";
import { QuoteService } from "../../bll/services";
import { ECharts } from "echarts";

@Component({
    moduleId: module.id,
    selector: "security-master",
    templateUrl: "security.component.html",
    styleUrls: ["../home/home.component.css", "security.component.css"],
    providers: [DatePipe]
})
export class SecurityComponent implements OnInit, OnDestroy {
    tabs: string[];
    activeTab: string;

    symbol: string;
    code: string;
    summary: Section;
    keyInfo: Section;
    baseInfo: Section;
    standardInfo: Section;
    resList: Section;
    selectedItem: any;
    mdSection: Section;
    marketChart: ECharts;
    isStock: boolean;
    marketID: number;
    marketInfo: Section;
    defaultItem: any;

    constructor(private quote: QuoteService, private secuinfo: SecuMasterService, private datePipe: DatePipe) {

    }

    ngOnInit() {
        this.tabs = ["证券信息"];
        this.activeTab = this.tabs[0];

        this.symbol = "--";
        this.code = "--";
        this.summary = new Section();
        this.summary.title = "合约简介";
        this.summary.content = "";

        this.mdSection = new Section();
        this.mdSection.title = "日K线图";
        this.mdSection.content = this.createMDChart();
        this.mdSection.content.onInit = (chart: ECharts) => {
            this.marketChart = chart;
            console.info("init done");
        };

        this.keyInfo = new Section();
        this.keyInfo.title = "关键指标";
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
        this.baseInfo.title = "公司信息";
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
        this.marketInfo.title = "市场信息";
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

        this.standardInfo = new Section();
        this.standardInfo.title = "标准合约";
        this.standardInfo.content = [];
        this.standardInfo.content.push(["合约编码", "--", "市场编码", "--"]);
        this.standardInfo.content.push(["标的中文名称", "--", "标的英文名称", "--"]);
        this.standardInfo.content.push(["报价单位", "--", "最小变动价位", "--"]);
        this.standardInfo.content.push(["每日价格最大波动限制", "--", "合约交割月份", "--"]);
        this.standardInfo.content.push(["交易时间", "--", "最后交易日", "--"]);
        this.standardInfo.content.push(["交割日期", "--", "交割品级", "--"]);
        this.standardInfo.content.push(["交割地点", "--", "最低交易保证金", "--"]);
        this.standardInfo.content.push(["交易手续费", "--", "交割方式", "--"]);
        this.standardInfo.content.push(["上市日期", "--", "下市日期", "--"]);
        this.standardInfo.content.push(["交易货币", "--", "", " "]);
        this.isStock = true;

        this.defaultItem = this.secuinfo.getCodeList("000001.SH");
        this.listClick(this.defaultItem[0]);
        // 历史行情
        this.registerListener();
    }

    ngOnDestroy() {
        if (this.marketChart) {
            this.marketChart = null;
        }
    }

    registerListener() {
        this.quote.addSlot({
            appid: 142,
            packid: 27,
            callback: (msg) => {
                if (msg.content.Structs && msg.content.Structs.length > 0) {
                    if (msg.content.Seqno === 1) {
                        console.info(msg);
                        if (!this.isStock) {
                            this.quote.send(142, 26, { Seqno: 2, SecurityID: msg.content.Structs[0].contract_id, TableType: 1, MarketID: this.marketID, Date: 0, SerialID: 0, PackSize: 10, Field: "*" });
                        }

                        this.summary.content = "";
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

                        // let tradingTime = msg.content.Structs[0].trading_time.substr(0, 3) + ":" + msg.content.Structs[0].trading_time.substr(3, 5) + ":" +
                        //     msg.content.Structs[0].trading_time.substr(8, 7) + ":" + msg.content.Structs[0].trading_time.substr(15, 5) + ":" +
                        //     msg.content.Structs[0].trading_time.substr(20, 3);
                        this.baseInfo.content[10].value = msg.content.Structs[0].trading_time;

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
                        } else {
                            let delistDate = msg.content.Structs[0].delist_date.toString().substr(0, 4) + "," + msg.content.Structs[0].delist_date.toString().substr(4, 2) +
                                "," + msg.content.Structs[0].delist_date.toString().substr(6, 2);
                            this.baseInfo.content[15].value = delistDate;
                        }

                        let tradingDay = msg.content.Structs[0].trading_day.toString().substr(0, 4) + "," + msg.content.Structs[0].trading_day.toString().substr(4, 2) +
                            "," + msg.content.Structs[0].trading_day.toString().substr(6, 2);
                        this.marketInfo.content[0].value = tradingDay;

                        let preTradingDay = msg.content.Structs[0].pre_trading_day.toString().substr(0, 4) + "," + msg.content.Structs[0].pre_trading_day.toString().substr(4, 2) +
                            "," + msg.content.Structs[0].pre_trading_day.toString().substr(6, 2);
                        this.marketInfo.content[1].value = preTradingDay;

                        this.marketInfo.content[2].value = msg.content.Structs[0].upper_limit / 10000;
                        this.marketInfo.content[3].value = msg.content.Structs[0].lower_limit / 10000;
                        this.marketInfo.content[4].value = msg.content.Structs[0].pre_close / 10000;
                        this.marketInfo.content[5].value = msg.content.Structs[0].pre_settlement / 10000;
                        this.marketInfo.content[6].value = msg.content.Structs[0].pre_interest;

                        let preVolume = 0;
                        switch (msg.content.Structs[0].major_type) {
                            case 4:
                                preVolume = msg.content.Structs[0].pre_volume;
                                break;
                            case 10:
                                preVolume = msg.content.Structs[0].pre_volume;
                                break;
                            case 2:
                                preVolume = msg.content.Structs[0].pre_volume / 10;
                                break;
                            default:
                                preVolume = msg.content.Structs[0].pre_volume / 100;
                        }
                        this.marketInfo.content[7].value = preVolume.toFixed(0);

                        this.keyInfo.content[0].value = msg.content.Structs[0].total_share;
                        this.keyInfo.content[1].value = msg.content.Structs[0].float_share;
                        this.keyInfo.content[2].value = msg.content.Structs[0].associate_code;
                        this.keyInfo.content[3].value = msg.content.Structs[0].exercise_price / 10000;
                        this.keyInfo.content[4].value = msg.content.Structs[0].min_order_size;
                        this.keyInfo.content[5].value = msg.content.Structs[0].max_order_size;
                        this.keyInfo.content[6].value = msg.content.Structs[0].lot_size;
                        this.keyInfo.content[7].value = msg.content.Structs[0].money_avail;
                        this.keyInfo.content[8].value = msg.content.Structs[0].share_avail;
                        this.keyInfo.content[9].value = msg.content.Structs[0].money_arrive;
                        this.keyInfo.content[10].value = msg.content.Structs[0].share_arrive;
                    } else if (msg.content.Seqno === 2) {
                        this.summary.content = msg.content.Structs[0].contract_desc;
                        this.standardInfo.content[0][1] = msg.content.Structs[0].contract_id;
                        this.standardInfo.content[0][3] = msg.content.Structs[0].contract_code;
                        this.standardInfo.content[1][1] = msg.content.Structs[0].chinese_name;
                        this.standardInfo.content[1][3] = msg.content.Structs[0].english_name;
                        this.standardInfo.content[2][1] = msg.content.Structs[0].price_unit_desc;
                        this.standardInfo.content[2][3] = msg.content.Structs[0].tick_size_desc;
                        this.standardInfo.content[3][1] = msg.content.Structs[0].max_fluctuation_limit_desc;
                        this.standardInfo.content[3][3] = msg.content.Structs[0].contract_month_desc;
                        this.standardInfo.content[4][1] = msg.content.Structs[0].trading_time_desc;
                        this.standardInfo.content[4][3] = msg.content.Structs[0].last_trading_date_desc;
                        this.standardInfo.content[5][1] = msg.content.Structs[0].delivery_date_desc;
                        this.standardInfo.content[5][3] = msg.content.Structs[0].delivery_grade_desc;
                        this.standardInfo.content[6][1] = msg.content.Structs[0].delivery_points_desc;
                        this.standardInfo.content[6][3] = msg.content.Structs[0].min_trading_margin_desc;
                        this.standardInfo.content[7][1] = msg.content.Structs[0].trading_fee_desc;
                        this.standardInfo.content[7][3] = msg.content.Structs[0].delivery_methods_desc;

                        let listDate = msg.content.Structs[0].list_date.toString().substr(0, 4) + "," + msg.content.Structs[0].list_date.toString().substr(4, 2) +
                            "," + msg.content.Structs[0].list_date.toString().substr(6, 2);
                        this.standardInfo.content[8][1] = listDate;

                        if (msg.content.Structs[0].delist_date === 99999999) {
                            this.standardInfo.content[8][3] = "未退市";
                        } else {
                            let delistDate = msg.content.Structs[0].delist_date.toString().substr(0, 4) + "," + msg.content.Structs[0].delist_date.toString().substr(4, 2) +
                                "," + msg.content.Structs[0].delist_date.toString().substr(6, 2);
                            this.standardInfo.content[8][3] = delistDate;
                        }

                        switch (msg.content.Structs[0].currency_id) {
                            case 1:
                                this.standardInfo.content[9][1] = "人民币";
                                break;
                            case 2:
                                this.standardInfo.content[9][1] = "美元";
                                break;
                            case 3:
                                this.standardInfo.content[9][1] = "欧元";
                                break;
                            case 4:
                                this.standardInfo.content[9][1] = "日元";
                                break;
                            case 5:
                                this.standardInfo.content[9][1] = "英镑";
                                break;
                            case 6:
                                this.standardInfo.content[9][1] = "卢布";
                                break;
                            case 7:
                                this.standardInfo.content[9][1] = "瑞士法郎";
                                break;
                            case 8:
                                this.standardInfo.content[9][1] = "港币";
                                break;
                            case 9:
                                this.standardInfo.content[9][1] = "澳元";
                                break;
                            case 10:
                                this.standardInfo.content[9][1] = "韩元";
                                break;
                            case 11:
                                this.standardInfo.content[9][1] = "泰铢";
                                break;
                            case 12:
                                this.standardInfo.content[9][1] = "巴西雷亚尔";
                                break;
                            case 13:
                                this.standardInfo.content[9][1] = "新西兰元";
                                break;
                            case 14:
                                this.standardInfo.content[9][1] = "新加坡元";
                                break;
                            case 15:
                                this.standardInfo.content[9][1] = "马来西亚林吉特";
                                break;
                            case 16:
                                this.standardInfo.content[9][1] = "加元";
                                break;
                        }
                    }
                } else {
                    if (msg.content.Seqno === 1) {
                        alert("未找到" + this.selectedItem.symbolCode + "的证券信息！");
                    } else if (msg.content.Seqno === 2) {
                        alert("未找到" + this.selectedItem.symbolCode + "的合约信息！");
                    }
                }
            }
        });

        this.quote.addSlot({
            appid: 181,
            packid: 10002,
            callback: (msg) => {
                let option = this.mdSection.content.option;
                msg.content.data.forEach(item => {
                    option.xAxis.data.push(item.d);
                    let kData = [String(item.o / 10000), String(item.c / 10000), String(item.l / 10000), String(item.h / 10000)];
                    option.series[0].data.push(kData);
                });

                this.marketChart.setOption(this.mdSection.content.option);
            }
        });
    }

    listClick(item) {
        console.info(item);
        this.selectedItem = item;
        if (this.selectedItem === undefined) {
            alert("无效证券代码！");
            return;
        }
        this.searchInfo();
        this.searchMD();

        this.resList = null;
    }

    searchMD() {
        let date = new Date().setMonth((new Date().getMonth() - 12));
        let date1 = this.datePipe.transform(date, "yyyyMMdd");
        console.log(date, date1);
        this.mdSection.content.option.xAxis.data = [];
        this.mdSection.content.option.series[0].data = [];
        this.quote.send(181, 10001, { requestId: 1, ukeyCode: this.selectedItem.ukey, dataType: 101003, dateFrom: date1 });
    }

    searchInfo() {
        this.symbol = this.selectedItem.SecuAbbr;
        this.code = this.selectedItem.symbolCode;
        this.isStock = (this.selectedItem.ukey & 0x00010000) > 0 ? true : false;
        this.marketID = (parseInt(this.selectedItem.ukey) & 0x3ff00000) >>> 20;

        this.quote.send(142, 26, { Seqno: 1, SecurityID: parseInt(this.selectedItem.ukey), TableType: 5, MarketID: this.marketID, Date: 0, SerialID: 0, PackSize: 10, Field: "*" });
    }

    get codeName() {
        return `${this.symbol}[${this.code}]`;
    }

    createMDChart() {
        return {
            option: {
                title: {
                    show: false,
                },
                backgroundColor: "21202D",
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        animation: false,
                        type: "cross",
                        label: { show: true, backgroundColor: "rgba(0,0,0,1)" },
                        lineStyle: {
                            color: "#376df4",
                            width: 2,
                            opacity: 1
                        }
                    }
                },
                legend: {
                    data: ["日K线"],
                    inactiveColor: "#777",
                    textStyle: {
                        color: "#fff"
                    },
                    show: false
                },
                xAxis: {
                    data: [],
                    type: "category",
                    axisLine: {
                        lineStyle: { color: "#8392A5" }
                    }
                },
                yAxis: {
                    axisLine: {
                        lineStyle: { color: "#8392A5" }
                    },
                    scale: true,
                    splitLine: {
                        lineStyle: {
                            type: 'dashed',
                            color: 'rgb(56, 63, 84)'
                        }
                    },
                },
                grid: {
                    bottom: 80
                },
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
                animation: false,
                series: [{
                    name: "日K线",
                    type: "candlestick",
                    data: [],
                    itemStyle: {
                        normal: {
                            color: "#FD1050",
                            color0: "#7FFFAA",
                            borderColor: "#FD1050",
                            borderColor0: "#7FFFAA"
                        }
                    }
                }]
            }
        };
    }
}
