"use strict";

import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { TileArea, Tile, DataTable, DataTableColumn } from "../../../base/controls/control";
import { ConfigurationBLL, WorkspaceConfig, StrategyContainer, Product, StrategyInstance, SpreadViewConfig } from "../../bll/strategy.server";
import { Menu, AppStoreService } from "../../../base/api/services/backend.service";
import { TradeService } from "../../bll/services";

declare var window: any;
let ip20strs = [];
@Component({
    moduleId: module.id,
    selector: "trade",
    templateUrl: "trade.component.html",
    styleUrls: ["trade.component.css"],
    providers: [
        Menu,
        AppStoreService,
        ConfigurationBLL
    ]
})
export class TradeComponent implements OnInit {
    static readonly kSpreadViewer = "SpreadViewer";
    areas: TileArea[];
    analyticMenu: Menu;
    analyticArea: TileArea;
    analyticConfigs: string[];

    productArea: TileArea;
    products: any;
    selectedProduct: any;

    strategyMenu: Menu;
    strategyArea: TileArea;
    strategyConfigs: Array<WorkspaceConfig>;
    strategyCores: any;
    selectedStrategy: any;

    resTable: DataTable;
    monitorHeight: number;
    bDetails: boolean;
    newInstance = new StrategyInstance();
    config: WorkspaceConfig;
    curTemplate: any;
    strategyName: string;
    tileArr: string[] = [];
    svconfig: string;
    bshow: boolean = false;
    bcreate: boolean = false;
    bModify: boolean = false;
    bSelStrategy: boolean = false;
    bSpread: boolean = false;
    bSelProduct: boolean = false;
    bNameRead: boolean = false;
    accounts: string = "";
    setting: any;
    clickItem: any;
    frame_host: any;
    frame_port: any;
    svClickItem: any;

    constructor(private appService: AppStoreService, private tradePoint: TradeService, private configBll: ConfigurationBLL) {
    }

    ngOnInit() {
        this.areas = [];
        this.appService.onUpdateApp(this.updateApp, this);
        this.registerListeners();
        this.initializeProducts();
        this.initializeStrategies();
        this.initializeAnylatics();
        this.config = new WorkspaceConfig();
        this.config.curstep = 1;
        this.setting = this.appService.getSetting();

        this.frame_host = this.setting.endpoints[0].quote_addr.split(":")[0];
        this.frame_port = this.setting.endpoints[0].quote_addr.split(":")[1];

        this.strategyCores = [
            { name: "PairTrade", chname: "统计套利" },
            { name: "ManualTrader", chname: "手工交易" },
            { name: "PortfolioTrader", chname: "组合交易" },
            { name: "IndexSpreader", chname: "做市策略" },
            { name: "SimpleSpreader", chname: "配对交易" },
            { name: "BasketSpreader", chname: "期现套利" },
            { name: "BlockTrader", chname: "大宗交易" }
        ];

        let self = this;
        this.bDetails = false;

        this.resTable = new DataTable("table2");
        this.resTable.addColumn2(new DataTableColumn("策略ID", false, true));
        this.resTable.addColumn2(new DataTableColumn("策略名", false, true));
        this.resTable.addColumn2(new DataTableColumn("状态", false, true));
        this.resTable.addColumn2(new DataTableColumn("启动", false, true));
        this.resTable.addColumn2(new DataTableColumn("暂停", false, true));
        this.resTable.addColumn2(new DataTableColumn("停止", false, true));
        this.resTable.addColumn2(new DataTableColumn("监听", false, true));
        this.resTable.addColumn2(new DataTableColumn("总盈亏", false, true));
        this.resTable.addColumn2(new DataTableColumn("总仓位", false, true));
    }

