/**
 * created by cl, 2017/05/09
 * update: [date]
 * desc:
 */
"use strict";

import { Component, OnInit, ChangeDetectorRef, OnDestroy } from "@angular/core";
import {
    Control, ComboControl, MetaControl, SpreadViewer, SpreadViewerConfig,
    VBox, HBox, TextBox, Button, DockContainer
} from "../../base/controls/control";

import {
    AppStoreService, ChildProcess, Http, ULogger,
    Environment, SecuMasterService, TranslateService
} from "../../base/api/services/backend.service";
import { QtpService, QuoteService, TradeService } from "../bll/services";
import { ConfigurationBLL } from "../bll/strategy.server";
import { DataSet } from "./home/common";

import { ActionBar, Label } from "../../base/controls/control";
import { FGS_MSG, SSGW_MSG, ServiceType } from "../../base/api/model";
/**
 * for actionBar test
 */
@Component({
    moduleId: module.id,
    selector: "body",
    templateUrl: "app.component.html",
    styleUrls: ["app.component.css"],
    providers: [
        QtpService,
        TradeService,
        QuoteService,
        AppStoreService,
        SecuMasterService,
        ConfigurationBLL
    ]
})
export class AppComponent implements OnInit, OnDestroy {
    actionBar: ActionBar;
    curPage: string;
    homeMod: string;
    activeTab: string;
    isonpacks: any;
    productAppID: number;
    scmsAppID: number;
    ssgwAppID: number;

    constructor(private tradeEndPoint: QtpService,
        private quote: QuoteService,
        private appSrv: AppStoreService,
        private configBll: ConfigurationBLL) {
    }

    get setting() {
        return this.appSrv.getSetting();
    }

    ngOnInit() {
        this.productAppID = this.setting.endpoints[0].tgw_apps.ids;
        this.scmsAppID = this.setting.endpoints[0].tgw_apps.scms;
        this.ssgwAppID = this.setting.endpoints[0].tgw_apps.ssgw;
        this.isonpacks = {};
        this.homeMod = DataSet.modules[0].name;
        this.activeTab = DataSet.tabs(this.homeMod)[0];
        this.actionBar = new ActionBar();
        this.actionBar.backgroundColor = "#383F54";

        DataSet.modules.forEach((item, index) => {
            this.actionBar.addFeature({
                iconName: item.icon,
                tooltip: item.name,
                title: item.name,
                active: false,
            });
        });

        this.actionBar.addFeature({
            iconName: "search",
            tooltip: "证券信息",
            title: "证券信息",
            active: false
        });

        this.actionBar.addSettings({
            iconName: "user",
            tooltip: "个人中心",
            title: "个人中心",
            active: false
        });

        this.actionBar.addSettings({
            iconName: "cog",
            tooltip: "设置",
            title: "设置",
            active: false
        });

        // this.actionBar.addSettings({
        //     iconName: "info-sign",
        //     tooltip: "支持",
        //     title: "支持",
        //     active: false
        // });

        this.actionBar.addSettings({
            iconName: "off",
            tooltip: "退出",
            title: "退出",
            active: false
        });

        let disables = ["智能预测"]; // 
        this.actionBar.onClick = (item) => {
            if (disables.indexOf(item.title) >= 0) {
                alert("当前未开放权限");
                return;
            }

            switch (item.title) {
                case "资讯动态":
                    if (!this.appSrv.isLoginTrade()) {
                        this.actionBar.click(this.actionBar.getItem("个人中心"));
                        break;
                    }
                    this.curPage = "home";
                    this.homeMod = item.title;
                    this.activeTab = DataSet.tabs(this.homeMod)[0];
                    this.actionBar.activeItem = item;
                    break;
                case "实盘交易":
                    if (!this.appSrv.isLoginTrade()) {
                        this.actionBar.click(this.actionBar.getItem("个人中心"));
                        break;
                    }
                    this.curPage = "home";
                    this.homeMod = item.title;
                    this.activeTab = DataSet.tabs(this.homeMod)[1];
                    this.actionBar.activeItem = item;
                    break;
                case "模拟交易":
                    if (!this.appSrv.isLoginTrade()) {
                        this.actionBar.click(this.actionBar.getItem("个人中心"));
                        break;
                    }
                    this.curPage = "home";
                    this.homeMod = item.title;
                    this.activeTab = DataSet.tabs(this.homeMod)[0];
                    this.actionBar.activeItem = item;
                    break;
                case "历史回测":
                    if (!this.appSrv.isLoginTrade()) {
                        this.actionBar.click(this.actionBar.getItem("个人中心"));
                        break;
                    }
                    this.curPage = "home";
                    this.homeMod = item.title;
                    this.activeTab = DataSet.tabs(this.homeMod)[0];
                    this.actionBar.activeItem = item;
                    break;
                case "智能预测":
                    if (!this.appSrv.isLoginTrade()) {
                        this.actionBar.click(this.actionBar.getItem("个人中心"));
                        break;
                    }
                    this.curPage = "home";
                    this.homeMod = item.title;
                    this.activeTab = DataSet.tabs(this.homeMod)[0];
                    this.actionBar.activeItem = item;
                    break;
                case "行情分析":
                    if (!this.appSrv.isLoginTrade()) {
                        this.actionBar.click(this.actionBar.getItem("个人中心"));
                        break;
                    }
                    this.curPage = "home";
                    this.homeMod = item.title;
                    this.activeTab = DataSet.tabs(this.homeMod)[0];
                    this.actionBar.activeItem = item;
                    break;
                case "证券信息":
                    if (!this.appSrv.isLoginTrade()) {
                        this.actionBar.click(this.actionBar.getItem("个人中心"));
                        break;
                    }
                    this.curPage = "security";
                    this.actionBar.activeItem = item;
                    break;
                case "时间回溯":
                    if (!this.appSrv.isLoginTrade()) {
                        this.actionBar.click(this.actionBar.getItem("个人中心"));
                        break;
                    }
                    Http.get(this.setting.externalLinks.TimeMachine);
                    break;
                case "超级图表":
                    if (!this.appSrv.isLoginTrade()) {
                        this.actionBar.click(this.actionBar.getItem("个人中心"));
                        break;
                    }
                    this.curPage = "analysis";
                    this.actionBar.activeItem = item;
                    break;
                case "产品监控":
                    if (!this.appSrv.isLoginTrade()) {
                        this.actionBar.click(this.actionBar.getItem("个人中心"));
                        break;
                    }
                    ChildProcess.openUrl(this.setting.externalLinks.CSP);
                    break;
                case "设置":
                    this.curPage = "setting";
                    this.actionBar.activeItem = item;
                    break;
                case "个人中心":
                    this.curPage = "user";
                    this.actionBar.activeItem = item;
                    break;
                // case "支持":
                //     this.curPage = "support";
                //     this.actionBar.activeItem = item;
                //     break;
                case "退出":
                    this.appSrv.quitAll();
                    break;
                default:
                    alert(`unhandler module: ${item.title}`);
                    break;
            }
        };

        this.registerListeners();
        ULogger.init("log", Environment.getDataPath("workbench"));

        if (this.appSrv.isLoginTrade()) {
            this.actionBar.click(this.actionBar.getItem("资讯动态"));
        } else {
            this.actionBar.click(this.actionBar.getItem("个人中心"));
            this.appSrv.loginSuccess = () => {
                this.actionBar.click(this.actionBar.getItem("资讯动态"));
            };

            this.appSrv.loginFailed = () => {
                this.actionBar.click(this.actionBar.getItem("个人中心"));
            };
        }
    }

