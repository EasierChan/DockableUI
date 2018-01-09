"use strict";

import { Component, OnInit, HostListener } from "@angular/core";
import { AppStoreService, CryptoService, MessageBox, Environment } from "../../../base/api/services/backend.service";
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
    loginState: number;

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
        this.loginState = 0;
    }

    ngOnInit() {
        this.productAppID = this.appSrv.getSetting().endpoints[0].tgw_apps.ids;
        this.userid = this.appSrv.getUserProfile() ? this.appSrv.getUserProfile().username : null;
        this.registerListeners();
    }

    @HostListener("keyup", ["$event"])
    onKeyUp(event: KeyboardEvent) {
        event.preventDefault();

        if (event.keyCode === 13 && this.loginState === 0) {
            this.login();
        }
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

        this.tradeSrv.addSlot({
            service: ServiceType.kLogin,
            msgtype: FGS_MSG.kLoginAns,
            callback: (msg) => {
                let obj = JSON.parse(msg.toString());
                if (obj.data.ret_code !== 0) {
                    alert(obj.data.ret_msg);
                    this.loginState = 0;
                    return;
                }

                this.loginState = 2;

                let dataObj = JSON.parse(AppStoreService.getLocalStorageItem(DataKey.kUserInfo));
                dataObj.term_id = obj.data.term_id;
                AppStoreService.setLocalStorageItem(DataKey.kUserInfo, JSON.stringify(dataObj));
                this.configBll.set("user", { userid: this.userid, termid: obj.data.term_id });
                this.appSrv.setLoginTrade(true);
                this.tradeSrv.sendToCMS("getStrategyServerTemplate", JSON.stringify({ data: { body: { userid: parseInt(this.userid) } } }));
                this.tradeSrv.sendToCMS("getProduct", JSON.stringify({ data: { body: { userid: parseInt(this.userid) } } }));
                this.tradeSrv.sendToCMS("getStrategyConfig", JSON.stringify({ data: { head: { userid: parseInt(this.userid) }, body: { traderid: parseInt(this.userid), ui_parms: 1 } } }));
                this.tradeSrv.sendToCMS("getAssetAccount", JSON.stringify({ data: { body: { userid: parseInt(this.userid) } } }));
                this.tradeSrv.sendToCMS("getRiskIndex", JSON.stringify({ data: { body: { userid: parseInt(this.userid) } } }));
                this.tradeSrv.sendToCMS("getBasketInfo", JSON.stringify({ data: { body: { userid: parseInt(this.userid) } } }));

                this.tradeSrv.subscribe(1, [ServiceType.kStrategy]);
                this.configBll.emit("login", null);
            }
        });

        this.quoteSrv.addSlot({ // login failed
            appid: 17,
            packid: 120,
            callback: msg => {
                console.info(msg);
            }
        });


        let curEndpoint = this.setting.endpoints[0];
        let [host, port] = curEndpoint.trade_addr.split(":");

        let timestamp: Date = new Date();
        let stimestamp = timestamp.getFullYear() + ("0" + (timestamp.getMonth() + 1)).slice(-2) +
            ("0" + timestamp.getDate()).slice(-2) + ("0" + timestamp.getHours()).slice(-2) + ("0" + timestamp.getMinutes()).slice(-2) +
            ("0" + timestamp.getSeconds()).slice(-2) + ("0" + timestamp.getMilliseconds()).slice(-2);

        if (!this.configBll.get("tcp-connect")) {
            this.tradeSrv.onConnect = () => {
                this.configBll.set("tcp-connect", true);

                this.tradeSrv.onClose = () => {
                    this.configBll.set("tcp-connect", false);

                    if (this.appSrv.isLoginTrade()) {
                        this.appSrv.setLoginTrade(false);
                        MessageBox.show("warning", "Server Error", "Trade Connection Close!");
                    }
                };
            };

            this.tradeSrv.connect(parseInt(port), host);
        }

        let quoteObj = { "cellid": "1", "userid": "8.999", "password": "*", "termid": "12.345", "conlvl": 1, "clientesn": "", "clienttm": stimestamp };
        let [qhost, qport] = curEndpoint.quote_addr.split(":");
        this.quoteSrv.connect(parseInt(qport), qhost);
        this.quoteSrv.send(17, 41, quoteObj);
    }

    login() {
        if (this.loginState === 1) {
            return;
        }

        this.loginState = 1;

        if (this.appSrv.isLoginTrade()) {
            this.appSrv.setLoginTrade(true);
            return;
        }

        if (this.password.length < 6) {
            alert("密码长度不对");
            return;
        }

        let loginObj: any = {
            user_id: this.userid,
            password: this.cryptoSrv.getTGWPass(this.password),
            dsn: "",
            cpuid: ""
        };

        Object.assign(loginObj, Environment.getIPandMAC());
        this.tradeSrv.send(FGS_MSG.kLogin, JSON.stringify({ data: loginObj }), ServiceType.kLogin);
        this.appSrv.setUserProfile({ username: parseInt(this.userid), password: loginObj.password, roles: [], apps: [] });
        AppStoreService.setLocalStorageItem(DataKey.kUserInfo, JSON.stringify(loginObj));
    }

    logout() {
        this.tradeSrv.send(FGS_MSG.kLogout, JSON.stringify({ data: { user_id: this.userid } }), ServiceType.kLogin);
        this.appSrv.setLoginTrade(false);
        this.loginState = 0;
    }
}