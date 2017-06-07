"use strict";

import { IP20Service } from "../../../base/api/services/ip20.worker";
import { ComConOrder, ComOrder, ComOrderCancel, EOrderType, ComContract } from "../../../base/api/model/itrade/orderstruct";
import { OrderService } from "../../../base/api/services/orderService";
import { SecuMasterService } from "../../../base/api/services/backend.service";
import { TranslateService } from "../../../base/api/services/translate.service";

const logger = console;
/**
 * interface for single pro.
 */
process.on("message", (m: WSIP20, sock) => {
    console.info(m);
    switch (m.command) {
        case "ps-start":
            IP20Factory.instance.onConnect = () => {
                process.send({ event: "ps-connect" });
            };

            IP20Factory.instance.onClose = () => {
                process.send({ event: "ps-close" });
            };

            IP20Factory.instance.addSlot({
                appid: 17,
                packid: 43,
                callback(msg) {
                    logger.info(`tgw ans=>${msg}`);
                }
            }, {
                    appid: 17,
                    packid: 120,
                    callback(msg) {
                        logger.info(`tgw ans=>${msg}`);
                    }
                }, {
                    appid: 17,
                    packid: 110,
                    callback(msg) {
                        process.send({ event: "ps-data", content: msg });
                    }
                });

            IP20Factory.instance.connect(m.params.port, m.params.host);
            let timestamp: Date = new Date();
            let stimestamp = timestamp.getFullYear() + ("0" + (timestamp.getMonth() + 1)).slice(-2) +
                ("0" + timestamp.getDate()).slice(-2) + ("0" + timestamp.getHours()).slice(-2) + ("0" + timestamp.getMinutes()).slice(-2) +
                ("0" + timestamp.getSeconds()).slice(-2) + ("0" + timestamp.getMilliseconds()).slice(-2);
            let loginObj = { "cellid": "000003", "userid": "000003.1", "password": "88888", "termid": "12.345", "conlvl": 2, "clienttm": stimestamp };
            IP20Factory.instance.send(17, 41, loginObj);
            break;
        case "ps-send":
            IP20Factory.instance.send(m.params.appid, m.params.packid, m.params.msg);
            break;
        case "ps-stop":
            break;
        case "ss-start":
            break;
        case "ss-send":
            break;
        default:
            logger.error(`unvalid command => ${m.command}`);
            break;
    }
});

process.on("close", () => {
    console.info(`process closed`);
});

process.on("disconnect", () => {
    console.info(`process disconnect`);
});

process.on("error", () => {
    console.info(`process error`);
});

process.on("exit", () => {
    console.info(`process exit`);
});

interface WSIP20 {
    command: string;
    params: any;
}

export class IP20Factory {
    private static tgw: IP20Service;
    static get instance() {
        if (!IP20Factory.tgw)
            IP20Factory.tgw = new IP20Service();

        return IP20Factory.tgw;
    }
}