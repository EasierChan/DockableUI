/**
 * created by cl, 2017/02/28
 * update: [date]
 * desc:
 */

import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { WorkerFactory } from "../../base/api/services/uworker.server";
import {
    Control, DockContainer, Splitter, TabPanel, TabPage, URange, Dialog, Label,
    DataTable, DataTableRow, DataTableColumn, DropDown, StatusBar, StatusBarItem,
    HBox, Button, CheckBox, TextBox, VBox, MetaControl, HFlexBox
} from "../../base/controls/control";
import {
    MessageBox, AppStateCheckerRef, File, Environment,
    SecuMasterService, TranslateService, AppStoreService
} from "../../base/api/services/backend.service";
import {
    EOrderType, AlphaSignalInfo, SECU_MARKET, EOrderStatus,
    EStrategyStatus, StrategyCfgType, ComConOrder, ComOrderCancel,
    ComOrder
} from "../../base/api/model/itrade/strategy.model";
import { DataKey } from "../../base/api/model/workbench.model";

@Component({
    moduleId: module.id,
    selector: "body",
    templateUrl: "app.component.html",
    providers: [
        SecuMasterService,
        TranslateService,
        AppStateCheckerRef,
        AppStoreService
    ]
})
export class AppComponent implements OnInit {
    private readonly apptype = "trade";
    private main: DockContainer;
    private pageMap: Object = new Object();
    private dialog: Dialog;
    private orderstatusPage: TabPage;
    private tradePage: TabPage;
    private commentPage: TabPage;
    private doneOrdersPage: TabPage;
    private bookviewPage: TabPage;
    private logPage: TabPage;
    private strategyPage: TabPage;
    private accountPage: TabPage;
    private positionPage: TabPage;
    private profitPage: TabPage;
    private statarbPage: TabPage;
    private portfolioPage: TabPage;
    private configPage: TabPage;
    private gatewayPage: TabPage;

    private orderstatusTable: DataTable;
    private doneOrdersTable: DataTable;
    private bookViewTable: DataTable;
    private logTable: DataTable;
    private strategyTable: DataTable;
    private accountTable: DataTable;
    private positionTable: DataTable;
    private profitTable: DataTable;
    private statarbTable: DataTable;
    private portfolioTable: DataTable;
    private commentTable: DataTable;
    private configTable: DataTable;
    private gatewayTable: DataTable;
    private basketTable: DataTable;

    // profittable textbox
    private totalpnLabel: MetaControl;
    private pospnlLabel: MetaControl;
    private trapnlt: MetaControl;
    private pospnlt: MetaControl;
    private totalpnlt: MetaControl;
    private buyamountLabel: MetaControl;
    private sellamountLabel: MetaControl;
    // private portfolioAccLabel: MetaControl;
    private reserveCheckBox: MetaControl;
    private portfolioLabel: MetaControl;
    private portfoliopnl: MetaControl;
    private portfolioDaypnl: MetaControl;
    private portfolioonpnl: MetaControl;
    private portfolioCount: MetaControl;
    private portfolioBuyCom: DropDown;
    private portfolioSellCom: DropDown;
    private portfolioBUyOffset: DropDown;
    private portfolioSellOffset: DropDown;
    // private allChk: MetaControl;
    private range: URange;
    private rateText: MetaControl;
    private dd_Account: DropDown;
    private dd_portfolioAccount: DropDown;
    private dd_Strategy: DropDown;
    private dd_symbol: DropDown;
    private checkall: MetaControl;

    private txt_UKey: any;
    private txt_Symbol: any;
    private txt_Price: any;
    private dd_Action: any;
    private tradeContent: any;
    private commentContent: any;
    private configContent: any;
    private gatewayContent: any;
    // strategy index flag
    private commentIdx: number = 10;
    private commandIdx: number = 10;
    private parameterIdx: number = 11;
    private strategyStatus: number = 0;
    private languageType: number = 1;　 // * 0,English 1,chinese
    private filename: String = "";
    private OrderStatusSelArr = [];
    private bookviewArr = [];
    private commentObj = {};
    private gatewayObj = {};
    private configArr = [];
    private configStrObj: Object = new Object;
    private configFlag: boolean = false;
    private configSel: boolean = true;

    private statusbar: StatusBar;
    private option: any;
    private layout: any;
    private tradeEndpoint: any;
    private quoteEndpoint: any;
    private strategyMap: any;
    private appStorage: any;
    private readonly kInitColumns = 7;

    static self: AppComponent;
    static bookViewSN = 1;
    static spreadViewSN = 1;
    static bgWorker = null;
    static loginFlag: boolean = false;

    constructor(private ref: ChangeDetectorRef, private statechecker: AppStateCheckerRef,
        private secuinfo: SecuMasterService, private langServ: TranslateService, private appSrv: AppStoreService) {
        AppComponent.self = this;
        this.statechecker.onInit(this, this.onReady);
        this.statechecker.onResize(this, this.onResize);
        this.statechecker.onDestory(this, this.onDestroy);
        this.statechecker.onMenuItemClick = this.onMenuItemClick;
        AppComponent.bgWorker = WorkerFactory.createWorker(`${__dirname}/bll/tradeWorker`, Environment.getDataPath(this.option.name, "StrategyTrader"));
        TabPanel.afterAnyPageClosed = this.onTabPageClosed;
    }

    onTabPageClosed(pageid: string) {
        let kwlist = [];
        let i = 0;
        while (i < AppComponent.self.bookviewArr.length) {
            if (AppComponent.self.bookviewArr[i].id === pageid) {
                AppComponent.self.bookviewArr.splice(i, 1);
            } else {
                if (AppComponent.self.bookviewArr[i].code !== null)
                    kwlist.push(AppComponent.self.bookviewArr[i].code);
                ++i;
            }
        }

        AppComponent.self.subscribeMarketData(kwlist);
        AppComponent.self.statechecker.changeMenuItemState(pageid, false, 2);
    }

    onMenuItemClick(item) {
        let label = item.label as string;
        if (label.endsWith("New BookView")) {
            let newBVID = "BookView" + AppComponent.bookViewSN++;
            while (AppComponent.self.pageMap.hasOwnProperty(newBVID)) {
                newBVID = "BookView" + AppComponent.bookViewSN++;
            }

            AppComponent.self.createBookView(newBVID);
            let panel = AppComponent.self.main.getFirstChildPanel();
            if (panel === null) {
                console.error("not found a panel to locate a tabpage.");
                return;
            }

            if (AppComponent.self.pageMap.hasOwnProperty(newBVID)) {
                panel.addTab(AppComponent.self.pageMap[newBVID]);
                panel.setActive(newBVID);
            }

            return;
        }

        if (label.endsWith("New SpreadView")) {
            let newSVID = "SpreadView" + AppComponent.spreadViewSN++;
            return;
        }

        if (!item.checked) {
            AppComponent.self.main.removeTabpage(item.label);
        } else {
            let panel = AppComponent.self.main.getFirstChildPanel();
            if (panel === null) {
                console.error("not found a panel to locate a tabpage.");
                return;
            }

            if (AppComponent.self.pageMap.hasOwnProperty(item.label)) {
                panel.addTab(AppComponent.self.pageMap[item.label]);
                panel.setActive(item.label);
            }
        }
    }

    onReady(option: any) {
        this.option = option;
    }

