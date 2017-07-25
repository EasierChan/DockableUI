"use strict";

import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { DataTable, DataTableColumn, ChartViewer } from "../../../base/controls/control";
import { SecuMasterService } from "../../../base/api/services/backend.service";
import { TradeService, QuoteService } from "../../bll/services";

@Component({
    moduleId: module.id,
    selector: "security-master",
    templateUrl: "security.component.html",
    styleUrls: ["../home/home.component.css", "security.component.css"],
    providers: [
        SecuMasterService
    ]
})
export class SecurityComponent implements OnInit {
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
    resList: Section;
    selectedValue: string;
    @ViewChild("mainIncomeIMG") mainIncomeBitmap: ElementRef;

    constructor(private quote: QuoteService, private secuinfo: SecuMasterService) {
    }

    ngOnInit() {
        this.symbol = "金证股份";
        this.code = "600446.SZ";
        this.summary = new Section();
        this.summary.title = "公司简介";
        this.summary.content = "";

        this.keyInfo = new Section();
        this.keyInfo.title = "关键指标";
        this.keyInfo.content = new Array<ListItem>();
        this.keyInfo.content.push({
            name: "总市值(亿元)",
            value: ""
        });
        this.keyInfo.content.push({
            name: "总股本(万股)",
            value: ""
        });
        this.keyInfo.content.push({
            name: "PE(TM)",
            value: ""
        });
        this.keyInfo.content.push({
            name: "PE(2017E)",
            value: "--"
        });
        this.keyInfo.content.push({
            name: "PB(MRQ)",
            value: "1.01"
        });
        this.keyInfo.content.push({
            name: "PS(TTM)",
            value: "2.39"
        });

        this.baseInfo = new Section();
        this.baseInfo.title = "公司信息";
        this.baseInfo.content = new Array<ListItem>();
        this.baseInfo.content.push({
            name: "公司名称",
            value: ""
        });
        this.baseInfo.content.push({
            name: "曾用名",
            value: "--"
        });
        this.baseInfo.content.push({
            name: "所属行业",
            value: "货币金融服务"
        });
        this.baseInfo.content.push({
            name: "成立日期",
            value: "1998-10-01"
        });
        this.baseInfo.content.push({
            name: "上市日期",
            value: "--"
        });
        this.baseInfo.content.push({
            name: "注册资本(万元)",
            value: "28,103,763,899 CNY"
        });
        this.baseInfo.content.push({
            name: "注册地址",
            value: "深圳市南山区高新南4道9号"
        });
        this.baseInfo.content.push({
            name: "员工总数",
            value: "4,000"
        });
        this.baseInfo.content.push({
            name: "董事长",
            value: "赵剑"
        });
        this.baseInfo.content.push({
            name: "总经理",
            value: "李洁义"
        });
        this.baseInfo.content.push({
            name: "第一股东",
            value: "深圳金证科技股份有限公司"
        });
        this.baseInfo.content.push({
            name: "公司网站",
            value: "www.baidu.com"
        });

        this.mainIncome = new Section();
        this.mainIncome.title = "主营构成";
        this.mainIncome.content = this.createMainIncome();

        // let canvas: HTMLCanvasElement = this.mainIncomeBitmap.nativeElement;
        // let ctx: CanvasRenderingContext2D = canvas.getContext("2d");
        // ctx.fillStyle = "#40f";
        // ctx.beginPath();
        // ctx.moveTo(80, 80);
        // ctx.arc(80, 80, 50, 0, Math.PI * 2 * this.mainIncome.content.b, true);
        // ctx.closePath();
        // ctx.fill();

        // ctx.fillStyle = "#0f0";
        // ctx.beginPath();
        // ctx.moveTo(80, 80);
        // ctx.arc(80, 80, 50, Math.PI * 2 * this.mainIncome.content.b, 0, true);
        // ctx.closePath();
        // ctx.fill();
        // ctx.strokeStyle = "#fff";
        // ctx.lineWidth = 2;
        // ctx.stroke();

        this.tenInfo = new Section();
        this.tenInfo.title = "十大股东";
        this.tenInfo.content = new DataTable();
        this.tenInfo.content.backgroundColor = "transparent";
        this.tenInfo.content.addColumn("股东名称", "股本数量", "占比");
        for (let i = 0; i < 10; ++i) {
            let row = this.tenInfo.content.newRow();
            row.cells[0].Text = "上海国际";
            row.cells[1].Text = "2,810,376,39";
            row.cells[2].Text = "98.94%";
        }

        this.marketPerformance = new Section();
        this.marketPerformance.title = "市场表现";
        this.marketPerformance.content = this.createMarketChart();


        this.numberInfo = new Section();
        this.numberInfo.title = "现任高管";
        this.numberInfo.content = new DataTable();
        this.numberInfo.content.backgroundColor = "transparent";
        this.numberInfo.content.addColumn("姓名", "职务", "任职日期");
        for (let i = 0; i < 10; ++i) {
            let row = this.numberInfo.content.newRow();
            row.cells[0].Text = "李洁义";
            row.cells[1].Text = "总经理";
            row.cells[2].Text = "2017-06-01";
        }

        this.instituteInfo = new Section();
        this.instituteInfo.title = "机构持股";
        this.instituteInfo.content = this.createInstituteInfo();

        this.structureInfo = new Section();
        this.structureInfo.title = "股本结构";
        this.structureInfo.content = new DataTable();
        this.structureInfo.content.backgroundColor = "transparent";
        this.structureInfo.content.addColumn("股本结构", "股本数量(万股)", "占比");
        for (let i = 0; i < 10; ++i) {
            let row = this.structureInfo.content.newRow();
            row.cells[0].Text = "流通股";
            row.cells[1].Text = "2,810,376.39";
            row.cells[2].Text = "98.94%";
        }

        this.registerListener();
    }

