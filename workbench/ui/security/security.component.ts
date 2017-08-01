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
    resList: Section;
    selectedValue: string;

    marketChart: ECharts;
    mainIncomChart: ECharts;
    isStock: boolean;

    constructor(private quote: QuoteService, private secuinfo: SecuMasterService) {
    }

    ngOnInit() {
        this.symbol = "--";
        this.code = "--";
        this.summary = new Section();
        this.summary.title = "公司简介";
        this.summary.content = "";

        this.keyInfo = new Section();
        this.keyInfo.title = "关键指标";
        this.keyInfo.content = new Array<ListItem>();
        this.keyInfo.content.push({
            name: "总市值(万元)",
            value: "--"
        });
        this.keyInfo.content.push({
            name: "总股本(万股)",
            value: "--"
        });
        this.keyInfo.content.push({
            name: "PE(TM)",
            value: "--"
        });
        this.keyInfo.content.push({
            name: "PE(2017E)",
            value: "--"
        });
        this.keyInfo.content.push({
            name: "PB(MRQ)",
            value: "--"
        });
        this.keyInfo.content.push({
            name: "PS(TTM)",
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
            name: "曾用名",
            value: "--"
        });
        this.baseInfo.content.push({
            name: "所属行业",
            value: "--"
        });
        this.baseInfo.content.push({
            name: "成立日期",
            value: "--"
        });
        this.baseInfo.content.push({
            name: "上市日期",
            value: "--"
        });
        this.baseInfo.content.push({
            name: "注册资本(万元)",
            value: "--"
        });
        this.baseInfo.content.push({
            name: "注册地址",
            value: "--"
        });
        this.baseInfo.content.push({
            name: "员工总数",
            value: "--"
        });
        this.baseInfo.content.push({
            name: "董事长",
            value: "--"
        });
        this.baseInfo.content.push({
            name: "总经理",
            value: "--"
        });
        this.baseInfo.content.push({
            name: "第一股东",
            value: "--"
        });
        this.baseInfo.content.push({
            name: "公司网站",
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
        this.standardInfo.title = "标准合约";
        this.standardInfo.content = [];
        this.standardInfo.content.push(["交易品种", "", "最后交易日期", ""]);
        this.standardInfo.content.push(["交易单位", "", "交割日期", ""]);
        this.standardInfo.content.push(["报价单位", "", "交割地点", ""]);
        this.standardInfo.content.push(["最小变动价位", "", "最初交易保证金", ""]);
        this.standardInfo.content.push(["涨跌停板幅度", "", "交割方式", ""]);
        this.standardInfo.content.push(["合约交割月份", "", "交易代码", ""]);
        this.standardInfo.content.push(["交易时间", "", "上市交易所", ""]);

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
        this.mainIncome.content.onInit = (chart: ECharts) => {
            this.mainIncomChart = chart;
        };

        this.marketPerformance.content.onInit = (chart: ECharts) => {
            this.marketChart = chart;
        };

        this.quote.addSlot({
            appid: 140,
            packid: 11,
            callback: (msg) => {
                console.info(msg.content);
                switch (msg.content.type) {
                    case 1:
                        this.summary.content = msg.content.array[0].S_INFO_CHINESEINTRODUCTION;
                        this.baseInfo.content[3].value = msg.content.array[0].S_INFO_FOUNDDATE.substr(0, 4) + "-" + msg.content.array[0].S_INFO_FOUNDDATE.substr(4, 2) + "-" + msg.content.array[0].S_INFO_FOUNDDATE.substr(6, 2);
                        this.baseInfo.content[5].value = msg.content.array[0].S_INFO_REGCAPITAL;
                        this.baseInfo.content[6].value = msg.content.array[0].S_INFO_OFFICE;
                        this.baseInfo.content[7].value = msg.content.array[0].S_INFO_TOTALEMPLOYEES;
                        this.baseInfo.content[8].value = msg.content.array[0].S_INFO_CHAIRMAN;
                        this.baseInfo.content[9].value = msg.content.array[0].S_INFO_PRESIDENT;
                        // this.baseInfo.content[10].value = msg.content.S_INFO_PRESIDENT;
                        this.baseInfo.content[11].value = msg.content.array[0].S_INFO_WEBSITE;
                        break;
                    case 2:
                        this.keyInfo.content[1].value = msg.content.array[0].TOT_SHR;
                        this.structureInfo.content.rows[0].cells[1].Text = msg.content.array[0].FLOAT_SHR;
                        this.structureInfo.content.rows[0].cells[2].Text = (msg.content.array[0].FLOAT_SHR / msg.content.array[0].TOT_SHR).toFixed(2) + "%";
                        this.structureInfo.content.rows[1].cells[1].Text = msg.content.array[0].FLOAT_A_SHR;
                        this.structureInfo.content.rows[1].cells[2].Text = (msg.content.array[0].FLOAT_A_SHR / msg.content.array[0].TOT_SHR).toFixed(2) + "%";
                        this.structureInfo.content.rows[2].cells[1].Text = msg.content.array[0].FLOAT_B_SHR;
                        this.structureInfo.content.rows[2].cells[2].Text = (msg.content.array[0].FLOAT_B_SHR / msg.content.array[0].TOT_SHR).toFixed(2) + "%";
                        this.structureInfo.content.rows[3].cells[1].Text = msg.content.array[0].FLOAT_H_SHR;
                        this.structureInfo.content.rows[3].cells[2].Text = (msg.content.array[0].FLOAT_H_SHR / msg.content.array[0].TOT_SHR).toFixed(2) + "%";
                        this.structureInfo.content.rows[4].cells[1].Text = msg.content.array[0].FLOAT_OVERSEAS_SHR;
                        this.structureInfo.content.rows[4].cells[2].Text = (msg.content.array[0].FLOAT_OVERSEAS_SHR / msg.content.array[0].TOT_SHR).toFixed(2) + "%";
                        this.structureInfo.content.rows[5].cells[1].Text = msg.content.array[0].RESTRICTED_A_SHR;
                        this.structureInfo.content.rows[5].cells[2].Text = (msg.content.array[0].RESTRICTED_A_SHR / msg.content.array[0].TOT_SHR).toFixed(2) + "%";
                        this.structureInfo.content.rows[6].cells[1].Text = msg.content.array[0].S_SHARE_NTRD_PRFSHARE;
                        this.structureInfo.content.rows[6].cells[2].Text = (msg.content.array[0].S_SHARE_NTRD_PRFSHARE / msg.content.array[0].TOT_SHR).toFixed(2) + "%";
                        this.structureInfo.content.rows[7].cells[1].Text = msg.content.array[0].NON_TRADABLE_SHR;
                        this.structureInfo.content.rows[7].cells[2].Text = (msg.content.array[0].NON_TRADABLE_SHR / msg.content.array[0].TOT_SHR).toFixed(2) + "%";
                        this.structureInfo.content.rows[8].cells[1].Text = msg.content.array[0].TOT_SHR;
                        this.structureInfo.content.rows[8].cells[2].Text = (msg.content.array[0].TOT_SHR / msg.content.array[0].TOT_SHR).toFixed(2) + "%";
                        break;
                    case 3:
                        this.keyInfo.content[0].value = msg.content.array[0].S_VAL_MV;
                        this.keyInfo.content[2].value = msg.content.array[0].S_VAL_PE_TTM;
                        this.keyInfo.content[3].value = msg.content.array[0].S_VAL_PE;
                        this.keyInfo.content[4].value = msg.content.array[0].S_VAL_PB_NEW;
                        this.keyInfo.content[5].value = msg.content.array[0].S_VAL_PS;
                        break;
                    case 4:
                        this.mainIncome.content.option.legend.data = [];
                        this.mainIncome.content.option.series[0].data = [];

                        msg.content.array.forEach(item => {
                            this.mainIncome.content.option.legend.data.push(item.S_SEGMENT_ITEM);
                            this.mainIncome.content.option.series[0].data.push({ value: item.S_SEGMENT_SALES / 1000, name: item.S_SEGMENT_ITEM });
                        });

                        this.mainIncomChart.setOption(this.mainIncome.content.option);
                        break;
                    case 6:
                        this.baseInfo.content[4].value = msg.content.array[0].S_INFO_LISTDATE.substr(0, 4) + "-" + msg.content.array[0].S_INFO_LISTDATE.substr(4, 2) + "-" + msg.content.array[0].S_INFO_LISTDATE.substr(6, 2);
                        this.baseInfo.content[0].value = msg.content.array[0].S_INFO_COMPNAME;
                        break;
                    case 8:
                        this.baseInfo.content[1].value = msg.content.array[0].S_INFO_NAME;
                        break;
                    case 9:
                        this.tenInfo.content.rows.length = 0;

                        msg.content.array.forEach(item => {
                            let row = this.tenInfo.content.newRow();
                            row.cells[0].Text = item.S_HOLDER_NAME;
                            row.cells[1].Text = item.S_HOLDER_QUANTITY;
                            row.cells[2].Text = item.S_HOLDER_PCT;
                        });
                        break;
                    case 10:
                        this.numberInfo.content.rows.length = 0;
                        msg.content.array.slice(0, 10).forEach(item => {
                            let row = this.numberInfo.content.newRow();
                            row.cells[0].Text = item.S_INFO_MANAGER_NAME;
                            row.cells[1].Text = item.S_INFO_MANAGER_POST;
                            row.cells[2].Text = item.S_INFO_MANAGER_STARTDATE;
                        });
                        break;
                    case 12:
                        this.marketPerformance.content.option.xAxis.data = [];
                        msg.content.array.forEach(item => {
                            this.marketPerformance.content.option.xAxis.data.push(item.TRADE_DT);
                            this.marketPerformance.content.option.series[0].data.push(item.S_DQ_CLOSE);
                        });

                        this.marketChart.setOption(this.marketPerformance.content.option);
                        break;
                    case 100:
                        this.currentInfo.content.rows.length = 0;
                        msg.content.array.forEach(item => {
                            let row = this.currentInfo.content.newRow();
                            row.cells[0].Text = item.S_INFO_FULLNAME;
                            row.cells[1].Text = item.S_INFO_CODE;
                            row.cells[2].Text = item.FS_INFO_DLMONTH;
                            // row.cells[3].Text = item.FS_INFO_DLMONTH;
                            // row.cells[4].Text = item.S_INFO_FULLNAME;
                            row.cells[3].Text = item.S_INFO_LISTDATE;
                            row.cells[4].Text = item.S_INFO_DELISTDATE;
                            row.cells[5].Text = item.FS_INFO_LTDLDATE;
                        });
                        break;
                    case 101:
                        this.standardInfo.content[0][1] = msg.content.array[0].S_INFO_NAME;
                        this.standardInfo.content[0][3] = msg.content.array[0].S_INFO_LTDATED;
                        this.standardInfo.content[1][1] = msg.content.array[0].S_INFO_PUNIT + msg.content.array[0].S_INFO_TUNIT;
                        this.standardInfo.content[1][3] = msg.content.array[0].S_INFO_DDATE;
                        this.standardInfo.content[2][1] = msg.content.array[0].FS_INFO_PUNIT;
                        this.standardInfo.content[2][3] = msg.content.array[0].S_INFO_DSITE;
                        this.standardInfo.content[3][1] = msg.content.array[0].S_INFO_MFPRICE;
                        this.standardInfo.content[3][3] = msg.content.array[0].S_INFO_FTMARGINS;
                        this.standardInfo.content[4][1] = msg.content.array[0].S_INFO_MAXPRICEFLUCT;
                        this.standardInfo.content[4][3] = msg.content.array[0].S_INFO_DMEAN;
                        this.standardInfo.content[5][1] = msg.content.array[0].S_INFO_CDMONTHS;
                        this.standardInfo.content[5][3] = msg.content.array[0].S_INFO_CODE;
                        this.standardInfo.content[6][1] = msg.content.array[0].S_INFO_LTDATEHOUR;
                        this.standardInfo.content[6][3] = msg.content.array[0].S_INFO_EXNAME;
                        break;
                }
            }
        });
    }

    onSearch(value) {
        this.resList = this.secuinfo.getCodeList(value);
    }

    listClick(item) {
        console.info(item);
        this.selectedValue = item.symbolCode;
        this.symbol = item.SecuAbbr;
        this.code = item.symbolCode;
        this.isStock = (item.ukey & 0x0100) > 0 ? true : false;

        this.marketPerformance.content.option.legend.data = [this.symbol, "沪深300"];
        this.marketPerformance.content.option.series = [{
            name: this.symbol,
            type: "line",
            data: []
        }, {
            name: "沪深300",
            type: "line",
            data: []
        }];

        this.marketChart.setOption(this.marketPerformance.content.option);

        this.quote.send(140, 10, { ukey: parseInt(item.ukey), reqtype: 2, reqno: 1 });
        this.resList = null;
    }

    get codeName() {
        return `${this.symbol}[${this.code}]`;
    }

    createMarketChart() {
        return {
            option: {
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
                    data: [],
                    textStyle: { color: "#F3F3F5" }
                },
                xAxis: {
                    data: [],
                    axisLabel: {
                        textStyle: { color: "#F3F3F5" },
                        interval: (index: number, value: string) => {
                            if (value)
                                return value.endsWith("01");
                        }
                    },
                    axisLine: {
                        lineStyle: { color: "#8AA4E6" }
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
                series: [],
                color: [
                    "#fd0", "#0b0"
                ]
            }
        };
    }

    createInstituteInfo() {
        return {
            option: {
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
                    data: [{ name: "一般法人", textStyle: { color: "#F3F3F5" } }, { name: "收盘价", textStyle: { color: "#F3F3F5" } }],
                    textStyle: { color: "#F3F3F5" }
                },
                xAxis: [{
                    data: ["2016-10-01", "2017-01-01", "2017-04-01", "2017-07-01"],
                    axisLabel: {
                        textStyle: { color: "#F3F3F5" }
                    },
                    axisLine: {
                        lineStyle: { color: "#8AA4E6" }
                    }
                }],
                yAxis: [{
                    name: "一般法人",
                    position: "left",
                    axisLabel: {
                        show: true,
                        textStyle: { color: "#F3F3F5" }
                    },
                    axisLine: {
                        lineStyle: { color: "#8AA4E6" }
                    },
                    splitLine: { show: false },
                    scale: true,
                    boundaryGap: [0.2, 0.2]
                }, {
                    name: "收盘价",
                    position: "right",
                    axisLabel: {
                        show: true,
                        textStyle: { color: "#F3F3F5" }
                    },
                    axisLine: {
                        lineStyle: { color: "#8AA4E6" }
                    },
                    splitLine: { show: false },
                    scale: true,
                    boundaryGap: [0.2, 0.2]
                }],
                series: [{
                    name: "一般法人",
                    type: "line",
                    data: [0.05, 0.1, 0.08, 0.15]
                }, {
                    yAxisIndex: 1,
                    name: "收盘价",
                    type: "line",
                    data: [12, 14, 13, 16]
                }],
                color: [
                    "#00b", "#0b0"
                ]
            }
        };
    }

    createMainIncome() {
        return {
            option: {
                title: { show: false },
                tooltip: {
                    trigger: "item",
                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                },
                legend: {
                    orient: "vertical",
                    left: "left",
                    data: [],
                    textStyle: { color: "#F3F3F5" }
                },
                series: [{
                    name: "项目收入",
                    type: "pie",
                    radius: "50%",
                    center: ["60%", "50%"],
                    data: [],
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: "rgba(0, 0, 0, 0.5)"
                        }
                    }
                }]
            }
        };
    }

    createStructureInfo() {
        let table = new DataTable();
        table.backgroundColor = "transparent";
        table.addColumn("股本结构", "股本数量(万股)", "占比");
        let row1 = table.newRow();
        row1.cells[0].Text = "流通股(非限售)";
        row1.cells[1].Text = "";
        row1.cells[2].Text = "";

        let row2 = table.newRow();
        row2.cells[0].Text = "流通A股";
        row2.cells[1].Text = "";
        row2.cells[2].Text = "";

        let row3 = table.newRow();
        row3.cells[0].Text = "流通B股";
        row3.cells[1].Text = "";
        row3.cells[2].Text = "";

        let row4 = table.newRow();
        row4.cells[0].Text = "流通H股";
        row4.cells[1].Text = "";
        row4.cells[2].Text = "";

        let row5 = table.newRow();
        row5.cells[0].Text = "境外流通股";
        row5.cells[1].Text = "";
        row5.cells[2].Text = "";

        let row6 = table.newRow();
        row6.cells[0].Text = "流通股(限售)";
        row6.cells[1].Text = "";
        row6.cells[2].Text = "";

        let row7 = table.newRow();
        row7.cells[0].Text = "优先股";
        row7.cells[1].Text = "";
        row7.cells[2].Text = "";

        let row8 = table.newRow();
        row8.cells[0].Text = "非流通股";
        row8.cells[1].Text = "";
        row8.cells[2].Text = "";

        let row9 = table.newRow();
        row9.cells[0].Text = "总股本（含优先股）";
        row9.cells[1].Text = "";
        row9.cells[2].Text = "";

        return table;
    }
}