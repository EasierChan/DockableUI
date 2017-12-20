"use strict";

import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { TileArea, Tile } from "../../../base/controls/control";
import { ConfigurationBLL, WorkspaceConfig, DataKey, AppType, Channel } from "../../bll/strategy.server";
import { Menu, AppStoreService } from "../../../base/api/services/backend.service";
import { QtpService } from "../../bll/services";
import { SSGW_MSG, ServiceType } from "../../../base/api/model";

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

    constructor(private appsrv: AppStoreService, private tradeEndPoint: QtpService, private configBll: ConfigurationBLL, private ref: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.ssgwAppID = this.appsrv.getSetting().endpoints[0].tgw_apps.ssgw;
        this.registerListeners();
        this.initializeStrategies();
    }

    registerListeners() {
        this.tradeEndPoint.addSlot({
            service: ServiceType.kBackServer,
            msgtype: 8012,
            callback: msg => {
                console.info(msg);
                let config: WorkspaceConfig;
                if (this.configBll.tempConfig && this.configBll.tempConfig.chname === this.requestMap[msg.content.reqsn]) {
                    config = this.configBll.tempConfig;
                } else {
                    config = this.strategyConfigs.find(item => { return item.chname === this.requestMap[msg.content.reqsn]; });
                }

                if (config) {
                    config.backtestConfig.tradePoint = { host: msg.content.url, port: msg.content.port };
                    config.backtestConfig.quotePoint = { host: msg.content.hqurl, port: msg.content.hqport };
                    config.backtestConfig.id = msg.content.nId;
                    config.backtestConfig.name = config.chname;

                    this.tradeEndPoint.send(config.appid === undefined ? SSGW_MSG.kCreate : SSGW_MSG.kModify, JSON.stringify({
                        data: {
                            strategy: { type: config.strategyType, config: config }
                        },
                        userid: this.appsrv.getUserProfile().username
                    }), ServiceType.kSSGW);
                    this.configBll.addLoopbackItems(config.backtestConfig);
                }
            }
        });

        this.tradeEndPoint.addSlot({
            service: ServiceType.kSSGW,
            msgtype: SSGW_MSG.kDeleteAns,
            callback: (msg) => {
                console.info(msg);
                let deleteAns = JSON.parse(msg.toString());

                if (deleteAns.data.msgret.error_id !== 0) {
                    alert(deleteAns.data.msgret.error_msg);
                    return;
                }

                let config = this.strategyConfigs.find((item) => { return item.appid === deleteAns.data.strategy_server_id; });

                if (config) {
                    this.tradeEndPoint.send(SSGW_MSG.kStop, JSON.stringify({
                        data: { strategy: { strategy_server_id: config.appid } },
                        userid: this.appsrv.getUserProfile().username
                    }), ServiceType.kSSGW);

                    this.configBll.removeConfig(config);
                    this.strategyArea.removeTile(config.chname);
                    this.tradeEndPoint.subscribe(2001, [config.appid], true);
                }
            }
        });
    }

    initializeStrategies() {
        // strategyMenu
        this.strategyMenu = new Menu();
        this.strategyMenu.addItem("启动", () => {
            this.tradeEndPoint.send(SSGW_MSG.kStart, JSON.stringify({
                data: { strategy: { strategy_server_id: this.selectedStrategyConfig.appid } },
                userid: this.appsrv.getUserProfile().username
            }), ServiceType.kSSGW);
        });
        this.strategyMenu.addItem("停止", () => {
            this.tradeEndPoint.send(SSGW_MSG.kStop, JSON.stringify({
                data: { strategy: { strategy_server_id: this.selectedStrategyConfig.appid } },
                userid: this.appsrv.getUserProfile().username
            }), ServiceType.kSSGW);
        });
        this.strategyMenu.addItem("移至仿真", () => {
            this.tradeEndPoint.send(SSGW_MSG.kStop, JSON.stringify({
                data: { strategy: { strategy_server_id: this.selectedStrategyConfig.appid } },
                userid: this.appsrv.getUserProfile().username
            }), ServiceType.kSSGW);

            this.configBll.moveConfig(this.selectedStrategyConfig, Channel.SIMULATION);
            this.strategyArea.removeTile(this.selectedStrategyConfig.chname);
            this.tradeEndPoint.send(SSGW_MSG.kCreate, JSON.stringify({
                data: { strategy: { strategy_server_id: this.selectedStrategyConfig.appid } },
                userid: this.appsrv.getUserProfile().username
            }), ServiceType.kSSGW);
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

            this.tradeEndPoint.send(SSGW_MSG.kDelete, JSON.stringify({
                data: { strategy: { strategy_server_id: this.selectedStrategyConfig.appid } },
                userid: this.appsrv.getUserProfile().username
            }), ServiceType.kSSGW);
        });
        // end strategyMenu

        this.strategyArea = new TileArea();
        this.strategyArea.title = "策略";
        this.strategyArea.onCreate = () => {
            AppStoreService.removeLocalStorageItem(DataKey.kStrategyCfg);
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
            tile.id = config.appid;
            tile.backgroundColor = config.state !== 0 ? "#1d9661" : null;
            this.strategyArea.addTile(tile);
        });

        this.configBll.onCreated = (config) => {
            let tile = new Tile();
            tile.title = config.chname;
            tile.iconName = "tasks";
            tile.id = config.appid;
            tile.backgroundColor = config.state !== 0 ? "#1d9661" : null;
            this.strategyArea.addTile(tile);
        };

        this.configBll.onUpdated = (oldName, config: WorkspaceConfig) => {
            this.strategyArea.getTile(config.appid).title = config.chname;
            this.ref.detectChanges();
        };

        this.configBll.onStateChanged = (config: WorkspaceConfig) => {
            let tile = this.strategyArea.getTile(config.appid);
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

        this.requestMap[tmpobj.reqsn] = config.chname;
        this.tradeEndPoint.send(8010, JSON.stringify(tmpobj), ServiceType.kBackServer);
        this.configBll.wait("策略操作失败");
    }

    onStartApp() {
        if (!this.appsrv.startApp(this.selectedStrategyConfig.appid.toString(), AppType.kStrategyApp, {
            appid: this.selectedStrategyConfig.appid,
            name: this.selectedStrategyConfig.appid.toString(),
            title: this.selectedStrategyConfig.chname
        })) {
            alert(`start ${this.selectedStrategyConfig.chname} app error!`);
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
