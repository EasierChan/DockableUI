"use strict";

import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { TileArea, Tile } from "../../../base/controls/control";
import { ConfigurationBLL, WorkspaceConfig, DataKey, AppType, Channel } from "../../bll/strategy.server";
import { Menu, AppStoreService } from "../../../base/api/services/backend.service";
import { TradeService } from "../../bll/services";

@Component({
    moduleId: module.id,
    selector: "trade",
    templateUrl: "trade.component.html",
    styleUrls: ["trade.component.css"]
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

    setting: any;
    quoteEndpoint: any;
    ssgwAppID: number;

    constructor(private appsrv: AppStoreService, private tradeEndPoint: TradeService, private configBll: ConfigurationBLL, private ref: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.setting = this.appsrv.getSetting();
        this.ssgwAppID = this.setting.endpoints[0].tgw_apps.ssgw;
        this.areas = [];
        this.registerListeners();
        this.initializeProducts();
        this.initializeStrategies();
        this.initializeAnylatics();

        this.quoteEndpoint = this.setting.endpoints[0].quote_addr.split(":");
    }

    registerListeners() {
        // subscribe strategy status
    }

    initializeProducts() {
        this.productArea = new TileArea();
        this.productArea.title = "产品";
        this.productArea.onClick = (event: MouseEvent, item: Tile) => {
            if (event.button === 0) {  // left click
                this.appsrv.startApp("产品信息", "Dialog", {
                    dlg_name: "product",
                    productID: item.data
                });
            }
        };

        this.products = this.configBll.getProducts();
        if (this.products) {
            this.products.forEach(product => {
                let tile = new Tile();
                tile.title = product.tblock_full_name;
                tile.iconName = "folder-close";
                tile.data = product.tblock_id;
                this.productArea.addTile(tile);
            });
        }

        this.areas.push(this.productArea);
    }

    initializeStrategies() {
        // strategyMenu
        this.strategyMenu = new Menu();
        this.strategyMenu.addItem("启动", () => {
            this.operateStrategyServer(this.selectedStrategyConfig, 1);
        });
        this.strategyMenu.addItem("停止", () => {
            this.operateStrategyServer(this.selectedStrategyConfig, 0);
        });
        this.strategyMenu.addItem("修改", () => {
            this.appsrv.startApp("策略配置", "Dialog", {
                dlg_name: "strategy",
                config: this.selectedStrategyConfig,
                products: this.products,
                strategies: this.configBll.getTemplates(),
                forbidNames: this.getTileNames()
            });
            this.selectedStrategyConfig = null;
        });
        this.strategyMenu.addItem("删除", () => {
            if (!confirm("确定删除？"))
                return;

            this.operateStrategyServer(this.selectedStrategyConfig, 0);
            this.configBll.removeConfig(this.selectedStrategyConfig);
            this.strategyArea.removeTile(this.selectedStrategyConfig.chname);
            this.tradeEndPoint.send(17, 101, { topic: 8000, kwlist: this.configBll.strategyKeys });
            this.tradeEndPoint.send(this.ssgwAppID, 2014, { body: { name: this.selectedStrategyConfig.name } });
            this.selectedStrategyConfig = null;
        });
        // end strategyMenu

        this.strategyArea = new TileArea();
        this.strategyArea.title = "策略";
        this.strategyArea.onCreate = () => {
            let config = new WorkspaceConfig();
            config.activeChannel = Channel.ONLINE;
            this.appsrv.startApp("策略配置", "Dialog", {
                dlg_name: "strategy", config: config, strategies: this.configBll.getTemplates(), products: this.products,
                forbidNames: this.getTileNames()
            });
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
            tile.backgroundColor = config.state !== 0 ? "#1d9661" : null;
            this.strategyArea.addTile(tile);
        });

        this.areas.push(this.strategyArea);

        this.configBll.onCreated = (config) => {
            let tile = new Tile();
            tile.title = config.chname;
            tile.iconName = "tasks";
            tile.data = config.name;
            tile.backgroundColor = config.state !== 0 ? "#1d9661" : null;
            this.strategyArea.addTile(tile);
        };

        this.configBll.onUpdated = (oldName, config: WorkspaceConfig) => {
            this.strategyArea.getTile(oldName).title = config.chname;
            this.ref.detectChanges();
        };

        this.configBll.onStateChanged = (config: WorkspaceConfig) => {
            let tile = this.strategyArea.getTile(config.chname);
            if (tile !== null)
                tile.backgroundColor = config.state !== 0 ? "#1d9661" : null;
        };
        // strategy status
        this.appsrv.onUpdateApp(this.updateApp, this);
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
            this.appsrv.startApp("Untitled", AppType.kSpreadViewer, {
                port: parseInt(this.quoteEndpoint[1]),
                host: this.quoteEndpoint[0],
                lang: this.setting.language
            });
        };

        this.analyticArea.onClick = (event: MouseEvent, item: Tile) => {
            this.selectedSpreadItem = item;

            if (event.button === 0) {
                if (!this.appsrv.startApp(item.title, AppType.kSpreadViewer, {
                    port: parseInt(this.quoteEndpoint[1]),
                    host: this.quoteEndpoint[0],
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
                if (AppStoreService.getLocalStorageItem(DataKey.kStrategyCfg) !== null) {
                    this.updateStrategyConfig(JSON.parse(AppStoreService.getLocalStorageItem(DataKey.kStrategyCfg)));
                }
                break;
        }
    }

    updateStrategyConfig(config: WorkspaceConfig) {
        this.configBll.tempConfig = config;

        this.tradeEndPoint.send(this.ssgwAppID, 2000, { body: { name: config.name, config: JSON.stringify({ SS: this.configBll.genInstance(config) }) } });
        this.configBll.wait("策略操作失败");
    }

    operateStrategyServer(config: WorkspaceConfig, action: number) {
        this.tradeEndPoint.send(this.ssgwAppID, 2002, { routerid: 0, strategyserver: { name: config.name, action: action } });
    }

    onStartApp() {
        if (!this.appsrv.startApp(this.selectedStrategyConfig.name, AppType.kStrategyApp, {
            appid: this.selectedStrategyConfig.appid,
            name: this.selectedStrategyConfig.name
        })) {
            alert(`start ${this.selectedStrategyConfig.name} app error!`);
        }
    }

    getTileNames(): string[] {
        let ret = [];

        this.strategyArea.items.forEach(tile => {
            ret.push(tile.title);
        });

        return ret;
    }
}