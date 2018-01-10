/**
 * created by cl, 2017/05/19
 * update: [date]
 * desc: show loopback test.
 */

import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import {
    VBox, HBox, DropDown, DropDownItem, Button, DataTable, Label, TabPanel, TabPage, ChartViewer, TextBox, DockContainer, Splitter,
    Dialog, Section, EChart, MetaControl, BookViewer, CheckBox, DataTableRow
} from "../../base/controls/control";
import { QtpService } from "../../base/api/services/qtp.service";
import { IP20Service } from "../../base/api/services/ip20.service";
import { AppStateCheckerRef, Environment, AppStoreService, TranslateService, SecuMasterService } from "../../base/api/services/backend.service";
import { ServiceType, FGS_MSG } from "../../base/api/model/qtp/message.model";
import { QueryFund, QueryPosition, COMS_MSG, OrderPush, QueryFundAns, QueryPositionAns, SendOrder, OrderStatus, QueryOrder, QueryOrderAns, SendOrderAns, CancelOrder, CancelOrderAns } from "../../base/api/model/qtp/coms.model";
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
        TranslateService,
        SecuMasterService,
        IP20Service
    ]
})
export class AppComponent implements OnInit {
    private readonly apptype = "product-trader";
    main: DockContainer;
    dialog: Dialog;
    option: any;
    dd_tests: DropDown;
    txt_totalProfit: TextBox;
    txt_holdProfit: TextBox;
    txt_todayProfit: TextBox;
    txt_todayHoldProfit: TextBox;
    positionTable: DataTable;
    fundAccountTable: DataTable;
    tradeAccountTable: DataTable;
    MarketTable: DataTable;
    orderStatTable: DataTable;
    finishOrderTable: DataTable;
    profitAndLossTable: DataTable;
    logTable: DataTable;
    chart: ChartViewer;
    worker: any;
    userId: any;
    term_id: any;
    productId: any;
    acidObj: any = {};
    productNetData: any;
    productNetChart: ChartViewer;
    productNet: Section; // 产品净值
    private viewContentPop: any;
    private dd_Account: DropDown;
    private dd_portfolioAccount: DropDown;
    private dd_Strategy: DropDown;
    private dd_symbol: DropDown;
    private languageType: number = 1;　 // * 0,English 1,chinese
    private dd_Action: DropDown;
    private txt_UKey: MetaControl;
    private txt_Symbol: MetaControl;
    private txt_Price: MetaControl;
    private txt_Volume: MetaControl;
    coms_directive: any = {};
    coms_statusType: any = {};
    coms_orderType: any = {};
    currency_type: any = {};
    coms_positionType: any = {};
    coms_hedgeFlagType: any = {};
    orderStateList: any[] = [];

    constructor(private tradePoint: QtpService, private ref: ChangeDetectorRef, private state: AppStateCheckerRef, private secuinfo: SecuMasterService,
        private appSrv: AppStoreService, private langServ: TranslateService, private quote: IP20Service) {
        this.state.onInit(this, this.onReady);
        this.state.onDestory(this, this.onDestroy);
        this.state.onResize(this, this.onResize);
    }

    onReady(option: any) {
        this.option = option;
        this.productId = this.option.productID;
        // this.qtp.connect(this.option.port, this.option.host);
    }

    onDestroy() {
    }
    onResize(event: any) {
        // minus 10 to remove the window's border.
        this.main.reallocSize(event.currentTarget.document.body.clientWidth - 10, event.currentTarget.document.body.clientHeight - 27);
        this.ref.detectChanges();
    }


