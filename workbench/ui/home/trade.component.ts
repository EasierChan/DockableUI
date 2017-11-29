"use strict";

import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { TileArea, Tile } from "../../../base/controls/control";
import { ConfigurationBLL, WorkspaceConfig, DataKey, AppType, Channel } from "../../bll/strategy.server";
import { Menu, AppStoreService } from "../../../base/api/services/backend.service";
import { QtpService } from "../../bll/services";
import { SSGW_MSG, ServiceType } from "../../../base/api/model";

@Component({
    moduleId: module.id,
    selector: "trade",
    templateUrl: "trade.component.html",
    styleUrls: ["trade.component.css"]
})
export class TradeComponent implements OnInit {
    areas: TileArea[];

    productArea: TileArea;
    products: any[];
    selectedProduct: any;

    strategyMenu: Menu;
    strategyArea: TileArea;
    strategyConfigs: Array<WorkspaceConfig>;
    selectedStrategyConfig: WorkspaceConfig;

    setting: any;
    ssgwAppID: number;

    constructor(private appsrv: AppStoreService, private tradeEndPoint: QtpService, private configBll: ConfigurationBLL, private ref: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.setting = this.appsrv.getSetting();
        this.ssgwAppID = this.setting.endpoints[0].tgw_apps.ssgw;
        this.areas = [];
        this.registerListeners();
        this.initializeStrategies();
    }

    registerListeners() {
        // subscribe strategy status

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

            this.tradeEndPoint.send(SSGW_MSG.kDelete, JSON.stringify({
                data: {
                    strategy: { strategy_server_id: this.selectedStrategyConfig.appid }
                },
                userid: this.appsrv.getUserProfile().username
            }), ServiceType.kSSGW);
        });
        // end strategyMenu

        this.strategyArea = new TileArea();
        this.strategyArea.title = "策略";
        this.strategyArea.onCreate = () => {
            AppStoreService.removeLocalStorageItem(DataKey.kStrategyCfg);
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
                if (this.selectedStrategyConfig.state > 0) {
                    this.onStartApp();
                } else {
                    alert("请先启动策略服务！");
                }
            } else if (event.button === 2) { // right click
                this.strategyMenu.popup();
            }
        };

        this.strategyConfigs = this.configBll.getRealTradeConfigs();
        this.strategyConfigs.forEach(config => {
            let tile = new Tile();
            tile.title = config.chname;
            tile.iconName = "tasks";
            tile.id = config.name;
            tile.backgroundColor = config.state !== 0 ? "#1d9661" : null;
            this.strategyArea.addTile(tile);
        });

        this.areas.push(this.strategyArea);

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

        this.tradeEndPoint.send(config.appid === undefined ? SSGW_MSG.kCreate : SSGW_MSG.kModify, JSON.stringify({
            data: {
                strategy: {
                    type: config.strategyType,
                    ui_params: config
                }
            },
            userid: this.appsrv.getUserProfile().username
        }), ServiceType.kSSGW);

        this.configBll.wait("策略操作失败");
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