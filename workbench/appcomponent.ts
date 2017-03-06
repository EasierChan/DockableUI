"use strict";


import { AppStoreService } from "../base/api/services/backendService";
import { Component, trigger, state, style, transition, animate } from "@angular/core";
import { IApp } from "../base/api/model/app.model";
declare var window: any; // hack by chenlei @ 2017/02/07

@Component({
    moduleId: module.id,
    selector: "body",
    templateUrl: "workbench.html",
    styleUrls: ["appcomponent.css"],
    providers: [
        AppStoreService
    ]
})
export class AppComponent {
    isAuthorized: boolean = false;
    username: string;
    password: string;
    serverinfo: string;
    bPopPanel: boolean = false;
    apps: Array<IApp>;
    config: WorkspaceConfig;
    panelTitle: string;
    newestInstanceName: string;
    channels: Channel[];
    bDetails: boolean;

    constructor(private appService: AppStoreService) {
        this.config = new WorkspaceConfig();
        this.config.step = 1;
        this.bDetails = false;
    }

    next() {
        this.config.step++;
        console.info(this.config.step);
    }

    prev() {
        this.config.step--;
    }

    finish() {
        this.closePanel();
    }

    closePanel(e?: any) {
        if (e) {
            if (e.target.className.startsWith("dialog-overlay"))
                this.bPopPanel = false;
        }
        else
            this.bPopPanel = false;
        window.hideMetroDialog("#config");
    }

    get detailClass() {
        return this.bDetails ? "tile-small bg-blue fg-white" : "tile-square bg-blue fg-white";
    }

    onPopup() {
        this.bPopPanel = true;
        this.config.step = 1;
        window.showMetroDialog("#config");
        if (!this.config.name || this.config.name.trim() === "")
            this.panelTitle = "New Config";
        else
            this.panelTitle = this.config.name;
    }

    addInstance() {
        let newInstance: StrategyInstance = new StrategyInstance();
        newInstance.id = this.newestInstanceName;
        newInstance.params = {};
        this.config.strategyInstances.push(newInstance);
    }

    removeInstance(e: MouseEvent, index: number): void {
        console.info(index);
        this.config.strategyInstances.splice(index, 1);
        e.preventDefault();
        e.stopPropagation();
    }

    onSelectServer(item): void {
        this.serverinfo = item;
    }

    selectStrategy(value: string) {
        this.config.selectedStrategy = value;
    }

    onLogin(): boolean {
        // alert("hello")
        console.log(this.username, this.password);
        // send username and password to server. get user profile to determine which apps user can access.
        let ret = this.appService.getUserProfile({
            username: this.username,
            password: this.password,
            roles: null,
            apps: null
        });

        if (ret !== false && ret instanceof Array) {
            this.isAuthorized = true;
            this.apps = ret;
            return true;
        } else {
            this.showError("Error", "Username or password wrong.", "alert");
            return false;
        }
    }

    onReset(): void {
        this.username = "";
        this.password = "";
    }

    onStartApp(name: string): void {
        // alert(name);
        if (name) {
            if (!this.appService.startApp(name))
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

class WorkspaceConfig {
    private _name: string;
    private _tradingUniverse: number[];
    private _strategyCoreName: string;
    private _curstep: number;
    private _strategyInstances: StrategyInstance[];
    private _channels: string[];

    constructor() {
        this._tradingUniverse = [];
        this._strategyInstances = [];
    }

    get name() {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get step() {
        return this._curstep;
    }

    set step(value: number) {
        this._curstep = value;
    }

    get selectedStrategy() {
        return this._strategyCoreName;
    }

    set selectedStrategy(value: string) {
        this._strategyCoreName = value;
    }

    get strategyInstances() {
        return this._strategyInstances;
    }
}

class StrategyInstance {
    id: string;
    params: Object;
}

class Channel {
    enable: boolean;
    name: string;
    type: number; //
}