/**
 * created by cl, 2017/02/11
 */
"use strict";

import { AppStoreService, Menu, MessageBox } from "../base/api/services/backend.service";
import { IP20Service } from "../base/api/services/ip20.service";
import { Component, ChangeDetectorRef, OnDestroy } from "@angular/core";
import { IApp } from "../base/api/model/app.model";
import { ConfigurationBLL, StrategyServerContainer, WorkspaceConfig, Channel, StrategyInstance } from "./bll/strategy.server";

declare var window: any; // hack by chenlei @ 2017/02/07
let ip20strs = {};

@Component({
    moduleId: module.id,
    selector: "body",
    templateUrl: "workbench.html",
    styleUrls: ["appcomponent.css"],
    providers: [
        AppStoreService,
        IP20Service,
        Menu
    ]
})
export class AppComponent implements OnDestroy {
    private templates: any = {};
    private configBLL = new ConfigurationBLL();
    private strategyContainer = new StrategyServerContainer();
    isAuthorized: boolean = false;
    username: string;
    password: string;
    selectedServer: string;
    // bPopPanel: boolean = false;
    configs: Array<WorkspaceConfig>;
    config: WorkspaceConfig;
    bDetails: boolean;

    panelTitle: string;
    bRightSelectedAll: boolean;
    bLeftSelectedAll: boolean;
    queryList: Array<CodeItem>;
    selectedList: Array<CodeItem>;

    strategyCores: string[];
    channels: Channel[] = [];

    strategyName: string;
    strategyId: string;

    contextMenu: Menu;
    curTemplate: any;

    constructor(private appService: AppStoreService, private tgw: IP20Service,
        private ref: ChangeDetectorRef) {
        this.config = new WorkspaceConfig();
        this.config.curstep = 1;
        this.bDetails = false;
        this.bLeftSelectedAll = this.bRightSelectedAll = false;
        this.selectedList = [];
        this.queryList = [];

        this.contextMenu = new Menu();
        this.contextMenu.addItem("Open", () => {
            this.onStartApp();
        });
        this.contextMenu.addItem("Modify", () => {
            this.onPopup(1);
        });
        this.contextMenu.addItem("Remove", () => {
            this.configs.forEach((config, index) => {
                if (config.name === this.config.name) {
                    this.configs.splice(index);
                    this.configBLL.updateConfig();
                    this.ref.detectChanges();
                }
            });
        });
    }

    onClick(e: MouseEvent, item: WorkspaceConfig) {
        this.config = item;
        if (e.button === 2) { // right click
            // TODO Show Menu
            this.contextMenu.popup();
        } else {
            this.onStartApp();
        }
    }

    next() {
        ++this.config.curstep;
    }

    prev() {
        --this.config.curstep;
    }

    finish() {
        // listener
        this.tgw.addSlot({ // create config ack
            appid: 107,
            packid: 2001,
            callback: msg => {
                console.info(msg.content.body);
                this.config.name = msg.content.body.name;
                this.config.host = msg.content.body.address;
                this.strategyContainer.removeItem(this.config.name);
                this.strategyContainer.addItem(this.config);
                if (this.configs.find(item => { return item.name === this.config.name; }) === undefined) {
                    this.configBLL.updateConfig(this.config);
                }
                this.tgw.send(107, 2002, { routerid: 0, strategyserver: { name: this.config.name, action: 1 } });
            }
        });

        this.tgw.addSlot({
            appid: 107,
            packid: 2003,
            callback: msg => {
                console.info(msg);
            }
        });
        // create and modify config.
        this.config.channels.gateway.forEach(gw => {
            gw.port = parseInt(gw.port);
        });
        this.config.channels.feedhandler.port = parseInt(this.config.channels.feedhandler.port);

        this.curTemplate.body.data["SSNet"]["TSServer.port"] = this.config.port;
        this.curTemplate.body.data["globals"]["ss_instance_name"] = this.config.name;
        let sobj = Object.assign({}, this.curTemplate.body.data["Strategy"][0]);
        this.curTemplate.body.data["Strategy"].length = 0;
        delete this.curTemplate.body.data["PairTrades"]["PairTrade"];
        this.config.strategyInstances.forEach(item => {
            let obj = JSON.parse(JSON.stringify(sobj));
            // obj.account = item.accounts;
            obj.algoes = item.algoes;
            obj.checks = item.checks;
            obj.cfg = obj.field = obj.name = obj.log = item.name;
            obj.key = parseInt(item.key);
            // obj.maxorderid = 0; 
            // obj.minorderid
            // obj.orderstep
            this.curTemplate.body.data["Strategy"].push(obj);
            this.curTemplate.body.data["PairTrades"][item.name] = {
                Command: item.commands,
                Comment: item.comments,
                Instrument: item.instruments,
                Parameter: item.parameters
            };

            if (item.sendChecks) {
                this.curTemplate.body.data["PairTrades"][item.name]["SendCheck"] = item.sendChecks;
            }
        });

        this.tgw.send(107, 2000, { routerid: 0, templateid: this.curTemplate.id, body: { name: this.config.name, config: JSON.stringify(this.curTemplate.body.data) } });
        this.closePanel();
    }

