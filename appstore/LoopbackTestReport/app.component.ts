/**
 * created by cl, 2017/05/19
 * update: [date]
 * desc: show loopback test.
 */

import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import {
    VBox, HBox, DropDown, DropDownItem, Button, DataTable, Label, TabPanel, TabPage, ChartViewer
} from "../../base/controls/control";
import { QtpService } from "../../base/api/services/qtp.service";
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
        QtpService,
        AppStateCheckerRef
    ]
})
export class AppComponent implements OnInit {
    private readonly apptype = "loopbacktest";
    main: any;
    option: any;
    dd_tests: DropDown;
    table: DataTable;
    chart: ChartViewer;
    resultMap: any = {};

    constructor(private state: AppStateCheckerRef, private qtp: QtpService) {
    }

    onReady(option: any) {
        this.option = option;
        document.title = this.option.name;
        this.qtp.connect(this.option.port, this.option.host);
    }

    ngOnInit() {
        let self = this;
        this.state.onInit(this, this.onReady);
        let viewContent = new VBox();
        let svHeaderRow1 = new HBox();
        let dd_tests = new DropDown();
        dd_tests.Title = "Tests:";
        dd_tests.Left = 50;
        dd_tests.addItem({ Text: "--all--", Value: undefined });

        this.option.tests.forEach(item => {
            dd_tests.addItem({ Text: item.date + " " + item.id, Value: item });
        });
        svHeaderRow1.addChild(dd_tests);
        let lbl_mode = new Label();
        lbl_mode.Title = "Mode:";
        lbl_mode.Left = 10;
        lbl_mode.Width = 50;
        svHeaderRow1.addChild(lbl_mode);
        let lbl_speed = new Label();
        lbl_speed.Title = "Speed:";
        lbl_speed.Left = 10;
        lbl_speed.Width = 50;
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
        let panel = new TabPanel();
        let detailsPage = new TabPage("OrderDetail", "OrderDetail");
        let detailContent = new VBox();
        this.table = new DataTable("table2");
        this.table.addColumn("Orderid", "Date", "Account", "Innercode", "Status", "Time", "OrderPrice", "OrderVol", "DealPrice", "DealVol", "DealAmt", "B/S");
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
                }
            },
            legend: {
                data: ["profit"]
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
                    data: []
                }
            ],
            yAxis: [
                {
                    type: "value",
                    name: "盈亏(元)",
                    boundaryGap: [0.2, 0.2]
                }
            ],
            series: [
                {
                    name: "profit",
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

        dd_tests.SelectChange = () => {
            // table.rows.length = 0;
            if (dd_tests.SelectedItem && dd_tests.SelectedItem.Value) {
                lbl_mode.Text = dd_tests.SelectedItem.Value.simlevel;
                lbl_speed.Text = dd_tests.SelectedItem.Value.speed;
                lbl_duration.Text = dd_tests.SelectedItem.Value.timebegin + "-" + dd_tests.SelectedItem.Value.timeend;
                if (this.resultMap.hasOwnProperty(dd_tests.SelectedItem.Value.id)) {
                    this.table.rows.length = 0;
                    self.setDetailsOfItem(dd_tests.SelectedItem.Value.id, self.resultMap[dd_tests.SelectedItem.Value.id].details);

                    self.chart.changeOption({
                        xAxis: [
                            {
                                type: "category",
                                boundaryGap: false,
                                data: (function () {
                                    let beginYear = dd_tests.SelectedItem.Value.timebegin / 10000;
                                    let beginMonth = dd_tests.SelectedItem.Value.timebegin % 10000 / 100;
                                    let beginDay = dd_tests.SelectedItem.Value.timebegin % 100;
                                    let endYear = dd_tests.SelectedItem.Value.timeend / 10000;
                                    let endMonth = dd_tests.SelectedItem.Value.timeend % 10000 / 100;
                                    let endDay = dd_tests.SelectedItem.Value.timeend % 100;
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
                                name: "profit",
                                type: "line",
                                data: (function () {
                                    let res = [];
                                    self.resultMap[dd_tests.SelectedItem.Value.id].pnl.forEach(item => {
                                        res.push(item.aeupl + item.apopl);
                                    });
                                    return res;
                                })()
                            }
                        ]
                    });
                }
            }
        };

        btn_query.OnClick = () => {
            console.info(dd_tests.SelectedItem);
            if (dd_tests.SelectedItem && dd_tests.SelectedItem.Value && dd_tests.SelectedItem.Value.id !== undefined) {
                this.chart.init();
                console.info(`hello`);
                this.table.rows.length = 0;
                this.qtp.send(8014, { nId: dd_tests.SelectedItem.Value.id }); // pnl
                this.qtp.send(8016, { nId: dd_tests.SelectedItem.Value.id }); // detail
            }
        };

        this.qtp.addSlot(
            {
                msgtype: 8013,
                callback: msg => {
                    console.info(msg);
                    // let row = table.newRow();
                }
            },
            {
                msgtype: 8015,
                callback: msg => {
                    console.info(msg);
                    // let row = table.newRow();
                    if (!self.resultMap.hasOwnProperty(msg.nId)) {
                        self.resultMap[msg.nId] = {};
                    }
                    self.resultMap[msg.nId].pnl = msg.Accpl;
                    self.chart.changeOption({
                        xAxis: [
                            {
                                type: "category",
                                boundaryGap: false,
                                data: (function () {
                                    let beginYear = dd_tests.SelectedItem.Value.timebegin / 10000;
                                    let beginMonth = dd_tests.SelectedItem.Value.timebegin % 10000 / 100;
                                    let beginDay = dd_tests.SelectedItem.Value.timebegin % 100;
                                    let endYear = dd_tests.SelectedItem.Value.timeend / 10000;
                                    let endMonth = dd_tests.SelectedItem.Value.timeend % 10000 / 100;
                                    let endDay = dd_tests.SelectedItem.Value.timeend % 100;
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
                                name: "profit",
                                type: "line",
                                data: (function () {
                                    let res = [];
                                    self.resultMap[dd_tests.SelectedItem.Value.id].pnl.forEach(item => {
                                        res.push((item.aeupl + item.apopl) / 10000);
                                    });
                                    return res;
                                })()
                            }
                        ]
                    });
                }
            },
            {
                msgtype: 8017,
                callback: msg => {
                    console.info(msg);
                    self.table.rows.length = 0;
                    self.setDetailsOfItem(msg.nId, msg.orderdetails);
                }
            }
        );


    }

    setDetailsOfItem(id: number, orderdetails: any) {
        if (Array.isArray(orderdetails)) {
            if (!this.resultMap.hasOwnProperty(id)) {
                this.resultMap[id] = {};
            }
            this.resultMap[id].details = orderdetails;
            orderdetails.forEach(item => {
                let row = this.table.newRow();
                row.cells[0].Text = item.orderid;
                row.cells[1].Text = item.tradedate;
                row.cells[2].Text = item.accountid;
                row.cells[3].Text = item.innercode;
                row.cells[4].Text = item.orderstatus;
                row.cells[5].Text = item.ordertime;
                row.cells[6].Text = item.orderprice / 10000;
                row.cells[7].Text = item.ordervolume;
                row.cells[8].Text = item.dealprice / 10000;
                row.cells[9].Text = item.dealvolume;
                row.cells[10].Text = item.dealbalance / 10000;
                row.cells[11].Text = item.directive === 1 ? "B" : "S";
            });
        }
    }

    setProfitOfItem(id: number, profit: any) {

    }
}