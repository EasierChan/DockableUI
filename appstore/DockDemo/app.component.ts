/**
 * created by cl, 2017/02/28
 * update: [date]
 * desc:
 */

import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from "@angular/core";
import { WorkerFactory } from "../../base/api/services/uworker.server";
import {
    Control, DockContainer, Splitter, TabPanel, TabPage, URange, Dialog, Label,
    DataTable, DataTableRow, DataTableColumn, DropDown, StatusBar, StatusBarItem,
    HBox, Button, CheckBox, TextBox, VBox, MetaControl
} from "../../base/controls/control";
import {
    MessageBox, fs, AppStateCheckerRef, File, Environment,
    SecuMasterService, TranslateService, AppStoreService
} from "../../base/api/services/backend.service";
import {
    EOrderType, AlphaSignalInfo, SECU_MARKET, EOrderStatus,
    EStrategyStatus, StrategyCfgType, ComConOrder, ComOrderCancel,
    ComOrder
} from "../../base/api/model/itrade/strategy.model";

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
export class AppComponent implements OnInit, AfterViewInit {
    private readonly apptype = "trade";
    private main: DockContainer;
    private modules: Object = new Object();
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
    private allChk: MetaControl;
    private range: URange;
    private rateText: MetaControl;
    private dd_Account: DropDown;
    private portfolio_acc: DropDown;
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
    // private bookviewObj = { bookview: 0, code: "" };
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
        AppComponent.bgWorker = WorkerFactory.createWorker(`${__dirname}/bll/tradeWorker`, Environment.getDataPath(this.option.name));
        TabPanel.afterAnyPageClosed = this.onTabPageClosed;
    }

    onTabPageClosed(pageid: string) {
        let len = AppComponent.self.bookviewArr.length;
        let tempCodeList = [];
        for (let i = 0; i < len; ++i) {
            let code = AppComponent.self.bookviewArr[i].code;
            if (AppComponent.self.bookviewArr[i].bookview === pageid) {
                AppComponent.self.bookviewArr.splice(i, 1);
            } else {
                tempCodeList.push(parseInt(code));
            }
        }

        AppComponent.self.subscribeMarketData(tempCodeList);
        AppComponent.self.statechecker.changeMenuItemState(pageid, false, 2);
    }

    onMenuItemClick(item) {
        let label = item.label as string;
        if (label.endsWith("New BookView")) {
            let newBVID = "BookView" + AppComponent.bookViewSN++;
            while (AppComponent.self.modules.hasOwnProperty(newBVID)) {
                newBVID = "BookView" + AppComponent.bookViewSN++;
            }

            AppComponent.self.createBookView(newBVID);
            let panel = AppComponent.self.main.getFirstChildPanel();
            if (panel === null) {
                console.error("not found a panel to locate a tabpage.");
                return;
            }

            if (AppComponent.self.modules.hasOwnProperty(newBVID)) {
                panel.addTab(AppComponent.self.modules[newBVID]);
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

            if (AppComponent.self.modules.hasOwnProperty(item.label)) {
                panel.addTab(AppComponent.self.modules[item.label]);
                panel.setActive(item.label);
            }
        }
    }

    onReady(option: any) {
        this.option = option;
    }

    ngOnInit(): void {
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

        this.strategyMap = {};
        this.tradeEndpoint = setting.endpoints[0].trade_addr.split(":");
        this.quoteEndpoint = setting.endpoints[0].quote_addr.split(":");

        this.statusbar = new StatusBar();
        let order = "OrderStatus";
        this.orderstatusPage = new TabPage(order, this.langServ.getTranslateInfo(this.languageType, order));
        this.modules["OrderStatus"] = this.orderstatusPage;
        let orderstatusContent = new VBox();

        let orderstatusHeader = new HBox();
        let cb_handle = new CheckBox();
        cb_handle.Text = true;
        let handle = "Handle";
        let rtnHandle = this.langServ.getTranslateInfo(this.languageType, handle);
        cb_handle.Title = rtnHandle;
        orderstatusHeader.addChild(cb_handle);
        let dd_status = new DropDown();
        dd_status.Left = 10;
        dd_status.addItem({ Text: "all    ", Value: "-1" });
        dd_status.addItem({ Text: "0.无效", Value: "0" });
        dd_status.addItem({ Text: "1.未报", Value: "1" });
        dd_status.addItem({ Text: "2.待报", Value: "2" });
        dd_status.addItem({ Text: "3.已报", Value: "3" });
        dd_status.addItem({ Text: "4.已报待撤", Value: "4" });
        dd_status.addItem({ Text: "5.部成待撤", Value: "5" });
        dd_status.addItem({ Text: "6.部撤", Value: "6" });
        dd_status.addItem({ Text: "7.已撤", Value: "7" });
        dd_status.addItem({ Text: "8.部成", Value: "8" });
        dd_status.addItem({ Text: "9.已成", Value: "9" });
        dd_status.addItem({ Text: "10.废单", Value: "10" });
        orderstatusHeader.addChild(dd_status);

        let cb_SelAll = new CheckBox();
        cb_SelAll.Left = 10;
        cb_SelAll.Text = false;
        cb_SelAll.Title = this.langServ.getTranslateInfo(this.languageType, "All");
        orderstatusHeader.addChild(cb_SelAll);
        cb_SelAll.OnClick = () => {
            for (let i = 0; i < this.orderstatusTable.rows.length; ++i) {
                if (!this.orderstatusTable.rows[i].cells[0].Disable)
                    if (!cb_SelAll.Text)
                        this.orderstatusTable.rows[i].cells[0].Text = true;
                    else
                        this.orderstatusTable.rows[i].cells[0].Text = false;
            }
        };

        let btn_cancel = new Button();
        btn_cancel.Left = 10;
        let cancel = "CancelSelected";
        let rtnCancel = this.langServ.getTranslateInfo(this.languageType, cancel);
        btn_cancel.Text = rtnCancel;
        orderstatusHeader.addChild(btn_cancel);
        orderstatusContent.addChild(orderstatusHeader);
        cb_SelAll.Disable = dd_status.Disable = btn_cancel.Disable = false;
        cb_handle.OnClick = () => {
            cb_SelAll.Disable = dd_status.Disable = btn_cancel.Disable = cb_handle.Text;
        };
        dd_status.SelectChange = (item) => {
            for (let i = 0; i < this.orderstatusTable.rows.length; ++i) {
                if (dd_status.SelectedItem.Value === "-1") {   // all
                    AppComponent.self.orderstatusTable.rows[i].hidden = false;
                }
                else {
                    if (AppComponent.self.orderstatusTable.rows[i].cells[10].Text === dd_status.SelectedItem.Text) {
                        AppComponent.self.orderstatusTable.rows[i].hidden = false;
                    }
                    else
                        AppComponent.self.orderstatusTable.rows[i].hidden = true;
                }
            }
        };

        btn_cancel.OnClick = () => {
            for (let i = 0; i < this.orderstatusTable.rows.length; ++i) {
                let getStatus = parseInt(this.orderstatusTable.rows[i].cells[10].Data);
                let strategyid = this.orderstatusTable.rows[i].cells[5].Text;
                let ukey = this.orderstatusTable.rows[i].cells[1].Text;
                let orderid = this.orderstatusTable.rows[i].cells[3].Text;
                let account = this.orderstatusTable.rows[i].cells[11].Text;
                let date = new Date();
                if (getStatus === 0 || getStatus === 6 || getStatus === 7 || getStatus === 9 || getStatus === 10)
                    continue;
                else if (!AppComponent.self.orderstatusTable.rows[i].cells[0].Text)
                    continue;
                else {
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
            }
        };

        this.orderstatusTable = new DataTable("table2");
        let orderstatusArr: string[] = ["Check", "U-Key", "SymbolCode", "OrderId", "Time", "Strategy",
            "Ask/Bid", "Price", "OrderVol", "DoneVol", "Status", "Account"];
        let orderstatusTableRtnArr: string[] = [];
        let orderstatusTableTitleLen = orderstatusArr.length;
        for (let i = 0; i < orderstatusTableTitleLen; ++i) {
            let orderstatusRtn = this.langServ.getTranslateInfo(this.languageType, orderstatusArr[i]);
            orderstatusTableRtnArr.push(orderstatusRtn);
        }
        orderstatusTableRtnArr.forEach(item => {
            this.orderstatusTable.addColumn2(new DataTableColumn(item, false, true));
        });
        this.orderstatusTable.columnConfigurable = true;
        orderstatusContent.addChild(this.orderstatusTable);
        this.orderstatusPage.setContent(orderstatusContent);
        this.doneOrdersPage = new TabPage("DoneOrders", this.langServ.getTranslateInfo(this.languageType, "DoneOrders"));
        this.modules["DoneOrders"] = this.doneOrdersPage;
        let doneOrdersContent = new VBox();
        this.doneOrdersTable = new DataTable("table2");
        let doneorderTableArr: string[] = ["U-Key", "Symbol", "OrderId", "Strategy",
            "Ask/Bid", "Price", "DoneVol", "Status", "Time", "OrderVol", "OrderType", "Account", "OrderTime",
            "OrderPrice", "SymbolCode"];
        let doneOrderTableRtnArr: string[] = [];
        let doneOrderTableTittleLen = doneorderTableArr.length;
        for (let i = 0; i < doneOrderTableTittleLen; ++i) {
            let doneOrderRtn = this.langServ.getTranslateInfo(this.languageType, doneorderTableArr[i]);
            doneOrderTableRtnArr.push(doneOrderRtn);
        }
        doneOrderTableRtnArr.forEach(item => {
            this.doneOrdersTable.addColumn2(new DataTableColumn(item, false, true));
        });
        this.doneOrdersTable.columnConfigurable = true;
        doneOrdersContent.addChild(this.doneOrdersTable);
        this.doneOrdersPage.setContent(doneOrdersContent);


        this.accountPage = new TabPage("Account", this.langServ.getTranslateInfo(this.languageType, "Account"));
        this.modules["Account"] = this.accountPage;
        let accountContent = new VBox();
        this.accountTable = new DataTable("table");
        let accountTableArr: string[] = ["Account", "Secucategory", "TotalAmount", "AvlAmount", "FrzAmount", "Date", "Currency",
            "ShangHai", "ShenZhen", "BuyFrzAmt", "SellFrzAmt", "Buymargin", "SellMargin", "TotalMargin", "Fee",
            "PositionPL", "ClosePL"];
        let accountTableRtnArr: string[] = [];
        let accountTableTittleLen = accountTableArr.length;
        for (let i = 0; i < accountTableTittleLen; ++i) {
            let accountRtn = this.langServ.getTranslateInfo(this.languageType, accountTableArr[i]);
            accountTableRtnArr.push(accountRtn);
        }
        accountTableRtnArr.forEach(item => {
            this.accountTable.addColumn(item);
        });
        this.accountTable.columnConfigurable = true;
        accountContent.addChild(this.accountTable);
        this.accountPage.setContent(accountContent);

        this.positionPage = new TabPage("Position", this.langServ.getTranslateInfo(this.languageType, "Position"));
        this.modules["Position"] = this.positionPage;
        let positionContent = new VBox();
        this.positionTable = new DataTable("table2");
        let positionTableArr: string[] = ["Account", "secucategory", "U-Key", "Code", "TotalQty", "AvlQty", "AvlCreRedempVol", "WorkingQty",
            "TotalCost", "TodayOpen", "AvgPrice", "StrategyID", "Type"];
        let positionTableRtnArr: string[] = [];
        let positionTableTittleLen = positionTableArr.length;
        for (let i = 0; i < positionTableTittleLen; ++i) {
            let positionRtn = this.langServ.getTranslateInfo(this.languageType, positionTableArr[i]);
            positionTableRtnArr.push(positionRtn);
        }
        positionTableRtnArr.forEach(item => {
            this.positionTable.addColumn(item);
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
            let tradeRtn = this.langServ.getTranslateInfo(this.languageType, "Trade");
            Dialog.popup(this, this.tradeContent, { title: tradeRtn, height: 300 });
        };
        let leftAlign = 20;
        let rowSep = 5;
        this.tradePage = new TabPage("ManulTrader", this.langServ.getTranslateInfo(this.languageType, "ManulTrader"));
        this.tradeContent = new VBox();
        this.tradeContent.MinHeight = 500;
        this.tradeContent.MinWidth = 500;

        let account_firrow = new HBox();
        this.dd_Account = new DropDown();
        this.dd_Account.Width = 120;
        let dd_accountRtn = this.langServ.getTranslateInfo(this.languageType, "Account");
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
        this.tradeContent.addChild(account_firrow);

        let strategy_secrow = new HBox();
        let dd_strategyRtn = this.langServ.getTranslateInfo(this.languageType, "Strategy");
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
        this.tradeContent.addChild(strategy_secrow);

        let action_sevenrow = new HBox();
        let dd_ActionRtn = this.langServ.getTranslateInfo(this.languageType, "Action");
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
        let buyRtn = this.langServ.getTranslateInfo(this.languageType, "Buy");
        let sellRtn = this.langServ.getTranslateInfo(this.languageType, "Sell");
        this.dd_Action.addItem({ Text: buyRtn, Value: 0 });
        this.dd_Action.addItem({ Text: sellRtn, Value: 1 });
        action_sevenrow.top = 5;
        action_sevenrow.addChild(action_label).addChild(this.dd_Action);
        this.tradeContent.addChild(action_sevenrow);

        let symbol_thirdrow = new HBox();
        let txt_symbolRtn = this.langServ.getTranslateInfo(this.languageType, "Symbol");
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
        this.tradeContent.addChild(symbol_thirdrow);

        let ukey_fourthrow = new HBox();
        let txt_UKeyRtn = this.langServ.getTranslateInfo(this.languageType, "U-key");
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
        this.tradeContent.addChild(ukey_fourthrow);

        let price_fifthrow = new HBox();
        let txt_PriceRtn = this.langServ.getTranslateInfo(this.languageType, "Price");
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
        this.tradeContent.addChild(price_fifthrow);

        let volume_sixrow = new HBox();
        let txt_VolumeRtn = this.langServ.getTranslateInfo(this.languageType, "Volume");
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
        this.tradeContent.addChild(volume_sixrow);

        let btn_row = new HBox();
        let btn_clear = new Button();
        btn_clear.Left = leftAlign;
        let clearRtn = this.langServ.getTranslateInfo(this.languageType, "Clear");
        btn_clear.Text = clearRtn;
        btn_row.addChild(btn_clear);
        let btn_submit = new Button();
        btn_submit.Left = 50;
        let SubmitRtn = this.langServ.getTranslateInfo(this.languageType, "Submit");
        btn_submit.Text = SubmitRtn;
        btn_clear.Class = btn_submit.Class = "primary";
        btn_row.top = 10;
        btn_row.left = 50;
        btn_row.addChild(btn_submit);
        this.tradeContent.addChild(btn_row);
        this.tradePage.setContent(this.tradeContent);

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

        this.commentPage = new TabPage("Comment", this.langServ.getTranslateInfo(this.languageType, "Comment"));
        this.commentContent = new VBox();
        this.commentTable = new DataTable("table2");
        this.commentTable.height = 400;

        let commentTableArr: string[] = ["Key", "Value"];
        let commentTableRtnArr: string[] = [];
        for (let i = 0; i < commentTableArr.length; ++i) {
            let commentRtn = this.langServ.getTranslateInfo(this.languageType, commentTableArr[i]);
            commentTableRtnArr.push(commentRtn);
        }
        commentTableRtnArr.forEach(item => {
            this.commentTable.addColumn(item);
        });
        this.commentTable.columnConfigurable = true;
        this.commentContent.addChild(this.commentTable);
        this.commentPage.setContent(this.commentContent);

        this.configPage = new TabPage("ParameterConfig", this.langServ.getTranslateInfo(this.languageType, "ParameterConfig"));
        this.configContent = new VBox();
        let configHeader = new HBox();
        let checkall = new CheckBox();
        checkall.Title = this.langServ.getTranslateInfo(this.languageType, "Check");
        let btn_apply = new Button();
        btn_apply.Left = 200;
        btn_apply.Text = "应用";
        btn_apply.Class = "primary";
        btn_apply.OnClick = () => { this.applyStrateTableConfig(); };
        configHeader.addChild(checkall).addChild(btn_apply);
        this.configTable = new DataTable("table2");
        this.configTable.height = 390;
        this.configTable.addColumn(this.langServ.getTranslateInfo(this.languageType, "parameter"));
        this.configTable.columnConfigurable = true;
        this.configContent.addChild(configHeader).addChild(this.configTable);
        this.configPage.setContent(this.configContent);
        checkall.OnClick = () => { this.configTable.rows.forEach(item => { item.cells[0].Text = !checkall.Text; }); };

        this.gatewayPage = new TabPage("GateWay", this.langServ.getTranslateInfo(this.languageType, "Gateway"));
        this.gatewayContent = new VBox();
        this.gatewayTable = new DataTable("table2");
        this.gatewayTable.height = 300;
        this.gatewayTable.addColumn(this.langServ.getTranslateInfo(this.languageType, "name"));
        this.gatewayTable.addColumn(this.langServ.getTranslateInfo(this.languageType, "status"));
        this.gatewayTable.columnConfigurable = true;
        this.gatewayContent.addChild(this.gatewayTable);
        this.gatewayPage.setContent(this.gatewayContent);

        this.bookviewPage = new TabPage("BookView", this.langServ.getTranslateInfo(this.languageType, "BookView"));
        this.createBookView("BookView");

        this.logPage = new TabPage("Log", this.langServ.getTranslateInfo(this.languageType, "LOG"));
        this.modules["Log"] = this.logPage;
        let logContent = new VBox();
        this.logTable = new DataTable("table2");

        let logTimeTittleRtn = this.langServ.getTranslateInfo(this.languageType, "Time");
        let logContentTittleRtn = this.langServ.getTranslateInfo(this.languageType, "Content");
        this.logTable.addColumn(logTimeTittleRtn);
        this.logTable.addColumn(logContentTittleRtn);
        logContent.addChild(this.logTable);
        this.logPage.setContent(logContent);

        this.statarbPage = new TabPage("StatArb", this.langServ.getTranslateInfo(this.languageType, "StatArb"));
        this.modules["StatArb"] = this.statarbPage;
        let statarbLeftAlign = 20;
        let statarbHeader = new HBox();
        this.buyamountLabel = new MetaControl("textbox");
        this.buyamountLabel.Left = statarbLeftAlign;
        this.buyamountLabel.Width = 90;
        this.buyamountLabel.Text = "0";

        this.buyamountLabel.Title = this.langServ.getTranslateInfo(this.languageType, "BUY.AMOUNT") + ":";
        this.buyamountLabel.Disable = true;
        this.sellamountLabel = new MetaControl("textbox");
        this.sellamountLabel.Left = statarbLeftAlign;
        this.sellamountLabel.Width = 90;
        this.sellamountLabel.Title = this.langServ.getTranslateInfo(this.languageType, "SELL.AMOUNT") + ":";
        this.sellamountLabel.Disable = true;
        this.sellamountLabel.Text = "0";
        statarbHeader.addChild(this.buyamountLabel).addChild(this.sellamountLabel);
        this.statarbTable = new DataTable("table2");
        let statarbTablearr: string[] = ["Symbol", "InnerCode", "Change(%)", "Position",
            "Trade", "Amount", "StrategyID", "DiffQty", "SymbolCode"];
        let statarbTableRtnarr: string[] = [];
        let statarbTableTitleLen = statarbTablearr.length;
        for (let i = 0; i < statarbTableTitleLen; ++i) {
            let statarbRtn = this.langServ.getTranslateInfo(this.languageType, statarbTablearr[i]);
            statarbTableRtnarr.push(statarbRtn);
        }
        statarbTableRtnarr.forEach(item => {
            this.statarbTable.addColumn2(new DataTableColumn(item, false, true));
        });

        this.statarbTable.columnConfigurable = true;
        let statarbContent = new VBox();
        statarbContent.addChild(statarbHeader);
        statarbContent.addChild(this.statarbTable);
        this.statarbPage.setContent(statarbContent);

        this.portfolioPage = new TabPage("Portfolio", this.langServ.getTranslateInfo(this.languageType, "Portfolio"));
        this.modules["Portfolio"] = this.portfolioPage;
        let loadItem = new HBox();

        this.portfolio_acc = new DropDown();
        this.portfolio_acc.Width = 110;
        this.portfolio_acc.Left = statarbLeftAlign;
        let accountRtn = this.langServ.getTranslateInfo(this.languageType, "Account");
        this.portfolio_acc.Title = accountRtn + ": ";


        this.portfolioLabel = new MetaControl("textbox");
        this.portfolioLabel.Width = 60;
        let portfoliovalueRtn = this.langServ.getTranslateInfo(this.languageType, "PORTFOLIOValue");
        if (portfoliovalueRtn === "PORTFOLIOValue")
            this.portfolioLabel.Title = "PORTFOLIO Value:";
        else
            this.portfolioLabel.Title = portfoliovalueRtn + ":";
        this.portfolioLabel.Left = 20;
        this.portfolioLabel.Disable = true;

        this.portfolioDaypnl = new MetaControl("textbox");
        this.portfolioDaypnl.Width = 60;
        let portfolioDaypnlRtn = this.langServ.getTranslateInfo(this.languageType, "PORTFOLIODaypnl");
        if (portfolioDaypnlRtn === "PORTFOLIODaypnl")
            this.portfolioDaypnl.Title = "PORTFOLIO Day pnl:";
        else
            this.portfolioDaypnl.Title = portfolioDaypnlRtn + ":";
        this.portfolioDaypnl.Left = 20;
        this.portfolioDaypnl.Disable = true;

        this.portfolioonpnl = new MetaControl("textbox");
        this.portfolioonpnl.Width = 60;
        let portfolioonpnlRtn = this.langServ.getTranslateInfo(this.languageType, "PORTFOLIOO/NPnl");
        if (portfolioonpnlRtn === "PORTFOLIOO/NPnl")
            this.portfolioonpnl.Title = "PORTFOLIO O/N Pnl:";
        else
            this.portfolioonpnl.Title = portfolioonpnlRtn + ":";
        this.portfolioonpnl.Left = 20;
        this.portfolioonpnl.Disable = true;

        this.portfolioCount = new MetaControl("textbox");
        this.portfolioCount.Width = 50;
        let portfolioCountRtn = this.langServ.getTranslateInfo(this.languageType, "Count");
        this.portfolioCount.Title = portfolioCountRtn + ":";
        this.portfolioCount.Left = 20;
        this.portfolioCount.Disable = true;

        let btn_load = new Button();
        let btn_loadRtn = this.langServ.getTranslateInfo(this.languageType, "LoadCSV");
        if (btn_loadRtn === "LoadCSV")
            btn_load.Text = " Load    CSV ";
        else
            btn_load.Text = btn_loadRtn + "     ";
        btn_load.Left = 20;
        btn_load.Class = "primary";

        loadItem.addChild(this.portfolio_acc).addChild(this.portfolioLabel)
            .addChild(this.portfolioDaypnl).addChild(this.portfolioonpnl).addChild(this.portfolioCount).addChild(btn_load);

        let tradeitem = new HBox();
        this.portfolioBuyCom = new DropDown();
        this.portfolioBuyCom.Width = 59;
        this.portfolioBuyCom.Left = 20;

        this.portfolioBuyCom.Title = this.langServ.getTranslateInfo(this.languageType, "Buy") + ": ";
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

        this.portfolioSellCom = new DropDown();
        this.portfolioSellCom.Width = 62;
        this.portfolioSellCom.Left = 20;
        this.portfolioSellCom.Title = this.langServ.getTranslateInfo(this.languageType, "Sell") + ":";
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

        this.allChk = new CheckBox(); this.allChk.Width = 30;
        this.allChk.Title = " " + this.langServ.getTranslateInfo(this.languageType, "All");
        this.allChk.Text = false; this.allChk.Left = 22;
        let allbuyChk = new CheckBox(); allbuyChk.Width = 30;
        allbuyChk.Title = " " + this.langServ.getTranslateInfo(this.languageType, "All-Buy");
        allbuyChk.Text = false; allbuyChk.Left = 20;
        let allsellChk = new CheckBox(); allsellChk.Width = 30;
        allsellChk.Title = " " + this.langServ.getTranslateInfo(this.languageType, "All-Sell");
        allsellChk.Text = false; allsellChk.Left = 20;

        this.range = new URange(); this.range.Width = 168; this.range.Left = 20;
        let orderRateRtn = this.langServ.getTranslateInfo(this.languageType, "orderrate");
        if (orderRateRtn === "orderrate")
            this.range.Title = "Order Rate:";
        else
            this.range.Title = orderRateRtn + ":";
        this.rateText = new MetaControl("textbox"); this.rateText.Width = 35; this.rateText.Title = ""; this.rateText.Left = 5;
        let percentText = new MetaControl("plaintext"); percentText.Title = "%"; percentText.Width = 15;

        this.range.Text = 0; this.rateText.Text = 0;

        let btn_sendSel = new Button();
        let sendSelRtn = this.langServ.getTranslateInfo(this.languageType, "sendselected");

        if (sendSelRtn === "sendselected")
            btn_sendSel.Text = "Send Selected";
        else
            btn_sendSel.Text = sendSelRtn;

        btn_sendSel.Left = 20;
        btn_sendSel.Class = "primary";
        let btn_cancelSel = new Button();
        let cancelSelRtn = this.langServ.getTranslateInfo(this.languageType, "cancelselected");
        if (cancelSelRtn === "cancelselected")
            btn_cancelSel.Text = "Cancel Selected";
        else
            btn_cancelSel.Text = cancelSelRtn;
        btn_cancelSel.Left = 20; btn_cancelSel.Class = "primary";

        tradeitem.addChild(this.portfolioBuyCom).addChild(this.portfolioBUyOffset).addChild(this.portfolioSellCom).addChild(this.portfolioSellOffset).addChild(this.allChk).addChild(allbuyChk)
            .addChild(allsellChk).addChild(this.range).addChild(this.rateText).addChild(percentText).addChild(btn_sendSel).addChild(btn_cancelSel);

        this.portfolioTable = new DataTable("table2");
        let portfolioTableArr: string[] = ["Symbol", "Name", "PreQty", "TargetQty", "CurrQty", "TotalOrderQty", "FilledQty", "FillPace",
            "WorkingQty", "SingleOrderQty", "Send", "Cancel", "Status", "PrePrice", "LastPrice", "BidSize", "BidPrice", "AskSize",
            "AskPrice", "AvgBuyPrice", "AvgSellPrice", "PreValue", "CurrValue", "Day Pnl", "O/N Pnl"];
        let portfolioTableTittleLen = portfolioTableArr.length;
        let portfoliotableRtnArr: string[] = [];
        for (let i = 0; i < portfolioTableTittleLen; ++i) {
            let portfolioTableRtn = this.langServ.getTranslateInfo(this.languageType, portfolioTableArr[i]);
            portfoliotableRtnArr.push(portfolioTableRtn);
        }
        portfoliotableRtnArr.forEach(item => {
            this.portfolioTable.addColumn(item);
        });
        this.portfolioTable.columnConfigurable = true;
        this.portfolioTable.onCellClick = (cellItem, cellIndex, rowIndex) => {
            let ukey = AppComponent.self.portfolioTable.rows[rowIndex].cells[0].Data;
            let account = parseInt(AppComponent.self.portfolio_acc.SelectedItem.Text);
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
            let account: number = parseInt(AppComponent.self.portfolio_acc.SelectedItem.Text);
            AppComponent.bgWorker.send({
                command: "ss-send", params: { type: "account-position-load", account: account }
            });

            MessageBox.openFileDialog("Select CSV", (filenames) => {
                // console.log(filenames);
                if (filenames === undefined || filenames.length < 1)
                    return;

                ;
                File.readLineByLine(filenames[0], (linestr, basketList) => {
                    let fields = linestr.split(",");

                    if (fields.length === 2 && fields[0].length > 5) {
                        let codeinfo = AppComponent.self.secuinfo.getSecuinfoByWindCodes([fields[0]]);
                        basketList.push({ currPos: 0, ukey: parseInt(codeinfo[0].InnerCode), targetPos: parseInt(fields[1]) });
                    }
                }, (basketList) => {
                    AppComponent.bgWorker.send({
                        command: "ss-send", params: { type: "basket-fp", data: { account: account, list: basketList } }
                    });
                }, []);
            }, [{ name: "CSV", extensions: ["csv"] }]);
        };

        this.allChk.OnClick = () => {
            AppComponent.self.changeItems(0, !this.allChk.Text);
        };
        allbuyChk.OnClick = () => {
            AppComponent.self.changeItems(1, !allbuyChk.Text);
        };
        allsellChk.OnClick = () => {
            AppComponent.self.changeItems(2, !allsellChk.Text);
        };
        this.range.OnClick = () => {
            let rateVal = this.range.Text;
            this.rateText.Text = rateVal;
            AppComponent.self.changeSingleQty(rateVal);
        };
        this.rateText.OnInput = () => {
            let getrateText = this.range.Text = this.rateText.Text;
            let rtn = AppComponent.self.TestingInput(getrateText + "");
            if (!rtn) {
                this.range.Text = this.rateText.Text = 0;
                AppComponent.self.changeSingleQty(0);
                return;
            }
            if (parseInt(getrateText) > 100) {
                MessageBox.show("warning", "Input Error!", "input value shold be less than 100");
                this.range.Text = this.rateText.Text = 100;
                AppComponent.self.changeSingleQty(100);
                return;
            } else {
                AppComponent.self.changeSingleQty(parseInt(this.rateText.Text));
            }
        };

        btn_sendSel.OnClick = () => {

            let askPriceLevel = AppComponent.self.portfolioBuyCom.SelectedItem.Value;
            let bidPriceLevel = AppComponent.self.portfolioSellCom.SelectedItem.Value;
            let askOffset = AppComponent.self.portfolioBUyOffset.SelectedItem.Value;
            let bidOffset = AppComponent.self.portfolioSellOffset.SelectedItem.Value;
            let sendArr = [];

            for (let i = 0; i < AppComponent.self.portfolioTable.rows.length; ++i) {
                if (AppComponent.self.portfolioTable.rows[i].cells[0].Text) {
                    let qty = parseInt(AppComponent.self.portfolioTable.rows[i].cells[9].Text);
                    if (isNaN(qty)) {
                        alert("下单量必须是数值型");
                        continue;
                    }

                    sendArr.push({ ukey: AppComponent.self.portfolioTable.rows[i].cells[0].Data, qty: qty });
                }
            }

            AppComponent.bgWorker.send({
                command: "ss-send", params: {
                    type: "order-fp", data: {
                        account: AppComponent.self.portfolio_acc.SelectedItem.Text,
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
            let selectArr = AppComponent.self.getSelectedPortfolioItem();
            if (selectArr.length < 1)
                return;

            AppComponent.bgWorker.send({
                command: "ss-send", params: {
                    type: "cancel-fp", data: {
                        account: AppComponent.self.portfolio_acc.SelectedItem.Text,
                        ukeys: selectArr
                    }
                }
            });
        };
        let portfolioContent = new VBox();
        portfolioContent.addChild(loadItem).addChild(tradeitem).addChild(this.portfolioTable);
        this.portfolioPage.setContent(portfolioContent);



        this.profitPage = new TabPage("Profit", this.langServ.getTranslateInfo(this.languageType, "Profit"));
        this.modules["Profit"] = this.profitPage;
        let profitleftAlign = 20;
        let profitHeader = new HBox();
        this.totalpnLabel = new MetaControl("textbox");
        this.totalpnLabel.Left = profitleftAlign;
        this.totalpnLabel.Width = 85;
        this.totalpnLabel.Title = this.langServ.getTranslateInfo(this.languageType, "TOTALPNL") + ": ";
        this.totalpnLabel.Disable = true;
        this.pospnlLabel = new MetaControl("textbox");
        this.pospnlLabel.Left = profitleftAlign;
        this.pospnlLabel.Width = 85;
        this.pospnlLabel.Title = this.langServ.getTranslateInfo(this.languageType, "POSPNL") + ": ";
        this.pospnlLabel.Disable = true;
        this.trapnlt = new MetaControl("textbox");
        this.trapnlt.Left = profitleftAlign;
        this.trapnlt.Width = 85;
        this.trapnlt.Title = this.langServ.getTranslateInfo(this.languageType, "TRAPNL.T") + ": ";
        this.trapnlt.Disable = true;
        this.pospnlt = new MetaControl("textbox");
        this.pospnlt.Left = profitleftAlign;
        this.pospnlt.Width = 85;
        this.pospnlt.Title = this.langServ.getTranslateInfo(this.languageType, "POSPNL.T") + ": ";
        this.pospnlt.Disable = true;
        this.totalpnlt = new MetaControl("textbox");
        this.totalpnlt.Left = profitleftAlign;
        this.totalpnlt.Width = 85;
        this.totalpnlt.Title = this.langServ.getTranslateInfo(this.languageType, "TOTALPNL.T") + ": ";
        this.totalpnlt.Disable = true;
        let reqbtn = new Button();
        reqbtn.Left = profitleftAlign;
        reqbtn.Width = 30;
        reqbtn.Text = this.langServ.getTranslateInfo(this.languageType, "Req");
        profitHeader.addChild(this.totalpnLabel).addChild(this.pospnlLabel).addChild(this.trapnlt).addChild(this.pospnlt).addChild(this.totalpnlt).addChild(reqbtn);
        this.profitTable = new DataTable("table2");
        let profittableArr: string[] = ["U-Key", "Code", "Account", "Strategy", "AvgPrice(B)", "AvgPrice(S)",
            "PositionPnl", "TradingPnl", "IntraTradingFee", "TotalTradingFee", "LastTradingFee", "LastPosPnl",
            "TodayPosPnl", "TotalPnl", "LastPosition", "TodayPosition", "LastClose", "MarketPrice", "IOPV"];
        let profitTableTittleLen = profittableArr.length;
        let profitTableRtnArr: string[] = [];
        for (let i = 0; i < profitTableTittleLen; ++i) {
            profitTableRtnArr.push(this.langServ.getTranslateInfo(this.languageType, profittableArr[i]));
        }
        profitTableRtnArr.forEach(item => {
            this.profitTable.addColumn(item);
        });
        this.profitTable.columnConfigurable = true;
        let profitContent = new VBox();
        profitContent.addChild(profitHeader);
        profitContent.addChild(this.profitTable);
        this.profitPage.setContent(profitContent);
        reqbtn.OnClick = () => { AppComponent.bgWorker.send({ command: "ss-send", params: { type: "getProfitInfo", data: "" } }); };

        this.onStrategyTableInit();
        this.loadLayout();

        AppComponent.bgWorker.send({ command: "ss-start", params: { port: parseInt(this.tradeEndpoint[1]), host: this.tradeEndpoint[0], appid: this.option.appid } });
        this.subScribeMarketInit(parseInt(this.quoteEndpoint[1]), this.quoteEndpoint[0]);
    }

    ngAfterViewInit() {
    }

    onStrategyTableInit() {
        this.strategyPage = new TabPage("Strategy", this.langServ.getTranslateInfo(this.languageType, "StrategyMonitor"));
        let strategyHeader = new HBox();
        let startall = new Button();
        startall.Text = this.langServ.getTranslateInfo(this.languageType, "StartAll");
        let pauseall = new Button();
        pauseall.Text = this.langServ.getTranslateInfo(this.languageType, "PauseAll");
        let stopall = new Button();
        stopall.Text = this.langServ.getTranslateInfo(this.languageType, "StopAll");
        let watchall = new Button();
        watchall.Text = this.langServ.getTranslateInfo(this.languageType, "WatchAll");
        let configBtn = new Button();
        configBtn.Text = this.langServ.getTranslateInfo(this.languageType, "Config");
        startall.OnClick = () => { this.operateSteategy(this.strategyTable.rows[0].cells[0].Text, 3, 0, 0); };
        pauseall.OnClick = () => { this.operateSteategy(this.strategyTable.rows[0].cells[0].Text, 4, 0, 1); };
        stopall.OnClick = () => { this.operateSteategy(this.strategyTable.rows[0].cells[0].Text, 5, 0, 2); };
        watchall.OnClick = () => { this.operateSteategy(this.strategyTable.rows[0].cells[0].Text, 6, 0, 3); };
        configBtn.OnClick = () => {
            this.configTable.rows.forEach(row => {
                row.cells[0].Text = !this.option.config["strategy_table"].columnHideIDs.includes(row.cells[0].Data);
            });
            Dialog.popup(this, this.configContent, { title: this.langServ.getTranslateInfo(this.languageType, "parameter"), height: 450 });
        };

        strategyHeader.addChild(startall).addChild(pauseall).addChild(stopall).addChild(watchall).addChild(configBtn);

        this.strategyTable = new DataTable();
        this.strategyTable.RowIndex = false;
        ["StrategyID", "Sym1", "Sym2", "Start", "Pause", "Stop", "Watch", "Status", "PosPnl(K)", "TraPnl(K)"]
            .forEach(item => { this.strategyTable.addColumn(this.langServ.getTranslateInfo(this.languageType, item)); });
        let strategyContent = new VBox();
        strategyContent.addChild(strategyHeader);
        strategyContent.addChild(this.strategyTable);
        this.strategyPage.setContent(strategyContent);
        this.strategyTable.onCellClick = (cellItem, cellIdx, rowIdx) => { this.strategyOnCellClick(cellItem, cellIdx, rowIdx); };

        this.modules["Strategy"] = this.strategyPage;
    }

    loadLayout() {
        let children = this.option.layout.children;
        let childrenLen = children.length;
        this.main = new DockContainer(null, this.option.layout.type, this.option.layout.width, this.option.layout.height);
        for (let i = 0; i < childrenLen - 1; ++i) {  // traverse
            this.main.addChild(this.traversefunc(this.main, children[i]));
            this.main.addChild(new Splitter("h", this.main));
        }

        this.main.addChild(this.traversefunc(this.main, children[childrenLen - 1]));
    }

    subScribeMarketInit(port: number, host: string) {
        if (!AppComponent.loginFlag) {
            this.createBackgroundWork();
            AppComponent.bgWorker.send({ command: "ps-start", params: { port: port, host: host } });
            AppComponent.loginFlag = true;
        }
    }

    changeIp20Status(data: any) {
        AppComponent.self.addStatus(data, "PS");
    }

    changeSSstatus(data: any) {
        AppComponent.self.addStatus(data, "SS");
    }

    addStatus(data: any, mark: string) {
        let markLen = AppComponent.self.statusbar.items.length;
        if (markLen === 0) { // add
            AppComponent.self.addStatusBarMark({ name: mark, connected: data });
        } else {
            let markFlag: Boolean = false;
            for (let i = 0; i < markLen; ++i) {
                let text = AppComponent.self.statusbar.items[i].text;
                if (text === mark) {
                    AppComponent.self.statusbar.items[i].color = data ? "#26d288" : "#ff5564";
                    markFlag = true;
                }
            }
            if (!markFlag)
                AppComponent.self.addStatusBarMark({ name: mark, connected: data });
        }
    }

    changeConfigArrVal(name: string, show: boolean) {
        for (let i = 0; i < AppComponent.self.configArr.length; ++i) {
            if (AppComponent.self.configArr[i].name === name) {
                AppComponent.self.configArr[i].check = show;
                break;
            }
        }
    }

    getshow(key: any) {
        for (let o in AppComponent.self.configStrObj) {
            if (parseInt(o) === key) {
                return AppComponent.self.configStrObj[o].show;
            }
        }
    }

    handleCommentObj(data: any) {
        let judge = AppComponent.self.judgeObject(this.commentObj);
        let strategyid = data.strategyid;
        // let getname = this.langServ.getTranslateInfo(this.languageType, data.name); commentparameter
        if (!judge) {
            this.commentObj[strategyid] = {};
            this.commentObj[strategyid][data.key] = { name: data.name, value: data.value };
        } else {
            // traverse commentobj,insert or modify
            let commentFlag: boolean = false;
            let tempFlag: boolean = false;
            for (let o in this.commentObj) {
                if (o === strategyid) {
                    commentFlag = true;
                    let strategyComment = this.commentObj[o];
                    for (let tempobj in strategyComment) {
                        if (tempobj === data.key) {
                            tempFlag = true;
                            strategyComment.value = data.value;
                        }
                    }
                }
                if (!tempFlag) {
                    this.commentObj[o][data.key] = { name: data.name, value: data.value };
                }

            }
            if (!commentFlag) {
                this.commentObj[strategyid][data.key] = { name: data.name, value: data.value };
            }
        }
        // console.log(this.commentObj);
    }

    judgeObject(data: any) {
        for (let o in data) {
            return true;
        }
        return false;
    }

    traverseobj(obj: any, data: any) {
        for (let o in obj) {
            if ((o + "") === data) {
                return obj[o];
            }
        }
        return {};
    }

    traversefunc(parent, obj) {
        let dock = new DockContainer(parent, obj.type, obj.width, obj.height);
        if (obj.children && obj.children.length > 0) {
            obj.children.forEach((child, index) => {
                dock.addChild(AppComponent.self.traversefunc(dock, child));
                if (index < obj.children.length - 1)
                    dock.addChild(new Splitter(child.type, dock));
            });
        } else if (obj.modules && obj.modules.length > 0) {
            let panel = new TabPanel();
            obj.modules.forEach(page => {
                if (AppComponent.self.modules.hasOwnProperty(page)) {
                    panel.addTab(AppComponent.self.modules[page]);
                    this.statechecker.changeMenuItemState(page, true, 2);
                } else {
                    if (page.startsWith("BookView")) {
                        panel.addTab(AppComponent.self.createBookView(page));
                    }
                }
            });
            dock.addChild(panel);
            panel.setActive(obj.modules[0]);
        } else {
            console.error("traverse layout error");
        }

        return dock;
    }

    TestingInput(data: any) {
        let reg = /^[\d]+$/;
        let rtn = reg.test(data);
        return rtn;
    }

    changeSingleQty(rateVal: number) {
        let len = AppComponent.self.portfolioTable.rows.length;
        for (let i = 0; i < len; ++i) {
            let targetVal = AppComponent.self.portfolioTable.rows[i].cells[3].Text;
            let singleVal = (targetVal / 100 * rateVal).toFixed(0);
            AppComponent.self.portfolioTable.rows[i].cells[9].Text = Math.abs(parseInt(singleVal));
        }
    }

    showStatArbOrder(data: any) {
        for (let i = 0; i < data.length; ++i) {
            let subtype = data[i].subtype;
            let dataArr = data[i].content;
            if (subtype === 1001) {  // add
                let statArbLen = AppComponent.self.statarbTable.rows.length;
                if (statArbLen === 0) {
                    AppComponent.self.addStatArbInfo(dataArr);
                } else {
                    let checkFlag: boolean = false;
                    for (let j = 0; j < statArbLen; ++j) {
                        let getStrategyid = AppComponent.self.statarbTable.rows[j].cells[6].Text;
                        let getukey = AppComponent.self.statarbTable.rows[j].cells[1].Text;
                        if (dataArr[0].code === getukey && dataArr[0].strategyid === getStrategyid) {
                            checkFlag = true;
                            AppComponent.self.refreshStatArbInfo(dataArr, j);
                        }
                    }
                    if (!checkFlag) {
                        AppComponent.self.addStatArbInfo(dataArr);
                        checkFlag = false;
                    }
                }
            } else if (subtype === 1002) { // hide
                for (let idx = 0; idx < dataArr.length; ++idx) {
                    for (let hideIdx = 0; hideIdx < AppComponent.self.statarbTable.rows.length; ++hideIdx) {
                        let getUkey = AppComponent.self.statarbTable.rows[hideIdx].cells[1].Text;
                        let getStrategyid = AppComponent.self.statarbTable.rows[hideIdx].cells[6].Text;
                        if (parseInt(getUkey) === dataArr[idx].code && parseInt(getStrategyid) === dataArr[idx].strategyid) {
                            AppComponent.self.statarbTable.rows[hideIdx].hidden = true;
                            // AppComponent.self.statarbTable.rows.splice(hideIdx, 1);
                            if (dataArr[idx].amount > 0) {
                                AppComponent.self.buyamountLabel.Text = (parseFloat(AppComponent.self.buyamountLabel.Text) - dataArr[idx].amount / 10000).toFixed(3).toString();
                            } else if (dataArr[idx].amount < 0) {
                                AppComponent.self.sellamountLabel.Text = (parseFloat(AppComponent.self.sellamountLabel.Text) + dataArr[idx].amount / 10000).toFixed(3).toString();
                            }
                            break;
                        }
                    }
                }
            }

        }
    }

    addStatArbInfo(dataArr: any) {
        let row = AppComponent.self.statarbTable.newRow();
        row.cells[1].Text = dataArr[0].code;
        let codeInfo = this.secuinfo.getSecuinfoByUKey(dataArr[0].code);
        row.cells[0].Text = codeInfo.hasOwnProperty(dataArr[0].code) ? codeInfo[dataArr[0].code].SecuAbbr : "unknown";
        row.cells[8].Text = codeInfo.hasOwnProperty(dataArr[0].code) ? codeInfo[dataArr[0].code].SecuCode : "unknown";
        row.cells[2].Text = dataArr[0].pricerate / 100;
        row.cells[3].Text = dataArr[0].position;
        row.cells[4].Text = dataArr[0].quantity;
        row.cells[5].Text = dataArr[0].amount / 10000;
        row.cells[6].Text = dataArr[0].strategyid;
        row.cells[7].Text = dataArr[0].diffQty;

        if (dataArr[0].amount > 0)
            AppComponent.self.buyamountLabel.Text = (parseFloat(AppComponent.self.buyamountLabel.Text) + dataArr[0].amount / 10000).toFixed(3).toString();
        else
            AppComponent.self.sellamountLabel.Text = (parseFloat(AppComponent.self.sellamountLabel.Text) - dataArr[0].amount / 10000).toFixed(3).toString();
    }

    refreshStatArbInfo(dataArr: any, idx: number) {
        AppComponent.self.statarbTable.rows[idx].cells[2].Text = dataArr[0].pricerate / 100;
        AppComponent.self.statarbTable.rows[idx].cells[3].Text = dataArr[0].position;
        AppComponent.self.statarbTable.rows[idx].cells[4].Text = dataArr[0].quantity;
        AppComponent.self.statarbTable.rows[idx].cells[5].Text = dataArr[0].amount / 10000;
        AppComponent.self.statarbTable.rows[idx].cells[5].Text = dataArr[0].amount / 10000;
        if (dataArr[0].amount > 0) {
            AppComponent.self.buyamountLabel.Text = (parseFloat(AppComponent.self.buyamountLabel.Text) + dataArr[0].amount / 10000).toFixed(3).toString();
        } else if (dataArr[0].amount < 0) {
            AppComponent.self.sellamountLabel.Text = (parseFloat(AppComponent.self.sellamountLabel.Text) - dataArr[0].amount / 10000).toFixed(3).toString();
        }
        AppComponent.self.statarbTable.rows[idx].cells[7].Text = dataArr[0].diffQty;
        AppComponent.self.statarbTable.rows[idx].hidden = false;
    }

    showComorderstatusAndErrorInfo(data: any) {
        let time = AppComponent.self.getCurrentTime();
        let row = AppComponent.self.logTable.newRow();
        row.cells[0].Text = time;
        row.cells[1].Text = `errorid=${data[0].os.errorid}, errmsg=${data[0].os.errormsg}`;
        if (data[0].os.errorid !== 0) {
            row.cells[1].Color = "red";
        }

        if (AppComponent.self.logTable.rows.length > 500)
            AppComponent.self.logTable.rows.shift();
        AppComponent.self.logTable.detectChanges();
    }

    showGuiCmdAck(data: any) {
        data.data.forEach(item => {
            for (let iRow = 0; iRow < this.strategyTable.rows.length; ++iRow) {
                if (this.strategyTable.rows[iRow].cells[0].Text !== item.strategyid)
                    continue;

                switch (data.type) {
                    case 2001: // start ack
                        if (!item.success)
                            break;

                        this.strategyTable.rows[iRow].cells[3].Disable = true;
                        this.strategyTable.rows[iRow].cells[4].Disable = false;
                        this.strategyTable.rows[iRow].cells[5].Disable = false;
                        this.strategyTable.rows[iRow].cells[6].Disable = false;
                        break;
                    case 2005: // pause ack
                        if (!item.success)
                            break;

                        this.strategyTable.rows[iRow].cells[3].Disable = false;
                        this.strategyTable.rows[iRow].cells[4].Disable = true;
                        this.strategyTable.rows[iRow].cells[5].Disable = false;
                        this.strategyTable.rows[iRow].cells[6].Disable = false;
                        break;
                    case 2003: // stop ack
                        if (!item.success)
                            break;

                        this.strategyTable.rows[iRow].cells[3].Disable = true;
                        this.strategyTable.rows[iRow].cells[4].Disable = true;
                        this.strategyTable.rows[iRow].cells[5].Disable = true;
                        this.strategyTable.rows[iRow].cells[6].Disable = false;
                        break;
                    case 2050: // watch ack
                        if (!item.success)
                            break;

                        this.strategyTable.rows[iRow].cells[3].Disable = false;
                        this.strategyTable.rows[iRow].cells[4].Disable = false;
                        this.strategyTable.rows[iRow].cells[5].Disable = false;
                        this.strategyTable.rows[iRow].cells[6].Disable = true;
                        break;
                    case 2031:
                        if (!item.success)
                            break;

                        let command = this.strategyMap[item.strategyid].commands.find(command => { return command.key === item.key; });
                        alert(`operator: ${command.name} ${item.success ? "successfully!" : "unsuccessfully!"}`);
                        break;
                }
            }
        });
    }

    showLog(data: any) {
        let logStr = data[0];
        // console.log(logStr);
        let time = this.getCurrentTime();
        let rowLen = this.logTable.rows.length;
        if (rowLen > 500)
            this.logTable.rows.splice(0, 1);
        let row = this.logTable.newRow();
        row.cells[0].Text = time;
        row.cells[1].Text = logStr;
        this.logTable.detectChanges();
    }

    addLog(data: any) {
        let name = data.name;
        let rowLen = AppComponent.self.logTable.rows.length;
        if (rowLen > 500)
            AppComponent.self.logTable.rows.splice(0, 1);
        let row = AppComponent.self.logTable.newRow();
        row.cells[0].Text = AppComponent.self.getCurrentTime();
        row.cells[1].Text = name + " " + (data.connected ? "Connected" : "Disconnected");
        AppComponent.self.ref.detectChanges();
    }

    showStrategyInfo(data: any) {
        let j;
        for (let i = 0; i < data.length; ++i) {
            for (j = 0; j < this.strategyTable.rows.length; ++j) {
                if (this.strategyTable.rows[j].cells[0].Text === data[i].key) {
                    switch (data[i].status) {
                        case EStrategyStatus.STRATEGY_STATUS_INIT:
                            this.strategyTable.rows[j].cells[7].Text = "INIT";
                            break;
                        case EStrategyStatus.STRATEGY_STATUS_CREATE:
                            this.strategyTable.rows[j].cells[7].Text = "CREATE";
                            break;
                        case EStrategyStatus.STRATEGY_STATUS_RUN:
                            this.strategyTable.rows[j].cells[3].Disable = true;
                            this.strategyTable.rows[j].cells[4].Disable = false;
                            this.strategyTable.rows[j].cells[5].Disable = false;
                            this.strategyTable.rows[j].cells[6].Disable = false;
                            this.strategyTable.rows[j].cells[7].Text = "RUN";
                            break;
                        case EStrategyStatus.STRATEGY_STATUS_PAUSE:
                            this.strategyTable.rows[j].cells[3].Disable = false;
                            this.strategyTable.rows[j].cells[4].Disable = true;
                            this.strategyTable.rows[j].cells[5].Disable = false;
                            this.strategyTable.rows[j].cells[6].Disable = false;
                            this.strategyTable.rows[j].cells[7].Text = "PAUSE";
                            break;
                        case EStrategyStatus.STRATEGY_STATUS_STOP:
                            this.strategyTable.rows[j].cells[3].Disable = true;
                            this.strategyTable.rows[j].cells[4].Disable = true;
                            this.strategyTable.rows[j].cells[5].Disable = true;
                            this.strategyTable.rows[j].cells[6].Disable = false;
                            this.strategyTable.rows[j].cells[7].Text = "STOP";
                            break;
                        case EStrategyStatus.STRATEGY_STATUS_WATCH:
                            this.strategyTable.rows[j].cells[3].Disable = false;
                            this.strategyTable.rows[j].cells[4].Disable = false;
                            this.strategyTable.rows[j].cells[5].Disable = false;
                            this.strategyTable.rows[j].cells[6].Disable = true;
                            this.strategyTable.rows[j].cells[7].Text = "WATCH";
                            break;
                        case EStrategyStatus.STRATEGY_STATUS_ERROR:
                        default:
                            this.strategyTable.rows[j].cells[7].Text = "ERROR";
                            break;
                    }

                    break;
                }
            }

            if (j === this.strategyTable.rows.length) {
                this.strategyMap[data[i].key] = { instruments: [], commands: [], parameters: [], comments1: [], comments2: [] };
                let row = this.strategyTable.newRow();
                row.cells[0].Text = data[i].key;
                row.cells[3].Type = "button";
                row.cells[3].Text = "start";
                row.cells[3].Class = "primary";
                row.cells[4].Type = "button";
                row.cells[4].Text = "pause";
                row.cells[4].Class = "primary";
                row.cells[5].Type = "button";
                row.cells[5].Text = "stop";
                row.cells[5].Class = "primary";
                row.cells[6].Type = "button";
                row.cells[6].Text = "watch";
                row.cells[6].Class = "primary";
                switch (data[i].status) {
                    case EStrategyStatus.STRATEGY_STATUS_INIT:
                        row.cells[7].Text = "INIT";
                        break;
                    case EStrategyStatus.STRATEGY_STATUS_CREATE:
                        row.cells[7].Text = "CREATE";
                        break;
                    case EStrategyStatus.STRATEGY_STATUS_RUN:
                        row.cells[3].Disable = true;
                        row.cells[4].Disable = false;
                        row.cells[5].Disable = false;
                        row.cells[6].Disable = false;
                        row.cells[7].Text = "RUN";
                        break;
                    case EStrategyStatus.STRATEGY_STATUS_PAUSE:
                        row.cells[3].Disable = true;
                        row.cells[4].Disable = false;
                        row.cells[5].Disable = false;
                        row.cells[6].Disable = false;
                        row.cells[7].Text = "PAUSE";
                        break;
                    case EStrategyStatus.STRATEGY_STATUS_STOP:
                        row.cells[3].Disable = true;
                        row.cells[4].Disable = false;
                        row.cells[5].Disable = false;
                        row.cells[6].Disable = false;
                        row.cells[7].Text = "STOP";
                        break;
                    case EStrategyStatus.STRATEGY_STATUS_WATCH:
                        row.cells[3].Disable = true;
                        row.cells[4].Disable = false;
                        row.cells[5].Disable = false;
                        row.cells[6].Disable = false;
                        row.cells[7].Text = "WATCH";
                        break;
                    case EStrategyStatus.STRATEGY_STATUS_ERROR:
                    default:
                        row.cells[7].Text = "ERROR";
                        break;
                }

                this.dd_Strategy.addItem({ Text: data[i].key + "", Value: "" });
            }
        }

        this.strategyTable.detectChanges();
    }

    showComOrderRecord(data: any) {
        console.info(`showComOrderRecord: len = ${data.length}`);
        let hasDone = false, hasUnDone = false;
        let j;
        for (let iData = 0; iData < data.length; ++iData) {
            let orderStatus = data[iData].od.status;
            if (orderStatus === 9 || orderStatus === 6 || orderStatus === 7) {
                // remove from orderstatus table
                for (let i = 0; i < this.orderstatusTable.rows.length; ++i) {
                    if (data[iData].od.orderid === this.orderstatusTable.rows[i].cells[3].Text) {
                        this.orderstatusTable.rows.splice(i, 1);
                        break;
                    }
                }

                for (j = 0; j < this.doneOrdersTable.rows.length; ++j) {
                    if (data[iData].od.orderid === this.doneOrdersTable.rows[j].cells[2].Text) { // refresh
                        this.doneOrdersTable.rows[j].cells[4].Text = data[iData].od.action === 0 ? "Buy" : "Sell";
                        this.doneOrdersTable.rows[j].cells[5].Text = data[iData].od.oprice / 10000;
                        this.doneOrdersTable.rows[j].cells[6].Text = data[iData].od.ivolume;
                        this.doneOrdersTable.rows[j].cells[7].Text = this.parseOrderStatus(data[iData].od.status);
                        this.doneOrdersTable.rows[j].cells[8].Text = this.formatTime(data[iData].od.odatetime.tv_sec);
                        this.doneOrdersTable.rows[j].cells[9].Text = data[iData].od.ovolume;
                        this.doneOrdersTable.rows[j].cells[10].Text = data[iData].donetype === 1 ? "Active" : (data[iData].donetype === 2 ? "Passive" : "UNKNOWN");
                        this.doneOrdersTable.rows[j].cells[12].Text = this.formatTime(data[iData].od.idatetime.tv_sec);
                        this.doneOrdersTable.rows[j].cells[13].Text = data[iData].od.iprice / 10000;
                        break;
                    }
                }

                if (j === this.doneOrdersTable.rows.length) {
                    let row = this.doneOrdersTable.newRow(true);
                    row.cells[0].Text = data[iData].od.innercode;
                    let codeInfo = this.secuinfo.getSecuinfoByUKey(data[iData].od.innercode);
                    row.cells[1].Text = codeInfo.hasOwnProperty(data[iData].od.innercode) ? codeInfo[data[iData].od.innercode].SecuAbbr : "unknown";
                    row.cells[14].Text = codeInfo.hasOwnProperty(data[iData].od.innercode) ? codeInfo[data[iData].od.innercode].SecuCode : "unknown";
                    row.cells[2].Text = data[iData].od.orderid;
                    row.cells[3].Text = data[iData].od.strategyid;
                    let action: number = data[iData].od.action;
                    if (action === 0)
                        row.cells[4].Text = "Buy";
                    else if (action === 1)
                        row.cells[4].Text = "Sell";
                    else
                        row.cells[4].Text = "";
                    row.cells[5].Text = data[iData].od.oprice / 10000;
                    row.cells[6].Text = data[iData].od.ivolume;
                    row.cells[7].Text = this.parseOrderStatus(data[iData].od.status);
                    row.cells[8].Text = this.formatTime(data[iData].od.odatetime.tv_sec);
                    row.cells[9].Text = data[iData].od.ovolume;
                    let orderPriceType = data[iData].donetype;
                    if (orderPriceType === 1)
                        row.cells[10].Text = "Active";
                    else if (orderPriceType === 2)
                        row.cells[10].Text = "Passive";
                    else
                        row.cells[10].Text = "UNKNOWN";
                    row.cells[11].Text = data[iData].con.account;
                    row.cells[12].Text = this.formatTime(data[iData].od.idatetime.tv_sec);
                    row.cells[13].Text = data[iData].od.iprice / 10000;
                }

                hasDone = true;
            } else {
                for (j = 0; j < this.orderstatusTable.rows.length; ++j) {
                    if (data[iData].od.orderid === this.orderstatusTable.rows[j].cells[3].Text) {  // refresh
                        this.refreshUndoneOrderInfo(data[iData], j);
                        break;
                    }
                }

                if (j === this.orderstatusTable.rows.length) {
                    this.addUndoneOrderInfo(data[iData]);
                }

                hasUnDone = true;
            }
        }

        if (hasDone) {
            AppComponent.bgWorker.send({ command: "send", params: { type: 0 } });
            AppComponent.self.doneOrdersTable.detectChanges();
        }

        if (hasUnDone) {
            AppComponent.self.orderstatusTable.detectChanges();
        }
    }

    addUndoneOrderInfo(obj: any) {
        let row = this.orderstatusTable.newRow(true);
        row.cells[0].Type = "checkbox";
        row.cells[0].Text = false;
        row.cells[0].Data = { ukey: 0, chk: true };
        row.cells[0].Data.ukey = obj.od.innercode;
        row.cells[0].Disable = (6 === obj.od.status || 7 === obj.od.status);
        row.cells[1].Text = obj.od.innercode;
        let codeInfo = this.secuinfo.getSecuinfoByUKey(obj.od.innercode);
        row.cells[2].Text = codeInfo.hasOwnProperty(obj.od.innercode) ? codeInfo[obj.od.innercode].SecuCode : "unknown";
        row.cells[3].Text = obj.od.orderid;
        row.cells[4].Text = this.formatTime(obj.od.odatetime.tv_sec);
        row.cells[5].Text = obj.od.strategyid;
        let action: number = obj.od.action;
        if (action === 0)
            row.cells[6].Text = "Buy";
        else if (action === 1)
            row.cells[6].Text = "Sell";
        else
            row.cells[6].Text = "";
        row.cells[7].Text = obj.od.oprice / 10000;
        row.cells[8].Text = obj.od.ovolume;
        row.cells[9].Text = obj.od.ivolume;
        row.cells[10].Text = this.parseOrderStatus(obj.od.status);
        row.cells[10].Data = obj.od.status;
        row.cells[11].Text = obj.con.account;
    }

    formatTime(time: any): String {
        let rtnStr: String = "";
        let newDate = new Date(time * 1000);
        let hour = newDate.getHours() + "";
        let min = newDate.getMinutes() + "";
        if (min.length === 1)
            min = "0" + min;
        let sec = newDate.getSeconds() + "";
        if (sec.length === 1)
            sec = "0" + sec;
        rtnStr = hour + ":" + min + ":" + sec;
        return rtnStr;
    }

    getCurrentTime(): String {
        let str: String = "";
        let timeData: Date = new Date();
        str = timeData.getHours() + "";
        str = str + ":" + timeData.getMinutes();
        str = str + ":" + timeData.getSeconds();
        str = str + ":" + timeData.getMilliseconds();
        return str;
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

    refreshUndoneOrderInfo(obj: any, idx: number) {
        this.orderstatusTable.rows[idx].cells[4].Text = this.formatTime(obj.od.odatetime.tv_sec);
        let action: number = obj.od.action;
        if (action === 0)
            this.orderstatusTable.rows[idx].cells[6].Text = "Buy";
        else if (action === 1)
            this.orderstatusTable.rows[idx].cells[6].Text = "Sell";
        else
            this.orderstatusTable.rows[idx].cells[6].Text = "";
        this.orderstatusTable.rows[idx].cells[7].Text = obj.od.oprice / 10000;
        this.orderstatusTable.rows[idx].cells[8].Text = obj.od.ovolume;
        this.orderstatusTable.rows[idx].cells[9].Text = obj.od.ivolume;
        this.orderstatusTable.rows[idx].cells[10].Text = this.parseOrderStatus(obj.od.status);
        this.orderstatusTable.rows[idx].cells[10].Data = obj.od.status;
        if (6 === obj.od.status || 7 === obj.od.status) {
            this.orderstatusTable.rows[idx].cells[0].Disable = true;
            if (this.orderstatusTable.rows[idx].cells[0].Text)
                this.orderstatusTable.rows[idx].cells[0].Text = !this.orderstatusTable.rows[idx].cells[0].Text;
        }
    }

    /**
     * update by cl, date 2017/08/31
     */
    showComRecordPos(data: any) {
        let iRow;
        let secuCategory = 1;
        for (let iData = 0; iData < data.length; ++iData) {
            for (iRow = 0; iRow < AppComponent.self.positionTable.rows.length; ++iRow) {
                if (AppComponent.self.positionTable.rows[iRow].cells[2].Text === data[iData].record.code) { // refresh
                    secuCategory = AppComponent.self.positionTable.rows[iRow].cells[1].Text;

                    if (secuCategory === 1) {
                        AppComponent.self.positionTable.rows[iRow].cells[4].Text = data[iData].record.TotalVol;
                        AppComponent.self.positionTable.rows[iRow].cells[5].Text = data[iData].record.AvlVol;
                        AppComponent.self.positionTable.rows[iRow].cells[6].Text = data[iData].record.AvlCreRedempVol;
                        AppComponent.self.positionTable.rows[iRow].cells[7].Text = data[iData].record.WorkingVol;
                        AppComponent.self.positionTable.rows[iRow].cells[8].Text = data[iData].record.TotalCost / 10000;
                        AppComponent.self.positionTable.rows[iRow].cells[10].Text = data[iData].record.TotalVol !== 0 ? (data[iData].record.TotalCost / data[iData].record.TotalVol / 10000).toFixed(4) : 0;
                        break;
                    } else if (secuCategory === 2 && AppComponent.self.positionTable.rows[iRow].cells[12].Text === data[iData].record.type) {
                        AppComponent.self.positionTable.rows[iRow].cells[4].Text = data[iData].record.TotalVol;
                        AppComponent.self.positionTable.rows[iRow].cells[5].Text = data[iData].record.AvlVol;
                        AppComponent.self.positionTable.rows[iRow].cells[7].Text = data[iData].record.WorkingVol;
                        AppComponent.self.positionTable.rows[iRow].cells[8].Text = data[iData].record.TotalCost / 10000;
                        AppComponent.self.positionTable.rows[iRow].cells[9].Text = data[iData].record.TodayOpen;
                        AppComponent.self.positionTable.rows[iRow].cells[10].Text = data[iData].record.AveragePrice / 10000;
                        break;
                    }
                }
            }

            if (iRow === AppComponent.self.positionTable.rows.length) {
                if (data[iData].secucategory === 1) {
                    let row = AppComponent.self.positionTable.newRow();
                    row.cells[0].Text = data[iData].record.account;
                    row.cells[1].Text = data[iData].secucategory;
                    row.cells[2].Text = data[iData].record.code;
                    let codeInfo = this.secuinfo.getSecuinfoByUKey(data[iData].record.code);
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
                    let row = AppComponent.self.positionTable.newRow();
                    row.cells[0].Text = data[iData].record.account;
                    row.cells[1].Text = data[iData].secucategory;
                    row.cells[2].Text = data[iData].record.code;
                    let codeInfo = this.secuinfo.getSecuinfoByUKey(data[iData].record.code);
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
        AppComponent.self.positionTable.detectChanges();
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
                for (let o in AppComponent.self.gatewayObj) {
                    let row = AppComponent.self.gatewayTable.newRow();
                    row.cells[0].Text = o;
                    row.cells[1].Text = AppComponent.self.gatewayObj[o];
                }
                Dialog.popup(this, this.gatewayContent, { title: this.langServ.getTranslateInfo(this.languageType, "Gateway"), height: 300 });
            }
        };
        tempmark.section = "right";
        tempmark.color = data.connected ? "#26d288" : "#ff5564";
        if (!data.connected)
            AppComponent.bgWorker.send({ command: "send", params: { type: 1 } });
        AppComponent.self.statusbar.items.push(tempmark);
    }

    showComTotalProfitInfo(data: any) {
        let subtype = data[0].subtype;
        let arr: any[] = data[0].content;
        if (subtype === 1) { // profitcmd & alarmitem
            arr.forEach(item => {
                for (let i = 0; i < this.strategyTable.rows.length; ++i) {
                    if (this.strategyTable.rows[i].cells[0].Text !== item.strategyid)
                        continue;

                    this.strategyTable.rows[i].cells[8].Text = (item.totalpositionpnl / 10000 / 1000).toFixed(2);
                    this.strategyTable.rows[i].cells[8].bgColor = item.totalpositionpnl > 0 ? null : "#F62626";
                    this.strategyTable.rows[i].cells[9].Text = (item.totaltradingpnl / 10000 / 1000).toFixed(2);
                    break;
                }
            });

            this.strategyTable.detectChanges();
        } else if (subtype === 0) { // set pnl
            for (let i = 0; i < arr.length; ++i) {
                AppComponent.self.totalpnLabel.Text = arr[i].totalpnl / 10000;
                AppComponent.self.pospnlLabel.Text = arr[i].totalpositionpnl / 10000;
                AppComponent.self.trapnlt.Text = arr[i].totaltradingpnl / 10000;
                AppComponent.self.pospnlt.Text = arr[i].totaltodaypositionpnl / 10000;
                AppComponent.self.totalpnlt.Text = arr[i].totaltodaypositionpnl / 10000 + arr[i].totaltradingpnl / 10000;
            }

            this.ref.detectChanges();
        }
    }

    showComProfitInfo(data: any) {
        for (let i = 0; i < data.length; ++i) {
            let profitTableRows: number = AppComponent.self.profitTable.rows.length;
            let profitUkey: number = data[i].innercode;

            if (profitTableRows === 0) {  // add
                AppComponent.self.addProfitInfo(data[i]);
            } else {
                let checkFlag: boolean = false;
                for (let j = 0; j < profitTableRows; ++j) {
                    let getUkey = AppComponent.self.profitTable.rows[j].cells[0].Text;
                    if (getUkey === profitUkey) { // refresh
                        checkFlag = true;
                        AppComponent.self.refreshProfitInfo(data[i], j);
                    }
                }
                if (!checkFlag) {
                    AppComponent.self.addProfitInfo(data[i]);
                }
                checkFlag = false;
            }
        }
    }

    addProfitInfo(obj: any) {
        let row = AppComponent.self.profitTable.newRow();
        row.cells[0].Text = obj.innercode;
        let codeInfo = this.secuinfo.getSecuinfoByUKey(obj.innercode);
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
        AppComponent.self.profitTable.detectChanges();
    }

    refreshProfitInfo(obj: any, idx: number) {
        AppComponent.self.profitTable.rows[idx].cells[4].Text = obj.avgpriceforbuy / 10000;
        AppComponent.self.profitTable.rows[idx].cells[5].Text = obj.avgpriceforsell / 10000;
        AppComponent.self.profitTable.rows[idx].cells[6].Text = obj.positionpnl / 10000;
        AppComponent.self.profitTable.rows[idx].cells[7].Text = obj.tradingpnl / 10000;
        AppComponent.self.profitTable.rows[idx].cells[8].Text = obj.intradaytradingfee / 10000;
        AppComponent.self.profitTable.rows[idx].cells[9].Text = obj.tradingfee / 10000;
        AppComponent.self.profitTable.rows[idx].cells[10].Text = obj.lasttradingfee / 10000;
        AppComponent.self.profitTable.rows[idx].cells[11].Text = obj.lastpositionpnl / 10000;
        AppComponent.self.profitTable.rows[idx].cells[12].Text = obj.todaypositionpnl / 10000;
        AppComponent.self.profitTable.rows[idx].cells[13].Text = obj.pnl / 10000;
        AppComponent.self.profitTable.rows[idx].cells[14].Text = obj.lastposition;
        AppComponent.self.profitTable.rows[idx].cells[15].Text = obj.todayposition;
        AppComponent.self.profitTable.rows[idx].cells[16].Text = obj.lastclose / 10000;
        AppComponent.self.profitTable.rows[idx].cells[17].Text = obj.marketprice / 10000;
        AppComponent.self.profitTable.rows[idx].cells[18].Text = obj.iopv;

        AppComponent.self.profitTable.detectChanges();
    }

    showComAccountPos(data: any) {
        for (let i = 0; i < data.length; ++i) {
            let accTableRows: number = AppComponent.self.accountTable.rows.length;
            let accData: number = data[i].record.account;
            // -------in manultrader frame,set account info
            let checkFlag: boolean = true; let portfolioCheckFlag: boolean = true;
            let dd_account_len = AppComponent.self.dd_Account.Items.length;
            let portfolioAccLen = AppComponent.self.portfolio_acc.Items.length;
            for (let idx = 0; idx < dd_account_len; ++idx) {
                let gettext = AppComponent.self.dd_Account.Items[idx].Text;
                if (accData + "" === gettext)
                    checkFlag = false;
            }
            if (checkFlag) {
                AppComponent.self.dd_Account.addItem({ Text: accData + "", Value: dd_account_len + "" });
            }

            for (let idx = 0; idx < portfolioAccLen; ++idx) {
                let gettext = AppComponent.self.portfolio_acc.Items[idx].Text;
                if (accData + "" === gettext)
                    portfolioCheckFlag = false;
            }
            if (portfolioCheckFlag)
                AppComponent.self.portfolio_acc.addItem({ Text: accData + "", Value: portfolioAccLen + "" });
            // ----------------------
            let accSec: number = data[i].secucategory;
            if (accTableRows === 0) {  // add
                if (accSec === 1) {
                    AppComponent.self.addAccountEquitInfo(data[i]);
                }
                else if (accSec === 2) {
                    AppComponent.self.addAccountFutureInfo(data[i]);
                }
            }
            else {
                let checkFlag: boolean = false;
                for (let j = 0; j < accTableRows; ++j) {
                    let getAcc = AppComponent.self.accountTable.rows[j].cells[0].Text;
                    let getSec = AppComponent.self.accountTable.rows[j].cells[1].Text;
                    if (getAcc === accData && getSec === accSec) {  // refresh
                        checkFlag = true;
                        if (getSec === 1) {
                            AppComponent.self.refreshAccountEquiteInfo(data[i], j);
                        } else if (getSec === 2) {
                            AppComponent.self.refreshAccountFutureInfo(data[i], j);
                        }
                    }
                }

                if (!checkFlag) {   // add
                    if (accSec === 1) {
                        AppComponent.self.addAccountEquitInfo(data[i]);
                    } else if (accSec === 2) {
                        AppComponent.self.addAccountFutureInfo(data[i]);
                    }
                }
                checkFlag = false;
            }
        }
        AppComponent.self.accountTable.detectChanges();
    }

    addAccountEquitInfo(obj: any) {
        let row = AppComponent.self.accountTable.newRow();
        row.cells[0].Text = obj.record.account;
        row.cells[1].Text = obj.secucategory;
        row.cells[2].Text = obj.record.TotalAmount / 10000;
        row.cells[3].Text = obj.record.AvlAmount / 10000;
        row.cells[4].Text = obj.record.FrzAmount / 10000;
        row.cells[5].Text = obj.record.date;
        row.cells[6].Text = obj.record.c;
        if (obj.market !== 0 && obj.market === SECU_MARKET.SM_SH)
            row.cells[7].Text = obj.record.AvlAmount / 10000;
        else
            row.cells[7].Text = 0;
        if (obj.market !== 0 && obj.market === SECU_MARKET.SM_SZ)
            row.cells[8].Text = obj.record.AvlAmount / 10000;
        else
            row.cells[8].Text = 0;
        row.cells[9].Text = 0;
        row.cells[10].Text = 0;
        row.cells[11].Text = 0;
        row.cells[12].Text = 0;
        row.cells[13].Text = 0;
        row.cells[14].Text = 0;
        row.cells[15].Text = 0;
        row.cells[16].Text = 0;
    }

    addAccountFutureInfo(obj: any) {
        let row = AppComponent.self.accountTable.newRow();
        row.cells[0].Text = obj.record.account;
        row.cells[1].Text = obj.secucategory;
        row.cells[2].Text = obj.record.TotalAmount / 10000;
        row.cells[3].Text = obj.record.AvlAmount / 10000;
        row.cells[4].Text = obj.record.FrzAmount / 10000;
        row.cells[5].Text = obj.record.date;
        row.cells[6].Text = obj.record.c;
        row.cells[7].Text = 0;
        row.cells[8].Text = 0;
        row.cells[9].Text = obj.record.BuyFrzAmt / 10000;
        row.cells[10].Text = obj.record.SellFrzAmt / 10000;
        row.cells[11].Text = obj.record.BuyMargin / 10000;
        row.cells[12].Text = obj.record.SellMargin / 10000;
        row.cells[13].Text = obj.record.TotalMargin / 10000;
        row.cells[14].Text = obj.record.Fee / 10000;
        row.cells[15].Text = obj.record.PositionPL / 10000;
        row.cells[16].Text = obj.record.ClosePL / 10000;
    }

    refreshAccountEquiteInfo(obj: any, idx: number) {
        if (obj.market === SECU_MARKET.SM_SH)
            AppComponent.self.accountTable.rows[idx].cells[7].Text = obj.record.AvlAmount / 10000;
        else if (obj.market === SECU_MARKET.SM_SZ)
            AppComponent.self.accountTable.rows[idx].cells[8].Text = obj.record.AvlAmount / 10000;

        AppComponent.self.accountTable.rows[idx].cells[2].Text = obj.record.TotalAmount / 10000;
        AppComponent.self.accountTable.rows[idx].cells[3].Text = obj.record.AvlAmount / 10000;
        AppComponent.self.accountTable.rows[idx].cells[4].Text = obj.record.FrzAmount / 10000;
        AppComponent.self.accountTable.rows[idx].cells[5].Text = obj.record.date;
        AppComponent.self.accountTable.rows[idx].cells[6].Text = obj.record.c;
    }

    refreshAccountFutureInfo(obj: any, idx: number) {
        AppComponent.self.accountTable.rows[idx].cells[2].Text = obj.record.TotalAmount / 10000;
        AppComponent.self.accountTable.rows[idx].cells[3].Text = obj.record.AvlAmount / 10000;
        AppComponent.self.accountTable.rows[idx].cells[4].Text = obj.record.FrzAmount / 10000;
        AppComponent.self.accountTable.rows[idx].cells[5].Text = obj.record.date;
        AppComponent.self.accountTable.rows[idx].cells[6].Text = obj.record.c;
        AppComponent.self.accountTable.rows[idx].cells[9].Text = obj.record.BuyFrzAmt / 10000;
        AppComponent.self.accountTable.rows[idx].cells[10].Text = obj.record.SellFrzAmt / 10000;
        AppComponent.self.accountTable.rows[idx].cells[11].Text = obj.record.BuyMargin / 10000;
        AppComponent.self.accountTable.rows[idx].cells[12].Text = obj.record.SellMargin / 10000;
        AppComponent.self.accountTable.rows[idx].cells[13].Text = obj.record.TotalMargin / 10000;
        AppComponent.self.accountTable.rows[idx].cells[14].Text = obj.record.Fee / 10000;
        AppComponent.self.accountTable.rows[idx].cells[15].Text = obj.record.PositionPL / 10000;
        AppComponent.self.accountTable.rows[idx].cells[16].Text = obj.record.ClosePL / 10000;
    }

    showStrategyCfg(data: any) {
        if (this.strategyTable.rows.length === 0)   // table without strategy item
            return;

        let needInsert = false;
        const kInitColumns = 10;
        let strategyid;
        let strategyKeyMap;
        for (let iRow = 0; iRow < this.strategyTable.rows.length; ++iRow) {   // find row in strategy table
            strategyid = this.strategyTable.rows[iRow].cells[0].Text;
            strategyKeyMap = this.strategyMap[strategyid];

            for (let iData = 0; iData < data.length; ++iData) {
                if (data[iData].strategyid !== strategyid)
                    continue;

                switch (data[iData].type) {
                    case StrategyCfgType.STRATEGY_CFG_TYPE_INSTRUMENT:
                        let idxInstrument = strategyKeyMap.instruments.indexOf(data[iData].key);
                        let secuinfo = this.secuinfo.getSecuinfoByUKey(data[iData].value);
                        let symbolCode = secuinfo.hasOwnProperty(data[iData].value) ? secuinfo[data[iData].value].SecuCode : "";

                        if (idxInstrument < 0) { // add
                            if (data[iData].key === 1 || data[iData].key === 2) {
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
                            let iCol = kInitColumns + strategyKeyMap.comments1.length + strategyKeyMap.commands.length + paramIdx;
                            this.strategyTable.rows[iRow].cells[iCol].Type = "textbox";
                            this.strategyTable.rows[iRow].cells[iCol].Text = (data[iData].value / Math.pow(10, data[iData].decimal)).toFixed(data[iData].decimal);
                            this.strategyTable.rows[iRow].cells[iCol].Data = data[iData];
                            this.strategyTable.rows[iRow].cells[iCol].Class = data[iData].level === 10 ? "warning" : "default";
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
                            let iCol = kInitColumns + commentIdx;
                            this.strategyTable.rows[iRow].cells[iCol].Text = (data[iData].value / Math.pow(10, data[iData].decimal)).toFixed(data[iData].decimal);
                            this.strategyTable.rows[iRow].cells[iCol].Class = data[iData].level === 10 ? "warning" : "default";
                        }
                        break;
                    case StrategyCfgType.STRATEGY_CFG_TYPE_COMMAND:
                        let commandIdx = strategyKeyMap.commands.findIndex(item => { return data[iData].key === item.key; });
                        if (commandIdx < 0) { // add
                            strategyKeyMap.commands.push(data[iData]);
                            needInsert = true;
                        } else { // update
                            let iCol = kInitColumns + strategyKeyMap.comments1.length + commandIdx;
                            this.strategyTable.rows[iRow].cells[iCol].Text = data[iData].name;
                            this.strategyTable.rows[iRow].cells[iCol].Data = data[iData];
                            this.strategyTable.rows[iRow].cells[iCol].Type = "button";
                            this.strategyTable.rows[iRow].cells[iCol].Class = "primary";
                            this.strategyTable.rows[iRow].cells[iCol].Disable = data[iData].value === 0;
                        }
                        break;
                }
            }

            if (needInsert) {
                let row: DataTableRow;
                let offset = kInitColumns;
                if (this.option.config["strategy_table"] === undefined)
                    this.option.config["strategy_table"] = { columnHideIDs: [] };

                strategyKeyMap.comments1.forEach((item, idx) => {
                    this.strategyTable.addColumn(this.langServ.getTranslateInfo(this.languageType, item.name));
                    this.strategyTable.rows[iRow].cells[offset + idx].Text = (item.value / Math.pow(10, item.decimal)).toFixed(item.decimal);
                    this.strategyTable.rows[iRow].cells[offset + idx].Class = item.level === 10 ? "warning" : "default";
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
                    this.strategyTable.addColumn(this.langServ.getTranslateInfo(this.languageType, item.name));
                    this.strategyTable.rows[iRow].cells[offset + idx].Text = item.name;
                    this.strategyTable.rows[iRow].cells[offset + idx].Data = item;
                    this.strategyTable.rows[iRow].cells[offset + idx].Type = "button";
                    this.strategyTable.rows[iRow].cells[offset + idx].Class = "primary";
                    this.strategyTable.rows[iRow].cells[offset + idx].Disable = item.value === 0;
                });

                offset += strategyKeyMap.commands.length;
                strategyKeyMap.parameters.forEach((item, idx) => {
                    this.strategyTable.addColumn(this.langServ.getTranslateInfo(this.languageType, item.name));
                    this.strategyTable.rows[iRow].cells[offset + idx].Type = "textbox";
                    this.strategyTable.rows[iRow].cells[offset + idx].Text = (item.value / Math.pow(10, item.decimal)).toFixed(item.decimal);
                    this.strategyTable.rows[iRow].cells[offset + idx].Class = item.level === 10 ? "warning" : "default";
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
                    this.strategyTable.addColumn(this.langServ.getTranslateInfo(this.languageType, "comment"));
                    this.strategyTable.rows[iRow].cells[offset].Text = "comment";
                    this.strategyTable.rows[iRow].cells[offset].Type = "button";
                    this.strategyTable.rows[iRow].cells[offset].Class = "primary";
                }
            }

            strategyKeyMap = null;
        }

        this.strategyTable.detectChanges();
    }

    strategyOnCellClick(cell: any, cellIdx: number, rowIdx: number) {
        if (cell.Text === "submit") {  // submit
            let strategyKeyMap = this.strategyMap[this.strategyTable.rows[rowIdx].cells[0].Text];
            let paramIdx = 10 + strategyKeyMap.comments1.length + strategyKeyMap.commands.length;
            let dvalue = 0;
            let cell;

            strategyKeyMap.parameters.forEach((item, idx) => {
                cell = this.strategyTable.rows[rowIdx].cells[idx + paramIdx];
                dvalue = Math.round(cell.Text * Math.pow(10, item.decimal));
                if (item.value !== dvalue) {
                    item.value = dvalue;
                    AppComponent.bgWorker.send({ command: "ss-send", params: { type: "submitPara", data: [item] } });
                }
            });

            return;
        }

        if (cell.Text === "comment") {
            this.commentTable.rows.length = 0;

            this.strategyMap[this.strategyTable.rows[rowIdx].cells[0].Text].comments2.forEach(item => {
                let row = this.commentTable.newRow();
                row.cells[0].Text = this.langServ.getTranslateInfo(this.languageType, item.name);
                row.cells[1].Text = item.value;
            });

            Dialog.popup(this, this.commentContent, { title: this.langServ.getTranslateInfo(this.languageType, "Comment"), height: 450 });
            return;
        }

        let strategyId: number = AppComponent.self.strategyTable.rows[rowIdx].cells[0].Text;
        if (cell.dataSource.text === "start") {
            AppComponent.self.operateSteategy(strategyId, cellIdx, rowIdx, 0);
        } else if (cell.dataSource.text === "pause") {
            AppComponent.self.operateSteategy(strategyId, cellIdx, rowIdx, 1);
        } else if (cell.dataSource.text === "stop") {
            AppComponent.self.operateSteategy(strategyId, cellIdx, rowIdx, 2);
        } else if (cell.dataSource.text === "watch") {
            AppComponent.self.operateSteategy(strategyId, cellIdx, rowIdx, 3);
        } else {
            if (cell.Data === undefined || cell.Data.type !== StrategyCfgType.STRATEGY_CFG_TYPE_COMMAND)
                return;

            if (cell.Data.level > 9) {
                if (confirm("extute " + cell.Data.name + " ?"))
                    AppComponent.bgWorker.send({ command: "ss-send", params: { type: "submitPara", data: [cell.Data] } });
            } else {
                AppComponent.bgWorker.send({ command: "ss-send", params: { type: "submitPara", data: [cell.Data] } });
            }

        }
    }

    operateSteategy(strategyid: number, cellidx: number, rowIdx: number, tip: number) {
        AppComponent.self.showStraContrlDisable(tip, cellidx, rowIdx);
        AppComponent.bgWorker.send({ command: "ss-send", params: { type: "strategyControl", data: { tip: tip, strategyid: strategyid } } });
    }

    showStraContrlDisable(Ctrltype: number, cellIdx: number, rowIdx: number) {
        if (Ctrltype === 0) {
            AppComponent.self.strategyTable.rows[rowIdx].cells[cellIdx].Disable = true;
            AppComponent.self.strategyTable.rows[rowIdx].cells[cellIdx + 1].Disable = false;
            AppComponent.self.strategyTable.rows[rowIdx].cells[cellIdx + 2].Disable = false;
            AppComponent.self.strategyTable.rows[rowIdx].cells[cellIdx + 3].Disable = false;
        } else if (Ctrltype === 1) {
            AppComponent.self.strategyTable.rows[rowIdx].cells[cellIdx].Disable = true;
            AppComponent.self.strategyTable.rows[rowIdx].cells[cellIdx + 1].Disable = false;
            AppComponent.self.strategyTable.rows[rowIdx].cells[cellIdx + 2].Disable = false;
            AppComponent.self.strategyTable.rows[rowIdx].cells[cellIdx - 1].Disable = false;
        } else if (Ctrltype === 2) {
            AppComponent.self.strategyTable.rows[rowIdx].cells[cellIdx].Disable = true;
            AppComponent.self.strategyTable.rows[rowIdx].cells[cellIdx + 1].Disable = false;
            AppComponent.self.strategyTable.rows[rowIdx].cells[cellIdx - 2].Disable = false;
            AppComponent.self.strategyTable.rows[rowIdx].cells[cellIdx - 1].Disable = true;
        }
        else if (Ctrltype === 3) {
            AppComponent.self.strategyTable.rows[rowIdx].cells[cellIdx].Disable = true;
            AppComponent.self.strategyTable.rows[rowIdx].cells[cellIdx - 3].Disable = false;
            AppComponent.self.strategyTable.rows[rowIdx].cells[cellIdx - 2].Disable = false;
            AppComponent.self.strategyTable.rows[rowIdx].cells[cellIdx - 1].Disable = false;
        }
    }

    showBasketBackInfo(data: any) {
        let account = data[0].account;
        if (account !== parseInt(this.portfolio_acc.SelectedItem.Text))
            return;
        let count = data[0].count;
        this.portfolioCount.Text = count;
        let tableData = data[0].data;
        let dataLen = data[0].data.length;

        for (let i = 0; i < dataLen; ++i) {
            let j;

            for (j = 0; j < this.portfolioTable.rows.length; ++j) {
                if (this.portfolioTable.rows[j].cells[0].Data.ukey === tableData[i].UKey) {
                    this.refreshPortfolioTable(j, tableData[i]);
                    break;
                }
            }

            if (j === this.portfolioTable.rows.length) {
                this.addPortfolioTableInfo(tableData[i], dataLen, i);
            }
        }

        AppComponent.self.portfolioTable.detectChanges();
    }

    addPortfolioTableInfo(tableData: any, len: number, idx: number) {
        let row = AppComponent.self.portfolioTable.newRow();
        let ukey = tableData.UKey;
        let codeInfo = this.secuinfo.getSecuinfoByUKey(ukey);
        if (codeInfo) {
            row.cells[0].Type = "checkbox";
            row.cells[0].Title = codeInfo.hasOwnProperty(ukey) ? codeInfo[ukey].SecuCode : "unknown";
            row.cells[0].Data = ukey;
            row.cells[1].Text = codeInfo.hasOwnProperty(ukey) ? codeInfo[ukey].SecuAbbr : "unknown";
            row.cells[2].Text = tableData.InitPos;
            row.cells[3].Text = tableData.TgtPos;
            row.cells[4].Text = tableData.CurrPos;
            row.cells[5].Text = tableData.Diff;
            row.cells[6].Text = tableData.Traded;
            row.cells[7].Text = tableData.Percentage + "%";
            row.cells[8].Text = tableData.WorkingVol;
            row.cells[9].Type = "textbox";
            row.cells[9].Text = 0;
            row.cells[10].Type = "button";
            row.cells[10].Text = "Send";
            row.cells[11].Type = "button";
            row.cells[11].Text = "Cancel";
            let flag = tableData.Flag;
            if (flag === 1) {
                row.cells[0].Disable = true;
                row.cells[0].Text = true;
                row.cells[10].Disable = true;
                row.cells[11].Disable = true;
                row.cells[12].Text = "Suspended";
            } else if (flag === 2) {
                row.cells[0].Disable = true;
                row.cells[0].Text = true;
                row.cells[10].Disable = true;
                row.cells[11].Disable = true;
                row.cells[12].Text = "Restrict";
            } else if (flag === 3) {
                row.cells[0].Disable = false;
                row.cells[0].Text = false;
                row.cells[10].Disable = false;
                row.cells[11].Disable = false;
                row.cells[12].Text = "LimitUp";
            } else if (flag === 4) {
                row.cells[0].Disable = false;
                row.cells[0].Text = false;
                row.cells[10].Disable = false;
                row.cells[11].Disable = false;
                row.cells[12].Text = "LimitDown";
            } else {
                row.cells[0].Disable = false;
                row.cells[0].Text = false;
                row.cells[10].Disable = false;
                row.cells[11].Disable = false;
                row.cells[12].Text = "Normal";
            }
            row.cells[13].Text = tableData.PreClose / 10000;
            row.cells[14].Text = tableData.LastPrice / 10000;
            row.cells[15].Text = tableData.BidSize;
            row.cells[16].Text = tableData.BidPrice / 10000;
            row.cells[17].Text = tableData.AskSize;
            row.cells[18].Text = tableData.AskPrice / 10000;
            row.cells[19].Text = tableData.AvgBuyPrice / 10000;
            row.cells[20].Text = tableData.AvgSellPrice / 10000;
            row.cells[21].Text = tableData.PreValue / 10000;
            row.cells[22].Text = tableData.ValueCon / 10000;
            row.cells[23].Text = tableData.DayPnLCon / 10000;
            row.cells[24].Text = tableData.ONPnLCon / 10000;
        }

        this.portfolioCount.Text = this.portfolioTable.rows.length;
    }

    refreshPortfolioTable(idx: number, tableData: any) {
        let ukey = tableData.UKey;
        this.portfolioTable.rows[idx].cells[2].Text = tableData.InitPos;
        this.portfolioTable.rows[idx].cells[3].Text = tableData.TgtPos;
        this.portfolioTable.rows[idx].cells[4].Text = tableData.CurrPos;
        this.portfolioTable.rows[idx].cells[5].Text = tableData.Diff;
        this.portfolioTable.rows[idx].cells[6].Text = tableData.Traded;
        this.portfolioTable.rows[idx].cells[7].Text = tableData.Percentage / 100 + "%";
        this.portfolioTable.rows[idx].cells[8].Text = tableData.WorkingVol;
        let flag = tableData.Flag;
        // 0 check value ,10,11 disable,12 value, row backcolor
        if (flag === 1) {
            this.portfolioTable.rows[idx].cells[0].Disable = true;
            this.portfolioTable.rows[idx].cells[0].Data.chk = true;
            this.portfolioTable.rows[idx].cells[10].Disable = true;
            this.portfolioTable.rows[idx].cells[11].Disable = true;
            this.portfolioTable.rows[idx].cells[12].Text = "Suspended";
            this.portfolioTable.rows[idx].backgroundColor = "#424242";
        } else if (flag === 2) {
            this.portfolioTable.rows[idx].cells[0].Disable = true;
            this.portfolioTable.rows[idx].cells[0].Data.chk = true;
            this.portfolioTable.rows[idx].cells[10].Disable = true;
            this.portfolioTable.rows[idx].cells[11].Disable = true;
            this.portfolioTable.rows[idx].cells[12].Text = "Restrict";
            this.portfolioTable.rows[idx].backgroundColor = "#424242";
        } else if (flag === 3) {
            this.portfolioTable.rows[idx].cells[0].Disable = false;
            this.portfolioTable.rows[idx].cells[0].Data.chk = false;
            this.portfolioTable.rows[idx].cells[10].Disable = false;
            this.portfolioTable.rows[idx].cells[11].Disable = false;
            this.portfolioTable.rows[idx].cells[12].Text = "LimitUp";
            this.portfolioTable.rows[idx].backgroundColor = "#00FF00";
        } else if (flag === 4) {
            this.portfolioTable.rows[idx].cells[0].Disable = false;
            this.portfolioTable.rows[idx].cells[0].Data.chk = false;
            this.portfolioTable.rows[idx].cells[10].Disable = false;
            this.portfolioTable.rows[idx].cells[11].Disable = false;
            this.portfolioTable.rows[idx].cells[12].Text = "LimitDown";
            this.portfolioTable.rows[idx].backgroundColor = "#FF0000";
        } else {
            this.portfolioTable.rows[idx].cells[0].Disable = false;
            this.portfolioTable.rows[idx].cells[0].Data.chk = false;
            this.portfolioTable.rows[idx].cells[10].Disable = false;
            this.portfolioTable.rows[idx].cells[11].Disable = false;
            this.portfolioTable.rows[idx].cells[12].Text = "Normal";
            this.portfolioTable.rows[idx].backgroundColor = null;
        }
        this.portfolioTable.rows[idx].cells[13].Text = tableData.PreClose / 10000;
        this.portfolioTable.rows[idx].cells[14].Text = tableData.LastPrice / 10000;
        this.portfolioTable.rows[idx].cells[15].Text = tableData.BidSize;
        this.portfolioTable.rows[idx].cells[16].Text = tableData.BidPrice / 10000;
        this.portfolioTable.rows[idx].cells[17].Text = tableData.AskSize;
        this.portfolioTable.rows[idx].cells[18].Text = tableData.AskPrice / 10000;
        this.portfolioTable.rows[idx].cells[19].Text = tableData.AvgBuyPrice / 10000;
        this.portfolioTable.rows[idx].cells[20].Text = tableData.AvgSellPrice / 10000;
        this.portfolioTable.rows[idx].cells[21].Text = tableData.PreValue / 10000;
        this.portfolioTable.rows[idx].cells[22].Text = tableData.ValueCon / 10000;
        this.portfolioTable.rows[idx].cells[23].Text = tableData.DayPnLCon / 10000;
        this.portfolioTable.rows[idx].cells[24].Text = tableData.ONPnLCon / 10000;
        this.portfolioCount.Text = this.portfolioTable.rows.length;
    }

    showPortfolioSummary(data: any) {
        this.portfolioLabel.Text = data[0].value / 10000;
        this.portfolioDaypnl.Text = data[0].dayPnl / 10000;
        this.portfolioonpnl.Text = data[0].onPnl / 10000;
    }

    changeItems(type: number, check: boolean) {    // check if opposite
        let len = AppComponent.self.portfolioTable.rows.length;

        for (let i = 0; i < len; ++i) {

            switch (type) {
                case 0:
                    AppComponent.self.portfolioTable.rows[i].cells[0].Text = check;
                    break;
                case 1:
                    if (AppComponent.self.portfolioTable.rows[i].cells[3].Text > 0) {
                        AppComponent.self.portfolioTable.rows[i].cells[0].Text = check;
                    }
                    break;
                case 2:
                    if (AppComponent.self.portfolioTable.rows[i].cells[3].Text < 0) {
                        AppComponent.self.portfolioTable.rows[i].cells[0].Text = check;
                    }
                    break;
            }
        }
    }

    getSelectedPortfolioItem() {
        let res = [];
        let len = AppComponent.self.portfolioTable.rows.length;

        for (let i = 0; i < len; ++i) {
            if (AppComponent.self.portfolioTable.rows[i].cells[0].Text)
                res.push(AppComponent.self.portfolioTable.rows[i].cells[0].Data);
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
        let i = 10;
        for (; i < fstStrategy.comments1.length; ++i) {
            this.strategyTable.columns[i].hidden = this.option.config["strategy_table"].columnHideIDs.includes(this.strategyTable.columns[i].key);
        }

        i += fstStrategy.commands.length;
        for (; i < fstStrategy.parameters.length; ++i) {
            this.strategyTable.columns[i].hidden = this.option.config["strategy_table"].columnHideIDs.includes(this.strategyTable.columns[i].key);
        }
    }

    createBookView(bookviewID) {
        let bookviewPage = new TabPage(bookviewID, this.langServ.getTranslateInfo(this.languageType, "BookView"));
        this.modules[bookviewID] = bookviewPage;

        let bookviewHeader = new HBox();
        let dd_symbol = new DropDown();
        dd_symbol.AcceptInput = true;
        let codeRtn = this.langServ.getTranslateInfo(this.languageType, "Code");
        dd_symbol.Title = codeRtn + ": ";
        let self = this;
        let bookViewTable = new DataTable("table2");
        bookViewTable.align = "right";
        dd_symbol.SelectChange = () => {
            this.clearBookViewTable(bookViewTable);
            // bind bookivewID, and subscribe code
            let tempCodeList = [];
            let bookcodeFlag: boolean = false;
            let subscribecode = (dd_symbol.SelectedItem.Value).split(",")[2];
            for (let i = 0; i < AppComponent.self.bookviewArr.length; ++i) {
                tempCodeList.push(parseInt(AppComponent.self.bookviewArr[i].code));
                if (AppComponent.self.bookviewArr[i].bookview === bookviewID) {
                    tempCodeList.splice(i, 1);
                    tempCodeList.push(parseInt(subscribecode));
                    bookcodeFlag = true;
                    AppComponent.self.bookviewArr[i].code = subscribecode;
                }
            }

            if (!bookcodeFlag) {
                this.bookviewArr.push({ bookview: bookviewID, code: subscribecode, table: bookViewTable });
                tempCodeList.push(parseInt(subscribecode));
            }

            this.subscribeMarketData(tempCodeList);
        };

        dd_symbol.matchMethod = (inputText) => {
            let len = inputText.length;
            let sendStr: string = "";
            for (let i = 0; i < len; ++i) {
                let bcheck = (/^[a-z]+$/).test(inputText.charAt(i));
                if (bcheck) {
                    sendStr += inputText.charAt(i).toLocaleUpperCase();
                }
                else {
                    sendStr += inputText.charAt(i);
                }
            }
            let msg = this.secuinfo.getCodeList(sendStr);
            let rtnArr = [];
            dd_symbol.Items.length = 0;
            let msgLen = msg.length;
            for (let i = 0; i < msgLen; ++i) {
                if (msg[i].SecuAbbr === msg[i].symbolCode)
                    rtnArr.push({ Text: msg[i].symbolCode, Value: msg[i].code + "," + msg[i].symbolCode + "," + msg[i].ukey });
                else
                    rtnArr.push({ Text: msg[i].symbolCode + " " + msg[i].SecuAbbr, Value: msg[i].code + "," + msg[i].symbolCode + "," + msg[i].ukey });
            }

            return rtnArr;
        };

        bookviewHeader.addChild(dd_symbol);

        let bookviewTableArr: string[] = ["BidVol", "Price", "AskVol", "TransVol"];
        let bookviewRtnArr: string[] = [];
        let bookviewTittleLen = bookviewTableArr.length;
        for (let i = 0; i < bookviewTittleLen; ++i) {
            let bookviewRtn = this.langServ.getTranslateInfo(this.languageType, bookviewTableArr[i]);
            bookviewRtnArr.push(bookviewRtn);
        }
        bookviewRtnArr.forEach(item => {
            bookViewTable.addColumn(item);
        });
        for (let i = 0; i < 20; ++i) {
            let row = bookViewTable.newRow();
            row.cells[0].bgColor = "#FE6635";
            row.cells[0].Text = "";
            row.cells[1].bgColor = "#5895ca";
            row.cells[2].bgColor = "#D31d45";
            row.cells[3].bgColor = "transparent";
        }
        let bHead = false;
        bookViewTable.onCellClick = (cellItem, cellIndex, rowIndex) => {
            // console.info(cellIndex, rowIndex);
        };
        bookViewTable.onRowDBClick = (rowItem, rowIndex) => {
            if (dd_symbol.SelectedItem !== null) {
                [this.txt_UKey.Text, this.txt_Symbol.Text] = dd_symbol.SelectedItem.Value.split(",");
                this.txt_Price.Text = rowItem.cells[1].Text;
                this.dd_Action.SelectedItem = (rowItem.cells[0].Text === "") ? this.dd_Action.Items[1] : this.dd_Action.Items[0];
            }
            let tradeRtn = this.langServ.getTranslateInfo(this.languageType, "Trade");
            Dialog.popup(this, this.tradeContent, { title: tradeRtn, height: 300 });
        };
        let bookViewContent = new VBox();
        bookViewContent.addChild(bookviewHeader);
        bookViewContent.addChild(bookViewTable);
        bookviewPage.setContent(bookViewContent);
        return bookviewPage;
    }

    clearBookViewTable(bookViewTable) {
        let len = bookViewTable.rows.length;
        for (let i = 0; i < len; ++i) {
            bookViewTable.rows[i].cells[0].Text = "";
            bookViewTable.rows[i].cells[1].Text = "";
            bookViewTable.rows[i].cells[2].Text = "";
        }
    }

    subscribeMarketData(codes: any) {
        AppComponent.bgWorker.send({ command: "ps-send", params: { appid: 17, packid: 101, msg: { topic: 3112, kwlist: codes } } });
    }

    onDestroy() {
        AppComponent.bgWorker.dispose();
        File.writeSync(`${Environment.getDataPath(this.option.name)}/layout.json`, this.main.getLayout());
        File.writeSync(`${Environment.getDataPath(this.option.name)}/config.json`, this.option.config);
    }

    onResize(event: any) {
        // minus 10 to remove the window's border.
        this.main.reallocSize(event.currentTarget.document.body.clientWidth - 10, event.currentTarget.document.body.clientHeight - 27);
        this.ref.detectChanges();
    }

    createBackgroundWork() {
        AppComponent.bgWorker.onData = data => {
            switch (data.event) {
                case "ps-data":
                    for (let idx = 0; idx < this.bookviewArr.length; ++idx) {
                        if (parseInt(this.bookviewArr[idx].code) === data.content.content.ukey) {
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
                    break;
                case "ss-close":
                    break;
                case "ss-data":
                    // console.info(`ss-data: type=${data.content.type}, len=${data.content.data.length}`);
                    // let timer = Date.now();
                    switch (data.content.type) {
                        case 2011:
                        case 2033:
                            this.showStrategyInfo(data.content.data);
                            break;
                        case 2000:
                        case 2002:
                        case 2004:
                        case 2049:
                        case 2030:
                        case 2029:
                        case 2032:
                            this.showStrategyCfg(data.content.data);
                            break;
                        case 2031:
                        case 2050:
                        case 2001:
                        case 2003:
                        case 2005:
                            this.showGuiCmdAck(data.content);
                            break;
                        case 2048:
                            this.showComTotalProfitInfo(data.content.data);
                            break;
                        case 2013:
                            this.showComAccountPos(data.content.data);
                            break;
                        case 3502:
                        case 3504:
                            this.showComRecordPos(data.content.data);
                            break;
                        case 2015:
                        case 2017:
                            this.showComGWNetGuiInfo(data.content.data);
                            break;
                        case 2023:
                            this.showComProfitInfo(data.content.data);
                            break;
                        case 2025:
                            this.showStatArbOrder(data.content.data);
                            break;
                        case 5022:
                        case 2021:
                            this.showComorderstatusAndErrorInfo(data.content.data);
                            break;
                        case 2022:
                        case 3011:
                        case 3510:
                            this.showComOrderRecord(data.content.data);
                            break;
                        case 2040:
                            this.showLog(data.content.data);
                            break;
                        case 5021:
                            this.showBasketBackInfo(data.content.data);
                            break;
                        case 5024:
                            this.showPortfolioSummary(data.content.data);
                            break;
                        case 8000:
                            this.changeSSstatus(data.content.data);
                            break;
                        default:
                            console.error(`unhandled type=${data.content.type}`);
                            break;
                    }

                    // console.debug(`elapsed time: ${Date.now() - timer}`);
                    break;
                default:
                    break;
            }
        };
    }
}



