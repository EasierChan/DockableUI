/**
 * created by cl, 2017/05/09
 * update: [date]
 * desc:
 */
"use strict";

import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import {
    Control, ComboControl, MetaControl, SpreadViewer, SpreadViewerConfig,
    VBox, HBox, TextBox, Button, DockContainer
} from "../../base/controls/control";

import {
    CustomControl
} from "./app.controls";

import { AppStoreService } from "../../base/api/services/backend.service";
import { IP20Service } from "../../base/api/services/ip20.service";
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
        IP20Service,
        AppStoreService
    ]
})
export class AppComponent implements OnInit {
    actionBar: ActionBar;
    curPage: string;
    homeMod: string;
    activeTab: string;
    setting: any;
    curEndpoint: any;

    constructor(private tgw: IP20Service, private appService: AppStoreService) {
        this.setting = this.appService.getSetting();
        this.curEndpoint = this.setting.endpoints[0];
    }

    ngOnInit() {
        this.homeMod = "present";
        this.activeTab = DataSet.tabs(this.homeMod)[0];
        this.actionBar = new ActionBar();
        this.actionBar.backgroundColor = "#383F54";
        this.actionBar.addFeature({
            iconName: "home",
            tooltip: "Present",
            title: "Present",
            active: true,
        });

        this.actionBar.addFeature({
            iconName: "repeat",
            tooltip: "History",
            title: "History",
            active: false,
        });

        this.actionBar.addFeature({
            iconName: "send",
            tooltip: "Future",
            title: "Future",
            active: false,
        });

        this.actionBar.addFeature({
            iconName: "search",
            tooltip: "Security Master",
            title: "Security Master",
            active: false
        });

        this.actionBar.addFeature({
            iconName: "time",
            tooltip: "Time Machine",
            title: "Time Machine",
            active: false
        });

        this.actionBar.addFeature({
            iconName: "picture",
            tooltip: "超级图表",
            title: "超级图表",
            active: false
        });

        this.actionBar.addFeature({
            iconName: "wrench",
            tooltip: "CSP",
            title: "CSP",
            active: false
        });

        this.actionBar.addSettings({
            iconName: "user",
            tooltip: "User",
            title: "User",
            active: false
        });

        this.actionBar.addSettings({
            iconName: "cog",
            tooltip: "Setting",
            title: "Setting",
            active: false
        });

        this.actionBar.addSettings({
            iconName: "off",
            tooltip: "关闭",
            title: "Quit",
            active: false
        });

        this.actionBar.onClick = (item) => {
            switch (item.title) {
                case "Security Master":
                    this.curPage = "security";
                    this.actionBar.activeItem = item;
                    break;
                case "Present":
                    this.curPage = "home";
                    this.homeMod = "present";
                    this.activeTab = DataSet.tabs(this.homeMod)[0];
                    this.actionBar.activeItem = item;
                    break;
                case "History":
                    this.curPage = "home";
                    this.homeMod = "history";
                    this.activeTab = DataSet.tabs(this.homeMod)[0];
                    this.actionBar.activeItem = item;
                    break;
                case "Future":
                    this.curPage = "home";
                    this.homeMod = "future";
                    this.activeTab = DataSet.tabs(this.homeMod)[0];
                    this.actionBar.activeItem = item;
                    break;
                case "Setting":
                    this.curPage = "setting";
                    this.actionBar.activeItem = item;
                    break;
                case "Quit":
                    if (confirm("Sure to Quit?")) {
                        // TODO quit application; 
                    }
                    break;
                default:
                    alert(`unhandler module: ${item.title}`);
                    break;
            }
        };

        let self = this;
        this.tgw.addSlot({ // login success
            appid: 17,
            packid: 43,
            callback: msg => {
                console.info(`tgw::login ans=>${msg.toString()}`);
            }
        });

        this.tgw.addSlot({ // login failed
            appid: 17,
            packid: 120,
            callback: msg => {
                console.error(`tgw::login ans=>${msg}`);
            }
        });

        this.loginTGW();
    }

    loginTGW() {
        let [host, port] = this.curEndpoint.trade_addr.split(":");
        this.tgw.connect(port, host);
        let timestamp: Date = new Date();
        let stimestamp = timestamp.getFullYear() + ("0" + (timestamp.getMonth() + 1)).slice(-2) +
            ("0" + timestamp.getDate()).slice(-2) + ("0" + timestamp.getHours()).slice(-2) + ("0" + timestamp.getMinutes()).slice(-2) +
            ("0" + timestamp.getSeconds()).slice(-2) + ("0" + timestamp.getMilliseconds()).slice(-2);
        let loginObj = { "cellid": "1", "userid": "1.1", "password": "*32C5A4C0E3733FA7CC2555663E6DB6A5A6FB7F0EDECAC9704A503124C34AA88B", "termid": "12.345", "conlvl": 1, "clientesn": "", "clienttm": stimestamp };
        this.tgw.send(17, 41, loginObj); // login
    }
}