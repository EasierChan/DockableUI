/**
 * created by cl, 2017/02/28
 * update: [date]
 * desc:
 */

import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import {
  Control, DockContainer, Splitter, TabPanel, TabPage, URange, Dialog,
  DataTable, DataTableRow, DataTableColumn, DropDown, StatusBar, StatusBarItem
} from "../../base/controls/control";
import { ComboControl, MetaControl } from "../../base/controls/control";
import { PriceService } from "../../base/api/services/priceService";
import { MessageBox, fs, AppStateCheckerRef, File, Environment, Sound } from "../../base/api/services/backend.service";
import { ManulTrader } from "./bll/sendorder";
import { EOrderType, AlphaSignalInfo, SECU_MARKET, EOrderStatus, EStrategyStatus, StrategyCfgType } from "../../base/api/model/itrade/orderstruct";
declare let window: any;
@Component({
  moduleId: module.id,
  selector: "body",
  templateUrl: "app.component.html",
  providers: [
    PriceService,
    AppStateCheckerRef
  ]
})
export class AppComponent implements OnInit {
  className: string = "dock-container vertical";
  children: Control[] = [];
  private pageObj: Object = new Object();
  private dialog: Dialog;
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
  private portfolioBUyOffset: DropDown;
  private portfolioSellOffset: DropDown;
  private allChk: MetaControl;
  private range: URange;
  private rateText: MetaControl;
  private dd_Account: DropDown;
  private dd_Strategy: DropDown;

  // strategy index flag
  private commentIdx: number = 10;
  private commandIdx: number = 10;
  private parameterIdx: number = 11;
  private strategyStatus: number = 0;
  private filename: String = "";
  private selectArr = [];

  private statusbar: StatusBar;
  private option: any;

  constructor(private psInstance: PriceService, private ref: ChangeDetectorRef, private statechecker: AppStateCheckerRef) {
    AppComponent.self = this;
    window.onbeforeunload = this.onDestroy;
    this.statechecker.onInit(this, this.onReady);
  }

  onReady(option: any) {
    // option.port and option.host and option.name ;
    this.option = option;
  }