    pickConfigItem() {
        switch (this.config.curstep) {
            case 1: // universe code config.
                break;
            case 2: // strategy core.
                break;
            case 3: // strategy params.
                break;
            case 4: // channel and feed
                break;
        }
    }

    closePanel(e?: any) {
        window.hideMetroDialog("#config");
    }

    get detailClass() {
        return this.bDetails
            ? "tile-small bg-blue fg-white"
            : "tile-square bg-blue fg-white";
    }

    toggleDetails(): void {
        this.bDetails = !this.bDetails;
        setTimeout(() => {
            if (this.detailClass.startsWith("tile-small"))
                window.showMetroCharm("#detailCharm");
            else
                window.hideMetroCharm("#detailCharm");
        }, 0);
    }

    /**
     * @param type 0 is new config, 1 is modify config.
     */
    onPopup(type: number = 0) {
        // this.bPopPanel = true;
        this.strategyCores = this.configBLL.getTemplates();
        if (type === 0) {
            this.config = new WorkspaceConfig();
            this.panelTitle = "New Config";
        } else {
            this.config.curstep = 1;
            this.panelTitle = this.config.name;
            this.curTemplate = null;
            this.curTemplate = JSON.parse(JSON.stringify(this.configBLL.getTemplateByName(this.config.strategyCoreName)));
        }

        // this.ref.detectChanges();
        window.showMetroDialog("#config");
    }

    queryCodes(): void {
        this.queryList = [];
        for (let i = 0; i < 5; ++i) {
            this.queryList.push({
                bChecked: false,
                ukey: i + 1,
                code: "000001",
                name: "pinan"
            });
        }
    }

    appendCodes(): void {
        let count = this.selectedList.length;
        let i = 0;
        this.queryList.forEach(queryItem => {
            if (queryItem.bChecked) {
                for (i = 0; i < count; ++i) {
                    if (this.selectedList[i].ukey === queryItem.ukey)
                        break;
                }
                if (i === count)
                    this.selectedList.push(Object.assign({}, queryItem));
            }
        });

        count = null;
        i = null;
    }

    removeCodes(): void {
        for (let i = this.selectedList.length - 1; i >= 0; --i) {
            if (this.selectedList[i].bChecked)
                this.selectedList.splice(i, 1);
        }
    }

    leftSelectAll(): void {
        this.bLeftSelectedAll = !this.bLeftSelectedAll;
        this.queryList.forEach(item => {
            item.bChecked = this.bLeftSelectedAll;
        });
    }

    rightSelectAll(): void {
        this.bRightSelectedAll = !this.bRightSelectedAll;
        this.selectedList.forEach(item => {
            item.bChecked = this.bRightSelectedAll;
        });
    }

    addInstance() {
        if (!this.config.strategyCoreName || this.config.strategyCoreName.length === 0) {
            this.showError("Warning", "a strategycore needed.", "alert");
            return;
        }
        let newInstance: StrategyInstance = new StrategyInstance();
        newInstance.key = this.strategyId;
        newInstance.name = this.strategyName;
        newInstance.parameters = JSON.parse(JSON.stringify(this.curTemplate.body.data.Parameter));
        newInstance.comments = JSON.parse(JSON.stringify(this.curTemplate.body.data.Comment));
        newInstance.commands = JSON.parse(JSON.stringify(this.curTemplate.body.data.Command));
        newInstance.instruments = JSON.parse(JSON.stringify(this.curTemplate.body.data.Instrument));
        this.config.strategyInstances.push(newInstance);
    }

    removeInstance(e: MouseEvent, index: number): void {
        this.config.strategyInstances.splice(index, 1);
        e.preventDefault();
        e.stopPropagation();
    }

    // select endpoint of tgw 
    onSelectServer(item): void {
        this.selectedServer = item;
    }

    onSelectStrategy(value: string) {
        this.config.strategyCoreName = value;
        delete this.curTemplate;
        this.curTemplate = null;
        this.curTemplate = JSON.parse(JSON.stringify(this.configBLL.getTemplateByName(this.config.strategyCoreName)));

        if (this.curTemplate === null) {
            this.showError("Error: getTemplateByName", `not found ${this.config.name}`, "alert");
            return;
        }

        this.config.channels.gateway = this.curTemplate.body.data.SSGW;
        this.config.channels.feedhandler = this.curTemplate.body.data.SSFeed.detailview.PriceServer;
        this.strategyName = "";
        this.strategyId = "";
    }

