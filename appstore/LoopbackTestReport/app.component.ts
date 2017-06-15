/**
 * created by cl, 2017/05/19
 * update: [date]
 * desc: show loopback test.
 */

import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import {
    VBox, HBox, DropDown, DropDownItem, Button, DataTable, Label, TabPanel, TabPage, ChartViewer, TextBox
} from "../../base/controls/control";
import { WorkerFactory } from "../../base/api/services/uworker.server";
import { AppStateCheckerRef, File, Environment, Sound } from "../../base/api/services/backend.service";
declare let window: any;

@Component({
    moduleId: module.id,
    selector: "body",
    template: `
        <dock-control style="width: 100%; height: 100%" [className]="main.className" [children]="main.children" [styleObj]="main.styleObj" [dataSource]="main.dataSource">
        </dock-control>
    `,
    providers: [
        AppStateCheckerRef
    ]
})
export class AppComponent implements OnInit {
    private readonly apptype = "loopbacktest";
    main: any;
    option: any;
    dd_tests: DropDown;
    txt_freeriskrate: TextBox;
    lbl_maxRetracementRatio: Label;
    lbl_sharpeRatio: Label;
    lbl_percentProfitable: Label;
    txt_pagesize: TextBox;
    txt_pageidx: TextBox;
    lbl_pagecount: Label;
    table: DataTable;
    chart: ChartViewer;
    worker: any;

    constructor(private state: AppStateCheckerRef) {
        this.state.onInit(this, this.onReady);
        this.state.onDestory(this, this.onDestroy);
        this.createWorker();
    }

    onReady(option: any) {
        this.option = option;
        document.title = this.option.name;
        // this.qtp.connect(this.option.port, this.option.host);
    }

    onDestroy() {
        this.worker.dispose();
    }

    createWorker() {
        let self = this;
        this.worker = WorkerFactory.createWorker(`${__dirname}/messageWorker.js`);
        this.worker.onData = data => {
            switch (data.event) {
                case "data":
                    switch (data.content.type) {
                        case 8015:
                            self.setProfitOfItem(data.content.data.nId, data.content.data.Accpl);
                            break;
                        case 8017:
                            self.setDetailsOfItem(data.content.nId, data.content.data);
                            break;
                    }
                    break;
                default:
                    console.error(`unknown data event => ${data.event}!`);
                    break;
            }
        };
        this.worker.send({ command: "start", params: { port: this.option.port, host: this.option.host } });
    }

