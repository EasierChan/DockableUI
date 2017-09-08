"use strict";

import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { TileArea, Tile } from "../../../base/controls/control";
import { ConfigurationBLL, WorkspaceConfig, DataKey, AppType, Channel } from "../../bll/strategy.server";
import { Menu, AppStoreService } from "../../../base/api/services/backend.service";
import { TradeService } from "../../bll/services";

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
    areas: TileArea[];
    analyticMenu: Menu;
    analyticArea: TileArea;
    analyticConfigs: string[];
    selectedSpreadItem: any;

    productArea: TileArea;
    products: any[];
    selectedProduct: any;

    strategyMenu: Menu;
    strategyArea: TileArea;
    strategyConfigs: Array<WorkspaceConfig>;
    selectedStrategyConfig: WorkspaceConfig;
    strategyKeys: number[];

    setting: any;
    quotePoint: any;

    constructor(private appService: AppStoreService, private tradePoint: TradeService, private configBll: ConfigurationBLL) {
    }

    ngOnInit() {
        this.areas = [];
        this.registerListeners();
        this.initializeProducts();
        this.initializeStrategies();
        this.initializeAnylatics();
        this.setting = this.appService.getSetting();

        this.quotePoint = this.setting.endpoints[0].quote_addr.split(":");
    }

    registerListeners() {
        this.tradePoint.addSlot({
            appid: 107,
            packid: 2001, // 创建策略回报
            callback: msg => {
                console.debug(msg);
                if (msg.content.body.errorid !== 0) {
                    console.error(`errorid: ${msg.content.body.errorid}, errmsg: ${msg.content.body.description}`);
                    return;
                }

                let config = this.strategyConfigs.find(item => { return item.name === msg.content.body.name; });

                if (config) {
                    config.appid = msg.content.body.appid;
                    config.items[0].key = msg.content.body.strategy_key;
                    this.strategyKeys.push(config.items[0].key);

                    let tile = this.strategyArea.getTile(config.chname);

                    if (null === tile) {
                        tile = new Tile();
                        tile.title = config.chname;
                        tile.iconName = "tasks";
                        this.strategyArea.addTile(tile);
                    }

                    this.configBll.updateConfig(config);
                    this.refreshSubscribe();
                }
            }
        });

        this.tradePoint.addSlot({
            appid: 260,
            packid: 216,
            callback: msg => {
                let data = JSON.parse(msg.content.body);

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
            packid: 2003, // 启动策略回报
            callback: msg => {
                for (let i = 0; i < this.strategyConfigs.length; ++i) {
                    if (this.strategyConfigs[i].name === msg.content.strategyserver.name) {
                        // this.strategyConfigs[i].appid = 
                        break;
                    }
                }

                this.configBll.updateConfig();
            }
        });

        // subscribe strategy status
        this.tradePoint.addSlot({
            appid: 17,
            packid: 110,
            callback: (msg) => {
                // console.info(msg);
                let target = this.strategyConfigs.find(citem => { return citem.name === msg.content.strategyserver.name; });

                if (target !== undefined)
                    this.strategyArea.getTile(target.chname).backgroundColor = msg.content.strategyserver.stat !== 0 ? "#1d9661" : null;

            }
        });
    }

    refreshSubscribe() {
        this.tradePoint.send(17, 101, { topic: 8000, kwlist: this.strategyKeys });
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
        this.strategyKeys = [];
        // strategyMenu
        this.strategyMenu = new Menu();
        this.strategyMenu.addItem("启动", () => {
            this.operateStrategyServer(this.selectedStrategyConfig, 1);
        });
        this.strategyMenu.addItem("停止", () => {
            this.operateStrategyServer(this.selectedStrategyConfig, 0);
        });
        this.strategyMenu.addItem("修改", () => {
            this.appService.startApp("策略配置", "Dialog", {
                dlg_name: "strategy",
                config: this.selectedStrategyConfig,
                products: this.products,
                strategies: this.configBll.getTemplates()
            });
        });
        this.strategyMenu.addItem("删除", () => {
            if (!confirm("确定删除？"))
                return;

            let len = this.strategyConfigs.length;
            for (let i = 0; i < len; ++i) {
                if (this.strategyConfigs[i].name === this.selectedStrategyConfig.name) {
                    this.strategyConfigs.splice(i, 1);
                    this.configBll.removeConfig(this.selectedStrategyConfig);
                    this.strategyArea.removeTile(this.selectedStrategyConfig.chname);
                    this.strategyKeys.splice(this.strategyKeys.indexOf(this.selectedStrategyConfig.items[0].key), 1);
                    break;
                }
            }
        });
        // end strategyMenu

        this.strategyArea = new TileArea();
        this.strategyArea.title = "策略";
        this.strategyArea.onCreate = () => {
            let config = new WorkspaceConfig();
            config.activeChannel = Channel.DEFAULT;
            this.appService.startApp("策略配置", "Dialog", { dlg_name: "strategy", strategies: this.configBll.getTemplates(), products: this.products });
        };

        this.strategyArea.onClick = (event: MouseEvent, item: Tile) => {
            let len = this.strategyConfigs.length;

            for (let i = 0; i < len; ++i) {
                if (this.strategyConfigs[i].chname === item.title) {
                    this.selectedStrategyConfig = this.strategyConfigs[i];
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
            let tile = new Tile();
            tile.title = config.chname;
            tile.iconName = "tasks";
            tile.data = config.name;
            this.strategyArea.addTile(tile);
            this.strategyKeys.push(config.items[0].key);
        });

        this.areas.push(this.strategyArea);

        // strategy status
        this.refreshSubscribe();
        this.appService.onUpdateApp(this.updateApp, this);
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
            this.appService.startApp("Untitled", AppType.kSpreadViewer, {
                port: parseInt(this.quotePoint[1]),
                host: this.quotePoint[0],
                lang: this.setting.language
            });
        };

        this.analyticArea.onClick = (event: MouseEvent, item: Tile) => {
            this.selectedSpreadItem = item;

            if (event.button === 0) {
                if (!this.appService.startApp(item.title, AppType.kSpreadViewer, {
                    port: parseInt(this.quotePoint[1]),
                    host: this.quotePoint[0],
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
        switch (params.type) {
            case "rename":
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
                break;
            case "strategy":
                if (localStorage.getItem(DataKey.kStrategyCfg) !== null) {
                    this.updateStrategyConfig(JSON.parse(localStorage.getItem(DataKey.kStrategyCfg)));
                }
                break;
        }
    }

    updateStrategyConfig(config: WorkspaceConfig) {
        if (this.strategyConfigs.find(item => { return item.name === config.name; }) === undefined)
            this.strategyConfigs.push(config);

        let instance = this.configBll.getTemplateByName(config.strategyType);
        instance["ss_instance_name"] = config.name;
        instance["SSData"]["backup"]["path"] += "/" + config.name;
        instance["SSInfo"]["name"] = config.name;
        instance["SSLog"]["file"] = instance["SSLog"]["file"].replace(/\$ss_instance_name/g, config.name);
        let parameters = instance["Strategy"][instance["Strategy"]["Strategies"][0]]["Parameter"];
        config.items[0].parameters.forEach(param => {
            if (parameters.hasOwnProperty(param.name)) {
                parameters[param.name].value = param.value;
            }
        });

        let product = this.products.find(item => { return item.tblock_id === config.productID; });
        console.info(product);
        if (product) {
            instance["SSGW"]["Gateway"].addr = product.cfg.split("|")[0].split(",")[0];
            instance["SSGW"]["Gateway"].port = product.cfg.split("|")[0].split(",")[1];
            instance["Strategy"][instance["Strategy"]["Strategies"][0]]["account"] = product.broker_customer_code.split(",").map(item => { return parseInt(item); });
        }

        this.tradePoint.send(107, 2000, { body: { name: config.name, config: JSON.stringify({ SS: instance }) } });
    }

    operateStrategyServer(config: WorkspaceConfig, action: number) {
        this.tradePoint.send(107, 2002, { routerid: 0, strategyserver: { name: config.name, action: action } });
    }

    onStartApp() {
        if (!this.appService.startApp(this.selectedStrategyConfig.name, AppType.kStrategyApp, {
            appid: this.selectedStrategyConfig.appid,
            name: this.selectedStrategyConfig.name
        })) {
            alert(`start ${this.selectedStrategyConfig.name} app error!`);
        }
    }
}