    registerListeners() {
        this.tradeEndPoint.addSlot(
            {
                service: ServiceType.kFGS,
                msgtype: FGS_MSG.kFGSAns,
                callback: (msg) => {
                    console.info(msg.toString());
                }
            },
            {
                service: ServiceType.kSSGW,
                msgtype: SSGW_MSG.kCreateAns, // 创建策略回报
                callback: msg => {
                    console.debug(msg.toString());
                    let createAns = JSON.parse(msg.toString());

                    if (createAns.data.msgret.error_id !== 0) {
                        console.error(`errorid: ${createAns.data.msgret.error_id}.`);
                        return;
                    }

                    let config = this.configBll.tempConfig;

                    if (config) {
                        config.appid = createAns.data.strategy_server_id;
                        config.items[0].key = createAns.data.strategies[0].strategy_id;
                        config.items[0].accounts = createAns.data.strategies[0].portfolios;
                        let idx = this.configBll.servers.indexOf(config.appid);
                        if (idx < 0)
                            this.configBll.servers.push(config.appid);
                        else
                            this.configBll.servers[idx] = config.appid;

                        this.configBll.updateConfig(config);
                        // this.tradeEndPoint.subscribe(8000, this.configBll.servers);
                    }
                }
            },
            {
                service: ServiceType.kSSGW,
                msgtype: SSGW_MSG.kModifyAns, // 创建策略回报
                callback: msg => {
                    console.debug(msg.toString());
                    let createAns = JSON.parse(msg.toString());

                    if (createAns.data.msgret.error_id !== 0) {
                        console.error(`errorid: ${createAns.data.msgret.error_id}.`);
                        return;
                    }

                    this.configBll.updateConfig(this.configBll.tempConfig);
                }
            }
        );

        this.tradeEndPoint.addSlotOfCMS("getStrategyServerTemplate", msg => {
            // console.info(msg);
            // this.configBll.emit(msg.content.head.actor, JSON.parse(msg.content.body));
            JSON.parse(msg.toString()).body.forEach(template => {
                this.configBll.updateTemplate(template.temp_name, { id: template.tempid, body: JSON.parse(template.parms) });
            });
            //     case "getRiskIndexAns":
            //         this.configBll.set("risk_index", JSON.parse(msg.content.body).body);
            //         break;
            //     case "getAssetAccountAns":
            //         this.configBll.set("asset_account", JSON.parse(msg.content.body).body);
            //         break;
            // }
        }, this);

        this.tradeEndPoint.addSlotOfCMS("getProduct", (msg) => {
            let productInfo: Object = {};

            JSON.parse(msg.toString()).body.forEach(item => {
                productInfo[item.caid] = item;
            });

            let products = [];
            for (let prop in productInfo) {
                products.push(productInfo[prop]);
            }

            this.configBll.setProducts(products);
        }, this);

        this.tradeEndPoint.addSlotOfCMS("getAssetAccount", (msg) => {
            this.configBll.set("asset_account", JSON.parse(msg.toString()).body);
        }, this);

        this.tradeEndPoint.addSlotOfCMS("getRiskIndex", (msg) => {
            this.configBll.set("risk_index", JSON.parse(msg.toString()).body);
        }, this);

        this.tradeEndPoint.onTopic(2001, (body) => {
            console.info(body);
        });
    }

    ngOnDestroy() {
        this.isonpacks = null;
    }
}