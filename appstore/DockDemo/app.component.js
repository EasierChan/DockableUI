"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var control_1 = require("../../base/controls/control");
var control_2 = require("../../base/controls/control");
var AppComponent = (function () {
    function AppComponent() {
        this.className = "dock-container vertical";
        this.children = [];
    }
    AppComponent.prototype.ngOnInit = function () {
        // this.className = "dock-container vertical";
        // row 1
        var row1 = new control_1.DockContainer("h", null, 400);
        var leftPanel = new control_1.TabPanel();
        var orderstatusPage = new control_1.TabPage("OrderStatus", "OrderStatus");
        var orderstatusContent = new control_2.ComboControl("col");
        var orderstatusHeader = new control_2.ComboControl("row");
        var cb_handle = new control_2.MetaControl("checkbox");
        cb_handle.Text = "Handle";
        orderstatusHeader.addChild(cb_handle);
        var dropdown = new control_1.DropDown();
        dropdown.addItem({ Text: "all    ", Value: "-1" });
        dropdown.addItem({ Text: "0.无效", Value: "0" });
        dropdown.addItem({ Text: "1.未报", Value: "1" });
        dropdown.addItem({ Text: "2.待报", Value: "2" });
        dropdown.addItem({ Text: "3.已报", Value: "3" });
        dropdown.addItem({ Text: "4.已报待撤", Value: "4" });
        orderstatusHeader.addChild(dropdown);
        var cb_selectAll = new control_2.MetaControl("checkbox");
        cb_selectAll.Text = "Select All";
        orderstatusHeader.addChild(cb_selectAll);
        var btn_cancel = new control_2.MetaControl("button");
        btn_cancel.Text = "Cancel Selected";
        orderstatusHeader.addChild(btn_cancel);
        var btn_resupply = new control_2.MetaControl("button");
        btn_resupply.Text = "Resupply";
        orderstatusHeader.addChild(btn_resupply);
        orderstatusContent.addChild(orderstatusHeader);
        var orderstatusTable = new control_1.DataTable();
        orderstatusTable.addColumn("U-Key", "Symbol", "OrderId", "Time", "Strategy", "Ask/Bid", "Price", "OrderVol", "DoneVol", "Status", "Account");
        orderstatusContent.addChild(orderstatusTable);
        orderstatusPage.setContent(orderstatusContent);
        leftPanel.addTab(orderstatusPage);
        var doneOrdersPage = new control_1.TabPage("DoneOrders", "DoneOrders");
        var doneOrdersContent = new control_2.ComboControl("col");
        var doneOrdersTable = new control_1.DataTable();
        doneOrdersTable.addColumn("U-Key", "Symbol", "OrderId", "Strategy", "Ask/Bid", "Price", "DoneVol", "Status", "Time", "OrderVol", "OrderType", "Account", "OrderTime", "OrderPrice", "SymbolCode");
        doneOrdersContent.addChild(doneOrdersTable);
        doneOrdersPage.setContent(doneOrdersContent);
        leftPanel.addTab(doneOrdersPage);
        leftPanel.setActive("OrderStatus");
        var row1col1 = new control_1.DockContainer("v", 500, null).addChild(leftPanel);
        // col 1
        row1.addChild(row1col1);
        // Splitter
        row1.addChild(new control_1.Splitter("v"));
        // col 2
        var leftAlign = 20;
        var rowSep = 5;
        var rightPanel = new control_1.TabPanel();
        var tradePage = new control_1.TabPage("ManulTrader", "ManulTrader");
        var tradeContent = new control_2.ComboControl("col");
        tradeContent.MinHeight = 500;
        tradeContent.MinWidth = 500;
        var dd_Account = new control_1.DropDown();
        dd_Account.Text = "Account:   ";
        dd_Account.addItem({ Text: "666600000010", Value: "0" });
        dd_Account.Left = leftAlign;
        dd_Account.Top = 20;
        tradeContent.addChild(dd_Account);
        var dd_Strategy = new control_1.DropDown();
        dd_Strategy.Left = leftAlign;
        dd_Strategy.Top = rowSep;
        dd_Strategy.Text = "Strategy:  ";
        dd_Strategy.addItem({ Text: "110", Value: "0" });
        tradeContent.addChild(dd_Strategy);
        var txt_Symbol = new control_2.MetaControl("textbox");
        txt_Symbol.Left = leftAlign;
        txt_Symbol.Top = rowSep;
        txt_Symbol.Text = "Symbol:    ";
        tradeContent.addChild(txt_Symbol);
        var txt_UKey = new control_2.MetaControl("textbox");
        txt_UKey.Left = leftAlign;
        txt_UKey.Top = rowSep;
        txt_UKey.Text = "UKey:      ";
        tradeContent.addChild(txt_UKey);
        var txt_Price = new control_2.MetaControl("textbox");
        txt_Price.Left = leftAlign;
        txt_Price.Top = rowSep;
        txt_Price.Text = "Price:     ";
        tradeContent.addChild(txt_Price);
        var txt_Volume = new control_2.MetaControl("textbox");
        txt_Volume.Left = leftAlign;
        txt_Volume.Top = rowSep;
        txt_Volume.Text = "Volume:    ";
        tradeContent.addChild(txt_Volume);
        var dd_Action = new control_1.DropDown();
        dd_Action.Left = leftAlign;
        dd_Action.Top = rowSep;
        dd_Action.Text = "Action:    ";
        dd_Action.addItem({ Text: "Buy", Value: "0" });
        tradeContent.addChild(dd_Action);
        var btn_row = new control_2.ComboControl("row");
        var btn_clear = new control_2.MetaControl("button");
        btn_clear.Left = leftAlign;
        btn_clear.Text = "Clear";
        btn_row.addChild(btn_clear);
        var btn_submit = new control_2.MetaControl("button");
        btn_submit.Left = 30;
        btn_submit.Text = "Submit";
        btn_row.addChild(btn_submit);
        tradeContent.addChild(btn_row);
        tradePage.setContent(tradeContent);
        rightPanel.addTab(tradePage);
        rightPanel.setActive("ManulTrader");
        row1.addChild(new control_1.DockContainer("v", 100, null).addChild(rightPanel));
        this.children.push(row1);
        // splitter between row1 and row2
        this.children.push(new control_1.Splitter("h"));
        // row2
        var row2 = new control_1.DockContainer("h", null, 700);
        // bookview
        var bookViewPanel = new control_1.TabPanel();
        var bookviewPage = new control_1.TabPage("BookView", "BookView");
        bookViewPanel.addTab(bookviewPage);
        bookViewPanel.setActive(bookviewPage.id);
        var bookviewHeader = new control_2.ComboControl("row");
        var symbol = new control_1.DropDown();
        symbol.Text = "Symbol:";
        symbol.addItem({ Text: "平安银行", Value: "000001" });
        bookviewHeader.addChild(symbol);
        var bookViewTable = new control_1.DataTable();
        bookViewTable.addColumn("BidVol", "Price", "AskVol", "TransVol");
        var bookViewContent = new control_2.ComboControl("col");
        bookViewContent.addChild(bookviewHeader);
        bookViewContent.addChild(bookViewTable);
        bookviewPage.setContent(bookViewContent);
        row2.addChild(new control_1.DockContainer("v", 200, null).addChild(bookViewPanel));
        // Splitter
        row2.addChild(new control_1.Splitter("v"));
        // log
        var logPanel = new control_1.TabPanel();
        var logPage = new control_1.TabPage("LOG", "LOG");
        var logContent = new control_2.ComboControl("col");
        var logTable = new control_1.DataTable();
        logTable.addColumn("Time", "Content");
        logContent.addChild(logTable);
        logPage.setContent(logContent);
        logPanel.addTab(logPage);
        logPanel.setActive("LOG");
        row2.addChild(new control_1.DockContainer("v", 800, null).addChild(logPanel));
        this.children.push(row2);
        this.children.push(new control_1.Splitter("h"));
        // row 3
        var bottomPanel = new control_1.TabPanel();
        var strategyPage = new control_1.TabPage("StrategyMonitor", "StrategyMonitor workbench");
        bottomPanel.addTab(strategyPage);
        bottomPanel.setActive(strategyPage.id);
        var strategyHeader = new control_2.ComboControl("row");
        var startall = new control_2.MetaControl("button");
        startall.Text = "Start All";
        var pauseall = new control_2.MetaControl("button");
        pauseall.Text = "Pause All";
        var stopall = new control_2.MetaControl("button");
        stopall.Text = "Stop All";
        var watchall = new control_2.MetaControl("button");
        watchall.Text = "Watch All";
        // startall.Class = pauseall.Class = stopall.Class = watchall.Class = "primary";
        strategyHeader.addChild(startall).addChild(pauseall).addChild(stopall).addChild(watchall);
        var strategyTable = new control_1.DataTable();
        strategyTable.RowHeader = false;
        strategyTable.addColumn("StrategyID", "Sym1", "Sym2", "Start", "Pause", "Stop", "Watch", "Status", "PosPnl(K)", "TraPnl(K)");
        var strategyContent = new control_2.ComboControl("col");
        strategyContent.addChild(strategyHeader);
        strategyContent.addChild(strategyTable);
        strategyPage.setContent(strategyContent);
        var row3 = new control_1.DockContainer("h").addChild(bottomPanel);
        this.children.push(row3);
    };
    AppComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "body",
            templateUrl: "app.component.html"
        }), 
        __metadata('design:paramtypes', [])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map