    ngOnInit() {
        let viewContent = new VBox();
        let svHeaderRow1 = new HBox();
        this.dd_tests = new DropDown();
        this.dd_tests.Title = "Tests:";
        this.dd_tests.Left = 50;
        this.dd_tests.addItem({ Text: "--all--", Value: undefined });

        this.option.tests.forEach(item => {
            this.dd_tests.addItem({ Text: item.date + " " + item.id, Value: item });
        });
        svHeaderRow1.addChild(this.dd_tests);
        let lbl_mode = new Label();
        lbl_mode.Title = "Mode:";
        lbl_mode.Left = 10;
        lbl_mode.Width = 80;
        svHeaderRow1.addChild(lbl_mode);
        let lbl_speed = new Label();
        lbl_speed.Title = "Speed:";
        lbl_speed.Left = 10;
        lbl_speed.Width = 80;
        svHeaderRow1.addChild(lbl_speed);
        let lbl_duration = new Label();
        lbl_duration.Title = "Duration:";
        lbl_duration.Left = 10;
        svHeaderRow1.addChild(lbl_duration);
        let btn_query = new Button();
        btn_query.Left = 10;
        btn_query.Text = "Query";
        svHeaderRow1.addChild(btn_query);
        viewContent.addChild(svHeaderRow1);

        let indicatorRow = new HBox();
        this.txt_freeriskrate = new TextBox();
        this.txt_freeriskrate.Title = "FreeRiskRate:";
        this.txt_freeriskrate.Text = 0.04;
        this.txt_freeriskrate.Left = 50;
        this.txt_freeriskrate.Width = 50;
        indicatorRow.addChild(this.txt_freeriskrate);
        this.lbl_maxRetracementRatio = new Label();
        this.lbl_maxRetracementRatio.Title = "MaxDrawdown:";
        this.lbl_maxRetracementRatio.Left = 10;
        this.lbl_sharpeRatio = new Label();
        this.lbl_sharpeRatio.Title = "Sharpe:";
        this.lbl_sharpeRatio.Left = 10;
        this.lbl_percentProfitable = new Label();
        this.lbl_percentProfitable.Title = "Winning:";
        this.lbl_percentProfitable.Left = 10;
        indicatorRow.addChild(this.lbl_maxRetracementRatio).addChild(this.lbl_sharpeRatio).addChild(this.lbl_percentProfitable);
        viewContent.addChild(indicatorRow);

        let panel = new TabPanel();
        let detailsPage = new TabPage("OrderDetail", "OrderDetail");
        let detailContent = new VBox();
        let pagination = new HBox();
        pagination.align = "center";
        this.txt_pagesize = new TextBox();
        this.txt_pagesize.Title = "页面大小:";
        this.txt_pagesize.Text = 20;
        this.txt_pagesize.Width = 30;
        this.txt_pagesize.onChange = () => {
            this.worker.send({ command: "query", params: { id: this.dd_tests.SelectedItem.Value.id, begin: 0, end: parseInt(this.txt_pagesize.Text) } });
        };
        this.txt_pageidx = new TextBox();
        this.txt_pageidx = new TextBox();
        this.txt_pageidx.Title = ",第";
        this.txt_pageidx.Text = 1;
        this.txt_pageidx.Width = 30;
        this.txt_pageidx.onChange = () => {
            let idx = parseInt(this.txt_pageidx.Text);
            let size = parseInt(this.txt_pagesize.Text);
            if (idx > 0) {
                this.worker.send({ command: "query", params: { id: this.dd_tests.SelectedItem.Value.id, begin: size * (idx - 1), end: size * idx } });
            }
        };
        this.lbl_pagecount = new Label();
        this.lbl_pagecount.Text = "页";
        pagination.addChild(this.txt_pagesize).addChild(this.txt_pageidx).addChild(this.lbl_pagecount);
        detailContent.addChild(pagination);
        this.table = new DataTable("table2");
        this.table.RowIndex = false;
        this.table.addColumn("Index", "Orderid", "Date", "Account", "Innercode", "Status", "Time", "OrderPrice", "OrderVol", "DealPrice", "DealVol", "DealAmt", "B/S");
        detailContent.addChild(this.table);
        detailsPage.setContent(detailContent);
        panel.addTab(detailsPage, false);
        let profitPage = new TabPage("ProfitViewer", "ProfitViewer");
        let profitContent = new VBox();
        this.chart = new ChartViewer();
        this.chart.setOption({
            title: {
                show: false,
            },
            tooltip: {
                tigger: "axis",
                axisPointer: {
                    type: "line"
                },
                formatter: params => {
                    return params.seriesName + "<br />" + params.value.toFixed(3);
                }
            },
            legend: {
                data: ["净值"]
            },
            dataZoom: [
                {
                    type: "inside",
                    xAxisIndex: 0
                }
            ],
            xAxis: [
                {
                    type: "category",
                    boundaryGap: false,
                    axisLabel: {
                        textStyle: {
                            color: "#fff"
                        }
                    },
                    data: []
                }
            ],
            yAxis: [
                {
                    type: "value",
                    name: "净值",
                    nameTextStyle: {
                        color: "#fff"
                    },
                    axisLabel: {
                        formatter: (value, index) => {
                            return value;
                        },
                        textStyle: {
                            color: "#fff"
                        }
                    },
                    boundaryGap: [0.2, 0.2],
                    min: 0.8,
                    interval: 0.05,
                    minInterval: 0.05,
                    splitNumber: 20
                }
            ],
            series: [
                {
                    name: "净值",
                    type: "line",
                    data: []
                }
            ]
        });
        profitContent.addChild(this.chart.containerRef);
        profitPage.setContent(profitContent);
        panel.addTab(profitPage, false);
        panel.setActive("ProfitViewer");
        viewContent.addChild(panel);

        viewContent.addChild(new HBox());
        this.main = viewContent;

        this.dd_tests.SelectChange = () => {
            // table.rows.length = 0;
            if (this.dd_tests.SelectedItem && this.dd_tests.SelectedItem.Value) {
                lbl_mode.Text = this.dd_tests.SelectedItem.Value.simlevel;
                lbl_speed.Text = this.dd_tests.SelectedItem.Value.speed;
                lbl_duration.Text = this.dd_tests.SelectedItem.Value.timebegin + "-" + this.dd_tests.SelectedItem.Value.timeend;
                this.table.rows.length = 0;
                this.worker.send({ command: "query", params: { id: this.dd_tests.SelectedItem.Value.id, begin: 0, end: parseInt(this.txt_pagesize.Text) } });
            }
        };

        btn_query.OnClick = () => {
            if (this.dd_tests.SelectedItem && this.dd_tests.SelectedItem.Value && this.dd_tests.SelectedItem.Value.id !== undefined) {
                this.chart.init();
                this.table.rows.length = 0;
                this.worker.send({ command: "send", params: { type: 8014, data: { nId: this.dd_tests.SelectedItem.Value.id } } });
                this.worker.send({ command: "send", params: { type: 8016, data: { nId: this.dd_tests.SelectedItem.Value.id } } });
                setTimeout(() => {
                    this.worker.send({ command: "query", params: { id: this.dd_tests.SelectedItem.Value.id, begin: 0, end: parseInt(this.txt_pagesize.Text) } });
                }, 1000);
            }
        };
    }

