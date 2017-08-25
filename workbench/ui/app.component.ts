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

import { AppStoreService, ChildProcess, Http } from "../../base/api/services/backend.service";
import { TradeService, QuoteService, QtpService } from "../bll/services";
import { ConfigurationBLL } from "../bll/strategy.server";
import { DataSet } from "./home/common";

import { AppStateCheckerRef, File, Environment, Sound, SecuMasterService, TranslateService } from "../../base/api/services/backend.service";
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
        QtpService,
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
    curEndpoint: any;
    quoteHeart: any = null;
    tradeHeart: any = null;
    isonpacks: any;

    constructor(private tradeEndPoint: TradeService,
        private quote: QuoteService,
        private mock: QtpService,
        private appService: AppStoreService,
        private configBll: ConfigurationBLL) {
    }

    get setting() {
        return this.appService.getSetting();
    }

    ngOnInit() {
        this.isonpacks = {};
        this.curEndpoint = this.setting.endpoints[0];
        this.homeMod = DataSet.modules[0].name;
        this.activeTab = DataSet.tabs(this.homeMod)[0];
        this.actionBar = new ActionBar();
        this.actionBar.backgroundColor = "#383F54";

        DataSet.modules.forEach((item, index) => {
            this.actionBar.addFeature({
                iconName: item.icon,
                tooltip: item.name,
                title: item.name,
                active: index === 0,
            });
        });

        this.actionBar.addFeature({
            iconName: "search",
            tooltip: "证券信息",
            title: "证券信息",
            active: false
        });

        this.actionBar.addFeature({
            iconName: "time",
            tooltip: "时间回溯",
            title: "时间回溯",
            active: false
        });

        this.actionBar.addFeature({
            iconName: "stats",
            tooltip: "超级图表",
            title: "超级图表",
            active: false
        });

        this.actionBar.addFeature({
            iconName: "eye-open",
            tooltip: "产品监控",
            title: "产品监控",
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

        this.actionBar.addSettings({
            iconName: "info-sign",
            tooltip: "支持",
            title: "支持",
            active: false
        });

        this.actionBar.addSettings({
            iconName: "off",
            tooltip: "退出",
            title: "退出",
            active: false
        });

        this.actionBar.onClick = (item) => {
            switch (item.title) {
                case "主页":
                    this.curPage = "home";
                    this.homeMod = item.title;
                    this.activeTab = DataSet.tabs(this.homeMod)[0];
                    this.actionBar.activeItem = item;
                    break;
                case "历史回测":
                    this.curPage = "home";
                    this.homeMod = item.title;
                    this.activeTab = DataSet.tabs(this.homeMod)[0];
                    this.actionBar.activeItem = item;
                    break;
                case "未来预测":
                    this.curPage = "home";
                    this.homeMod = item.title;
                    this.activeTab = DataSet.tabs(this.homeMod)[0];
                    this.actionBar.activeItem = item;
                    break;
                case "证券信息":
                    this.curPage = "security";
                    this.actionBar.activeItem = item;
                    break;
                case "时间回溯":
                    Http.get(this.setting.externalLinks.TimeMachine);
                    break;
                case "超级图表":
                    Http.get(this.setting.externalLinks.SuperGraph);
                    break;
                case "产品监控":
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
                case "支持":
                    this.curPage = "support";
                    this.actionBar.activeItem = item;
                    break;
                case "退出":
                    this.appService.quitAll();
                    break;
                default:
                    alert(`unhandler module: ${item.title}`);
                    break;
            }
        };

        this.appService.getUserProfile(null);
        this.registerListeners();
        this.loginTGW();
    }

    registerListeners() {
        let self = this;
        this.tradeEndPoint.addSlot({ // login success
            appid: 17,
            packid: 43,
            callback: msg => {
                console.info(`tgw::login ans=>${msg.toString()}`);
                // to request template
                this.tradeEndPoint.send(270, 194, { "head": { "realActor": "getDataTemplate" }, category: 0 });

                if (this.tradeHeart !== null) {
                    clearInterval(this.tradeHeart);
                    this.tradeHeart = null;
                }

                this.tradeHeart = setInterval(() => {
                    this.tradeEndPoint.send(17, 0, {});
                }, 60000);
            }
        });

        this.tradeEndPoint.addSlot({ // login failed
            appid: 17,
            packid: 120,
            callback: msg => {
                console.error(`tgw::login ans=>${JSON.stringify(msg.content)}`);
            }
        });

        this.tradeEndPoint.addSlot({  // template
            appid: 270,
            packid: 194,
            callback: msg => {
                // console.info(msg);
                if (msg.content.head.pkgCnt > 1) {
                    if (this.isonpacks[msg.content.head.pkgId] === undefined)
                        this.isonpacks[msg.content.head.pkgId] = "";
                    if (msg.content.head.pkgIdx === msg.content.head.pkgCnt - 1) {
                        let templatelist = JSON.parse(this.isonpacks[msg.content.head.pkgId].concat(msg.content.body));
                        templatelist.body.forEach(template => {
                            this.configBll.updateTemplate(template.templatename, { id: template.id, body: JSON.parse(template.templatetext) });
                        });

                        delete this.isonpacks[msg.content.head.pkgId];
                    } else {
                        this.isonpacks[msg.content.head.pkgId] = this.isonpacks[msg.content.head.pkgId].concat(msg.content.body);
                    }
                } else {
                    let templatelist = JSON.parse(this.isonpacks[msg.content.head.pkgId].concat(msg.content.body));
                    templatelist.body.forEach(template => {
                        this.configBll.updateTemplate(template.templatename, { id: template.id, body: JSON.parse(template.templatetext) });
                    });
                }
            }
        });

        this.quote.addSlot({ // login success
            appid: 17,
            packid: 43,
            callback: msg => {
                console.info(`tgw::login ans=>${msg.toString()}`);

                if (this.quoteHeart !== null) {
                    clearInterval(this.quoteHeart);
                    this.quoteHeart = null;
                }

                this.quoteHeart = setInterval(() => {
                    this.quote.send(17, 0, {});
                }, 60000);
            }
        });

        this.quote.addSlot({ // login failed
            appid: 17,
            packid: 120,
            callback: msg => {
                console.error(`tgw::login ans=>${JSON.stringify(msg.content)}`);
            }
        });
    }

    loginTGW() {
        let [host, port] = this.curEndpoint.trade_addr.split(":");
        this.tradeEndPoint.connect(port, host);
        let timestamp: Date = new Date();
        let stimestamp = timestamp.getFullYear() + ("0" + (timestamp.getMonth() + 1)).slice(-2) +
            ("0" + timestamp.getDate()).slice(-2) + ("0" + timestamp.getHours()).slice(-2) + ("0" + timestamp.getMinutes()).slice(-2) +
            ("0" + timestamp.getSeconds()).slice(-2) + ("0" + timestamp.getMilliseconds()).slice(-2);
        let loginObj = { "cellid": "1", "userid": "8.999", "password": "*32C5A4C0E3733FA7CC2555663E6DB6A5A6FB7F0EDECAC9704A503124C34AA88B", "termid": "12.345", "conlvl": 1, "clientesn": "", "clienttm": stimestamp };
        this.tradeEndPoint.send(17, 41, loginObj); // login

        let [qhost, qport] = this.curEndpoint.quote_addr.split(":");
        this.quote.connect(qport, qhost);
        this.quote.send(17, 41, loginObj);

        let [lhost, lport] = this.curEndpoint.loopback_addr.split(":");
        this.mock.connect(lport, lhost);
    }

    ngOnDestroy() {
        this.isonpacks = null;
        delete this.isonpacks;
    }
}