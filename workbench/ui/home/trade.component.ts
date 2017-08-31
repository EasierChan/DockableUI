"use strict";

import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { TileArea, Tile, DataTable, DataTableColumn } from "../../../base/controls/control";
import { ConfigurationBLL, WorkspaceConfig, StrategyContainer, StrategyInstance, SpreadViewConfig } from "../../bll/strategy.server";
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
    selectedSpreadItem: any;

    productArea: TileArea;
    products: any;
    selectedProduct: any;

    strategyMenu: Menu;
    strategyArea: TileArea;
    strategyConfigs: Array<WorkspaceConfig>;
    strategyCores: any;
    selectedStrategyConfig: any;
    config: WorkspaceConfig;

    curTemplate: any;
    setting: any;
    frame_host: any;
    frame_port: any;

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
                        this.strategyArea.getTile(target.chname).backgroundColor = item.stat !== 0 ? "#1d9661" : null;
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
            this.appService.startApp("策略配置", "Dialog", {
                dlg_name: "strategy",
                data: this.selectedStrategyConfig
            });
        });
        this.strategyMenu.addItem("删除", () => {
            if (!confirm("确定删除？")) {
                return;
            } else {
                let len = this.strategyConfigs.length;
                for (let i = 0; i < len; ++i) {
                    if (this.strategyConfigs[i].chname === this.selectedStrategyConfig.title) {
                        this.strategyConfigs.splice(i, 1);
                        this.configBll.updateConfig();
                        this.strategyArea.removeTile(this.selectedStrategyConfig.title);
                        break;
                    }
                }
            }
        });
        // end strategyMenu

        this.strategyArea = new TileArea();
        this.strategyArea.title = "策略";
        this.strategyArea.onCreate = () => {
            this.appService.startApp("策略配置", "Dialog", {
                dlg_name: "strategy"
            });
        };

        this.strategyArea.onClick = (event: MouseEvent, item: Tile) => {
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

        this.strategyConfigs = this.configBll.getRealTradeConfigs();
        this.strategyConfigs.forEach(config => {
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

            this.configBll.removeSVConfigItem(this.selectedSpreadItem.title);
            this.analyticArea.removeTile(this.selectedSpreadItem.title);
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
            this.selectedSpreadItem = item;

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
}