    setDetailsOfItem(id: number, orderdetails: any) {
        if (id === this.dd_tests.SelectedItem.Value.id && Array.isArray(orderdetails)) {
            this.table.rows.length = 0;
            orderdetails.forEach((item, index) => {
                let row = this.table.newRow();
                row.cells[0].Text = (parseInt(this.txt_pageidx.Text) - 1) * parseInt(this.txt_pagesize.Text) + index + 1;
                row.cells[1].Text = item.orderid;
                row.cells[2].Text = item.tradedate;
                row.cells[3].Text = item.accountid;
                row.cells[4].Text = item.innercode;
                row.cells[5].Text = item.orderstatus;
                row.cells[6].Text = item.ordertime;
                row.cells[7].Text = item.orderprice / 10000;
                row.cells[8].Text = item.ordervolume;
                row.cells[9].Text = item.dealprice / 10000;
                row.cells[10].Text = item.dealvolume;
                row.cells[11].Text = item.dealbalance / 10000;
                row.cells[12].Text = item.directive === 1 ? "B" : "S";
            });
            this.table.detectChanges();
        }
    }

    setProfitOfItem(id: number, profit: any) {
        let self = this;
        let total_ratios = [];
        let bottoms = [];
        let tops = [];
        let winCount = 0, sumratio = 0;

        this.chart.changeOption({
            xAxis: [
                {
                    type: "category",
                    boundaryGap: false,
                    data: (function () {
                        let beginYear = self.dd_tests.SelectedItem.Value.timebegin / 10000;
                        let beginMonth = self.dd_tests.SelectedItem.Value.timebegin % 10000 / 100;
                        let beginDay = self.dd_tests.SelectedItem.Value.timebegin % 100;
                        let endYear = self.dd_tests.SelectedItem.Value.timeend / 10000;
                        let endMonth = self.dd_tests.SelectedItem.Value.timeend % 10000 / 100;
                        let endDay = self.dd_tests.SelectedItem.Value.timeend % 100;
                        let beginDate = new Date(beginYear, beginMonth - 1, beginDay);
                        let endDate = new Date(endYear, endMonth - 1, endDay);
                        let res = [];
                        while (beginDate.valueOf() <= endDate.valueOf()) {
                            res.push(beginDate.toLocaleDateString());
                            beginDate.setDate(++beginDay);
                        }
                        return res;
                    })()
                }
            ], series: [
                {
                    name: "净值",
                    type: "line",
                    data: (function () {
                        total_ratios = [];
                        let tmp = null;
                        let firstValue = 0;
                        let lastIdx;
                        profit.forEach((item, idx) => {

                            if (item.aeupl + item.apopl > 0) {
                                ++winCount;
                            }

                            if (idx === 0) {
                                firstValue = item.cost + item.amt - item.aeupl - item.apopl;
                                total_ratios.push((item.cost + item.amt) / firstValue);
                                sumratio += total_ratios[idx];
                                return;
                            }

                            total_ratios.push((item.cost + item.amt) / firstValue);
                            sumratio += total_ratios[idx];

                            if (total_ratios[idx] >= total_ratios[idx - 1]) {
                                if (idx === 1) {
                                    tops.push(idx);
                                } else {
                                    lastIdx = tops.pop();
                                    if (typeof lastIdx === undefined || idx === lastIdx + 1)
                                        tops.push(idx);
                                    else
                                        tops.push(lastIdx, idx);
                                }
                            } else {
                                if (idx === 1) {
                                    tops.push(0);
                                    bottoms.push(idx);
                                } else {
                                    lastIdx = bottoms.pop();
                                    if (typeof lastIdx === undefined || idx === lastIdx + 1)
                                        bottoms.push(idx);
                                    else
                                        bottoms.push(lastIdx, idx);
                                }
                            }
                        });
                        return total_ratios;
                    })(),
                    boundaryGap: [0.2, 0.2],
                    interval: 0.1
                }
            ]
        });

        let maxRetraceRatio = 0;
        let drawdown = 0;
        if (tops.length > 0 && bottoms.length > 0) {
            tops.forEach((itop, itopIdx) => {
                bottoms.filter(idx => { return idx > itop && (idx < tops[itopIdx + 1] || tops.length === itopIdx + 1); }).forEach(ibot => {
                    maxRetraceRatio = total_ratios[itop] - total_ratios[ibot] > maxRetraceRatio ? total_ratios[itop] - total_ratios[ibot] : maxRetraceRatio;
                    drawdown = maxRetraceRatio / total_ratios[itop];
                });
            });
        }
        // console.info(maxRetraceRatio);
        this.lbl_maxRetracementRatio.Text = (drawdown * 100).toFixed(2) + "%";
        this.lbl_percentProfitable.Text = (winCount * 100 / profit.length).toFixed(2) + "%";
        let avgratio = sumratio / profit.length;
        let variance = 0;
        total_ratios.forEach(ratio => {
            variance += Math.pow(ratio - avgratio, 2);
        });

        // console.info(total_ratios, variance);
        if (variance !== 0) {
            let value = ((total_ratios.pop() - 1) * 365 / profit.length - parseFloat(this.txt_freeriskrate.Text)) / (Math.sqrt(variance) * 365);
            // console.info(value);
            this.lbl_sharpeRatio.Text = value.toFixed(2);
        } else {
            this.lbl_sharpeRatio.Text = 0;
        }
    }
}