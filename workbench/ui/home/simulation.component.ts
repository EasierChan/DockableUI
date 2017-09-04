"use strict";

import { Component, OnInit } from "@angular/core";
import { TileArea, Tile } from "../../../base/controls/control";
import { ConfigurationBLL, WorkspaceConfig, DataKey, AppType, Channel } from "../../bll/strategy.server";
import { Menu, AppStoreService } from "../../../base/api/services/backend.service";
import { TradeService } from "../../bll/services";

declare var window: any;
let ip20strs = [];
@Component({
    moduleId: module.id,
    selector: "simulation",
    template: `<tilearea [dataSource]="strategyArea.dataSource" [styleObj]="strategyArea.styleObj"></tilearea>`,
    styleUrls: ["simulation.component.css"],
    providers: [
        Menu,
        ConfigurationBLL
    ]
})
export class SimulationComponent implements OnInit {
    strategyMenu: Menu;
    strategyArea: TileArea;
    strategyConfigs: Array<WorkspaceConfig>;
    selectedStrategyConfig: WorkspaceConfig;
    strategyKeys: number[];

    constructor(private appService: AppStoreService, private tradePoint: TradeService, private configBll: ConfigurationBLL) {
    }

    ngOnInit() {
        this.appService.onUpdateApp(this.updateApp, this);
        this.registerListeners();
        this.initializeStrategies();
    }

    registerListeners() {
        let strategyKeys = [];

        this.tradePoint.addSlot({
            appid: 107,
            packid: 2001, // 创建策略回报
            callback: msg => {
                console.info(msg);
                if (msg.content.body.errorid !== 0) {
                    console.error(`errorid: ${msg.content.body.errorid}, errmsg: ${msg.content.body.description}`);
                    return;
                }

                let config = this.strategyConfigs.find(item => { return item.name === msg.content.body.name; });

                if (config) {
                    config.appid = msg.content.body.appid;
                    config.items[0].key = msg.content.body.strategy_key;
                    this.strategyKeys.push(config.items[0].key);

                    let tile = this.strategyArea.getTile(config.name);

                    if (null === tile) {
                        tile = new Tile();
                        tile.title = config.chname;
                        tile.iconName = "tasks";
                        this.strategyArea.addTile(tile);
                    }

                    this.configBll.updateConfig(config);
                    this.tradePoint.send(17, 101, { topic: 8000, kwlist: this.strategyKeys });
                }
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
                console.info(msg);
                let target = this.strategyConfigs.find(citem => { return citem.name === msg.content.strategyserver.name; });

                if (target !== undefined)
                    this.strategyArea.getTile(target.chname).backgroundColor = msg.content.strategyserver.stat !== 0 ? "#1d9661" : null;

            }
        });
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
                strategies: this.configBll.getTemplates()
            });
        });
        this.strategyMenu.addItem("删除", () => {
            if (!confirm("确定删除？"))
                return;

            let len = this.strategyConfigs.length;
            for (let i = 0; i < len; ++i) {
                if (this.strategyConfigs[i].chname === this.selectedStrategyConfig.chname) {
                    this.strategyConfigs.splice(i, 1);
                    this.configBll.updateConfig();
                    this.strategyArea.removeTile(this.selectedStrategyConfig.chname);
                    break;
                }
            }
        });
        // end strategyMenu

        this.strategyArea = new TileArea();
        this.strategyArea.title = "策略";
        this.strategyArea.onCreate = () => {
            let config = new WorkspaceConfig();
            config.activeChannel = Channel.SIMULATION;
            this.appService.startApp("策略配置", "Dialog", { dlg_name: "strategy", config: config, strategies: this.configBll.getTemplates() });
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

        // strategy status
        this.tradePoint.send(17, 101, { topic: 8000, kwlist: this.strategyKeys });
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
        console.info(config);
        this.strategyConfigs.push(config);
        let instance = this.configBll.getTemplateByName(config.strategyType);
        instance["ss_instance_name"] = config.name;
        instance["SSData"]["backup"]["path"] += config.name;
        instance["SSInfo"]["name"] = config.name;
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