    ngOnInit(): void {
        document.title = this.option.title;

        let setting = this.appSrv.getSetting();
        switch (setting.language) {
            case "zh-cn":
                this.languageType = 1;
                break;
            case "en-us":
            default:
                this.languageType = 0;
                break;
        }

        this.appStorage = JSON.parse(AppStoreService.getLocalStorageItem(this.option.name));
        this.strategyMap = {};
        this.tradeEndpoint = setting.endpoints[0].trade_addr.split(":");
        this.quoteEndpoint = setting.endpoints[0].quote_addr.split(":");

        this.statusbar = new StatusBar();
        let order = "OrderStatus";
        this.orderstatusPage = new TabPage(order, this.langServ.get(order));
        this.pageMap["OrderStatus"] = this.orderstatusPage;
        let orderstatusContent = new VBox();

        let orderstatusHeader = new HBox();
        let cb_handle = new Label();
        cb_handle.Text = this.langServ.get("Status") + "：";
        // cb_handle.Title = this.langServ.get("Handle");
        orderstatusHeader.addChild(cb_handle);
        let dd_status = new DropDown();
        dd_status.Left = 10;
        dd_status.addItem({ Text: "-全部-", Value: "-1" });
        dd_status.addItem({ Text: "0.无效", Value: "0" });
        dd_status.addItem({ Text: "1.未报", Value: "1" });
        dd_status.addItem({ Text: "2.待报", Value: "2" });
        dd_status.addItem({ Text: "3.已报", Value: "3" });
        dd_status.addItem({ Text: "4.已报待撤", Value: "4" });
        dd_status.addItem({ Text: "5.部成待撤", Value: "5" });
        dd_status.addItem({ Text: "8.部成", Value: "8" });
        dd_status.addItem({ Text: "10.废单", Value: "10" });
        orderstatusHeader.addChild(dd_status);

        let cb_SelAll = new CheckBox();
        cb_SelAll.Left = 10;
        cb_SelAll.Text = false;
        cb_SelAll.Title = this.langServ.get("All");
        orderstatusHeader.addChild(cb_SelAll);
        cb_SelAll.OnClick = () => {
            let row: DataTableRow;

            for (let i = 0; i < this.orderstatusTable.rows.length; ++i) {
                row = this.orderstatusTable.rows[i];

                if (!row.cells[0].Disable && !row.hidden)
                    this.orderstatusTable.rows[i].cells[0].Text = !cb_SelAll.Text;
            }

            row = null;
        };

        let btn_cancel = new Button();
        btn_cancel.Left = 10;
        btn_cancel.Text = this.langServ.get("CancelSelected");
        orderstatusHeader.addChild(btn_cancel);
        orderstatusContent.addChild(orderstatusHeader);
        cb_SelAll.Disable = dd_status.Disable = btn_cancel.Disable = false;

        dd_status.SelectChange = (item) => {
            for (let i = 0; i < this.orderstatusTable.rows.length; ++i) {
                if (dd_status.SelectedItem.Value === "-1") {   // all
                    this.orderstatusTable.rows[i].hidden = false;
                } else {
                    this.orderstatusTable.rows[i].hidden = this.orderstatusTable.cell(i, this.langServ.get("OrderStatus")).Text !== dd_status.SelectedItem.Text;
                }
            }
        };

        btn_cancel.OnClick = () => {
            for (let i = 0; i < this.orderstatusTable.rows.length; ++i) {
                let getStatus = this.orderstatusTable.cell(i, this.langServ.get("OrderStatus")).Data;
                let strategyid = this.orderstatusTable.cell(i, this.langServ.get("Strategy")).Text;
                let ukey = this.orderstatusTable.cell(i, this.langServ.get("UKEY")).Text;
                let orderid = this.orderstatusTable.cell(i, this.langServ.get("OrderId")).Text;
                let account = this.orderstatusTable.cell(i, this.langServ.get("PortfolioID")).Text;
                let date = new Date();
                if (getStatus === 6 || getStatus === 7 || getStatus === 9 || getStatus === 10)
                    continue;

                if (!this.orderstatusTable.rows[i].cells[0].Text)
                    continue;

                let order = new ComConOrder();
                order.ordertype = EOrderType.ORDER_TYPE_CANCEL;
                order.con.account = parseInt(account);
                order.datetime.tv_sec = date.getSeconds();
                order.datetime.tv_usec = date.getMilliseconds();
                order.data = new ComOrderCancel();
                order.data.strategyid = parseInt(strategyid);
                order.data.orderid = parseInt(orderid);
                order.data.innercode = parseInt(ukey);
                order.data.action = 1;
                AppComponent.bgWorker.send({ command: "ss-send", params: { type: "order", data: order } });
                order = null;
            }
        };

        this.orderstatusTable = new DataTable("table3");
        ["Check", "OrderId", "UKEY", "SymbolCode", "Symbol", "Strategy", "PortfolioID", "OrderPrice", "OrderVol", "OrderTime",
            "Ask/Bid", "OrderStatus"].forEach(item => {
                this.orderstatusTable.addColumn2(new DataTableColumn(this.langServ.get(item), false, true));
            });
        this.orderstatusTable.columnConfigurable = true;
        orderstatusContent.addChild(this.orderstatusTable);
        this.orderstatusPage.setContent(orderstatusContent);

        this.doneOrdersPage = new TabPage("DoneOrders", this.langServ.get("DoneOrders"));
        this.pageMap["DoneOrders"] = this.doneOrdersPage;
        let doneOrdersContent = new VBox();
        let doneOrdersHeader = new HBox();
        doneOrdersHeader.addChild(cb_handle);
        let dd_done_status = new DropDown();
        dd_done_status.Left = 10;
        dd_done_status.addItem({ Text: "-全部-", Value: "-1" });
        dd_done_status.addItem({ Text: "6.部撤", Value: "6" });
        dd_done_status.addItem({ Text: "7.已撤", Value: "7" });
        dd_done_status.addItem({ Text: "9.已成", Value: "9" });
        dd_done_status.SelectChange = (item) => {
            for (let i = 0; i < this.doneOrdersTable.rows.length; ++i) {
                dd_done_status.SelectedItem.Value === "-1"
                    ? this.doneOrdersTable.rows[i].hidden = false
                    : this.doneOrdersTable.rows[i].hidden = this.doneOrdersTable.rows[i].cells[10].Text !== dd_done_status.SelectedItem.Text;
            }
        };
        doneOrdersHeader.addChild(dd_done_status);
        doneOrdersContent.addChild(doneOrdersHeader);
        this.doneOrdersTable = new DataTable("table3");
        ["OrderId", "UKEY", "SymbolCode", "Symbol", "Strategy", "PortfolioID", "OrderPrice", "OrderVol", "OrderTime",
            "Ask/Bid", "OrderStatus", "DonePrice", "DoneVol", "DoneTime", "OrderType"].forEach(item => {
                this.doneOrdersTable.addColumn2(new DataTableColumn(this.langServ.get(item), false, true));
            });
        this.doneOrdersTable.columnConfigurable = true;
        doneOrdersContent.addChild(this.doneOrdersTable);
        this.doneOrdersPage.setContent(doneOrdersContent);

        this.accountPage = new TabPage("Account", this.langServ.get("PortfolioList"));
        this.pageMap["Account"] = this.accountPage;
        let accountContent = new VBox();
        this.accountTable = new DataTable("table");
        this.accountTable.RowIndex = false;
        ["PortfolioID", "Secucategory", "TotalAmount", "AvlAmount", "FrzAmount", "Date", "Currency",
            "ShangHai", "ShenZhen", "BuyFrzAmt", "SellFrzAmt", "Buymargin", "SellMargin", "TotalMargin", "Fee",
            "PositionPL", "ClosePL"].forEach(item => {
                this.accountTable.addColumn(this.langServ.get(item));
            });
        this.accountTable.columnConfigurable = true;
        accountContent.addChild(this.accountTable);
        this.accountPage.setContent(accountContent);

        this.positionPage = new TabPage("Position", this.langServ.get("Position"));
        this.pageMap["Position"] = this.positionPage;
        let positionContent = new VBox();
        this.positionTable = new DataTable("table2");
        ["PortfolioID", "secucategory", "UKEY", "Code", "TotalQty", "AvlQty", "AvlCreRedempVol", "WorkingQty",
            "TotalCost", "TodayOpen", "AvgPrice", "StrategyID", "Type"].forEach(item => {
                this.positionTable.addColumn2(new DataTableColumn(this.langServ.get(item), false, true));
            });
        this.positionTable.columnConfigurable = true;
        positionContent.addChild(this.positionTable);
        this.positionPage.setContent(positionContent);
        this.positionTable.onRowDBClick = (rowItem, rowIndex) => {
            let account = rowItem.cells[0].Text;
            let ukey = rowItem.cells[2].Text;
            let strategyid = rowItem.cells[11].Text;
            let symbol = rowItem.cells[3].Text;
            this.dd_Action.SelectedItem = this.dd_Action.Items[1];
            this.txt_UKey.Text = ukey + "";
            this.txt_Symbol.Text = symbol + "";
            for (let i = 0; i < this.dd_Account.Items.length; ++i) {
                if (parseInt(account) === parseInt(this.dd_Account.Items[i].Text)) {
                    this.dd_Account.SelectedItem = this.dd_Account.Items[i];
                    break;
                }
            }
            for (let j = 0; j < this.dd_Strategy.Items.length; ++j) {
                if (parseInt(strategyid) === parseInt(this.dd_Strategy.Items[j].Text)) {
                    this.dd_Strategy.SelectedItem = this.dd_Strategy.Items[j];
                    break;
                }
            }
            let tradeRtn = this.langServ.get("Trade");
            Dialog.popup(this, this.tradeContent, { title: tradeRtn, height: 300 });
        };

        let rightPad = 50;
        let rowPad = 5;
        this.tradePage = new TabPage("ManulTrader", this.langServ.get("ManulTrader"));
        this.tradeContent = new VBox();
        this.tradeContent.MinHeight = 500;
        this.tradeContent.MinWidth = 500;

        let account_firrow = new HFlexBox();
        this.dd_Account = new DropDown();
        this.dd_Account.Title = `${this.langServ.get("PortfolioID")}:`;
        this.dd_Account.Width = 150;
        account_firrow.top = 10;
        account_firrow.align = "right";
        account_firrow.right = rightPad;
        account_firrow.addChild(this.dd_Account);
        this.tradeContent.addChild(account_firrow);

        let strategy_secrow = new HFlexBox();
        this.dd_Strategy = new DropDown();
        this.dd_Strategy.Title = `${this.langServ.get("Strategy")}:`;
        this.dd_Strategy.Width = 150;
        strategy_secrow.top = rowPad;
        strategy_secrow.align = "right";
        strategy_secrow.right = rightPad;
        strategy_secrow.addChild(this.dd_Strategy);
        this.tradeContent.addChild(strategy_secrow);

        let action_sevenrow = new HFlexBox();
        this.dd_Action = new DropDown();
        this.dd_Action.Title = `${this.langServ.get("Action")}:`;
        this.dd_Action.Width = 150;
        let buyRtn = this.langServ.get("Buy");
        let sellRtn = this.langServ.get("Sell");
        this.dd_Action.addItem({ Text: buyRtn, Value: 0 });
        this.dd_Action.addItem({ Text: sellRtn, Value: 1 });
        action_sevenrow.top = rowPad;
        action_sevenrow.align = "right";
        action_sevenrow.right = rightPad;
        action_sevenrow.addChild(this.dd_Action);
        this.tradeContent.addChild(action_sevenrow);

        let symbol_thirdrow = new HFlexBox();
        this.txt_Symbol = new TextBox();
        this.txt_Symbol.Title = `${this.langServ.get("Symbol")}: `;
        this.txt_Symbol.Width = 150;
        symbol_thirdrow.top = rowPad;
        symbol_thirdrow.align = "right";
        symbol_thirdrow.right = rightPad;
        symbol_thirdrow.addChild(this.txt_Symbol);
        this.tradeContent.addChild(symbol_thirdrow);

        let ukey_fourthrow = new HFlexBox();
        this.txt_UKey = new TextBox();
        this.txt_UKey.Title = `${this.langServ.get("UKey")}: `;
        ukey_fourthrow.top = rowPad;
        this.txt_UKey.Width = 150;
        ukey_fourthrow.align = "right";
        ukey_fourthrow.right = rightPad;
        ukey_fourthrow.addChild(this.txt_UKey);
        this.tradeContent.addChild(ukey_fourthrow);

        let price_fifthrow = new HFlexBox();
        this.txt_Price = new TextBox();
        this.txt_Price.Title = `${this.langServ.get("Price")}: `;
        price_fifthrow.top = rowPad;
        this.txt_Price.Width = 150;
        price_fifthrow.align = "right";
        price_fifthrow.right = rightPad;
        price_fifthrow.addChild(this.txt_Price);
        this.tradeContent.addChild(price_fifthrow);

        let volume_sixrow = new HFlexBox();
        let txt_Volume = new TextBox();
        txt_Volume.Title = `${this.langServ.get("Volume")}: `;
        txt_Volume.Width = 150;
        volume_sixrow.top = rowPad;
        volume_sixrow.align = "right";
        volume_sixrow.right = rightPad;
        volume_sixrow.addChild(txt_Volume);
        this.tradeContent.addChild(volume_sixrow);

        let btn_row = new HFlexBox();
        let btn_clear = new Button();
        btn_row.right = rightPad;
        btn_clear.Text = this.langServ.get("Close");
        btn_row.addChild(btn_clear);
        let btn_submit = new Button();
        btn_submit.Left = 50;
        btn_submit.Text = this.langServ.get("Submit");
        btn_clear.Class = btn_submit.Class = "primary";
        btn_row.top = 10;
        btn_row.left = 50;
        btn_row.addChild(btn_submit);
        this.tradeContent.addChild(btn_row);
        this.tradePage.setContent(this.tradeContent);

        btn_clear.OnClick = () => {
            this.dialog.hide();
        };

        btn_submit.OnClick = () => {
            let account = this.dd_Account.SelectedItem.Text;
            let strategyid = this.dd_Strategy.SelectedItem.Text;
            let symbol = this.txt_Symbol.Text;
            let ukey = parseInt(this.txt_UKey.Text);
            let price = parseFloat(this.txt_Price.Text);
            let volume = parseInt(txt_Volume.Text);
            let actionValue = this.dd_Action.SelectedItem.Value;

            if (isNaN(ukey) || isNaN(price) || price > Math.pow(2, 18) || isNaN(volume)) {
                alert("输入不合法");
                return;
            }

            let date = new Date();
            let order = new ComConOrder();
            order.ordertype = EOrderType.ORDER_TYPE_ORDER;
            order.con.account = parseInt(account);
            order.datetime.tv_sec = Math.round(date.getMilliseconds() / 1000);
            order.datetime.tv_usec = 0;
            order.data = new ComOrder();
            order.data.strategyid = parseInt(strategyid);
            order.data.innercode = ukey;
            order.data.price = Math.round(price * 10000);
            order.data.quantity = volume;
            order.data.action = (actionValue === 1) ? 1 : 0;

            // submit order
            AppComponent.bgWorker.send({
                command: "ss-send", params: { type: "order", data: order }
            });
            this.dialog.hide();
        };

        this.commentPage = new TabPage("Comment", this.langServ.get("Comment"));
        this.commentContent = new VBox();
        this.commentTable = new DataTable("table2");
        this.commentTable.height = 400;

        this.commentTable.addColumn(this.langServ.get("name"), this.langServ.get("value"));
        this.commentTable.columnConfigurable = true;
        this.commentContent.addChild(this.commentTable);
        this.commentPage.setContent(this.commentContent);

        this.configPage = new TabPage("ParameterConfig", this.langServ.get("ParameterConfig"));
        this.configContent = new VBox();
        let configHeader = new HBox();
        let checkall = new CheckBox();
        checkall.Title = this.langServ.get("Check");
        let btn_apply = new Button();
        btn_apply.Left = 200;
        btn_apply.Text = "应用";
        btn_apply.Class = "primary";
        btn_apply.OnClick = () => {
            this.applyStrateTableConfig();
        };
        configHeader.addChild(checkall).addChild(btn_apply);
        this.configTable = new DataTable("table2");
        this.configTable.height = 390;
        this.configTable.addColumn(this.langServ.get("parameter"));
        this.configTable.columnConfigurable = true;
        this.configContent.addChild(configHeader).addChild(this.configTable);
        this.configPage.setContent(this.configContent);
        checkall.OnClick = () => { this.configTable.rows.forEach(item => { item.cells[0].Text = !checkall.Text; }); };

        this.gatewayPage = new TabPage("GateWay", this.langServ.get("Gateway"));
        this.gatewayContent = new VBox();
        this.gatewayTable = new DataTable("table2");
        this.gatewayTable.height = 300;
        this.gatewayTable.addColumn(this.langServ.get("name"));
        this.gatewayTable.addColumn(this.langServ.get("status"));
        this.gatewayTable.columnConfigurable = true;
        this.gatewayContent.addChild(this.gatewayTable);
        this.gatewayPage.setContent(this.gatewayContent);

        this.bookviewPage = new TabPage("BookView", this.langServ.get("BookView"));
        this.createBookView("BookView");

        this.logPage = new TabPage("Log", this.langServ.get("LOG"));
        this.pageMap["Log"] = this.logPage;
        let logContent = new VBox();
        this.logTable = new DataTable("table2");

        let logTimeTittleRtn = this.langServ.get("Time");
        let logContentTittleRtn = this.langServ.get("Content");
        this.logTable.addColumn(logTimeTittleRtn);
        this.logTable.addColumn(logContentTittleRtn);
        logContent.addChild(this.logTable);
        this.logPage.setContent(logContent);

        this.statarbPage = new TabPage("StatArb", this.langServ.get("StatArb"));
        this.pageMap["StatArb"] = this.statarbPage;
        let statarbLeftAlign = 20;
        let statarbHeader = new HBox();
        this.buyamountLabel = new MetaControl("textbox");
        this.buyamountLabel.Left = statarbLeftAlign;
        this.buyamountLabel.Width = 90;
        this.buyamountLabel.Text = "0";

        this.buyamountLabel.Title = this.langServ.get("BUY.AMOUNT") + ":";
        this.buyamountLabel.Disable = true;
        this.sellamountLabel = new MetaControl("textbox");
        this.sellamountLabel.Left = statarbLeftAlign;
        this.sellamountLabel.Width = 90;
        this.sellamountLabel.Title = this.langServ.get("SELL.AMOUNT") + ":";
        this.sellamountLabel.Disable = true;
        this.sellamountLabel.Text = "0";
        statarbHeader.addChild(this.buyamountLabel).addChild(this.sellamountLabel);
        this.statarbTable = new DataTable("table2");
        ["Symbol", "InnerCode", "Change(%)", "Position",
            "Trade", "Amount", "StrategyID", "DiffQty", "SymbolCode"].forEach(item => {
                this.statarbTable.addColumn2(new DataTableColumn(this.langServ.get(item), false, true));
            });

        this.statarbTable.columnConfigurable = true;
        let statarbContent = new VBox();
        statarbContent.addChild(statarbHeader);
        statarbContent.addChild(this.statarbTable);
        this.statarbPage.setContent(statarbContent);

        this.portfolioPage = new TabPage("Portfolio", this.langServ.get("Portfolio"));
        this.pageMap["Portfolio"] = this.portfolioPage;
        let loadItem = new HBox();

        this.dd_portfolioAccount = new DropDown();
        this.dd_portfolioAccount.Width = 110;
        this.dd_portfolioAccount.Left = statarbLeftAlign;
        this.dd_portfolioAccount.Title = this.langServ.get("PortfolioID") + ":";


        this.portfolioLabel = new MetaControl("textbox");
        this.portfolioLabel.Width = 60;
        let portfoliovalueRtn = this.langServ.get("PORTFOLIOValue");
        if (portfoliovalueRtn === "PORTFOLIOValue")
            this.portfolioLabel.Title = "PORTFOLIO Value:";
        else
            this.portfolioLabel.Title = portfoliovalueRtn + ":";
        this.portfolioLabel.Left = 20;
        this.portfolioLabel.Disable = true;

        this.portfolioDaypnl = new MetaControl("textbox");
        this.portfolioDaypnl.Width = 60;
        let portfolioDaypnlRtn = this.langServ.get("PORTFOLIODaypnl");
        if (portfolioDaypnlRtn === "PORTFOLIODaypnl")
            this.portfolioDaypnl.Title = "PORTFOLIO Day pnl:";
        else
            this.portfolioDaypnl.Title = portfolioDaypnlRtn + ":";
        this.portfolioDaypnl.Left = 20;
        this.portfolioDaypnl.Disable = true;

        this.portfolioonpnl = new MetaControl("textbox");
        this.portfolioonpnl.Width = 60;
        let portfolioonpnlRtn = this.langServ.get("PORTFOLIOO/NPnl");
        if (portfolioonpnlRtn === "PORTFOLIOO/NPnl")
            this.portfolioonpnl.Title = "PORTFOLIO O/N Pnl:";
        else
            this.portfolioonpnl.Title = portfolioonpnlRtn + ":";
        this.portfolioonpnl.Left = 20;
        this.portfolioonpnl.Disable = true;

        this.portfolioCount = new MetaControl("textbox");
        this.portfolioCount.Width = 50;
        let portfolioCountRtn = this.langServ.get("Count");
        this.portfolioCount.Title = portfolioCountRtn + ":";
        this.portfolioCount.Left = 20;
        this.portfolioCount.Disable = true;
        this.portfolioCount.Text = 0;

        let btn_load = new Button();
        let btn_loadRtn = this.langServ.get("LoadCSV");
        if (btn_loadRtn === "LoadCSV")
            btn_load.Text = " Load    CSV ";
        else
            btn_load.Text = btn_loadRtn + "     ";
        btn_load.Left = 20;
        btn_load.Class = "primary";

        loadItem.addChild(this.dd_portfolioAccount).addChild(this.portfolioLabel)
            .addChild(this.portfolioDaypnl).addChild(this.portfolioonpnl).addChild(this.portfolioCount).addChild(btn_load);

        let tradeitem = new HBox();
        this.portfolioBuyCom = new DropDown();
        this.portfolioBuyCom.Width = 59;
        this.portfolioBuyCom.Left = 30;

        this.portfolioBuyCom.Title = this.langServ.get("Buy") + ":";
        this.portfolioBuyCom.addItem({ Text: "B5", Value: "0" });
        this.portfolioBuyCom.addItem({ Text: "B4", Value: "1" });
        this.portfolioBuyCom.addItem({ Text: "B3", Value: "2" });
        this.portfolioBuyCom.addItem({ Text: "B2", Value: "3" });
        this.portfolioBuyCom.addItem({ Text: "B1", Value: "4" });
        this.portfolioBuyCom.addItem({ Text: "A1", Value: "5" });
        this.portfolioBuyCom.addItem({ Text: "A2", Value: "6" });
        this.portfolioBuyCom.addItem({ Text: "A3", Value: "7" });
        this.portfolioBuyCom.addItem({ Text: "A4", Value: "8" });
        this.portfolioBuyCom.addItem({ Text: "A5", Value: "9" });
        this.portfolioBuyCom.SelectedItem = this.portfolioBuyCom.Items[4];

        this.portfolioBUyOffset = new DropDown();
        this.portfolioBUyOffset.Width = 59;
        this.portfolioBUyOffset.Left = 8;
        this.portfolioBUyOffset.Title = "";

        this.portfolioBUyOffset.addItem({ Text: "10", Value: "10" });
        this.portfolioBUyOffset.addItem({ Text: "9", Value: "9" });
        this.portfolioBUyOffset.addItem({ Text: "8", Value: "8" });
        this.portfolioBUyOffset.addItem({ Text: "7", Value: "7" });
        this.portfolioBUyOffset.addItem({ Text: "6", Value: "6" });
        this.portfolioBUyOffset.addItem({ Text: "5", Value: "5" });
        this.portfolioBUyOffset.addItem({ Text: "4", Value: "4" });
        this.portfolioBUyOffset.addItem({ Text: "3", Value: "3" });
        this.portfolioBUyOffset.addItem({ Text: "2", Value: "2" });
        this.portfolioBUyOffset.addItem({ Text: "1", Value: "1" });
        this.portfolioBUyOffset.addItem({ Text: "0", Value: "0" });
        this.portfolioBUyOffset.addItem({ Text: "-1", Value: "-1" });
        this.portfolioBUyOffset.addItem({ Text: "-2", Value: "-2" });
        this.portfolioBUyOffset.addItem({ Text: "-3", Value: "-3" });
        this.portfolioBUyOffset.addItem({ Text: "-4", Value: "-4" });
        this.portfolioBUyOffset.addItem({ Text: "-5", Value: "-5" });
        this.portfolioBUyOffset.addItem({ Text: "-6", Value: "-6" });
        this.portfolioBUyOffset.addItem({ Text: "-7", Value: "-7" });
        this.portfolioBUyOffset.addItem({ Text: "-8", Value: "-8" });
        this.portfolioBUyOffset.addItem({ Text: "-9", Value: "-9" });
        this.portfolioBUyOffset.addItem({ Text: "-10", Value: "-10" });
        this.portfolioBUyOffset.SelectedItem = this.portfolioBUyOffset.Items[10];

        this.portfolioSellCom = new DropDown();
        this.portfolioSellCom.Width = 62;
        this.portfolioSellCom.Left = 20;
        this.portfolioSellCom.Title = this.langServ.get("Sell") + ":";
        this.portfolioSellCom.addItem({ Text: "B5", Value: "0" });
        this.portfolioSellCom.addItem({ Text: "B4", Value: "1" });
        this.portfolioSellCom.addItem({ Text: "B3", Value: "2" });
        this.portfolioSellCom.addItem({ Text: "B2", Value: "3" });
        this.portfolioSellCom.addItem({ Text: "B1", Value: "4" });
        this.portfolioSellCom.addItem({ Text: "A1", Value: "5" });
        this.portfolioSellCom.addItem({ Text: "A2", Value: "6" });
        this.portfolioSellCom.addItem({ Text: "A3", Value: "7" });
        this.portfolioSellCom.addItem({ Text: "A4", Value: "8" });
        this.portfolioSellCom.addItem({ Text: "A5", Value: "9" });
        this.portfolioSellCom.SelectedItem = this.portfolioSellCom.Items[5];
        this.portfolioSellOffset = new DropDown();
        this.portfolioSellOffset.Width = 62;
        this.portfolioSellOffset.Left = 8;
        this.portfolioSellOffset.Title = "";
        this.portfolioSellOffset.addItem({ Text: "10", Value: "10" });
        this.portfolioSellOffset.addItem({ Text: "9", Value: "9" });
        this.portfolioSellOffset.addItem({ Text: "8", Value: "8" });
        this.portfolioSellOffset.addItem({ Text: "7", Value: "7" });
        this.portfolioSellOffset.addItem({ Text: "6", Value: "6" });
        this.portfolioSellOffset.addItem({ Text: "5", Value: "5" });
        this.portfolioSellOffset.addItem({ Text: "4", Value: "4" });
        this.portfolioSellOffset.addItem({ Text: "3", Value: "3" });
        this.portfolioSellOffset.addItem({ Text: "2", Value: "2" });
        this.portfolioSellOffset.addItem({ Text: "1", Value: "1" });
        this.portfolioSellOffset.addItem({ Text: "0", Value: "0" });
        this.portfolioSellOffset.addItem({ Text: "-1", Value: "-1" });
        this.portfolioSellOffset.addItem({ Text: "-2", Value: "-2" });
        this.portfolioSellOffset.addItem({ Text: "-3", Value: "-3" });
        this.portfolioSellOffset.addItem({ Text: "-4", Value: "-4" });
        this.portfolioSellOffset.addItem({ Text: "-5", Value: "-5" });
        this.portfolioSellOffset.addItem({ Text: "-6", Value: "-6" });
        this.portfolioSellOffset.addItem({ Text: "-7", Value: "-7" });
        this.portfolioSellOffset.addItem({ Text: "-8", Value: "-8" });
        this.portfolioSellOffset.addItem({ Text: "-9", Value: "-9" });
        this.portfolioSellOffset.addItem({ Text: "-10", Value: "-10" });
        this.portfolioSellOffset.SelectedItem = this.portfolioSellOffset.Items[10];

        let allbuyChk = new CheckBox(); allbuyChk.Width = 30;
        allbuyChk.Title = " " + this.langServ.get("All-Buy");
        allbuyChk.Text = false; allbuyChk.Left = 20;
        let allsellChk = new CheckBox(); allsellChk.Width = 30;
        allsellChk.Title = " " + this.langServ.get("All-Sell");
        allsellChk.Text = false; allsellChk.Left = 20;

        this.range = new URange(); this.range.Width = 168; this.range.Left = 20;
        let orderRateRtn = this.langServ.get("orderrate");
        if (orderRateRtn === "orderrate")
            this.range.Title = "Order Rate:";
        else
            this.range.Title = orderRateRtn + ":";
        this.rateText = new MetaControl("textbox"); this.rateText.Width = 35; this.rateText.Title = ""; this.rateText.Left = 5;
        let percentText = new MetaControl("plaintext"); percentText.Title = "%"; percentText.Width = 15;

        this.range.Text = 0; this.rateText.Text = 0;

        let btn_sendSel = new Button();
        let sendSelRtn = this.langServ.get("sendselected");

        if (sendSelRtn === "sendselected")
            btn_sendSel.Text = "Send Selected";
        else
            btn_sendSel.Text = sendSelRtn;

        btn_sendSel.Left = 20;
        btn_sendSel.Class = "primary";
        let btn_cancelSel = new Button();
        let cancelSelRtn = this.langServ.get("cancelselected");
        if (cancelSelRtn === "cancelselected")
            btn_cancelSel.Text = "Cancel Selected";
        else
            btn_cancelSel.Text = cancelSelRtn;
        btn_cancelSel.Left = 20; btn_cancelSel.Class = "primary";

        tradeitem.addChild(this.portfolioBuyCom).addChild(this.portfolioBUyOffset).addChild(this.portfolioSellCom).addChild(this.portfolioSellOffset).addChild(allbuyChk)
            .addChild(allsellChk).addChild(this.range).addChild(this.rateText).addChild(percentText).addChild(btn_sendSel).addChild(btn_cancelSel);

        this.portfolioTable = new DataTable("table2");
        ["SymbolCode", "Symbol", "PreQty", "TargetQty", "CurrQty", "TotalOrderQty", "FilledQty", "FillPace",
            "WorkingQty", "SingleOrderQty", "Send", "Cancel", "Status", "PrePrice", "LastPrice", "BidSize", "BidPrice", "AskSize",
            "AskPrice", "AvgBuyPrice", "AvgSellPrice", "PreValue", "CurrValue", "Day Pnl", "O/N Pnl"].forEach(col => {
                this.portfolioTable.addColumn(this.langServ.get(col));
            });

        this.portfolioTable.columnConfigurable = true;
        this.portfolioTable.onCellClick = (cellItem, cellIndex, rowIndex) => {
            let ukey = AppComponent.self.portfolioTable.rows[rowIndex].cells[0].Data;
            let account = parseInt(AppComponent.self.dd_portfolioAccount.SelectedItem.Text);
            if (cellIndex === 10) {
                let value = AppComponent.self.portfolioTable.rows[rowIndex].cells[9].Text + "";
                let rtn = AppComponent.self.TestingInput(value);
                if (!rtn) {
                    let msg = AppComponent.self.portfolioTable.rows[rowIndex].cells[0].Title + " singleOrderQty input illegal!";
                    MessageBox.show("warning", "Input Error!", msg);
                    return;
                }
                let qty = parseInt(value);
                let askPriceLevel = AppComponent.self.portfolioBuyCom.SelectedItem.Value;
                let bidPriceLevel = AppComponent.self.portfolioSellCom.SelectedItem.Value;
                let askOffset = AppComponent.self.portfolioBUyOffset.SelectedItem.Value;
                let bidOffset = AppComponent.self.portfolioSellOffset.SelectedItem.Value;
                AppComponent.bgWorker.send({
                    command: "ss-send", params: {
                        type: "order-fp", data: {
                            account: account,
                            askPriceLevel: askPriceLevel,
                            bidPriceLevel: bidPriceLevel,
                            askOffset: askOffset,
                            bidOffset: bidOffset,
                            orders: [{
                                ukey: ukey,
                                qty: qty
                            }]
                        }
                    }
                });
            } else if (cellIndex === 11) {
                AppComponent.bgWorker.send({
                    command: "ss-send", params: {
                        type: "cancel-fp", data: {
                            account: account, ukeys: [ukey]
                        }
                    }
                });
            }
        };

        btn_load.OnClick = () => {
            let readself = this;
            let account: number = parseInt(this.dd_portfolioAccount.SelectedItem.Text);
            AppComponent.bgWorker.send({ command: "ss-send", params: { type: "account-position-load", account: account } });

            MessageBox.openFileDialog("Select CSV", (filenames) => {
                // console.log(filenames);
                if (filenames === undefined || filenames.length < 1)
                    return;

                File.readPCF(filenames[0]).then((basketList) => {
                    let templist = [];
                    basketList.components.forEach(item => {
                        let codeinfo = this.secuinfo.getSecuinfoByWindCodes([item.code]);
                        templist.push({ currPos: 0, ukey: parseInt(codeinfo[0].InnerCode), targetPos: item.amount });
                    });

                    AppComponent.bgWorker.send({
                        command: "ss-send", params: { type: "basket-fp", data: { account: account, list: templist } }
                    });

                    templist = null;
                    this.portfolioCount.Text = 0;
                });
            }, [{ name: "bkt", extensions: ["bkt"] }]);
        };

        allbuyChk.OnClick = () => { this.changeItems(1, !allbuyChk.Text); };
        allsellChk.OnClick = () => { this.changeItems(2, !allsellChk.Text); };

        this.range.OnClick = () => {
            let rateVal = this.range.Text;
            this.rateText.Text = rateVal;
            this.changeSingleQty(rateVal);
        };

        this.rateText.OnInput = () => {
            let getrateText = this.range.Text = this.rateText.Text;
            let rtn = this.TestingInput(getrateText + "");

            if (!rtn) {
                this.range.Text = this.rateText.Text = 0;
                this.changeSingleQty(0);
                return;
            }

            if (parseInt(getrateText) > 100) {
                MessageBox.show("warning", "Input Error!", "input value shold be less than 100");
                this.range.Text = this.rateText.Text = 100;
                this.changeSingleQty(100);
                return;
            } else {
                this.changeSingleQty(parseInt(this.rateText.Text));
            }
        };

        btn_sendSel.OnClick = () => {
            let askPriceLevel = this.portfolioBuyCom.SelectedItem.Value;
            let bidPriceLevel = this.portfolioSellCom.SelectedItem.Value;
            let askOffset = this.portfolioBUyOffset.SelectedItem.Value;
            let bidOffset = this.portfolioSellOffset.SelectedItem.Value;
            let sendArr = [];

            for (let i = 0; i < this.portfolioTable.rows.length; ++i) {
                if (this.portfolioTable.rows[i].cells[0].Text === true) {
                    let qty = parseInt(this.portfolioTable.rows[i].cells[9].Text);
                    if (isNaN(qty)) {
                        alert("下单量必须是数值型");
                        continue;
                    }

                    sendArr.push({ ukey: this.portfolioTable.rows[i].cells[0].Data, qty: qty });
                }
            }

            AppComponent.bgWorker.send({
                command: "ss-send", params: {
                    type: "order-fp", data: {
                        account: this.dd_portfolioAccount.SelectedItem.Text,
                        askPriceLevel: askPriceLevel,
                        bidPriceLevel: bidPriceLevel,
                        askOffset: askOffset,
                        bidOffset: bidOffset,
                        orders: sendArr
                    }
                }
            });
        };

        btn_cancelSel.OnClick = () => { // 5005
            let selectArr = this.getSelectedPortfolioItem();
            if (selectArr.length < 1)
                return;

            AppComponent.bgWorker.send({
                command: "ss-send", params: {
                    type: "cancel-fp", data: {
                        account: this.dd_portfolioAccount.SelectedItem.Text,
                        ukeys: selectArr
                    }
                }
            });
        };
        let portfolioContent = new VBox();
        portfolioContent.addChild(loadItem).addChild(tradeitem).addChild(this.portfolioTable);
        this.portfolioPage.setContent(portfolioContent);

        this.profitPage = new TabPage("Profit", this.langServ.get("Profit"));
        this.pageMap["Profit"] = this.profitPage;
        let profitleftAlign = 20;
        let profitHeader = new HBox();
        this.totalpnLabel = new MetaControl("textbox");
        this.totalpnLabel.Left = profitleftAlign;
        this.totalpnLabel.Width = 85;
        this.totalpnLabel.Title = this.langServ.get("TOTALPNL") + ": ";
        this.totalpnLabel.Disable = true;
        this.pospnlLabel = new MetaControl("textbox");
        this.pospnlLabel.Left = profitleftAlign;
        this.pospnlLabel.Width = 85;
        this.pospnlLabel.Title = this.langServ.get("POSPNL") + ": ";
        this.pospnlLabel.Disable = true;
        this.trapnlt = new MetaControl("textbox");
        this.trapnlt.Left = profitleftAlign;
        this.trapnlt.Width = 85;
        this.trapnlt.Title = this.langServ.get("TRAPNL.T") + ": ";
        this.trapnlt.Disable = true;
        this.pospnlt = new MetaControl("textbox");
        this.pospnlt.Left = profitleftAlign;
        this.pospnlt.Width = 85;
        this.pospnlt.Title = this.langServ.get("POSPNL.T") + ": ";
        this.pospnlt.Disable = true;
        this.totalpnlt = new MetaControl("textbox");
        this.totalpnlt.Left = profitleftAlign;
        this.totalpnlt.Width = 85;
        this.totalpnlt.Title = this.langServ.get("TOTALPNL.T") + ": ";
        this.totalpnlt.Disable = true;
        let reqbtn = new Button();
        reqbtn.Left = profitleftAlign;
        reqbtn.Width = 30;
        reqbtn.Text = this.langServ.get("Req");
        profitHeader.addChild(this.totalpnLabel).addChild(this.pospnlLabel).addChild(this.trapnlt).addChild(this.pospnlt).addChild(this.totalpnlt).addChild(reqbtn);
        this.profitTable = new DataTable("table2");
        ["UKEY", "Code", "PortfolioID", "Strategy", "AvgPrice(B)", "AvgPrice(S)",
            "PositionPnl", "TradingPnl", "IntraTradingFee", "TotalTradingFee", "LastTradingFee", "LastPosPnl",
            "TodayPosPnl", "TotalPnl", "LastPosition", "TodayPosition", "LastClose", "MarketPrice", "IOPV"]
            .forEach(item => {
                this.profitTable.addColumn(this.langServ.get(item));
            });
        this.profitTable.columnConfigurable = true;
        let profitContent = new VBox();
        profitContent.addChild(profitHeader);
        profitContent.addChild(this.profitTable);
        this.profitPage.setContent(profitContent);
        reqbtn.OnClick = () => { AppComponent.bgWorker.send({ command: "ss-send", params: { type: "getProfitInfo", data: "" } }); };

        { // basket page
            let basketPage = new TabPage("TWAPPortfolio", this.langServ.get("TWAPPortfolio"));
            this.pageMap["TWAPPortfolio"] = basketPage;
            let basketHeader = new HBox();
            let bidLevel = new Label();
            bidLevel.Title = `${this.langServ.get("BidLevel")}:`;
            basketHeader.addChild(bidLevel);
            let askLevel = new Label();
            askLevel.Title = `${this.langServ.get("AskLevel")}:`;
            basketHeader.addChild(askLevel);
            let orderValidTime = new Label();
            orderValidTime.Title = `${this.langServ.get("OrderValidTime")}:`;
            basketHeader.addChild(orderValidTime);
            let maxChaseTimes = new Label();
            maxChaseTimes.Title = `${this.langServ.get("MaxChaseTimes")}:`;
            basketHeader.addChild(maxChaseTimes);
            let beginTime = new Label();
            beginTime.Title = `${this.langServ.get("BeginTime")}:`;
            basketHeader.addChild(beginTime);
            let endTime = new Label();
            endTime.Title = `${this.langServ.get("EndTime")}:`;
            basketHeader.addChild(endTime);
            let interval = new Label();
            interval.Title = `${this.langServ.get("Interval")}:`;
            basketHeader.addChild(interval);
            let mbasket_load = new Button();
            mbasket_load.Text = "导入篮子文件";
            basketHeader.addChild(mbasket_load);
            bidLevel.Left = askLevel.Left = orderValidTime.Left = maxChaseTimes.Left = beginTime.Left = endTime.Left = interval.Left
                = mbasket_load.Left = 20;

            mbasket_load.OnClick = () => {
                MessageBox.openFileDialog("导入篮子文件", (filenames) => {
                    let account: number = parseInt(this.dd_portfolioAccount.SelectedItem.Text);
                    AppComponent.bgWorker.send({ command: "ss-send", params: { type: "account-position-load", account: account } });
                    // console.log(filenames);
                    if (filenames === undefined || filenames.length < 1)
                        return;

                    File.readPCF(filenames[0]).then((basketList) => {
                        let templist = [];
                        basketList.components.forEach(item => {
                            let codeinfo = this.secuinfo.getSecuinfoByWindCodes([item.code]);
                            templist.push({ currPos: 0, ukey: parseInt(codeinfo[0].InnerCode), targetPos: item.amount });
                        });

                        bidLevel.Text = basketList.params["BidLevel"];
                        askLevel.Text = basketList.params["AskLevel"];
                        orderValidTime.Text = basketList.params["OrderValidTime"];
                        maxChaseTimes.Text = basketList.params["MaxChaseTimes"];
                        beginTime.Text = basketList.params["BeginTime"];
                        endTime.Text = basketList.params["EndTime"];
                        interval.Text = basketList.params["Interval"];

                        AppComponent.bgWorker.send({
                            command: "ss-send", params: { type: "TWAPPortfolio-fp", data: { account: account, params: basketList.params, list: templist } }
                        });

                        templist = null;
                    });
                }, [{ name: "bkt", extensions: ["bkt"] }]);
            };
            this.basketTable = new DataTable("table2");
            ["SymbolCode", "Symbol", "PreQty", "TargetQty", "CurrQty", "TotalOrderQty", "FilledQty", "FillPace",
                "WorkingQty", "Status", "PrePrice", "LastPrice", "BidSize", "BidPrice", "AskSize",
                "AskPrice", "AvgBuyPrice", "AvgSellPrice", "PreValue", "CurrValue", "Day Pnl", "O/N Pnl"].
                forEach(col => {
                    this.basketTable.addColumn(this.langServ.get(col));
                });
            let basketContent = new VBox();
            basketContent.addChild(basketHeader).addChild(this.basketTable);
            basketPage.setContent(basketContent);
        }


        this.onStrategyTableInit();
        this.loadLayout();

        AppComponent.bgWorker.send({ command: "ss-start", params: { port: parseInt(this.tradeEndpoint[1]), host: this.tradeEndpoint[0], appid: this.option.appid, loginInfo: JSON.parse(AppStoreService.getLocalStorageItem(DataKey.kUserInfo)) } });
        this.subMarketInit(parseInt(this.quoteEndpoint[1]), this.quoteEndpoint[0]);
        setInterval(() => {
            this.bookviewArr.forEach(item => {
                item.table.detectChanges();
            });
        }, 1000);
    }

