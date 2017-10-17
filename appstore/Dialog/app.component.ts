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
import { DataKey } from "../../base/api/model/workbench.model";

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
    productAppID: number;

    constructor(private state: AppStateCheckerRef, private langServ: TranslateService,
        private tradePoint: IP20Service, private appsrv: AppStoreService) {
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
        this.tradePoint.connect(port, addr);

        let timestamp: Date = new Date();
        let stimestamp = timestamp.getFullYear() + ("0" + (timestamp.getMonth() + 1)).slice(-2) +
            ("0" + timestamp.getDate()).slice(-2) + ("0" + timestamp.getHours()).slice(-2) + ("0" + timestamp.getMinutes()).slice(-2) +
            ("0" + timestamp.getSeconds()).slice(-2) + ("0" + timestamp.getMilliseconds()).slice(-2);
        let loginObj = JSON.parse(AppStoreService.getLocalStorageItem(DataKey.kUserInfo));
        loginObj.clienttm = stimestamp;

        this.tradePoint.addSlot({
            appid: 17,
            packid: 43,
            callback: msg => {
                console.info(`tgw ans=>${msg}`);
                if (afterLogin)
                    afterLogin();
            }
        });

        this.tradePoint.addSlot({
            appid: 17,
            packid: 120,
            callback: msg => {
                console.info(msg);
            }
        });

        this.tradePoint.onConnect = () => {
            this.tradePoint.send(17, 41, loginObj);
        };
    }

    ngOnInit() {
        this.productAppID = this.appsrv.getSetting().endpoints[0].tgw_apps.ids;
        this.registerListeners();

        switch (this.option.dlg_name) {
            case "product":
                this.loginTGW(() => {
                    let today = new Date();
                    let dateStr = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + (today.getDate());
                    this.tradePoint.send(this.productAppID, 251, { head: { realActor: "getMonitorProducts" }, body: { caid: this.option.productID } });
                    this.tradePoint.send(this.productAppID, 251, { head: { realActor: "getProductStockHoldWeight" }, body: { caid: this.option.productID, begin_date: dateStr.toString(), end_date: dateStr.toString() } });
                    this.tradePoint.send(this.productAppID, 251, { head: { realActor: "getProductFuturesHoldWeight" }, body: { caid: this.option.productID, begin_date: dateStr.toString(), end_date: dateStr.toString() } });
                });
                break;
            case "strategy":
                this.loginTGW();
                break;
            default:
                console.error(`unknown dialog name => ${this.option.dlg_name}`);
                break;
        }
    }

    registerListeners() {
    }
}