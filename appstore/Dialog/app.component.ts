/**
 * created by cl, 2017/05/09
 * update: [date]
 * desc:
 */
"use strict";

import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { IP20Service } from "../../base/api/services/ip20.service";
import { AppStateCheckerRef, AppStoreService, TranslateService } from "../../base/api/services/backend.service";
import { ProductComponent } from "./product/product";

@Component({
    moduleId: module.id,
    selector: "body",
    templateUrl: "dialog.html",
    styleUrls: ["app.component.css"],
    viewProviders: [
        ProductComponent
    ],
    providers: [
        AppStateCheckerRef,
        TranslateService,
        IP20Service,
        AppStoreService
    ]
})
export class AppComponent implements OnInit {
    private readonly apptype = "dialog";
    private languageType = 0;
    main: any;
    option: any;

    constructor(private state: AppStateCheckerRef, private langServ: TranslateService,
        private trade: IP20Service, private appsrv: AppStoreService) {
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
    }

    loginTGW(afterLogin?: Function) {
        let [addr, port] = this.appsrv.getSetting().endpoints[0].trade_addr.split(":");
        this.trade.connect(port, addr);

        let timestamp: Date = new Date();
        let stimestamp = timestamp.getFullYear() + ("0" + (timestamp.getMonth() + 1)).slice(-2) +
            ("0" + timestamp.getDate()).slice(-2) + ("0" + timestamp.getHours()).slice(-2) + ("0" + timestamp.getMinutes()).slice(-2) +
            ("0" + timestamp.getSeconds()).slice(-2) + ("0" + timestamp.getMilliseconds()).slice(-2);
        let loginObj = { "cellid": "1", "userid": "8.999", "password": "*32C5A4C0E3733FA7CC2555663E6DB6A5A6FB7F0EDECAC9704A503124C34AA88B", "termid": "12.345", "conlvl": 1, "clientesn": "", "clienttm": stimestamp };

        this.trade.addSlot({
            appid: 17,
            packid: 43,
            callback: msg => {
                console.info(`tgw ans=>${msg}`);
                if (afterLogin)
                    afterLogin();
            }
        });

        this.trade.addSlot({
            appid: 17,
            packid: 120,
            callback: msg => {
                console.info(msg);
            }
        });

        this.trade.send(17, 41, loginObj);
    }

    ngOnInit() {
        this.registerListeners();

        switch (this.option.dlg_name) {
            case "product":
                this.loginTGW(() => {
                    let today = new Date();
                    let dateStr = today.getFullYear() * 10000 +  (today.getMonth() + 1) * 100 +  (today.getDate());
                    this.trade.send(260, 232, { body: { productID: this.option.productID } });
                    this.trade.send(260, 228, { body: { tblock_id: this.option.productID, begin_date: dateStr.toString(), end_date: dateStr.toString() } });
                    this.trade.send(260, 230, { body: { tblock_id: this.option.productID, begin_date: dateStr.toString(), end_date: dateStr.toString() } });
                });
                break;
            default:
                console.error(`unknown dialog name => ${this.option.dlg_name}`);
                break;
        }
    }

    registerListeners() {
    }
}