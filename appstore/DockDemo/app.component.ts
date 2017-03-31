/**
 * created by cl, 2017/02/28
 * update: [date]
 * desc:
 */
import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import {
  Control, DockContainer, Splitter, TabPanel, TabPage, URange,
  DataTable, DataTableRow, DataTableColumn, DropDown, StatusBar, StatusBarItem
} from "../../base/controls/control";
import { ComboControl, MetaControl } from "../../base/controls/control";
import { PriceService } from "../../base/api/services/priceService";
import { MessageBox } from "../../base/api/services/backend.service";
import { ManulTrader } from "./bll/sendorder";
import { EOrderType, AlphaSignalInfo, SECU_MARKET, EOrderStatus, EStrategyStatus, StrategyCfgType } from "../../base/api/model/itrade/orderstruct";

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

  private orderstatusPage: TabPage;
  private tradePage: TabPage;
  private doneOrdersPage: TabPage;
  private bookviewPage: TabPage;
  private logPage: TabPage;
  private strategyPage: TabPage;
  private accountPage: TabPage;
  private PositionPage: TabPage;
  private profitPage: TabPage;
  private statarbPage: TabPage;
  private portfolioPage: TabPage;

  private orderstatusTable: DataTable;
  private doneOrdersTable: DataTable;
  private bookViewTable: DataTable;
  private logTable: DataTable;
  private strategyTable: DataTable;
  private accountTable: DataTable;
  private static self: AppComponent;
  private PositionTable: DataTable;
  private profitTable: DataTable;
  private statarbTable: DataTable;
  private portfolioTable: DataTable;

  // profittable textbox
  private totalpnLabel: MetaControl;
  private pospnlLabel: MetaControl;
  private trapnlt: MetaControl;
  private pospnlt: MetaControl;
  private totalpnlt: MetaControl;
  private buyamountLabel: MetaControl;
  private sellamountLabel: MetaControl;
  private portfolioAccLabel: MetaControl;
  private reserveCheckBox: MetaControl;
  private portfolioLabel: MetaControl;
  private portfoliopnl: MetaControl;
  private portfolioDaypnl: MetaControl;
  private portfolioonpnl: MetaControl;
  private portfolioCount: MetaControl;
  private portfolioBuyCom: DropDown;
  private portfolioSellCom: DropDown;

  // strategy index flag
  private commentIdx: number = 10;
  private commandIdx: number = 10;
  private parameterIdx: number = 11;
  private strategyStatus: number = 0;
  private filename: String = "";

  private statusbar: StatusBar;

  constructor(private psInstance: PriceService, private ref: ChangeDetectorRef) {
    AppComponent.self = this;
  }

  ngOnInit(): void {
    this.statusbar = new StatusBar();
    // this.className = "dock-container vertical";
    // row 1
    let row1: DockContainer = new DockContainer("h", null, 400);

    let leftPanel: TabPanel = new TabPanel();
    this.orderstatusPage = new TabPage("OrderStatus", "OrderStatus");
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
    dd_status.addItem({ Text: "5.部成待撤", Value: "5" });
    dd_status.addItem({ Text: "6.部撤", Value: "6" });
    dd_status.addItem({ Text: "7.已撤", Value: "7" });
    dd_status.addItem({ Text: "8.部成", Value: "8" });
    dd_status.addItem({ Text: "9.已成", Value: "9" });
    dd_status.addItem({ Text: "10.废单", Value: "10" });

    orderstatusHeader.addChild(dd_status);
    // let cb_selectAll = new MetaControl("checkbox");
    // cb_selectAll.Title = "Select All";
    // cb_selectAll.Text = true;
    // orderstatusHeader.addChild(cb_selectAll);
    let btn_cancel = new MetaControl("button");
    btn_cancel.Text = "Cancel Selected";
    orderstatusHeader.addChild(btn_cancel);
    // let btn_resupply = new MetaControl("button");
    // btn_resupply.Text = "Resupply";
    // orderstatusHeader.addChild(btn_resupply);
    orderstatusContent.addChild(orderstatusHeader);
    cb_handle.OnClick = () => {
      dd_status.Disable = btn_cancel.Disable = cb_handle.Text;
      // cb_selectAll.Disable = btn_resupply.Disable =
    };
    dd_status.SelectChange = (item) => {
      for (let i = 0; i < this.orderstatusTable.rows.length; ++i) {
        if (dd_status.SelectedItem.Value === "-1") {   // all
          AppComponent.self.orderstatusTable.rows[i].hidden = false;
        }
        else {
          if (AppComponent.self.orderstatusTable.rows[i].cells[9].Text === dd_status.SelectedItem.Text) {
            AppComponent.self.orderstatusTable.rows[i].hidden = false;
          }
          else
            AppComponent.self.orderstatusTable.rows[i].hidden = true;
        }
      }
    };

    btn_cancel.OnClick = () => {
      for (let i = 0; i < this.orderstatusTable.rows.length; ++i) {
        let getStatus = parseInt(this.orderstatusTable.rows[i].cells[9].Data);
        let strategyid = this.orderstatusTable.rows[i].cells[4].Text;
        let ukey = this.orderstatusTable.rows[i].cells[0].Text;
        let orderid = this.orderstatusTable.rows[i].cells[2].Text;
        if (getStatus === 0 || getStatus === 6 || getStatus === 7 || getStatus === 9 || getStatus === 10)
          continue;
        else {   // no test
          ManulTrader.cancelorder({ type: 1, strategyid: strategyid, ukey: ukey, orderid: orderid });
        }
      }
    };

    this.orderstatusTable = new DataTable();
    this.orderstatusTable.addColumn("U-Key", "Symbol", "OrderId", "Time", "Strategy",
      "Ask/Bid", "Price", "OrderVol", "DoneVol", "Status", "Account");
    orderstatusContent.addChild(this.orderstatusTable);
    this.orderstatusPage.setContent(orderstatusContent);
    leftPanel.addTab(this.orderstatusPage);

    this.doneOrdersPage = new TabPage("DoneOrders", "DoneOrders");
    let doneOrdersContent = new ComboControl("col");
    this.doneOrdersTable = new DataTable("table");
    this.doneOrdersTable.addColumn("U-Key", "Symbol", "OrderId", "Strategy",
      "Ask/Bid", "Price", "DoneVol", "Status", "Time", "OrderVol", "OrderType", "Account", "OrderTime",
      "OrderPrice", "SymbolCode");
    doneOrdersContent.addChild(this.doneOrdersTable);
    this.doneOrdersPage.setContent(doneOrdersContent);
    leftPanel.addTab(this.doneOrdersPage);


    this.accountPage = new TabPage("Account", "Account");
    let accountContent = new ComboControl("col");
    this.accountTable = new DataTable("table");
    this.accountTable.addColumn("Account", "Secucategory", "TotalAmount", "AvlAmount", "FrzAmount", "Date", "Status",
      "ShangHai", "ShenZhen", "BuyFrzAmt", "SellFrzAmt", "Buymargin", "SellMargin", "TotalMargin", "Fee",
      "PositionPL", "ClosePL");
    accountContent.addChild(this.accountTable);
    this.accountPage.setContent(accountContent);
    leftPanel.addTab(this.accountPage);

    this.PositionPage = new TabPage("Position", "Position");
    let positionContent = new ComboControl("col");
    this.PositionTable = new DataTable("table");
    this.PositionTable.addColumn("Account", "secucategory", "U-Key", "Code", "TotalQty", "AvlQty", "AvlCreRedempVol", "WorkingQty",
      "TotalCost", "TodayOpen", "AvgPirce", "StrategyId", "Type");
    positionContent.addChild(this.PositionTable);
    this.PositionPage.setContent(positionContent);
    leftPanel.addTab(this.PositionPage);
    leftPanel.setActive("Position");

    let row1col1 = new DockContainer("v", 500, null).addChild(leftPanel);
    // col 1
    row1.addChild(row1col1);
    // Splitter
    row1.addChild(new Splitter("v"));
    // col 2
    let leftAlign = 20;
    let rowSep = 5;
    let rightPanel: TabPanel = new TabPanel();
    this.tradePage = new TabPage("ManulTrader", "ManulTrader");
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
    this.tradePage.setContent(tradeContent);
    rightPanel.addTab(this.tradePage);
    rightPanel.setActive("ManulTrader");
    row1.addChild(new DockContainer("v", 100, null).addChild(rightPanel));
    this.children.push(row1);

    btn_submit.OnClick = () => {
      let account = dd_Account.SelectedItem.Text;
      let getstrategy = dd_Strategy.SelectedItem.Text;
      let symbol = txt_Symbol.Text;
      let ukey = txt_UKey.Text;
      let price = txt_Price.Text;
      let volume = txt_Volume.Text;
      let action = dd_Action.SelectedItem.Text;

      let date = new Date();
      ManulTrader.submitOrder({
        ordertype: EOrderType.ORDER_TYPE_ORDER,
        con: {
          contractid: 0,
          account: parseInt(account),
          orderaccount: "",
          tradeunit: "",
          tradeproto: ""
        },
        datetime: {
          tv_sec: date.getSeconds(),
          tv_usec: date.getMilliseconds()
        },
        data: {
          strategyid: parseInt(getstrategy),
          algorid: 0,
          orderid: 0,
          algorindex: 0,
          innercode: parseInt(ukey),
          price: price * 10000,
          quantity: parseInt(volume),
          action: (action === "Sell") ? 1 : 0,
          property: 0,
          currency: 0,
          covered: 0,
          signal: [{ id: 0, value: 0 }, { id: 0, value: 0 }, { id: 0, value: 0 }, { id: 0, value: 0 }]
        }
      });
    };


    // splitter between row1 and row2
    this.children.push(new Splitter("h"));
    // row2
    let row2 = new DockContainer("h", null, 700);
    // bookview
    let bookViewPanel: TabPanel = new TabPanel();
    this.bookviewPage = new TabPage("BookView", "BookView");
    bookViewPanel.addTab(this.bookviewPage);
    bookViewPanel.setActive(this.bookviewPage.id);

    let bookviewHeader = new ComboControl("row");
    let dd_symbol = new DropDown();
    dd_symbol.Title = "Symbol: ";
    dd_symbol.addItem({ Text: "平安银行", Value: "3,000001" });
    dd_symbol.addItem({ Text: "万科A", Value: "6,000002" });
    dd_symbol.addItem({ Text: "IC1706", Value: "2007741,IC1706" });
    let self = this;
    dd_symbol.SelectChange = () => {
      this.bookViewTable.rows.forEach(row => {
        row.cells.forEach(cell => {
          cell.Text = "";
        });
      });
    };
    bookviewHeader.addChild(dd_symbol);

    this.bookViewTable = new DataTable("table");
    this.bookViewTable.addColumn("BidVol", "Price", "AskVol", "TransVol");
    for (let i = 0; i < 20; ++i) {
      let row = this.bookViewTable.newRow();
      row.cells[0].Class = "warning";
      row.cells[0].Text = "";
      row.cells[1].Class = "info";
      row.cells[2].Class = "danger";
      row.cells[3].Class = "default";
    }
    let bHead = false;
    this.bookViewTable.OnCellClick = (cellItem, cellIndex, rowIndex) => {
      // console.info(cellIndex, rowIndex);
    };
    this.bookViewTable.OnRowClick = (rowItem, rowIndex) => {
      [txt_UKey.Text, txt_Symbol.Text] = dd_symbol.SelectedItem.Value.split(",");
      txt_Price.Text = rowItem.cells[1].Text;
      dd_Action.SelectedItem = (rowItem.cells[0].Text === "") ? dd_Action.Items[1] : dd_Action.Items[0];
    };
    let bookViewContent = new ComboControl("col");
    bookViewContent.addChild(bookviewHeader);
    bookViewContent.addChild(this.bookViewTable);
    this.bookviewPage.setContent(bookViewContent);
    row2.addChild(new DockContainer("v", 200, null).addChild(bookViewPanel));
    // Splitter
    row2.addChild(new Splitter("v"));
    // log
    let logPanel = new TabPanel();
    this.logPage = new TabPage("LOG", "LOG");
    let logContent = new ComboControl("col");
    this.logTable = new DataTable();
    this.logTable.addColumn("Time", "Content");
    logContent.addChild(this.logTable);
    this.logPage.setContent(logContent);
    logPanel.addTab(this.logPage);
    // logPanel.setActive("LOG");
    row2.addChild(new DockContainer("v", 800, null).addChild(logPanel));
    this.children.push(row2);
    this.children.push(new Splitter("h"));

    this.statarbPage = new TabPage("StatArb", "StatArb");
    logPanel.addTab(this.statarbPage);
    let statarbLeftAlign = 20;
    let statarbHeader = new ComboControl("row");
    this.buyamountLabel = new MetaControl("textbox");
    this.buyamountLabel.Left = statarbLeftAlign;
    this.buyamountLabel.Width = 50;
    this.buyamountLabel.Title = "BUY.AMOUNT: ";
    this.buyamountLabel.Disable = true;
    this.sellamountLabel = new MetaControl("textbox");
    this.sellamountLabel.Left = statarbLeftAlign;
    this.sellamountLabel.Width = 50;
    this.sellamountLabel.Title = "SELL.AMOUNT: ";
    this.sellamountLabel.Disable = true;
    statarbHeader.addChild(this.buyamountLabel).addChild(this.sellamountLabel);
    this.statarbTable = new DataTable();
    this.statarbTable.addColumn("Symbol", "InnerCode", "Change(%)", "Position",
      "Trade", "Amount", "StrategyId", "DiffQty", "SymbolCode");
    let statarbContent = new ComboControl("col");
    statarbContent.addChild(statarbHeader);
    statarbContent.addChild(this.statarbTable);
    this.statarbPage.setContent(statarbContent);

    this.portfolioPage = new TabPage("Portfolio", "Portfolio");
    logPanel.addTab(this.portfolioPage);
    let accountHead = new ComboControl("row");
    this.portfolioAccLabel = new MetaControl("textbox");
    this.portfolioAccLabel.Left = statarbLeftAlign;
    this.portfolioAccLabel.Width = 100;
    this.portfolioAccLabel.Title = "Account: ";
    this.portfolioAccLabel.Disable = true;
    accountHead.addChild(this.portfolioAccLabel);
    let loadItem = new ComboControl("row");
    let btn_load = new MetaControl("button");
    btn_load.Text = "Load csv";
    btn_load.Left = 20;
    btn_load.Class = "primary";
    this.reserveCheckBox = new MetaControl("checkbox");
    this.reserveCheckBox.Width = 40;
    this.reserveCheckBox.Title = "reserve ";
    this.reserveCheckBox.Left = 30;

    this.portfolioLabel = new MetaControl("textbox");
    this.portfolioLabel.Width = 50;
    this.portfolioLabel.Title = "PORTFOLIO Value:";
    this.portfolioLabel.Left = 20;
    this.portfolioLabel.Disable = true;

    this.portfolioDaypnl = new MetaControl("textbox");
    this.portfolioDaypnl.Width = 50;
    this.portfolioDaypnl.Title = "PORTFOLIO Day pnl:";
    this.portfolioDaypnl.Left = 20;
    this.portfolioDaypnl.Disable = true;

    this.portfolioonpnl = new MetaControl("textbox");
    this.portfolioonpnl.Width = 50;
    this.portfolioonpnl.Title = "PORTFOLIO O/N Pnl:";
    this.portfolioonpnl.Left = 20;
    this.portfolioonpnl.Disable = true;

    this.portfolioCount = new MetaControl("textbox");
    this.portfolioCount.Width = 50;
    this.portfolioCount.Title = "Count:";
    this.portfolioCount.Left = 20;
    this.portfolioCount.Disable = true;
    loadItem.addChild(btn_load).addChild(this.reserveCheckBox).addChild(this.portfolioLabel)
      .addChild(this.portfolioDaypnl).addChild(this.portfolioonpnl).addChild(this.portfolioCount);

    let tradeitem = new ComboControl("row");
    this.portfolioBuyCom = new DropDown();
    this.portfolioBuyCom.Width = 50;
    this.portfolioBuyCom.Left = 20;
    this.portfolioBuyCom.Title = "Buy: ";
    this.portfolioBuyCom.addItem({ Text: "B10", Value: "-10" });
    this.portfolioBuyCom.addItem({ Text: "B9", Value: "-9" });
    this.portfolioBuyCom.addItem({ Text: "B8", Value: "-8" });
    this.portfolioBuyCom.addItem({ Text: "B7", Value: "-7" });
    this.portfolioBuyCom.addItem({ Text: "B6", Value: "-6" });
    this.portfolioBuyCom.addItem({ Text: "B5", Value: "-5" });
    this.portfolioBuyCom.addItem({ Text: "B4", Value: "-4" });
    this.portfolioBuyCom.addItem({ Text: "B3", Value: "-3" });
    this.portfolioBuyCom.addItem({ Text: "B2", Value: "-2" });
    this.portfolioBuyCom.addItem({ Text: "B1", Value: "-1" });
    this.portfolioBuyCom.addItem({ Text: "A1", Value: "1" });
    this.portfolioBuyCom.addItem({ Text: "A2", Value: "2" });
    this.portfolioBuyCom.addItem({ Text: "A3", Value: "3" });
    this.portfolioBuyCom.addItem({ Text: "A4", Value: "4" });
    this.portfolioBuyCom.addItem({ Text: "A5", Value: "5" });
    this.portfolioBuyCom.addItem({ Text: "A6", Value: "6" });
    this.portfolioBuyCom.addItem({ Text: "A7", Value: "7" });
    this.portfolioBuyCom.addItem({ Text: "A8", Value: "8" });
    this.portfolioBuyCom.addItem({ Text: "A9", Value: "9" });
    this.portfolioBuyCom.addItem({ Text: "A10", Value: "10" });

    this.portfolioSellCom = new DropDown();
    this.portfolioSellCom.Width = 50;
    this.portfolioSellCom.Left = 20;
    this.portfolioSellCom.Title = "Sell:";
    this.portfolioSellCom.addItem({ Text: "B10", Value: "-10" });
    this.portfolioSellCom.addItem({ Text: "B9", Value: "-9" });
    this.portfolioSellCom.addItem({ Text: "B8", Value: "-8" });
    this.portfolioSellCom.addItem({ Text: "B7", Value: "-7" });
    this.portfolioSellCom.addItem({ Text: "B6", Value: "-6" });
    this.portfolioSellCom.addItem({ Text: "B5", Value: "-5" });
    this.portfolioSellCom.addItem({ Text: "B4", Value: "-4" });
    this.portfolioSellCom.addItem({ Text: "B3", Value: "-3" });
    this.portfolioSellCom.addItem({ Text: "B2", Value: "-2" });
    this.portfolioSellCom.addItem({ Text: "B1", Value: "-1" });
    this.portfolioSellCom.addItem({ Text: "A1", Value: "1" });
    this.portfolioSellCom.addItem({ Text: "A2", Value: "2" });
    this.portfolioSellCom.addItem({ Text: "A3", Value: "3" });
    this.portfolioSellCom.addItem({ Text: "A4", Value: "4" });
    this.portfolioSellCom.addItem({ Text: "A5", Value: "5" });
    this.portfolioSellCom.addItem({ Text: "A6", Value: "6" });
    this.portfolioSellCom.addItem({ Text: "A7", Value: "7" });
    this.portfolioSellCom.addItem({ Text: "A8", Value: "8" });
    this.portfolioSellCom.addItem({ Text: "A9", Value: "9" });
    this.portfolioSellCom.addItem({ Text: "A10", Value: "10" });

    let allChk = new MetaControl("checkbox"); allChk.Width = 30; allChk.Title = " All"; allChk.Left = 20;
    let allbuyChk = new MetaControl("checkbox"); allbuyChk.Width = 30; allbuyChk.Title = " All-Buy"; allbuyChk.Left = 20;
    let allsellChk = new MetaControl("checkbox"); allsellChk.Width = 30; allsellChk.Title = " All-Sell"; allsellChk.Left = 20;
    let shiftChk = new MetaControl("checkbox"); shiftChk.Width = 30; shiftChk.Title = " Shift-Select"; shiftChk.Left = 20;

    let range = new URange(); range.Width = 150; range.Left = 30; range.Title = "Order Rate:";
    let rateText = new MetaControl("textbox"); rateText.Width = 30; rateText.Title = ""; rateText.Left = 5;
    let percentText = new MetaControl("plaintext"); percentText.Title = "%"; percentText.Width = 15;

    let btn_sendSel = new MetaControl("button"); btn_sendSel.Text = "Send Selected"; btn_sendSel.Left = 20; btn_sendSel.Class = "primary";
    let btn_cancelSel = new MetaControl("button"); btn_cancelSel.Text = "Cancel Selected"; btn_cancelSel.Left = 20; btn_cancelSel.Class = "primary";

    tradeitem.addChild(this.portfolioBuyCom).addChild(this.portfolioSellCom).addChild(allChk).addChild(allbuyChk)
      .addChild(allsellChk).addChild(shiftChk).addChild(range).addChild(rateText).addChild(percentText).addChild(btn_sendSel).addChild(btn_cancelSel);

    this.portfolioTable = new DataTable();
    this.portfolioTable.addColumn("Symbol", "Name", "PreQty", "TargetQty", "CurrQty", "TotalOrderQty", "FilledQty", "FillPace",
      "WorkingQty", "SingleOrderQty", "Send", "Cancel", "Status", "PrePrice", "LastPrice", "BidSize", "BidPrice", "AskSize", "AskPrice", "AvgBuyPrice");


    btn_load.OnClick = () => {
      MessageBox.openFileDialog("Select CSV", function (filenames) {
           //console.log(filenames);
          
      }, [{ name: "CSV", extensions: ["csv"] }]);
    };
    btn_sendSel.OnClick = () => {

    };
    btn_cancelSel.OnClick = () => {

    };
    let portfolioContent = new ComboControl("col");
    portfolioContent.addChild(accountHead).addChild(loadItem).addChild(tradeitem).addChild(this.portfolioTable);
    this.portfolioPage.setContent(portfolioContent);
    logPanel.setActive("Portfolio");

    // row 3    strategyinfo
    let bottomPanel: TabPanel = new TabPanel();
    this.strategyPage = new TabPage("StrategyMonitor", "StrategyMonitor workbench");
    bottomPanel.addTab(this.strategyPage);
    // bottomPanel.setActive(this.strategyPage.id);

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
    bottomPanel.setActive(this.strategyPage.id);

    startall.OnClick = () => {
      this.controlBtnClick(0);
    };
    pauseall.OnClick = () => {
      this.controlBtnClick(1);
    };
    stopall.OnClick = () => {
      this.controlBtnClick(2);
    };
    watchall.OnClick = () => {
      this.controlBtnClick(3);
    };


    this.profitPage = new TabPage("Profit", "Profit");
    bottomPanel.addTab(this.profitPage);
    let profitleftAlign = 20;
    let profitHeader = new ComboControl("row");
    this.totalpnLabel = new MetaControl("textbox");
    this.totalpnLabel.Left = profitleftAlign;
    this.totalpnLabel.Width = 50;
    this.totalpnLabel.Title = "TOTALPNL: ";
    this.totalpnLabel.Disable = true;
    this.pospnlLabel = new MetaControl("textbox");
    this.pospnlLabel.Left = profitleftAlign;
    this.pospnlLabel.Width = 50;
    this.pospnlLabel.Title = "POSPNL: ";
    this.pospnlLabel.Disable = true;
    this.trapnlt = new MetaControl("textbox");
    this.trapnlt.Left = profitleftAlign;
    this.trapnlt.Width = 50;
    this.trapnlt.Title = "TRAPNL.T: ";
    this.trapnlt.Disable = true;
    this.pospnlt = new MetaControl("textbox");
    this.pospnlt.Left = profitleftAlign;
    this.pospnlt.Width = 50;
    this.pospnlt.Title = "POSPNL.T: ";
    this.pospnlt.Disable = true;
    this.totalpnlt = new MetaControl("textbox");
    this.totalpnlt.Left = profitleftAlign;
    this.totalpnlt.Width = 50;
    this.totalpnlt.Title = "TOTALPNL.T: ";
    this.totalpnlt.Disable = true;
    let reqbtn = new MetaControl("button");
    reqbtn.Left = profitleftAlign;
    reqbtn.Width = 30;
    reqbtn.Text = "Req";
    profitHeader.addChild(this.totalpnLabel).addChild(this.pospnlLabel).addChild(this.trapnlt).addChild(this.pospnlt).addChild(this.totalpnlt).addChild(reqbtn);
    this.profitTable = new DataTable();
    this.profitTable.addColumn("U-Key", "Code", "Account", "Strategy", "AvgPrice(B)", "AvgPirce(S)",
      "PositionPnl", "TradingPnl", "IntraTradingFee", "TotalTradingFee", "LastTradingFee", "LastPosPnl",
      "TodayPosPnl", "TotalPnl", "LastPosition", "TodayPosition", "LastClose", "MarketPirce", "IOPV");
    let profitContent = new ComboControl("col");
    profitContent.addChild(profitHeader);
    profitContent.addChild(this.profitTable);
    this.profitPage.setContent(profitContent);
    reqbtn.OnClick = () => {
      ManulTrader.getProfitInfo();
    };


    this.strategyTable = new DataTable();
    this.strategyTable.RowIndex = false;
    this.strategyTable.addColumn("StrategyID", "Sym1", "Sym2", "Start", "Pause",
      "Stop", "Watch", "Status", "PosPnl(K)", "TraPnl(K)");
    let strategyContent = new ComboControl("col");
    strategyContent.addChild(strategyHeader);
    strategyContent.addChild(this.strategyTable);
    this.strategyPage.setContent(strategyContent);
    let row3 = new DockContainer("h").addChild(bottomPanel);
    this.children.push(row3);
    this.strategyTable.OnCellClick = (cellItem, cellIdx, rowIdx) => {
      // console.log(cellItem, cellIdx, rowIdx);
      AppComponent.self.strategyOnCellClick(cellItem, cellIdx, rowIdx);
    };

    this.psInstance.setEndpoint(20000, "172.24.51.6");
    this.psInstance.setHeartBeat(1000000);
    this.psInstance.register([3, 6, 2007741]);
    this.psInstance.subscribe((msg) => {
      if (msg.ukey === parseInt(dd_symbol.SelectedItem.Value.split(",")[0])) {
        if (msg.type === 201) {
          for (let i = 0; i < 10; ++i) {
            // console.info(i);
            this.bookViewTable.rows[i + 10].cells[0].Text = msg.bidvols[i] + "";
            this.bookViewTable.rows[i + 10].cells[1].Text = msg.bidprices[i] / 10000 + "";
            this.bookViewTable.rows[9 - i].cells[2].Text = msg.askvols[i] + "";
            this.bookViewTable.rows[9 - i].cells[1].Text = msg.askprices[i] / 10000 + "";
          }
        } else if (msg.type === 100) {
          this.bookViewTable.rows[10].cells[0].Text = msg.bidvolume;
          this.bookViewTable.rows[10].cells[1].Text = msg.bidprice / 10000;
          this.bookViewTable.rows[9].cells[1].Text = msg.askprice / 10000;
          this.bookViewTable.rows[9].cells[2].Text = msg.askvolume;
        }
        AppComponent.self.ref.detectChanges();
      }
    });
    document.title = "hello";

    this.init();
  }

  init() {
    ManulTrader.addSlot(2011, this.showStrategyInfo);
    ManulTrader.addSlot(2033, this.showStrategyInfo);
    ManulTrader.addSlot(2000, this.showStrategyCfg);
    ManulTrader.addSlot(2002, this.showStrategyCfg);
    ManulTrader.addSlot(2004, this.showStrategyCfg);
    ManulTrader.addSlot(2049, this.showStrategyCfg);
    ManulTrader.addSlot(2030, this.showStrategyCfg);
    ManulTrader.addSlot(2029, this.showStrategyCfg);
    ManulTrader.addSlot(2032, this.showStrategyCfg);
    ManulTrader.addSlot(2001, this.showGuiCmdAck);
    ManulTrader.addSlot(2003, this.showGuiCmdAck);
    ManulTrader.addSlot(2005, this.showGuiCmdAck);
    ManulTrader.addSlot(2050, this.showGuiCmdAck);
    ManulTrader.addSlot(2031, this.showGuiCmdAck);
    ManulTrader.addSlot(2048, this.showComTotalProfitInfo);
    ManulTrader.addSlot(2020, this.showComConOrder);
    ManulTrader.addSlot(2013, this.showComAccountPos);
    ManulTrader.addSlot(3502, this.showComRecordPos);
    ManulTrader.addSlot(3504, this.showComRecordPos);
    ManulTrader.addSlot(2015, this.showComGWNetGuiInfo);
    ManulTrader.addSlot(2017, this.showComGWNetGuiInfo);
    ManulTrader.addSlot(2023, this.showComProfitInfo);
    ManulTrader.addSlot(2025, this.showStatArbOrder);
    ManulTrader.addSlot(2021, this.showComorderstatusAndErrorInfo);
    ManulTrader.addSlot(2022, this.showComOrderRecord);
    ManulTrader.addSlot(3011, this.showComOrderRecord);
    ManulTrader.addSlot(3510, this.showComOrderRecord);
    ManulTrader.addSlot(2040, this.showLog);
    ManulTrader.init();
  }

  showStatArbOrder(data: any) {
    // console.log("statarb....", data);
    for (let i = 0; i < data.length; ++i) {
      let subtype = data[i].subtype;
      let dataArr = data[i].content;
      if (subtype === 1001) {  // add
        let row = AppComponent.self.statarbTable.newRow();
        row.cells[0].Text = "";
        row.cells[1].Text = dataArr[0].code;
        row.cells[2].Text = dataArr[0].pricerate / 100;
        row.cells[3].Text = dataArr[0].position;
        row.cells[4].Text = dataArr[0].quantity;
        row.cells[5].Text = dataArr[0].amount / 10000;
        row.cells[6].Text = dataArr[0].strategyid;
        row.cells[7].Text = dataArr[0].diffQty;
        row.cells[8].Text = "";
        if (dataArr[0].amount > 0)
          AppComponent.self.buyamountLabel.Text -= dataArr[0].amount / 10000;
        else if (dataArr[0].amount < 0)
          AppComponent.self.sellamountLabel.Text += dataArr[0].amount / 10000;
      } else if (subtype === 1002) { // hide
        for (let hideIdx = 0; hideIdx < AppComponent.self.statarbTable.rows.length; ++hideIdx) {
          let getUkey = AppComponent.self.statarbTable.rows[hideIdx].cells[1].Text;
          let getStrategyid = AppComponent.self.statarbTable.rows[hideIdx].cells[6].Text;
          if (getUkey === dataArr[hideIdx].code && getStrategyid === dataArr[hideIdx].strategyid) {
            AppComponent.self.statarbTable.rows[hideIdx].hidden = true;
            if (dataArr[hideIdx].amount > 0) {
              AppComponent.self.buyamountLabel.Text -= dataArr[hideIdx].amount / 10000;
            } else if (dataArr[hideIdx].amount < 0) {
              AppComponent.self.sellamountLabel.Text += dataArr[hideIdx].amount / 10000;
            }
          }
        }
      }
    }
  }
  showComorderstatusAndErrorInfo(data: any) {
    // add log

  }
  showGuiCmdAck(data: any) {
    let strategyid = data[0].strategyid;
    let ret = data[0].success ? "successfully!" : "unsuccessfully!";
    let row = AppComponent.self.findRowByStrategyId(strategyid);
    for (let i = AppComponent.self.commandIdx + 1; i < AppComponent.self.parameterIdx; ++i) {
      if (AppComponent.self.strategyTable.rows[row].cells[i].Data.key === data[0].key) {
        alert("operator: " + AppComponent.self.strategyTable.rows[row].cells[i].Data.name + " " + ret);
        if (data[0].success) {  // modify success
          AppComponent.self.strategyTable.rows[row].cells[i].Data.value = data[0].value;
        }
      }
    }
  }
  showLog(data: any) {
    let logStr = data[0];
    let time = AppComponent.self.getCurrentTime();
    let row = AppComponent.self.logTable.newRow();
    row.cells[0].Text = time;
    row.cells[1].Text = logStr;
    AppComponent.self.ref.detectChanges();
  }
  showStrategyInfo(data: any) {
    console.log("alarm info,pass", data);
    let len = data.length;
    for (let i = 0; i < len; ++i) {
      let getStraId = data[i].key;
      let getStatus = data[i].status;
      let strategyTableRows: number = AppComponent.self.strategyTable.rows.length;
      if (getStatus !== AppComponent.self.strategyStatus && strategyTableRows !== 0) { // refresh strategy status
        for (let j = 0; j < strategyTableRows; ++j) {
          if (parseInt(AppComponent.self.strategyTable.rows[j].cells[0].Text) === getStraId) {
            AppComponent.self.strategyTable.rows[j].cells[7].Text = AppComponent.self.transFormStrategyStatus(getStatus);
            let temp = AppComponent.self.rtnStraCtrlBtnType(getStatus);
            AppComponent.self.showStraContrlDisable(temp.type, temp.cellIdx, AppComponent.self.findRowByStrategyId(getStraId));
            AppComponent.self.strategyStatus = getStatus;
          }
        }
      }
      if (strategyTableRows === 0) {
        AppComponent.self.addStrategyInfo(data[i]);
      }
    }
    if (len > 0) {
      let time = AppComponent.self.getCurrentTime();
      let row = AppComponent.self.logTable.newRow();
      row.cells[0].Text = time;
      row.cells[1].Text = "StrategyServer Connected";
      AppComponent.self.ref.detectChanges();
    }
  }
  rtnStraCtrlBtnType(status: number): { type: number, cellIdx: number } {
    if (status === 2)
      return { type: 0, cellIdx: 3 };
    else if (status === 3)
      return { type: 1, cellIdx: 4 };
    else if (status === 4)
      return { type: 2, cellIdx: 5 };
    else if (status === 5)
      return { type: 3, cellIdx: 6 };
    else
      return { type: -1, cellIdx: -1 };
  }
  findRowByStrategyId(strategyid: number): number {
    let strategyTableRows: number = AppComponent.self.strategyTable.rows.length;
    for (let i = 0; i < strategyTableRows; ++i) {
      let getId = AppComponent.self.strategyTable.rows[i].cells[0].Text;
      if (strategyid === getId)
        return i;
    }
    return 0;
  }
  addStrategyInfo(obj: any) {
    let row = this.strategyTable.newRow();
    row.cells[0].Text = obj.key;
    row.cells[3].Type = "button";
    row.cells[3].Text = "start";
    row.cells[4].Type = "button";
    row.cells[4].Text = "pause";
    row.cells[5].Type = "button";
    row.cells[5].Text = "stop";
    row.cells[6].Type = "button";
    row.cells[6].Text = "watch";
    row.cells[7].Text = AppComponent.self.transFormStrategyStatus(obj.status);
    AppComponent.self.strategyStatus = obj.status;
    let btnDisableType: number = 0;
    if (obj.status === 2)
      AppComponent.self.showStraContrlDisable(btnDisableType, 3, 0);
    else if (obj.status === 3)
      AppComponent.self.showStraContrlDisable(btnDisableType, 4, 0);
    else if (obj.status === 4)
      AppComponent.self.showStraContrlDisable(btnDisableType, 5, 0);
    else if (obj.status === 5)
      AppComponent.self.showStraContrlDisable(btnDisableType, 6, 0);
    AppComponent.self.ref.detectChanges();
  }
  transFormStrategyStatus(data: any): String {
    let rtn: String = "";
    if (data === EStrategyStatus.STRATEGY_STATUS_INIT)
      return "INIT";
    else if (data === EStrategyStatus.STRATEGY_STATUS_CREATE)
      return "CREATE";
    else if (data === EStrategyStatus.STRATEGY_STATUS_RUN)
      return "RUN";
    else if (data === EStrategyStatus.STRATEGY_STATUS_PAUSE)
      return "PAUSE";
    else if (data === EStrategyStatus.STRATEGY_STATUS_STOP)
      return "STOP";
    else if (data === EStrategyStatus.STRATEGY_STATUS_WATCH)
      return "WATCH";
    else if (data === EStrategyStatus.STRATEGY_STATUS_ERROR)
      return "ERROR";
    else
      return "ERROR";
  }
  showComConOrder(data: any) {
    console.log("showComConOrder: 2020 ,UNKNOWN ,????", data);
  }
  showComOrderRecord(data: any) {
    console.log("showComOrderRecord", data);
    for (let i = 0; i < data.length; ++i) {
      let orderStatus = data[i].od.status;
      if (orderStatus === 9 || orderStatus === 8) {
        AppComponent.self.deleteUndoneOrder(data[i].od.orderid);
        AppComponent.self.handleDoneOrder(data[i]);
      } else {
        AppComponent.self.handleUndoneOrder(data[i]);
      }
    }
  }
  deleteUndoneOrder(data: any) {
    let rows = this.orderstatusTable.rows.length;
    for (let i = 0; i < rows; ++i) {
      let getOrderId = this.orderstatusTable.rows[i].cells[2].Text;
      if (data === getOrderId) {
        this.orderstatusTable.rows.splice(i);
        break;
      }
    }
  }
  handleDoneOrder(data: any) {
    let doneorderTablRows: number = this.doneOrdersTable.rows.length;
    let orderId: number = data.od.orderid;
    if (doneorderTablRows === 0) { // add
      this.addDoneOrderInfo(data);
    } else {
      let checkFlag: boolean = false;
      for (let j = 0; j < doneorderTablRows; ++j) {
        let getOrderId = this.doneOrdersTable.rows[j].cells[2].Text;
        if (orderId === getOrderId) { // refresh
          checkFlag = true;
          this.refreshDoneOrderInfo(data, j);
        }
      }
      if (!checkFlag) {
        this.addDoneOrderInfo(data);
      }
      checkFlag = false;
    }
  }
  addDoneOrderInfo(obj: any) {
    let row = this.doneOrdersTable.newRow();
    row.cells[0].Text = obj.od.innercode;
    row.cells[1].Text = "";
    row.cells[2].Text = obj.od.orderid;
    row.cells[3].Text = obj.od.strategyid;
    let action: number = obj.od.action;
    if (action === 0)
      row.cells[4].Text = "Buy";
    else if (action === 1)
      row.cells[4].Text = "Sell";
    else
      row.cells[4].Text = "";
    row.cells[5].Text = obj.od.oprice / 10000;
    row.cells[6].Text = obj.od.ivolume;
    row.cells[7].Text = this.parseOrderStatus(obj.od.status);
    row.cells[8].Text = this.formatTime(obj.od.odatetime.tv_sec);
    row.cells[9].Text = obj.od.ovolume;
    let orderPriceType = obj.donetype;
    if (orderPriceType === 1)
      row.cells[10].Text = "Active";
    else if (orderPriceType === 2)
      row.cells[10].Text = "Passive";
    else
      row.cells[10].Text = "UNKNOWN";
    row.cells[11].Text = obj.con.account;
    row.cells[12].Text = this.formatTime(obj.od.idatetime.tv_sec);
    row.cells[13].Text = obj.od.iprice / 10000;
    row.cells[14].Text = "";
    AppComponent.self.ref.detectChanges();
  }
  refreshDoneOrderInfo(obj: any, idx: number) {
    let action: number = obj.od.action;
    if (action === 0)
      this.doneOrdersTable.rows[idx].cells[4].Text = "Buy";
    else if (action === 1)
      this.doneOrdersTable.rows[idx].cells[4].Text = "Sell";
    else
      this.doneOrdersTable.rows[idx].cells[4].Text = "";
    this.doneOrdersTable.rows[idx].cells[5].Text = obj.od.oprice / 10000;
    this.doneOrdersTable.rows[idx].cells[6].Text = obj.od.ivolume;
    this.doneOrdersTable.rows[idx].cells[7].Text = this.parseOrderStatus(obj.od.status);
    this.doneOrdersTable.rows[idx].cells[8].Text = this.formatTime(obj.od.odatetime.tv_sec);
    this.doneOrdersTable.rows[idx].cells[9].Text = obj.od.ovolume;
    let orderPriceType = obj.donetype;
    if (orderPriceType === 1)
      this.doneOrdersTable.rows[idx].cells[10].Text = "Active";
    else if (orderPriceType === 2)
      this.doneOrdersTable.rows[idx].cells[10].Text = "Passive";
    else
      this.doneOrdersTable.rows[idx].cells[10].Text = "UNKNOWN";
    this.doneOrdersTable.rows[idx].cells[12].Text = this.formatTime(obj.od.idatetime.tv_sec);
    this.doneOrdersTable.rows[idx].cells[13].Text = obj.od.iprice / 10000;
    AppComponent.self.ref.detectChanges();
  }
  handleUndoneOrder(data: any) {
    let orderStatusTableRows: number = this.orderstatusTable.rows.length;
    let orderId: number = data.od.orderid;
    if (orderStatusTableRows === 0) { // add
      this.addUndoneOrderInfo(data);
    } else {
      let checkFlag: boolean = false;
      for (let j = 0; j < orderStatusTableRows; ++j) {
        let getOrderId = this.orderstatusTable.rows[j].cells[2].Text;
        if (orderId === getOrderId) {  // refresh
          checkFlag = true;
          this.refreshUndoneOrderInfo(data, j);
        }
      }
      if (!checkFlag) {
        this.addUndoneOrderInfo(data);
      }
      checkFlag = false;
    }
  }
  addUndoneOrderInfo(obj: any) {
    let row = this.orderstatusTable.newRow();
    row.cells[0].Text = obj.od.innercode;
    row.cells[1].Text = "";
    row.cells[2].Text = obj.od.orderid;
    row.cells[3].Text = this.formatTime(obj.od.odatetime.tv_sec);
    row.cells[4].Text = obj.od.strategyid;
    let action: number = obj.od.action;
    if (action === 0)
      row.cells[5].Text = "Buy";
    else if (action === 1)
      row.cells[5].Text = "Sell";
    else
      row.cells[5].Text = "";
    row.cells[6].Text = obj.od.oprice / 10000;
    row.cells[7].Text = obj.od.ovolume;
    row.cells[8].Text = obj.od.ivolume;
    row.cells[9].Text = this.parseOrderStatus(obj.od.status);
    row.cells[9].Data = obj.od.status;
    row.cells[10].Text = obj.con.account;
    AppComponent.self.ref.detectChanges();
  }
  formatTime(time: any): String {
    let rtnStr: String = "";
    let newDate = new Date();
    newDate.setTime(time * 1000);
    rtnStr = newDate.getHours() + ":" + newDate.getMinutes() + ":" + newDate.getSeconds();
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
    if (status === EOrderStatus.ORDER_STATUS_INVALID)
      return "0.无效";
    else if (status === EOrderStatus.ORDER_STATUS_INIT)
      return "1.未报";
    else if (status === EOrderStatus.ORDER_STATUS_WAIT_SEND)
      return "2.待报";
    else if (status === EOrderStatus.ORDER_STATUS_SEND)
      return "3.已报";
    else if (status === EOrderStatus.ORDER_STATUS_SEND_WAIT_CANCEL)
      return "4.已报待撤";
    else if (status === EOrderStatus.ORDER_STATUS_PART_WAIT_CANCEL)
      return "5.部成待撤";
    else if (status === EOrderStatus.ORDER_STATUS_PART_CANCELED)
      return "6.部撤";
    else if (status === EOrderStatus.ORDER_STATUS_CANCELED)
      return "7.已撤";
    else if (status === EOrderStatus.ORDER_STATUS_PART_DEALED)
      return "8.部成";
    else if (status === EOrderStatus.ORDER_STATUS_DEALED)
      return "9.已成";
    else
      return "10.废单";
  }
  refreshUndoneOrderInfo(obj: any, idx: number) {
    this.orderstatusTable.rows[idx].cells[3].Text = this.formatTime(obj.od.odatetime.tv_sec);
    let action: number = obj.od.action;
    if (action === 0)
      this.orderstatusTable.rows[idx].cells[5].Text = "Buy";
    else if (action === 1)
      this.orderstatusTable.rows[idx].cells[5].Text = "Sell";
    else
      this.orderstatusTable.rows[idx].cells[5].Text = "";
    this.orderstatusTable.rows[idx].cells[6].Text = obj.od.oprice / 10000;
    this.orderstatusTable.rows[idx].cells[7].Text = obj.od.ovolume;
    this.orderstatusTable.rows[idx].cells[8].Text = obj.od.ivolume;
    this.orderstatusTable.rows[idx].cells[9].Text = this.parseOrderStatus(obj.od.status);
    this.orderstatusTable.rows[idx].cells[9].Data = obj.od.status;
    AppComponent.self.ref.detectChanges();
  }

  showComRecordPos(data: any) {
    // console.log("000000000000", data);
    for (let i = 0; i < data.length; ++i) {
      let equityPosTableRows: number = AppComponent.self.PositionTable.rows.length;
      let equityposSec: number = data[i].secucategory;
      let ukey: number = data[i].record.code;
      if (equityPosTableRows === 0) {
        if (equityposSec === 1) // equity
          AppComponent.self.addEquityPosInfo(data[i]);
        else if (equityposSec === 2) {
          AppComponent.self.addFuturePosInfo(data[i]);
        }
      }
      else {
        let checkFlag: boolean = false;
        for (let j = 0; j < equityPosTableRows; ++j) {
          let getUkey = AppComponent.self.PositionTable.rows[j].cells[2].Text;
          let getSec = AppComponent.self.PositionTable.rows[j].cells[1].Text;
          if (getUkey === ukey) { // refresh
            checkFlag = true;
            if (getSec === 1) {
              AppComponent.self.refreshEquitPosInfo(data[i], j);
            }
            else if (getSec === 2) {
              AppComponent.self.refreshFuturePosInfo(data[i], j);
            }
          }
        }
        if (!checkFlag) {  // add
          if (equityposSec === 1) {
            AppComponent.self.addEquityPosInfo(data[i]);
          }
          else if (equityposSec === 2) {
            AppComponent.self.addFuturePosInfo(data[i]);
          }
        }
        checkFlag = false;
      }
    }
  }

  addEquityPosInfo(obj: any) {
    let row = AppComponent.self.PositionTable.newRow();
    row.cells[0].Text = obj.record.account;
    row.cells[1].Text = obj.secucategory;
    row.cells[2].Text = obj.record.code;
    row.cells[3].Text = "";
    row.cells[4].Text = obj.record.TotalVol;
    row.cells[5].Text = obj.record.AvlVol;
    row.cells[6].Text = obj.record.AvlCreRedempVol;
    row.cells[7].Text = obj.record.WorkingVol;
    row.cells[8].Text = obj.record.TotalCost;
    row.cells[9].Text = 0;
    row.cells[10].Text = 0;
    row.cells[11].Text = obj.strategyid;
    row.cells[12].Text = obj.record.type;
    AppComponent.self.ref.detectChanges();
  }
  addFuturePosInfo(obj: any) {
    let row = AppComponent.self.PositionTable.newRow();
    row.cells[0].Text = obj.record.account;
    row.cells[1].Text = obj.secucategory;
    row.cells[2].Text = obj.record.code;
    row.cells[3].Text = "";
    row.cells[4].Text = obj.record.TotalVol;
    row.cells[5].Text = obj.record.AvlVol;
    row.cells[6].Text = 0;
    row.cells[7].Text = obj.record.WorkingVol;
    row.cells[8].Text = obj.record.TotalCost;
    row.cells[9].Text = obj.record.TodayOpen;
    row.cells[10].Text = obj.record.AveragePrice;
    row.cells[11].Text = obj.strategyid;
    row.cells[12].Text = obj.record.type;
    AppComponent.self.ref.detectChanges();
  }
  refreshEquitPosInfo(obj: any, idx: number) {
    AppComponent.self.PositionTable.rows[idx].cells[4].Text = obj.record.TotalVol;
    AppComponent.self.PositionTable.rows[idx].cells[5].Text = obj.record.AvlVol;
    AppComponent.self.PositionTable.rows[idx].cells[6].Text = obj.record.AvlCreRedempVol;
    AppComponent.self.PositionTable.rows[idx].cells[7].Text = obj.record.WorkingVol;
    AppComponent.self.PositionTable.rows[idx].cells[8].Text = obj.record.TotalCost;
    AppComponent.self.ref.detectChanges();
  }
  refreshFuturePosInfo(obj: any, idx: number) {
    AppComponent.self.PositionTable.rows[idx].cells[4].Text = obj.record.TotalVol;
    AppComponent.self.PositionTable.rows[idx].cells[5].Text = obj.record.AvlVol;
    AppComponent.self.PositionTable.rows[idx].cells[7].Text = obj.record.WorkingVol;
    AppComponent.self.PositionTable.rows[idx].cells[8].Text = obj.record.TotalCost;
    AppComponent.self.PositionTable.rows[idx].cells[9].Text = obj.record.TodayOpen;
    AppComponent.self.PositionTable.rows[idx].cells[10].Text = obj.record.AveragePrice;
    AppComponent.self.ref.detectChanges();
  }
  showComGWNetGuiInfo(data: any) {
    let markLen = AppComponent.self.statusbar.items.length;
    if (markLen === 0) { // add
      AppComponent.self.addStatusBarMark(data[0]);
    } else {
      let markFlag: Boolean = false;
      for (let i = 0; i < markLen; ++i) {
        let text = AppComponent.self.statusbar.items[i].text;
        if (text === data[0].name) {
          AppComponent.self.statusbar.items[i].color = data[0].connected ? "green" : "red";
          markFlag = true;
        }
      }
      if (!markFlag)
        AppComponent.self.addStatusBarMark(data[0]);
    }
  }
  addStatusBarMark(data: any) {
    console.log(data);
    let name = data.name;
    let tempmark = new StatusBarItem(name);
    tempmark.section = "right";
    tempmark.color = data.connected ? "green" : "red";
    tempmark.width = 50;
    AppComponent.self.statusbar.items.push(tempmark);
    let row = AppComponent.self.logTable.newRow();
    row.cells[0].Text = AppComponent.self.getCurrentTime();
    row.cells[1].Text = name + " " + (data.connected ? "Connected" : "Disconnected");
  }
  showComTotalProfitInfo(data: any) {
    let subtype = data[0].subtype;
    let arr = data[0].content;
    if (subtype === 1) { // profitcmd & alarmitem

    } else if (subtype === 0) { // set pnl
      for (let i = 0; i < arr.length; ++i) {
        AppComponent.self.totalpnLabel.Text = arr[i].totalpnl / 10000;
        AppComponent.self.pospnlLabel.Text = arr[i].totalpositionpnl / 10000;
        AppComponent.self.trapnlt.Text = arr[i].totaltradingpnl / 10000;
        AppComponent.self.pospnlt.Text = arr[i].totaltodaypositionpnl / 10000;
        AppComponent.self.totalpnlt.Text = arr[i].totaltodaypositionpnl / 10000 + arr[i].totaltradingpnl / 10000;
      }
    }
    AppComponent.self.ref.detectChanges();
  }
  showComProfitInfo(data: any) {
    for (let i = 0; i < data.length; ++i) {
      let profitTableRows: number = AppComponent.self.profitTable.rows.length;
      let profitUkey: number = data[i].innercode;
      let strategyid = data[i].strategyid;
      let row = AppComponent.self.findRowByStrategyId(strategyid);
      let totalpnl = (data[i].totalpositionpnl / 10000 / 1000).toFixed(0);
      let tradingpnl = (data[i].totaltradingpnl / 10000 / 1000).toFixed(0);
      AppComponent.self.strategyTable.rows[row].cells[8].Text = totalpnl;
      if (parseInt(totalpnl) > 0)
        AppComponent.self.strategyTable.rows[row].cells[8].Class = "default";
      else
        AppComponent.self.strategyTable.rows[row].cells[8].Class = "danger";
      AppComponent.self.strategyTable.rows[row].cells[9].Text = tradingpnl;

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
    row.cells[1].Text = "";
    row.cells[2].Text = obj.account;
    row.cells[3].Text = obj.strategyid;
    row.cells[4].Text = obj.avgpriceforbuy / 10000;
    row.cells[5].Text = obj.avgpriceforsell / 10000;
    row.cells[6].Text = obj.positionpnl / 10000;
    row.cells[7].Text = obj.tradingpnl / 10000;
    row.cells[8].Text = obj.intradaytradingfee / 10000;
    row.cells[9].Text = obj.tradingfee / 10000;
    row.cells[10].Text = obj.lasttradingfee;
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

    AppComponent.self.ref.detectChanges();
  }

  showComAccountPos(data: any) {
    //  console.log("***********", data)
    for (let i = 0; i < data.length; ++i) {
      let accTableRows: number = AppComponent.self.accountTable.rows.length;
      let accData: number = data[i].record.account;
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
            }
            else if (getSec === 2) {
              AppComponent.self.refreshAccountFutureInfo(data[i], j);
            }
          }
        }
        if (!checkFlag) {   // add
          if (accSec === 1) {
            AppComponent.self.addAccountEquitInfo(data[i]);
          }
          else if (accSec === 2) {
            AppComponent.self.addAccountFutureInfo(data[i]);
          }
        }
        checkFlag = false;
      }
    }
    AppComponent.self.ref.detectChanges();

  }
  addAccountEquitInfo(obj: any) {
    // console.info(AppComponent.self.accountTable);
    let row = AppComponent.self.accountTable.newRow();
    row.cells[0].Text = obj.record.account;
    row.cells[1].Text = obj.secucategory;
    row.cells[2].Text = obj.record.TotalAmount;
    row.cells[3].Text = obj.record.AvlAmount;
    row.cells[4].Text = obj.record.FrzAmount;
    row.cells[5].Text = obj.record.date;
    row.cells[6].Text = obj.record.c;
    if (obj.market !== 0 && obj.market === SECU_MARKET.SM_SH)
      row.cells[7].Text = obj.record.AvlAmount;
    else
      row.cells[7].Text = 0;
    if (obj.market !== 0 && obj.market === SECU_MARKET.SM_SZ)
      row.cells[8].Text = obj.record.AvlAmount;
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
    AppComponent.self.ref.detectChanges();
  }
  addAccountFutureInfo(obj: any) {
    let row = AppComponent.self.accountTable.newRow();
    row.cells[0].Text = obj.record.account;
    row.cells[1].Text = obj.secucategory;
    row.cells[2].Text = obj.record.TotalAmount;
    row.cells[3].Text = obj.record.AvlAmount;
    row.cells[4].Text = obj.record.FrzAmount;
    row.cells[5].Text = obj.record.date;
    row.cells[6].Text = obj.record.c;
    row.cells[7].Text = 0;
    row.cells[8].Text = 0;
    row.cells[9].Text = obj.record.BuyFrzAmt;
    row.cells[10].Text = obj.record.SellFrzAmt;
    row.cells[11].Text = obj.record.Buymargin;
    row.cells[12].Text = obj.record.SellMargin;
    row.cells[13].Text = obj.record.TotalMargin;
    row.cells[14].Text = obj.record.Fee;
    row.cells[15].Text = obj.record.PositionPL;
    row.cells[16].Text = obj.record.ClosePL;
    AppComponent.self.ref.detectChanges();
  }
  refreshAccountEquiteInfo(obj: any, idx: number) {
    if (obj.market === SECU_MARKET.SM_SH)
      AppComponent.self.accountTable.rows[idx].cells[7].Text = obj.record.AvlAmount;
    else if (obj.market === SECU_MARKET.SM_SZ)
      AppComponent.self.accountTable.rows[idx].cells[8].Text = obj.record.AvlAmount;
    else {
      AppComponent.self.accountTable.rows[idx].cells[2].Text = obj.record.TotalAmount;
      AppComponent.self.accountTable.rows[idx].cells[3].Text = obj.record.AvlAmount;
      AppComponent.self.accountTable.rows[idx].cells[4].Text = obj.record.FrzAmount;
      AppComponent.self.accountTable.rows[idx].cells[5].Text = obj.record.date;
      AppComponent.self.accountTable.rows[idx].cells[6].Text = obj.record.c;
    }
    AppComponent.self.ref.detectChanges();
  }
  refreshAccountFutureInfo(obj: any, idx: number) {
    AppComponent.self.accountTable.rows[idx].cells[2].Text = obj.record.TotalAmount;
    AppComponent.self.accountTable.rows[idx].cells[3].Text = obj.record.AvlAmount;
    AppComponent.self.accountTable.rows[idx].cells[4].Text = obj.record.FrzAmount;
    AppComponent.self.accountTable.rows[idx].cells[5].Text = obj.record.date;
    AppComponent.self.accountTable.rows[idx].cells[6].Text = obj.record.c;
    AppComponent.self.accountTable.rows[idx].cells[9].Text = obj.record.BuyFrzAmt;
    AppComponent.self.accountTable.rows[idx].cells[10].Text = obj.record.SellFrzAmt;
    AppComponent.self.accountTable.rows[idx].cells[11].Text = obj.record.Buymargin;
    AppComponent.self.accountTable.rows[idx].cells[12].Text = obj.record.SellMargin;
    AppComponent.self.accountTable.rows[idx].cells[13].Text = obj.record.TotalMargin;
    AppComponent.self.accountTable.rows[idx].cells[14].Text = obj.record.Fee;
    AppComponent.self.accountTable.rows[idx].cells[15].Text = obj.record.PositionPL;
    AppComponent.self.accountTable.rows[idx].cells[16].Text = obj.record.ClosePL;
    AppComponent.self.ref.detectChanges();
  }
  showStrategyCfg(data: any) {
    // console.log("333333333333", data);
    if (AppComponent.self.strategyTable.rows.length === 0)   // table without strategy item
      return;
    let addSubCOmFlag: boolean = false;
    for (let i = 0; i < data.length; ++i) {
      let level = data[i].level;
      let type = data[i].type;
      let strategyId = data[i].strategyid;
      let name = data[i].name;
      if (!addSubCOmFlag && data.length > 50) {   // add submit & comment btn
        for (let i = 0; i < AppComponent.self.strategyTable.rows.length; ++i) {   // find row in strategy table
          let getId = AppComponent.self.strategyTable.rows[i].cells[0].Text;
          if (getId === strategyId) {
            AppComponent.self.strategyTable.insertColumn("Submit", AppComponent.self.commandIdx);
            AppComponent.self.strategyTable.rows[i].cells[AppComponent.self.commandIdx].Type = "button";
            AppComponent.self.strategyTable.rows[i].cells[AppComponent.self.commandIdx].Text = "submit";
            AppComponent.self.strategyTable.insertColumn("Comment", AppComponent.self.parameterIdx);
            AppComponent.self.strategyTable.rows[i].cells[AppComponent.self.parameterIdx].Type = "button";
            AppComponent.self.strategyTable.rows[i].cells[AppComponent.self.parameterIdx].Text = "comment";
            addSubCOmFlag = true;
            break;
          }
        }
      }
      if (type === StrategyCfgType.STRATEGY_CFG_TYPE_INSTRUMENT) {  // sym1 sym2   in source code,this need a array,calculate the sum of value
        let datalen = data[i].length;
        let getValue = data[i].value;
        let getRow = AppComponent.self.findRowByStrategyId(strategyId);
        AppComponent.self.strategyTable.rows[getRow].cells[1].Text = getValue;
      }
      if (type === StrategyCfgType.STRATEGY_CFG_TYPE_PARAMETER) {  // show
        let paraObj: { row: number, col: number } = AppComponent.self.checkTableIndex(strategyId, name, type, AppComponent.self.commandIdx, AppComponent.self.parameterIdx);
        if (paraObj.col === -1) { // add
          AppComponent.self.addStrategyTableCol({ row: paraObj.row, col: AppComponent.self.parameterIdx }, data[i], type);
          if (!(data.length < 50))
            AppComponent.self.parameterIdx++;
        }
        else { // refresh
          AppComponent.self.refreshStrategyInfo(paraObj, data[i], type);
        }
      }
      if (type === StrategyCfgType.STRATEGY_CFG_TYPE_COMMENT && level > 0) {  // show
        let commentObj: { row: number, col: number } = AppComponent.self.checkTableIndex(strategyId, name, type, 10, AppComponent.self.commentIdx);
        if (commentObj.col === -1) { // add
          AppComponent.self.addStrategyTableCol({ row: commentObj.row, col: AppComponent.self.commentIdx }, data[i], type);
          if (!(data.length < 50)) {
            AppComponent.self.commentIdx++;
            AppComponent.self.commandIdx++;
            AppComponent.self.parameterIdx++;
          }
        }
        else { // refresh
          AppComponent.self.refreshStrategyInfo(commentObj, data[i], type);
        }
      }

      if (type === StrategyCfgType.STRATEGY_CFG_TYPE_COMMENT && level === 0) {  // this msg insert into comment dialog ,but now, pause!
        // console.log("COMMENT level == 0:", data[i]);
      }
      if (type === StrategyCfgType.STRATEGY_CFG_TYPE_COMMAND) { // show
        let commandObj: { row: number, col: number } = AppComponent.self.checkTableIndex(strategyId, name, type, AppComponent.self.commentIdx, AppComponent.self.commandIdx);
        if (commandObj.col === -1) {  // add
          AppComponent.self.addStrategyTableCol({ row: commandObj.row, col: AppComponent.self.commandIdx }, data[i], type);
          if (!(data.length < 50)) {
            AppComponent.self.commandIdx++;
            AppComponent.self.parameterIdx++;
          }
        } else {  // refresh
          AppComponent.self.refreshStrategyInfo(commandObj, data[i], type);
        }
      }
    }

  }
  checkTableIndex(strategyid: number, name: String, type: number, preIdx: number, rearIdx: number): { row: number, col: number } {
    let initLen: number = 10; // init talble column lengths
    let checkcolFlag: boolean = false;
    let rowFlagIdx: number = -1;

    for (let i = 0; i < this.strategyTable.rows.length; ++i) {   // find row in strategy table
      let getId = this.strategyTable.rows[i].cells[0].Text;
      if (getId === strategyid) {
        rowFlagIdx = i;
      }
    }
    // special judge
    if (type === StrategyCfgType.STRATEGY_CFG_TYPE_COMMENT)
      if ((rearIdx - preIdx) === 0)
        return { row: rowFlagIdx, col: -1 };
    if (type === StrategyCfgType.STRATEGY_CFG_TYPE_COMMAND)
      if ((rearIdx - preIdx) === 0)
        return { row: rowFlagIdx, col: -1 };
    if (type === StrategyCfgType.STRATEGY_CFG_TYPE_PARAMETER)
      if ((rearIdx - preIdx) === 1)
        return { row: rowFlagIdx, col: -1 };

    for (let j = preIdx; j < rearIdx; ++j) {
      // console.log("0.0.0.0.0.0.;", rowFlagIdx, j, startIdx, endIdx, AppComponent.self.strategyTable.columns.length);
      let getName = AppComponent.self.strategyTable.columns[j].Name;
      if (name === getName) {
        checkcolFlag = true;
        return { row: rowFlagIdx, col: j };
      }
    }
    if ((rowFlagIdx === -1) || !checkcolFlag)
      return { row: rowFlagIdx, col: -1 };
  }
  addStrategyTableCol(paraObj: any, data: any, type: number) {
    let colIdx = paraObj.col;
    let rowIdx = paraObj.row;
    let title = data.name;
    let decimal = data.decimal;
    let dataKey = data.key;
    let strategyId = data.strategyid;
    let value = data.value;
    let level = data.level;
    if (type === StrategyCfgType.STRATEGY_CFG_TYPE_COMMENT) {
      AppComponent.self.strategyTable.insertColumn(title, colIdx);  // add col
      AppComponent.self.strategyTable.rows[rowIdx].cells[colIdx].Text = parseFloat(data.value) / Math.pow(10, decimal);
      AppComponent.self.strategyTable.rows[rowIdx].cells[colIdx].Class = "default";
    } else if (type === StrategyCfgType.STRATEGY_CFG_TYPE_COMMAND) {
      AppComponent.self.strategyTable.insertColumn(title, colIdx);  // add col
      // add button
      AppComponent.self.strategyTable.rows[rowIdx].cells[colIdx].Type = "button";
      AppComponent.self.strategyTable.rows[rowIdx].cells[colIdx].Class = "primary";
      AppComponent.self.strategyTable.rows[rowIdx].cells[colIdx].Text = title;
      if (value === 0)
        AppComponent.self.strategyTable.rows[rowIdx].cells[colIdx].Disable = true;
    } else if (type === StrategyCfgType.STRATEGY_CFG_TYPE_PARAMETER) {
      AppComponent.self.strategyTable.insertColumn(title, colIdx);
      AppComponent.self.strategyTable.rows[rowIdx].cells[colIdx].Type = "textbox";
      AppComponent.self.strategyTable.rows[rowIdx].cells[colIdx].Text = parseFloat(data.value) / Math.pow(10, decimal);
      AppComponent.self.strategyTable.rows[rowIdx].cells[colIdx].Class = "success";
    } else {
    }
    AppComponent.self.strategyTable.rows[rowIdx].cells[colIdx].Data = { key: dataKey, value: value, level: level, strategyid: strategyId, name: title, type: type, decimal: decimal };
    AppComponent.self.ref.detectChanges();
  }
  refreshStrategyInfo(paraObj: any, data: any, type: number) {
    let colIdx = paraObj.col;
    let rowIdx = paraObj.row;
    let value = data.value;
    let decimal = data.decimal;
    let title = data.name;
    let dataKey = data.key;
    let strategyId = data.strategyid;
    let level = data.level;
    if (type === StrategyCfgType.STRATEGY_CFG_TYPE_COMMENT) {
      AppComponent.self.strategyTable.rows[rowIdx].cells[colIdx].Text = parseFloat(data.value) / Math.pow(10, decimal);
    }
    else if (type === StrategyCfgType.STRATEGY_CFG_TYPE_COMMAND) {
      if (value === 0)
        AppComponent.self.strategyTable.rows[rowIdx].cells[colIdx].Disable = true;
    }
    else if (type === StrategyCfgType.STRATEGY_CFG_TYPE_PARAMETER) {
      AppComponent.self.strategyTable.rows[rowIdx].cells[colIdx].Text = parseFloat(data.value) / Math.pow(10, decimal);
      if (value === 0)
        AppComponent.self.strategyTable.rows[rowIdx].cells[colIdx].Disable = true;
    }
    else {

    }
    AppComponent.self.strategyTable.rows[rowIdx].cells[colIdx].Data = { key: dataKey, value: value, level: level, strategyid: strategyId, name: title, type: type, decimal: decimal };
    AppComponent.self.ref.detectChanges();
  }

  controlBtnClick(type: any) {

  }
  strategyOnCellClick(data: any, cellIdx: number, rowIdx: number) {
    console.log(data);
    if (data.dataSource.text === "submit") {  // submit
      let sendArray = [];
      let dvalue = 0;
      let alertFlag: Boolean = false;
      for (let i = AppComponent.self.commandIdx + 1; i < AppComponent.self.parameterIdx; ++i) {
        let bindData = AppComponent.self.strategyTable.rows[rowIdx].cells[i].Data;
        let decimal = bindData.decimal;
        let base = Math.pow(10, decimal);
        let originValue = bindData.value;
        dvalue = parseFloat(AppComponent.self.strategyTable.rows[rowIdx].cells[i].Text);
        if (dvalue > 0) {
          dvalue = parseInt((dvalue * base + 5 / (10 * base)) + "");
        } else if (dvalue < 0) {
          dvalue = parseInt((dvalue * base - 5 / (10 * base)) + "");
        }
        if (dvalue !== parseInt(originValue)) {
          alertFlag = true;
          sendArray.push({ idx: i, strategyid: bindData.strategyid, key: bindData.key, value: dvalue, type: 2 });
        }
      }
      if (alertFlag)
        ManulTrader.submitPara(sendArray);
      else
        alert("no changes!");
    } else if (data.dataSource.text === "comment") {

    } else {
      let clickType = data.Data.type;
      let clickname = data.Data.name;
      let clicklevel = data.Data.level;
      let strategyId: number = AppComponent.self.strategyTable.rows[rowIdx].cells[0].Text;
      if (data.dataSource.text === "start") {
        AppComponent.self.showStraContrlDisable(0, cellIdx, rowIdx);
        ManulTrader.strategyControl(0, strategyId);
      } else if (data.dataSource.text === "pause") {
        AppComponent.self.showStraContrlDisable(1, cellIdx, rowIdx);
        ManulTrader.strategyControl(1, strategyId);
      } else if (data.dataSource.text === "stop") {
        AppComponent.self.showStraContrlDisable(2, cellIdx, rowIdx);
        ManulTrader.strategyControl(2, strategyId);
      } else if (data.dataSource.text === "watch") {
        AppComponent.self.showStraContrlDisable(3, cellIdx, rowIdx);
        ManulTrader.strategyControl(3, strategyId);
      }

      if (clickType === 3) {   // command btn
        let ret: Boolean = true;
        if (clicklevel > 9) {
          // messagebox  and return ret;
          ret = confirm("extute " + clickname + " ?");
        }
        if (ret) {
          ManulTrader.submitPara([data.Data]);
        }
      }
    }
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
    AppComponent.self.ref.detectChanges();
  }

}


