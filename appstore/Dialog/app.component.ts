/**
 * created by cl, 2017/05/09
 * update: [date]
 * desc:
 */
"use strict";

import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { QtpService } from "../../base/api/services/qtp.service";
import { AppStateCheckerRef, AppStoreService, TranslateService } from "../../base/api/services/backend.service";
import { ProductComponent } from "./product/product";
import { FGS_MSG, ServiceType, QTPMessage } from "../../base/api/model/qtp/message.model";
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
        QtpService,
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
        private tradePoint: QtpService, private appsrv: AppStoreService) {
        AppStoreService.removeLocalStorageItem(DataKey.kStrategyCfg);
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

        let loginObj = JSON.parse(AppStoreService.getLocalStorageItem(DataKey.kUserInfo));

        this.tradePoint.addSlot({
            service: ServiceType.kLogin,
            msgtype: FGS_MSG.kLoginAns,
            callback: (msg) => {
                let obj = JSON.parse(msg.toString());
                if (obj.data.ret_code !== 0) {
                    alert(obj.data.ret_msg);
                    return;
                }

                if (afterLogin)
                    afterLogin();
            }
        });

        this.tradePoint.onConnect = () => {
            this.tradePoint.send(FGS_MSG.kLogin, JSON.stringify({ data: loginObj }), ServiceType.kLogin);
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
                    this.tradePoint.sendToCMS("getMonitorProducts", JSON.stringify({ data: { body: { caid: this.option.productID } } }));
                    this.tradePoint.sendToCMS("getProductStockHoldWeight", JSON.stringify({ data: { body: { caid: this.option.productID, begin_date: dateStr.toString(), end_date: dateStr.toString() } } }));
                    this.tradePoint.sendToCMS("getProductFuturesHoldWeight", JSON.stringify({ data: { body: { caid: this.option.productID, begin_date: dateStr.toString(), end_date: dateStr.toString() } } }));
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