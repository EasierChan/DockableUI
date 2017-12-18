/**
 * created by cl, 2017/05/19
 * update: [date]
 * desc: show loopback test.
 */

import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import {
    VBox, HBox, DropDown, DropDownItem, Button, DataTable, Label, TabPanel, TabPage, ChartViewer, TextBox, DockContainer, Splitter,
    Dialog
} from "../../base/controls/control";
import { QtpService } from "../../base/api/services/qtp.service";
import { AppStateCheckerRef, Environment, AppStoreService } from "../../base/api/services/backend.service";
import { ServiceType, FGS_MSG } from "../../base/api/model/qtp/message.model";
import { QueryFundAndPosition, COMS_MSG, QueryFundAns, QueryPositionAns } from "../../base/api/model/qtp/coms.model";
import { DataKey } from "../../base/api/model/workbench.model";

@Component({
    moduleId: module.id,
    selector: "body",
    template: `
        <dock-control style="width: 100%; height: 100%" [className]="main.className" [children]="main.children" [styleObj]="main.styleObj" [dataSource]="main.dataSource">
        </dock-control>
        <div *ngIf="dialog && dialog.bshow" class="dialog" [dialog]="dialog">
        </div>
    `,
    providers: [
        QtpService,
        AppStateCheckerRef,
        AppStoreService
    ]
})
export class AppComponent implements OnInit {
    private readonly apptype = "product-trader";
    main: DockContainer;
    dialog: Dialog;
    option: any;
    dd_tests: DropDown;
    txt_freeriskrate: TextBox;
    txt_security: TextBox;
    lbl_maxRetracementRatio: Label;
    lbl_sharpeRatio: Label;
    lbl_percentProfitable: Label;
    txt_pagesize: TextBox;
    txt_pageidx: TextBox;
    lbl_pagecount: Label;
    table: DataTable;
    MarketTable: DataTable;
    chart: ChartViewer;
    worker: any;
    userId: any;
    productId: any;

    constructor(private tradePoint: QtpService, private state: AppStateCheckerRef, private appSrv: AppStoreService) {
        this.state.onInit(this, this.onReady);
        this.state.onDestory(this, this.onDestroy);
    }

    onReady(option: any) {
        this.option = option;
        this.productId = this.option.productID;
        // this.qtp.connect(this.option.port, this.option.host);
    }

    onDestroy() {
    }

