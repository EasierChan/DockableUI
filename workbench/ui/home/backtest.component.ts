"use strict";

import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { TileArea, Tile } from "../../../base/controls/control";
import { ConfigurationBLL, WorkspaceConfig, DataKey, AppType, Channel } from "../../bll/strategy.server";
import { Menu, AppStoreService } from "../../../base/api/services/backend.service";
import { TradeService } from "../../bll/services";

@Component({
    moduleId: module.id,
    selector: "backtest",
    template: `<tilearea [dataSource]="strategyArea.dataSource" [styleObj]="strategyArea.styleObj"></tilearea>`,
    styleUrls: ["backtest.component.css"]
})
export class BacktestComponent implements OnInit {
    static reqnum = 1;
    requestMap = {};

    strategyMenu: Menu;
    strategyArea: TileArea;
    strategyConfigs: Array<WorkspaceConfig>;
    selectedStrategyConfig: WorkspaceConfig;
    ssgwAppID: number;
    backtestAppID: number;

    constructor(private appsrv: AppStoreService, private tradeEndPoint: TradeService, private configBll: ConfigurationBLL, private ref: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.ssgwAppID = this.appsrv.getSetting().endpoints[0].tgw_apps.ssgw;
        this.backtestAppID = this.appsrv.getSetting().endpoints[0].tgw_apps.backtest;
        this.registerListeners();
        this.initializeStrategies();
    }

    registerListeners() {
        this.tradeEndPoint.addSlot({
            appid: this.backtestAppID,
            packid: 8012,
            callback: msg => {
                console.info(msg);
                let config: WorkspaceConfig;
                if (this.configBll.tempConfig && this.configBll.tempConfig.name === this.requestMap[msg.content.reqsn]) {
                    config = this.configBll.tempConfig;
                } else {
                    config = this.strategyConfigs.find(item => { return item.name === this.requestMap[msg.content.reqsn]; });
                }

                if (config) {
                    config.backtestConfig.tradePoint = { host: msg.content.url, port: msg.content.port };
                    config.backtestConfig.quotePoint = { host: msg.content.hqurl, port: msg.content.hqport };
                    config.backtestConfig.id = msg.content.nId;
                    config.backtestConfig.name = config.name;

                    this.tradeEndPoint.send(this.ssgwAppID, 2000, { body: { name: config.name, config: JSON.stringify({ SS: this.configBll.genInstance(config) }) } });
                    // this.configBll.addLoopbackItems(config.backtestConfig);
                }
            }
        });

        this.tradeEndPoint.addSlot({
            appid: this.ssgwAppID,
            packid: 2015,
            callback: (msg) => {
                console.info(msg);
                if (msg.content.body.error_id === 0) {
                    let config = this.strategyConfigs.find((item) => { return item.name === msg.content.body.name; });

                    if (config) {
                        this.operateStrategyServer(config, 0);
                        this.configBll.removeConfig(config);
                        this.strategyArea.removeTile(config.chname);
                        this.tradeEndPoint.send(17, 101, { topic: 8000, kwlist: this.configBll.strategyKeys });
                    }
                }
            }
        });
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
        this.strategyMenu.addItem("移至仿真", () => {
            this.operateStrategyServer(this.selectedStrategyConfig, 0);

            this.configBll.moveConfig(this.selectedStrategyConfig, Channel.SIMULATION);
            this.strategyArea.removeTile(this.selectedStrategyConfig.chname);
            this.tradeEndPoint.send(this.ssgwAppID, 2000, { body: { name: this.selectedStrategyConfig.name, config: JSON.stringify({ SS: this.configBll.genInstance(this.selectedStrategyConfig) }) } });
            this.selectedStrategyConfig = null;
        });
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

            this.tradeEndPoint.send(this.ssgwAppID, 2014, { body: { name: this.selectedStrategyConfig.name } });
        });
        // end strategyMenu

        this.strategyArea = new TileArea();
        this.strategyArea.title = "策略";
        this.strategyArea.onCreate = () => {
            let config = new WorkspaceConfig();
            config.activeChannel = Channel.BACKTEST;
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
                if (this.selectedStrategyConfig.state > 0) {
                    this.onStartApp();
                } else {
                    alert("请先启动策略服务！");
                }
            } else if (event.button === 2) { // right click
                this.strategyMenu.popup();
            }
        };

        this.strategyConfigs = this.configBll.getBackTestConfigs();
        this.strategyConfigs.forEach(config => {
            let tile = new Tile();
            tile.title = config.chname;
            tile.iconName = "tasks";
            tile.id = config.name;
            tile.backgroundColor = config.state !== 0 ? "#1d9661" : null;
            this.strategyArea.addTile(tile);
        });

        this.configBll.onCreated = (config) => {
            let tile = new Tile();
            tile.title = config.chname;
            tile.iconName = "tasks";
            tile.id = config.name;
            tile.backgroundColor = config.state !== 0 ? "#1d9661" : null;
            this.strategyArea.addTile(tile);
        };

        this.configBll.onUpdated = (oldName, config: WorkspaceConfig) => {
            this.strategyArea.getTile(config.name).title = config.chname;
            this.ref.detectChanges();
        };

        this.configBll.onStateChanged = (config: WorkspaceConfig) => {
            let tile = this.strategyArea.getTile(config.name);
            if (tile !== null) {
                tile.backgroundColor = config.state !== 0 ? "#1d9661" : null;
            }
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

        let tmpobj = {
            reqsn: BacktestComponent.reqnum++,
            timebegin: parseInt(config.backtestConfig.timebegin.split("-").join("")),
            timeend: parseInt(config.backtestConfig.timeend.split("-").join("")),
            speed: parseInt(config.backtestConfig.speed),
            simlevel: parseInt(config.backtestConfig.simlevel),
            period: parseInt(config.backtestConfig.period),
            unit: parseInt(config.backtestConfig.unit)
        };

        this.requestMap[tmpobj.reqsn] = config.name;
        this.tradeEndPoint.send(this.backtestAppID, 8010, tmpobj);
        this.configBll.wait("策略操作失败");
    }

    operateStrategyServer(config: WorkspaceConfig, action: number) {
        this.tradeEndPoint.send(this.ssgwAppID, 2002, { routerid: 0, strategyserver: { name: config.name, action: action } });
    }

    onStartApp() {
        if (!this.appsrv.startApp(this.selectedStrategyConfig.name, AppType.kStrategyApp, {
            appid: this.selectedStrategyConfig.appid,
            name: this.selectedStrategyConfig.name,
            title: this.selectedStrategyConfig.chname
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
