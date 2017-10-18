"use strict";

import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { TileArea, Tile } from "../../../base/controls/control";
import { ConfigurationBLL, WorkspaceConfig, DataKey, AppType, Channel } from "../../bll/strategy.server";
import { Menu, MenuItem, AppStoreService } from "../../../base/api/services/backend.service";
import { TradeService } from "../../bll/services";

@Component({
    moduleId: module.id,
    selector: "simulation",
    template: `<tilearea [dataSource]="strategyArea.dataSource" [styleObj]="strategyArea.styleObj"></tilearea>`,
    styleUrls: ["simulation.component.css"]
})
export class SimulationComponent implements OnInit {
    strategyMenu: Menu;
    strategyArea: TileArea;
    strategyConfigs: Array<WorkspaceConfig>;
    selectedStrategyConfig: WorkspaceConfig;
    ssgwAppID: number;

    constructor(private appsrv: AppStoreService, private tradeEndPoint: TradeService, private configBll: ConfigurationBLL, private ref: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.ssgwAppID = this.appsrv.getSetting().endpoints[0].tgw_apps.ssgw;
        this.registerListeners();
        this.initializeStrategies();
    }

    registerListeners() {
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

        let subMenu = new Menu();
        this.configBll.getProducts().forEach(product => {
            subMenu.addItem(product.caname, () => {
                this.selectedStrategyConfig.productID = product.caid;
                this.operateStrategyServer(this.selectedStrategyConfig, 0);
                this.configBll.moveConfig(this.selectedStrategyConfig, Channel.ONLINE);
                this.strategyArea.removeTile(this.selectedStrategyConfig.chname);
                this.tradeEndPoint.send(this.ssgwAppID, 2000, { body: { name: this.selectedStrategyConfig.name, config: JSON.stringify({ SS: this.configBll.genInstance(this.selectedStrategyConfig) }) } });
                this.selectedStrategyConfig = null;
            });
        });

        this.strategyMenu.addItem(MenuItem.createSubmenu("移至实盘产品", subMenu));

        this.strategyMenu.addItem("修改", () => {
            this.appsrv.startApp("策略配置", "Dialog", {
                dlg_name: "strategy",
                config: this.selectedStrategyConfig,
                strategies: this.configBll.getTemplates(),
                forbidNames: this.getTileNames()
            });
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
            config.activeChannel = Channel.SIMULATION;
            this.appsrv.startApp("策略配置", "Dialog", {
                dlg_name: "strategy", config: config,
                strategies: this.configBll.getTemplates(),
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

        this.strategyConfigs = this.configBll.getSimulationConfigs();
        this.strategyConfigs.forEach(config => {
            let tile = new Tile();
            tile.title = config.chname;
            tile.iconName = "tasks";
            tile.data = config.name;
            tile.backgroundColor = config.state !== 0 ? "#1d9661" : null;
            this.strategyArea.addTile(tile);
        });

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

    // update app info
    updateApp(params) {
        switch (params.type) {
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
        this.configBll.wait("策略操作失败", 2000);
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