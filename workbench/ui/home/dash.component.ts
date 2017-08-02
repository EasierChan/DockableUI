"use strict";

import { Component, OnInit, OnDestroy } from "@angular/core";
import { Section, DataTable } from "../../../base/controls/control";
import { SecuMasterService } from "../../../base/api/services/backend.service";
import { QuoteService } from "../../bll/services";
import { ECharts } from "echarts";


@Component({
    moduleId: module.id,
    selector: "dashboard",
    templateUrl: "dash.html",
    styleUrls: ["home.component.css", "dash.css"]
})
export class DashboardComponent implements OnInit, OnDestroy {
    codeTableSection: Section;
    codeChartSection: Section;
    eventSection: Section;
    todoSection: Section;

    constructor(private secuinfo: SecuMasterService, private quote: QuoteService) {
    }

    ngOnInit() {
        this.codeTableSection = new Section();
        this.codeTableSection.title = "指数行情";
        this.codeTableSection.content = new DataTable("table2");
        this.codeTableSection.content.addColumn("代码", "名称");
        // "现价", "涨跌", "涨跌幅", "振幅", "最高", "最低", "成交量", "成交金额"
        let indexs = [
            {
                code: "000001",
                ukey: "2490370",
                chname: "上证综指"
            },
            {
                code: "399106",
                ukey: "1441793",
                chname: "深证综指"
            },
            {
                code: "399905",
                ukey: "1441857",
                chname: "中证500"
            },
            {
                code: "399300",
                ukey: "1441838",
                chname: "沪深300"
            },
            {
                code: "000016",
                ukey: "2490384",
                chname: "上证50"
            },
            {
                code: "000300",
                ukey: "2490387",
                chname: "沪深300"
            },
            {
                code: "000905",
                ukey: "2490395",
                chname: "中证500"
            }];

        indexs.forEach(item => {
            let row = this.codeTableSection.content.newRow();
            row.cells[0].Text = item.code;
            row.cells[1].Text = item.chname;
        });

        this.codeTableSection.content.onRowDBClick = (row, rowIdx) => {
            this.codeChartSection.content.option.legend.data = [`${indexs[rowIdx].chname}`];
            this.codeChartSection.content.option.yAxis.name = `${indexs[rowIdx].chname}`;
            this.codeChartSection.content.option.series.name = `${indexs[rowIdx].chname}`;

            this.codeChartSection.content.chart.setOption(this.codeChartSection.content.option);
            // TODO request minutedata with indexs[rowIdx].ukey
            console.info(indexs[rowIdx].ukey);

            this.quote.send(141, 10001, {
                requestId: 1,
                dataType: 107001,
                ukeyCode: parseInt(indexs[rowIdx].ukey)
            });
        };

        this.codeChartSection = new Section();
        this.codeChartSection.title = "分时图";
        this.codeChartSection.content = this.createMinuteChart();

        this.eventSection = new Section();
        this.eventSection.title = "事件";
        this.eventSection.content = new DataTable("table2");
        this.eventSection.content.addColumn("标题", "日期");
        let row;
        row = this.eventSection.content.newRow();
        row.cells[0].Text = "沙场阅兵点燃军工投资热情",
            row.cells[1].Text = "08:28";
        row = null;
        row = this.eventSection.content.newRow();
        row.cells[0].Text = "中央环保督察组即将进驻四川, 攀西钛矿产能受限";
        row.cells[1].Text = "07-28 15:50";
        row = null;
        row = this.eventSection.content.newRow();
        row.cells[0].Text = "多晶硅硅料短缺助推价格上涨";
        row.cells[1].Text = "07-28 17:00";
        row = this.eventSection.content.newRow();
        row.cells[0].Text = "中国电信拟于2019实现5G试商用";
        row.cells[1].Text = "07-28 15:28";
        row = null;

        this.todoSection = new Section();
        this.todoSection.title = "TODO";
        this.todoSection.content = new DataTable("table2");
        this.todoSection.content.addColumn("日期", "标题");
        row = this.todoSection.content.newRow();
        row.cells[1].Text = "制定交易计划";
        row.cells[0].Text = "08:28";
        row = null;
        row = this.todoSection.content.newRow();
        row.cells[1].Text = "卖出货币基金";
        row.cells[0].Text = "08:28";
        row = null;
        row = this.todoSection.content.newRow();
        row.cells[1].Text = "买入货币基金";
        row.cells[0].Text = "08:28";
        row = null;

        this.registerListeners();
    }

    registerListeners() {
        this.quote.addSlot({
            appid: 141,
            packid: 10002,
            callback: (msg) => {
                console.info(msg);
                this.codeChartSection.content.option.xAxis.data = [];
                msg.content.data.forEach(item => {
                    this.codeChartSection.content.option.xAxis.data.push(item.time / 100000);
                    this.codeChartSection.content.option.series.data.push(item.close);
                });

                this.codeChartSection.content.chart.setOption(this.codeChartSection.content.option);
            }
        });
    }

    ngOnDestroy() {
        if (this.codeChartSection) {
            this.codeChartSection.content = null;
        }

        if (this.codeTableSection) {
            this.codeTableSection.content = null;
        }
    }

    onChartInit(chart) {
        this.codeChartSection.content.chart = chart;
    }

    createMinuteChart() {
        return {
            chart: null,
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
                        textStyle: { color: "#F3F3F5" }
                    },
                    axisLine: {
                        lineStyle: { color: "#F3F3F5" }
                    }
                },
                yAxis: {
                    name: "分时图",
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
                },
                series: {
                    name: "分时图",
                    type: "line",
                    data: [],
                    showSymbol: false
                }
            }
        };
    }
}

