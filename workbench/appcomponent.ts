/**
 * created by cl, 2017/02/11
 */
"use strict";

import { AppStoreService, Menu, MessageBox } from "../base/api/services/backend.service";
import { IP20Service } from "../base/api/services/ip20.service";
import { Component, ChangeDetectorRef } from "@angular/core";
import { IApp, WorkspaceConfig, Channel, StrategyInstance } from "../base/api/model/app.model";
import { ConfigurationBLL, StrategyServerContainer } from "./bll/strategy.server";

declare var window: any; // hack by chenlei @ 2017/02/07

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
export class AppComponent {
    private configBLL = new ConfigurationBLL();
    private strategyContainer = new StrategyServerContainer();

    isAuthorized: boolean = false;
    username: string;
    password: string;
    serverinfo: string;
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
    newestInstanceName: string;
    channels: Channel[] = [];

    contextMenu: Menu;
    curItem: WorkspaceConfig;

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
            this.onStartApp(this.config.apptype);
        });
        this.contextMenu.addItem("Modify", () => {
            this.onPopup(1);
        });
        this.contextMenu.addItem("Remove", () => {
            this.configs.forEach((config, index) => {
                if (config.name === this.config.name) {
                    this.configs.splice(index);
                    this.ref.detectChanges();
                }
            });
        });
    }

    onClick(e: MouseEvent, item: WorkspaceConfig) {
        this.curItem = item;
        if (e.button === 2) { // right click
            // TODO Show Menu
            this.contextMenu.popup();
        } else {
            console.info(this.config.name);
            this.onStartApp(this.config.apptype);
        }
    }

    next() {
        this.config.curstep++;
    }

    prev() {
        this.config.curstep--;
    }

    finish() {
        console.info(this.config);
        this.configs.push(this.config);
        this.closePanel();
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
        this.config = null;
        // this.bPopPanel = true;
        this.strategyCores = this.configBLL.getTemplates();
        if (type === 0) {
            this.config = new WorkspaceConfig();
            this.panelTitle = "New Config";
        } else {
            // getTheConfig by this.curItem on click
            this.config = this.curItem;
            this.panelTitle = this.config.name;
            let templateObj: Object = this.configBLL.getTemplateByName(this.config.strategyCoreName);
            if (templateObj === null) {
                this.showError("Error: getTemplateByName", `not found ${this.config.name}`, "alert");
                return;
            }

            this.channels = [];
            templateObj["SSGWs"].forEach(channelName => {
                let channel: Channel = new Channel();
                channel.enable = this.config.channels.includes(channelName);  // default
                channel.name = templateObj["SSGW"]["name"][channelName];
                channel.type = templateObj["SSGW"]["type"][channelName];
                channel.addr = templateObj["SSGW"]["addr"][channelName];
                channel.port = templateObj["SSGW"]["port"][channelName];
                this.channels.push(channel);
            });
        }
        this.ref.detectChanges();
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
        newInstance.id = this.newestInstanceName;
        newInstance.params = {};
        this.config.strategyInstances.push(newInstance);
    }

    removeInstance(e: MouseEvent, index: number): void {
        this.config.strategyInstances.splice(index, 1);
        e.preventDefault();
        e.stopPropagation();
    }

    onSelectServer(item): void {
        this.serverinfo = item;
    }

    onSelectStrategy(value: string) {
        this.config.strategyCoreName = value;

        let templateObj: Object = this.configBLL.getTemplateByName(this.config.strategyCoreName);
        if (templateObj === null) {
            this.showError("Error: getTemplateByName", `not found ${this.config.name}`, "alert");
            return;
        }

        this.channels = [];
        templateObj["SSGWs"].forEach(channelName => {
            let channel: Channel = new Channel();
            channel.enable = this.config.channels.includes(channelName);  // default
            channel.name = templateObj["SSGW"]["name"][channelName];
            channel.type = templateObj["SSGW"]["type"][channelName];
            channel.addr = templateObj["SSGW"]["addr"][channelName];
            channel.port = templateObj["SSGW"]["port"][channelName];
            this.channels.push(channel);
        });
    }

    onLogin(): void {
        // MessageBox.show("none", "Hello World", "Would give me a banana?\n Hello \n World");
        // alert("hello")
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
                console.info(msg);
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
                console.info(msg, msg.content.msg);
            }
        });
        this.tgw.addSlot({ // login failed
            appid: 107,
            packid: 2001,
            callback: msg => {
                console.info(msg, msg.content.msg);
            }
        });
        // process templates
        this.tgw.addSlot({
            appid: 270,
            packid: 194,
            callback: msg => {
                this.tgw.send(107, 2000, { routerid: 0, templateid: 0, body: { name: "ss-Lhhj1", config: "test" } });
                console.info(msg);
                // this.configBLL.updateTemplate(name, template);
            }
        });
        let loginObj = { "cellid": "1", "userid": "1.1", "password": "*32C5A4C0E3733FA7CC2555663E6DB6A5A6FB7F0EDECAC9704A503124C34AA88B", "termid": "12.345", "conlvl": 10, "clientdisksn": "", "clientnetip": "172.24.51.6", "clientnetmac": "f48e38bb77ce", "clientesn": "9693a58a65e2e97fe42a41c10616ae29223fb6364b04e0d9336252fba9ed339b030d4592f987fa526edca6cca021721db6f42eeae0bdf750febd9b938526d0a9", "clienttgwapi": "tgwapi253", "clientapp": "", "clientwip": "0.0.0.0", "clienttm": timestamp, "clientcpuid": "BFEBFBFF000506E3" };

        this.tgw.send(17, 41, loginObj); // login
    }

    onReset(): void {
        this.username = "";
        this.password = "";
    }

    onStartApp(name: string): void {
        if (name) {
            if (!this.appService.startApp(name, name))
                this.showError("Error", `start ${name} app error!`, "alert");
        } else {
            this.showError("Error", "App is unvalid!", "alert");
        }
    }

    showError(caption: string, content: string, type: string): void {
        window.$.Notify({
            caption: caption,
            content: content,
            type: type
        });
    }
}



interface CodeItem {
    bChecked: boolean;
    ukey: number;
    name: string;
    code: string;
}