    ngOnInit() {
        this.userId = JSON.parse(AppStoreService.getLocalStorageItem(DataKey.kUserInfo)).user_id;
        let [addr, port] = this.appSrv.getSetting().endpoints[0].trade_addr.split(":");

        console.log('userid' + this.userId)


        let viewContentPop = new VBox();//弹框内容

        this.dd_tests = new DropDown();//下拉框
        this.dd_tests.Title = "Tests:";
        this.dd_tests.Left = 50;
        this.dd_tests.addItem({ Text: "--all--", Value: undefined });
        this.dd_tests.addItem({ Text: ServiceType.kCMS, Value: undefined });
        this.dd_tests.addItem({ Text: ServiceType.kCOMS, Value: undefined });

        let popRow1 = new HBox();//行
        popRow1.addChild(this.dd_tests);
        let lbl_mode = new Label();//文字快
        lbl_mode.Title = "Mode:";
        lbl_mode.Left = 10;
        lbl_mode.Width = 80;
        popRow1.addChild(lbl_mode);
        let lbl_speed = new Label();
        lbl_speed.Title = "Speed:";
        lbl_speed.Left = 10;
        lbl_speed.Width = 80;
        popRow1.addChild(lbl_speed);
        let lbl_duration = new Label();
        lbl_duration.Title = "Duration:";
        lbl_duration.Left = 10;
        popRow1.addChild(lbl_duration);
        let lbl_tick = new Label();
        lbl_tick.Title = "Tick:";
        lbl_tick.Left = 10;
        lbl_tick.Width = 80;
        popRow1.addChild(lbl_tick);
        viewContentPop.addChild(popRow1);

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
        viewContentPop.addChild(indicatorRow);


        let viewContent = new VBox();//非弹框内容
        let panel = new TabPanel();
        let profitAndLossPage = new TabPage("profitAndLossPage", "盈亏");

        let detailContent = new HBox();
        detailContent.height = 500;
        let pagination = new HBox();
        pagination.align = "center";
        this.txt_pagesize = new TextBox();
        this.txt_pagesize.Left = 100;
        this.txt_pagesize.Title = "页面大小:";
        this.txt_pagesize.Text = 20;
        this.txt_pagesize.Width = 30;
        this.txt_pagesize.onChange = () => {
            this.worker.send({ command: "query", params: { id: this.dd_tests.SelectedItem.Value.id, begin: 0, end: parseInt(this.txt_pagesize.Text) } });
        };
        this.txt_pageidx = new TextBox();//分页
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
        this.table.height = 200;
        this.table.RowIndex = false;
        this.table.addColumn("Index", "Orderid", "Date", "Account", "Innercode", "Status", "Time", "OrderPrice", "OrderVol", "DealPrice", "DealVol", "DealAmt", "B/S");
        for (let i = 0; i <= 10; i++) {
            let row = this.table.newRow();
            row.cells[0].Text = i;
            row.cells[1].Text = i;
        }


        detailContent.addChild(this.table);
        profitAndLossPage.setContent(detailContent);
        panel.addTab(profitAndLossPage, false);
        panel.setActive("profitAndLossPage");
        let positionPage = new TabPage("productPosition", "仓位");
        let positionContent = new HBox();
        positionContent.height = 500;
        positionContent.addChild(this.table);
        positionPage.setContent(positionContent);
        panel.addTab(positionPage, false);
        // panel.setActive("OrderDetail");
        let profitPage = new TabPage("ProfitViewer", "收益");
        let profitContent = new VBox();
        profitPage.setContent(profitContent);
        panel.addTab(profitPage, false);
        let availableFundPage = new TabPage("availableFundViewer", "可用资金");
        let availableFundContent = new VBox();
        availableFundPage.setContent(availableFundContent);
        panel.addTab(availableFundPage, false);
        viewContent.addChild(panel);

        let svHeaderRow1 = new HBox();//行


        let btn_query = new Button();//按钮
        btn_query.Left = 100;
        btn_query.Text = "Query";
        svHeaderRow1.addChild(btn_query);
        viewContent.addChild(svHeaderRow1);



        let Market = new TabPage("MarketId", "行情");
        let MarketCon = new VBox();
        MarketCon.MinHeight = 200;
        let panel2 = new TabPanel();
        let inputRow = new HBox();
        this.txt_security = new TextBox();
        this.txt_security.Title = "股票代码:";
        this.txt_security.Text = '';
        this.txt_security.Left = 50;
        this.txt_security.Width = 50;
        inputRow.addChild(this.txt_security);
        MarketCon.addChild(inputRow);

        this.MarketTable = new DataTable("table2");
        this.MarketTable.RowIndex = false;
        this.MarketTable.addColumn("1", "2", "3");
        // this.MarketTable.height = 200;
        this.MarketTable.align = 'center'
        for (let i = 0; i <= 10; i++) {
            let row = this.MarketTable.newRow();
            row.cells[0].Text = '2' + i;
            row.cells[1].Text = i;
        }
        this.MarketTable.onRowDBClick = (rowItem, rowIndex) => {
            alert(rowIndex);
            Dialog.popup(this, viewContentPop, { title: "ceshi", width: 500, height: 500 });
        }
        MarketCon.addChild(this.MarketTable);
        Market.setContent(MarketCon);
        panel2.addTab(Market, false);
        panel2.setActive("MarketId");

        this.main = new DockContainer(null, "v", window.innerWidth, window.innerHeight);
        this.main.addChild(new DockContainer(this.main, "h", null, window.innerHeight / 2).addChild(viewContent));
        this.main.addChild(new Splitter("h", this.main));
        this.main.addChild(new DockContainer(this.main, "h", null, window.innerHeight - window.innerHeight / 2).addChild(panel2));


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
            // Dialog.popup(this, viewContentPop, { title: "ceshi", width: 500, height: 500 });
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

        //建立TCP链接
        this.registryListeners();
        this.tradePoint.connect(parseInt(port), addr);

        this.tradePoint.onConnect = () => {
            this.tradePoint.send(FGS_MSG.kLogin, JSON.stringify({ data: JSON.parse(AppStoreService.getLocalStorageItem(DataKey.kUserInfo)) }), ServiceType.kLogin);
        };

        this.tradePoint.onClose = () => {

        };
        // this.userId = Number(this.appSrv.getUserProfile().username);

        //数据请求
        this.tradePoint.addSlot({
            service: ServiceType.kCOMS,
            msgtype: COMS_MSG.kMtFQueryFundAns,
            callback: (msg) => {
                console.log(msg)
                if (msg != undefined) {
                    let ans = new QueryFundAns();
                    ans.fromBuffer(msg);
                    ans.avl_amt = 0;
                }


            }
        });

        this.tradePoint.addSlot({
            service: ServiceType.kCOMS,
            msgtype: COMS_MSG.kMtFQueryPositionAns,
            callback: (msg) => {
                console.log(msg)
                if (msg != undefined) {
                    let ans = new QueryPositionAns();
                    ans.fromBuffer(msg);
                    ans.avl_cre_redemp_qty = 0;
                }


            }
        });

        this.tradePoint.addSlotOfCMS("getAssetAccount", (res) => {
            let data = JSON.parse(res.toString());
            console.log(data.body[0].acid);

            let fund = new QueryFundAndPosition();
            fund.portfolio_id = 0;
            fund.fund_account_id = parseInt(data.body[0].acid);

            let position = new QueryFundAndPosition();
            position.portfolio_id = 0;
            position.fund_account_id = parseInt(data.body[0].acid);

            this.tradePoint.send(COMS_MSG.kMtFQueryFund, fund.toBuffer(), ServiceType.kCOMS);
            this.tradePoint.send(COMS_MSG.kMtFQueryPosition, position.toBuffer(), ServiceType.kCOMS);
        }, this);

    }

    registryListeners() {
        this.tradePoint.addSlot({
            service: ServiceType.kLogin,
            msgtype: FGS_MSG.kLoginAns,
            callback: (msg) => {
                console.info(msg.toString());
                this.tradePoint.sendToCMS("getAssetAccount", JSON.stringify({
                    data: {
                        head: { userid: this.userId },
                        body: {}
                    }
                }));


            }
        })
    }
}