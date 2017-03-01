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
/**
 * created by cl, 2017/02/28
 * update: [date]
 * desc:
 */
var core_1 = require("@angular/core");
var control_1 = require("../../base/controls/control");
var control_2 = require("../../base/controls/control");
var priceService_1 = require("../../base/api/services/priceService");
var AppComponent = (function () {
    function AppComponent(psInstance, ref) {
        this.psInstance = psInstance;
        this.ref = ref;
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
        cb_handle.Text = true;
        cb_handle.Title = "Handle";
        orderstatusHeader.addChild(cb_handle);
        var dd_status = new control_1.DropDown();
        dd_status.addItem({ Text: "all    ", Value: "-1" });
        dd_status.addItem({ Text: "0.无效", Value: "0" });
        dd_status.addItem({ Text: "1.未报", Value: "1" });
        dd_status.addItem({ Text: "2.待报", Value: "2" });
        dd_status.addItem({ Text: "3.已报", Value: "3" });
        dd_status.addItem({ Text: "4.已报待撤", Value: "4" });
        orderstatusHeader.addChild(dd_status);
        var cb_selectAll = new control_2.MetaControl("checkbox");
        cb_selectAll.Title = "Select All";
        cb_selectAll.Text = true;
        orderstatusHeader.addChild(cb_selectAll);
        var btn_cancel = new control_2.MetaControl("button");
        btn_cancel.Text = "Cancel Selected";
        orderstatusHeader.addChild(btn_cancel);
        var btn_resupply = new control_2.MetaControl("button");
        btn_resupply.Text = "Resupply";
        orderstatusHeader.addChild(btn_resupply);
        orderstatusContent.addChild(orderstatusHeader);
        cb_handle.OnClick = function () {
            dd_status.Disable = cb_selectAll.Disable = btn_cancel.Disable =
                btn_resupply.Disable = cb_handle.Text;
        };
        var orderstatusTable = new control_1.DataTable();
        orderstatusTable.addColumn("U-Key", "Symbol", "OrderId", "Time", "Strategy", "Ask/Bid", "Price", "OrderVol", "DoneVol", "Status", "Account");
        orderstatusContent.addChild(orderstatusTable);
        orderstatusPage.setContent(orderstatusContent);
        leftPanel.addTab(orderstatusPage);
        var doneOrdersPage = new control_1.TabPage("DoneOrders", "DoneOrders");
        var doneOrdersContent = new control_2.ComboControl("col");
        var doneOrdersTable = new control_1.DataTable("table");
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
        dd_Account.Width = 120;
        dd_Account.Title = "Account:   ";
        dd_Account.addItem({ Text: "666600000010", Value: "0" });
        dd_Account.Left = leftAlign;
        dd_Account.Top = 20;
        tradeContent.addChild(dd_Account);
        var dd_Strategy = new control_1.DropDown();
        dd_Strategy.Width = 120;
        dd_Strategy.Left = leftAlign;
        dd_Strategy.Top = rowSep;
        dd_Strategy.Title = "Strategy:  ";
        dd_Strategy.addItem({ Text: "110", Value: "0" });
        tradeContent.addChild(dd_Strategy);
        var txt_Symbol = new control_2.MetaControl("textbox");
        txt_Symbol.Left = leftAlign;
        txt_Symbol.Top = rowSep;
        txt_Symbol.Title = "Symbol:    ";
        tradeContent.addChild(txt_Symbol);
        var txt_UKey = new control_2.MetaControl("textbox");
        txt_UKey.Left = leftAlign;
        txt_UKey.Top = rowSep;
        txt_UKey.Title = "UKey:      ";
        tradeContent.addChild(txt_UKey);
        var txt_Price = new control_2.MetaControl("textbox");
        txt_Price.Left = leftAlign;
        txt_Price.Top = rowSep;
        txt_Price.Title = "Price:     ";
        tradeContent.addChild(txt_Price);
        var txt_Volume = new control_2.MetaControl("textbox");
        txt_Volume.Left = leftAlign;
        txt_Volume.Top = rowSep;
        txt_Volume.Title = "Volume:    ";
        tradeContent.addChild(txt_Volume);
        var dd_Action = new control_1.DropDown();
        dd_Action.Left = leftAlign;
        dd_Action.Top = rowSep;
        dd_Action.Title = "Action:    ";
        dd_Action.Width = 120;
        dd_Action.addItem({ Text: "Buy", Value: "0" });
        dd_Action.addItem({ Text: "Sell", Value: "1" });
        tradeContent.addChild(dd_Action);
        var btn_row = new control_2.ComboControl("row");
        var btn_clear = new control_2.MetaControl("button");
        btn_clear.Left = leftAlign;
        btn_clear.Text = "Clear";
        btn_row.addChild(btn_clear);
        var btn_submit = new control_2.MetaControl("button");
        btn_submit.Left = 30;
        btn_submit.Text = "Submit";
        btn_clear.Class = btn_submit.Class = "primary";
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
        var dd_symbol = new control_1.DropDown();
        dd_symbol.Title = "Symbol: ";
        dd_symbol.addItem({ Text: "平安银行", Value: "3,000001" });
        dd_symbol.addItem({ Text: "万科A", Value: "6,000002" });
        var self = this;
        dd_symbol.SelectChange = function () {
            bookViewTable.rows.forEach(function (row) {
                row.cells.forEach(function (cell) {
                    cell.Text = "";
                });
            });
        };
        bookviewHeader.addChild(dd_symbol);
        var bookViewTable = new control_1.DataTable("table");
        bookViewTable.addColumn("BidVol", "Price", "AskVol", "TransVol");
        for (var i = 0; i < 20; ++i) {
            var row = bookViewTable.newRow();
            row.cells[0].Class = "warning";
            row.cells[0].Text = "";
            row.cells[1].Class = "info";
            row.cells[2].Class = "danger";
            row.cells[3].Class = "default";
        }
        var bHead = false;
        bookViewTable.OnCellClick = function (cellItem, cellIndex, rowIndex) {
            console.info(cellIndex, rowIndex);
        };
        bookViewTable.OnRowClick = function (rowItem, rowIndex) {
            _a = dd_symbol.SelectedItem.Value.split(","), txt_UKey.Text = _a[0], txt_Symbol.Text = _a[1];
            txt_Price.Text = rowItem.cells[1].Text;
            dd_Action.SelectedItem = (rowItem.cells[0].Text === "") ? dd_Action.Items[1] : dd_Action.Items[0];
            var _a;
        };
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
        strategyTable.RowIndex = false;
        strategyTable.addColumn("StrategyID", "Sym1", "Sym2", "Start", "Pause", "Stop", "Watch", "Status", "PosPnl(K)", "TraPnl(K)");
        var strategyContent = new control_2.ComboControl("col");
        strategyContent.addChild(strategyHeader);
        strategyContent.addChild(strategyTable);
        strategyPage.setContent(strategyContent);
        var row3 = new control_1.DockContainer("h").addChild(bottomPanel);
        this.children.push(row3);
        this.psInstance.register([3, 6]);
        this.psInstance.subscribe(function (msg) {
            // console.info(msg);
            if (msg.type === 201 && msg.ukey === parseInt(dd_symbol.SelectedItem.Value.split(",")[0])) {
                for (var i = 0; i < 10; ++i) {
                    // console.info(i);
                    bookViewTable.rows[i + 10].cells[0].Text = msg.bidvols[i] + "";
                    bookViewTable.rows[i + 10].cells[1].Text = msg.bidprices[i] / 10000 + "";
                    bookViewTable.rows[9 - i].cells[2].Text = msg.askvols[i] + "";
                    bookViewTable.rows[9 - i].cells[1].Text = msg.askprices[i] / 10000 + "";
                }
                self.ref.detectChanges();
            }
        });
        document.title = "hello";
    };
    AppComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "body",
            templateUrl: "app.component.html",
            providers: [
                priceService_1.PriceService
            ]
        }), 
        __metadata('design:paramtypes', [priceService_1.PriceService, core_1.ChangeDetectorRef])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map