    updateCheck(e, item, instance: StrategyInstance) {
        if (e.target.checked) {
            if (item.name === "SendCheck") instance.sendChecks = JSON.parse(JSON.stringify(this.curTemplate.body.data.SendCheck));
            instance.checks.push(item.key);
        } else {
            if (item.name === "SendCheck") instance.sendChecks = null;
            let i = instance.checks.indexOf(item.key);
            if (i >= 0)
                instance.checks.splice(i, 1);
        }
    }

    updateAlgo(e, item, instance: StrategyInstance) {
        if (e.target.checked) {
            instance.algoes.push(item.key);
        } else {
            let i = instance.algoes.indexOf(item.key);
            if (i >= 0)
                instance.algoes.splice(i, 1);
        }
    }

    onLogin(): void {
        // console.log(this.username, this.password);
        // send username and password to server. get user profile to determine which apps user can access.
        let ret = this.appService.getUserProfile({
            username: this.username,
            password: this.password,
            roles: null,
            apps: null
        });
        this.isAuthorized = true;
        if (this.isAuthorized) {
            this.configs = this.configBLL.getAllConfigs();
            // 
            // this.strategyContainer.addItem(self.configs);
        } else {
            this.showError("Error", "Username or password wrong.", "alert");
        }
        this.loginTGW();
    }

    loginTGW(): void {
        let self = this;
        // tgw login
        let timestamp: any = new Date();
        timestamp = timestamp.format("yyyymmddHHMMss") + "" + timestamp.getMilliseconds();
        timestamp = timestamp.substr(0, timestamp.length - 1);
        this.tgw.connect(6114, "172.24.51.9");
        this.tgw.addSlot({ // login success
            appid: 17,
            packid: 43,
            callback: msg => {
                console.info(`tgw::login ans=>${msg.toString()}`);
                self.tgw.send(270, 194, { "head": { "realActor": "getDataTemplate" }, category: 0 });
                self.isAuthorized = true;
                if (self.isAuthorized) {
                    self.configs = self.configBLL.getAllConfigs();
                    // 
                    this.strategyContainer.addItems(self.configs);
                } else {
                    self.showError("Error", "Username or password wrong.", "alert");
                }
            }
        });

        this.tgw.addSlot({ // login failed
            appid: 17,
            packid: 120,
            callback: msg => {
                console.error(`tgw::login ans=>${msg}`);
            }
        });

        // process templates
        this.tgw.addSlot({
            appid: 270,
            packid: 194,
            callback: msg => {
                if (msg.content.head.pkgCnt > 1) {
                    if (ip20strs[msg.content.head.pkgId] === undefined)
                        ip20strs[msg.content.head.pkgId] = "";

                    if (msg.content.head.pkgIdx === msg.content.head.pkgCnt - 1) {
                        let templatelist = JSON.parse(ip20strs[msg.content.head.pkgId].concat(msg.content.body));
                        templatelist.body.forEach(template => {
                            this.configBLL.updateTemplate(template.templatename, { id: templatelist.body[0].id, body: JSON.parse(templatelist.body[0].templatetext) });
                        });

                        delete ip20strs[msg.content.head.pkgId];
                    } else {
                        ip20strs[msg.content.head.pkgId] = ip20strs[msg.content.head.pkgId].concat(msg.content.body);
                    }
                } else {
                    let templatelist = JSON.parse(ip20strs[msg.content.head.pkgId].concat(msg.content.body));

                    templatelist.body.forEach(template => {
                        this.configBLL.updateTemplate(template.templatename, { id: templatelist.body[0].id, body: JSON.parse(templatelist.body[0].templatetext) });
                    });
                }
            }
        });

        let loginObj = { "cellid": "1", "userid": "1.1", "password": "*32C5A4C0E3733FA7CC2555663E6DB6A5A6FB7F0EDECAC9704A503124C34AA88B", "termid": "12.345", "conlvl": 1, "clientesn": "", "clienttm": timestamp };
        this.tgw.send(17, 41, loginObj); // login
    }

    onReset(): void {
        this.username = "";
        this.password = "";
    }

    onStartApp(): void {
        console.info(this.config);
        if (!this.appService.startApp(this.config.name, this.config.apptype, { port: this.config.port, host: this.config.host }))
            this.showError("Error", `start ${name} app error!`, "alert");
    }

    showError(caption: string, content: string, type: string): void {
        window.$.Notify({
            caption: caption,
            content: content,
            type: type
        });
    }

    ngOnDestroy() {
        // clear
    }
}

interface CodeItem {
    bChecked: boolean;
    ukey: number;
    name: string;
    code: string;
}

interface ServerInfo {
    name: string;
    port: number;
    host: string;
}