"use strict";

import { Component, OnInit } from "@angular/core";
import { AppStoreService, CryptoService, MessageBox } from "../../../base/api/services/backend.service";
import { ConfigurationBLL, DataKey } from "../../bll/strategy.server";
import { TradeService, QuoteService } from "../../bll/services";

@Component({
    moduleId: module.id,
    selector: "user",
    templateUrl: "user.html",
    styleUrls: ["../home/home.component.css", "./user.css"],
    providers: [
        CryptoService
    ]
})
export class UserComponent implements OnInit {
    name: string;
    quoteHeart: any;
    tradeHeart: any;
    // model
    maid: string;
    userid: string;
    password: string;
    productAppID: number;
    scmsAppID: number;

    constructor(private tradeSrv: TradeService,
        private quoteSrv: QuoteService,
        private appSrv: AppStoreService,
        private cryptoSrv: CryptoService,
        private configBll: ConfigurationBLL) {
        this.name = "个人中心";
        this.maid = "";
        this.userid = "";
        this.password = "";
        this.quoteHeart = null;
        this.tradeHeart = null;
    }

    ngOnInit() {
        this.productAppID = this.appSrv.getSetting().endpoints[0].tgw_apps.ids;
        this.scmsAppID = this.appSrv.getSetting().endpoints[0].tgw_apps.scms;
        this.userid = this.appSrv.getUserProfile().username;
        this.registerListeners();
    }

    get setting() {
        return this.appSrv.getSetting();
    }

    registerListeners() {
        this.quoteSrv.addSlot({ // login success
            appid: 17,
            packid: 43,
            callback: msg => {
                this.appSrv.setLoginQuote(true);

                if (this.quoteHeart !== null) {
                    clearInterval(this.quoteHeart);
                    this.quoteHeart = null;
                }

                this.quoteHeart = setInterval(() => {
                    this.quoteSrv.send(17, 0, {});
                }, 60000);
            }
        });

        this.tradeSrv.addSlot({ // login success
            appid: 17,
            packid: 43,
            callback: msg => {
                if (msg.content.conlvl <= 2 || parseInt(msg.content.msret.msgcode) !== 0) {
                    alert(msg.content.msret.msg);
                    return;
                }

                this.appSrv.setLoginTrade(msg.content.conlvl > 2);
                // to request template
                // this.tradeSrv.send(this.scmsAppID, 194, { "head": { "realActor": "getDataTemplate" }, category: 0 });
                this.tradeSrv.send(this.productAppID, 251, { head: { realActor: "getProduct" }, body: {} });
                console.info(`subscribe=> ${this.configBll.strategyKeys}`);
                this.tradeSrv.send(17, 101, { topic: 8000, kwlist: this.configBll.strategyKeys });

                if (this.tradeHeart !== null) {
                    clearInterval(this.tradeHeart);
                    this.tradeHeart = null;
                }

                this.tradeHeart = setInterval(() => {
                    this.tradeSrv.send(17, 0, {});
                }, 60000);
            }
        });

        this.quoteSrv.addSlot({ // login failed
            appid: 17,
            packid: 120,
            callback: msg => {
                console.info(msg);
            }
        });

        this.tradeSrv.addSlot({ // login failed
            appid: 17,
            packid: 120,
            callback: msg => {
                console.info(msg);
                MessageBox.show("error", "TGW ERROR", msg.content.msg, (response) => {
                    if (response === 1) {
                        this.appSrv.setLoginTrade(false);
                    }
                }, ["忽略", "重新登录"], 0, 0);
            }
        });
    }

    login() {
        if (this.appSrv.isLoginTrade()) {
            this.appSrv.setLoginTrade(true);
            return;
        }

        let curEndpoint = this.setting.endpoints[0];
        let [host, port] = curEndpoint.trade_addr.split(":");
        this.tradeSrv.connect(port, host);
        let timestamp: Date = new Date();
        let stimestamp = timestamp.getFullYear() + ("0" + (timestamp.getMonth() + 1)).slice(-2) +
            ("0" + timestamp.getDate()).slice(-2) + ("0" + timestamp.getHours()).slice(-2) + ("0" + timestamp.getMinutes()).slice(-2) +
            ("0" + timestamp.getSeconds()).slice(-2) + ("0" + timestamp.getMilliseconds()).slice(-2);
        let loginObj: any = { maid: this.maid, cellid: this.maid, userid: this.userid, password: this.cryptoSrv.getTGWPass(this.password), termid: "12.345", conlvl: 999, clientesn: "", clienttm: stimestamp };

        this.tradeSrv.onClose = () => {
            if (this.appSrv.isLoginTrade()) {
                MessageBox.show("warning", "Server Error", "TGW Connection Close!");
                this.appSrv.setLoginTrade(false);
            }
        };

        this.tradeSrv.onConnect = () => {
            this.tradeSrv.send(17, 41, loginObj); // login
            this.appSrv.setUserProfile({ username: this.userid, password: loginObj.password, roles: [], apps: [] });
        };

        AppStoreService.setLocalStorageItem(DataKey.kUserInfo, JSON.stringify(loginObj));

        let quoteObj = { "cellid": "1", "userid": "8.999", "password": "*", "termid": "12.345", "conlvl": 1, "clientesn": "", "clienttm": stimestamp };
        let [qhost, qport] = curEndpoint.quote_addr.split(":");
        this.quoteSrv.connect(qport, qhost);
        this.quoteSrv.send(17, 41, quoteObj);
    }
}