    ngOnInit() {
        this.userId = JSON.parse(AppStoreService.getLocalStorageItem(DataKey.kUserInfo)).user_id;
        this.term_id = JSON.parse(AppStoreService.getLocalStorageItem(DataKey.kUserInfo)).term_id;
        let [addr, port] = this.appSrv.getSetting().endpoints[0].trade_addr.split(":");
        let stockSecuinfo = this.secuinfo.getSecuinfoByUKey(2490369);
        this.coms_directive = {
            1: "买",          // 普通买
            2: "卖", // 普通卖
            3: "融资买入",           // kDtLoanBuy
            4: "融券卖出(预约券)",        // kDtMarginSell
            5: "融券卖出(市场券)",  // kDtMarketMarginSell
            6: "kDtBuyPayback",        // 买券还券
            7: "kDtResvBuyPayback",    // 买券还券（预约券）
            8: "kDtMarketBuyPayback",  // 买券还券（市场券）
            9: "现券还券",        // kDtSecPayback
            10: "现券还券(预约券)",   // kDtResvSecPayback
            11: "现券还券(市场券)", // kDtMarketSecPayback
            12: "现金还款",        // kDtCashRepay
            13: "卖券还款",      // kDtSellPayBack
            14: "担保品划转", // kDtGuaranteeTransfer
            15: "申购",       // kDtApplyParch
            16: "赎回"       // kDtRedemption
        };
        this.currency_type = {
            "1": "人民币", // CNY
            "2": "美元", // USD
            "3": "欧元", // EUR	欧元
            "4": "日元", // JPY	日元
            "5": "英镑", // GBP	英镑
            "6": "卢布", // RUB	卢布
            "7": "瑞士法郎", // CHF	瑞士法郎
            "8": "港币", // HKD	港币
            "9": "澳元", // AUD	澳元
            "10": "韩元", // KRW	韩元
            "11": "泰铢", // THB	泰铢
            "12": "巴西雷亚尔", // BRL	巴西雷亚尔
            "13": "新西兰元", // NZD	新西兰元
            "14": "新加坡元", // SGD	新加坡元
            "15": "马来西亚林吉特", // MYR	马来西亚林吉特
            "16": "加元" // CAD	加元
        };
        this.coms_statusType = {
            "-1": "待审批",
            "0": "未报",
            "1": "待报",
            "2": "已报",
            "3": "待撤",
            "4": "部成待撤",
            "5": "部分撤销",
            "6": "已撤",
            "7": "部分成交",
            "8": "全部成交",
            "9": "废单",
            "40": "风控阻塞"
        };
        this.coms_orderType = {
            "0": "普通订单",
            "1": "正常补单",
            "2": "强平补内",
            "3": "强平补外",
            "4": "移仓订单"
        };
        this.coms_positionType = {
            1: "多仓",
            2: "空仓"
        };
        this.coms_hedgeFlagType = {
            "0": "kHftNone",         // 期货产品外，为０
            "1": "投机",  // kHftSpeculation
            "2": "套利",    // kHftArbitrage
            "3": "套保"       // kHftHedge
        };
        let leftAlign = 20;
        let rowSep = 5;
        // this.tradePage = new TabPage("ManulTrader", this.langServ.get("ManulTrader"));
        this.viewContentPop = new VBox();
        this.viewContentPop.MinHeight = 500;
        this.viewContentPop.MinWidth = 500;

        let account_firrow = new HBox();
        this.dd_Account = new DropDown();
        this.dd_Account.Width = 120;
        let dd_accountRtn = this.langServ.get("Account");
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
        this.dd_Action.addItem({ Text: buyRtn, Value: 1 });
        this.dd_Action.addItem({ Text: sellRtn, Value: 2 });
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
        this.txt_Volume = new MetaControl("textbox");
        this.txt_Volume.Top = rowSep;
        this.txt_Volume.Title = "";
        this.txt_Volume.Width = 150;
        volume_sixrow.top = 5;
        volume_sixrow.addChild(volume_label).addChild(this.txt_Volume);
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

        // 非弹框内容
        let panel = new TabPanel();
        let profitAndLossPage = new TabPage("profitAndLossPage", "盈亏");
        let profitAndLossContent = new VBox();
        this.profitAndLossTable = new DataTable("table2");
        this.profitAndLossTable.height = 200;
        this.profitAndLossTable.RowIndex = false;
        ["Totalamt", "Validamt", "Frozenamt", "Loan", "Fee", "SubjectAmount", "Validloan", "Stockloan", "Stockvalue", "TotalMargin", "Buymargin", "SellMargin", "ClosePL", "HoldPosipl", "MtmClosepl", "MtmPosipl", "Stockvalue", "FuturesValue", "StockValidamt", "FuturesValidamt", "SpifCap", "CommodityFuturesCap", "RiskExposure", "CommodityFuturesNetting"].forEach(item => {
            this.profitAndLossTable.addColumn(this.langServ.get(item));
        });
        profitAndLossContent.addChild(this.profitAndLossTable);
        profitAndLossPage.setContent(profitAndLossContent);
        panel.addTab(profitAndLossPage, false);
        panel.setActive("profitAndLossPage");


        let positionPage = new TabPage("productPosition", "仓位");
        let positionContent = new VBox();
        this.positionTable = new DataTable("table2");
        this.positionTable.height = 200;
        this.positionTable.RowIndex = false;
        ["UKEY", "Code", "TotalQty", "AvlQty", "AvlCreRedempVol", "WorkingQty",
            "TotalCost", "TodayOpen", "Type"].forEach(item => {
                this.positionTable.addColumn(this.langServ.get(item));
            });

        positionContent.addChild(this.positionTable);

        positionPage.setContent(positionContent);
        panel.addTab(positionPage, false);

        let productNetPage = new TabPage("productNetViewer", "净值");
        let productNetContent = new VBox();
        this.productNet = new Section();
        this.productNetChart = new ChartViewer();
        // productNetPage.onClick = () => {
        //     setTimeout(() => {
        this.productNetChart.setOption(this.createProductNetChart().option);
        //     }, 500);
        // };
        productNetContent.addChild(this.productNetChart);
        productNetPage.setContent(productNetContent);
        panel.addTab(productNetPage, false);
        // panel.setActive("productNetViewer");

        let orderStatPage = new TabPage("orderStatViewer", "订单状态");
        let orderStatContent = new VBox();
        let orderstatusHeader = new HBox();
        let cb_handle = new Label();
        cb_handle.Text = this.langServ.get("Status") + "：";
        orderstatusHeader.addChild(cb_handle);
        let dd_status = new DropDown();
        dd_status.Left = 10;
        dd_status.addItem({ Text: "-全部-", Value: "-2" });
        for (let key in this.coms_statusType) {
            dd_status.addItem({ Text: this.coms_statusType[key], Value: key });
        }
        orderstatusHeader.addChild(dd_status);
        let cb_SelAll = new CheckBox();
        cb_SelAll.Left = 10;
        cb_SelAll.Text = false;
        cb_SelAll.Title = this.langServ.get("All");
        orderstatusHeader.addChild(cb_SelAll);
        cb_SelAll.OnClick = () => {
            this.orderStatTable.rows.forEach((item, index) => {
                if (!item.cells[0].Disable && !item.hidden)
                    item.cells[0].Text = !cb_SelAll.Text;
            });
        };
        let btn_cancel = new Button();
        btn_cancel.Left = 10;
        btn_cancel.Text = this.langServ.get("CancelSelected");
        orderstatusHeader.addChild(btn_cancel);
        orderStatContent.addChild(orderstatusHeader);
        cb_SelAll.Disable = dd_status.Disable = btn_cancel.Disable = false;

        dd_status.SelectChange = (item) => {
            this.orderStatTable.rows.forEach((item, index) => {
                if (Number(dd_status.SelectedItem.Value) === -2) {
                    item.hidden = false;
                    return;
                }
                if (Number(dd_status.SelectedItem.Value) === item.cells[9].Data) {
                    item.hidden = false;
                    return;
                }
                item.hidden = true;
            });
        };
        btn_cancel.OnClick = () => {
            this.orderStatTable.rows.forEach((item, index) => {
                if (item.cells[0].Text) {
                    let cancelOrder = new CancelOrder();
                    cancelOrder.order_ref = item.cells[1].Text;  // u8 撤单的客户端订单编号
                    cancelOrder.order_id = 0;   // u8 撤单订单编号
                    cancelOrder.trader_id = 0;  // u8 撤单交易员ID/交易账户id
                    cancelOrder.term_id = item.cells[1].Data;    // u4 终端ID
                    cancelOrder.order_date = 0;  // u4 撤单时间yymmdd
                    cancelOrder.order_time = 0; // u4 撤单时间hhmmss
                    this.tradePoint.send(COMS_MSG.kMtFCancelOrder, cancelOrder.toBuffer(), ServiceType.kCOMS);
                }
            });
        };
        this.orderStatTable = new DataTable("table2");
        this.orderStatTable.RowIndex = false;
        this.orderStatTable.height = 200;
        ["Check", "OrderId", "UKEY", "SymbolCode", "Symbol", "OrderPrice", "OrderVol", "OrderTime",
            "Ask/Bid", "OrderStatus"].forEach(item => {
                this.orderStatTable.addColumn(this.langServ.get(item));
            });
        orderStatContent.addChild(this.orderStatTable);
        orderStatPage.setContent(orderStatContent);
        panel.addTab(orderStatPage, false);

        let finishOrderPage = new TabPage("finishOrderViewer", "完结订单");
        let finishOrderContent = new VBox();
        this.finishOrderTable = new DataTable("table2");
        this.finishOrderTable.height = 200;
        this.finishOrderTable.RowIndex = false;
        ["OrderId", "UKEY", "SymbolCode", "Symbol", "OrderPrice", "OrderVol", "OrderTime",
            "Ask/Bid", "OrderStatus", "DonePrice", "DoneVol", "DoneTime", "OrderType"].forEach(item => {
                this.finishOrderTable.addColumn(this.langServ.get(item));
            });
        finishOrderContent.addChild(this.finishOrderTable);
        finishOrderPage.setContent(finishOrderContent);
        panel.addTab(finishOrderPage, false);

        let fundAccountPage = new TabPage("fundAccountViewer", "资金账户");
        let fundAccountContent = new VBox();
        this.fundAccountTable = new DataTable("table2");
        this.fundAccountTable.height = 200;
        this.fundAccountTable.RowIndex = false;
        this.fundAccountTable.addColumn("币种", "资金余额", "交易可用金额", "总保证金", "买保证金", "卖保证金", "手续费", "持仓盈亏", "平仓盈亏");
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
        // viewContent.addChild(panel);

        let Market = new TabPage("MarketId", "行情");
        let MarketCon = new VBox();
        MarketCon.MinHeight = 200;
        let panel2 = new TabPanel();
        let bookviewer = new BookViewer(this.langServ);
        bookviewer.onCellDBClick = (item, cellIndex, rowIndex, row) => {
            if (cellIndex === 2 || cellIndex === 1 && rowIndex < 10)
                this.dd_Action.SelectedItem = this.dd_Action.Items[1];
            else this.dd_Action.SelectedItem = this.dd_Action.Items[0];
            if (bookviewer.ukey !== undefined) {
                this.txt_UKey.Text = bookviewer.ukey;
                let stockSecuinfo = this.secuinfo.getSecuinfoByUKey(bookviewer.ukey);
                this.txt_Symbol.Text = stockSecuinfo[bookviewer.ukey].SecuAbbr;
            }
            this.txt_Price.Text = row.cells[1].Text;
            Dialog.popup(this, this.viewContentPop, { title: this.langServ.get("Trade"), height: 300 });
        };
        // bookviewer.
        // this.quote.send(17, 101, { topic: 3112, kwlist: bookviewer.ukey });
        MarketCon.addChild(bookviewer);
        Market.setContent(MarketCon);
        panel2.addTab(Market, false);
        panel2.setActive("MarketId");

        let panel3 = new TabPanel();
        let logPage = new TabPage("Log", this.langServ.get("LOG"));
        let logContent = new VBox();
        this.logTable = new DataTable("table2");

        let logTimeTittleRtn = this.langServ.get("Time");
        let logContentTittleRtn = this.langServ.get("Content");
        this.logTable.addColumn(logTimeTittleRtn);
        this.logTable.addColumn(logContentTittleRtn);
        logContent.addChild(this.logTable);
        logPage.setContent(logContent);
        panel3.addTab(logPage, false);
        panel3.setActive("Log");

        this.main = new DockContainer(null, "v", window.innerWidth, window.innerHeight);
        this.main.addChild(new DockContainer(this.main, "h", null, Math.round(window.innerHeight / 2)).addChild(panel));
        this.main.addChild(new Splitter("h", this.main));
        let dock = new DockContainer(this.main, "h", null, window.innerHeight - Math.round(window.innerHeight / 2) - Splitter.size);
        let vdock = new DockContainer(dock, "v", Math.round(window.innerWidth / 2), null);
        vdock.addChild(panel2);
        let vdock2 = new DockContainer(dock, "v", window.innerWidth - Math.round(window.innerWidth / 2) - Splitter.size, null);
        vdock2.addChild(panel3);

        dock.addChild(vdock);
        dock.addChild(new Splitter("v", dock));
        dock.addChild(vdock2);
        this.main.addChild(dock);

        // 建立TCP链接
        this.registryListeners();
        this.tradePoint.connect(parseInt(port), addr);

        this.tradePoint.onConnect = () => {
            this.tradePoint.send(FGS_MSG.kLogin, JSON.stringify({ data: JSON.parse(AppStoreService.getLocalStorageItem(DataKey.kUserInfo)) }), ServiceType.kLogin);
        };
        this.tradePoint.onClose = () => {

        };

        // 数据请求
        // 查询资金
        this.tradePoint.addSlot({
            service: ServiceType.kCOMS,
            msgtype: COMS_MSG.kMtFQueryFundAns,
            callback: (msg) => {
                if (msg !== undefined) {
                    let offset = 0;
                    while (offset < msg.length) {
                        let ans = new QueryFundAns();
                        offset = ans.fromBuffer(msg, offset);
                        this.addFundAccountRow(ans);
                    }
                }
            }
        });
        // 查询仓位
        this.tradePoint.addSlot({
            service: ServiceType.kCOMS,
            msgtype: COMS_MSG.kMtFQueryPositionAns,
            callback: (msg) => {
                if (msg !== undefined) {
                    let offset = 0;
                    while (offset < msg.length) {
                        let ans = new QueryPositionAns();
                        offset = ans.fromBuffer(msg, offset);
                        this.addPositionRow(ans);
                    }
                }
            }
        });
        // 查询订单
        this.tradePoint.addSlot({
            service: ServiceType.kCOMS,
            msgtype: COMS_MSG.kMtBQueryOrderAns,
            callback: (msg, option) => {
                if (msg !== undefined) {
                    let offset = 0;
                    while (offset < msg.length) {
                        let ans = new QueryOrderAns();
                        offset = ans.fromBuffer(msg, offset);
                        this.orderStateList.push(ans.query_orderAns);
                        this.addOrderStatRow(ans.query_orderAns); // 订单状态table
                        this.addFinishOrderRow(ans.query_orderAns); // 完结订单
                    }
                }
            }
        });
        // 下单
        this.tradePoint.addSlot({
            service: ServiceType.kCOMS,
            msgtype: COMS_MSG.kMtFSendOrderAns,
            callback: (msg) => {
                if (msg !== undefined) {
                    let ans = new SendOrderAns();
                    ans.fromBuffer(msg);
                    this.orderStateList.push(ans);
                    this.addOrderStatRow(ans);
                    if (ans.ret_code !== 0) {
                        let rowLog = this.logTable.newRow();
                        rowLog.cells[0].Text = this.getNowDate("time", false);
                        rowLog.cells[1].Text = "订单ID = " + ans.chronos_order.order_ref + ",消息 = " + ans.message;
                    }
                    this.dialog = null;
                }
            }
        });
        // 撤单
        this.tradePoint.addSlot({
            service: ServiceType.kCOMS,
            msgtype: COMS_MSG.kMtFCancelOrderAns,
            callback: (msg) => {
                if (msg !== undefined) {
                    let ans = new CancelOrderAns();
                    ans.fromBuffer(msg);
                    if (ans.ret_code !== 0) {
                        let rowLog = this.logTable.newRow();
                        rowLog.cells[0].Text = this.getNowDate("time", false);
                        rowLog.cells[1].Text = "订单ID = " + ans.order_ref + ",消息 = " + ans.ret_msg;
                        this.ref.detectChanges();
                    }
                }
            }
        });

        this.tradePoint.addSlotOfCMS("getAssetAccount", (res) => {
            // 查询资产账户
            let data = JSON.parse(res.toString());
            if (data.msret.msgcode !== "00") {
                let rowLog = this.logTable.newRow();
                rowLog.cells[0].Text = this.getNowDate("time", false);
                rowLog.cells[1].Text = "getAssetAccount:msgcode = " + data.msret.msgcode + "; msg = " + data.msret.msg;
                return;
            }
            if (data.body.length === 0) {
                return;
            }
            data.body.forEach((item, index) => {
                // 查询资金
                this.acidObj[item.acid] = item.acname;
                let fund = new QueryFund();
                fund.portfolio_id = 0;
                fund.fund_account_id = parseInt(item.acid);
                this.tradePoint.send(COMS_MSG.kMtFQueryFund, fund.toBuffer(), ServiceType.kCOMS);
                // 查询仓位
                let position = new QueryPosition();
                position.query_position.portfolio_id = 0;
                position.query_position.fund_account_id = parseInt(item.acid);
                this.tradePoint.send(COMS_MSG.kMtFQueryPosition, position.toBuffer(), ServiceType.kCOMS);
                // 查询订单
                let queryOrder = new QueryOrder();

                queryOrder.portfolio_id = 0;     // u8 组合ID
                queryOrder.fund_account_id = item.acid;  // ========u8 资金账户ID
                queryOrder.order_id = 0;   // u8 订单ID
                queryOrder.order_ref = 0; // u8
                queryOrder.term_id = 0;  // u4
                this.tradePoint.send(COMS_MSG.kMtFQueryOrder, queryOrder.toBuffer(), ServiceType.kCOMS);
            });
        }, this);

        this.tradePoint.addSlotOfCMS("getTradeAccount", (res) => {
            // 查询交易账户
            let data = JSON.parse(res.toString());
            if (data.msret.msgcode !== "00") {
                let rowLog = this.logTable.newRow();
                rowLog.cells[0].Text = this.getNowDate("time", false);
                rowLog.cells[1].Text = "getTradeAccount:msgcode = " + data.msret.msgcode + "; msg = " + data.msret.msg;
                return;
            }
            if (data.body.length === 0) {
                return;
            }
            data.body.forEach(item => {
                item.caname = this.acidObj[item.acid];
                let row = this.tradeAccountTable.newRow();
                row.cells[0].Text = item.caname;
                row.cells[1].Text = item.marketid;
                row.cells[2].Text = this.coms_hedgeFlagType[item.hedgeflag];
                row.cells[3].Text = item.trcode;
                row.cells[4].Text = item.tracname;
                row.cells[5].Text = this.currency_type[item.currencyid];
                row.cells[6].Text = item.chid;
                row.cells[7].Text = item.creator;
                row.cells[8].Text = item.createtime;
                row.cells[9].Text = item.stat === 1 ? "可用" : "不可用";
            });
        }, this);
        // 推送OrderPush
        this.tradePoint.addSlot({
            service: ServiceType.kCOMS,
            msgtype: COMS_MSG.kMtFOrderPush,
            callback: (msg) => {
                if (msg !== undefined) {
                    let ans = new OrderPush();
                    ans.fromBuffer(msg);
                    let changeOrderIndex;
                    let changeOrderfinishIndex;
                    let changeFundIndex;
                    let changePositionIndex;
                    let isExistOrder = this.orderStatTable.rows.some((item, index) => {
                        let flag = item.cells[1].Data + "" + item.cells[1].Text;
                        let changeFlag = ans.order_status.chronos_order.term_id + "" + ans.order_status.chronos_order.order_ref;
                        if (flag === changeFlag) {
                            changeOrderIndex = index;
                        }
                        return flag === changeFlag;
                    });
                    if (!isExistOrder) {
                        this.orderStateList.push(ans.order_status);
                        this.addOrderStatRow(ans.order_status);
                    } else {
                        this.addOrderStatRow(ans.order_status, this.orderStatTable.rows[changeOrderIndex]);
                    }
                    let isExistOrderfinish = this.finishOrderTable.rows.some((item, index) => {
                        let flag = item.cells[0].Data + "" + item.cells[0].Text;
                        let changeFlag = ans.order_status.chronos_order.term_id + "" + ans.order_status.chronos_order.order_ref;
                        if (flag === changeFlag) {
                            changeOrderfinishIndex = index;
                        }
                        return flag === changeFlag;
                    });
                    if (!isExistOrderfinish) {
                        this.addFinishOrderRow(ans.order_status);
                    } else {
                        this.addFinishOrderRow(ans.order_status, this.finishOrderTable.rows[changeOrderfinishIndex]);
                    }
                    let isExistFund = this.fundAccountTable.rows.some((item, index) => {
                        let flag = item.cells[0].Data.id + "" + item.cells[0].Data.currency;
                        let changeFlag = ans.fund.fund_account_id + "" + ans.fund.currency;
                        if (flag === changeFlag) {
                            changeFundIndex = index;
                        }
                        return flag === changeFlag;
                    });
                    if (!isExistFund) {
                        this.addFundAccountRow(ans.fund);
                    } else {
                        this.addFundAccountRow(ans.fund, this.fundAccountTable.rows[changeFundIndex]);
                    }
                    for (let i = 0; i < ans.pos_count; i++) {
                        let isExistPosition = this.positionTable.rows.some((item, index) => {
                            let flag = item.cells[0].Data.ukey + "" + item.cells[0].Data.direction + "" + item.cells[0].Data.trade_account_id + "" + item.cells[0].Data.sa_type;
                            let changeFlag = ans.postions[i].ukey + "" + ans.postions[i].direction + "" + ans.postions[i].trade_account_id + "" + ans.postions[i].sa_type;
                            if (flag === changeFlag) {
                                changePositionIndex = index;
                            }
                            return flag === changeFlag;
                        });
                        if (!isExistPosition) {
                            this.addPositionRow(ans.postions[i]);
                        } else {
                            this.addPositionRow(ans.postions[i], this.positionTable.rows[changePositionIndex]);
                        }
                    }
                }
            }
        });
        this.tradePoint.onTopic(4101, (key, dataObj) => {
            let data = JSON.parse(dataObj.toString());
            if (data.msret.msgcode !== "00") {
                let rowLog = this.logTable.newRow();
                rowLog.cells[0].Text = this.getNowDate("time", false);
                rowLog.cells[1].Text = "获取产品信息推送： " + " msg = " + data.msret.msg;
                return;
            }
            let productData = data.body[0];
            if (this.profitAndLossTable.rows.length === 0)
                this.addProfitAndLossRow(productData);
            else
                this.addProfitAndLossRow(productData, this.profitAndLossTable.rows[0]);
            console.log(data);
        });
        this.tradePoint.addSlot({
            service: 41,
            msgtype: 11005,
            callback: (msg) => {
                console.log("===============" + new Date());
                let data = JSON.parse(msg.toString());
                if (data.msret.msgcode !== "00") {
                    let rowLog = this.logTable.newRow();
                    rowLog.cells[0].Text = this.getNowDate("time", false);
                    rowLog.cells[1].Text = "获取产品信息： " + " msg = " + data.msret.msg;
                    return;
                }
                let productData = data.body[0];
                if (this.profitAndLossTable.rows.length === 0)
                    this.addProfitAndLossRow(productData);
                else
                    this.addProfitAndLossRow(productData, this.profitAndLossTable.rows[0]);
                console.log(data);
            }
        });
        // 产品净值

        // this.productNetChart.addC

        this.tradePoint.addSlotOfCMS("getProductNet", (msg) => {
            let data = JSON.parse(msg.toString());
            if (data.msret.msgcode !== "00") {
                let rowLog = this.logTable.newRow();
                rowLog.cells[0].Text = this.getNowDate("time", false);
                rowLog.cells[1].Text = "getProductNet:msgcode = " + data.msret.msgcode + "; msg = " + data.msret.msg;
                return;
            }
            let productNetChangeOpt = {
                title: { text: "" },
                xAxis: [{ data: [] }],
                series: [{ data: [] }]
            };
            this.productNetData = data.body;
            if (data.body.length === 0) {
                return;
            }
            if (this.productNetData.length > 0) {
                this.productNetData.forEach(item => {
                    productNetChangeOpt.xAxis[0].data.push(item.trday);
                    productNetChangeOpt.title.text = item.caname;
                    productNetChangeOpt.series[0].data.push(item.netvalue);
                });
                productNetPage.onClick = () => {
                    setTimeout(() => {
                        this.productNetChart.setOption(productNetChangeOpt);
                    }, 500);
                };
            }
        }, this);
        btn_clear.OnClick = () => {
            this.dialog = null;
        };
        btn_submit.OnClick = () => {
            let sendOrder = new SendOrder();
            sendOrder.order_ref = Math.round(new Date().getTime() / 1000);   // u8  客户端订单ID+term_id = 唯一
            sendOrder.ukey = this.txt_UKey.Text;        // u8  Universal Key
            sendOrder.directive = this.dd_Action.SelectedItem.Value;   // u4 委托指令：普通买入，普通卖出
            sendOrder.offset_flag = 0; // u4 开平方向：开仓、平仓、平昨、平今
            sendOrder.hedge_flag = 0;  // u4 投机套保标志：投机、套利、套保
            sendOrder.execution = 0;   // u4 执行类型： 限价0，市价
            sendOrder.order_date = Number(this.getNowDate());  // u4 委托时间yymmdd
            sendOrder.order_time = Number(this.getNowDate("time"));  // u4 委托时间hhmmss
            sendOrder.portfolio_id = 0;     // u8 组合ID
            sendOrder.fund_account_id = this.dd_Account.SelectedItem ? this.dd_Account.SelectedItem.Value : 0;  // u8 资金账户ID
            sendOrder.trade_account_id = 0; // u8 交易账户ID

            sendOrder.strategy_id = 0;     // u4 策略ID
            sendOrder.trader_id = 0;        // u4 交易员ID
            sendOrder.term_id = this.term_id;          // u4 终端ID
            sendOrder.qty = Number(this.txt_Volume.Text);    // 8 委托数量
            sendOrder.price = this.txt_Price.Text * 10000;  // 8 委托价格
            sendOrder.property = 0;        // 4 订单特殊属性，与实际业务相关(０:正常委托单，１+: 补单)
            sendOrder.currency = 0;        // 4 报价货币币种
            sendOrder.algor_id = 0;		// 8 策略算法ID
            sendOrder.reserve = 0;			// 4 预留(组合offset_flag)

            this.tradePoint.send(COMS_MSG.kMtFSendOrder, sendOrder.toBuffer(), ServiceType.kCOMS);
        };
    }

