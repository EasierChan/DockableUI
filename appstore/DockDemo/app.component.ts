/**
 * created by cl, 2017/02/28
 * update: [date]
 * desc:
 */

import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from "@angular/core";
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
export class AppComponent implements OnInit, AfterViewInit {
  // className: string = "dock-container vertical";
  // children: Control[] = [];
  private main: DockContainer;
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

  private txt_UKey: any;
  private txt_Symbol: any;
  private txt_Price: any;
  private dd_Action: any;
  private tradeContent: any;
  // strategy index flag
  private commentIdx: number = 10;
  private commandIdx: number = 10;
  private parameterIdx: number = 11;
  private strategyStatus: number = 0;
  private languageType: number = 0;
  private filename: String = "";
  private selectArr = [];
  private OrderStatusSelArr = [];

  private statusbar: StatusBar;
  private option: any;
  private layout: any;

  static bookViewSN = 1;
  static spreadViewSN = 1;

  constructor(private psInstance: PriceService, private ref: ChangeDetectorRef, private statechecker: AppStateCheckerRef) {
    AppComponent.self = this;
    this.statechecker.onInit(this, this.onReady);
    this.statechecker.onResize(this, this.onResize);
    this.statechecker.onDestory(this, this.onDestroy);
    this.statechecker.onMenuItemClick = this.onMenuItemClick;
    TabPanel.afterAnyPageClosed = this.onTabPageClosed;
  }

  onTabPageClosed(pageid: string) {
    AppComponent.self.statechecker.changeMenuItemState(pageid, false, 2);
  }

  onMenuItemClick(item) {
    let label = item.label as string;
    if (label.endsWith("New BookView")) {
      let newBVID = "BookView" + AppComponent.bookViewSN++;
      // AppComponent.self.statechecker.addMenuItem(0, newBVID);
      return;
    }

    if (label.endsWith("New SpreadView")) {
      let newSVID = "SpreadView" + AppComponent.spreadViewSN++;
      // AppComponent.self.statechecker.addMenuItem(1, newSVID);
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

      if (AppComponent.self.pageObj.hasOwnProperty(item.label)) {
        panel.addTab(AppComponent.self.pageObj[item.label]);
        panel.setActive(item.label);
      }
    }
  }

  onReady(option: any) {
    // option.port and option.host and option.name ;
    this.option = option;
  }