    registerListeners() {
        this.tradePoint.addSlot({
            appid: 107,
            packid: 2001,
            callback: msg => {
                console.info(msg.content);
                if (msg.content.body.errorid !== 0) {
                    console.error(`errorid: ${msg.content.body.errorid}, errmsg: ${msg.content.body.description}`);
                    return;
                }

                let config = this.strategyConfigs.find(item => { return item.activeChannel === "default" && item.name === msg.content.body.name; });

                if (config) {
                    config.name = msg.content.body.name;
                    config.host = msg.content.body.address;
                    let tile = this.strategyArea.getTile(config.name);

                    if (null === tile) {
                        tile = new Tile();
                        tile.title = config.chname;
                        tile.iconName = "tasks";
                        this.strategyArea.addTile(tile);
                    }

                    this.configBll.updateConfig(config);
                }
            }
        });

        this.tradePoint.addSlot({
            appid: 260,
            packid: 216,
            callback: msg => {
                let data = JSON.parse(msg.content.body);
                console.info(data);
                if (msg.content.msret.msgcode !== "00") {
                    alert("Get product info Failed! " + data.msret.msg);
                    return;
                }

                let productInfo: Object = {};

                data.body.forEach(item => {
                    if (productInfo.hasOwnProperty(item.tblock_id)) {
                        item.cfg.split("|").forEach(gwItem => {
                            if (productInfo[item.tblock_id].cfg.indexOf("," + gwItem.split(",")[2]) < 0)
                                productInfo[item.tblock_id].cfg += "|" + gwItem;
                        });

                        if (productInfo[item.tblock_id].broker_customer_code.indexOf(item.broker_customer_code) < 0)
                            productInfo[item.tblock_id].broker_customer_code += "," + item.broker_customer_code;
                    } else {
                        productInfo[item.tblock_id] = item;
                    }
                });

                for (let prop in productInfo) {
                    let tile = new Tile();
                    tile.title = productInfo[prop].tblock_full_name;
                    tile.iconName = "folder-close";
                    tile.data = productInfo[prop].tblock_id;
                    this.productArea.addTile(tile);
                    this.products.push(productInfo[prop]);
                }

                productInfo = null;
                data = null;
            }
        });

        this.tradePoint.addSlot({
            appid: 107,
            packid: 2003,
            callback: msg => {
                console.log(2003, msg);
                this.config.port = msg.content.strategyserver.port;
                this.configBll.updateConfig(this.config);
            }
        });

        // 
        this.tradePoint.addSlot({
            appid: 107,
            packid: 2009,
            callback: msg => {
                let strategy_key = 0;
                let len = msg.content.body.strategies.length;
                for (let i = 0; i < len; ++i) {
                    if (msg.content.body.strategies[i].strategy.name === this.config.name) {
                        strategy_key = msg.content.body.strategies[i].strategy.strategy_key;
                        break;
                    }
                }

                this.config.strategyInstances[0].key = strategy_key + "";
                this.configBll.updateConfig(this.config);
                this.curTemplate.body.data.Strategy[0].key = strategy_key;
                // console.log(this.config, this.curTemplate.body.data);
                this.tradePoint.send(107, 2000, {
                    routerid: 0, templateid: this.curTemplate.id, body: {
                        name: this.config.name, config: JSON.stringify(this.curTemplate.body.data), chinese_name: "",
                        strategies: { name: this.config.name }
                    }
                });
            }
        });

        // subscribe strategy status
        this.tradePoint.addSlot({
            appid: 17,
            packid: 110,
            callback: (msg) => {
                console.info(msg);
                msg.content.strategyservers.forEach(item => {
                    let target = this.strategyConfigs.find(citem => { return citem.name === item.name; });

                    if (target !== undefined)
                        this.strategyArea.getTile(target.chname).backgroundColor = item.state !== 0 ? "#1d9661" : null;
                });
            }
        });
    }

    initializeProducts() {
        this.products = [];
        this.productArea = new TileArea();
        this.productArea.title = "产品";
        this.productArea.onClick = (event: MouseEvent, item: Tile) => {
            this.appService.startApp("产品信息", "Dialog", {
                dlg_name: "product",
                productID: item.data
            });
        };

        this.areas.push(this.productArea);
        this.tradePoint.send(260, 216, { body: { tblock_type: 2 } });
    }