    registerListener() {
        let self = this;

        this.quote.addSlot({
            appid: 140,
            packid: 11,
            callback: (msg) => {
                console.info(msg);
                switch (msg.content.type) {
                    case 1:
                        self.summary.content = msg.content.S_INFO_CHINESEINTRODUCTION;
                        self.baseInfo.content[0].value = msg.content.chname;
                        self.baseInfo.content[3].value = msg.content.S_INFO_FOUNDDATE.substr(0, 4) + "-" + msg.content.S_INFO_FOUNDDATE.substr(4, 2) + "-" + msg.content.S_INFO_FOUNDDATE.substr(6, 2);
                        self.baseInfo.content[5].value = msg.content.S_INFO_REGCAPITAL;
                        self.baseInfo.content[6].value = msg.content.S_INFO_OFFICE;
                        self.baseInfo.content[7].value = msg.content.S_INFO_TOTALEMPLOYEES;
                        self.baseInfo.content[8].value = msg.content.S_INFO_CHAIRMAN;
                        self.baseInfo.content[9].value = msg.content.S_INFO_PRESIDENT;
                        // self.baseInfo.content[10].value = msg.content.S_INFO_PRESIDENT;
                        self.baseInfo.content[11].value = msg.content.S_INFO_WEBSITE;
                        break;
                    case 2:
                        this.keyInfo.content[1].value = msg.content.TOT_SHR;
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
                    data: [{ name: this.symbol, textStyle: { color: "#F3F3F5" } }, { name: "沪深300", textStyle: { color: "#F3F3F5" } }],
                    textStyle: { color: "#F3F3F5" }
                },
                xAxis: [{
                    data: ["2016-10-01", "2017-01-01", "2017-04-01", "2017-07-01"],
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
                series: [{
                    name: this.symbol,
                    type: "line",
                    data: [0.05, 0.1, 0.08, 0.15]
                }, {
                    name: "沪深300",
                    type: "line",
                    data: [0.06, 0.2, 0.18, 0.15]
                }],
                color: [
                    "#00b", "#0b0"
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
                        lineStyle: { color: "#F3F3F5" }
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
                        lineStyle: { color: "#F3F3F5" }
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
                        lineStyle: { color: "#F3F3F5" }
                    },
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
                    data: ["利息收入", "非利息收入"],
                    textStyle: { color: "#F3F3F5" }
                },
                series: [{
                    name: "项目收入",
                    type: "pie",
                    radius: "50%",
                    center: ["50%", "60%"],
                    data: [
                        { value: 335, name: "利息收入" },
                        { value: 135, name: "非利息收入" }
                    ],
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
}

export class Section {
    title: string;
    content: string | DataTable | ListItem[] | any;
}

export class ListItem {
    name: string;
    value: string;
}