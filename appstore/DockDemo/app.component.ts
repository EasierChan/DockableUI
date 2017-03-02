/**
 * created by cl, 2017/02/28
 * update: [date]
 * desc: 
 */
import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import {
  Control, DockContainer, Splitter, TabPanel, TabPage,
  DataTable, DataTableRow, DataTableColumn, DropDown
} from "../../base/controls/control";
import { ComboControl, MetaControl } from "../../base/controls/control";
import { PriceService } from "../../base/api/services/priceService";

@Component({
  moduleId: module.id,
  selector: "body",
  templateUrl: "app.component.html",
  providers: [
    PriceService
  ]
})
export class AppComponent implements OnInit {
  className: string = "dock-container vertical";
  children: Control[] = [];

  constructor(private psInstance: PriceService, private ref: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    // this.className = "dock-container vertical";
    // row 1
    let row1: DockContainer = new DockContainer("h", null, 400);

    let leftPanel: TabPanel = new TabPanel();
    let orderstatusPage = new TabPage("OrderStatus", "OrderStatus");
    let orderstatusContent = new ComboControl("col");

    let orderstatusHeader = new ComboControl("row");
    let cb_handle = new MetaControl("checkbox");
    cb_handle.Text = true;
    cb_handle.Title = "Handle";
    orderstatusHeader.addChild(cb_handle);
    let dd_status = new DropDown();
    dd_status.addItem({ Text: "all    ", Value: "-1" });
    dd_status.addItem({ Text: "0.无效", Value: "0" });
    dd_status.addItem({ Text: "1.未报", Value: "1" });
    dd_status.addItem({ Text: "2.待报", Value: "2" });
    dd_status.addItem({ Text: "3.已报", Value: "3" });
    dd_status.addItem({ Text: "4.已报待撤", Value: "4" });
    orderstatusHeader.addChild(dd_status);
    let cb_selectAll = new MetaControl("checkbox");
    cb_selectAll.Title = "Select All";
    cb_selectAll.Text = true;
    orderstatusHeader.addChild(cb_selectAll);
    let btn_cancel = new MetaControl("button");
    btn_cancel.Text = "Cancel Selected";
    orderstatusHeader.addChild(btn_cancel);
    let btn_resupply = new MetaControl("button");
    btn_resupply.Text = "Resupply";
    orderstatusHeader.addChild(btn_resupply);
    orderstatusContent.addChild(orderstatusHeader);
    cb_handle.OnClick = () => {
      dd_status.Disable = cb_selectAll.Disable = btn_cancel.Disable =
        btn_resupply.Disable = cb_handle.Text;
    };

    let orderstatusTable = new DataTable();
    orderstatusTable.addColumn("U-Key", "Symbol", "OrderId", "Time", "Strategy",
      "Ask/Bid", "Price", "OrderVol", "DoneVol", "Status", "Account");
    orderstatusContent.addChild(orderstatusTable);
    orderstatusPage.setContent(orderstatusContent);
    leftPanel.addTab(orderstatusPage);

    let doneOrdersPage = new TabPage("DoneOrders", "DoneOrders");
    let doneOrdersContent = new ComboControl("col");
    let doneOrdersTable = new DataTable("table");
    doneOrdersTable.addColumn("U-Key", "Symbol", "OrderId", "Strategy",
      "Ask/Bid", "Price", "DoneVol", "Status", "Time", "OrderVol", "OrderType", "Account", "OrderTime",
      "OrderPrice", "SymbolCode");
    doneOrdersContent.addChild(doneOrdersTable);
    doneOrdersPage.setContent(doneOrdersContent);
    leftPanel.addTab(doneOrdersPage);
    leftPanel.setActive("OrderStatus");
    let row1col1 = new DockContainer("v", 500, null).addChild(leftPanel);
    // col 1
    row1.addChild(row1col1);
    // Splitter
    row1.addChild(new Splitter("v"));
    // col 2
    let leftAlign = 20;
    let rowSep = 5;
    let rightPanel: TabPanel = new TabPanel();
    let tradePage = new TabPage("ManulTrader", "ManulTrader");
    let tradeContent = new ComboControl("col");
    tradeContent.MinHeight = 500;
    tradeContent.MinWidth = 500;
    let dd_Account = new DropDown();
    dd_Account.Width = 120;
    dd_Account.Title = "Account:   ";
    dd_Account.addItem({ Text: "666600000010", Value: "0" });
    dd_Account.Left = leftAlign;
    dd_Account.Top = 20;
    tradeContent.addChild(dd_Account);
    let dd_Strategy = new DropDown();
    dd_Strategy.Width = 120;
    dd_Strategy.Left = leftAlign;
    dd_Strategy.Top = rowSep;
    dd_Strategy.Title = "Strategy:  ";
    dd_Strategy.addItem({ Text: "110", Value: "0" });
    tradeContent.addChild(dd_Strategy);
    let txt_Symbol = new MetaControl("textbox");
    txt_Symbol.Left = leftAlign;
    txt_Symbol.Top = rowSep;
    txt_Symbol.Title = "Symbol:    ";
    tradeContent.addChild(txt_Symbol);
    let txt_UKey = new MetaControl("textbox");
    txt_UKey.Left = leftAlign;
    txt_UKey.Top = rowSep;
    txt_UKey.Title = "UKey:      ";
    tradeContent.addChild(txt_UKey);
    let txt_Price = new MetaControl("textbox");
    txt_Price.Left = leftAlign;
    txt_Price.Top = rowSep;
    txt_Price.Title = "Price:     ";
    tradeContent.addChild(txt_Price);
    let txt_Volume = new MetaControl("textbox");
    txt_Volume.Left = leftAlign;
    txt_Volume.Top = rowSep;
    txt_Volume.Title = "Volume:    ";
    tradeContent.addChild(txt_Volume);
    let dd_Action = new DropDown();
    dd_Action.Left = leftAlign;
    dd_Action.Top = rowSep;
    dd_Action.Title = "Action:    ";
    dd_Action.Width = 120;
    dd_Action.addItem({ Text: "Buy", Value: "0" });
    dd_Action.addItem({ Text: "Sell", Value: "1" });
    tradeContent.addChild(dd_Action);
    let btn_row = new ComboControl("row");
    let btn_clear = new MetaControl("button");
    btn_clear.Left = leftAlign;
    btn_clear.Text = "Clear";
    btn_row.addChild(btn_clear);
    let btn_submit = new MetaControl("button");
    btn_submit.Left = 30;
    btn_submit.Text = "Submit";
    btn_clear.Class = btn_submit.Class = "primary";
    btn_row.addChild(btn_submit);
    tradeContent.addChild(btn_row);
    tradePage.setContent(tradeContent);
    rightPanel.addTab(tradePage);
    rightPanel.setActive("ManulTrader");
    row1.addChild(new DockContainer("v", 100, null).addChild(rightPanel));
    this.children.push(row1);
    // splitter between row1 and row2
    this.children.push(new Splitter("h"));
    // row2
    let row2 = new DockContainer("h", null, 700);
    // bookview
    let bookViewPanel: TabPanel = new TabPanel();
    let bookviewPage = new TabPage("BookView", "BookView");
    bookViewPanel.addTab(bookviewPage);
    bookViewPanel.setActive(bookviewPage.id);

    let bookviewHeader = new ComboControl("row");
    let dd_symbol = new DropDown();
    dd_symbol.Title = "Symbol: ";
    dd_symbol.addItem({ Text: "平安银行", Value: "3,000001" });
    dd_symbol.addItem({ Text: "万科A", Value: "6,000002" });
    let self = this;
    dd_symbol.SelectChange = () => {
      bookViewTable.rows.forEach(row => {
        row.cells.forEach(cell => {
          cell.Text = "";
        });
      });
    };
    bookviewHeader.addChild(dd_symbol);

    let bookViewTable: DataTable = new DataTable("table");
    bookViewTable.addColumn("BidVol", "Price", "AskVol", "TransVol");
    for (let i = 0; i < 20; ++i) {
      let row = bookViewTable.newRow();
      row.cells[0].Class = "warning";
      row.cells[0].Text = "";
      row.cells[1].Class = "info";
      row.cells[2].Class = "danger";
      row.cells[3].Class = "default";
    }
    let bHead = false;
    bookViewTable.OnCellClick = (cellItem, cellIndex, rowIndex) => {
      console.info(cellIndex, rowIndex);
    };
    bookViewTable.OnRowClick = (rowItem, rowIndex) => {
      [txt_UKey.Text, txt_Symbol.Text] = dd_symbol.SelectedItem.Value.split(",");
      txt_Price.Text = rowItem.cells[1].Text;
      dd_Action.SelectedItem = (rowItem.cells[0].Text === "") ? dd_Action.Items[1] : dd_Action.Items[0];
    };
    let bookViewContent = new ComboControl("col");
    bookViewContent.addChild(bookviewHeader);
    bookViewContent.addChild(bookViewTable);
    bookviewPage.setContent(bookViewContent);
    row2.addChild(new DockContainer("v", 200, null).addChild(bookViewPanel));
    // Splitter
    row2.addChild(new Splitter("v"));
    // log
    let logPanel = new TabPanel();
    let logPage = new TabPage("LOG", "LOG");
    let logContent = new ComboControl("col");
    let logTable = new DataTable();
    logTable.addColumn("Time", "Content");
    logContent.addChild(logTable);
    logPage.setContent(logContent);
    logPanel.addTab(logPage);
    logPanel.setActive("LOG");
    row2.addChild(new DockContainer("v", 800, null).addChild(logPanel));
    this.children.push(row2);
    this.children.push(new Splitter("h"));

    // row 3
    let bottomPanel: TabPanel = new TabPanel();
    let strategyPage = new TabPage("StrategyMonitor", "StrategyMonitor workbench");
    bottomPanel.addTab(strategyPage);
    bottomPanel.setActive(strategyPage.id);

    let strategyHeader = new ComboControl("row");
    let startall = new MetaControl("button");
    startall.Text = "Start All";
    let pauseall = new MetaControl("button");
    pauseall.Text = "Pause All";
    let stopall = new MetaControl("button");
    stopall.Text = "Stop All";
    let watchall = new MetaControl("button");
    watchall.Text = "Watch All";
    // startall.Class = pauseall.Class = stopall.Class = watchall.Class = "primary";
    strategyHeader.addChild(startall).addChild(pauseall).addChild(stopall).addChild(watchall);

    let strategyTable: DataTable = new DataTable();
    strategyTable.RowIndex = false;
    strategyTable.addColumn("StrategyID", "Sym1", "Sym2", "Start", "Pause",
      "Stop", "Watch", "Status", "PosPnl(K)", "TraPnl(K)");
    let strategyContent = new ComboControl("col");
    strategyContent.addChild(strategyHeader);
    strategyContent.addChild(strategyTable);
    strategyPage.setContent(strategyContent);
    let row3 = new DockContainer("h").addChild(bottomPanel);
    this.children.push(row3);

    this.psInstance.setEndpoint(20000);
    this.psInstance.setHeartBeat(10000);
    this.psInstance.register([3, 6]);
    this.psInstance.subscribe((msg) => {
      // console.info(msg);
      if (msg.type === 201 && msg.ukey === parseInt(dd_symbol.SelectedItem.Value.split(",")[0])) {
        for (let i = 0; i < 10; ++i) {
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
  }
}