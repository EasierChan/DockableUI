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
import { TradeService, QuoteService } from "../bll/services";
import { ConfigurationBLL } from "../bll/strategy.server";
import { DataSet } from "./home/common";

import { ActionBar, Label } from "../../base/controls/control";
/**
 * for actionBar test
 */
@Component({
    moduleId: module.id,
    selector: "body",
    templateUrl: "app.component.html",
    styleUrls: ["app.component.css"],
    providers: [
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

    constructor(private tradeEndPoint: TradeService,
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

        let disables = ["智能预测", "证券信息", "实盘交易"]; // 
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
        this.tradeEndPoint.addSlot({
            appid: this.ssgwAppID,
            packid: 2001, // 创建策略回报
            callback: msg => {
                console.debug(msg);
                if (msg.content.body.errorid !== 0) {
                    console.error(`errorid: ${msg.content.body.errorid}, errmsg: ${msg.content.body.description}`);
                    return;
                }

                let config;
                if (this.configBll.tempConfig && this.configBll.tempConfig.name === msg.content.body.name) {
                    config = this.configBll.tempConfig;
                } else {
                    config = this.configBll.getAllConfigs().find(item => { return item.name === msg.content.body.name; });
                }

                if (config) {
                    config.appid = msg.content.body.appid;
                    config.items[0].key = msg.content.body.strategy_key;
                    let idx = this.configBll.strategyKeys.indexOf(config.items[0].key);
                    if (idx < 0)
                        this.configBll.strategyKeys.push(config.items[0].key);
                    else
                        this.configBll.strategyKeys[idx] = config.items[0].key;

                    this.configBll.updateConfig(config);
                    this.tradeEndPoint.send(17, 101, { topic: 8000, kwlist: this.configBll.strategyKeys });
                }
            }
        });

        this.tradeEndPoint.addSlot({
            appid: this.productAppID,
            packid: 251,
            callback: msg => {

                if (msg.content.msret.msgcode !== "00") {
                    alert("Get product info Failed! " + msg.content.msret.msg);
                    return;
                }

                console.info(msg);
                this.configBll.emit(msg.content.head.actor, JSON.parse(msg.content.body));
                switch (msg.content.head.actor) {
                    case "getProductAns":
                        let productInfo: Object = {};

                        let data = JSON.parse(msg.content.body);
                        data.body.forEach(item => {
                            productInfo[item.caid] = item;
                        });

                        let products = [];
                        for (let prop in productInfo) {
                            products.push(productInfo[prop]);
                        }

                        this.configBll.setProducts(products);

                        products = null;
                        productInfo = null;
                        data = null;
                        break;
                    case "getStrategyServerTemplateAns":
                        // console.info(msg);
                        if (msg.content.head.pkgCnt > 1) {
                            if (this.isonpacks[msg.content.head.pkgId] === undefined)
                                this.isonpacks[msg.content.head.pkgId] = "";
                            if (msg.content.head.pkgIdx === msg.content.head.pkgCnt - 1) {
                                let templatelist = JSON.parse(this.isonpacks[msg.content.head.pkgId].concat(msg.content.body));
                                templatelist.body.forEach(template => {
                                    this.configBll.updateTemplate(template.temp_name, JSON.parse(template.parms).SS);
                                });

                                delete this.isonpacks[msg.content.head.pkgId];
                            } else {
                                this.isonpacks[msg.content.head.pkgId] = this.isonpacks[msg.content.head.pkgId].concat(msg.content.body);
                            }
                        } else {
                            let templatelist = JSON.parse(this.isonpacks[msg.content.head.pkgId].concat(msg.content.body));
                            templatelist.body.forEach(template => {
                                this.configBll.updateTemplate(template.temp_name, { id: template.tempid, body: JSON.parse(template.parms) });
                            });
                        }
                        break;
                    case "getRiskIndexAns":
                        this.configBll.set("risk_index", JSON.parse(msg.content.body).body);
                        break;
                    case "getAssetAccountAns":
                        this.configBll.set("asset_account", JSON.parse(msg.content.body).body);
                        break;
                }
            }
        });

        this.tradeEndPoint.addSlot({
            appid: 17,
            packid: 110,
            callback: (msg) => {
                // console.info(msg);
                let target = this.configBll.getAllConfigs().find(citem => { return citem.name === msg.content.strategyserver.name; });

                if (target !== undefined) {
                    target.state = msg.content.strategyserver.stat;
                    if (this.configBll.onStateChanged)
                        this.configBll.onStateChanged(target);
                }
            }
        });
    }

    ngOnDestroy() {
        this.isonpacks = null;
    }
}