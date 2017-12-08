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
    private readonly apptype = "product-trader";
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
    }

    onReady(option: any) {
        this.option = option;
        document.title = this.option.name;
        // this.qtp.connect(this.option.port, this.option.host);
    }

    onDestroy() {
        File.writeSync(`${Environment.getDataPath(this.option.name, "StrategyTrader")}/layout.json`, this.main.getLayout());
        File.writeSync(`${Environment.getDataPath(this.option.name, "StrategyTrader")}/config.json`, this.option.config);
    }

    ngOnInit() {
        let viewContent = new VBox();
        let svHeaderRow1 = new HBox();
        this.dd_tests = new DropDown();
        this.dd_tests.Title = "Tests:";
        this.dd_tests.Left = 50;
        this.dd_tests.addItem({ Text: "--all--", Value: undefined });

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
        let lbl_tick = new Label();
        lbl_tick.Title = "Tick:";
        lbl_tick.Left = 10;
        lbl_tick.Width = 80;
        svHeaderRow1.addChild(lbl_tick);
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
                lbl_tick.Text = this.dd_tests.SelectedItem.Value.period.toString() + (this.dd_tests.SelectedItem.Value.unit === 0 ? " min" : " day");
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
}