    onStrategyTableInit() {
        this.strategyPage = new TabPage("Strategy", this.langServ.get("StrategyMonitor"));
        let strategyHeader = new HBox();
        let startall = new Button();
        startall.Text = this.langServ.get("StartAll");
        let pauseall = new Button();
        pauseall.Text = this.langServ.get("PauseAll");
        let stopall = new Button();
        stopall.Text = this.langServ.get("StopAll");
        let watchall = new Button();
        watchall.Text = this.langServ.get("WatchAll");
        let configBtn = new Button();
        configBtn.Text = this.langServ.get("Config");
        startall.OnClick = () => { this.operateStrategy(this.strategyTable.rows[0].cells[0].Text, 0); };
        pauseall.OnClick = () => { this.operateStrategy(this.strategyTable.rows[0].cells[0].Text, 1); };
        stopall.OnClick = () => { this.operateStrategy(this.strategyTable.rows[0].cells[0].Text, 2); };
        watchall.OnClick = () => { this.operateStrategy(this.strategyTable.rows[0].cells[0].Text, 3); };
        configBtn.OnClick = () => {
            this.configTable.rows.forEach(row => {
                row.cells[0].Text = !this.option.config["strategy_table"].columnHideIDs.includes(row.cells[0].Data);
            });
            Dialog.popup(this, this.configContent, { title: this.langServ.get("parameter"), height: 450 });
        };

        strategyHeader.addChild(startall).addChild(pauseall).addChild(stopall).addChild(watchall).addChild(configBtn);

        this.strategyTable = new DataTable();
        this.strategyTable.RowIndex = false;
        ["StrategyID", "Sym1", "Sym2", "Command", "Status", "PosPnl(K)", "TraPnl(K)"]
            .forEach(item => { this.strategyTable.addColumn(this.langServ.get(item)); });
        let strategyContent = new VBox();
        strategyContent.addChild(strategyHeader);
        strategyContent.addChild(this.strategyTable);
        this.strategyPage.setContent(strategyContent);
        this.strategyTable.onCellClick = (cellItem, cellIdx, rowIdx) => { this.strategyOnCellClick(cellItem, cellIdx, rowIdx); };

        this.pageMap["Strategy"] = this.strategyPage;
    }

