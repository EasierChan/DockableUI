/**
 * created by cl, date 2017/08/24
 */
"use strict";

import { Header } from "../model/itrade/message.model";
import { IP20Service } from "./ip20.service";

export class StrategyService {
    tgwConn: IP20Service;
    appid: number;
    quoteHeart: any = null;
    onConnected: Function;

    constructor(id: number) {
        this.appid = id;
        this.tgwConn = new IP20Service();
    }

    registerListeners() {
        this.tgwConn.addSlot(
            {
                appid: 800,
                packid: 1001,
                callback: (msg) => {
                    console.info(msg);
                }
            }
        );

        if (this.onConnected) {
            this.onConnected();
        }
    }

    send(type: number, subtype: number, body: any) {
        let head = new Header();
        head.type = type;
        head.subtype = subtype;
        head.msglen = 0;

        if (body === undefined || body === null) {
            this.tgwConn.send(this.appid, 1000, head.toBuffer());
        } else if (body instanceof Buffer) {
            head.msglen = body.length;
            this.tgwConn.send(this.appid, 1000, Buffer.concat([head.toBuffer(), body], Header.len + head.msglen));
        } else {
            let buf = body.toBuffer();
            head.msglen = buf.length;
            this.tgwConn.send(this.appid, 1000, Buffer.concat([head.toBuffer(), buf], Header.len + head.msglen));
        }

        head = null;
    }

    connect(port, host = "127.0.0.1") {
        this.tgwConn.connect(port, host);
        this.tgwConn.onConnect = () => {
            this.loginTGW(this.registerListeners);
        };
    }

    loginTGW(afterLogin?: Function) {
        let timestamp: Date = new Date();
        let stimestamp = timestamp.getFullYear() + ("0" + (timestamp.getMonth() + 1)).slice(-2) +
            ("0" + timestamp.getDate()).slice(-2) + ("0" + timestamp.getHours()).slice(-2) + ("0" + timestamp.getMinutes()).slice(-2) +
            ("0" + timestamp.getSeconds()).slice(-2) + ("0" + timestamp.getMilliseconds()).slice(-2);
        let loginObj = { "cellid": "1", "userid": "8.999", "password": "88888", "termid": "12.345", "conlvl": 2, "clienttm": stimestamp };
        this.tgwConn.addSlot(
            {
                appid: 17,
                packid: 43,
                callback: msg => {
                    console.info(`quote ans=>${msg}`);
                    if (afterLogin)
                        afterLogin.call(this);

                    if (this.quoteHeart !== null) {
                        clearInterval(this.quoteHeart);
                        this.quoteHeart = null;
                    }

                    this.quoteHeart = setInterval(() => {
                        this.tgwConn.send(17, 0, {});
                    }, 60000);
                }
            }, {
                appid: 17,
                packid: 120,
                callback: msg => {
                    console.info(msg);
                }
            });

        this.tgwConn.send(17, 41, loginObj);
    }
}