    initializeStrategies() {
        // strategyMenu
        this.strategyMenu = new Menu();
        this.strategyMenu.addItem("启动", () => {
            this.operateStrategyServer(this.config, 1);
        });
        this.strategyMenu.addItem("停止", () => {
            this.operateStrategyServer(this.config, 0);
        });
        this.strategyMenu.addItem("修改", () => {
            this.config.curstep = 1;
            this.bshow = true;
            this.bModify = true;
            this.onPopup(1);
        });
        this.strategyMenu.addItem("删除", () => {
            if (!confirm("确定删除？")) {
                return;
            } else {
                let len = this.strategyConfigs.length;
                for (let i = 0; i < len; ++i) {
                    if (this.strategyConfigs[i].chname === this.clickItem.title) {
                        this.strategyConfigs.splice(i, 1);
                        this.configBll.updateConfig();
                        this.strategyArea.removeTile(this.clickItem.title);
                        let tileIdx = this.tileArr.indexOf(this.config.name);
                        if (tileIdx !== -1) {
                            this.tileArr.splice(tileIdx, 1);
                        }
                        break;
                    }
                }
            }
        });
        // end strategyMenu

        this.strategyArea = new TileArea();
        this.strategyArea.title = "策略";
        this.strategyArea.onCreate = () => {
            this.bshow = true;
            this.config.curstep = 1;
            this.onPopup(0);
        };

        this.strategyArea.onClick = (event: MouseEvent, item: Tile) => {
            this.clickItem = item;
            let len = this.strategyConfigs.length;

            for (let i = 0; i < len; ++i) {
                if (this.strategyConfigs[i].chname === item.title) {
                    this.config = this.strategyConfigs[i];
                    break;
                }
            }

            if (event.button === 0) {  // left click
                this.onStartApp();
            } else if (event.button === 2) { // right click
                this.strategyMenu.popup();
            }
        };

        this.strategyConfigs = this.configBll.getAllConfigs();
        this.strategyConfigs.forEach(config => {
            if (config.activeChannel === "default") {
                this.config = config;
                this.config.state = 0;
                this.curTemplate = JSON.parse(JSON.stringify(this.configBll.getTemplateByName(this.config.strategyCoreName)));
                if (this.curTemplate === null)
                    return;

                let tile = new Tile();
                tile.title = config.chname;
                tile.iconName = "tasks";
                tile.data = config.name;
                this.strategyArea.addTile(tile);
                this.finish();
            }
        });

        this.areas.push(this.strategyArea);

        // strategy status
        this.tradePoint.send(17, 101, { topic: 8000, kwlist: [800] });
    }

    initializeAnylatics() {
        // analyticMenu
        this.analyticMenu = new Menu();
        this.analyticMenu.addItem("删除", () => {
            if (!confirm("确定删除？"))
                return;

            for (let i = 0; i < this.analyticConfigs.length; ++i) {
                if (this.analyticConfigs[i] === this.svClickItem.title) {
                    this.configBll.removeSVConfigItem(this.svClickItem.title);
                    this.analyticArea.removeTile(this.svClickItem.title);
                    break;
                }
            }
        });
        // endMenu

        this.analyticArea = new TileArea();
        this.analyticArea.title = "分析";
        this.analyticConfigs = this.configBll.getSVConfigs();

        this.analyticConfigs.forEach(item => {
            let tile = new Tile();
            tile.title = item;
            tile.iconName = "object-align-bottom";
            this.analyticArea.addTile(tile);
        });

        this.analyticArea.onCreate = () => {
            this.appService.startApp("Untitled", TradeComponent.kSpreadViewer, {
                port: parseInt(this.frame_port),
                host: this.frame_host,
                lang: this.setting.language
            });
        };

        this.analyticArea.onClick = (event: MouseEvent, item: Tile) => {
            this.svClickItem = item;

            if (event.button === 0) {
                if (!this.appService.startApp(item.title, TradeComponent.kSpreadViewer, {
                    port: parseInt(this.frame_port),
                    host: this.frame_host,
                    lang: this.setting.language
                })) {
                    alert("Error `Start ${name} app error!`");
                }

                return;
            }

            if (event.button === 2)
                this.analyticMenu.popup();
        };

        this.areas.push(this.analyticArea);
    }