    loadLayout() {
        let children = this.option.layout.children;
        let childrenLen = children.length;
        this.main = new DockContainer(null, this.option.layout.type, this.option.layout.width, this.option.layout.height);
        for (let i = 0; i < childrenLen - 1; ++i) {  // traverse
            this.main.addChild(this.loadChildren(this.main, children[i]));
            this.main.addChild(new Splitter("h", this.main));
        }

        this.main.addChild(this.loadChildren(this.main, children[childrenLen - 1]));
    }

    loadChildren(parentDock: DockContainer, childDock: any) {
        let dock = new DockContainer(parentDock, childDock.type, childDock.width, childDock.height);
        if (childDock.children && childDock.children.length > 0) {
            childDock.children.forEach((child, index) => {
                dock.addChild(this.loadChildren(dock, child));
                if (index < childDock.children.length - 1)
                    dock.addChild(new Splitter(child.type, dock));
            });
        } else if (childDock.modules && childDock.modules.length > 0) {
            let panel = new TabPanel();
            childDock.modules.forEach(page => {
                if (this.pageMap.hasOwnProperty(page)) {
                    panel.addTab(this.pageMap[page]);
                    this.statechecker.changeMenuItemState(page, true, 2);
                } else {
                    if (page.startsWith("BookView")) {
                        panel.addTab(this.createBookView(page));
                    }
                }
            });

            dock.addChild(panel);
            panel.setActive(childDock.modules[typeof childDock.activeIdx === "undefined" ? 0 : childDock.activeIdx]);
        } else {
            console.error("loadChildren layout error");
        }

        return dock;
    }

    subMarketInit(port: number, host: string) {
        this.createBackgroundWork();
        AppComponent.bgWorker.send({ command: "ps-start", params: { port: port, host: host } });

        let kwlist = [];
        this.bookviewArr.forEach(item => {
            if (item.code !== null && !kwlist.includes(item.code)) {
                kwlist.push(item.code);
            }
        });

        setTimeout(() => {
            this.subscribeMarketData(kwlist);
        }, 1000);
    }

    changeIp20Status(data: any) {
        AppComponent.self.addStatus(data, "PS");
    }

    changeSSstatus(data: any) {
        AppComponent.self.addStatus(data, "SS");
    }

    addStatus(data: boolean, mark: string) {
        let markLen = this.statusbar.items.length;
        let i;

        for (i = 0; i < markLen; ++i) {
            if (this.statusbar.items[i].text === mark) {
                this.statusbar.items[i].color = data ? "#26d288" : "#ff5564";
                break;
            }
        }

        if (i === markLen)
            this.addStatusBarMark({ name: mark, connected: data });
    }

    changeConfigArrVal(name: string, show: boolean) {
        for (let i = 0; i < AppComponent.self.configArr.length; ++i) {
            if (AppComponent.self.configArr[i].name === name) {
                AppComponent.self.configArr[i].check = show;
                break;
            }
        }
    }

    TestingInput(data: any) {
        let reg = /^[\d]+$/;
        let rtn = reg.test(data);
        return rtn;
    }

    changeSingleQty(rateVal: number) {
        let len = this.portfolioTable.rows.length;
        for (let i = 0; i < len; ++i) {
            let targetVal = this.portfolioTable.rows[i].cells[3].Text;
            let singleVal = (targetVal / 100 * rateVal).toFixed(0);
            this.portfolioTable.rows[i].cells[9].Text = Math.abs(parseInt(singleVal));
        }
    }

    showStatArbOrder(res: any) {
        if (res.subtype === 1001) {  // OrderInfo
            res.data.forEach(order => {
                let row = this.statarbTable.rows.find(item => { return item.cells[1].Text === order.code && item.cells[6].Text === order.strategyid; });
                if (row === undefined) {
                    row = this.statarbTable.newRow();
                    let codeInfo = this.secuinfo.getSecuinfoByInnerCode(order.code)[order.code];
                    row.cells[0].Text = codeInfo.SecuAbbr;
                    row.cells[1].Text = order.code;
                    row.cells[8].Text = codeInfo.SecuCode;
                }

                row.cells[2].Text = (order.pricerate / 100).toFixed(2);
                row.cells[3].Text = order.position;
                row.cells[4].Text = order.quantity;
                row.cells[5].Text = (order.amount / 10000).toFixed(1);
                row.cells[6].Text = order.strategyid;

                if (order.amount > 0) {
                    this.buyamountLabel.Text = (parseFloat(this.buyamountLabel.Text) + order.amount / 10000).toFixed(1);
                } else if (order.amount < 0) {
                    this.sellamountLabel.Text = (parseFloat(this.sellamountLabel.Text) - order.amount / 10000).toFixed(1);
                }

                row.cells[7].Text = order.diffQty;
                row.hidden = false;
            });
        } else if (res.subtype === 1002) { // TradeInfo
            res.data.forEach(order => {
                let row = this.statarbTable.rows.find(item => { return item.cells[1].Text === order.code && item.cells[6].Text === order.strategyid; });
                if (row !== undefined) {
                    row.hidden = true;

                    if (order.amount > 0) {
                        this.buyamountLabel.Text = (parseFloat(this.buyamountLabel.Text) - order.amount / 10000).toFixed(1);
                    } else if (order.amount < 0) {
                        this.sellamountLabel.Text = (parseFloat(this.sellamountLabel.Text) + order.amount / 10000).toFixed(1);
                    }
                }
            });
        }
    }

