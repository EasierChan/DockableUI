/**
 * created by cl, 2017/05/19
 * update: [date]
 * desc: show loopback test.
 */

import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import {
    VBox, HBox, DropDown, DropDownItem, Button, DataTable, Label, TabPanel, TabPage, ChartViewer, TextBox, DockContainer, Splitter,
    Dialog, Section
} from "../../base/controls/control";
import { QtpService } from "../../base/api/services/qtp.service";
import { AppStateCheckerRef, Environment, AppStoreService } from "../../base/api/services/backend.service";
import { ServiceType, FGS_MSG } from "../../base/api/model/qtp/message.model";
import { QueryFundAndPosition, COMS_MSG, QueryFundAns, QueryPositionAns, SendOrder, OrderStatus, CancelOrder, CancelOrderAns } from "../../base/api/model/qtp/coms.model";
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
        AppStoreService
    ]
})
export class AppComponent implements OnInit {
    private readonly apptype = "product-trader";
    main: DockContainer;
    dialog: Dialog;
    option: any;
    dd_tests: DropDown;
    txt_freeriskrate: TextBox;
    txt_security: TextBox;
    lbl_maxRetracementRatio: Label;
    lbl_sharpeRatio: Label;
    lbl_percentProfitable: Label;
    txt_pagesize: TextBox;
    txt_pageidx: TextBox;
    lbl_pagecount: Label;
    table: DataTable;
    fundAccountTable: DataTable;
    tradeAccountTable: DataTable;
    MarketTable: DataTable;
    chart: ChartViewer;
    worker: any;
    userId: any;
    productId: any;
    acidObj: any = {};
    productNetData: any;
    productNetChart: ECharts;
    productNet: Section;//产品净值

    constructor(private tradePoint: QtpService, private state: AppStateCheckerRef, private appSrv: AppStoreService) {
        this.state.onInit(this, this.onReady);
        this.state.onDestory(this, this.onDestroy);
    }

    onReady(option: any) {
        this.option = option;
        this.productId = this.option.productID;
        // this.qtp.connect(this.option.port, this.option.host);
    }

    onDestroy() {
    }