    // update app info
    updateApp(params) {
        let idx = this.analyticConfigs.indexOf(params.oldName);

        if (idx < 0) {
            this.analyticConfigs.push(params.newName);
            let tile = new Tile();
            tile.title = params.newName;
            tile.iconName = "object-align-bottom";
            this.analyticArea.addTile(tile);
        } else {
            this.analyticConfigs[idx] = params.newName;
            this.analyticArea.getTileAt(idx).title = params.newName;
        }
    }

    finish() {
        if (!this.config.name || this.config.name.length === 0 ||
            !this.config.strategyCoreName || !this.config.strategyInstances || this.config.strategyInstances.length === 0) {
            // console.log(this.config.name, this.config.name.length, this.config.strategyCoreName, this.config.strategyInstances, this.config.strategyInstances.length);
            alert("Wrong Config check items: <br>1. config name.<br>2. one strategy instance at least");
            return;
        }
        // create and modify con`fig.
        if (this.config.activeChannel === "default") {
            this.config.channels.gateway.forEach((gw, index) => {
                if (index === 0)
                    this.curTemplate.body.data.SSGW[index].ref = 0;
                this.curTemplate.body.data.SSGW[index].port = gw.port = parseInt(gw.port);
                this.curTemplate.body.data.SSGW[index].addr = gw.addr = gw.addr;
            });

            this.curTemplate.body.data.SSFeed.detailview.PriceServer.port = parseInt(this.config.channels.feedhandler.port);
            this.curTemplate.body.data.SSFeed.detailview.PriceServer.addr = this.config.channels.feedhandler.addr;
        }

        // console.info(this.curTemplate, this.config);
        this.curTemplate.body.data["SSNet"]["TSServer.port"] = this.config.port;
        this.curTemplate.body.data["globals"]["ss_instance_name"] = this.config.name;
        let sobj = Object.assign({}, this.curTemplate.body.data["Strategy"][0]);
        this.curTemplate.body.data["Strategy"].length = 0;
        this.curTemplate.body.data["PairTrades"] = {};
        let hasError = false;
        this.config.strategyInstances.forEach(item => {
            if (!item.accounts || item.accounts.length < 1) {
                hasError = true;
                return;
            }
            let obj = JSON.parse(JSON.stringify(sobj));
            obj.account = [];
            item.accounts.split(",").forEach(iact => {
                obj.account.push(parseInt(iact));
            });
            obj.algoes = item.algoes;
            obj.checks = item.checks;
            // obj.cfg = obj.field = obj.name = obj.log = item.name;
            obj.cfg = obj.field = obj.name = obj.log = this.config.name;
            obj.key = parseInt(item.key);
            obj.status = 2; // RUN;  maxorderid  minorderid orderstep

            item.parameters.forEach((iparam: any) => {
                iparam.value = parseFloat(iparam.value);
            });
            item.comments.forEach((icomment: any) => {
                if (icomment.value === "false" || icomment.value === "true") { // hack for specified requirement from backend
                    ;
                } else {
                    icomment.value = parseFloat(icomment.value);
                }
            });
            item.instruments.forEach((instrument: any) => {
                instrument.value = parseFloat(instrument.value);
            });
            this.curTemplate.body.data["Strategy"].push(obj);
            this.curTemplate.body.data["PairTrades"][item.name] = { // item.name
                Command: item.commands,
                Comment: item.comments,
                Instrument: item.instruments,
                Parameter: item.parameters
            };

            if (item.sendChecks) {
                this.curTemplate.body.data["PairTrades"][item.name]["SendCheck"] = item.sendChecks; // item.name
            }
        });

        if (hasError) {
            alert("Wrong Config check items: <br>1. config name.<br>2. one strategy instance at least.<br>3. account must not be empty.");
            return;
        }

        this.configBll.updateConfig(this.config);
        this.config.strategies = { name: this.config.name };

        if (!this.bshow) {
            this.tradePoint.send(107, 2000, {
                routerid: 0, templateid: this.curTemplate.id, body: {
                    name: this.config.name, config: JSON.stringify(this.curTemplate.body.data), chinese_name: "",
                    strategies: { name: this.config.name }
                }
            });
        }
        // console.log(this.config);
        if (this.bshow) {
            this.tradePoint.send(107, 2008, {
                routerid: 0, body: {
                    name: this.config.name,
                    strategies: [{ strategy: { name: this.config.name } }]
                }
            });
        }
        this.bcreate = false;
        this.bModify = false;
        this.bSelStrategy = false;
        this.closePanel();
    }

