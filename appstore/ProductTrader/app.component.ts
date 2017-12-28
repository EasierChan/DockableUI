/**
 * created by cl, 2017/05/19
 * update: [date]
 * desc: show loopback test.
 */

import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import {
    VBox, HBox, DropDown, DropDownItem, Button, DataTable, Label, TabPanel, TabPage, ChartViewer, TextBox, DockContainer, Splitter,
    Dialog, Section, EChart, MetaControl, BookViewer
} from "../../base/controls/control";
import { QtpService } from "../../base/api/services/qtp.service";
import { IP20Service } from "../../base/api/services/ip20.service";
import { AppStateCheckerRef, Environment, AppStoreService, TranslateService, SecuMasterService } from "../../base/api/services/backend.service";
import { ServiceType, FGS_MSG } from "../../base/api/model/qtp/message.model";
import { QueryFund, QueryPosition, COMS_MSG, QueryFundAns, QueryPositionAns, SendOrder, QueryOrder, QueryOrderAns, SendOrderAns, CancelOrder, CancelOrderAns } from "../../base/api/model/qtp/coms.model";
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
    private dd_Action: any;
    private txt_UKey: any;
    private txt_Symbol: any;
    private txt_Price: any;
    private txt_Volume: any;
    coms_directive: any = {};
    coms_statusType: any = {};

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

        this.coms_directive = {
            1: "买",          // 普通买
            2: "卖" // 普通卖
            // kDtLoanBuy = 3,           // 融资买入
            // kDtMarginSell = 4,        // 融券卖出(预约券)
            // kDtMarketMarginSell = 5,  // 融券卖出(市场券)
            // kDtBuyPayback = 6,        // 买券还券
            // kDtResvBuyPayback = 7,    // 买券还券（预约券）
            // kDtMarketBuyPayback = 8,  // 买券还券（市场券）
            // kDtSecPayback = 9,        // 现券还券
            // kDtResvSecPayback = 10,   // 现券还券(预约券)
            // kDtMarketSecPayback = 11, // 现券还券(市场券)
            // kDtCashRepay = 12,        // 现金还款
            // kDtSellPayBack = 13,      // 卖券还款
            // kDtGuaranteeTransfer = 14, // 担保品划转
            // kDtApplyParch = 15,       // 申购
            // kDtRedemption = 16,       // 赎回
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
            "40": "废单"
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
        this.dd_Action.addItem({ Text: buyRtn, Value: 0 });
        this.dd_Action.addItem({ Text: sellRtn, Value: 1 });
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
        // this.tradePage.setContent(this.viewContentPop);

        // 非弹框内容
        let viewContent = new VBox();
        let panel = new TabPanel();
        // let profitAndLossPage = new TabPage("profitAndLossPage", "盈亏");
        // let profitAndLossContent = new VBox();
        // this.profitAndLossTable = new DataTable("table2");
        // this.profitAndLossTable.height = 200;
        // this.profitAndLossTable.RowIndex = false;
        // ["UKEY", "Code", "AvgPrice(B)", "AvgPrice(S)",
        //     "PositionPnl", "TradingPnl", "IntraTradingFee", "TotalTradingFee", "LastTradingFee", "LastPosPnl",
        //     "TodayPosPnl", "TotalPnl", "LastPosition", "TodayPosition", "LastClose", "MarketPrice", "IOPV"].forEach(item => {
        //         this.profitAndLossTable.addColumn(this.langServ.get(item));
        //     });
        // profitAndLossContent.addChild(this.profitAndLossTable);
        // profitAndLossPage.setContent(profitAndLossContent);
        // panel.addTab(profitAndLossPage, false);
        // panel.setActive("profitAndLossPage");

        let positionPage = new TabPage("productPosition", "仓位");
        let positionContent = new VBox();
        let totalProfitRow = new HBox();
        this.txt_totalProfit = new TextBox();
        this.txt_totalProfit.Title = "总盈亏: ";
        this.txt_totalProfit.Text = 0.04;
        this.txt_totalProfit.Left = 85;
        this.txt_totalProfit.Width = 85;
        totalProfitRow.addChild(this.txt_totalProfit);
        this.txt_holdProfit = new TextBox();
        this.txt_holdProfit.Title = "总持仓盈亏: ";
        this.txt_holdProfit.Text = 0.04;
        this.txt_holdProfit.Left = 85;
        this.txt_holdProfit.Width = 85;
        totalProfitRow.addChild(this.txt_holdProfit);
        this.txt_todayHoldProfit = new TextBox();
        this.txt_todayHoldProfit.Title = "当日总持仓盈亏: ";
        this.txt_todayHoldProfit.Text = 0.04;
        this.txt_todayHoldProfit.Left = 85;
        this.txt_todayHoldProfit.Width = 85;
        totalProfitRow.addChild(this.txt_todayHoldProfit);
        this.txt_todayProfit = new TextBox();
        this.txt_todayProfit.Title = "当日盈亏: ";
        this.txt_todayProfit.Text = 0.04;
        this.txt_todayProfit.Left = 85;
        this.txt_todayProfit.Width = 85;
        totalProfitRow.addChild(this.txt_todayProfit);
        positionContent.addChild(totalProfitRow);
        this.positionTable = new DataTable("table2");
        this.positionTable.height = 200;
        this.positionTable.RowIndex = false;
        ["secucategory", "UKEY", "Code", "TotalQty", "AvlQty", "AvlCreRedempVol", "WorkingQty",
            "TotalCost", "TodayOpen", "AvgPrice", "Type"].forEach(item => {
                this.positionTable.addColumn(this.langServ.get(item));
            });

        positionContent.addChild(this.positionTable);

        positionPage.setContent(positionContent);
        panel.addTab(positionPage, false);
        panel.setActive("productPosition");

        let productNetPage = new TabPage("productNetViewer", "净值");
        let productNetContent = new VBox();
        this.productNet = new Section();
        this.productNetChart = new ChartViewer();
        this.productNetChart.setOption(this.createProductNetChart());
        this.productNetChart.onInit = (chart: ECharts) => {
            setTimeout(() => {
                chart.setOption(this.createProductNetChart());
            }, 1000);
        };
        productNetContent.addChild(this.productNetChart);
        productNetPage.setContent(productNetContent);
        panel.addTab(productNetPage, false);

        let orderStatPage = new TabPage("orderStatViewer", "订单状态");
        let orderStatContent = new VBox();
        this.orderStatTable = new DataTable("table2");
        this.orderStatTable.height = 200;
        this.orderStatTable.RowIndex = false;
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
        this.fundAccountTable.addColumn("Index", "币种", "出金", "入金", "资金余额", "交易可用金额", "交易可用金额", "可用融资余额", "融资金额", "融券金额", "总保证金", "买保证金", "卖保证金", "手续费", "持仓平仓盈亏");
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
        viewContent.addChild(panel);



        let Market = new TabPage("MarketId", "行情");
        let MarketCon = new VBox();
        MarketCon.MinHeight = 200;
        let panel2 = new TabPanel();
        let bookviewer = new BookViewer(this.langServ);
        bookviewer.onCellDBClick = (item, cellIndex, rowIndex, row) => {
            this.txt_UKey.Text = bookviewer.ukey;
            // console.log(this.dd_Account.SelectedItem.Value);
            this.txt_Price.Text = row.cells[1].Text;
            Dialog.popup(this, this.viewContentPop, { title: this.langServ.get("Trade"), height: 300 });
        };
        // bookviewer.
        this.quote.send(17, 101, { topic: 3112, kwlist: bookviewer.ukey });
        MarketCon.addChild(bookviewer);
        Market.setContent(MarketCon);
        panel2.addTab(Market, false);
        panel2.setActive("MarketId");

        this.main = new DockContainer(null, "v", window.innerWidth, window.innerHeight);
        this.main.addChild(new DockContainer(this.main, "h", null, window.innerHeight / 2).addChild(viewContent));
        this.main.addChild(new Splitter("h", this.main));
        this.main.addChild(new DockContainer(this.main, "h", null, window.innerHeight - window.innerHeight / 2).addChild(panel2));

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
                    let ans = new QueryFundAns();
                    ans.fromBuffer(msg);
                    let row = this.fundAccountTable.newRow();
                    row.cells[0].Text = ans.avl_amt;
                    row.cells[1].Text = ans.avl_financing_amt;
                    row.cells[2].Text = ans.buy_margin;
                    row.cells[3].Text = ans.close_pl;
                    row.cells[4].Text = ans.currency;
                    row.cells[5].Text = ans.fee;
                    row.cells[6].Text = ans.financing_amt;
                    row.cells[7].Text = ans.fromBuffer;
                    row.cells[8].Text = ans.frozen_amt;
                    row.cells[9].Text = ans.fromBuffer;
                    row.cells[10].Text = ans.frozen_amt;
                    row.cells[11].Text = ans.fund_account_id;
                    row.cells[12].Text = ans.loan_amt;
                    console.log(ans);
                }
            }
        });
        // 查询仓位
        this.tradePoint.addSlot({
            service: ServiceType.kCOMS,
            msgtype: COMS_MSG.kMtFQueryPositionAns,
            callback: (msg) => {
                if (msg !== undefined) {
                    let ans = new QueryPositionAns();
                    ans.fromBuffer(msg);
                    let row = this.positionTable.newRow();
                    row.cells[0].Text = ans.avl_cre_redemp_qty;
                    row.cells[1].Text = ans.avl_qty;
                    row.cells[2].Text = ans.close_pl;
                    row.cells[3].Text = ans.covered_frz_qty;
                    row.cells[4].Text = ans.direction;
                    row.cells[5].Text = ans.fund_account_id;
                    row.cells[6].Text = ans.hedge_flag;
                    row.cells[7].Text = ans.locked_avl_qty;
                    row.cells[8].Text = ans.locked_onway_qty;
                    row.cells[9].Text = ans.mtm_close_pl;
                    row.cells[10].Text = ans.mtm_total_cost;
                    console.log(ans);
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
                        offset += ans.fromBuffer(msg, offset);

                        let row = this.orderStatTable.newRow();
                        // row.cells[0].Text = ans.query_orderAns.approver_id;
                        row.cells[1].Text = ans.query_orderAns.order_id;
                        row.cells[2].Text = ans.query_orderAns.chronos_order.ukey;
                        row.cells[3].Text = "证券代码";
                        row.cells[4].Text = "证券名称";
                        row.cells[5].Text = ans.query_orderAns.chronos_order.price / 10000;
                        row.cells[6].Text = ans.query_orderAns.chronos_order.qty;
                        row.cells[7].Text = ans.query_orderAns.chronos_order.order_date + " " + ans.query_orderAns.chronos_order.order_time;
                        row.cells[8].Text = this.coms_directive[ans.query_orderAns.chronos_order.directive];
                        row.cells[9].Text = this.coms_statusType[ans.query_orderAns.status];

                        let rowFinish = this.finishOrderTable.newRow();
                        rowFinish.cells[0].Text = ans.query_orderAns.order_id;
                        rowFinish.cells[1].Text = ans.query_orderAns.chronos_order.ukey;
                        rowFinish.cells[2].Text = "证券代码";
                        rowFinish.cells[3].Text = "证券名称";
                        rowFinish.cells[4].Text = ans.query_orderAns.chronos_order.price / 10000;
                        rowFinish.cells[5].Text = ans.query_orderAns.chronos_order.qty;
                        rowFinish.cells[6].Text = ans.query_orderAns.chronos_order.order_date + " " + ans.query_orderAns.chronos_order.order_time;
                        rowFinish.cells[7].Text = this.coms_directive[ans.query_orderAns.chronos_order.directive];
                        rowFinish.cells[8].Text = this.coms_statusType[ans.query_orderAns.status];
                        rowFinish.cells[9].Text = ans.query_orderAns.trade_amt / 10000; // 成交金额
                        rowFinish.cells[10].Text = ans.query_orderAns.trade_qty;
                        rowFinish.cells[11].Text = ans.query_orderAns.trade_date + ":" + ans.query_orderAns.trade_time;
                        rowFinish.cells[12].Text = "订单类型";

                        console.log(ans);
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
                    // ans.fromBuffer(msg);
                    if (ans.send_orderAns.ret_code === 0) {
                        this.dialog = null;
                    }
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
                    console.log(ans);
                }


            }
        });

        this.tradePoint.addSlotOfCMS("getAssetAccount", (res) => {
            // 查询资产账户
            let data = JSON.parse(res.toString());
            if (data.msret.msgcode !== "00") {
                alert("getAssetAccount:msgcode = " + data.msret.msgcode + "; msg = " + data.msret.msg);
                return;
            }
            if (data.body.length === 0) {
                return;
            }
            data.body.forEach((item, index) => {
                this.dd_Account.addItem({ Text: item.acname, Value: item.acid });
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
                queryOrder.chronos_order.order_ref = 0;   // u8  客户端订单ID+term_id = 唯一
                queryOrder.chronos_order.ukey = 0;        // u8  Universal Key
                queryOrder.chronos_order.directive = 0;   // u4 委托指令：普通买入，普通卖出
                queryOrder.chronos_order.offset_flag = 0; // u4 开平方向：开仓、平仓、平昨、平今
                queryOrder.chronos_order.hedge_flag = 0;  // u4 投机套保标志：投机、套利、套保
                queryOrder.chronos_order.execution = 0;   // u4 执行类型： 限价0，市价
                queryOrder.chronos_order.order_date = this.getNowDate();  // u4 委托时间yymmdd
                queryOrder.chronos_order.order_time = this.getNowDate("time");  // u4 委托时间hhmmss
                queryOrder.chronos_order.portfolio_id = 0;     // u8 组合ID
                queryOrder.chronos_order.fund_account_id = item.acid;  // ========u8 资金账户ID
                queryOrder.chronos_order.trade_account_id = 0; // u8 交易账户ID

                queryOrder.chronos_order.strategy_id = 0;     // u4 策略ID
                queryOrder.chronos_order.trader_id = 0;        // u4 交易员ID
                queryOrder.chronos_order.term_id = this.term_id;          // u4 终端ID
                queryOrder.chronos_order.qty = 0;    // 8 委托数量
                queryOrder.chronos_order.price = 0;  // 8 委托价格
                queryOrder.chronos_order.property = 0;        // 4 订单特殊属性，与实际业务相关(０:正常委托单，１+: 补单)
                queryOrder.chronos_order.currency = 0;        // 4 报价货币币种
                queryOrder.chronos_order.algor_id = 0;		// 8 策略算法ID
                queryOrder.chronos_order.reserve = 0;			// 4 预留(组合offset_flag)
                queryOrder.order_id = 0;   // 8 订单ID

                queryOrder.cancelled_qty = 0;    // 8 已撤数量
                queryOrder.queued_qty = 0;       // 8 已确认？
                queryOrder.trade_qty = 0;        // 8 已成交数量
                queryOrder.trade_amt = 0;        // 8 已成交金额*10000（缺省值）
                queryOrder.trade_date = 0;      // 4 最后成交时间
                queryOrder.trade_time = 0;      // 4 最后成交时间
                queryOrder.approver_id = 0;     // 4 审批人ID
                queryOrder.status = 0;          // 4 订单状态
                queryOrder.ret_code = 0;        // 4
                queryOrder.broker_sn = "";    // 32 券商单号
                queryOrder.message = "";      // 128 附带消息，如错误消息等
                this.tradePoint.send(COMS_MSG.kMtFQueryOrder, queryOrder.toBuffer(), ServiceType.kCOMS);
            });
            let cancelOrder = new CancelOrder();
            cancelOrder.order_ref = 0;
            cancelOrder.order_ref = 0;  // u8 撤单的客户端订单编号
            cancelOrder.order_id = 0;   // u8 撤单订单编号
            cancelOrder.trader_id = 0;  // u8 撤单交易员ID/交易账户id
            cancelOrder.term_id = this.term_id;    // u4 终端ID
            cancelOrder.order_date = 0;  // u4 撤单时间yymmdd
            cancelOrder.order_time = 0; // u4 撤单时间hhmmss
            // this.tradePoint.send(COMS_MSG.kMtFCancelOrder, cancelOrder.toBuffer(), ServiceType.kCOMS);
        }, this);

        this.tradePoint.addSlotOfCMS("getTradeAccount", (res) => {
            // 查询交易账户
            let data = JSON.parse(res.toString());
            if (data.msret.msgcode !== "00") {
                alert("getTradeAccount:msgcode = " + data.msret.msgcode + "; msg = " + data.msret.msg);
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
                row.cells[2].Text = item.hedgeflag;
                row.cells[3].Text = item.trcode;
                row.cells[4].Text = item.tracname;
                row.cells[5].Text = item.currencyid;
                row.cells[6].Text = item.chid;
                row.cells[7].Text = item.creator;
                row.cells[8].Text = item.createtime;
                row.cells[9].Text = item.stat;
            });
            console.log(data);
        }, this);
        // 产品净值

        // this.productNetChart.addC

        this.tradePoint.addSlotOfCMS("getProductNet", (msg) => {
            let data = JSON.parse(msg.toString());
            if (data.msret.msgcode !== "00") {
                alert("getProductNet:msgcode = " + data.msret.msgcode + "; msg = " + data.msret.msg);
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
                // this.productNetChart.setOption(productNetChangeOpt);
            }
        }, this);

        btn_clear.OnClick = () => {
            this.dialog = null;
        };
        btn_submit.OnClick = () => {
            let sendOrder = new SendOrder();
            sendOrder.order_ref = new Date().getTime();   // u8  客户端订单ID+term_id = 唯一
            sendOrder.ukey = 0;        // u8  Universal Key
            sendOrder.directive = 1;   // u4 委托指令：普通买入，普通卖出
            sendOrder.offset_flag = 0; // u4 开平方向：开仓、平仓、平昨、平今
            sendOrder.hedge_flag = 0;  // u4 投机套保标志：投机、套利、套保
            sendOrder.execution = 0;   // u4 执行类型： 限价0，市价
            sendOrder.order_date = this.getNowDate();  // u4 委托时间yymmdd
            sendOrder.order_time = this.getNowDate("time");  // u4 委托时间hhmmss
            sendOrder.portfolio_id = 0;     // u8 组合ID
            sendOrder.fund_account_id = this.dd_Account.SelectedItem.Value;  // u8 资金账户ID
            sendOrder.trade_account_id = 0; // u8 交易账户ID

            sendOrder.strategy_id = 0;     // u4 策略ID
            sendOrder.trader_id = 0;        // u4 交易员ID
            sendOrder.term_id = this.term_id;          // u4 终端ID
            sendOrder.qty = this.txt_Volume.Text;    // 8 委托数量
            sendOrder.price = this.txt_Price.Text * 10000;  // 8 委托价格
            sendOrder.property = 0;        // 4 订单特殊属性，与实际业务相关(０:正常委托单，１+: 补单)
            sendOrder.currency = 0;        // 4 报价货币币种
            sendOrder.algor_id = 0;		// 8 策略算法ID
            sendOrder.reserve = 0;			// 4 预留(组合offset_flag)

            this.tradePoint.send(COMS_MSG.kMtFSendOrder, sendOrder.toBuffer(), ServiceType.kCOMS);

        };

    }
    addZero(num) {
        if (num < 10)
            return "0" + num;
        else
            return num;
    }
    getNowDate(type?) {
        let d = new Date();
        let y = d.getFullYear();
        let m = this.addZero(d.getMonth() + 1);
        let day = this.addZero(d.getDate());
        let h = this.addZero(d.getHours());
        let minus = this.addZero(d.getMinutes());
        let sec = this.addZero(d.getSeconds());
        let millisec = d.getMilliseconds();
        if (type === "time")
            return Number(h + "" + minus + "" + sec + "" + millisec);
        else
            return Number(y + "" + m + "" + day);

    }
    registryListeners() {
        this.tradePoint.addSlot({
            service: ServiceType.kLogin,
            msgtype: FGS_MSG.kLoginAns,
            callback: (msg) => {
                console.info(msg.toString());
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


            }
        });
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
                        data: [0, 1, 2, 3]
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
                        data: [0, 1, 2, 3],
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