    showComorderstatusAndErrorInfo(data: any) {
        let time = new Date().format("HH:mm:ss.SSS");
        let row = this.logTable.newRow();
        row.cells[0].Text = time;
        row.cells[1].Text = `errorid=${data[0].os.errorid}, errmsg=${data[0].os.errormsg}`;
        if (data[0].os.errorid !== 0) {
            row.cells[1].Color = "red";
        }

        if (this.logTable.rows.length > 300)
            this.logTable.rows.shift();
    }

    showGuiCmdAck(data: any) {
        console.info(data);
        data.data.forEach(item => {
            for (let iRow = 0; iRow < this.strategyTable.rows.length; ++iRow) {
                if (this.strategyTable.rows[iRow].cells[0].Text !== item.strategyid)
                    continue;

                switch (data.type) {
                    case 2001: // start ack
                        if (!item.success)
                            break;

                        this.strategyTable.rows[iRow].cells[3].Data = { disable: [0] };
                        break;
                    case 2005: // pause ack
                        if (!item.success)
                            break;

                        this.strategyTable.rows[iRow].cells[3].Data = { disable: [1] };
                        break;
                    case 2003: // stop ack
                        if (!item.success)
                            break;

                        this.strategyTable.rows[iRow].cells[3].Data = { disable: [0, 1, 2] };
                        break;
                    case 2050: // watch ack
                        if (!item.success)
                            break;

                        this.strategyTable.rows[iRow].cells[3].Data = { disable: [3] };
                        break;
                    case 2031:
                        let parameter = this.strategyMap[item.strategyid].parameters.find(param => { return param.key === item.key; });
                        if (parameter === undefined)
                            break;

                        if (!item.success)
                            break;

                        alert(`Strategyid: ${item.strategyid}, key: ${parameter.name} submit ${item.success ? "successfully!" : "unsuccessfully!"}`);
                        break;
                }
            }
        });
    }

    showStrategyInfo(data: any) {
        let row: DataTableRow;
        for (let i = 0; i < data.length; ++i) {
            row = this.strategyTable.rows.find(item => { return item.cells[0].Text === data[i].key; });

            if (row === undefined) {
                this.strategyMap[data[i].key] = { instruments: [], commands: [], parameters: [], comments1: [], comments2: [] };
                row = this.strategyTable.newRow();
                row.cells[0].Text = data[i].key;
                row.cells[3].Type = "button-group";
                row.cells[3].Text = ["play", "pause", "stop", "eye-open"];
                row.cells[3].Class = "primary";
                row.cells[3].OnClick = (btn_idx) => {
                    this.operateStrategy(data[i].key, btn_idx);
                };
                this.dd_Strategy.addItem({ Text: data[i].key + "", Value: "" });
            }

            switch (data[i].status) {
                case EStrategyStatus.STRATEGY_STATUS_INIT:
                    row.cells[4].Text = "INIT";
                    break;
                case EStrategyStatus.STRATEGY_STATUS_CREATE:
                    row.cells[4].Text = "CREATE";
                    break;
                case EStrategyStatus.STRATEGY_STATUS_RUN:
                    row.cells[3].Data = { disable: [0] };
                    row.cells[4].Text = "RUN";
                    break;
                case EStrategyStatus.STRATEGY_STATUS_PAUSE:
                    row.cells[3].Data = { disable: [1] };
                    row.cells[4].Text = "PAUSE";
                    break;
                case EStrategyStatus.STRATEGY_STATUS_STOP:
                    row.cells[3].Data = { disable: [0, 1, 2] };
                    row.cells[4].Text = "STOP";
                    break;
                case EStrategyStatus.STRATEGY_STATUS_WATCH:
                    row.cells[3].Data = { disable: [3] };
                    row.cells[4].Text = "WATCH";
                    break;
                case EStrategyStatus.STRATEGY_STATUS_ERROR:
                default:
                    row.cells[4].Text = "ERROR";
                    break;
            }
        }
    }

    showLog(data: any) {
        let logStr = data[0];
        let time = new Date().format("HH:mm:ss.SSS");
        let rowLen = this.logTable.rows.length;
        if (rowLen > 500)
            this.logTable.rows.splice(0, 1);
        let row = this.logTable.newRow();
        row.cells[0].Text = time;
        row.cells[1].Text = logStr;
    }

    addLog(data: any) {
        let name = data.name;
        let rowLen = this.logTable.rows.length;
        if (rowLen > 500)
            this.logTable.rows.splice(0, 1);
        let row = this.logTable.newRow();
        row.cells[0].Text = new Date().format("HH:mm:ss.SSS");
        row.cells[1].Text = name + " " + (data.connected ? "Connected" : "Disconnected");
    }

    showComOrderRecord(data: any) {
        console.info(`showComOrderRecord: len = ${data.length}`);
        let isUpdateDone = false, isUpdateStatus = false;
        let orderStatus;
        let orderStatusMap: Object = {};
        let doneMap: Object = {};

        this.orderstatusTable.rows.forEach(row => {
            orderStatusMap[row.cell(this.langServ.get("OrderId")).Text] = row;
        });

        this.doneOrdersTable.rows.forEach(row => {
            doneMap[row.cell(this.langServ.get("OrderId")).Text] = row;
        });

        for (let iData = 0; iData < data.length; ++iData) {
            orderStatus = data[iData].od.status;

            if (orderStatus === 9 || orderStatus === 6 || orderStatus === 7) {
                isUpdateDone = true;
                // remove from orderstatus table
                this.orderstatusTable.rows.splice(this.orderstatusTable.rows.findIndex(item => { return item === orderStatusMap[data[iData].od.orderid]; }), 1);
                delete orderStatusMap[data[iData].od.orderid];

                if (!doneMap.hasOwnProperty(data[iData].od.orderid)) {
                    let row = this.doneOrdersTable.newRow(true);
                    row.cell(this.langServ.get("UKEY")).Text = data[iData].od.innercode;
                    let codeInfo = this.secuinfo.getSecuinfoByInnerCode(data[iData].od.innercode);
                    row.cell(this.langServ.get("Symbol")).Text = codeInfo.hasOwnProperty(data[iData].od.innercode) ? codeInfo[data[iData].od.innercode].SecuAbbr : "unknown";
                    row.cell(this.langServ.get("SymbolCode")).Text = codeInfo.hasOwnProperty(data[iData].od.innercode) ? codeInfo[data[iData].od.innercode].SecuCode : "unknown";
                    row.cell(this.langServ.get("OrderId")).Text = data[iData].od.orderid;
                    row.cell(this.langServ.get("Strategy")).Text = data[iData].od.strategyid;
                    row.cell(this.langServ.get("Ask/Bid")).Text = data[iData].od.action === 0 ? "Buy" : "Sell";
                    row.cell(this.langServ.get("OrderType")).Text = data[iData].donetype === 1 ? "Active" : (data[iData].donetype === 2 ? "Passive" : "UNKNOWN");
                    row.cell(this.langServ.get("PortfolioID")).Text = data[iData].con.account;
                    row.cell(this.langServ.get("PortfolioID")).Text = data[iData].con.account;
                    doneMap[data[iData].od.orderid] = row;
                }

                doneMap[data[iData].od.orderid].cell(this.langServ.get("DonePrice")).Text = data[iData].od.iprice / 10000;
                doneMap[data[iData].od.orderid].cell(this.langServ.get("DoneVol")).Text = data[iData].od.ivolume;
                doneMap[data[iData].od.orderid].cell(this.langServ.get("DoneTime")).Text = new Date(data[iData].od.idatetime.tv_sec * 1000).format("HH:mm:ss");
                doneMap[data[iData].od.orderid].cell(this.langServ.get("OrderStatus")).Text = this.parseOrderStatus(data[iData].od.status);
                doneMap[data[iData].od.orderid].cell(this.langServ.get("OrderTime")).Text = new Date(data[iData].od.odatetime.tv_sec * 1000).format("HH:mm:ss");
                doneMap[data[iData].od.orderid].cell(this.langServ.get("OrderVol")).Text = data[iData].od.ovolume;
                doneMap[data[iData].od.orderid].cell(this.langServ.get("OrderPrice")).Text = data[iData].od.oprice / 10000;
            } else {
                isUpdateStatus = true;

                if (!orderStatusMap.hasOwnProperty(data[iData].od.orderid)) {
                    let row = this.orderstatusTable.newRow(true);
                    row.cells[0].Type = "checkbox";
                    row.cells[0].Text = false;
                    row.cells[0].Data = data[iData].od.innercode;
                    row.cell(this.langServ.get("UKEY")).Text = data[iData].od.innercode;
                    let codeInfo = this.secuinfo.getSecuinfoByInnerCode(data[iData].od.innercode);
                    row.cell(this.langServ.get("Symbol")).Text = codeInfo.hasOwnProperty(data[iData].od.innercode) ? codeInfo[data[iData].od.innercode].SecuAbbr : "unknown";
                    row.cell(this.langServ.get("SymbolCode")).Text = codeInfo.hasOwnProperty(data[iData].od.innercode) ? codeInfo[data[iData].od.innercode].SecuCode : "unknown";
                    row.cell(this.langServ.get("OrderId")).Text = data[iData].od.orderid;
                    row.cell(this.langServ.get("Strategy")).Text = data[iData].od.strategyid;
                    row.cell(this.langServ.get("PortfolioID")).Text = data[iData].con.account;
                    orderStatusMap[data[iData].od.orderid] = row;
                }

                orderStatusMap[data[iData].od.orderid].cell(this.langServ.get("OrderTime")).Text = new Date(data[iData].od.odatetime.tv_sec * 1000).format("HH:mm:ss");
                orderStatusMap[data[iData].od.orderid].cell(this.langServ.get("Ask/Bid")).Text = data[iData].od.action === 0 ? "Buy" : "Sell";
                orderStatusMap[data[iData].od.orderid].cell(this.langServ.get("OrderPrice")).Text = data[iData].od.oprice / 10000;
                orderStatusMap[data[iData].od.orderid].cell(this.langServ.get("OrderVol")).Text = data[iData].od.ovolume;
                let statusCell = orderStatusMap[data[iData].od.orderid].cell(this.langServ.get("OrderStatus"));
                statusCell.Text = this.parseOrderStatus(data[iData].od.status);
                statusCell.Data = data[iData].od.status;
            }
        }

        if (isUpdateDone) {
            AppComponent.bgWorker.send({ command: "send", params: { type: 0 } });
            this.doneOrdersTable.detectChanges();
        }

        if (isUpdateStatus) {
            this.orderstatusTable.detectChanges();
        }
    }

    parseOrderStatus(status: any): String {
        switch (status) {
            case EOrderStatus.ORDER_STATUS_INVALID:
                return "0.无效";
            case EOrderStatus.ORDER_STATUS_INIT:
                return "1.未报";
            case EOrderStatus.ORDER_STATUS_WAIT_SEND:
                return "2.待报";
            case EOrderStatus.ORDER_STATUS_SEND:
                return "3.已报";
            case EOrderStatus.ORDER_STATUS_SEND_WAIT_CANCEL:
                return "4.已报待撤";
            case EOrderStatus.ORDER_STATUS_PART_WAIT_CANCEL:
                return "5.部成待撤";
            case EOrderStatus.ORDER_STATUS_PART_CANCELED:
                return "6.部撤";
            case EOrderStatus.ORDER_STATUS_CANCELED:
                return "7.已撤";
            case EOrderStatus.ORDER_STATUS_PART_DEALED:
                return "8.部成";
            case EOrderStatus.ORDER_STATUS_DEALED:
                return "9.已成";
            default:
                AppComponent.bgWorker.send({ command: "send", params: { type: 1 } });
                return "10.废单";
        }
    }

    /**
     * update by cl, date 2017/08/31
     */
    showComRecordPos(data: any) {
        let iRow;
        let secuCategory = 1;
        for (let iData = 0; iData < data.length; ++iData) {
            for (iRow = 0; iRow < this.positionTable.rows.length; ++iRow) {
                if (this.positionTable.rows[iRow].cells[2].Text === data[iData].record.code) { // refresh
                    secuCategory = this.positionTable.rows[iRow].cells[1].Text;

                    if (secuCategory === 1) {
                        this.positionTable.rows[iRow].cells[4].Text = data[iData].record.TotalVol;
                        this.positionTable.rows[iRow].cells[5].Text = data[iData].record.AvlVol;
                        this.positionTable.rows[iRow].cells[6].Text = data[iData].record.AvlCreRedempVol;
                        this.positionTable.rows[iRow].cells[7].Text = data[iData].record.WorkingVol;
                        this.positionTable.rows[iRow].cells[8].Text = data[iData].record.TotalCost / 10000;
                        this.positionTable.rows[iRow].cells[10].Text = data[iData].record.TotalVol !== 0 ? (data[iData].record.TotalCost / data[iData].record.TotalVol / 10000).toFixed(4) : 0;
                        break;
                    } else if (secuCategory === 2 && this.positionTable.rows[iRow].cells[12].Text === data[iData].record.type) {
                        this.positionTable.rows[iRow].cells[4].Text = data[iData].record.TotalVol;
                        this.positionTable.rows[iRow].cells[5].Text = data[iData].record.AvlVol;
                        this.positionTable.rows[iRow].cells[7].Text = data[iData].record.WorkingVol;
                        this.positionTable.rows[iRow].cells[8].Text = data[iData].record.TotalCost / 10000;
                        this.positionTable.rows[iRow].cells[9].Text = data[iData].record.TodayOpen;
                        this.positionTable.rows[iRow].cells[10].Text = data[iData].record.AveragePrice / 10000;
                        break;
                    }
                }
            }

            if (iRow === this.positionTable.rows.length) {
                if (data[iData].secucategory === 1) {
                    let row = this.positionTable.newRow();
                    row.cells[0].Text = data[iData].record.account;
                    row.cells[1].Text = data[iData].secucategory;
                    row.cells[2].Text = data[iData].record.code;
                    let codeInfo = this.secuinfo.getSecuinfoByInnerCode(data[iData].record.code);
                    row.cells[3].Text = codeInfo.hasOwnProperty(data[iData].record.code) ? codeInfo[data[iData].record.code].SecuCode : "unknown";
                    row.cells[4].Text = data[iData].record.TotalVol;
                    row.cells[5].Text = data[iData].record.AvlVol;
                    row.cells[6].Text = data[iData].record.AvlCreRedempVol;
                    row.cells[7].Text = data[iData].record.WorkingVol;
                    row.cells[8].Text = data[iData].record.TotalCost / 10000;
                    row.cells[9].Text = 0;
                    row.cells[10].Text = data[iData].record.TotalVol !== 0 ? (data[iData].record.TotalCost / data[iData].record.TotalVol / 10000).toFixed(4) : 0;
                    row.cells[11].Text = data[iData].strategyid;
                    row.cells[12].Text = data[iData].record.type;
                } else {
                    let row = this.positionTable.newRow();
                    row.cells[0].Text = data[iData].record.account;
                    row.cells[1].Text = data[iData].secucategory;
                    row.cells[2].Text = data[iData].record.code;
                    let codeInfo = this.secuinfo.getSecuinfoByInnerCode(data[iData].record.code);
                    row.cells[3].Text = codeInfo.hasOwnProperty(data[iData].record.code) ? codeInfo[data[iData].record.code].SecuCode : "unknown";
                    row.cells[4].Text = data[iData].record.TotalVol;
                    row.cells[5].Text = data[iData].record.AvlVol;
                    row.cells[6].Text = 0;
                    row.cells[7].Text = data[iData].record.WorkingVol;
                    row.cells[8].Text = data[iData].record.TotalCost / 10000;
                    row.cells[9].Text = data[iData].record.TodayOpen;
                    row.cells[10].Text = data[iData].record.AveragePrice / 10000;
                    row.cells[11].Text = data[iData].strategyid;
                    row.cells[12].Text = data[iData].record.type;
                }
            }
        }

        iRow = null;
        secuCategory = null;
    }