    ngOnInit() {
        this.userId = JSON.parse(AppStoreService.getLocalStorageItem(DataKey.kUserInfo)).user_id;
        let [addr, port] = this.appSrv.getSetting().endpoints[0].trade_addr.split(":");

        console.log('userid' + this.userId);
        console.log('this.productId:' + this.productId)


        let viewContentPop = new VBox();//弹框内容

        this.dd_tests = new DropDown();//下拉框
        this.dd_tests.Title = "Tests:";
        this.dd_tests.Left = 50;
        this.dd_tests.addItem({ Text: "--all--", Value: undefined });
        this.dd_tests.addItem({ Text: ServiceType.kCMS, Value: undefined });
        this.dd_tests.addItem({ Text: ServiceType.kCOMS, Value: undefined });

        let popRow1 = new HBox();//行
        popRow1.addChild(this.dd_tests);
        let lbl_mode = new Label();//文字快
        lbl_mode.Title = "Mode:";
        lbl_mode.Left = 10;
        lbl_mode.Width = 80;
        popRow1.addChild(lbl_mode);
        let lbl_speed = new Label();
        lbl_speed.Title = "Speed:";
        lbl_speed.Left = 10;
        lbl_speed.Width = 80;
        popRow1.addChild(lbl_speed);
        let lbl_duration = new Label();
        lbl_duration.Title = "Duration:";
        lbl_duration.Left = 10;
        popRow1.addChild(lbl_duration);
        let lbl_tick = new Label();
        lbl_tick.Title = "Tick:";
        lbl_tick.Left = 10;
        lbl_tick.Width = 80;
        popRow1.addChild(lbl_tick);
        viewContentPop.addChild(popRow1);

        let indicatorRow = new HBox();
        this.txt_freeriskrate = new TextBox();
        this.txt_freeriskrate.Title = "FreeRiskRate:";
        this.txt_freeriskrate.Text = 0.04;
        this.txt_freeriskrate.Left = 50;
        this.txt_freeriskrate.Width = 50;
        indicatorRow.addChild(this.txt_freeriskrate);
        this.lbl_maxRetracementRatio = new Label();
        this.lbl_maxRetracementRatio.Title = "MaxDrawdown:";
        this.lbl_maxRetracementRatio.Left = 10;
        this.lbl_sharpeRatio = new Label();
        this.lbl_sharpeRatio.Title = "Sharpe:";
        this.lbl_sharpeRatio.Left = 10;
        this.lbl_percentProfitable = new Label();
        this.lbl_percentProfitable.Title = "Winning:";
        this.lbl_percentProfitable.Left = 10;
        indicatorRow.addChild(this.lbl_maxRetracementRatio).addChild(this.lbl_sharpeRatio).addChild(this.lbl_percentProfitable);
        viewContentPop.addChild(indicatorRow);


        let viewContent = new VBox();//非弹框内容
        let panel = new TabPanel();
        let profitAndLossPage = new TabPage("profitAndLossPage", "盈亏");

        let detailContent = new HBox();
        detailContent.height = 500;
        let pagination = new HBox();
        pagination.align = "center";
        this.txt_pagesize = new TextBox();
        this.txt_pagesize.Left = 100;
        this.txt_pagesize.Title = "页面大小:";
        this.txt_pagesize.Text = 20;
        this.txt_pagesize.Width = 30;
        this.txt_pagesize.onChange = () => {
            this.worker.send({ command: "query", params: { id: this.dd_tests.SelectedItem.Value.id, begin: 0, end: parseInt(this.txt_pagesize.Text) } });
        };
        this.txt_pageidx = new TextBox();//分页
        this.txt_pageidx = new TextBox();
        this.txt_pageidx.Title = ",第";
        this.txt_pageidx.Text = 1;
        this.txt_pageidx.Width = 30;
        this.txt_pageidx.onChange = () => {
            let idx = parseInt(this.txt_pageidx.Text);
            let size = parseInt(this.txt_pagesize.Text);

            if (idx > 0) {
                this.worker.send({ command: "query", params: { id: this.dd_tests.SelectedItem.Value.id, begin: size * (idx - 1), end: size * idx } });
            }
        };

        this.lbl_pagecount = new Label();
        this.lbl_pagecount.Text = "页";
        pagination.addChild(this.txt_pagesize).addChild(this.txt_pageidx).addChild(this.lbl_pagecount);
        detailContent.addChild(pagination);
        this.table = new DataTable("table2");
        this.table.height = 200;
        this.table.RowIndex = false;
        this.table.addColumn("Index", "Orderid", "Date", "Account", "Innercode", "Status", "Time", "OrderPrice", "OrderVol", "DealPrice", "DealVol", "DealAmt", "B/S");
        for (let i = 0; i <= 10; i++) {
            let row = this.table.newRow();
            row.cells[0].Text = i;
            row.cells[1].Text = i;
        }


        detailContent.addChild(this.table);
        profitAndLossPage.setContent(detailContent);
        panel.addTab(profitAndLossPage, false);
        panel.setActive("profitAndLossPage");
        let positionPage = new TabPage("productPosition", "仓位");
        let positionContent = new HBox();
        positionContent.height = 500;
        positionContent.addChild(this.table);
        positionPage.setContent(positionContent);
        panel.addTab(positionPage, false);
        // panel.setActive("OrderDetail");

        let productNetPage = new TabPage("productNetViewer", "净值");
        let productNetContent = new VBox();
        productNetPage.setContent(productNetContent);
        panel.addTab(productNetPage, false);
        let orderStatPage = new TabPage("orderStatViewer", "订单状态");
        let orderStatContent = new VBox();
        orderStatPage.setContent(orderStatContent);
        panel.addTab(orderStatPage, false);
        let finishOrderPage = new TabPage("finishOrderViewer", "完结状态");
        let finishOrderContent = new VBox();
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

        let svHeaderRow1 = new HBox();//行


        let btn_query = new Button();//按钮
        btn_query.Left = 100;
        btn_query.Text = "Query";
        svHeaderRow1.addChild(btn_query);
        viewContent.addChild(svHeaderRow1);



        let Market = new TabPage("MarketId", "行情");
        let MarketCon = new VBox();
        MarketCon.MinHeight = 200;
        let panel2 = new TabPanel();
        let inputRow = new HBox();
        this.txt_security = new TextBox();
        this.txt_security.Title = "股票代码:";
        this.txt_security.Text = '';
        this.txt_security.Left = 50;
        this.txt_security.Width = 50;
        inputRow.addChild(this.txt_security);
        MarketCon.addChild(inputRow);

        this.MarketTable = new DataTable("table2");
        this.MarketTable.RowIndex = false;
        this.MarketTable.addColumn("1", "2", "3");
        // this.MarketTable.height = 200;
        this.MarketTable.align = 'center'
        for (let i = 0; i <= 10; i++) {
            let row = this.MarketTable.newRow();
            row.cells[0].Text = '2' + i;
            row.cells[1].Text = i;
        }
        this.MarketTable.onRowDBClick = (rowItem, rowIndex) => {
            alert(rowIndex);
            Dialog.popup(this, viewContentPop, { title: "ceshi", width: 500, height: 500 });
        }
        MarketCon.addChild(this.MarketTable);
        Market.setContent(MarketCon);
        panel2.addTab(Market, false);
        panel2.setActive("MarketId");

        this.main = new DockContainer(null, "v", window.innerWidth, window.innerHeight);
        this.main.addChild(new DockContainer(this.main, "h", null, window.innerHeight / 2).addChild(viewContent));
        this.main.addChild(new Splitter("h", this.main));
        this.main.addChild(new DockContainer(this.main, "h", null, window.innerHeight - window.innerHeight / 2).addChild(panel2));


        this.dd_tests.SelectChange = () => {
            // table.rows.length = 0;
            if (this.dd_tests.SelectedItem && this.dd_tests.SelectedItem.Value) {
                lbl_mode.Text = this.dd_tests.SelectedItem.Value.simlevel;
                lbl_speed.Text = this.dd_tests.SelectedItem.Value.speed;
                lbl_duration.Text = this.dd_tests.SelectedItem.Value.timebegin + "-" + this.dd_tests.SelectedItem.Value.timeend;
                lbl_tick.Text = this.dd_tests.SelectedItem.Value.period.toString() + (this.dd_tests.SelectedItem.Value.unit === 0 ? " min" : " day");
                this.table.rows.length = 0;
                this.worker.send({ command: "query", params: { id: this.dd_tests.SelectedItem.Value.id, begin: 0, end: parseInt(this.txt_pagesize.Text) } });
            }
        };

        btn_query.OnClick = () => {
            // Dialog.popup(this, viewContentPop, { title: "ceshi", width: 500, height: 500 });
            if (this.dd_tests.SelectedItem && this.dd_tests.SelectedItem.Value && this.dd_tests.SelectedItem.Value.id !== undefined) {
                this.chart.init();
                this.table.rows.length = 0;
                this.worker.send({ command: "send", params: { type: 8014, data: { nId: this.dd_tests.SelectedItem.Value.id } } });
                this.worker.send({ command: "send", params: { type: 8016, data: { nId: this.dd_tests.SelectedItem.Value.id } } });
                setTimeout(() => {
                    this.worker.send({ command: "query", params: { id: this.dd_tests.SelectedItem.Value.id, begin: 0, end: parseInt(this.txt_pagesize.Text) } });
                }, 1000);
            }
        };

        //建立TCP链接
        this.registryListeners();
        this.tradePoint.connect(parseInt(port), addr);

        this.tradePoint.onConnect = () => {
            this.tradePoint.send(FGS_MSG.kLogin, JSON.stringify({ data: JSON.parse(AppStoreService.getLocalStorageItem(DataKey.kUserInfo)) }), ServiceType.kLogin);
        };

        this.tradePoint.onClose = () => {

        };
        // this.userId = Number(this.appSrv.getUserProfile().username);

        //数据请求
        //查询资金
        this.tradePoint.addSlot({
            service: ServiceType.kCOMS,
            msgtype: COMS_MSG.kMtFQueryFundAns,
            callback: (msg) => {
                console.log(msg)
                if (msg != undefined) {
                    let ans = new QueryFundAns();
                    ans.fromBuffer(msg);
                    ans.avl_amt = 0;
                }


            }
        });
        //查询仓位
        this.tradePoint.addSlot({
            service: ServiceType.kCOMS,
            msgtype: COMS_MSG.kMtFQueryPositionAns,
            callback: (msg) => {
                console.log(msg)
                if (msg != undefined) {
                    let ans = new QueryPositionAns();
                    ans.fromBuffer(msg);
                    ans.avl_cre_redemp_qty = 0;
                }


            }
        });

        //查询订单
        this.tradePoint.addSlot({
            service: ServiceType.kCOMS,
            msgtype: COMS_MSG.kMtBQueryOrderAns,
            callback: (msg) => {
                console.log(msg)
                if (msg != undefined) {
                    let ans = new OrderStatus();
                    ans.fromBuffer(msg);
                }


            }
        });
        //下单
        this.tradePoint.addSlot({
            service: ServiceType.kCOMS,
            msgtype: COMS_MSG.kMtFSendOrderAns,
            callback: (msg) => {
                console.log(msg)
                if (msg != undefined) {
                    let ans = new OrderStatus();
                    ans.fromBuffer(msg);
                }


            }
        });

        this.tradePoint.addSlotOfCMS("getAssetAccount", (res) => {
            //查询资产账户
            let data = JSON.parse(res.toString());
            if (data.msret.msgcode != "00") {
                alert("getAssetAccount:msgcode = " + data.msret.msgcode + "; msg = " + data.msret.msg);
                return;
            }
            console.log(data.body[0].acid);

            data.body.forEach((item, index) => {
                this.acidObj[item.acid] = item.acname;
            })
            console.log(this.acidObj)
            let fund = new QueryFundAndPosition();
            fund.portfolio_id = 0;
            fund.fund_account_id = parseInt(data.body[0].acid);

            let position = new QueryFundAndPosition();
            position.portfolio_id = 0;
            position.fund_account_id = parseInt(data.body[0].acid);

            let QueryOrder = new OrderStatus();
            QueryOrder.order_ref = 0;   //u8  客户端订单ID+term_id = 唯一
            QueryOrder.ukey = 0;        //u8  Universal Key
            QueryOrder.directive = 0;   //u4 委托指令：普通买入，普通卖出
            QueryOrder.offset_flag = 0; //u4 开平方向：开仓、平仓、平昨、平今
            QueryOrder.hedge_flag = 0;  //u4 投机套保标志：投机、套利、套保
            QueryOrder.execution = 0;   //u4 执行类型： 限价0，市价
            QueryOrder.order_time = 0;  //u8 委托时间
            QueryOrder.portfolio_id = 0;     //u8 组合ID
            QueryOrder.fund_account_id = data.body[0].acid;  //========u8 资金账户ID
            QueryOrder.trade_account_id = 0; //u8 交易账户ID

            QueryOrder.strategy_id = 0;     //u4 策略ID
            QueryOrder.trader_id = 0;        //u4 交易员ID
            QueryOrder.term_id = 0;          //u4 终端ID
            QueryOrder.qty = 0;    //8 委托数量
            QueryOrder.price = 0;  //8 委托价格
            QueryOrder.property = 0;        //4 订单特殊属性，与实际业务相关(０:正常委托单，１+: 补单)
            QueryOrder.currency = 0;        //4 报价货币币种
            QueryOrder.algor_id = 0;		//8 策略算法ID
            QueryOrder.reserve = 0;			//4 预留(组合offset_flag)
            QueryOrder.order_id = 0;   //8 订单ID

            QueryOrder.cancelled_qty = 0;    //8 已撤数量
            QueryOrder.queued_qty = 0;       //8 已确认？
            QueryOrder.trade_qty = 0;        //8 已成交数量
            QueryOrder.trade_amt = 0;        //8 已成交金额*10000（缺省值）
            QueryOrder.trade_time = 0;      //8 最后成交时间
            QueryOrder.approver_id = 0;     //4 审批人ID
            QueryOrder.status = 0;          //4 订单状态
            QueryOrder.ret_code = 0;        //4
            QueryOrder.broker_sn = "";    //32 券商单号
            QueryOrder.message = "";      //128 附带消息，如错误消息等

            let Send = new SendOrder();
            Send.order_ref = 0;   //u8  客户端订单ID+term_id = 唯一
            Send.ukey = 0;        //u8  Universal Key
            Send.directive = 0;   //u4 委托指令：普通买入，普通卖出
            Send.offset_flag = 0; //u4 开平方向：开仓、平仓、平昨、平今
            Send.hedge_flag = 0;  //u4 投机套保标志：投机、套利、套保
            Send.execution = 0;   //u4 执行类型： 限价0，市价
            Send.order_time = 0;  //u8 委托时间
            Send.portfolio_id = 0;     //u8 组合ID
            Send.fund_account_id = data.body[0].acid;  //u8 资金账户ID
            Send.trade_account_id = 0; //u8 交易账户ID

            Send.strategy_id = 0;     //u4 策略ID
            Send.trader_id = 0;        //u4 交易员ID
            Send.term_id = 0;          //u4 终端ID
            Send.qty = 0;    //8 委托数量
            Send.price = 0;  //8 委托价格
            Send.property = 0;        //4 订单特殊属性，与实际业务相关(０:正常委托单，１+: 补单)
            Send.currency = 0;        //4 报价货币币种
            Send.algor_id = 0;		//8 策略算法ID
            Send.reserve = 0;			//4 预留(组合offset_flag)

            this.tradePoint.send(COMS_MSG.kMtFQueryFund, fund.toBuffer(), ServiceType.kCOMS);
            this.tradePoint.send(COMS_MSG.kMtFQueryPosition, position.toBuffer(), ServiceType.kCOMS);
            this.tradePoint.send(COMS_MSG.kMtFQueryOrder, QueryOrder.toBuffer(), ServiceType.kCOMS);
            this.tradePoint.send(COMS_MSG.kMtFSendOrder, QueryOrder.toBuffer(), ServiceType.kCOMS);
        }, this);

        this.tradePoint.addSlotOfCMS("getTaacctFund", (res) => {
            //查询资产账户资金
            let data = JSON.parse(res.toString());
            if (data.msret.msgcode != "00") {
                alert("getTaacctFund:msgcode = " + data.msret.msgcode + "; msg = " + data.msret.msg);
                return;
            }
            data.body.forEach((item, index) => {
                let row = this.fundAccountTable.newRow();
                row.cells[0].Text = item.currencyid;
                row.cells[1].Text = item.out_fund;
                row.cells[2].Text = item.in_fund;
                row.cells[3].Text = item.totalamt;
                row.cells[4].Text = item.frozenamt;
                row.cells[5].Text = item.validloan;
                row.cells[6].Text = item.loan;
                row.cells[7].Text = item.stockloan;
                row.cells[8].Text = item.totalmargin;
                row.cells[9].Text = item.buymargin;
                row.cells[10].Text = item.sellmargin;
                row.cells[11].Text = item.fee;
                row.cells[12].Text = item.hold_closepl;

            })

            console.log(data);
        }, this)
        this.tradePoint.addSlotOfCMS("getTradeAccount", (res) => {
            //查询交易账户
            let data = JSON.parse(res.toString());
            if (data.msret.msgcode != "00") {
                alert("getTradeAccount:msgcode = " + data.msret.msgcode + "; msg = " + data.msret.msg);
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
            })
            console.log(data);
        }, this)
        //产品净值
        this.productNet = new Section();
        this.productNet.content = this.createProductNetChart();
        // this.productNetChart.addC
        this.tradePoint.addSlotOfCMS("getProductNet", (msg) => {
            let data = JSON.parse(msg.toString());
            if (data.msret.msgcode != "00") {
                alert("getProductNet:msgcode = " + data.msret.msgcode + "; msg = " + data.msret.msg);
                return;
            }
            let productNetChangeOpt = {
                title: { text: "" },
                xAxis: [{ data: [] }],
                series: [{ data: [] }]
            }
            this.productNetData = data.body;
            if (this.productNetData.length > 0) {
                this.productNetData.forEach(item => {
                    productNetChangeOpt.xAxis[0].data.push(item.trday);
                    productNetChangeOpt.title.text = item.caname;
                    productNetChangeOpt.series[0].data.push(item.netvalue);
                })
                // this.productNetChart.setOption(productNetChangeOpt);
            }
        }, this)

    }

    registryListeners() {
        this.tradePoint.addSlot({
            service: ServiceType.kLogin,
            msgtype: FGS_MSG.kLoginAns,
            callback: (msg) => {
                console.info(msg.toString());
                this.tradePoint.sendToCMS("getProductNet", JSON.stringify({ data: { head: { userid: this.userId }, body: { caid: this.productId } } }));
                this.tradePoint.sendToCMS("getAssetAccount", JSON.stringify({
                    //查询资产账户
                    data: {
                        head: { userid: this.userId },
                        body: { caid: this.productId }
                    }
                }));

                this.tradePoint.sendToCMS("getTaacctFund", JSON.stringify({
                    //查询资产账户资金
                    data: {
                        head: { userid: this.userId },
                        body: { caid: this.productId }
                    }
                }));
                this.tradePoint.sendToCMS("getTradeAccount", JSON.stringify({
                    //查询交易账户
                    data: {
                        head: { userid: this.userId },
                        body: { caid: this.productId }
                    }
                }));


            }
        })
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
        }
    }
}