  ngOnInit(): void {
    this.statusbar = new StatusBar();
    let order = "OrderStatus";
    this.orderstatusPage = new TabPage(order, ManulTrader.getTranslateInfo(this.languageType, order));
    this.pageObj["OrderStatus"] = this.orderstatusPage;
    let orderstatusContent = new ComboControl("col");

    let orderstatusHeader = new ComboControl("row");
    let cb_handle = new MetaControl("checkbox");
    cb_handle.Text = true;
    let handle = "Handle";
    let rtnHandle = ManulTrader.getTranslateInfo(this.languageType, handle);
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

    let cb_SelAll = new MetaControl("checkbox");
    cb_SelAll.Left = 10;
    cb_SelAll.Text = false;
    cb_SelAll.Title = ManulTrader.getTranslateInfo(this.languageType, "All");
    orderstatusHeader.addChild(cb_SelAll);
    cb_SelAll.OnClick = () => {
      for (let i = 0; i < this.orderstatusTable.rows.length; ++i) {
        if (!cb_SelAll.Text)
          this.orderstatusTable.rows[i].cells[0].Text = true;
        else
          this.orderstatusTable.rows[i].cells[0].Text = false;
      }
    };

    let btn_cancel = new MetaControl("button");
    btn_cancel.Left = 10;
    let cancel = "CancelSelected";
    let rtnCancel = ManulTrader.getTranslateInfo(this.languageType, cancel);
    btn_cancel.Text = rtnCancel;
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
        else {   // no test
          ManulTrader.cancelorder({
            ordertype: EOrderType.ORDER_TYPE_CANCEL,
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
              strategyid: parseInt(strategyid),
              algorid: 0,
              orderid: parseInt(orderid),
              algorindex: 0,
              innercode: parseInt(ukey),
              price: 0,
              quantity: 0,
              action: 1
            }
          });
        }
      }
    };

    this.orderstatusTable = new DataTable();
    let orderstatusArr: string[] = ["Check", "U-Key", "Symbol", "OrderId", "Time", "Strategy",
      "Ask/Bid", "Price", "OrderVol", "DoneVol", "Status", "Account"];
    let orderstatusTableRtnArr: string[] = [];
    let orderstatusTableTitleLen = orderstatusArr.length;
    for (let i = 0; i < orderstatusTableTitleLen; ++i) {
      let orderstatusRtn = ManulTrader.getTranslateInfo(this.languageType, orderstatusArr[i]);
      orderstatusTableRtnArr.push(orderstatusRtn);
    }
    orderstatusTableRtnArr.forEach(item => {
      this.orderstatusTable.addColumn(item);
    });
    this.orderstatusTable.columnConfigurable = true;
    orderstatusContent.addChild(this.orderstatusTable);
    this.orderstatusPage.setContent(orderstatusContent);

    this.orderstatusTable.OnCellClick = (cellItem, cellIndex, rowIndex) => {
      let ukey = AppComponent.self.orderstatusTable.rows[rowIndex].cells[0].Data.ukey;
      AppComponent.self.orderstatusTable.rows[rowIndex].cells[0].Text = !AppComponent.self.orderstatusTable.rows[rowIndex].cells[0].Text;
    };

    this.doneOrdersPage = new TabPage("DoneOrders", ManulTrader.getTranslateInfo(this.languageType, "DoneOrders"));
    this.pageObj["DoneOrders"] = this.doneOrdersPage;
    let doneOrdersContent = new ComboControl("col");
    this.doneOrdersTable = new DataTable("table");
    let doneorderTableArr: string[] = ["U-Key", "Symbol", "OrderId", "Strategy",
      "Ask/Bid", "Price", "DoneVol", "Status", "Time", "OrderVol", "OrderType", "Account", "OrderTime",
      "OrderPrice", "SymbolCode"];
    let doneOrderTableRtnArr: string[] = [];
    let doneOrderTableTittleLen = doneorderTableArr.length;
    for (let i = 0; i < doneOrderTableTittleLen; ++i) {
      let doneOrderRtn = ManulTrader.getTranslateInfo(this.languageType, doneorderTableArr[i]);
      doneOrderTableRtnArr.push(doneOrderRtn);
    }
    doneOrderTableRtnArr.forEach(item => {
      this.doneOrdersTable.addColumn(item);
    });
    this.doneOrdersTable.columnConfigurable = true;
    doneOrdersContent.addChild(this.doneOrdersTable);
    this.doneOrdersPage.setContent(doneOrdersContent);


    this.accountPage = new TabPage("Account", ManulTrader.getTranslateInfo(this.languageType, "Account"));
    this.pageObj["Account"] = this.accountPage;
    let accountContent = new ComboControl("col");
    this.accountTable = new DataTable("table");
    let accountTableArr: string[] = ["Account", "Secucategory", "TotalAmount", "AvlAmount", "FrzAmount", "Date", "Status",
      "ShangHai", "ShenZhen", "BuyFrzAmt", "SellFrzAmt", "Buymargin", "SellMargin", "TotalMargin", "Fee",
      "PositionPL", "ClosePL"];
    let accountTableRtnArr: string[] = [];
    let accountTableTittleLen = accountTableArr.length;
    for (let i = 0; i < accountTableTittleLen; ++i) {
      let accountRtn = ManulTrader.getTranslateInfo(this.languageType, accountTableArr[i]);
      accountTableRtnArr.push(accountRtn);
    }
    accountTableRtnArr.forEach(item => {
      this.accountTable.addColumn(item);
    });
    this.accountTable.columnConfigurable = true;
    accountContent.addChild(this.accountTable);
    this.accountPage.setContent(accountContent);

    this.PositionPage = new TabPage("Position", ManulTrader.getTranslateInfo(this.languageType, "Position"));
    this.pageObj["Position"] = this.PositionPage;
    let positionContent = new ComboControl("col");
    this.PositionTable = new DataTable("table2");
    let positionTableArr: string[] = ["Account", "secucategory", "U-Key", "Code", "TotalQty", "AvlQty", "AvlCreRedempVol", "WorkingQty",
      "TotalCost", "TodayOpen", "AvgPirce", "StrategyID", "Type"];
    let positionTableRtnArr: string[] = [];
    let positionTableTittleLen = positionTableArr.length;
    for (let i = 0; i < positionTableTittleLen; ++i) {
      let positionRtn = ManulTrader.getTranslateInfo(this.languageType, positionTableArr[i]);
      positionTableRtnArr.push(positionRtn);
    }
    positionTableRtnArr.forEach(item => {
      this.PositionTable.addColumn(item);
    });
    this.PositionTable.columnConfigurable = true;
    positionContent.addChild(this.PositionTable);
    this.PositionPage.setContent(positionContent);

    let leftAlign = 20;
    let rowSep = 5;
    this.tradePage = new TabPage("ManulTrader", ManulTrader.getTranslateInfo(this.languageType, "ManulTrader"));
    this.tradeContent = new ComboControl("col");
    this.tradeContent.MinHeight = 500;
    this.tradeContent.MinWidth = 500;
    this.dd_Account = new DropDown();
    this.dd_Account.Width = 120;
    let dd_accountRtn = ManulTrader.getTranslateInfo(this.languageType, "Account");
    this.dd_Account.Title = dd_accountRtn + ":   ";
    this.dd_Account.Left = leftAlign;
    this.dd_Account.Top = 20;
    this.tradeContent.addChild(this.dd_Account);
    this.dd_Strategy = new DropDown();
    this.dd_Strategy.Width = 120;
    this.dd_Strategy.Left = leftAlign;
    this.dd_Strategy.Top = rowSep;
    let dd_strategyRtn = ManulTrader.getTranslateInfo(this.languageType, "Strategy");
    this.dd_Strategy.Title = dd_strategyRtn + ":  ";
    this.tradeContent.addChild(this.dd_Strategy);
    this.txt_Symbol = new MetaControl("textbox");
    this.txt_Symbol.Left = leftAlign;
    this.txt_Symbol.Top = rowSep;
    let txt_symbolRtn = ManulTrader.getTranslateInfo(this.languageType, "Symbol");
    this.txt_Symbol.Title = txt_symbolRtn + ":    ";
    this.tradeContent.addChild(this.txt_Symbol);
    this.txt_UKey = new MetaControl("textbox");
    this.txt_UKey.Left = leftAlign;
    this.txt_UKey.Top = rowSep;
    let txt_UKeyRtn = ManulTrader.getTranslateInfo(this.languageType, "U-key");
    this.txt_UKey.Title = txt_UKeyRtn + ":     ";
    this.tradeContent.addChild(this.txt_UKey);
    this.txt_Price = new MetaControl("textbox");
    this.txt_Price.Left = leftAlign;
    this.txt_Price.Top = rowSep;
    let txt_PriceRtn = ManulTrader.getTranslateInfo(this.languageType, "Price");
    this.txt_Price.Title = txt_PriceRtn + ":     ";
    this.tradeContent.addChild(this.txt_Price);
    let txt_Volume = new MetaControl("textbox");
    txt_Volume.Left = leftAlign;
    txt_Volume.Top = rowSep;
    let txt_VolumeRtn = ManulTrader.getTranslateInfo(this.languageType, "Volume");
    txt_Volume.Title = txt_VolumeRtn + ":    ";
    this.tradeContent.addChild(txt_Volume);
    this.dd_Action = new DropDown();
    this.dd_Action.Left = leftAlign;
    this.dd_Action.Top = rowSep;
    let dd_ActionRtn = ManulTrader.getTranslateInfo(this.languageType, "Action");
    this.dd_Action.Title = dd_ActionRtn + ":    ";
    this.dd_Action.Width = 120;
    let buyRtn = ManulTrader.getTranslateInfo(this.languageType, "Buy");
    let sellRtn = ManulTrader.getTranslateInfo(this.languageType, "Sell");
    this.dd_Action.addItem({ Text: buyRtn, Value: "0" });
    this.dd_Action.addItem({ Text: sellRtn, Value: "1" });
    this.tradeContent.addChild(this.dd_Action);
    let btn_row = new ComboControl("row");
    let btn_clear = new MetaControl("button");
    btn_clear.Left = leftAlign;
    let clearRtn = ManulTrader.getTranslateInfo(this.languageType, "Clear");
    btn_clear.Text = clearRtn;
    btn_row.addChild(btn_clear);
    let btn_submit = new MetaControl("button");
    btn_submit.Left = 30;
    let SubmitRtn = ManulTrader.getTranslateInfo(this.languageType, "Submit");
    btn_submit.Text = SubmitRtn;
    btn_clear.Class = btn_submit.Class = "primary";
    btn_row.addChild(btn_submit);
    this.tradeContent.addChild(btn_row);
    this.tradePage.setContent(this.tradeContent);

    btn_submit.OnClick = () => {
      let account = this.dd_Account.SelectedItem.Text;
      let getstrategy = this.dd_Strategy.SelectedItem.Text;
      let symbol = this.txt_Symbol.Text;
      let ukey = this.txt_UKey.Text;
      let price = this.txt_Price.Text;
      let volume = txt_Volume.Text;
      let actionValue = this.dd_Action.SelectedItem.Value;

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
          action: (actionValue === 1) ? 1 : 0,
          property: 0,
          currency: 0,
          covered: 0,
          signal: [{ id: 0, value: 0 }, { id: 0, value: 0 }, { id: 0, value: 0 }, { id: 0, value: 0 }]
        }
      });
    };

    this.bookviewPage = new TabPage("BookView", ManulTrader.getTranslateInfo(this.languageType, "BookView"));
    this.pageObj["BookView"] = this.bookviewPage;

    let bookviewHeader = new ComboControl("row");
    let dd_symbol = new DropDown();
    dd_symbol.AcceptInput = true;
    let codeRtn = ManulTrader.getTranslateInfo(this.languageType, "Code");
    dd_symbol.Title = codeRtn + ": ";
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
    let bookviewArr: string[] = ["BidVol", "Price", "AskVol", "TransVol"];
    let bookviewRtnArr: string[] = [];
    let bookviewTittleLen = bookviewArr.length;
    for (let i = 0; i < bookviewTittleLen; ++i) {
      let bookviewRtn = ManulTrader.getTranslateInfo(this.languageType, bookviewArr[i]);
      bookviewRtnArr.push(bookviewRtn);
    }
    bookviewRtnArr.forEach(item => {
      this.bookViewTable.addColumn(item);
    });
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
      [this.txt_UKey.Text, this.txt_Symbol.Text] = dd_symbol.SelectedItem.Value.split(",");
      this.txt_Price.Text = rowItem.cells[1].Text;
      this.dd_Action.SelectedItem = (rowItem.cells[0].Text === "") ? this.dd_Action.Items[1] : this.dd_Action.Items[0];
      let tradeRtn = ManulTrader.getTranslateInfo(this.languageType, "Trade");
      Dialog.popup(this, this.tradeContent, { title: tradeRtn });
    };
    let bookViewContent = new ComboControl("col");
    bookViewContent.addChild(bookviewHeader);
    bookViewContent.addChild(this.bookViewTable);
    this.bookviewPage.setContent(bookViewContent);

    this.logPage = new TabPage("Log", ManulTrader.getTranslateInfo(this.languageType, "LOG"));
    this.pageObj["Log"] = this.logPage;
    let logContent = new ComboControl("col");
    this.logTable = new DataTable("table2");

    let logTimeTittleRtn = ManulTrader.getTranslateInfo(this.languageType, "Time");
    let logContentTittleRtn = ManulTrader.getTranslateInfo(this.languageType, "Content");
    this.logTable.addColumn(logTimeTittleRtn);
    this.logTable.addColumn(logContentTittleRtn);
    logContent.addChild(this.logTable);
    this.logPage.setContent(logContent);

    this.statarbPage = new TabPage("StatArb", ManulTrader.getTranslateInfo(this.languageType, "StatArb"));
    this.pageObj["StatArb"] = this.statarbPage;
    let statarbLeftAlign = 20;
    let statarbHeader = new ComboControl("row");
    this.buyamountLabel = new MetaControl("textbox");
    this.buyamountLabel.Left = statarbLeftAlign;
    this.buyamountLabel.Width = 50;

    this.buyamountLabel.Title = ManulTrader.getTranslateInfo(this.languageType, "BUY.AMOUNT") + ":";
    this.buyamountLabel.Disable = true;
    this.sellamountLabel = new MetaControl("textbox");
    this.sellamountLabel.Left = statarbLeftAlign;
    this.sellamountLabel.Width = 50;
    this.sellamountLabel.Title = ManulTrader.getTranslateInfo(this.languageType, "SELL.AMOUNT") + ":";
    this.sellamountLabel.Disable = true;
    statarbHeader.addChild(this.buyamountLabel).addChild(this.sellamountLabel);
    this.statarbTable = new DataTable();
    let statarbTablearr: string[] = ["Symbol", "InnerCode", "Change(%)", "Position",
      "Trade", "Amount", "StrategyID", "DiffQty", "SymbolCode"];
    let statarbTableRtnarr: string[] = [];
    let statarbTableTitleLen = statarbTablearr.length;
    for (let i = 0; i < statarbTableTitleLen; ++i) {
      let statarbRtn = ManulTrader.getTranslateInfo(this.languageType, statarbTablearr[i]);
      statarbTableRtnarr.push(statarbRtn);
    }
    statarbTableRtnarr.forEach(item => {
      this.statarbTable.addColumn(item);
    });

    this.statarbTable.columnConfigurable = true;
    let statarbContent = new ComboControl("col");
    statarbContent.addChild(statarbHeader);
    statarbContent.addChild(this.statarbTable);
    this.statarbPage.setContent(statarbContent);

    this.portfolioPage = new TabPage("Portfolio", ManulTrader.getTranslateInfo(this.languageType, "Portfolio"));
    this.pageObj["Portfolio"] = this.portfolioPage;
    let loadItem = new ComboControl("row");

    this.portfolioAccLabel = new MetaControl("textbox");
    this.portfolioAccLabel.Left = statarbLeftAlign;
    this.portfolioAccLabel.Width = 100;
    let accountRtn = ManulTrader.getTranslateInfo(this.languageType, "Account");
    this.portfolioAccLabel.Title = accountRtn + ": ";
    this.portfolioAccLabel.Disable = true;

    this.portfolioLabel = new MetaControl("textbox");
    this.portfolioLabel.Width = 60;
    let portfoliovalueRtn = ManulTrader.getTranslateInfo(this.languageType, "PORTFOLIOValue");
    if (portfoliovalueRtn === "PORTFOLIOValue")
      this.portfolioLabel.Title = "PORTFOLIO Value:";
    else
      this.portfolioLabel.Title = portfoliovalueRtn + ":";
    this.portfolioLabel.Left = 20;
    this.portfolioLabel.Disable = true;

    this.portfolioDaypnl = new MetaControl("textbox");
    this.portfolioDaypnl.Width = 60;
    let portfolioDaypnlRtn = ManulTrader.getTranslateInfo(this.languageType, "PORTFOLIODaypnl");
    if (portfolioDaypnlRtn === "PORTFOLIODaypnl")
      this.portfolioDaypnl.Title = "PORTFOLIO Day pnl:";
    else
      this.portfolioDaypnl.Title = portfolioDaypnlRtn + ":";
    this.portfolioDaypnl.Left = 20;
    this.portfolioDaypnl.Disable = true;

    this.portfolioonpnl = new MetaControl("textbox");
    this.portfolioonpnl.Width = 60;
    let portfolioonpnlRtn = ManulTrader.getTranslateInfo(this.languageType, "PORTFOLIOO/NPnl");
    if (portfolioonpnlRtn === "PORTFOLIOO/NPnl")
      this.portfolioonpnl.Title = "PORTFOLIO O/N Pnl:";
    else
      this.portfolioonpnl.Title = portfolioonpnlRtn + ":";
    this.portfolioonpnl.Left = 20;
    this.portfolioonpnl.Disable = true;

    this.portfolioCount = new MetaControl("textbox");
    this.portfolioCount.Width = 50;
    let portfolioCountRtn = ManulTrader.getTranslateInfo(this.languageType, "Count");
    this.portfolioCount.Title = portfolioCountRtn + ":";
    this.portfolioCount.Left = 20;
    this.portfolioCount.Disable = true;

    let btn_load = new MetaControl("button");
    let btn_loadRtn = ManulTrader.getTranslateInfo(this.languageType, "LoadCSV");
    if (btn_loadRtn === "LoadCSV")
      btn_load.Text = " Load    CSV ";
    else
      btn_load.Text = btn_loadRtn + "     ";
    btn_load.Left = 20;
    btn_load.Class = "primary";

    loadItem.addChild(this.portfolioAccLabel).addChild(this.portfolioLabel)
      .addChild(this.portfolioDaypnl).addChild(this.portfolioonpnl).addChild(this.portfolioCount).addChild(btn_load);

    let tradeitem = new ComboControl("row");
    this.portfolioBuyCom = new DropDown();
    this.portfolioBuyCom.Width = 59;
    this.portfolioBuyCom.Left = 20;

    this.portfolioBuyCom.Title = ManulTrader.getTranslateInfo(this.languageType, "Buy") + ": ";
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
    this.portfolioSellCom.Title = ManulTrader.getTranslateInfo(this.languageType, "Sell") + ":";
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

    this.allChk = new MetaControl("checkbox"); this.allChk.Width = 30;
    this.allChk.Title = " " + ManulTrader.getTranslateInfo(this.languageType, "All");
    this.allChk.Text = false; this.allChk.Left = 22;
    let allbuyChk = new MetaControl("checkbox"); allbuyChk.Width = 30;
    allbuyChk.Title = " " + ManulTrader.getTranslateInfo(this.languageType, "All-Buy");
    allbuyChk.Text = false; allbuyChk.Left = 20;
    let allsellChk = new MetaControl("checkbox"); allsellChk.Width = 30;
    allsellChk.Title = " " + ManulTrader.getTranslateInfo(this.languageType, "All-Sell");
    allsellChk.Text = false; allsellChk.Left = 20;

    this.range = new URange(); this.range.Width = 168; this.range.Left = 20;
    let orderRateRtn = ManulTrader.getTranslateInfo(this.languageType, "orderrate");
    if (orderRateRtn === "orderrate")
      this.range.Title = "Order Rate:";
    else
      this.range.Title = orderRateRtn + ":";
    this.rateText = new MetaControl("textbox"); this.rateText.Width = 35; this.rateText.Title = ""; this.rateText.Left = 5;
    let percentText = new MetaControl("plaintext"); percentText.Title = "%"; percentText.Width = 15;

    this.range.Text = 0; this.rateText.Text = 0;

    let btn_sendSel = new MetaControl("button");
    let sendSelRtn = ManulTrader.getTranslateInfo(this.languageType, "sendselected");
    if (sendSelRtn === "sendselected")
      btn_sendSel.Text = "Send Selected";
    else
      btn_sendSel.Text = sendSelRtn;
    btn_sendSel.Left = 20; btn_sendSel.Class = "primary";
    let btn_cancelSel = new MetaControl("button");
    let cancelSelRtn = ManulTrader.getTranslateInfo(this.languageType, "cancelselected");
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
      let portfolioTableRtn = ManulTrader.getTranslateInfo(this.languageType, portfolioTableArr[i]);
      portfoliotableRtnArr.push(portfolioTableRtn);
    }
    portfoliotableRtnArr.forEach(item => {
      this.portfolioTable.addColumn(item);
    });
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

    this.strategyPage = new TabPage("StrategyMonitor", ManulTrader.getTranslateInfo(this.languageType, "StrategyMonitor"));
    this.pageObj["StrategyMonitor"] = this.strategyPage;

    let strategyHeader = new ComboControl("row");
    let startall = new MetaControl("button");
    let startallRtn = ManulTrader.getTranslateInfo(this.languageType, "StartAll");
    if (startallRtn === "StartAll")
      startall.Text = "Start All";
    else
      startall.Text = startallRtn;
    let pauseall = new MetaControl("button");
    let pauseallRtn = ManulTrader.getTranslateInfo(this.languageType, "PauseAll");
    if (pauseallRtn === "PauseAll")
      pauseall.Text = "Pause All";
    else
      pauseall.Text = pauseallRtn;
    let stopall = new MetaControl("button");
    let stopallRtn = ManulTrader.getTranslateInfo(this.languageType, "StopAll");
    if (stopallRtn === "StopAll")
      stopall.Text = "Stop All";
    else
      stopall.Text = stopallRtn;
    let watchall = new MetaControl("button");
    let watchallRtn = ManulTrader.getTranslateInfo(this.languageType, "WatchAll");
    if (watchallRtn === "WatchAll")
      watchall.Text = "Watch All";
    else
      watchall.Text = watchallRtn;
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

    this.profitPage = new TabPage("Profit", ManulTrader.getTranslateInfo(this.languageType, "Profit"));
    this.pageObj["Profit"] = this.profitPage;
    let profitleftAlign = 20;
    let profitHeader = new ComboControl("row");
    this.totalpnLabel = new MetaControl("textbox");
    this.totalpnLabel.Left = profitleftAlign;
    this.totalpnLabel.Width = 85;
    this.totalpnLabel.Title = ManulTrader.getTranslateInfo(this.languageType, "TOTALPNL") + ": ";
    this.totalpnLabel.Disable = true;
    this.pospnlLabel = new MetaControl("textbox");
    this.pospnlLabel.Left = profitleftAlign;
    this.pospnlLabel.Width = 85;
    this.pospnlLabel.Title = ManulTrader.getTranslateInfo(this.languageType, "POSPNL") + ": ";
    this.pospnlLabel.Disable = true;
    this.trapnlt = new MetaControl("textbox");
    this.trapnlt.Left = profitleftAlign;
    this.trapnlt.Width = 85;
    this.trapnlt.Title = ManulTrader.getTranslateInfo(this.languageType, "TRAPNL.T") + ": ";
    this.trapnlt.Disable = true;
    this.pospnlt = new MetaControl("textbox");
    this.pospnlt.Left = profitleftAlign;
    this.pospnlt.Width = 85;
    this.pospnlt.Title = ManulTrader.getTranslateInfo(this.languageType, "POSPNL.T") + ": ";
    this.pospnlt.Disable = true;
    this.totalpnlt = new MetaControl("textbox");
    this.totalpnlt.Left = profitleftAlign;
    this.totalpnlt.Width = 85;
    this.totalpnlt.Title = ManulTrader.getTranslateInfo(this.languageType, "TOTALPNL.T") + ": ";
    this.totalpnlt.Disable = true;
    let reqbtn = new MetaControl("button");
    reqbtn.Left = profitleftAlign;
    reqbtn.Width = 30;
    reqbtn.Text = ManulTrader.getTranslateInfo(this.languageType, "Req");
    profitHeader.addChild(this.totalpnLabel).addChild(this.pospnlLabel).addChild(this.trapnlt).addChild(this.pospnlt).addChild(this.totalpnlt).addChild(reqbtn);
    this.profitTable = new DataTable("table2");
    let profittableArr: string[] = ["U-Key", "Code", "Account", "Strategy", "AvgPrice(B)", "AvgPrice(S)",
      "PositionPnl", "TradingPnl", "IntraTradingFee", "TotalTradingFee", "LastTradingFee", "LastPosPnl",
      "TodayPosPnl", "TotalPnl", "LastPosition", "TodayPosition", "LastClose", "MarketPrice", "IOPV"];
    let profitTableTittleLen = profittableArr.length;
    let profitTableRtnArr: string[] = [];
    for (let i = 0; i < profitTableTittleLen; ++i) {
      profitTableRtnArr.push(ManulTrader.getTranslateInfo(this.languageType, profittableArr[i]));
    }
    profitTableRtnArr.forEach(item => {
      this.profitTable.addColumn(item);
    });
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
    let strategyTableInitArr: string[] = ["StrategyID", "Sym1", "Sym2", "Start", "Pause",
      "Stop", "Watch", "Status", "PosPnl(K)", "TraPnl(K)"];
    let strategyTableInitTittleLen = strategyTableInitArr.length;
    let strategytableRtnArr: string[] = [];
    for (let i = 0; i < strategyTableInitTittleLen; ++i) {
      strategytableRtnArr.push(ManulTrader.getTranslateInfo(this.languageType, strategyTableInitArr[i]));
    }
    strategytableRtnArr.forEach(item => {
      this.strategyTable.addColumn(item);
    });
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

    this.loadLayout();
    this.init(this.option.port, this.option.host);
    // this.init(9082, "172.24.51.4");
  }

  ngAfterViewInit() {
    // this.main.reallocSize(this.layout.width, this.layout.height);
  }

  loadLayout() {
    let defaultLayout = {
      "type": "v",
      "width": 1190,
      "height": 660,
      "children": [
        {
          "type": "h",
          "height": 200,
          "modules": [
            "Position",
            "Account",
            "OrderStatus",
            "DoneOrders"
          ]
        },
        {
          "type": "h",
          "height": 250,
          "children": [
            {
              "type": "v",
              "width": 228,
              "modules": [
                "BookView"
              ]
            },
            {
              "type": "v",
              "width": 957,
              "modules": [
                "Log",
                "StatArb",
                "Portfolio"
              ]
            }
          ]
        },
        {
          "type": "h",
          "height": 200,
          "modules": [
            "StrategyMonitor",
            "Profit"
          ]
        }
      ]
    };
    this.layout = File.parseJSON(`${Environment.appDataDir}/ChronosApps/${this.option.name}/layout.json`);
    this.layout = this.layout ? this.layout : defaultLayout;

    let children = this.layout.children;
    let childrenLen = children.length;
    this.main = new DockContainer(null, this.layout.type, this.layout.width, this.layout.height);
    for (let i = 0; i < childrenLen - 1; ++i) {  // traverse
      this.main.addChild(this.traversefunc(this.main, children[i]));
      this.main.addChild(new Splitter("h"));
    }

    this.main.addChild(this.traversefunc(this.main, children[childrenLen - 1]));
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


  gethanizaionInfo(obj: any, data: any) {
    for (let o in obj) {
      if ((o + "") === data)
        return obj[o];
    }
    return null;
  }

  gethanizationVal(obj: any, type: number) {
    if (type === 1)
      return obj.chinese;
    return "";
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

  traversefunc(parent, obj) {
    let dock = new DockContainer(parent, obj.type, obj.width, obj.height);
    if (obj.children && obj.children.length > 0) {
      obj.children.forEach((child, index) => {
        dock.addChild(AppComponent.self.traversefunc(dock, child));
        if (index < obj.children.length - 1)
          dock.addChild(new Splitter(child.type));
      });
    } else if (obj.modules && obj.modules.length > 0) {
      let panel = new TabPanel();
      obj.modules.forEach(page => {
        // console.log(AppComponent.self.pageObj[page]);
        panel.addTab(AppComponent.self.pageObj[page]);
        this.statechecker.changeMenuItemState(page, true, 2);
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
      let getOrderId = this.orderstatusTable.rows[i].cells[3].Text;
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
        let getOrderId = this.orderstatusTable.rows[j].cells[3].Text;
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
    row.cells[0].Type = "checkbox";
    row.cells[0].Text = false;
    row.cells[0].Data = { ukey: 0, chk: true };
    row.cells[0].Data.ukey = obj.od.innercode;
    row.cells[1].Text = obj.od.innercode;
    let codeInfo = ManulTrader.getSecuinfoByukey(2, obj.od.innercode);
    let tempObj = AppComponent.self.traverseukeyObj(codeInfo, obj.od.innercode);
    if (codeInfo) {
      if (tempObj) {
        row.cells[2].Text = (tempObj.SecuCode + "").split(".")[0];
      }
    }
    else
      row.cells[2].Text = "";
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
    // console.log("333333333333", data);
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
            break;
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
      AppComponent.self.strategyTable.insertColumn(ManulTrader.getTranslateInfo(this.languageType, title), colIdx);  // add col
      AppComponent.self.strategyTable.rows[rowIdx].cells[colIdx].Text = parseFloat(data.value) / Math.pow(10, decimal);
      AppComponent.self.strategyTable.rows[rowIdx].cells[colIdx].Class = "default";
    } else if (type === StrategyCfgType.STRATEGY_CFG_TYPE_COMMAND) {
      AppComponent.self.strategyTable.insertColumn(ManulTrader.getTranslateInfo(this.languageType, title), colIdx);  // add col
      // add button
      AppComponent.self.strategyTable.rows[rowIdx].cells[colIdx].Type = "button";
      AppComponent.self.strategyTable.rows[rowIdx].cells[colIdx].Class = "primary";
      AppComponent.self.strategyTable.rows[rowIdx].cells[colIdx].Text = title;
      if (value === 0)
        AppComponent.self.strategyTable.rows[rowIdx].cells[colIdx].Disable = true;
    } else if (type === StrategyCfgType.STRATEGY_CFG_TYPE_PARAMETER) {
      AppComponent.self.strategyTable.insertColumn(ManulTrader.getTranslateInfo(this.languageType, title), colIdx);
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

  createBookView(bookviewID) {
    let bookviewPage = new TabPage(bookviewID, ManulTrader.getTranslateInfo(this.languageType, "BookView"));
    this.pageObj[bookviewID] = this.bookviewPage;

    let bookviewHeader = new ComboControl("row");
    let dd_symbol = new DropDown();
    dd_symbol.AcceptInput = true;
    let codeRtn = ManulTrader.getTranslateInfo(this.languageType, "Code");
    dd_symbol.Title = codeRtn + ": ";
    dd_symbol.addItem({ Text: "000001", Value: "3,000001" });
    dd_symbol.addItem({ Text: "000002", Value: "6,000002" });
    dd_symbol.addItem({ Text: "IC1706", Value: "2007741,IC1706" });
    let self = this;
    let bookViewTable = new DataTable("table");
    dd_symbol.SelectChange = () => {
      bookViewTable.rows.forEach(row => {
        row.cells.forEach(cell => {
          cell.Text = "";
        });
      });
    };
    bookviewHeader.addChild(dd_symbol);

    let bookviewArr: string[] = ["BidVol", "Price", "AskVol", "TransVol"];
    let bookviewRtnArr: string[] = [];
    let bookviewTittleLen = bookviewArr.length;
    for (let i = 0; i < bookviewTittleLen; ++i) {
      let bookviewRtn = ManulTrader.getTranslateInfo(this.languageType, bookviewArr[i]);
      bookviewRtnArr.push(bookviewRtn);
    }
    bookviewRtnArr.forEach(item => {
      bookViewTable.addColumn(item);
    });
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
      // console.info(cellIndex, rowIndex);
    };
    bookViewTable.OnRowClick = (rowItem, rowIndex) => {
      [this.txt_UKey.Text, this.txt_Symbol.Text] = dd_symbol.SelectedItem.Value.split(",");
      this.txt_Price.Text = rowItem.cells[1].Text;
      this.dd_Action.SelectedItem = (rowItem.cells[0].Text === "") ? this.dd_Action.Items[1] : this.dd_Action.Items[0];
      let tradeRtn = ManulTrader.getTranslateInfo(this.languageType, "Trade");
      Dialog.popup(this, this.tradeContent, { title: tradeRtn });
    };
    let bookViewContent = new ComboControl("col");
    bookViewContent.addChild(bookviewHeader);
    bookViewContent.addChild(bookViewTable);
    bookviewPage.setContent(bookViewContent);
  }

  onDestroy() {
    File.writeSync(`${Environment.appDataDir}/ChronosApps/${AppComponent.self.option.name}/layout.json`, this.main.getLayout());
  }

  onResize(event: any) {
    // minus 10 to remove the window's border.
    this.main.reallocSize(event.currentTarget.document.body.clientWidth - 10, event.currentTarget.document.body.clientHeight - 27);
    this.ref.detectChanges();
  }
}