    next() {
        if (this.config.curstep === 1) {
            if ((/^[A-Za-z0-9]+$/).test(this.config.name) || this.config.name.substr(0, 3) !== "ss-") {
                alert("please input correct format name");
                return;
            }

            // get template
            if (!this.config.strategyCoreName)
                this.config.strategyCoreName = this.strategyCores[0].name;

            if (!this.selectedProduct)
                this.onSelectProduct(this.products[0]);

            this.curTemplate = null;
            this.curTemplate = JSON.parse(JSON.stringify(this.configBll.getTemplateByName(this.config.strategyCoreName)));

            if (this.curTemplate === null) {
                alert("Error: getTemplateByName `not found ${this.config.name}`");
                return;
            }
            // choose product and account
            this.config.channels.gateway = this.curTemplate.body.data.SSGW;
            for (let i = 0; i < this.config.channels.gateway.length; ++i) {
                for (let obj in this.gatewayObj) {
                    if (parseInt(obj) === parseInt(this.config.channels.gateway[i].key)) {
                        this.config.channels.gateway[i].addr = this.gatewayObj[obj].addr;
                        this.config.channels.gateway[i].port = this.gatewayObj[obj].port;
                        break;
                    }
                }
            }

            this.config.channels.feedhandler = this.curTemplate.body.data.SSFeed.detailview.PriceServer;
            this.newInstance.name = this.config.name;
            this.newInstance.parameters = JSON.parse(JSON.stringify(this.curTemplate.body.data.Parameter));
            this.newInstance.comments = JSON.parse(JSON.stringify(this.curTemplate.body.data.Comment));
            this.newInstance.commands = JSON.parse(JSON.stringify(this.curTemplate.body.data.Command));
            this.newInstance.instruments = JSON.parse(JSON.stringify(this.curTemplate.body.data.Instrument));
            this.newInstance.sendChecks = JSON.parse(JSON.stringify(this.curTemplate.body.data.SendCheck));
            console.log(this.curTemplate.body.data);
            this.newInstance.algoes = [100, 101, 102, 103, 104];
            this.config.strategyInstances[0] = this.newInstance;
            // GET account info from product msg
            this.config.strategyInstances[0].accounts = this.selectedProduct.broker_customer_code;
        }

        if (this.config.curstep === 2) {
            this.config.activeChannel = "default";
        }

        if (this.config.curstep === 3) {
            console.log(this.config);
        }

        ++this.config.curstep;
    }

    prev() {
        if (this.config.curstep === 2)
            this.bcreate = false;
        --this.config.curstep;
    }

    closePanel(e?: any) {
        if (this.bshow) {
            this.config.curstep = 1;
            this.bshow = false;
        }
    }

    operateStrategyServer(config: WorkspaceConfig, action: number) {
        this.tradePoint.send(107, 2002, { routerid: 0, strategyserver: { name: config.name, action: action } });
    }

    onStartApp() {
        if (!this.appService.startApp(this.config.name, this.config.apptype, {
            port: this.config.port,
            host: this.config.host,
            name: this.config.name,
            lang: this.setting.language,
            feedhandler: {
                host: this.frame_host,
                port: parseInt(this.frame_port)
            }
        })) {
            alert(`start ${this.config.name} app error!`);
        }
    }

    onSelectStrategy(index: number) {
        this.config.strategyCoreName = this.strategyCores[index].name;
    }

    onSelectProduct(index) {
        this.selectedProduct = this.products[index];
    }

    /**
     * @param type 0 is new config, 1 is modify config.
     */
    onPopup(type: number = 0) {
        if (type === 0) {
            this.config = new WorkspaceConfig();
        } else {
            this.config.curstep = 1;
            this.curTemplate = null;
            this.curTemplate = this.configBll.getTemplateByName(this.config.strategyCoreName);
        }
    }