    registryListeners() {
        this.tradePoint.addSlot(
            {
                service: ServiceType.kFGS,
                msgtype: FGS_MSG.kFGSAns,
                callback: (msg) => {
                    console.info(msg.toString());
                }
            }, {
                service: ServiceType.kLogin,
                msgtype: FGS_MSG.kLoginAns,
                callback: (msg) => {
                    this.tradePoint.sendToCMS("getProductNet", JSON.stringify({ data: { head: { userid: this.userId }, body: { caid: this.productId } } }));
                    this.tradePoint.sendToCMS("getAssetAccount", JSON.stringify({
                        // 查询资产账户
                        data: {
                            head: { userid: this.userId },
                            body: { caid: this.productId }
                        }
                    }));
                    this.tradePoint.sendToCMS("getTradeAccount", JSON.stringify({
                        // 查询交易账户
                        data: {
                            head: { userid: this.userId },
                            body: { caid: this.productId }
                        }
                    }));
                    console.log("===============" + new Date());
                    this.tradePoint.send(11005, JSON.stringify({
                        data: {
                            head: { userid: this.userId, reqsn: 1 },
                            body: { caid: this.productId }
                        }
                    }), 41);
                    this.tradePoint.subscribe(4101, [Number(this.productId)]);
                }
            });
    }
    addOrderStatRow(ans, nowRow?) {
        let stockSecuinfo = this.secuinfo.getSecuinfoByUKey(ans.chronos_order.ukey);
        let row;
        if (nowRow) {
            row = nowRow;
        } else {
            row = this.orderStatTable.newRow();
        }
        row.cells[0].Type = "checkbox";
        if (ans.status === 5 || ans.status === 6 || ans.status === 8 || ans.status === 9 || ans.status === 40) {
            row.cells[0].Disable = true;
            row.cells[0].Text = false;
        }
        row.cells[1].Text = ans.chronos_order.order_ref;
        row.cells[1].Data = ans.chronos_order.term_id;
        row.cells[2].Text = ans.chronos_order.ukey;
        if (stockSecuinfo[ans.chronos_order.ukey] !== undefined) {
            row.cells[3].Text = stockSecuinfo[ans.chronos_order.ukey].SecuCode;
            row.cells[4].Text = stockSecuinfo[ans.chronos_order.ukey].SecuAbbr;
        }
        row.cells[5].Text = ans.chronos_order.price / 10000;
        row.cells[6].Text = ans.chronos_order.qty;
        row.cells[7].Text = this.productFormatTime(ans.chronos_order.order_time);
        row.cells[8].Text = this.coms_directive[ans.chronos_order.directive];
        row.cells[9].Text = this.coms_statusType[ans.status];
        row.cells[9].Data = ans.status;
        this.ref.detectChanges();
    }
    addFinishOrderRow(ans, nowRow?) {
        let stockSecuinfo = this.secuinfo.getSecuinfoByUKey(ans.chronos_order.ukey);
        if (ans.status === 8) {
            let rowFinish;
            if (nowRow) {
                rowFinish = nowRow;
            } else {
                rowFinish = this.finishOrderTable.newRow();
            }
            rowFinish.cells[0].Data = ans.chronos_order.term_id;
            rowFinish.cells[0].Text = ans.chronos_order.order_ref;
            rowFinish.cells[1].Text = ans.chronos_order.ukey;
            if (stockSecuinfo[ans.chronos_order.ukey] !== undefined) {
                rowFinish.cells[2].Text = stockSecuinfo[ans.chronos_order.ukey].SecuCode;
                rowFinish.cells[3].Text = stockSecuinfo[ans.chronos_order.ukey].SecuAbbr;
            }
            rowFinish.cells[4].Text = ans.chronos_order.price / 10000;
            rowFinish.cells[5].Text = ans.chronos_order.qty;
            rowFinish.cells[6].Text = this.productFormatTime(ans.chronos_order.order_time);
            rowFinish.cells[7].Text = this.coms_directive[ans.chronos_order.directive];
            rowFinish.cells[8].Text = this.coms_statusType[ans.status];
            rowFinish.cells[9].Text = ans.trade_amt / 10000; // 成交金额
            rowFinish.cells[10].Text = ans.trade_qty;
            rowFinish.cells[11].Text = this.productFormatTime(ans.trade_time);
            rowFinish.cells[12].Text = this.coms_orderType[ans.chronos_order.property]; // "订单类型";
        }
        this.ref.detectChanges();
    }
    addPositionRow(ans, nowRow?) {
        let stockSecuinfo = this.secuinfo.getSecuinfoByUKey(ans.ukey);
        let row;
        if (nowRow) {
            row = nowRow;
        } else {
            if (ans.sa_type !== 1) {
                return 0;
            }
            row = this.positionTable.newRow();
        }
        row.cells[0].Text = ans.ukey;
        row.cells[0].Data = {
            ukey: ans.ukey,
            direction: ans.direction,
            trade_account_id: ans.trade_account_id,
            sa_type: ans.sa_type
        };
        if (stockSecuinfo[ans.ukey] !== undefined) {
            row.cells[1].Text = stockSecuinfo[ans.ukey].SecuCode;
        }
        row.cells[2].Text = ans.total_qty; // "持仓量"; total_qty
        row.cells[3].Text = ans.avl_qty; // "可卖量"; avl_qty
        row.cells[4].Text = ans.avl_cre_redemp_qty;
        row.cells[5].Text = ans.onway_qty;
        row.cells[6].Text = ans.total_cost; // "持仓成本";
        row.cells[7].Text = ans.today_open_qty; // "今开仓量";
        row.cells[8].Text = this.coms_positionType[ans.direction];
        this.ref.detectChanges();
    }
    addFundAccountRow(ans, nowRow?) {
        let row;
        if (nowRow) {
            row = nowRow;
        } else {
            row = this.fundAccountTable.newRow();
        }
        row.cells[0].Text = this.currency_type[ans.currency]; // 币种
        row.cells[0].Data = { id: ans.fund_account_id, currency: ans.currency };
        row.cells[1].Text = ans.total_amt;
        row.cells[2].Text = ans.avl_amt;
        row.cells[3].Text = ans.total_margin;
        row.cells[4].Text = ans.buy_margin;
        row.cells[5].Text = ans.sell_margin;
        row.cells[6].Text = ans.fee;
        row.cells[7].Text = ans.position_pl;
        row.cells[8].Text = ans.close_pl;
        this.dd_Account.addItem({ Text: this.acidObj[ans.fund_account_id], Value: ans.fund_account_id });
        this.ref.detectChanges();
    }

