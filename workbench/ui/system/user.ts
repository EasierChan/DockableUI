"use strict";

import { Component, OnInit } from "@angular/core";
import { AppStoreService, CryptoService } from "../../../base/api/services/backend.service";
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

    constructor(private tradeSrv: TradeService,
        private quoteSrv: QuoteService,
        private appSrv: AppStoreService,
        private cryptoSrv: CryptoService) {
        this.name = "个人中心";
        this.maid = "";
        this.userid = "";
        this.password = "";
        this.quoteHeart = null;
        this.tradeHeart = null;
    }

    ngOnInit() {
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
                this.appSrv.setLoginTrade(msg.content.conlvl > 2);
                // to request template
                // this.tradeSrv.send(270, 194, { "head": { "realActor": "getDataTemplate" }, category: 0 });
                this.tradeSrv.send(260, 216, { body: { tblock_type: 2 } });

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
                this.appSrv.setLoginQuote(false);
            }
        });

        this.tradeSrv.addSlot({ // login failed
            appid: 17,
            packid: 120,
            callback: msg => {
                console.info(msg);
                // this.appSrv.setLoginTrade(false);
            }
        });
    }

    login() {
        let curEndpoint = this.setting.endpoints[0];
        let [host, port] = curEndpoint.trade_addr.split(":");
        this.tradeSrv.connect(port, host);
        let timestamp: Date = new Date();
        let stimestamp = timestamp.getFullYear() + ("0" + (timestamp.getMonth() + 1)).slice(-2) +
            ("0" + timestamp.getDate()).slice(-2) + ("0" + timestamp.getHours()).slice(-2) + ("0" + timestamp.getMinutes()).slice(-2) +
            ("0" + timestamp.getSeconds()).slice(-2) + ("0" + timestamp.getMilliseconds()).slice(-2);
        let loginObj: any = { maid: this.maid, cellid: "*", userid: this.userid, password: this.cryptoSrv.generateMD5(this.password), termid: "12.345", conlvl: 999, clientesn: "", clienttm: stimestamp };
        this.tradeSrv.send(17, 41, loginObj); // login

        loginObj = { "cellid": "1", "userid": "8.999", "password": "*", "termid": "12.345", "conlvl": 1, "clientesn": "", "clienttm": stimestamp };
        let [qhost, qport] = curEndpoint.quote_addr.split(":");
        this.quoteSrv.connect(qport, qhost);
        this.quoteSrv.send(17, 41, loginObj);
    }
}