    hide() {
        this.bshow = false;
        this.bModify = false;
        this.config.curstep = 1;
    }

    // toggleMonitor() {
    //     console.log(this.strategyContainer.items);
    //     if (this.bDetails) {
    //         this.monitorHeight = 30;
    //     } else {
    //         this.monitorHeight = 300;
    //     }
    //     this.bDetails = !this.bDetails;
    //     this.resTable.rows.length = 0;
    //     let itemLen = this.strategyContainer.items.length;
    //     if (itemLen === 0)
    //         return;
    //     for (let i = 0; i < itemLen; ++i) {
    //         let row = this.resTable.newRow();
    //         let strategyid = this.strategyContainer.items[i].conn.strategies[0].id;
    //         row.cells[0].Text = strategyid;
    //         row.cells[1].Text = this.strategyContainer.items[i].conn.strategies[0].name;
    //         row.cells[2].Text = this.strategyContainer.items[i].conn.strategies[0].status;
    //         row.cells[3].Type = "button";
    //         row.cells[3].Text = "start";
    //         row.cells[3].OnClick = () => {
    //             this.strategyContainer.items[i].conn.changeStatus(strategyid, 2);
    //         };
    //         row.cells[3].Disable = (this.strategyContainer.items[i].conn.strategies[0].status === "RUN" || this.strategyContainer.items[i].conn.strategies[0].status === "STOP") ? true : false;
    //         row.cells[4].Type = "button";
    //         row.cells[4].Text = "pause";
    //         row.cells[4].OnClick = () => {
    //             this.strategyContainer.items[i].conn.changeStatus(strategyid, 3);
    //         };
    //         row.cells[4].Disable = (this.strategyContainer.items[i].conn.strategies[0].status === "PAUSE" || this.strategyContainer.items[i].conn.strategies[0].status === "STOP") ? true : false;
    //         row.cells[5].Type = "button";
    //         row.cells[5].Text = "stop";
    //         row.cells[5].OnClick = () => {
    //             this.strategyContainer.items[i].conn.changeStatus(strategyid, 4);
    //         };
    //         row.cells[5].Disable = (this.strategyContainer.items[i].conn.strategies[0].status === "STOP") ? true : false;
    //         row.cells[6].Type = "button";
    //         row.cells[6].Text = "watch";
    //         row.cells[6].OnClick = () => {
    //             this.strategyContainer.items[i].conn.changeStatus(strategyid, 5);
    //         };
    //         row.cells[6].Disable = (this.strategyContainer.items[i].conn.strategies[0].status === "WATCH") ? true : false;
    //         row.cells[7].Text = this.strategyContainer.items[i].conn.strategies[0].totalpnl;
    //         row.cells[8].Text = this.strategyContainer.items[i].conn.strategies[0].totalposition;

    //         this.strategyContainer.items[i].conn.onStatusChanged = () => {
    //             let getChangedStatus = this.strategyContainer.items[i].conn.strategies[0].status;
    //             if (getChangedStatus === "RUN") {
    //                 row.cells[2].Text = "RUN";
    //                 row.cells[3].Disable = true;
    //                 row.cells[4].Disable = false;
    //                 row.cells[5].Disable = false;
    //                 row.cells[6].Disable = false;
    //             } else if (getChangedStatus === "PAUSE") {
    //                 row.cells[2].Text = "PAUSE";
    //                 row.cells[3].Disable = false;
    //                 row.cells[4].Disable = true;
    //                 row.cells[5].Disable = false;
    //                 row.cells[6].Disable = false;
    //             } else if (getChangedStatus === "STOP") {
    //                 row.cells[2].Text = "STOP";
    //                 row.cells[3].Disable = false;
    //                 row.cells[4].Disable = true;
    //                 row.cells[5].Disable = true;
    //                 row.cells[6].Disable = false;
    //             } else if (getChangedStatus === "WATCH") {
    //                 row.cells[2].Text = "WATCH";
    //                 row.cells[3].Disable = false;
    //                 row.cells[4].Disable = false;
    //                 row.cells[5].Disable = false;
    //                 row.cells[6].Disable = true;
    //             }
    //         };
    //     }
    // }
}