    addProfitAndLossRow(productData, nowRow?) {
        let row;
        if (nowRow) {
            row = nowRow;
        } else {
            row = this.profitAndLossTable.newRow();
        }
        row.cells[0].Text = productData.totalamt;
        row.cells[1].Text = productData.validamt;
        row.cells[2].Text = productData.frozenamt;
        row.cells[3].Text = productData.loan;
        row.cells[4].Text = productData.fee;
        row.cells[5].Text = productData.subject_amount;
        row.cells[6].Text = productData.validloan;
        row.cells[7].Text = productData.stockloan;
        row.cells[8].Text = productData.stockvalue;
        row.cells[9].Text = productData.totalmargin;
        row.cells[10].Text = productData.buymargin;
        row.cells[11].Text = productData.sellmargin;
        row.cells[12].Text = productData.hold_closepl;
        row.cells[13].Text = productData.hold_posipl;
        row.cells[14].Text = productData.mtm_closepl;
        row.cells[15].Text = productData.mtm_posipl;
        row.cells[16].Text = productData.stock_value;
        row.cells[17].Text = productData.futures_value;
        row.cells[18].Text = productData.stock_validamt;
        row.cells[19].Text = productData.futures_validamt;
        row.cells[20].Text = productData.spifCap;
        row.cells[21].Text = productData.commodityFuturesCap;
        row.cells[22].Text = productData.risk_exposure;
        row.cells[23].Text = productData.commodityFuturesNetting;
        this.ref.detectChanges();
    }
    addZero(num) {
        if (num < 10)
            return "0" + num;
        else
            return num;
    }
    getNowDate(type?, isNumber?) {
        let d = new Date();
        let y = d.getFullYear();
        let m = this.addZero(d.getMonth() + 1);
        let day = this.addZero(d.getDate());
        let h = this.addZero(d.getHours());
        let minus = this.addZero(d.getMinutes());
        let sec = this.addZero(d.getSeconds());
        let millisec = d.getMilliseconds();
        if (type === "time") {
            if (isNumber === false) {
                return h + ":" + minus + ":" + sec + "." + millisec;
            }
            return h + "" + minus + "" + sec + "" + millisec;
        }
        else
            return y + "" + m + "" + day;

    }
    productFormatTime(num, type?) {
        num = num + "";
        if (num.length === 8) {
            num = "0" + num;
        }
        return num.slice(0, 2) + ":" + num.slice(2, 4) + ":" + num.slice(4, 6) + ":" + num.slice(6);
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
                        data: [0]
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
                        data: [0],
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
        };
    }
}