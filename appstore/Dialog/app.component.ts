/**
 * created by cl, 2017/05/09
 * update: [date]
 * desc:
 */
"use strict";

import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import {
    Control, ComboControl, MetaControl, SpreadViewer, SpreadViewerConfig,
    VBox, HBox, TextBox, Button, DockContainer, ChartViewer
} from "../../base/controls/control";
import { IP20Service } from "../../base/api/services/ip20.service";
import { AppStateCheckerRef, File, Environment, Sound, SecuMasterService, TranslateService } from "../../base/api/services/backend.service";
declare let window: any;

@Component({
    moduleId: module.id,
    selector: "body",
    templateUrl: "dialog.html",
    styleUrls: ["app.component.css"],
    providers: [
        IP20Service,
        AppStateCheckerRef,
        SecuMasterService,
        TranslateService
    ]
})
export class AppComponent implements OnInit {
    private readonly apptype = "dialog";
    private languageType = 0;
    main: any;
    option: any;

    constructor(private tgw: IP20Service, private state: AppStateCheckerRef, private secuinfo: SecuMasterService, private langServ: TranslateService) {
        this.state.onInit(this, this.onReady);
    }

    onReady(option: any) {
        this.option = option;
        let language = this.option.lang;

        switch (language) {
            case "zh-cn":
                this.languageType = 1;
                break;
            case "en-us":
                this.languageType = 0;
                break;
            default:
                this.languageType = 0;
                break;
        }

        this.loginTGW();
    }

    loginTGW() {
        this.tgw.connect(this.option.port, this.option.host);

        let timestamp: Date = new Date();
        let stimestamp = timestamp.getFullYear() + ("0" + (timestamp.getMonth() + 1)).slice(-2) +
            ("0" + timestamp.getDate()).slice(-2) + ("0" + timestamp.getHours()).slice(-2) + ("0" + timestamp.getMinutes()).slice(-2) +
            ("0" + timestamp.getSeconds()).slice(-2) + ("0" + timestamp.getMilliseconds()).slice(-2);
        let loginObj = { "cellid": "000003", "userid": "000003.1", "password": "88888", "termid": "12.345", "conlvl": 2, "clienttm": stimestamp };

        this.tgw.addSlot({
            appid: 17,
            packid: 43,
            callback: msg => {
                console.info(`tgw ans=>${msg}`);
            }
        });

        this.tgw.addSlot({
            appid: 17,
            packid: 120,
            callback: msg => {
                console.info(msg);
            }
        });

        this.tgw.send(17, 41, loginObj);
    }

    ngOnInit() {
        if (this.option.dlg_name) {
            
        }
    }
}