    showComGWNetGuiInfo(data: any) {
        let markLen = this.statusbar.items.length;
        let name = data[0].name;
        let connect = data[0].connected;
        let rtn = this.gatewayObj.hasOwnProperty(name);
        this.gatewayObj[name] = connect ? "Connected" : "Disconnected";
        if (markLen === 0) { // add
            this.addLog(data[0]);
        } else {
            let markFlag: Boolean = false;
            for (let i = 0; i < markLen; ++i) {
                let text = this.statusbar.items[i].text;
                if (text === data[0].name) {
                    this.statusbar.items[i].color = data[0].connected ? "green" : "red";
                    this.addLog(data[0]);
                    markFlag = true;
                }
            }
            if (!markFlag) {
                this.addLog(data[0]);
            }
        }
    }

    addStatusBarMark(data: any) {
        let name = data.name;
        let tempmark = new StatusBarItem(name);
        tempmark.click = () => {
            if (tempmark.text === "SS") {
                this.gatewayTable.rows.length = 0;
                for (let o in this.gatewayObj) {
                    let row = this.gatewayTable.newRow();
                    row.cells[0].Text = o;
                    row.cells[1].Text = this.gatewayObj[o];
                }

                Dialog.popup(this, this.gatewayContent, { title: this.langServ.get("Gateway"), height: 300 });
            }
        };

        tempmark.section = "right";
        tempmark.color = data.connected ? "#26d288" : "#ff5564";
        if (!data.connected)
            AppComponent.bgWorker.send({ command: "send", params: { type: 1 } });

        this.statusbar.items.push(tempmark);
    }

    showComTotalProfitInfo(data: any) {
        let subtype = data[0].subtype;
        let arr: any[] = data[0].content;
        if (subtype === 1) { // profitcmd & alarmitem
            arr.forEach(item => {
                for (let i = 0; i < this.strategyTable.rows.length; ++i) {
                    if (this.strategyTable.rows[i].cells[0].Text !== item.strategyid)
                        continue;

                    this.strategyTable.rows[i].cells[5].Text = (item.totalpositionpnl / 10000 / 1000).toFixed(2);
                    this.strategyTable.rows[i].cells[5].bgColor = item.totalpositionpnl > 0 ? null : "#F62626";
                    this.strategyTable.rows[i].cells[6].Text = (item.totaltradingpnl / 10000 / 1000).toFixed(2);
                    break;
                }
            });
        } else if (subtype === 0) { // set pnl
            for (let i = 0; i < arr.length; ++i) {
                this.totalpnLabel.Text = arr[i].totalpnl / 10000;
                this.pospnlLabel.Text = arr[i].totalpositionpnl / 10000;
                this.trapnlt.Text = arr[i].totaltradingpnl / 10000;
                this.pospnlt.Text = arr[i].totaltodaypositionpnl / 10000;
                this.totalpnlt.Text = arr[i].totaltodaypositionpnl / 10000 + arr[i].totaltradingpnl / 10000;
            }
        }
    }

    showComProfitInfo(data: any) {
        for (let i = 0; i < data.length; ++i) {
            let profitTableRows: number = this.profitTable.rows.length;
            let profitUkey: number = data[i].innercode;

            if (profitTableRows === 0) {  // add
                this.addProfitInfo(data[i]);
            } else {
                let checkFlag: boolean = false;
                for (let j = 0; j < profitTableRows; ++j) {
                    let getUkey = this.profitTable.rows[j].cells[0].Text;
                    if (getUkey === profitUkey) { // refresh
                        checkFlag = true;
                        this.refreshProfitInfo(data[i], j);
                    }
                }
                if (!checkFlag) {
                    this.addProfitInfo(data[i]);
                }
                checkFlag = false;
            }
        }
    }

    addProfitInfo(obj: any) {
        let row = this.profitTable.newRow();
        row.cells[0].Text = obj.innercode;
        let codeInfo = this.secuinfo.getSecuinfoByInnerCode(obj.innercode);
        row.cells[1].Text = codeInfo.hasOwnProperty(obj.innercode) ? codeInfo[obj.innercode].SecuCode : "unknown";
        row.cells[2].Text = obj.account;
        row.cells[3].Text = obj.strategyid;
        row.cells[4].Text = obj.avgpriceforbuy / 10000;
        row.cells[5].Text = obj.avgpriceforsell / 10000;
        row.cells[6].Text = obj.positionpnl / 10000;
        row.cells[7].Text = obj.tradingpnl / 10000;
        row.cells[8].Text = obj.intradaytradingfee / 10000;
        row.cells[9].Text = obj.tradingfee / 10000;
        row.cells[10].Text = obj.lasttradingfee / 10000;
        row.cells[11].Text = obj.lastpositionpnl / 10000;
        row.cells[12].Text = obj.todaypositionpnl / 10000;
        row.cells[13].Text = obj.pnl / 10000;
        row.cells[14].Text = obj.lastposition;
        row.cells[15].Text = obj.todayposition;
        row.cells[16].Text = obj.lastclose / 10000;
        row.cells[17].Text = obj.marketprice / 10000;
        row.cells[18].Text = obj.iopv;
    }

    refreshProfitInfo(obj: any, idx: number) {
        this.profitTable.rows[idx].cells[4].Text = obj.avgpriceforbuy / 10000;
        this.profitTable.rows[idx].cells[5].Text = obj.avgpriceforsell / 10000;
        this.profitTable.rows[idx].cells[6].Text = obj.positionpnl / 10000;
        this.profitTable.rows[idx].cells[7].Text = obj.tradingpnl / 10000;
        this.profitTable.rows[idx].cells[8].Text = obj.intradaytradingfee / 10000;
        this.profitTable.rows[idx].cells[9].Text = obj.tradingfee / 10000;
        this.profitTable.rows[idx].cells[10].Text = obj.lasttradingfee / 10000;
        this.profitTable.rows[idx].cells[11].Text = obj.lastpositionpnl / 10000;
        this.profitTable.rows[idx].cells[12].Text = obj.todaypositionpnl / 10000;
        this.profitTable.rows[idx].cells[13].Text = obj.pnl / 10000;
        this.profitTable.rows[idx].cells[14].Text = obj.lastposition;
        this.profitTable.rows[idx].cells[15].Text = obj.todayposition;
        this.profitTable.rows[idx].cells[16].Text = obj.lastclose / 10000;
        this.profitTable.rows[idx].cells[17].Text = obj.marketprice / 10000;
        this.profitTable.rows[idx].cells[18].Text = obj.iopv;
    }

    showComAccountPos(data: any) {
        for (let i = 0; i < data.length; ++i) {
            let account: number = data[i].record.account;
            let secucategory: number = data[i].secucategory;
            let item = this.dd_Account.Items.find(value => { return value.Text === data[i].record.account; });

            if (item === undefined) {
                this.dd_Account.addItem({ Text: account, Value: null });
                this.dd_portfolioAccount.addItem({ Text: account, Value: null });
            }

            let row = this.accountTable.rows.find(item => {
                return item.cells[0].Text === account && item.cells[1].Text === secucategory;
            });

            if (row === undefined) {
                row = this.accountTable.newRow();
                row.cells[0].Text = data[i].record.account;
                row.cells[1].Text = data[i].secucategory;
                row.cells[7].Text = 0;
                row.cells[8].Text = 0;
            }

            row.cells[2].Text = data[i].record.TotalAmount / 10000;
            row.cells[3].Text = data[i].record.AvlAmount / 10000;
            row.cells[4].Text = data[i].record.FrzAmount / 10000;
            row.cells[5].Text = data[i].record.date;
            row.cells[6].Text = data[i].record.c;
            data[i].market === SECU_MARKET.SM_SH ? row.cells[7].Text = data[i].record.AvlAmount / 10000 : row.cells[8].Text = data[i].record.AvlAmount / 10000;

            if (secucategory === 2) {
                row.cells[9].Text = data[i].record.BuyFrzAmt / 10000;
                row.cells[10].Text = data[i].record.SellFrzAmt / 10000;
                row.cells[11].Text = data[i].record.BuyMargin / 10000;
                row.cells[12].Text = data[i].record.SellMargin / 10000;
                row.cells[13].Text = data[i].record.TotalMargin / 10000;
                row.cells[14].Text = data[i].record.Fee / 10000;
                row.cells[15].Text = data[i].record.PositionPL / 10000;
                row.cells[16].Text = data[i].record.ClosePL / 10000;
            }
        }
    }

    showStrategyCfg(data: any) {
        if (this.strategyTable.rows.length === 0)   // table without strategy item
            return;

        let needInsert = false;
        let strategyid;
        let strategyKeyMap;
        for (let iRow = 0; iRow < this.strategyTable.rows.length; ++iRow) {   // find row in strategy table
            strategyid = this.strategyTable.rows[iRow].cells[0].Text;
            strategyKeyMap = this.strategyMap[strategyid];
            console.info(`strategy_cfg num=${data.length}`);
            for (let iData = 0; iData < data.length; ++iData) {
                if (data[iData].strategyid !== strategyid)
                    continue;

                switch (data[iData].type) {
                    case StrategyCfgType.STRATEGY_CFG_TYPE_INSTRUMENT:
                        let idxInstrument = strategyKeyMap.instruments.indexOf(data[iData].key);
                        let secuinfo = this.secuinfo.getSecuinfoByInnerCode(data[iData].value);
                        let symbolCode = secuinfo.hasOwnProperty(data[iData].value) ? secuinfo[data[iData].value].SecuCode : "";

                        if (idxInstrument < 0) { // add
                            if ((data[iData].key & 0x0000ffff) === 1 || (data[iData].key & 0x0000ffff) === 2) {
                                this.strategyTable.rows[iRow].cells[strategyKeyMap.instruments.length + 1].Text = `${symbolCode}(${data[iData].value})`;
                                strategyKeyMap.instruments.push(data[iData].key);
                            }
                        } else { // update
                            this.strategyTable.rows[iRow].cells[idxInstrument + 1].Text = `${symbolCode}(${data[iData].value})`;
                        }

                        symbolCode = null;
                        secuinfo = null;
                        idxInstrument = null;
                        break;
                    case StrategyCfgType.STRATEGY_CFG_TYPE_PARAMETER:
                        let paramIdx = strategyKeyMap.parameters.findIndex(item => { return data[iData].key === item.key; });
                        if (paramIdx < 0) { // add
                            strategyKeyMap.parameters.push(data[iData]);
                            needInsert = true;
                        } else { // update
                            let iCol = this.kInitColumns + strategyKeyMap.comments1.length + strategyKeyMap.commands.length + paramIdx;
                            if (!this.strategyTable.rows[iRow].cells[iCol].Class.startsWith("warning")) {
                                this.strategyTable.rows[iRow].cells[iCol].Text = (data[iData].value / Math.pow(10, data[iData].decimal)).toFixed(data[iData].decimal);
                                this.strategyTable.rows[iRow].cells[iCol].Data = data[iData];
                                this.strategyTable.rows[iRow].cells[iCol].Class = data[iData].level === 10 ? "info" : "default";
                            }
                        }
                        break;
                    case StrategyCfgType.STRATEGY_CFG_TYPE_COMMENT:
                        let commentIdx = strategyKeyMap.comments1.findIndex(item => { return data[iData].key === item.key && data[iData].level > 0; });
                        if (commentIdx < 0) { // add
                            if (data[iData].level > 0) {
                                strategyKeyMap.comments1.push(data[iData]);
                                needInsert = true;
                            } else {
                                let idx = strategyKeyMap.comments2.findIndex(item => { return data[iData].key === item.key; });
                                idx < 0 ? strategyKeyMap.comments2.push(data[iData]) : (strategyKeyMap.comments2[idx] = data[iData]);
                            }
                        } else { // update
                            let iCol = this.kInitColumns + commentIdx;
                            this.strategyTable.rows[iRow].cells[iCol].Text = (data[iData].value / Math.pow(10, data[iData].decimal)).toFixed(data[iData].decimal);
                            this.strategyTable.rows[iRow].cells[iCol].Class = data[iData].level === 10 ? "info" : "default";
                        }
                        break;
                    case StrategyCfgType.STRATEGY_CFG_TYPE_COMMAND:
                        let commandIdx = strategyKeyMap.commands.findIndex(item => { return data[iData].key === item.key; });
                        if (commandIdx < 0) { // add
                            strategyKeyMap.commands.push(data[iData]);
                            needInsert = true;
                        } else { // update
                            let iCol = this.kInitColumns + strategyKeyMap.comments1.length + commandIdx;
                            this.strategyTable.rows[iRow].cells[iCol].Text = data[iData].name;
                            this.strategyTable.rows[iRow].cells[iCol].Data = data[iData];
                            this.strategyTable.rows[iRow].cells[iCol].Disable = data[iData].value === 0;
                        }
                        break;
                }
            }

            if (needInsert) {
                let row: DataTableRow;
                let offset = this.kInitColumns;
                if (this.option.config["strategy_table"] === undefined)
                    this.option.config["strategy_table"] = { columnHideIDs: [] };

                strategyKeyMap.comments1.forEach((item, idx) => {
                    this.strategyTable.addColumn(this.langServ.get(item.name));
                    this.strategyTable.rows[iRow].cells[offset + idx].Text = (item.value / Math.pow(10, item.decimal)).toFixed(item.decimal);
                    this.strategyTable.rows[iRow].cells[offset + idx].Class = item.level === 10 ? "info" : "default";
                    this.strategyTable.columns[offset + idx].key = item.key;
                    this.strategyTable.columns[offset + idx].hidden = this.option.config["strategy_table"].columnHideIDs.includes(item.key);
                    // append to config Table
                    row = this.configTable.newRow();
                    row.cells[0].Type = "checkbox";
                    row.cells[0].Title = item.name;
                    row.cells[0].Data = item.key;
                });

                offset += strategyKeyMap.comments1.length;
                if (strategyKeyMap.parameters.length > 0) {
                    strategyKeyMap.commands.push({ name: "submit", key: 999999999, value: 1 });
                }

                strategyKeyMap.commands.forEach((item, idx) => {
                    this.strategyTable.addColumn(this.langServ.get(item.name));
                    this.strategyTable.rows[iRow].cells[offset + idx].Text = this.langServ.get(item.name);
                    this.strategyTable.rows[iRow].cells[offset + idx].Data = item;
                    this.strategyTable.rows[iRow].cells[offset + idx].Type = "button";
                    this.strategyTable.rows[iRow].cells[offset + idx].Class = "primary";
                    this.strategyTable.rows[iRow].cells[offset + idx].Disable = item.value === 0;
                });

                offset += strategyKeyMap.commands.length;
                strategyKeyMap.parameters.forEach((item, idx) => {
                    this.strategyTable.addColumn(this.langServ.get(item.name));
                    this.strategyTable.rows[iRow].cells[offset + idx].Type = "textbox";
                    this.strategyTable.rows[iRow].cells[offset + idx].Text = (item.value / Math.pow(10, item.decimal)).toFixed(item.decimal);
                    this.strategyTable.rows[iRow].cells[offset + idx].Class = item.level === 10 ? "info" : "default";
                    this.strategyTable.rows[iRow].cells[offset + idx].onChange = function (cell) {
                        cell.Class = "warning";
                    };
                    this.strategyTable.columns[offset + idx].key = item.key;
                    this.strategyTable.columns[offset + idx].hidden = this.option.config["strategy_table"].columnHideIDs.includes(item.key);
                    // append to config Table
                    row = this.configTable.newRow();
                    row.cells[0].Type = "checkbox";
                    row.cells[0].Title = item.name;
                    row.cells[0].Data = item.key;
                });

                offset += strategyKeyMap.parameters.length;
                if (strategyKeyMap.comments2.length > 0) {
                    this.strategyTable.addColumn(this.langServ.get("comment"));
                    this.strategyTable.rows[iRow].cells[offset].Text = this.langServ.get("comment");
                    this.strategyTable.rows[iRow].cells[offset].Data = { name: "comment" };
                    this.strategyTable.rows[iRow].cells[offset].Type = "button";
                    this.strategyTable.rows[iRow].cells[offset].Class = "primary";
                }
            }

            strategyKeyMap = null;
        }
    }

