/**
 * created by cl, 2017/05/19
 * update: [date]
 * desc: show loopback test.
 */

import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import {
    VBox, HBox, DropDown, DropDownItem, Button, DataTable, Label, TabPanel, TabPage, ChartViewer, TextBox, DockContainer, Splitter,
    Dialog, Section, EChart, MetaControl
} from "../../base/controls/control";
import { QtpService } from "../../base/api/services/qtp.service";
import { AppStateCheckerRef, Environment, AppStoreService, TranslateService } from "../../base/api/services/backend.service";
import { ServiceType, FGS_MSG } from "../../base/api/model/qtp/message.model";
import { QueryFundAndPosition, COMS_MSG, QueryFundAns, QueryPositionAns, SendOrder, OrderStatus, CancelOrder, CancelOrderAns } from "../../base/api/model/qtp/coms.model";
import { DataKey } from "../../base/api/model/workbench.model";
import { ECharts } from "echarts";

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
        AppStoreService,
        TranslateService
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
    fundAccountTable: DataTable;
    tradeAccountTable: DataTable;
    MarketTable: DataTable;
    orderStatTable: DataTable;
    finishOrderTable: DataTable;
    chart: ChartViewer;
    worker: any;
    userId: any;
    productId: any;
    acidObj: any = {};
    productNetData: any;
    productNetChart: ChartViewer;
    productNet: Section;//产品净值
    private viewContentPop: any;
    private dd_Account: DropDown;
    private dd_portfolioAccount: DropDown;
    private dd_Strategy: DropDown;
    private dd_symbol: DropDown;
    private languageType: number = 1;　 // * 0,English 1,chinese
    private dd_Action: any;
    private txt_UKey: any;
    private txt_Symbol: any;
    private txt_Price: any;

    constructor(private tradePoint: QtpService, private state: AppStateCheckerRef, private appSrv: AppStoreService, private langServ: TranslateService,) {
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

        console.log('userid' + this.userId);
        console.log('this.productId:' + this.productId)


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
                let leftAlign = 20;
        let rowSep = 5;
        // this.tradePage = new TabPage("ManulTrader", this.langServ.get("ManulTrader"));
        this.viewContentPop = new VBox();
        this.viewContentPop.MinHeight = 500;
        this.viewContentPop.MinWidth = 500;

        let account_firrow = new HBox();
        this.dd_Account = new DropDown();
        this.dd_Account.Width = 120;
        let dd_accountRtn = this.langServ.get("PortfolioID");
        let account_Label = new Label();
        if (this.languageType === 0)
            account_Label.Text = "  " + dd_accountRtn + ": ";
        else
            account_Label.Text = "　　　" + dd_accountRtn + ": ";
        account_Label.Left = leftAlign;
        account_Label.Top = rowSep;
        this.dd_Account.Title = "";
        this.dd_Account.Top = rowSep;
        this.dd_Account.Width = 150;
        account_firrow.top = 10;
        account_firrow.addChild(account_Label).addChild(this.dd_Account);
        this.viewContentPop.addChild(account_firrow);

        let strategy_secrow = new HBox();
        let dd_strategyRtn = this.langServ.get("Strategy");
        let strategy_label = new Label();
        if (0 === this.languageType)
            strategy_label.Text = " " + dd_strategyRtn + ": ";
        else
            strategy_label.Text = "　　　" + dd_strategyRtn + ": ";
        strategy_label.Left = leftAlign;
        strategy_label.Top = rowSep;
        this.dd_Strategy = new DropDown();
        this.dd_Strategy.Title = "";
        this.dd_Strategy.Width = 120;
        this.dd_Strategy.Top = rowSep;
        this.dd_Strategy.Width = 150;
        strategy_secrow.top = 5;
        strategy_secrow.addChild(strategy_label).addChild(this.dd_Strategy);
        this.viewContentPop.addChild(strategy_secrow);

        let action_sevenrow = new HBox();
        let dd_ActionRtn = this.langServ.get("Action");
        let action_label = new Label();
        if (0 === this.languageType)
            action_label.Text = "   " + dd_ActionRtn + ": ";
        else
            action_label.Text = "　　　" + dd_ActionRtn + ": ";
        action_label.Left = leftAlign;
        action_label.Top = rowSep;
        this.dd_Action = new DropDown();
        this.dd_Action.Top = rowSep;
        this.dd_Action.Title = "";
        this.dd_Action.Width = 150;
        let buyRtn = this.langServ.get("Buy");
        let sellRtn = this.langServ.get("Sell");
        this.dd_Action.addItem({ Text: buyRtn, Value: 0 });
        this.dd_Action.addItem({ Text: sellRtn, Value: 1 });
        action_sevenrow.top = 5;
        action_sevenrow.addChild(action_label).addChild(this.dd_Action);
        this.viewContentPop.addChild(action_sevenrow);

        let symbol_thirdrow = new HBox();
        let txt_symbolRtn = this.langServ.get("Symbol");
        let symbol_label = new Label();
        symbol_label.Left = leftAlign;
        if (0 === this.languageType)
            symbol_label.Text = "   " + txt_symbolRtn + ": ";
        else {
            symbol_label.Left = 10;
            symbol_label.Text = "　　" + txt_symbolRtn + ": ";
        }
        symbol_label.Top = rowSep;
        this.txt_Symbol = new MetaControl("textbox");
        this.txt_Symbol.Top = rowSep;
        this.txt_Symbol.Title = "";
        this.txt_Symbol.Width = 150;
        symbol_thirdrow.top = 5;
        symbol_thirdrow.addChild(symbol_label).addChild(this.txt_Symbol);
        this.viewContentPop.addChild(symbol_thirdrow);

        let ukey_fourthrow = new HBox();
        let txt_UKeyRtn = this.langServ.get("UKEY");
        let ukey_label = new Label();
        ukey_label.Left = leftAlign;
        if (0 === this.languageType)
            ukey_label.Text = "    " + txt_UKeyRtn + ": ";
        else {
            ukey_label.Left = 22;
            ukey_label.Text = "　　" + txt_UKeyRtn + ": ";
        }
        ukey_label.Top = rowSep;
        this.txt_UKey = new MetaControl("textbox");
        this.txt_UKey.Top = rowSep;
        this.txt_UKey.Title = "";
        ukey_fourthrow.top = 5;
        this.txt_UKey.Width = 150;
        ukey_fourthrow.addChild(ukey_label).addChild(this.txt_UKey);
        this.viewContentPop.addChild(ukey_fourthrow);

        let price_fifthrow = new HBox();
        let txt_PriceRtn = this.langServ.get("Price");
        let price_label = new Label();
        if (0 === this.languageType)
            price_label.Text = "    " + txt_PriceRtn + ": ";
        else
            price_label.Text = "　　　" + txt_PriceRtn + ": ";
        price_label.Left = leftAlign;
        price_label.Top = rowSep;
        this.txt_Price = new MetaControl("textbox");
        this.txt_Price.Top = rowSep;
        this.txt_Price.Title = "";
        price_fifthrow.top = 5;
        this.txt_Price.Width = 150;
        price_fifthrow.addChild(price_label).addChild(this.txt_Price);
        this.viewContentPop.addChild(price_fifthrow);

        let volume_sixrow = new HBox();
        let txt_VolumeRtn = this.langServ.get("Volume");
        let volume_label = new Label();
        if (0 === this.languageType)
            volume_label.Text = "   " + txt_VolumeRtn + ": ";
        else
            volume_label.Text = "　　　" + txt_VolumeRtn + ": ";
        volume_label.Left = leftAlign;
        volume_label.Top = rowSep;
        let txt_Volume = new MetaControl("textbox");
        txt_Volume.Top = rowSep;
        txt_Volume.Title = "";
        txt_Volume.Width = 150;
        volume_sixrow.top = 5;
        volume_sixrow.addChild(volume_label).addChild(txt_Volume);
        this.viewContentPop.addChild(volume_sixrow);

        let btn_row = new HBox();
        let btn_clear = new Button();
        btn_clear.Left = leftAlign;
        btn_clear.Text = this.langServ.get("Close");
        btn_row.addChild(btn_clear);
        let btn_submit = new Button();
        btn_submit.Left = 50;
        btn_submit.Text = this.langServ.get("Submit");
        btn_clear.Class = btn_submit.Class = "primary";
        btn_row.top = 10;
        btn_row.left = 50;
        btn_row.addChild(btn_submit);
        this.viewContentPop.addChild(btn_row);
        // this.tradePage.setContent(this.viewContentPop);

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
        ["PortfolioID", "Secucategory", "TotalAmount", "AvlAmount", "FrzAmount", "Date", "Currency",
            "ShangHai", "ShenZhen", "BuyFrzAmt", "SellFrzAmt", "Buymargin", "SellMargin", "TotalMargin", "Fee",
            "PositionPL", "ClosePL"].forEach(item => {
                this.table.addColumn(this.langServ.get(item));
            });
        // this.table.addColumn("Index", "Orderid", "Date", "Account", "Innercode", "Status", "Time", "OrderPrice", "OrderVol", "DealPrice", "DealVol", "DealAmt", "B/S");
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

        let productNetPage = new TabPage("productNetViewer", "净值");
        let productNetContent = new VBox();
        this.productNet = new Section();
        // this.productNet.content = this.createProductNetChart();
        this.productNetChart = new ChartViewer();

        this.productNetChart.setOption(this.createProductNetChart());
        this.productNetChart.onInit = (chart: ECharts) => {
            setTimeout(() => {
                chart.setOption(this.createProductNetChart())
            }, 1000);
        };


        productNetContent.addChild(this.productNetChart);
        productNetPage.setContent(productNetContent);
        panel.addTab(productNetPage, false);
        let orderStatPage = new TabPage("orderStatViewer", "订单状态");
        let orderStatContent = new VBox();
        this.orderStatTable = new DataTable("table2");
        this.orderStatTable.height = 200;
        this.orderStatTable.RowIndex = false;
        this.orderStatTable.addColumn("选中", "订单ID", "UKEY", "证券代码", "证券名称", "策略", "组合ID", "委托价格", "委托量", "委托时间", "买／卖", "订单状态");

        // ["Check", "OrderId", "UKEY", "SymbolCode", "Symbol", "Strategy", "PortfolioID", "OrderPrice", "OrderVol", "OrderTime",
        //     "Ask/Bid", "OrderStatus"].forEach(item => {
        //         this.orderStatTable.addColumn2(new DataTableColumn(this.langServ.get(item), false, true));
        //     });

        orderStatContent.addChild(this.orderStatTable);
        orderStatPage.setContent(orderStatContent);
        panel.addTab(orderStatPage, false);
        let finishOrderPage = new TabPage("finishOrderViewer", "完结订单");
        let finishOrderContent = new VBox();
        this.finishOrderTable = new DataTable("table2");
        this.finishOrderTable.height = 200;
        this.finishOrderTable.RowIndex = false;
        this.finishOrderTable.addColumn( "订单ID", "UKEY", "证券代码", "证券名称", "策略", "组合ID", "委托价格", "委托量", "委托时间", "买／卖", "订单状态","成交价格", "成交量", "成交时间", "订单类型");
        finishOrderContent.addChild(this.finishOrderTable);
        finishOrderPage.setContent(finishOrderContent);
        panel.addTab(finishOrderPage, false);
        let fundAccountPage = new TabPage("fundAccountViewer", "资金账户");
        let fundAccountContent = new VBox();
        this.fundAccountTable = new DataTable("table2");
        this.fundAccountTable.height = 200;
        this.fundAccountTable.RowIndex = false;
        this.fundAccountTable.addColumn("Index", "币种", "出金", "入金", "资金余额", "交易可用金额", "交易可用金额", "可用融资余额", "融资金额", "融券金额", "总保证金", "买保证金", "卖保证金", "手续费", "持仓平仓盈亏");

        fundAccountContent.addChild(this.fundAccountTable);
        fundAccountPage.setContent(fundAccountContent);
        panel.addTab(fundAccountPage, false);
        let tradeAccountPage = new TabPage("tradeAccountViewer", "交易账户");
        let tradeAccountContent = new VBox();
        this.tradeAccountTable = new DataTable("table2");
        this.tradeAccountTable.height = 200;
        this.tradeAccountTable.RowIndex = false;
        this.tradeAccountTable.addColumn("资金账户名称", "市场ID", "对冲标志", "交易编码", "交易账户名称", "币种", "通道id", "创建者", "创建时间", "状态");

        tradeAccountContent.addChild(this.tradeAccountTable);
        tradeAccountPage.setContent(tradeAccountContent);
        panel.addTab(tradeAccountPage, false);
        viewContent.addChild(panel);

      



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
        let btn_query = new Button();//按钮
        btn_query.Left = 100;
        btn_query.Text = "Query";
        inputRow.addChild(btn_query);
        MarketCon.addChild(inputRow);

        this.MarketTable = new DataTable("table2");
        this.MarketTable.RowIndex = false;
        this.MarketTable.addColumn("挂买量", "价格","挂卖量" );
        this.MarketTable
        // this.MarketTable.height = 200;
        this.MarketTable.align = 'center'
        for (let i = 0; i <= 10; i++) {
            let row = this.MarketTable.newRow();
            row.cells[0].Text = '2' + i;
            row.cells[1].Text = i;
        }
        this.MarketTable.onRowDBClick = (rowItem, rowIndex) => {
            Dialog.popup(this, this.viewContentPop, { title: "下单", width: 500, height: 500 });
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
            Dialog.popup(this, this.viewContentPop, { title: "下单",  height: 300 });
            if (this.dd_tests.SelectedItem && this.dd_tests.SelectedItem.Value && this.dd_tests.SelectedItem.Value.id !== undefined) {
                // this.chart.init();
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
        //查询资金
        this.tradePoint.addSlot({
            service: ServiceType.kCOMS,
            msgtype: COMS_MSG.kMtFQueryFundAns,
            callback: (msg) => {

                if (msg != undefined) {
                    let ans = new QueryFundAns();
                    ans.fromBuffer(msg);
                    console.log(ans)
                    ans.avl_amt = 0;
                }


            }
        });
        //查询仓位
        this.tradePoint.addSlot({
            service: ServiceType.kCOMS,
            msgtype: COMS_MSG.kMtFQueryPositionAns,
            callback: (msg) => {
                if (msg != undefined) {
                    let ans = new QueryPositionAns();
                    ans.fromBuffer(msg);
                    console.log(ans)
                    ans.avl_cre_redemp_qty = 0;
                }


            }
        });

        //查询订单
        this.tradePoint.addSlot({
            service: ServiceType.kCOMS,
            msgtype: COMS_MSG.kMtBQueryOrderAns,
            callback: (msg, option) => {
                if (msg != undefined) {
                    let offset = 0;

                    while (offset < msg.length) {
                        let ans = new OrderStatus();
                        offset += ans.fromBuffer(msg, offset);

                        let row = this.orderStatTable.newRow();
                        row.cells[0].Text = ans.order_ref;
                        row.cells[1].Text = ans.ukey;
                        row.cells[2].Text = ans.directive;
                        row.cells[3].Text = ans.offset_flag;
                        row.cells[4].Text = ans.hedge_flag;
                        row.cells[5].Text = ans.execution;
                        row.cells[6].Text = ans.order_date;
                        row.cells[7].Text = ans.order_time;
                        row.cells[8].Text = ans.portfolio_id;
                        row.cells[9].Text = ans.fund_account_id;
                        row.cells[10].Text = ans.fund_account_id;
                        row.cells[11].Text = ans.trade_account_id;

                        let rowFinish = this.finishOrderTable.newRow();
                        rowFinish.cells[0].Text = ans.order_id;
                        rowFinish.cells[1].Text = ans.ukey;
                        rowFinish.cells[2].Text = "证券代码";
                        rowFinish.cells[3].Text = "证券名称";
                        rowFinish.cells[4].Text = ans.strategy_id;
                        rowFinish.cells[5].Text = ans.portfolio_id;
                        rowFinish.cells[6].Text = ans.price / 10000;
                        rowFinish.cells[7].Text = ans.qty;
                        rowFinish.cells[8].Text = ans.order_time;
                        rowFinish.cells[9].Text = ans.directive;
                        rowFinish.cells[10].Text = ans.status;
                        rowFinish.cells[11].Text = "成交价格";
                        rowFinish.cells[12].Text = ans.trade_qty;
                        rowFinish.cells[13].Text = ans.trade_date + "" + ans.trade_time;
                        rowFinish.cells[14].Text = ans.property;



                        console.log(ans);
                    }


                }


            }
        });
        //下单
        this.tradePoint.addSlot({
            service: ServiceType.kCOMS,
            msgtype: COMS_MSG.kMtFSendOrderAns,
            callback: (msg) => {
                if (msg != undefined) {
                    let ans = new OrderStatus();
                    ans.fromBuffer(msg);
                    
                }


            }
        });
        //撤单
        this.tradePoint.addSlot({
            service: ServiceType.kCOMS,
            msgtype: COMS_MSG.kMtFCancelOrderAns,
            callback: (msg) => {
                if (msg != undefined) {
                    let ans = new CancelOrderAns();
                    ans.fromBuffer(msg);
                    console.log(ans)
                }


            }
        });

        this.tradePoint.addSlotOfCMS("getAssetAccount", (res) => {
            //查询资产账户
            let data = JSON.parse(res.toString());
            if (data.msret.msgcode != "00") {
                alert("getAssetAccount:msgcode = " + data.msret.msgcode + "; msg = " + data.msret.msg);
                return;
            }
            console.log(data.body[0].acid);

            data.body.forEach((item, index) => {
                this.acidObj[item.acid] = item.acname;
            })
            console.log(this.acidObj)
            let fund = new QueryFundAndPosition();
            fund.portfolio_id = 0;
            fund.fund_account_id = parseInt(data.body[0].acid);

            let position = new QueryFundAndPosition();
            position.portfolio_id = 0;
            position.fund_account_id = parseInt(data.body[0].acid);

            let queryOrder = new OrderStatus();
            queryOrder.order_ref = 0;   //u8  客户端订单ID+term_id = 唯一
            queryOrder.ukey = 0;        //u8  Universal Key
            queryOrder.directive = 0;   //u4 委托指令：普通买入，普通卖出
            queryOrder.offset_flag = 0; //u4 开平方向：开仓、平仓、平昨、平今
            queryOrder.hedge_flag = 0;  //u4 投机套保标志：投机、套利、套保
            queryOrder.execution = 0;   //u4 执行类型： 限价0，市价
            queryOrder.order_date = 0;  //u4 委托时间yymmdd
            queryOrder.order_time = 0;  //u4 委托时间hhmmss
            queryOrder.portfolio_id = 0;     //u8 组合ID
            queryOrder.fund_account_id = data.body[0].acid;  //========u8 资金账户ID
            queryOrder.trade_account_id = 0; //u8 交易账户ID

            queryOrder.strategy_id = 0;     //u4 策略ID
            queryOrder.trader_id = 0;        //u4 交易员ID
            queryOrder.term_id = 0;          //u4 终端ID
            queryOrder.qty = 0;    //8 委托数量
            queryOrder.price = 0;  //8 委托价格
            queryOrder.property = 0;        //4 订单特殊属性，与实际业务相关(０:正常委托单，１+: 补单)
            queryOrder.currency = 0;        //4 报价货币币种
            queryOrder.algor_id = 0;		//8 策略算法ID
            queryOrder.reserve = 0;			//4 预留(组合offset_flag)
            queryOrder.order_id = 0;   //8 订单ID

            queryOrder.cancelled_qty = 0;    //8 已撤数量
            queryOrder.queued_qty = 0;       //8 已确认？
            queryOrder.trade_qty = 0;        //8 已成交数量
            queryOrder.trade_amt = 0;        //8 已成交金额*10000（缺省值）
            queryOrder.trade_time = 0;      //8 最后成交时间
            queryOrder.approver_id = 0;     //4 审批人ID
            queryOrder.status = 0;          //4 订单状态
            queryOrder.ret_code = 0;        //4
            queryOrder.broker_sn = "";    //32 券商单号
            queryOrder.message = "";      //128 附带消息，如错误消息等

            let sendOrder = new SendOrder();
            sendOrder.order_ref = 0;   //u8  客户端订单ID+term_id = 唯一
            sendOrder.ukey = 0;        //u8  Universal Key
            sendOrder.directive = 1;   //u4 委托指令：普通买入，普通卖出
            sendOrder.offset_flag = 0; //u4 开平方向：开仓、平仓、平昨、平今
            sendOrder.hedge_flag = 0;  //u4 投机套保标志：投机、套利、套保
            sendOrder.execution = 0;   //u4 执行类型： 限价0，市价
            sendOrder.order_date = 0;  //u4 委托时间yymmdd
            sendOrder.order_time = 0;  //u4 委托时间hhmmss
            sendOrder.portfolio_id = 0;     //u8 组合ID
            sendOrder.fund_account_id = data.body[0].acid;  //u8 资金账户ID
            sendOrder.trade_account_id = 0; //u8 交易账户ID

            sendOrder.strategy_id = 0;     //u4 策略ID
            sendOrder.trader_id = 0;        //u4 交易员ID
            sendOrder.term_id = 0;          //u4 终端ID
            sendOrder.qty = 0;    //8 委托数量
            sendOrder.price = 0;  //8 委托价格
            sendOrder.property = 0;        //4 订单特殊属性，与实际业务相关(０:正常委托单，１+: 补单)
            sendOrder.currency = 0;        //4 报价货币币种
            sendOrder.algor_id = 0;		//8 策略算法ID
            sendOrder.reserve = 0;			//4 预留(组合offset_flag)

            let cancelOrder = new CancelOrder();
            cancelOrder.order_ref = 0;
            cancelOrder.order_ref = 0;  //u8 撤单的客户端订单编号
            cancelOrder.order_id = 0;   //u8 撤单订单编号
            cancelOrder.trader_id = 0;  //u8 撤单交易员ID/交易账户id
            cancelOrder.term_id = 0;    //u4 终端ID
            cancelOrder.order_date = 0;  //u4 撤单时间yymmdd
            cancelOrder.order_time = 0; //u4 撤单时间hhmmss

            this.tradePoint.send(COMS_MSG.kMtFQueryFund, fund.toBuffer(), ServiceType.kCOMS);
            this.tradePoint.send(COMS_MSG.kMtFQueryPosition, position.toBuffer(), ServiceType.kCOMS);
            this.tradePoint.send(COMS_MSG.kMtFQueryOrder, queryOrder.toBuffer(), ServiceType.kCOMS);
            this.tradePoint.send(COMS_MSG.kMtFSendOrder, sendOrder.toBuffer(), ServiceType.kCOMS);
            this.tradePoint.send(COMS_MSG.kMtFCancelOrder, cancelOrder.toBuffer(), ServiceType.kCOMS);
        }, this);

        this.tradePoint.addSlotOfCMS("getTaacctFund", (res) => {
            //查询资产账户资金
            let data = JSON.parse(res.toString());
            if (data.msret.msgcode != "00") {
                alert("getTaacctFund:msgcode = " + data.msret.msgcode + "; msg = " + data.msret.msg);
                return;
            }
            data.body.forEach((item, index) => {
                let row = this.fundAccountTable.newRow();
                row.cells[0].Text = item.currencyid;
                row.cells[1].Text = item.out_fund;
                row.cells[2].Text = item.in_fund;
                row.cells[3].Text = item.totalamt;
                row.cells[4].Text = item.frozenamt;
                row.cells[5].Text = item.validloan;
                row.cells[6].Text = item.loan;
                row.cells[7].Text = item.stockloan;
                row.cells[8].Text = item.totalmargin;
                row.cells[9].Text = item.buymargin;
                row.cells[10].Text = item.sellmargin;
                row.cells[11].Text = item.fee;
                row.cells[12].Text = item.hold_closepl;

            })

            console.log(data);
        }, this)
        this.tradePoint.addSlotOfCMS("getTradeAccount", (res) => {
            //查询交易账户
            let data = JSON.parse(res.toString());
            if (data.msret.msgcode != "00") {
                alert("getTradeAccount:msgcode = " + data.msret.msgcode + "; msg = " + data.msret.msg);
                return;
            }
            data.body.forEach(item => {
                item.caname = this.acidObj[item.acid];
                let row = this.tradeAccountTable.newRow();
                row.cells[0].Text = item.caname;
                row.cells[1].Text = item.marketid;
                row.cells[2].Text = item.hedgeflag;
                row.cells[3].Text = item.trcode;
                row.cells[4].Text = item.tracname;
                row.cells[5].Text = item.currencyid;
                row.cells[6].Text = item.chid;
                row.cells[7].Text = item.creator;
                row.cells[8].Text = item.createtime;
                row.cells[9].Text = item.stat;
            })
            console.log(data);
        }, this)
        //产品净值

        // this.productNetChart.addC

        this.tradePoint.addSlotOfCMS("getProductNet", (msg) => {
            let data = JSON.parse(msg.toString());
            if (data.msret.msgcode != "00") {
                alert("getProductNet:msgcode = " + data.msret.msgcode + "; msg = " + data.msret.msg);
                return;
            }
            let productNetChangeOpt = {
                title: { text: "" },
                xAxis: [{ data: [] }],
                series: [{ data: [] }]
            }
            this.productNetData = data.body;
            if (this.productNetData.length > 0) {
                this.productNetData.forEach(item => {
                    productNetChangeOpt.xAxis[0].data.push(item.trday);
                    productNetChangeOpt.title.text = item.caname;
                    productNetChangeOpt.series[0].data.push(item.netvalue);
                })
                // this.productNetChart.setOption(productNetChangeOpt);
            }
        }, this)

    }

    registryListeners() {
        this.tradePoint.addSlot({
            service: ServiceType.kLogin,
            msgtype: FGS_MSG.kLoginAns,
            callback: (msg) => {
                console.info(msg.toString());
                this.tradePoint.sendToCMS("getProductNet", JSON.stringify({ data: { head: { userid: this.userId }, body: { caid: this.productId } } }));
                this.tradePoint.sendToCMS("getAssetAccount", JSON.stringify({
                    //查询资产账户
                    data: {
                        head: { userid: this.userId },
                        body: { caid: this.productId }
                    }
                }));

                this.tradePoint.sendToCMS("getTaacctFund", JSON.stringify({
                    //查询资产账户资金
                    data: {
                        head: { userid: this.userId },
                        body: { caid: this.productId }
                    }
                }));
                this.tradePoint.sendToCMS("getTradeAccount", JSON.stringify({
                    //查询交易账户
                    data: {
                        head: { userid: this.userId },
                        body: { caid: this.productId }
                    }
                }));


            }
        })
    }

    createProductNetChart() {
        return {
            option: {
                title: {
                    text: "",
                    x: "center",
                    align: "right",
                    textStyle: {
                        color: "#717171"
                    }
                },
                grid: {
                    bottom: 20
                },
                tooltip: {
                    trigger: "axis"
                },
                dataZoom: {
                    type: "inside"
                },
                xAxis: [
                    {
                        axisLabel: {
                            show: true,
                            textStyle: { color: "#717171" }
                        },
                        axisLine: {
                            lineStyle: { color: "#717171" }
                        },
                        data: [0, 1, 2, 3]
                    }
                ],
                yAxis: [
                    {
                        axisLabel: {
                            show: true,
                            textStyle: { color: "#717171" }
                        },
                        axisLine: {
                            lineStyle: { color: "#717171" }
                        },
                        splitLine: {
                            show: false
                        },
                        name: "净值",
                        type: "value",
                        nameLocation: "end"
                    }
                ],
                series: [
                    {
                        name: "净值",
                        type: "line",
                        data: [0, 1, 2, 3],
                        itemStyle: {
                            normal: {
                                color: "#2378f7"
                            }
                        },
                        areaStyle: {
                            normal: {
                                color: "#83bff6"
                            }
                        }
                    }
                ]
            }
        }
    }
}