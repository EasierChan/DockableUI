/**
 * created by cl, 2017/02/11
 */
"use strict";

import { AppStoreService, Menu, MessageBox, File } from "../base/api/services/backend.service";
import { IP20Service } from "../base/api/services/ip20.service";
import { QtpService } from "../base/api/services/qtp.service";
import { Component, ChangeDetectorRef, OnDestroy } from "@angular/core";
import { IApp } from "../base/api/model/app.model";
import { ConfigurationBLL, StrategyServerContainer, WorkspaceConfig, Channel, StrategyInstance, SpreadViewConfig } from "./bll/strategy.server";

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
        QtpService,
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
    isModify: boolean = false;

    svconfigs: SpreadViewConfig[];
    sendLoopConfigs: any[] = [];
    svconfig: SpreadViewConfig;
    svMenu: Menu;

    constructor(private appService: AppStoreService, private tgw: IP20Service,
        private qtp: QtpService,
        private ref: ChangeDetectorRef) {
        this.config = new WorkspaceConfig();
        this.svconfig = new SpreadViewConfig();
        this.config.curstep = 1;
        this.bDetails = false;
        this.bLeftSelectedAll = this.bRightSelectedAll = false;
        this.selectedList = [];
        this.queryList = [];

        this.contextMenu = new Menu();
        this.contextMenu.addItem("Start", () => {
            this.operateStrategyServer(this.config, 1);
        });
        this.contextMenu.addItem("Stop", () => {
            this.operateStrategyServer(this.config, 0);
        });
        this.contextMenu.addItem("Modify", () => {
            this.isModify = true;
            this.onPopup(1);
        });
        this.contextMenu.addItem("Remove", () => {
            this.configs.forEach((config, index) => {
                if (config.name === this.config.name) {
                    this.configs.splice(index, 1);
                    this.configBLL.updateConfig();
                    this.strategyContainer.removeItem(this.config.name);
                    this.ref.detectChanges();
                }
            });
        });
        this.contextMenu.addItem("ViewResult", () => {
            if (this.config.activeChannel === "loopback") {
                let name = "ResultOf" + this.config.name;
                this.sendLoopConfigs = this.configBLL.getLoopbackItems();
                console.info(this.sendLoopConfigs);
                let items = this.sendLoopConfigs.filter(item => { return item.name === this.config.name; });
                this.appService.startApp(name, "LoopbackTestReport", {
                    port: 4801,
                    host: "172.24.51.1",
                    name: name,
                    tests: items
                });
            }
        });

        this.svMenu = new Menu();
        this.svMenu.addItem("Modify", () => {
            this.onCreateSpreadViewer(1);
        });
        this.svMenu.addItem("Remove", () => {
            this.configBLL.removeSVConfigItem(this.svconfig);
        });
    }

    onClick(e: MouseEvent, item: WorkspaceConfig) {
        this.config = item;
        if (e.button === 2) { // right click
            // TODO Show Menu
            this.contextMenu.popup();
        } else {
            this.onStartApp();
            this.bDetails = false;
            window.hideMetroCharm("#detailCharm");
        }
    }

    next() {
        ++this.config.curstep;
    }

    prev() {
        --this.config.curstep;
    }

    finish() {
        // validation
        if (!this.config.name || this.config.name.length === 0 ||
            !this.config.strategyCoreName || !this.config.strategyInstances || this.config.strategyInstances.length === 0) {
            this.showError("Wrong Config", "check items: <br>1. config name.<br>2. one strategy instance at least.", "alert");
            return;
        }

        // create and modify config.
        if (this.config.activeChannel === "default") {
            this.config.channels.gateway.forEach((gw, index) => {
                this.curTemplate.body.data.SSGW[index].port = gw.port = parseInt(gw.port);
                this.curTemplate.body.data.SSGW[index].addr = gw.addr = gw.addr;
            });

            this.curTemplate.body.data.SSFeed.detailview.PriceServer.port = parseInt(this.config.channels.feedhandler.port);
            this.curTemplate.body.data.SSFeed.detailview.PriceServer.addr = this.config.channels.feedhandler.addr;
        } else { // loopback test
            this.curTemplate.body.data.SSGW.forEach((gw, index) => {
                gw.port = parseInt(this.config.loopbackConfig.result.port);
                gw.addr = this.config.loopbackConfig.result.url;
                if (index > 0) {
                    gw.ref = this.curTemplate.body.data.SSGW[0].key;
                }
            });
            this.curTemplate.body.data.SSFeed.detailview.PriceServer.port = parseInt(this.config.loopbackConfig.result.hqport);
            this.curTemplate.body.data.SSFeed.detailview.PriceServer.addr = this.config.loopbackConfig.result.hqurl;
            this.curTemplate.body.data.SSFeed.detailview.PriceServer.filename = "./lib/libFeedChronos.so";
        }
        console.info(this.curTemplate, this.config);

        this.curTemplate.body.data["SSNet"]["TSServer.port"] = this.config.port;
        this.curTemplate.body.data["globals"]["ss_instance_name"] = this.config.name;
        let sobj = Object.assign({}, this.curTemplate.body.data["Strategy"][0]);
        this.curTemplate.body.data["Strategy"].length = 0;
        this.curTemplate.body.data["PairTrades"] = {};
        this.config.strategyInstances.forEach(item => {
            let obj = JSON.parse(JSON.stringify(sobj));
            obj.account = [];
            item.accounts.split(",").forEach(iact => {
                obj.account.push(parseInt(iact));
            });
            obj.algoes = item.algoes;
            obj.checks = item.checks;
            obj.cfg = obj.field = obj.name = obj.log = item.name;
            obj.key = parseInt(item.key);
            obj.status = 2; // RUN;
            // obj.maxorderid = 0;
            // obj.minorderid
            // obj.orderstep
            item.parameters.forEach((iparam: any) => {
                iparam.value = parseFloat(iparam.value);
            });
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
        this.configBLL.updateConfig(this.config);
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
            this.isModify = false;
        } else {
            this.config.curstep = 1;
            this.panelTitle = this.config.name;
            this.curTemplate = null;
            this.curTemplate = JSON.parse(JSON.stringify(this.configBLL.getTemplateByName(this.config.strategyCoreName)));
        }

        if (!this.config.loopbackConfig.option) {
            let idate = new Date().format("yyyy-mm-dd");
            this.config.loopbackConfig.option = {
                timebegin: idate,
                timeend: idate,
                speed: "1",
                simlevel: "1"
            };
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
            if (item.name === "SendCheck")
                instance.sendChecks = JSON.parse(JSON.stringify(this.curTemplate.body.data.SendCheck));
            instance.checks.push(item.key);
        } else {
            if (item.name === "SendCheck")
                instance.sendChecks = null;

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

        this.svconfigs = this.configBLL.getSVConfigs();
        this.loginTGW();
        // this.isAuthorized = true;
        // let config = new WorkspaceConfig();
        // config.state = 0;
        // config.name = "test";
        // config.apptype = "DockDemo";
        // config.activeChannel = "default";
        // config.port = 9090;
        // config.host = "172.24.51.4";
        // config.channels.feedhandler = {
        //     port: 10000,
        //     addr: "172.24.51.4"
        // };
        // this.configs = [];
        // this.configs.push(config);
    }

    loginTGW(): void {
        let self = this;
        // tgw login
        let timestamp: any = new Date();
        timestamp = timestamp.format("yyyymmddHHMMss") + "" + timestamp.getMilliseconds();
        timestamp = timestamp.substr(0, timestamp.length - 1);
        this.tgw.connect(6114, "172.24.51.9");
        // listener
        this.tgw.addSlot({ // create config ack
            appid: 107,
            packid: 2001,
            callback: msg => {
                console.info(msg.content.body);
                let config = this.configs.find(item => { return item.name === msg.content.body.name; });
                if (config) {
                    config.name = msg.content.body.name;
                    config.host = msg.content.body.address;
                    this.strategyContainer.removeItem(config.name);
                    this.strategyContainer.addItem(config);
                    // this.tgw.send(107, 2002, { routerid: 0, strategyserver: { name: config.name, action: 1 } });
                }
            }
        });

        this.tgw.addSlot({
            appid: 107,
            packid: 2003,
            callback: msg => {
                console.info(msg);
            }
        });
        this.tgw.addSlot({ // login success
            appid: 17,
            packid: 43,
            callback: msg => {
                console.info(`tgw::login ans=>${msg.toString()}`);
                self.tgw.send(270, 194, { "head": { "realActor": "getDataTemplate" }, category: 0 });
                self.isAuthorized = true;
                if (self.isAuthorized) {
                    // this.strategyContainer.addItems(self.configs);
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
                            this.configBLL.updateTemplate(template.templatename, { id: template.id, body: JSON.parse(template.templatetext) });
                        });

                        self.configs = self.configBLL.getAllConfigs();
                        self.configs.forEach(config => {
                            self.config = config;
                            self.config.state = 0;
                            self.curTemplate = JSON.parse(JSON.stringify(self.configBLL.getTemplateByName(self.config.strategyCoreName)));
                            self.finish();
                        });
                        delete ip20strs[msg.content.head.pkgId];
                    } else {
                        ip20strs[msg.content.head.pkgId] = ip20strs[msg.content.head.pkgId].concat(msg.content.body);
                    }
                } else {
                    let templatelist = JSON.parse(ip20strs[msg.content.head.pkgId].concat(msg.content.body));
                    templatelist.body.forEach(template => {
                        this.configBLL.updateTemplate(template.templatename, { id: template.id, body: JSON.parse(template.templatetext) });
                    });

                    self.configs = self.configBLL.getAllConfigs();
                    self.configs.forEach(config => {
                        self.config = config;
                        self.config.state = 0;
                        self.curTemplate = JSON.parse(JSON.stringify(self.configBLL.getTemplateByName(self.config.strategyCoreName)));
                        self.finish();
                    });
                }
            }
        });

        let loginObj = { "cellid": "1", "userid": "1.1", "password": "*32C5A4C0E3733FA7CC2555663E6DB6A5A6FB7F0EDECAC9704A503124C34AA88B", "termid": "12.345", "conlvl": 1, "clientesn": "", "clienttm": timestamp };
        this.tgw.send(17, 41, loginObj); // login

        this.qtp.addSlot({
            msgtype: 8012,
            callback: (msg) => {
                console.info(msg);
                alert("Generate Successfully!");
                this.config.loopbackConfig.result = msg;
                let item = this.sendLoopConfigs.find((item, idx) => {
                    return item.reqsn === msg.reqsn;
                });

                if (item) {
                    item.id = msg.nId;
                    item.name = this.config.name;
                    let today = new Date();
                    item.date = today.getFullYear() + ("0" + (today.getMonth() + 1)).slice(-2) +
                        ("0" + today.getDate()).slice(-2);
                    this.configBLL.addLoopbackItems(item);
                } else {
                    console.error(`unvalid message. ${msg}`);
                }
            }
        });
        this.qtp.connect(4801, "172.24.51.1");
    }

    static reqnum = 1;
    createLoopbackTest(): void {
        let tmpobj = {
            reqsn: AppComponent.reqnum++,
            timebegin: parseInt(this.config.loopbackConfig.option.timebegin.split("-").join("")),
            timeend: parseInt(this.config.loopbackConfig.option.timeend.split("-").join("")),
            speed: parseInt(this.config.loopbackConfig.option.speed),
            simlevel: parseInt(this.config.loopbackConfig.option.simlevel)
        };

        this.sendLoopConfigs.push(tmpobj);
        this.qtp.send(8010, tmpobj);
    }

    operateStrategyServer(config: WorkspaceConfig, action: number) {
        console.info(config, action);
        this.tgw.send(107, 2002, { routerid: 0, strategyserver: { name: config.name, action: action } });
    }

    onReset(): void {
        this.username = "";
        this.password = "";
    }

    onStartApp(): void {
        console.info(this.config);
        if (!this.appService.startApp(this.config.name, this.config.apptype, {
            port: this.config.port,
            host: this.config.host,
            name: this.config.name,
            feedhandler: {
                port: this.config.channels.feedhandler.port,
                host: this.config.channels.feedhandler.addr
            }
        })) {
            this.showError("Error", `start ${name} app error!`, "alert");
        }
    }

    onCreateSpreadViewer(type = 0) {
        if (type === 0) {
            this.svconfig = new SpreadViewConfig();
        }
        window.showMetroDialog("#svconfig");
    }

    onCloseSVConfig() {
        this.configBLL.addSVConfigItem(this.svconfig);
        window.hideMetroDialog("#svconfig");
    }

    onSVConfigClick(e: MouseEvent, item) {
        console.info(e);
        if (e.button === 2) {
            this.svconfig = item;
            this.svMenu.popup();
        } else {
            if (!this.appService.startApp(item.name, item.apptype, {
                port: 10000,
                host: "172.24.51.4",
                details: item,
            })) {
                this.showError("Error", `start ${name} app error!`, "alert");
            }
        }
        this.bDetails = false;
        window.hideMetroCharm("#detailCharm");
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