    updateStrategyCfg(data: any) {
        if (this.strategyTable.rows.length === 0)   // table without strategy item
            return;

        let needInsert = false;
        let strategyid;
        let strategyKeyMap;
        for (let iRow = 0; iRow < this.strategyTable.rows.length; ++iRow) {   // find row in strategy table
            strategyid = this.strategyTable.rows[iRow].cells[0].Text;

            if (!this.strategyMap.hasOwnProperty(strategyid))
                continue;

            strategyKeyMap = this.strategyMap[strategyid];

            if (!this.strategyMap.hasOwnProperty(strategyid))
                continue;

            console.info(`strategy_cfg num=${data.length}`);
            for (let iData = 0; iData < data.length; ++iData) {
                if (data[iData].strategyid !== strategyid)
                    continue;

                switch (data[iData].type) {
                    case StrategyCfgType.STRATEGY_CFG_TYPE_INSTRUMENT:
                        let idxInstrument = strategyKeyMap.instruments.indexOf(data[iData].key);
                        let secuinfo = this.secuinfo.getSecuinfoByInnerCode(data[iData].value);
                        let symbolCode = secuinfo.hasOwnProperty(data[iData].value) ? secuinfo[data[iData].value].SecuCode : "";

                        if (idxInstrument >= 0) { // update
                            this.strategyTable.rows[iRow].cells[idxInstrument + 1].Text = `${symbolCode}(${data[iData].value})`;
                        }

                        symbolCode = null;
                        secuinfo = null;
                        idxInstrument = null;
                        break;
                    case StrategyCfgType.STRATEGY_CFG_TYPE_PARAMETER:
                        let paramIdx = strategyKeyMap.parameters.findIndex(item => { return data[iData].key === item.key; });
                        if (paramIdx >= 0) { // update
                            let iCol = this.kInitColumns + strategyKeyMap.comments1.length + strategyKeyMap.commands.length + paramIdx;
                            if (!this.strategyTable.rows[iRow].cells[iCol].Class.startsWith("warning")) {
                                this.strategyTable.rows[iRow].cells[iCol].Text = (data[iData].value / Math.pow(10, data[iData].decimal)).toFixed(data[iData].decimal);
                                this.strategyTable.rows[iRow].cells[iCol].Data = data[iData];
                                this.strategyTable.rows[iRow].cells[iCol].Class = data[iData].level === 10 ? "info" : "default";
                            }
                        }
                        break;
                    case StrategyCfgType.STRATEGY_CFG_TYPE_COMMENT:
                        let commentIdx = strategyKeyMap.comments1.findIndex(item => { return data[iData].key === item.key && data[iData].level > 0; });
                        if (commentIdx >= 0) { // update
                            let iCol = this.kInitColumns + commentIdx;
                            this.strategyTable.rows[iRow].cells[iCol].Text = (data[iData].value / Math.pow(10, data[iData].decimal)).toFixed(data[iData].decimal);
                            this.strategyTable.rows[iRow].cells[iCol].Class = data[iData].level === 10 ? "info" : "default";
                        }
                        break;
                    case StrategyCfgType.STRATEGY_CFG_TYPE_COMMAND:
                        let commandIdx = strategyKeyMap.commands.findIndex(item => { return data[iData].key === item.key; });
                        if (commandIdx >= 0) { // update
                            let iCol = this.kInitColumns + strategyKeyMap.comments1.length + commandIdx;
                            this.strategyTable.rows[iRow].cells[iCol].Text = this.langServ.get(data[iData].name);
                            this.strategyTable.rows[iRow].cells[iCol].Data = data[iData];
                            this.strategyTable.rows[iRow].cells[iCol].Disable = data[iData].value === 0;
                        }
                        break;
                }
            }
        }
    }

    strategyOnCellClick(cell: any, cellIdx: number, rowIdx: number) {
        console.info(cell);
        if (cell.Data && cell.Data.name === "submit") {  // submit
            let strategyKeyMap = this.strategyMap[this.strategyTable.rows[rowIdx].cells[0].Text];
            let paramIdx = this.kInitColumns + strategyKeyMap.comments1.length + strategyKeyMap.commands.length;
            let dvalue = 0;
            let cell;

            strategyKeyMap.parameters.forEach((item, idx) => {
                cell = this.strategyTable.rows[rowIdx].cells[idx + paramIdx];
                dvalue = Math.round(cell.Text * Math.pow(10, item.decimal));
                if (item.value !== dvalue) {
                    cell.Class = "default";
                    item.value = dvalue;
                    AppComponent.bgWorker.send({ command: "ss-send", params: { type: "strategy-param", data: [item] } });
                }
            });

            return;
        }

        if (cell.Data && cell.Data.name === "comment") {
            this.commentTable.rows.length = 0;

            this.strategyMap[this.strategyTable.rows[rowIdx].cells[0].Text].comments2.forEach(item => {
                let row = this.commentTable.newRow();
                row.cells[0].Text = this.langServ.get(item.name);
                row.cells[1].Text = (item.value / Math.pow(10, item.decimal)).toFixed(item.decimal);
            });

            Dialog.popup(this, this.commentContent, { title: this.langServ.get("Comment"), height: 450 });
            return;
        }

        let strategyId: number = this.strategyTable.rows[rowIdx].cells[0].Text;
        if (cell.Data === undefined || cell.Data.type !== StrategyCfgType.STRATEGY_CFG_TYPE_COMMAND)
            return;

        if (cell.Data.level > 9) {
            if (confirm("extute " + cell.Data.name + " ?"))
                AppComponent.bgWorker.send({ command: "ss-send", params: { type: "strategy-param", data: [cell.Data] } });
        } else {
            AppComponent.bgWorker.send({ command: "ss-send", params: { type: "strategy-param", data: [cell.Data] } });
        }
    }

    operateStrategy(strategyid: number, tip: number) {
        AppComponent.bgWorker.send({ command: "ss-send", params: { type: "strategy-cmd", data: { tip: tip, strategyid: strategyid } } });
    }

    updateBasketPosition(data: any) {
        if (data[0].account !== parseInt(this.dd_portfolioAccount.SelectedItem.Text))
            return;

        if (data[0].count === 0) {
            this.portfolioTable.rows.length = 0;
            this.portfolioCount.Text = 0;
            return;
        }

        let count = data[0].count;
        let row: DataTableRow;

        for (let iData = 0; iData < count; ++iData) {
            row = this.portfolioTable.rows.find(item => {
                return item.cells[0].Data === data[0].data[iData].UKey;
            });

            if (row === undefined) {
                row = this.portfolioTable.newRow();
                let codeInfo = this.secuinfo.getSecuinfoByInnerCode(data[0].data[iData].UKey);
                row.cells[0].Type = "checkbox";
                row.cells[0].Title = codeInfo.hasOwnProperty(data[0].data[iData].UKey) ? codeInfo[data[0].data[iData].UKey].SecuCode : "unknown";
                row.cells[0].Data = data[0].data[iData].UKey;
                row.cells[0].Text = false;
                row.cells[1].Text = codeInfo.hasOwnProperty(data[0].data[iData].UKey) ? codeInfo[data[0].data[iData].UKey].SecuAbbr : "unknown";
                row.cells[9].Type = "textbox";
                row.cells[9].Text = 0;
                row.cells[10].Type = "button";
                row.cells[10].Text = "Send";
                row.cells[11].Type = "button";
                row.cells[11].Text = "Cancel";
                row.cells[12].Text = "Normal";
                row.cells[12].Data = data[0].data[iData].Flag;
                this.setTradingFlag(row, row.cells[12].Data);
                ++this.portfolioCount.Text;
            }

            row.cells[2].Text = data[0].data[iData].InitPos;
            row.cells[3].Text = data[0].data[iData].TgtPos;
            row.cells[4].Text = data[0].data[iData].CurrPos;
            row.cells[5].Text = data[0].data[iData].Diff;
            row.cells[6].Text = data[0].data[iData].Traded;
            row.cells[7].Text = data[0].data[iData].Percentage / 100 + "%";
            row.cells[8].Text = data[0].data[iData].WorkingVol;

            row.cells[13].Text = data[0].data[iData].PreClose / 10000;
            row.cells[14].Text = data[0].data[iData].LastPrice / 10000;
            row.cells[15].Text = data[0].data[iData].BidSize;
            row.cells[16].Text = data[0].data[iData].BidPrice / 10000;
            row.cells[17].Text = data[0].data[iData].AskSize;
            row.cells[18].Text = data[0].data[iData].AskPrice / 10000;
            row.cells[19].Text = data[0].data[iData].AvgBuyPrice / 10000;
            row.cells[20].Text = data[0].data[iData].AvgSellPrice / 10000;
            row.cells[21].Text = data[0].data[iData].PreValue / 10000;
            row.cells[22].Text = data[0].data[iData].ValueCon / 10000;
            row.cells[23].Text = data[0].data[iData].DayPnLCon / 10000;
            row.cells[24].Text = data[0].data[iData].ONPnLCon / 10000;

            if (row.cells[12].Data === data[0].data[iData].Flag)
                continue;

            row.cells[12].Data = data[0].data[iData].Flag;
            this.setTradingFlag(row, row.cells[12].Data);
        }
    }

    updateBasketExt(data: any) {
        if (data[0].count === 0) {
            this.basketTable.rows.length = 0;
            return;
        }

        let count = data[0].count;
        let row: DataTableRow;

        for (let iData = 0; iData < count; ++iData) {
            row = this.basketTable.rows.find(item => {
                return item.cells[0].Data === data[0].data[iData].UKey;
            });

            if (row === undefined) {
                row = this.basketTable.newRow();
                let codeInfo = this.secuinfo.getSecuinfoByInnerCode(data[0].data[iData].UKey);
                row.cells[0].Type = "plaintext";
                row.cells[0].Data = data[0].data[iData].UKey;
                row.cells[0].Text = codeInfo.hasOwnProperty(data[0].data[iData].UKey) ? codeInfo[data[0].data[iData].UKey].SecuCode : "unknown";
                row.cells[1].Text = codeInfo.hasOwnProperty(data[0].data[iData].UKey) ? codeInfo[data[0].data[iData].UKey].SecuAbbr : "unknown";
                row.cells[9].Text = "Normal";
                row.cells[9].Data = data[0].data[iData].Flag;
                // this.setTradingFlag(row, row.cells[9].Data);
            }

            row.cells[2].Text = data[0].data[iData].InitPos;
            row.cells[3].Text = data[0].data[iData].TgtPos;
            row.cells[4].Text = data[0].data[iData].CurrPos;
            row.cells[5].Text = data[0].data[iData].Diff;
            row.cells[6].Text = data[0].data[iData].Traded;
            row.cells[7].Text = data[0].data[iData].Percentage / 100 + "%";
            row.cells[8].Text = data[0].data[iData].WorkingVol;

            row.cells[10].Text = data[0].data[iData].PreClose / 10000;
            row.cells[11].Text = data[0].data[iData].LastPrice / 10000;
            row.cells[12].Text = data[0].data[iData].BidSize;
            row.cells[13].Text = data[0].data[iData].BidPrice / 10000;
            row.cells[14].Text = data[0].data[iData].AskSize;
            row.cells[15].Text = data[0].data[iData].AskPrice / 10000;
            row.cells[16].Text = data[0].data[iData].AvgBuyPrice / 10000;
            row.cells[17].Text = data[0].data[iData].AvgSellPrice / 10000;
            row.cells[18].Text = data[0].data[iData].PreValue / 10000;
            row.cells[19].Text = data[0].data[iData].ValueCon / 10000;
            row.cells[20].Text = data[0].data[iData].DayPnLCon / 10000;
            row.cells[21].Text = data[0].data[iData].ONPnLCon / 10000;

            if (row.cells[9].Data === data[0].data[iData].Flag)
                continue;

            row.cells[9].Data = data[0].data[iData].Flag;
            // this.setTradingFlag(row, row.cells[9].Data);
        }
    }