  ngOnInit(): void {
    this.statusbar = new StatusBar();
    this.orderstatusPage = new TabPage("OrderStatus", "OrderStatus");
    this.pageObj["OrderStatus"] = this.orderstatusPage;
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
    let btn_cancel = new MetaControl("button");
    btn_cancel.Text = "Cancel Selected";
    orderstatusHeader.addChild(btn_cancel);
    orderstatusContent.addChild(orderstatusHeader);
    cb_handle.OnClick = () => {
      dd_status.Disable = btn_cancel.Disable = cb_handle.Text;
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
    this.orderstatusTable.columnConfigurable = true;
    orderstatusContent.addChild(this.orderstatusTable);
    this.orderstatusPage.setContent(orderstatusContent);

    this.doneOrdersPage = new TabPage("DoneOrders", "DoneOrders");
    this.pageObj["DoneOrders"] = this.doneOrdersPage;
    let doneOrdersContent = new ComboControl("col");
    this.doneOrdersTable = new DataTable("table");
    this.doneOrdersTable.addColumn("U-Key", "Symbol", "OrderId", "Strategy",
      "Ask/Bid", "Price", "DoneVol", "Status", "Time", "OrderVol", "OrderType", "Account", "OrderTime",
      "OrderPrice", "SymbolCode");
    this.doneOrdersTable.columnConfigurable = true;
    doneOrdersContent.addChild(this.doneOrdersTable);
    this.doneOrdersPage.setContent(doneOrdersContent);


    this.accountPage = new TabPage("Account", "Account");
    this.pageObj["Account"] = this.accountPage;
    let accountContent = new ComboControl("col");
    this.accountTable = new DataTable("table");
    this.accountTable.addColumn("Account", "Secucategory", "TotalAmount", "AvlAmount", "FrzAmount", "Date", "Status",
      "ShangHai", "ShenZhen", "BuyFrzAmt", "SellFrzAmt", "Buymargin", "SellMargin", "TotalMargin", "Fee",
      "PositionPL", "ClosePL");
    this.accountTable.columnConfigurable = true;
    accountContent.addChild(this.accountTable);
    this.accountPage.setContent(accountContent);

    this.PositionPage = new TabPage("Position", "Position");
    this.pageObj["Position"] = this.PositionPage;
    let positionContent = new ComboControl("col");
    this.PositionTable = new DataTable("table2");
    this.PositionTable.addColumn("Account", "secucategory", "U-Key", "Code", "TotalQty", "AvlQty", "AvlCreRedempVol", "WorkingQty",
      "TotalCost", "TodayOpen", "AvgPirce", "StrategyId", "Type");
    this.PositionTable.columnConfigurable = true;
    positionContent.addChild(this.PositionTable);
    this.PositionPage.setContent(positionContent);

    let leftAlign = 20;
    let rowSep = 5;
    this.tradePage = new TabPage("ManulTrader", "ManulTrader");
    let tradeContent = new ComboControl("col");
    tradeContent.MinHeight = 500;
    tradeContent.MinWidth = 500;
    this.dd_Account = new DropDown();
    this.dd_Account.Width = 120;
    this.dd_Account.Title = "Account:   ";
    this.dd_Account.Left = leftAlign;
    this.dd_Account.Top = 20;
    tradeContent.addChild(this.dd_Account);
    this.dd_Strategy = new DropDown();
    this.dd_Strategy.Width = 120;
    this.dd_Strategy.Left = leftAlign;
    this.dd_Strategy.Top = rowSep;
    this.dd_Strategy.Title = "Strategy:  ";
    tradeContent.addChild(this.dd_Strategy);
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

    btn_submit.OnClick = () => {
      let account = this.dd_Account.SelectedItem.Text;
      let getstrategy = this.dd_Strategy.SelectedItem.Text;
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

    this.bookviewPage = new TabPage("BookView", "BookView");
    this.pageObj["BookView"] = this.bookviewPage;

    let bookviewHeader = new ComboControl("row");
    let dd_symbol = new DropDown();
    dd_symbol.AcceptInput = true;
    dd_symbol.Title = "Code: ";
    dd_symbol.addItem({ Text: "000001", Value: "3,000001" });
    dd_symbol.addItem({ Text: "000002", Value: "6,000002" });
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
      Dialog.popup(this, tradeContent, { title: "Trade" });
    };
    let bookViewContent = new ComboControl("col");
    bookViewContent.addChild(bookviewHeader);
    bookViewContent.addChild(this.bookViewTable);
    this.bookviewPage.setContent(bookViewContent);

    this.logPage = new TabPage("LOG", "LOG");
    this.pageObj["LOG"] = this.logPage;
    let logContent = new ComboControl("col");
    this.logTable = new DataTable("table2");
    this.logTable.addColumn("Time", "Content");
    logContent.addChild(this.logTable);
    this.logPage.setContent(logContent);

    this.statarbPage = new TabPage("StatArb", "StatArb");
    this.pageObj["StatArb"] = this.statarbPage;
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
    this.statarbTable.columnConfigurable = true;
    let statarbContent = new ComboControl("col");
    statarbContent.addChild(statarbHeader);
    statarbContent.addChild(this.statarbTable);
    this.statarbPage.setContent(statarbContent);

    this.portfolioPage = new TabPage("Portfolio", "Portfolio");
    this.pageObj["Portfolio"] = this.portfolioPage;
    let loadItem = new ComboControl("row");

    this.portfolioAccLabel = new MetaControl("textbox");
    this.portfolioAccLabel.Left = statarbLeftAlign;
    this.portfolioAccLabel.Width = 100;
    this.portfolioAccLabel.Title = "Account: ";
    this.portfolioAccLabel.Disable = true;

    this.portfolioLabel = new MetaControl("textbox");
    this.portfolioLabel.Width = 60;
    this.portfolioLabel.Title = "PORTFOLIO Value:";
    this.portfolioLabel.Left = 20;
    this.portfolioLabel.Disable = true;

    this.portfolioDaypnl = new MetaControl("textbox");
    this.portfolioDaypnl.Width = 60;
    this.portfolioDaypnl.Title = "PORTFOLIO Day pnl:";
    this.portfolioDaypnl.Left = 20;
    this.portfolioDaypnl.Disable = true;

    this.portfolioonpnl = new MetaControl("textbox");
    this.portfolioonpnl.Width = 60;
    this.portfolioonpnl.Title = "PORTFOLIO O/N Pnl:";
    this.portfolioonpnl.Left = 20;
    this.portfolioonpnl.Disable = true;

    this.portfolioCount = new MetaControl("textbox");
    this.portfolioCount.Width = 50;
    this.portfolioCount.Title = "Count:";
    this.portfolioCount.Left = 20;
    this.portfolioCount.Disable = true;

    let btn_load = new MetaControl("button");
    btn_load.Text = " Load    CSV ";
    btn_load.Left = 20;
    btn_load.Class = "primary";

    loadItem.addChild(this.portfolioAccLabel).addChild(this.portfolioLabel)
      .addChild(this.portfolioDaypnl).addChild(this.portfolioonpnl).addChild(this.portfolioCount).addChild(btn_load);

    let tradeitem = new ComboControl("row");
    this.portfolioBuyCom = new DropDown();
    this.portfolioBuyCom.Width = 59;
    this.portfolioBuyCom.Left = 20;
    this.portfolioBuyCom.Title = "Buy: ";
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
    this.portfolioSellCom.Title = "Sell:";
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

    this.allChk = new MetaControl("checkbox"); this.allChk.Width = 30; this.allChk.Title = " All"; this.allChk.Text = false; this.allChk.Left = 22;
    let allbuyChk = new MetaControl("checkbox"); allbuyChk.Width = 30; allbuyChk.Title = " All-Buy"; allbuyChk.Text = false; allbuyChk.Left = 20;
    let allsellChk = new MetaControl("checkbox"); allsellChk.Width = 30; allsellChk.Title = " All-Sell"; allsellChk.Text = false; allsellChk.Left = 20;

    this.range = new URange(); this.range.Width = 168; this.range.Left = 20; this.range.Title = "Order Rate:";
    this.rateText = new MetaControl("textbox"); this.rateText.Width = 35; this.rateText.Title = ""; this.rateText.Left = 5;
    let percentText = new MetaControl("plaintext"); percentText.Title = "%"; percentText.Width = 15;

    this.range.Text = 0; this.rateText.Text = 0;

    let btn_sendSel = new MetaControl("button"); btn_sendSel.Text = "Send Selected"; btn_sendSel.Left = 20; btn_sendSel.Class = "primary";
    let btn_cancelSel = new MetaControl("button"); btn_cancelSel.Text = "Cancel Selected"; btn_cancelSel.Left = 20; btn_cancelSel.Class = "primary";

    tradeitem.addChild(this.portfolioBuyCom).addChild(this.portfolioBUyOffset).addChild(this.portfolioSellCom).addChild(this.portfolioSellOffset).addChild(this.allChk).addChild(allbuyChk)
      .addChild(allsellChk).addChild(this.range).addChild(this.rateText).addChild(percentText).addChild(btn_sendSel).addChild(btn_cancelSel);

    this.portfolioTable = new DataTable("table2");
    this.portfolioTable.addColumn("Symbol", "Name", "PreQty", "TargetQty", "CurrQty", "TotalOrderQty", "FilledQty", "FillPace",
      "WorkingQty", "SingleOrderQty", "Send", "Cancel", "Status", "PrePrice", "LastPrice", "BidSize", "BidPrice", "AskSize",
      "AskPrice", "AvgBuyPrice", "AvgSellPirce", "PreValue", "CurrValue", "Day Pnl", "O/N Pnl");
    this.portfolioTable.columnConfigurable = true;
    this.portfolioTable.OnCellClick = (cellItem, cellIndex, rowIndex) => {
      let ukey = AppComponent.self.portfolioTable.rows[rowIndex].cells[0].Data.ukey;
      let account = AppComponent.self.portfolioAccLabel.Text;
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
        ManulTrader.singleBuy(account, askPriceLevel, bidPriceLevel, askOffset, bidOffset, ukey, qty);
      } else if (cellIndex === 11) {
        ManulTrader.singleCancel(account, ukey);
      }
    };

    btn_load.OnClick = () => {
      let readself = this;
      let account: number = 666600000040;
      ManulTrader.registerAccPos(account);
      MessageBox.openFileDialog("Select CSV", function (filenames) {
        console.log(filenames);
        if (filenames !== undefined)
          fs.readFile(filenames[0], function (err, content) {
            if (err === null) {
              readself.portfolioCount.Text = "0";
              readself.allChk.Text = false;
              // judege by future or security and whether security == 0;
              let codeStr = content.toString();
              let splitStr = codeStr.split("\n");
              let initPos = [];
              splitStr.forEach(function (item) {
                let arr = item.split(",");
                if (arr.length === 2 && arr[0]) {
                  let obj = ManulTrader.getSecuinfoByCode(1, arr[0] + "");
                  let rtnObj = AppComponent.self.traverseobj(obj, arr[0]);
                  if (rtnObj) {
                    let sendObj = { currPos: 0, ukey: 0, targetPos: 0 };
                    sendObj.currPos = 0;
                    sendObj.ukey = rtnObj.InnerCode;
                    sendObj.targetPos = arr[1];
                    initPos.push(sendObj);
                  }
                }
              });
              ManulTrader.submitBasket(5001, 8016930, 300, account, initPos);
            }
            else
              console.log(err);
          });
      }, [{ name: "CSV", extensions: ["csv"] }]);
    };

    this.allChk.OnClick = () => {
      let bcheck = AppComponent.self.allChk.Text;
      AppComponent.self.returnSelArr(0, bcheck);
    };
    allbuyChk.OnClick = () => {
      let bcheck = allbuyChk.Text;
      AppComponent.self.returnSelArr(1, bcheck);
    };
    allsellChk.OnClick = () => {
      let bcheck = allsellChk.Text;
      AppComponent.self.returnSelArr(2, bcheck);
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
      let selArrLen = AppComponent.self.selectArr.length;
      if (selArrLen === 0)
        return;
      let askPriceLevel = AppComponent.self.portfolioBuyCom.SelectedItem.Value;
      let bidPriceLevel = AppComponent.self.portfolioSellCom.SelectedItem.Value;
      let askOffset = AppComponent.self.portfolioBUyOffset.SelectedItem.Value;
      let bidOffset = AppComponent.self.portfolioSellOffset.SelectedItem.Value;
      console.log(askPriceLevel, bidPriceLevel, askOffset, bidOffset);
      let sendArr = [];
      // find qty by ukey
      for (let j = 0; j < selArrLen; ++j) {
        let tempUkey = AppComponent.self.selectArr[j];
        for (let i = 0; i < AppComponent.self.portfolioTable.rows.length; ++i) {
          let getukey = AppComponent.self.portfolioTable.rows[i].cells[0].Data.ukey;
          if (getukey === tempUkey) {
            let obj = { ukey: 0, qty: 0 };
            let getQty = AppComponent.self.portfolioTable.rows[i].cells[9].Text;
            let rtn = AppComponent.self.TestingInput(getQty + "");
            if (!rtn) {
              let msg = AppComponent.self.portfolioTable.rows[i].cells[0].Title + " singleOrderQty input illegal!";
              MessageBox.show("warning", "Input Error!", msg);
              return;
            }
            let qty = parseInt(getQty);
            obj.ukey = getukey; obj.qty = qty;
            sendArr.push(obj);
          }
        }
      }
      ManulTrader.sendAllSel(AppComponent.self.portfolioAccLabel.Text, sendArr.length, askPriceLevel,
        bidPriceLevel, askOffset, bidOffset, sendArr);
    };
    btn_cancelSel.OnClick = () => { // 5005
      let selArrLen = AppComponent.self.selectArr.length;
      if (selArrLen === 0)
        return;
      ManulTrader.cancelAllSel(AppComponent.self.portfolioAccLabel.Text, selArrLen, AppComponent.self.selectArr);
    };
    let portfolioContent = new ComboControl("col");
    portfolioContent.addChild(loadItem).addChild(tradeitem).addChild(this.portfolioTable);
    this.portfolioPage.setContent(portfolioContent);

    this.strategyPage = new TabPage("StrategyMonitor", "StrategyMonitor");
    this.pageObj["StrategyMonitor"] = this.strategyPage;

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
    this.pageObj["Profit"] = this.profitPage;
    let profitleftAlign = 20;
    let profitHeader = new ComboControl("row");
    this.totalpnLabel = new MetaControl("textbox");
    this.totalpnLabel.Left = profitleftAlign;
    this.totalpnLabel.Width = 85;
    this.totalpnLabel.Title = "TOTALPNL: ";
    this.totalpnLabel.Disable = true;
    this.pospnlLabel = new MetaControl("textbox");
    this.pospnlLabel.Left = profitleftAlign;
    this.pospnlLabel.Width = 85;
    this.pospnlLabel.Title = "POSPNL: ";
    this.pospnlLabel.Disable = true;
    this.trapnlt = new MetaControl("textbox");
    this.trapnlt.Left = profitleftAlign;
    this.trapnlt.Width = 85;
    this.trapnlt.Title = "TRAPNL.T: ";
    this.trapnlt.Disable = true;
    this.pospnlt = new MetaControl("textbox");
    this.pospnlt.Left = profitleftAlign;
    this.pospnlt.Width = 85;
    this.pospnlt.Title = "POSPNL.T: ";
    this.pospnlt.Disable = true;
    this.totalpnlt = new MetaControl("textbox");
    this.totalpnlt.Left = profitleftAlign;
    this.totalpnlt.Width = 85;
    this.totalpnlt.Title = "TOTALPNL.T: ";
    this.totalpnlt.Disable = true;
    let reqbtn = new MetaControl("button");
    reqbtn.Left = profitleftAlign;
    reqbtn.Width = 30;
    reqbtn.Text = "Req";
    profitHeader.addChild(this.totalpnLabel).addChild(this.pospnlLabel).addChild(this.trapnlt).addChild(this.pospnlt).addChild(this.totalpnlt).addChild(reqbtn);
    this.profitTable = new DataTable("table2");
    this.profitTable.addColumn("U-Key", "Code", "Account", "Strategy", "AvgPrice(B)", "AvgPirce(S)",
      "PositionPnl", "TradingPnl", "IntraTradingFee", "TotalTradingFee", "LastTradingFee", "LastPosPnl",
      "TodayPosPnl", "TotalPnl", "LastPosition", "TodayPosition", "LastClose", "MarketPirce", "IOPV");
    this.profitTable.columnConfigurable = true;
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
    this.strategyTable.OnCellClick = (cellItem, cellIdx, rowIdx) => {
      // console.log(cellItem, cellIdx, rowIdx);
      AppComponent.self.strategyOnCellClick(cellItem, cellIdx, rowIdx);
    };
    this.psInstance.setEndpoint(this.option.feedhandler.port, this.option.feedhandler.host);
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
        AppComponent.self.bookViewTable.detectChanges();
      }
    });
    let defaultLayout = { "type": "v", "width": 1845, "children": [{ "type": "h", "height": 281, "modules": ["Position", "Account", "OrderStatus", "DoneOrders"] }, { "type": "h", "height": 368, "children": [{ "type": "v", "width": 355, "modules": ["BookView"] }, { "type": "v", "width": 1485, "modules": ["LOG", "StatArb", "Portfolio"] }] }, { "type": "h", "height": 343, "modules": ["StrategyMonitor", "Profit"] }] };
    let layout: any = File.parseJSON(Environment.appDataDir + "/ChronosApps/DockDemo/layout.json");
    let children = layout ? layout.children : defaultLayout.children;
    let childrenLen = children.length;
    for (let i = 0; i < childrenLen - 1; ++i) {  // traverse
      this.children.push(this.traversefunc(children[i]));
      this.children.push(new Splitter("h"));
    }

    this.children.push(this.traversefunc(children[childrenLen - 1]));
    this.init(this.option.port, this.option.host);
  }

  init(port: number, host: string) {
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
    ManulTrader.addSlot(5022, this.showComorderstatusAndErrorInfo);
    ManulTrader.addSlot(2021, this.showComorderstatusAndErrorInfo);
    ManulTrader.addSlot(2022, this.showComOrderRecord);
    ManulTrader.addSlot(3011, this.showComOrderRecord);
    ManulTrader.addSlot(3510, this.showComOrderRecord);
    ManulTrader.addSlot(2040, this.showLog);
    ManulTrader.addSlot(5021, this.showBasketBackInfo);
    ManulTrader.addSlot(5024, this.showPortfolioSummary);

    ManulTrader.init(port, host);
  }


  traversefunc(obj) {
    let dock = new DockContainer(obj.type, obj.width, obj.height);
    if (obj.children && obj.children.length > 0) {
      obj.children.forEach((child, index) => {
        dock.addChild(AppComponent.self.traversefunc(child));
        if (index < obj.children.length - 1)
          dock.addChild(new Splitter(child.type));
      });
    } else if (obj.modules && obj.modules.length > 0) {
      let panel = new TabPanel();
      obj.modules.forEach(page => {
        // console.log(AppComponent.self.pageObj[page]);
        panel.addTab(AppComponent.self.pageObj[page]);
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
    let type = data[0].type;
    let time = AppComponent.self.getCurrentTime();
    let row = AppComponent.self.logTable.newRow();
    row.cells[0].Text = time;
    row.cells[1].Text = data[0].logStr;
    AppComponent.self.logTable.detectChanges();
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
    AppComponent.self.logTable.detectChanges();
  }
  showStrategyInfo(data: any) {
    // console.log("alarm info,pass", data);
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
      AppComponent.self.logTable.detectChanges();
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
    // in manultrader frame ,set strategy id in
    let dd_strategy_len = AppComponent.self.dd_Strategy.Items.length;
    AppComponent.self.dd_Strategy.addItem({ Text: obj.key + "", Value: dd_strategy_len + "" });
    // ---------------------------
    AppComponent.self.strategyTable.detectChanges();
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
    // console.log("showComOrderRecord", data);
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
    Sound.play(0);
    let row = this.doneOrdersTable.newRow();
    row.cells[0].Text = obj.od.innercode;
    let codeInfo = ManulTrader.getSecuinfoByukey(2, obj.od.innercode);
    let tempObj = AppComponent.self.traverseukeyObj(codeInfo, obj.od.innercode);
    if (codeInfo) {
      if (tempObj) {
        row.cells[1].Text = (tempObj.SecuCode + "").split(".")[0];
        row.cells[14].Text = tempObj.SecuAbbr;
      }
    } else {
      row.cells[1].Text = "";
      row.cells[14].Text = "";
    }
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

    AppComponent.self.doneOrdersTable.detectChanges();
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
    AppComponent.self.doneOrdersTable.detectChanges();
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
    let codeInfo = ManulTrader.getSecuinfoByukey(2, obj.od.innercode);
    let tempObj = AppComponent.self.traverseukeyObj(codeInfo, obj.od.innercode);
    if (codeInfo) {
      if (tempObj) {
        row.cells[1].Text = (tempObj.SecuCode + "").split(".")[0];
      }
    }
    else
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
    AppComponent.self.orderstatusTable.detectChanges();
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
    AppComponent.self.orderstatusTable.detectChanges();
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
    let codeInfo = ManulTrader.getSecuinfoByukey(2, obj.record.code);
    if (codeInfo) {
      let tempObj = AppComponent.self.traverseukeyObj(codeInfo, obj.record.code);
      if (tempObj)
        row.cells[3].Text = (tempObj.SecuCode + "").split(".")[0];
    }
    else
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
    AppComponent.self.PositionTable.detectChanges();
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
    AppComponent.self.PositionTable.detectChanges();
  }
  refreshEquitPosInfo(obj: any, idx: number) {
    AppComponent.self.PositionTable.rows[idx].cells[4].Text = obj.record.TotalVol;
    AppComponent.self.PositionTable.rows[idx].cells[5].Text = obj.record.AvlVol;
    AppComponent.self.PositionTable.rows[idx].cells[6].Text = obj.record.AvlCreRedempVol;
    AppComponent.self.PositionTable.rows[idx].cells[7].Text = obj.record.WorkingVol;
    AppComponent.self.PositionTable.rows[idx].cells[8].Text = obj.record.TotalCost;
    AppComponent.self.PositionTable.detectChanges();
  }
  refreshFuturePosInfo(obj: any, idx: number) {
    AppComponent.self.PositionTable.rows[idx].cells[4].Text = obj.record.TotalVol;
    AppComponent.self.PositionTable.rows[idx].cells[5].Text = obj.record.AvlVol;
    AppComponent.self.PositionTable.rows[idx].cells[7].Text = obj.record.WorkingVol;
    AppComponent.self.PositionTable.rows[idx].cells[8].Text = obj.record.TotalCost;
    AppComponent.self.PositionTable.rows[idx].cells[9].Text = obj.record.TodayOpen;
    AppComponent.self.PositionTable.rows[idx].cells[10].Text = obj.record.AveragePrice;
    AppComponent.self.PositionTable.detectChanges();
  }
  showComGWNetGuiInfo(data: any) {
    // console.log("+++++++++++", data);
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
    let name = data.name;
    let tempmark = new StatusBarItem(name);
    tempmark.section = "right";
    tempmark.color = data.connected ? "green" : "red";
    tempmark.width = 50;
    AppComponent.self.statusbar.items.push(tempmark);
    let row = AppComponent.self.logTable.newRow();
    row.cells[0].Text = AppComponent.self.getCurrentTime();
    row.cells[1].Text = name + " " + (data.connected ? "Connected" : "Disconnected");
    AppComponent.self.ref.detectChanges();
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
    AppComponent.self.profitTable.detectChanges();
  }
  showComProfitInfo(data: any) {
    // console.log("**************", data);
    for (let i = 0; i < data.length; ++i) {
      let profitTableRows: number = AppComponent.self.profitTable.rows.length;
      let profitUkey: number = data[i].innercode;
      let strategyid = data[i].strategyid;
      let row = AppComponent.self.findRowByStrategyId(strategyid);
      let totalpnl = Math.fround(data[i].totalpositionpnl / 10000 / 1000).toFixed(0) + "";
      let tradingpnl = Math.fround(data[i].totaltradingpnl / 10000 / 1000).toFixed(0) + "";
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
    let codeInfo = ManulTrader.getSecuinfoByukey(2, obj.innercode);
    if (codeInfo) {
      let tempObj = AppComponent.self.traverseukeyObj(codeInfo, obj.innercode);
      if (tempObj)
        row.cells[1].Text = (tempObj.SecuCode + "").split(".")[0];
    }
    else
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

    AppComponent.self.profitTable.detectChanges();
  }

  showComAccountPos(data: any) {
    // console.log("***********", data);
    for (let i = 0; i < data.length; ++i) {
      let accTableRows: number = AppComponent.self.accountTable.rows.length;
      let accData: number = data[i].record.account;
      // -------in manultrader frame,set account info
      let checkFlag: boolean = true;
      let dd_account_len = AppComponent.self.dd_Account.Items.length;
      for (let idx = 0; idx < dd_account_len; ++idx) {
        let gettext = AppComponent.self.dd_Account.Items[idx].Text;
        if (accData + "" === gettext)
          checkFlag = false;
      }
      if (checkFlag) {
        AppComponent.self.dd_Account.addItem({ Text: accData + "", Value: dd_account_len + "" });
      }
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
    AppComponent.self.accountTable.detectChanges();

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
    // AppComponent.self.ref.detectChanges();
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
    // AppComponent.self.ref.detectChanges();
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
    // AppComponent.self.ref.detectChanges();
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
    // AppComponent.self.ref.detectChanges();
  }
  showStrategyCfg(data: any) {
    //  console.log("333333333333", data);
    if (AppComponent.self.strategyTable.rows.length === 0)   // table without strategy item
      return;
    let addSubCOmFlag: boolean = false;
    for (let i = 0; i < data.length; ++i) {
      let level = data[i].level;
      let type = data[i].type;
      let strategyId = data[i].strategyid;
      let name = data[i].name;
      // check submit and comment
      for (let i = 0; i < AppComponent.self.strategyTable.rows.length; ++i) {   // find row in strategy table
        let getId = AppComponent.self.strategyTable.rows[i].cells[0].Text;
        let findFlag: boolean = true;
        for (let j = 0; j < AppComponent.self.strategyTable.rows[i].cells.length; ++j) {
          let checkText = AppComponent.self.strategyTable.rows[i].cells[j].Text;
          if (checkText === "submit") {
            findFlag = false;
            continue;
          }
        }
        if (getId === strategyId && findFlag) {
          AppComponent.self.strategyTable.insertColumn("Submit", AppComponent.self.commandIdx);
          AppComponent.self.strategyTable.rows[i].cells[AppComponent.self.commandIdx].Type = "button";
          AppComponent.self.strategyTable.rows[i].cells[AppComponent.self.commandIdx].Text = "submit";
          AppComponent.self.strategyTable.rows[i].cells[AppComponent.self.commandIdx].Class = "primary";
          AppComponent.self.strategyTable.insertColumn("Comment", AppComponent.self.parameterIdx);
          AppComponent.self.strategyTable.rows[i].cells[AppComponent.self.parameterIdx].Type = "button";
          AppComponent.self.strategyTable.rows[i].cells[AppComponent.self.parameterIdx].Text = "comment";
          AppComponent.self.strategyTable.rows[i].cells[AppComponent.self.parameterIdx].Class = "primary";
          addSubCOmFlag = true;
          break;
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
    AppComponent.self.strategyTable.detectChanges();

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

    for (let j = preIdx; j <= rearIdx; ++j) {
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
    // AppComponent.self.ref.detectChanges();
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
    // AppComponent.self.ref.detectChanges();
  }

  controlBtnClick(idx: number) {
    let len = AppComponent.self.strategyTable.rows.length;
    for (let i = 0; i < len; ++i) {
      let strategyid = AppComponent.self.strategyTable.rows[i].cells[0].Text;
      if (idx === 0) {
        AppComponent.self.operateSteategy(strategyid, 3, i, 0);
      } else if (idx === 1) {
        AppComponent.self.operateSteategy(strategyid, 4, i, 1);
      } else if (idx === 2) {
        AppComponent.self.operateSteategy(strategyid, 5, i, 2);
      } else if (idx === 3) {
        AppComponent.self.operateSteategy(strategyid, 6, i, 3);
      }
    }
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
      let strategyId: number = AppComponent.self.strategyTable.rows[rowIdx].cells[0].Text;
      if (data.dataSource.text === "start") {
        AppComponent.self.operateSteategy(strategyId, cellIdx, rowIdx, 0);
      } else if (data.dataSource.text === "pause") {
        AppComponent.self.operateSteategy(strategyId, cellIdx, rowIdx, 1);
      } else if (data.dataSource.text === "stop") {
        AppComponent.self.operateSteategy(strategyId, cellIdx, rowIdx, 2);
      } else if (data.dataSource.text === "watch") {
        AppComponent.self.operateSteategy(strategyId, cellIdx, rowIdx, 3);
      } else {
        let clickType = data.Data.type;
        let clickname = data.Data.name;
        let clicklevel = data.Data.level;
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
  }

  operateSteategy(strategyid: number, cellidx: number, rowIdx: number, tip: number) {
    AppComponent.self.showStraContrlDisable(tip, cellidx, rowIdx);
    ManulTrader.strategyControl(tip, strategyid);
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
    AppComponent.self.strategyTable.detectChanges();
  }

  showBasketBackInfo(data: any) {
    let account = data[0].account;
    AppComponent.self.portfolioAccLabel.Text = account;
    let count = data[0].count;
    AppComponent.self.portfolioCount.Text = count;
    let tableData = data[0].data;
    let dataLen = data[0].data.length;
    if (dataLen === 0) {
      // *****
    } else {
      for (let i = 0; i < dataLen; ++i) {
        let portfolioRows = AppComponent.self.portfolioTable.rows.length;
        let ukey = tableData[i].UKey;
        if (portfolioRows === 0) {
          AppComponent.self.addPortfolioTableInfo(tableData[i], dataLen, i);
        } else {
          let checkFlag: boolean = false;
          for (let j = 0; j < portfolioRows; ++j) {
            let getUkey = AppComponent.self.portfolioTable.rows[j].cells[0].Data.ukey;
            if (getUkey === ukey) {
              checkFlag = true;
              AppComponent.self.refreshPortfolioTable(j, tableData[i]);
              break;
            }
          }
          if (!checkFlag) {
            AppComponent.self.addPortfolioTableInfo(tableData[i], dataLen, i);
          }
          checkFlag = false;
        }

      }
      //  AppComponent.self.portfolioTable.detectChanges();
    }
  }

  addPortfolioTableInfo(tableData: any, len: number, idx: number) {
    let row = AppComponent.self.portfolioTable.newRow();
    let ukey = tableData.UKey;
    let codeInfo = ManulTrader.getSecuinfoByukey(2, ukey);
    if (codeInfo) {
      let tempObj = AppComponent.self.traverseukeyObj(codeInfo, ukey);
      let symbol = ""; let abbr = "";
      if (tempObj) {
        // symbol = (tempObj.SecuCode + "").split(".")[0];
        symbol = (tempObj.SecuCode + "").split(".")[0];
        abbr = tempObj.SecuAbbr;
      }
      row.cells[0].Type = "checkbox";
      row.cells[0].Title = symbol;
      row.cells[0].Data = { ukey: 0, chk: true };
      row.cells[0].Data.ukey = ukey;
      row.cells[1].Text = abbr;
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
      // 0 check value ,10,11 disable,12 value, row backcolor
      if (flag === 1) {
        row.cells[0].Disable = true;
        row.cells[0].Data.chk = true;
        row.cells[10].Disable = true;
        row.cells[11].Disable = true;
        row.cells[12].Text = "SUspended";
      } else if (flag === 2) {
        row.cells[0].Disable = true;
        row.cells[0].Data.chk = true;
        row.cells[10].Disable = true;
        row.cells[11].Disable = true;
        row.cells[12].Text = "Restrict";
      } else if (flag === 3) {
        row.cells[0].Disable = false;
        row.cells[0].Data.chk = false;
        row.cells[10].Disable = false;
        row.cells[11].Disable = false;
        row.cells[12].Text = "LimitUp";
      } else if (flag === 4) {
        row.cells[0].Disable = false;
        row.cells[0].Data.chk = false;
        row.cells[10].Disable = false;
        row.cells[11].Disable = false;
        row.cells[12].Text = "LimitDown";
      } else {
        row.cells[0].Disable = false;
        row.cells[0].Data.chk = false;
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
    AppComponent.self.showPortfolioTableCount();
  }

  refreshPortfolioTable(idx: number, tableData: any) {
    let ukey = tableData.UKey;
    AppComponent.self.portfolioTable.rows[idx].cells[2].Text = tableData.InitPos;
    AppComponent.self.portfolioTable.rows[idx].cells[3].Text = tableData.TgtPos;
    AppComponent.self.portfolioTable.rows[idx].cells[4].Text = tableData.CurrPos;
    AppComponent.self.portfolioTable.rows[idx].cells[5].Text = tableData.Diff;
    AppComponent.self.portfolioTable.rows[idx].cells[6].Text = tableData.Traded;
    AppComponent.self.portfolioTable.rows[idx].cells[7].Text = tableData.Percentage / 100 + "%";
    AppComponent.self.portfolioTable.rows[idx].cells[8].Text = tableData.WorkingVol;
    let flag = tableData.Flag;
    // 0 check value ,10,11 disable,12 value, row backcolor
    if (flag === 1) {
      AppComponent.self.portfolioTable.rows[idx].cells[0].Disable = true;
      AppComponent.self.portfolioTable.rows[idx].cells[0].Data.chk = true;
      AppComponent.self.portfolioTable.rows[idx].cells[10].Disable = true;
      AppComponent.self.portfolioTable.rows[idx].cells[11].Disable = true;
      AppComponent.self.portfolioTable.rows[idx].cells[12].Text = "Suspended";
      AppComponent.self.portfolioTable.rows[idx].backgroundColor = "#424242";
    } else if (flag === 2) {
      AppComponent.self.portfolioTable.rows[idx].cells[0].Disable = true;
      AppComponent.self.portfolioTable.rows[idx].cells[0].Data.chk = true;
      AppComponent.self.portfolioTable.rows[idx].cells[10].Disable = true;
      AppComponent.self.portfolioTable.rows[idx].cells[11].Disable = true;
      AppComponent.self.portfolioTable.rows[idx].cells[12].Text = "Restrict";
      AppComponent.self.portfolioTable.rows[idx].backgroundColor = "#424242";
    } else if (flag === 3) {
      AppComponent.self.portfolioTable.rows[idx].cells[0].Disable = false;
      AppComponent.self.portfolioTable.rows[idx].cells[0].Data.chk = false;
      AppComponent.self.portfolioTable.rows[idx].cells[10].Disable = false;
      AppComponent.self.portfolioTable.rows[idx].cells[11].Disable = false;
      AppComponent.self.portfolioTable.rows[idx].cells[12].Text = "LimitUp";
      AppComponent.self.portfolioTable.rows[idx].backgroundColor = "#00FF00";
    } else if (flag === 4) {
      AppComponent.self.portfolioTable.rows[idx].cells[0].Disable = false;
      AppComponent.self.portfolioTable.rows[idx].cells[0].Data.chk = false;
      AppComponent.self.portfolioTable.rows[idx].cells[10].Disable = false;
      AppComponent.self.portfolioTable.rows[idx].cells[11].Disable = false;
      AppComponent.self.portfolioTable.rows[idx].cells[12].Text = "LimitDown";
      AppComponent.self.portfolioTable.rows[idx].backgroundColor = "#FF0000";
    } else {
      AppComponent.self.portfolioTable.rows[idx].cells[0].Disable = false;
      AppComponent.self.portfolioTable.rows[idx].cells[0].Data.chk = false;
      AppComponent.self.portfolioTable.rows[idx].cells[10].Disable = false;
      AppComponent.self.portfolioTable.rows[idx].cells[11].Disable = false;
      AppComponent.self.portfolioTable.rows[idx].cells[12].Text = "Normal";
      AppComponent.self.portfolioTable.rows[idx].backgroundColor = null;
    }
    AppComponent.self.portfolioTable.rows[idx].cells[13].Text = tableData.PreClose / 10000;
    AppComponent.self.portfolioTable.rows[idx].cells[14].Text = tableData.LastPrice / 10000;
    AppComponent.self.portfolioTable.rows[idx].cells[15].Text = tableData.BidSize;
    AppComponent.self.portfolioTable.rows[idx].cells[16].Text = tableData.BidPrice / 10000;
    AppComponent.self.portfolioTable.rows[idx].cells[17].Text = tableData.AskSize;
    AppComponent.self.portfolioTable.rows[idx].cells[18].Text = tableData.AskPrice / 10000;
    AppComponent.self.portfolioTable.rows[idx].cells[19].Text = tableData.AvgBuyPrice / 10000;
    AppComponent.self.portfolioTable.rows[idx].cells[20].Text = tableData.AvgSellPrice / 10000;
    AppComponent.self.portfolioTable.rows[idx].cells[21].Text = tableData.PreValue / 10000;
    AppComponent.self.portfolioTable.rows[idx].cells[22].Text = tableData.ValueCon / 10000;
    AppComponent.self.portfolioTable.rows[idx].cells[23].Text = tableData.DayPnLCon / 10000;
    AppComponent.self.portfolioTable.rows[idx].cells[24].Text = tableData.ONPnLCon / 10000;
    AppComponent.self.showPortfolioTableCount();
  }
  showPortfolioTableCount() {
    let count = AppComponent.self.portfolioTable.rows.length;
    AppComponent.self.portfolioCount.Text = count;
  }
  showPortfolioSummary(data: any) {
    AppComponent.self.portfolioLabel.Text = data[0].value / 10000;
    AppComponent.self.portfolioDaypnl.Text = data[0].dayPnl / 10000;
    AppComponent.self.portfolioonpnl.Text = data[0].onPnl / 10000;
  }
  traverseobj(obj: any, data: any) {
    for (let o in obj) {
      if ((o + "") === data) {
        return obj[o];
      }
    }
    return {};
  }

  traverseukeyObj(obj: any, data: any) {
    for (let o in obj) {
      if (parseInt(o) === parseInt(data)) {
        return obj[o];
      }
    }
    return {};
  }


  returnSelArr(data: any, check: any) {    // check if opposite
    let type = data;
    let len = AppComponent.self.portfolioTable.rows.length;
    AppComponent.self.selectArr.splice(0, AppComponent.self.selectArr.length);

    for (let i = 0; i < len; ++i) {
      if (type === 0) {
        if (!AppComponent.self.portfolioTable.rows[i].cells[0].Data.chk) {
          AppComponent.self.portfolioTable.rows[i].cells[0].Text = !check;
          if (!check) {
            AppComponent.self.selectArr.push(AppComponent.self.portfolioTable.rows[i].cells[0].Data.ukey);
          }
        } else {
          AppComponent.self.portfolioTable.rows[i].cells[0].Text = false;
        }
      }

      if (type === 1) {
        if (!AppComponent.self.portfolioTable.rows[i].cells[0].Data.chk) {
          if (AppComponent.self.portfolioTable.rows[i].cells[3].Text > 0) {
            if (!check) {
              AppComponent.self.portfolioTable.rows[i].cells[0].Text = !check;
              AppComponent.self.selectArr.push(AppComponent.self.portfolioTable.rows[i].cells[0].Data.ukey);
            } else {
              AppComponent.self.portfolioTable.rows[i].cells[0].Text = false;
            }
          }
        } else {
          AppComponent.self.portfolioTable.rows[i].cells[0].Text = false;
        }
      }

      if (type === 2) {
        if (!AppComponent.self.portfolioTable.rows[i].cells[0].Data.chk) {
          if (AppComponent.self.portfolioTable.rows[i].cells[3].Text < 0) {
            if (!check) {
              AppComponent.self.portfolioTable.rows[i].cells[0].Text = !check;
              AppComponent.self.selectArr.push(AppComponent.self.portfolioTable.rows[i].cells[0].Data.ukey);
            } else {
              AppComponent.self.portfolioTable.rows[i].cells[0].Text = false;
            }
          }
        } else {
          AppComponent.self.portfolioTable.rows[i].cells[0].Text = false;
        }
      }
    }
  }

  onDestroy() {
    File.writeSync(Environment.appDataDir + "/ChronosApps/DockDemo/layout.json", window.getLayout());
  }
}


