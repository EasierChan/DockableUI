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
import { ManulTrader } from "./bll/sendorder";
import { EOrderType, AlphaSignalInfo, SECU_MARKET } from "../../base/api/model/itrade/orderstruct";

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

  private orderstatusTable: DataTable;
  private doneOrdersTable: DataTable;
  private bookViewTable: DataTable;
  private logTable: DataTable;
  private strategyTable: DataTable;
  private accountTable: DataTable;
  private static self: AppComponent;
  private PositionTable: DataTable;
  private profitTable: DataTable;

  // profittable textbox
  private totalpnLabel: MetaControl;
  private pospnlLabel: MetaControl;
  private trapnlt: MetaControl;
  private pospnlt: MetaControl;
  private totalpnlt: MetaControl;


  constructor(private psInstance: PriceService, private ref: ChangeDetectorRef) {
    AppComponent.self = this;
  }

  ngOnInit(): void {
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
    logPanel.setActive("LOG");
    row2.addChild(new DockContainer("v", 800, null).addChild(logPanel));
    this.children.push(row2);
    this.children.push(new Splitter("h"));

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

    this.profitPage = new TabPage("Profit", "Profit");
    bottomPanel.addTab(this.profitPage);
    bottomPanel.setActive(this.profitPage.id);
    let profitleftAlign = 20;
    let profitrowSep = 5;
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
    let strategyRow1 = this.strategyTable.newRow();
    strategyRow1.cells[0].Type = "button";
    let strategyContent = new ComboControl("col");
    strategyContent.addChild(strategyHeader);
    strategyContent.addChild(this.strategyTable);
    this.strategyPage.setContent(strategyContent);
    let row3 = new DockContainer("h").addChild(bottomPanel);
    this.children.push(row3);

    this.psInstance.setEndpoint(20000, "172.24.51.6");
    this.psInstance.setHeartBeat(1000000);
    this.psInstance.register([3, 6]);
    this.psInstance.subscribe((msg) => {
      // console.info(msg);
      if (msg.type === 201 && msg.ukey === parseInt(dd_symbol.SelectedItem.Value.split(",")[0])) {
        for (let i = 0; i < 10; ++i) {
          // console.info(i);
          this.bookViewTable.rows[i + 10].cells[0].Text = msg.bidvols[i] + "";
          this.bookViewTable.rows[i + 10].cells[1].Text = msg.bidprices[i] / 10000 + "";
          this.bookViewTable.rows[9 - i].cells[2].Text = msg.askvols[i] + "";
          this.bookViewTable.rows[9 - i].cells[1].Text = msg.askprices[i] / 10000 + "";
        }
        console.info(this.bookViewTable);
        this.bookViewTable.detectChanges();
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
    ManulTrader.addSlot(2001, this.positionDealer);
    ManulTrader.addSlot(2003, this.positionDealer);
    ManulTrader.addSlot(2005, this.positionDealer);
    ManulTrader.addSlot(2050, this.positionDealer);
    ManulTrader.addSlot(2031, this.positionDealer);
    ManulTrader.addSlot(2048, this.showComTotalProfitInfo);
    ManulTrader.addSlot(2020, this.showComConOrder);
    ManulTrader.addSlot(2013, this.showComAccountPos);
    ManulTrader.addSlot(3502, this.showComRecordPos);
    ManulTrader.addSlot(3504, this.showComRecordPos);
    ManulTrader.addSlot(2015, this.showComGWNetGuiInfo);
    ManulTrader.addSlot(2017, this.showComGWNetGuiInfo);
    ManulTrader.addSlot(2023, this.showComProfitInfo);
    ManulTrader.addSlot(2025, this.positionDealer);
    ManulTrader.addSlot(2021, this.positionDealer);
    ManulTrader.addSlot(2022, this.showComOrderRecord);
    ManulTrader.addSlot(3011, this.showComOrderRecord);
    ManulTrader.addSlot(3510, this.showComOrderRecord);
    ManulTrader.addSlot(2040, this.positionDealer);
    ManulTrader.init();
  }

  showStrategyInfo(data: any) {
    // console.log("alarm info,pass", data)
  }
  showComConOrder(data: any) {
    console.log("showComConOrder:", data);
  }
  showComOrderRecord(data: any) {
    console.log("showComOrderRecord", data);
    for (let i = 0; i < data.length; ++i) {
      let orderStatus = data[i].od.orderstatus;
      if (orderStatus === 9 || orderStatus === 8) {
        AppComponent.self.handleDoneOrder(data[i]);
      } else {
        AppComponent.self.handleUndoneOrder(data[i]);
      }
    }
  }

  handleDoneOrder(data: any) {

  }
  handleUndoneOrder(data: any) {

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
    AppComponent.self.PositionTable.rows[idx].cells[4] = obj.record.TotalVol;
    AppComponent.self.PositionTable.rows[idx].cells[5] = obj.record.AvlVol;
    AppComponent.self.PositionTable.rows[idx].cells[6] = obj.record.AvlCreRedempVol;
    AppComponent.self.PositionTable.rows[idx].cells[7] = obj.record.WorkingVol;
    AppComponent.self.PositionTable.rows[idx].cells[8] = obj.record.TotalCost;
    AppComponent.self.ref.detectChanges();
  }
  refreshFuturePosInfo(obj: any, idx: number) {
    AppComponent.self.PositionTable.rows[idx].cells[4] = obj.record.TotalVol;
    AppComponent.self.PositionTable.rows[idx].cells[5] = obj.record.AvlVol;
    AppComponent.self.PositionTable.rows[idx].cells[7] = obj.record.WorkingVol;
    AppComponent.self.PositionTable.rows[idx].cells[8] = obj.record.TotalCost;
    AppComponent.self.PositionTable.rows[idx].cells[9] = obj.record.TodayOpen;
    AppComponent.self.PositionTable.rows[idx].cells[10] = obj.record.AveragePrice;
    AppComponent.self.ref.detectChanges();
  }
  showComGWNetGuiInfo(data: any) {

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
    // console.log("1111111111111111", data);
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
    row.cells[1].Text = "";
    row.cells[2].Text = obj.account;
    row.cells[3].Text = obj.strategyid;
    row.cells[4].Text = obj.avgpriceforbuy;
    row.cells[5].Text = obj.avgpriceforsell;
    row.cells[6].Text = obj.positionpnl / 10000;
    row.cells[7].Text = obj.tradingpnl;
    row.cells[8].Text = obj.intradaytradingfee;
    row.cells[9].Text = obj.totaltradingfee;
    row.cells[10].Text = obj.lasttradingfee;
    row.cells[11].Text = obj.lastpositionpnl / 10000;
    row.cells[12].Text = obj.todaypositionpnl;
    row.cells[13].Text = obj.totalpnl / 10000;
    row.cells[14].Text = obj.lastposition;
    row.cells[15].Text = obj.todayposition;
    row.cells[16].Text = obj.lastclose / 10000;
    row.cells[17].Text = obj.marketprice / 10000;
    row.cells[18].Text = obj.iopv;
    AppComponent.self.profitTable.detectChanges();
  }
  refreshProfitInfo(obj: any, idx: number) {
    AppComponent.self.profitTable.rows[idx].cells[4].Text = obj.avgpriceforbuy;
    AppComponent.self.profitTable.rows[idx].cells[5].Text = obj.avgpriceforsell;
    AppComponent.self.profitTable.rows[idx].cells[6].Text = obj.positionpnl / 10000;
    AppComponent.self.profitTable.rows[idx].cells[7].Text = obj.tradingpnl;
    AppComponent.self.profitTable.rows[idx].cells[8].Text = obj.intradaytradingfee;
    AppComponent.self.profitTable.rows[idx].cells[9].Text = obj.totaltradingfee;
    AppComponent.self.profitTable.rows[idx].cells[10].Text = obj.lasttradingfee;
    AppComponent.self.profitTable.rows[idx].cells[11].Text = obj.lastpositionpnl / 10000;
    AppComponent.self.profitTable.rows[idx].cells[12].Text = obj.todaypositionpnl;
    AppComponent.self.profitTable.rows[idx].cells[13].Text = obj.totalpnl / 10000;
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
  }
  positionDealer(data: any) {
    // console.log("444444444444444444", data);
  }
}