    setTradingFlag(row: DataTableRow, flag: number) {
        // 0 check value ,10,11 disable,12 value, row backcolor
        switch (flag) {
            case 1:
                row.cells[9].ReadOnly = true;
                row.cells[0].Type = "plaintext";
                row.cells[0].Disable = true;
                row.cells[0].Text = row.cells[0].Title;
                row.cells[10].Disable = true;
                row.cells[11].Disable = true;
                row.cells[12].Text = "Suspended";
                row.backgroundColor = "#585757";
                break;
            case 2:
                row.cells[9].ReadOnly = true;
                row.cells[0].Type = "plaintext";
                row.cells[0].Disable = true;
                row.cells[0].Text = row.cells[0].Title;
                row.cells[10].Disable = true;
                row.cells[11].Disable = true;
                row.cells[12].Text = "Restrict";
                row.backgroundColor = "#585757";
                break;
            case 3:
                row.cells[0].Disable = false;
                row.cells[0].Text = false;
                row.cells[10].Disable = false;
                row.cells[11].Disable = false;
                row.cells[12].Text = "LimitUp";
                row.backgroundColor = "#790a0a";
                break;
            case 4:
                row.cells[0].Disable = false;
                row.cells[0].Text = false;
                row.cells[10].Disable = false;
                row.cells[11].Disable = false;
                row.cells[12].Text = "LimitDown";
                row.backgroundColor = "#4e7305";
                break;
            default:
                row.cells[0].Disable = false;
                row.cells[0].Text = false;
                row.cells[10].Disable = false;
                row.cells[11].Disable = false;
                row.cells[12].Text = "Normal";
                row.backgroundColor = null;
                break;
        }
    }

    showPortfolioSummary(data: any) {
        this.portfolioLabel.Text = data[0].value / 10000;
        this.portfolioDaypnl.Text = data[0].dayPnl / 10000;
        this.portfolioonpnl.Text = data[0].onPnl / 10000;
    }

    changeItems(type: number, check: boolean) {    // check if opposite
        let len = this.portfolioTable.rows.length;

        for (let i = 0; i < len; ++i) {

            switch (type) {
                case 0:
                    this.portfolioTable.rows[i].cells[0].Text = check;
                    break;
                case 1:
                    if (this.portfolioTable.rows[i].cells[5].Text > 0) {
                        if (typeof this.portfolioTable.rows[i].cells[0].Text === "boolean")
                            this.portfolioTable.rows[i].cells[0].Text = check;
                    }
                    break;
                case 2:
                    if (this.portfolioTable.rows[i].cells[5].Text < 0) {
                        if (typeof this.portfolioTable.rows[i].cells[0].Text === "boolean")
                            this.portfolioTable.rows[i].cells[0].Text = check;
                    }
                    break;
            }
        }
    }

    getSelectedPortfolioItem() {
        let res = [];
        let len = this.portfolioTable.rows.length;

        for (let i = 0; i < len; ++i) {
            if (this.portfolioTable.rows[i].cells[0].Text === true)
                res.push(this.portfolioTable.rows[i].cells[0].Data);
        }

        return res;
    }

    applyStrateTableConfig() {
        this.configTable.rows.forEach(row => {
            let idx = this.option.config["strategy_table"].columnHideIDs.indexOf(row.cells[0].Data);
            if (!row.cells[0].Text && idx < 0) {
                this.option.config["strategy_table"].columnHideIDs.push(row.cells[0].Data);
            } else if (row.cells[0].Text && idx >= 0) {
                this.option.config["strategy_table"].columnHideIDs.splice(idx, 1);
            }
        });

        let fstStrategy = this.strategyMap[this.strategyTable.rows[0].cells[0].Text];
        let iCol = this.kInitColumns;
        for (let i = 0; i < fstStrategy.comments1.length; ++i) {
            this.strategyTable.columns[iCol].hidden = this.option.config["strategy_table"].columnHideIDs.includes(this.strategyTable.columns[iCol].key);
        }

        iCol += fstStrategy.commands.length;
        for (let i = 0; i < fstStrategy.parameters.length; ++i) {
            this.strategyTable.columns[iCol].hidden = this.option.config["strategy_table"].columnHideIDs.includes(this.strategyTable.columns[iCol].key);
        }
    }

    createBookView(bookviewID) {
        let bookviewPage = new TabPage(bookviewID, this.langServ.get("BookView"));
        this.pageMap[bookviewID] = bookviewPage;

        let row1 = new HBox();
        let dd_symbol = new DropDown();
        dd_symbol.AcceptInput = true;
        dd_symbol.Title = this.langServ.get("Code") + ": ";
        let code = null;

        if (this.appStorage && this.appStorage.bookView && this.appStorage.bookView.hasOwnProperty(bookviewID)) {
            code = this.appStorage.bookView[bookviewID].code;
            if (code !== null) {
                let codeInfo = this.secuinfo.getSecuinfoByUKey(code);
                dd_symbol.Text = codeInfo[code].SecuCode;
                dd_symbol.SelectedItem = { Text: codeInfo[code].symbolCode, Value: codeInfo[code].InnerCode + "," + codeInfo[code].SecuCode + "," + codeInfo[code].ukey };
            }
        }

        row1.addChild(dd_symbol);

        let row2 = new HBox();
        let lbl_timestamp = new Label();
        lbl_timestamp.Title = this.langServ.get("Timestamp") + ": ";
        row2.addChild(lbl_timestamp);

        let bookViewTable = new DataTable("table2");
        bookViewTable.RowIndex = false;
        bookViewTable.align = "right";
        ["BidVol", "Price", "AskVol", "TransVol"].forEach(item => { bookViewTable.addColumn(this.langServ.get(item)); });
        bookViewTable.columns[3].hidden = true;

        for (let i = 0; i < 20; ++i) {
            let row = bookViewTable.newRow();
            row.cells[0].bgColor = "#247094";
            row.cells[0].Text = "";
            row.cells[1].Text = "0.0000";
            row.cells[1].bgColor = "rgb(216, 212, 214)";
            row.cells[1].Color = "#333";
            row.cells[2].bgColor = "#ac2220";
            row.cells[3].bgColor = "transparent";
        }

        this.bookviewArr.push({ id: bookviewID, code: code, table: bookViewTable, lbl_timestamp: lbl_timestamp });

        dd_symbol.SelectChange = () => {
            this.clearBookViewTable(bookViewTable);
            // bind bookivewID, and subscribe code
            let kwlist = [];
            let ukey = parseInt(dd_symbol.SelectedItem.Value.split(",")[2]);

            for (let i = 0; i < this.bookviewArr.length; ++i) {
                if (this.bookviewArr[i].id === bookviewID) {
                    this.bookviewArr[i].code = ukey;
                }

                if (this.bookviewArr[i].code === null) {
                    continue;
                }

                if (!kwlist.includes(this.bookviewArr[i].code)) {
                    kwlist.push(this.bookviewArr[i].code);
                }
            }

            this.subscribeMarketData(kwlist);
            kwlist = null;
        };

        dd_symbol.matchMethod = (inputText) => {
            let codes = this.secuinfo.getCodeList(inputText.toLocaleUpperCase());
            let rtnArr = [];

            dd_symbol.Items.length = 0;
            for (let i = 0; i < codes.length; ++i) {
                if (codes[i].SecuAbbr === codes[i].symbolCode)
                    rtnArr.push({ Text: codes[i].symbolCode, Value: codes[i].code + "," + codes[i].symbolCode + "," + codes[i].ukey });
                else
                    rtnArr.push({ Text: codes[i].symbolCode + " " + codes[i].SecuAbbr, Value: codes[i].code + "," + codes[i].symbolCode + "," + codes[i].ukey });
            }

            return rtnArr;
        };

        bookViewTable.onCellDBClick = (cellItem, cellIdx, rowIndex) => {
            if (dd_symbol.SelectedItem !== null) {
                let rowItem = bookViewTable.rows[rowIndex];
                [this.txt_UKey.Text, this.txt_Symbol.Text] = dd_symbol.SelectedItem.Value.split(",");
                this.txt_Price.Text = rowItem.cells[1].Text;
                // this.dd_Action.SelectedItem = (rowItem.cells[0].Text === "") ? this.dd_Action.Items[1] : this.dd_Action.Items[0];
                switch (cellIdx) {
                    case 0:
                        this.dd_Action.SelectedItem = this.dd_Action.Items[0];
                        break;
                    case 1:
                        this.dd_Action.SelectedItem = rowIndex < 10 ? this.dd_Action.Items[1] : this.dd_Action.Items[0];
                        break;
                    case 2:
                        this.dd_Action.SelectedItem = this.dd_Action.Items[1];
                        break;
                }
            }

            Dialog.popup(this, this.tradeContent, { title: this.langServ.get("Trade"), height: 300 });
        };

        let bookViewContent = new VBox();
        bookViewContent.addChild(row1).addChild(row2);
        bookViewContent.addChild(bookViewTable);
        bookviewPage.setContent(bookViewContent);
        return bookviewPage;
    }

    clearBookViewTable(bookViewTable) {
        let len = bookViewTable.rows.length;
        for (let i = 0; i < len; ++i) {
            bookViewTable.rows[i].cells[0].Text = "";
            bookViewTable.rows[i].cells[1].Text = "0.0000";
            bookViewTable.rows[i].cells[2].Text = "";
        }
    }

    subscribeMarketData(codes: any) {
        AppComponent.bgWorker.send({ command: "ps-send", params: { appid: 17, packid: 101, msg: { topic: 3112, kwlist: codes } } });
    }

    onDestroy() {
        AppComponent.bgWorker.dispose();
        this.appStorage = { bookView: {} };
        this.bookviewArr.forEach(item => {
            this.appStorage.bookView[item.id] = { code: item.code };
        });

        AppStoreService.setLocalStorageItem(this.option.name, JSON.stringify(this.appStorage));
        File.writeSync(`${Environment.getDataPath(this.option.name, "StrategyTrader")}/layout.json`, this.main.getLayout());
        File.writeSync(`${Environment.getDataPath(this.option.name, "StrategyTrader")}/config.json`, this.option.config);
    }

    onResize(event: any) {
        // minus 10 to remove the window's border.
        this.main.reallocSize(event.currentTarget.document.body.clientWidth - 10, event.currentTarget.document.body.clientHeight - 27);
        this.ref.detectChanges();
    }

    createBackgroundWork() {
        AppComponent.bgWorker.onData = data => {
            console.info(data.event);
            switch (data.event) {
                case "ps-data":
                    for (let idx = 0; idx < this.bookviewArr.length; ++idx) {
                        if (this.bookviewArr[idx].code === data.content.content.ukey) {
                            this.bookviewArr[idx].lbl_timestamp.Text = new Date(data.content.content.time * 1000).format("yyyy/MM/dd HH:mm:ss");
                            for (let i = 0; i < 10; ++i) {
                                this.bookviewArr[idx].table.rows[i + 10].cells[0].Text = data.content.content.bid_volume[i] + "";
                                this.bookviewArr[idx].table.rows[i + 10].cells[1].Text = (data.content.content.bid_price[i] / 10000).toFixed(4);
                                this.bookviewArr[idx].table.rows[9 - i].cells[2].Text = data.content.content.ask_volume[i] + "";
                                this.bookviewArr[idx].table.rows[9 - i].cells[1].Text = (data.content.content.ask_price[i] / 10000).toFixed(4);
                            }
                        }
                    }
                    break;
                case "ps-connect":
                    this.addStatus(true, "PS");
                    break;
                case "ps-close":
                    this.addStatus(false, "PS");
                    break;
                case "ss-connect":
                    this.addStatus(true, "SS");
                    break;
                case "ss-close":
                    this.addStatus(false, "SS");
                    break;
                case "ss-data":
                    let item = data.content;
                    // console.info(`ss-data: type=${data.content.type}, len=${data.content.data.length}`);
                    let timer = Date.now();
                    // data.content.forEach(item => {
                    console.info(`ss-data: type=${item.type}`);
                    switch (item.type) {
                        case 2011:
                        case 2033:
                            this.showStrategyInfo(item.data);
                            break;
                        case 2029:
                            this.showStrategyCfg(item.data);
                            break;
                        case 2032:
                            this.updateStrategyCfg(item.data);
                            break;
                        case 2031:
                        case 2050:
                        case 2001:
                        case 2003:
                        case 2005:
                            this.showGuiCmdAck(item);
                            break;
                        case 2048:
                            this.showComTotalProfitInfo(item.data);
                            break;
                        case 2013:
                            this.showComAccountPos(item.data);
                            break;
                        case 3502:
                        case 3504:
                            this.showComRecordPos(item.data);
                            break;
                        case 2015:
                        case 2017:
                            this.showComGWNetGuiInfo(item.data);
                            break;
                        case 2023:
                            this.showComProfitInfo(item.data);
                            break;
                        case 2025:
                            this.showStatArbOrder(item);
                            break;
                        case 2021:
                            this.showComorderstatusAndErrorInfo(item.data);
                            break;
                        case 2022:
                        case 3011:
                        case 3510:
                            this.showComOrderRecord(item.data);
                            break;
                        case 2040:
                        case 5022:
                            this.showLog(item.data);
                            break;
                        case 5021:
                            this.updateBasketPosition(item.data);
                            break;
                        case 5031:
                            this.updateBasketExt(item.data);
                            break;
                        case 5024:
                            this.showPortfolioSummary(item.data);
                            break;
                        case 8000:
                            this.changeSSstatus(item.data);
                            break;
                        default:
                            console.error(`unhandled type=${item.type}`);
                            break;
                    }
                    // });

                    console.debug(`elapsed time: ${Date.now() - timer}`);
                    break;
                default:
                    console.info(`unhandled type ${data.event}`);
                    break;
            }
        };
    }
}
