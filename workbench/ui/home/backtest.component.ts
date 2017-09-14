"use strict";

import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
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
    strategyKeys: number[];
    ssgwAppID: number;
    backtestAppID: number;

    constructor(private appsrv: AppStoreService, private tradePoint: TradeService, private configBll: ConfigurationBLL) {
    }

    ngOnInit() {
        this.ssgwAppID = this.appsrv.getSetting().endpoints[0].tgw_apps.ssgw;
        this.backtestAppID = this.appsrv.getSetting().endpoints[0].tgw_apps.backtest;
        this.registerListeners();
        this.initializeStrategies();
    }

    registerListeners() {
        let strategyKeys = [];

        this.tradePoint.addSlot({
            appid: this.ssgwAppID,
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
                    let idx = this.strategyKeys.indexOf(config.items[0].key);
                    if (idx < 0)
                        this.strategyKeys.push(config.items[0].key);
                    else
                        this.strategyKeys[idx] = config.items[0].key;

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
            appid: this.backtestAppID,
            packid: 8012,
            callback: msg => {
                let config = this.strategyConfigs.find(item => { return item.name === this.requestMap[msg.content.reqsn]; });

                if (config) {
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
                    let instruments = instance["Strategy"][instance["Strategy"]["Strategies"][0]]["Instrument"];
                    config.items[0].instruments.forEach(instrument => {
                        if (instruments.hasOwnProperty(instrument.name)) {
                            instruments[instrument.name].value = instrument.value;
                        }
                    });
                    config.backtestConfig.tradePoint = { host: msg.content.url, port: msg.content.port };
                    config.backtestConfig.quotePoint = { host: msg.content.hqurl, port: msg.content.hqport };
                    instance["SSGW"]["Gateway"].addr = config.backtestConfig.tradePoint.host;
                    instance["SSGW"]["Gateway"].port = config.backtestConfig.tradePoint.port;
                    instance["SSFeed"]["PS"].addr = config.backtestConfig.quotePoint.port;
                    instance["SSFeed"]["PS"].port = config.backtestConfig.quotePoint.port;

                    this.tradePoint.send(this.ssgwAppID, 2000, { body: { name: config.name, config: JSON.stringify({ SS: instance }) } });
                }
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
        this.strategyMenu.addItem("移至仿真", () => {
            this.operateStrategyServer(this.selectedStrategyConfig, 0);

            this.configBll.moveConfig(this.selectedStrategyConfig, Channel.SIMULATION);
            this.strategyArea.removeTile(this.selectedStrategyConfig.chname);
            this.strategyKeys.splice(this.strategyKeys.indexOf(this.selectedStrategyConfig.items[0].key), 1);
            this.refreshSubscribe();
        });
        this.strategyMenu.addItem("修改", () => {
            this.appsrv.startApp("策略配置", "Dialog", {
                dlg_name: "strategy",
                config: this.selectedStrategyConfig,
                strategies: this.configBll.getTemplates()
            });
        });
        this.strategyMenu.addItem("删除", () => {
            if (!confirm("确定删除？"))
                return;

            this.configBll.removeConfig(this.selectedStrategyConfig);
            this.strategyArea.removeTile(this.selectedStrategyConfig.chname);
            this.strategyKeys.splice(this.strategyKeys.indexOf(this.selectedStrategyConfig.items[0].key), 1);
            this.refreshSubscribe();
        });
        // end strategyMenu

        this.strategyArea = new TileArea();
        this.strategyArea.title = "策略";
        this.strategyArea.onCreate = () => {
            let config = new WorkspaceConfig();
            config.activeChannel = Channel.BACKTEST;
            this.appsrv.startApp("策略配置", "Dialog", { dlg_name: "strategy", config: config, strategies: this.configBll.getTemplates() });
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

        this.strategyConfigs = this.configBll.getBackTestConfigs();
        this.strategyConfigs.forEach(config => {
            let tile = new Tile();
            tile.title = config.chname;
            tile.iconName = "tasks";
            tile.data = config.name;
            this.strategyArea.addTile(tile);
            this.strategyKeys.push(config.items[0].key);
        });

        // strategy status
        this.refreshSubscribe();
        this.appsrv.onUpdateApp(this.updateApp, this);
    }

    // update app info
    updateApp(params) {
        switch (params.type) {
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
        this.tradePoint.send(this.backtestAppID, 8010, tmpobj);
    }

    operateStrategyServer(config: WorkspaceConfig, action: number) {
        this.tradePoint.send(this.ssgwAppID, 2002, { routerid: 0, strategyserver: { name: config.name, action: action } });
    }

    onStartApp() {
        if (!this.appsrv.startApp(this.selectedStrategyConfig.name, AppType.kStrategyApp, {
            appid: this.selectedStrategyConfig.appid,
            name: this.selectedStrategyConfig.name
        })) {
            alert(`start ${this.selectedStrategyConfig.name} app error!`);
        }
    }
}
