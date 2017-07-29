"use strict";

import { Component, OnInit, OnDestroy } from "@angular/core";
import { Section, DataTable } from "../../../base/controls/control";
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

    constructor() {
    }

    ngOnInit() {
        this.codeTableSection = new Section();
        this.codeTableSection.title = "指数行情";
        this.codeTableSection.content = new DataTable("table2");
        this.codeTableSection.content.addColumn("代码", "名称",
            "现价", "涨跌", "涨跌幅", "振幅", "最高", "最低", "成交量", "成交金额");
        this.codeTableSection.content.backgroundColor = "transparent";

        this.codeChartSection = new Section();
        this.codeChartSection.title = "分时图";
        this.codeChartSection.content = this.createMinuteChart();

        this.eventSection = new Section();
        this.eventSection.title = "事件";
        this.eventSection.content = new DataTable("table2");
        this.eventSection.content.addColumn("标题", "日期");

        this.todoSection = new Section();
        this.todoSection.title = "TODO";
        this.todoSection.content = new DataTable("table2");
        this.todoSection.content.addColumn("标题", "日期");
    }

    registerListeners() {
        // 
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
                    data: ["分时图"],
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

