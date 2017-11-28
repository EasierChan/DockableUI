"use strict";

import { Component, OnInit } from "@angular/core";
import { AppStoreService, CryptoService, MessageBox } from "../../../base/api/services/backend.service";
import { ConfigurationBLL, DataKey } from "../../bll/strategy.server";
import { QtpService, QuoteService } from "../../bll/services";
import { FGS_MSG, ServiceType, QTPMessage } from "../../../base/api/model/qtp/message.model";
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
    operNum: string;
    password: string;
    productAppID: number;
    isTcpConnect: boolean;

    private userid: string;

    constructor(private tradeSrv: QtpService,
        private quoteSrv: QuoteService,
        private appSrv: AppStoreService,
        private cryptoSrv: CryptoService,
        private configBll: ConfigurationBLL) {
        this.name = "个人中心";
        this.password = "";
        this.quoteHeart = null;
        this.tradeHeart = null;
    }

    ngOnInit() {
        this.productAppID = this.appSrv.getSetting().endpoints[0].tgw_apps.ids;
        this.userid = this.appSrv.getUserProfile().username;
        this.isTcpConnect = false;
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

        // this.tradeSrv.addSlot({ // login success
        //     appid: 17,
        //     packid: 43,
        //     callback: msg => {
        //         if (msg.content.conlvl <= 2 || parseInt(msg.content.msret.msgcode) !== 0) {
        //             alert(msg.content.msret.msg);
        //             return;
        //         }

        //         this.appSrv.setLoginTrade(msg.content.conlvl > 2);
        //         // to request template
        //         this.tradeSrv.send(this.productAppID, 251, { "head": { "realActor": "getStrategyServerTemplate" }, body: {} });
        //         this.tradeSrv.send(this.productAppID, 251, { head: { realActor: "getProduct" }, body: {} });
        //         this.tradeSrv.send(this.productAppID, 251, { head: { realActor: "getAssetAccount" }, body: {} });
        //         this.tradeSrv.send(this.productAppID, 251, { head: { realActor: "getRiskIndex" }, body: {} });
        //         console.info(`subscribe=> ${this.configBll.strategyKeys}`);
        //         this.tradeSrv.send(17, 101, { topic: 8000, kwlist: this.configBll.strategyKeys });

        //     }
        // });
        this.tradeSrv.addSlot({
            service: ServiceType.kLogin,
            msgtype: FGS_MSG.kLoginAns,
            callback: (msg) => {
                let obj = JSON.parse(msg.toString());
                if (obj.data.ret_code !== 0) {
                    alert(obj.data.ret_msg);
                    return;
                }

                this.appSrv.setLoginTrade(true);
                this.tradeSrv.send(251, JSON.stringify({ "head": { "realActor": "getStrategyServerTemplate" }, body: { userid: parseInt(this.userid) } }), ServiceType.kCMS);
                console.info(`subscribe=> ${this.configBll.servers}`);
                this.tradeSrv.subscribe(2001, this.configBll.servers);
                this.tradeSrv.subscribe(1, [ServiceType.kLogin]);
            }
        });

        this.quoteSrv.addSlot({ // login failed
            appid: 17,
            packid: 120,
            callback: msg => {
                console.info(msg);
            }
        });
    }

    login() {
        if (this.appSrv.isLoginTrade()) {
            this.appSrv.setLoginTrade(true);
            return;
        }

        if (this.password.length < 6) {
            alert("密码长度不对");
            return;
        }

        let curEndpoint = this.setting.endpoints[0];
        let [host, port] = curEndpoint.trade_addr.split(":");
        let timestamp: Date = new Date();
        let stimestamp = timestamp.getFullYear() + ("0" + (timestamp.getMonth() + 1)).slice(-2) +
            ("0" + timestamp.getDate()).slice(-2) + ("0" + timestamp.getHours()).slice(-2) + ("0" + timestamp.getMinutes()).slice(-2) +
            ("0" + timestamp.getSeconds()).slice(-2) + ("0" + timestamp.getMilliseconds()).slice(-2);
        let loginObj: any;

        this.tradeSrv.onConnect = () => {
            this.isTcpConnect = true;
            loginObj = { user_id: this.userid, password: this.cryptoSrv.getTGWPass(this.password) };

            this.tradeSrv.send(FGS_MSG.kLogin, JSON.stringify({ data: loginObj }), ServiceType.kLogin);
            this.appSrv.setUserProfile({ username: parseInt(this.userid), password: loginObj.password, roles: [], apps: [] });
            AppStoreService.setLocalStorageItem(DataKey.kUserInfo, JSON.stringify(loginObj));

            this.tradeSrv.onClose = () => {
                this.isTcpConnect = false;
                if (this.appSrv.isLoginTrade()) {
                    MessageBox.show("warning", "Server Error", "TGW Connection Close!");
                    this.appSrv.setLoginTrade(false);
                }
            };
        };
        this.tradeSrv.connect(parseInt(port), host);

        let quoteObj = { "cellid": "1", "userid": "8.999", "password": "*", "termid": "12.345", "conlvl": 1, "clientesn": "", "clienttm": stimestamp };
        let [qhost, qport] = curEndpoint.quote_addr.split(":");
        this.quoteSrv.connect(parseInt(qport), qhost);
        this.quoteSrv.send(17, 41, quoteObj);
    }
}