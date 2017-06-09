"use strict";

import { IP20Service } from "../../../base/api/services/ip20.worker";
import { ComConOrder, ComOrder, ComOrderCancel, EOrderType, ComContract } from "../../../base/api/model/itrade/orderstruct";
import { OrderService } from "../../../base/api/services/orderService";
import { ManulTrader } from "./sendorder";
const logger = console;
/**
 * interface for single pro.
 */
process.on("message", (m: WSIP20, sock) => {

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
            console.log(m.params);
            IP20Factory.instance.send(m.params.appid, m.params.packid, m.params.msg);
            break;
        case "ps-stop":
            break;
        case "ss-start":
            // process of strategy init
            ManulTrader.addSlot(2011, data => {
                process.send({ event: "ss-data", content: { type: 2011, data: data } });
            });
            ManulTrader.addSlot(2033, data => {
                process.send({ event: "ss-data", content: { type: 2033, data: data } });
            });
            ManulTrader.addSlot(2000, data => {
                process.send({ event: "ss-data", content: { type: 2000, data: data } });
            });
            ManulTrader.addSlot(2002, data => {
                process.send({ event: "ss-data", content: { type: 2002, data: data } });
            });
            ManulTrader.addSlot(2004, data => {
                process.send({ event: "ss-data", content: { type: 2004, data: data } });
            });
            ManulTrader.addSlot(2049, data => {
                process.send({ event: "ss-data", content: { type: 2049, data: data } });
            });
            ManulTrader.addSlot(2030, data => {
                process.send({ event: "ss-data", content: { type: 2030, data: data } });
            });
            ManulTrader.addSlot(2029, data => {
                process.send({ event: "ss-data", content: { type: 2029, data: data } });
            });
            ManulTrader.addSlot(2032, data => {
                process.send({ event: "ss-data", content: { type: 2032, data: data } });
            });
            ManulTrader.addSlot(2001, data => {
                process.send({ event: "ss-data", content: { type: 2001, data: data } });
            });
            ManulTrader.addSlot(2003, data => {
                process.send({ event: "ss-data", content: { type: 2003, data: data } });
            });
            ManulTrader.addSlot(2005, data => {
                process.send({ event: "ss-data", content: { type: 2005, data: data } });
            });
            ManulTrader.addSlot(2050, data => {
                process.send({ event: "ss-data", content: { type: 2050, data: data } });
            });
            ManulTrader.addSlot(2031, data => {
                process.send({ event: "ss-data", content: { type: 2031, data: data } });
            });
            ManulTrader.addSlot(2048, data => {
                process.send({ event: "ss-data", content: { type: 2048, data: data } });
            });
            ManulTrader.addSlot(2020, data => {
                process.send({ event: "ss-data", content: { type: 2020, data: data } });
            });
            ManulTrader.addSlot(2013, data => {
                process.send({ event: "ss-data", content: { type: 2013, data: data } });
            });
            ManulTrader.addSlot(3502, data => {
                process.send({ event: "ss-data", content: { type: 3502, data: data } });
            });
            ManulTrader.addSlot(3504, data => {
                process.send({ event: "ss-data", content: { type: 3504, data: data } });
            });
            ManulTrader.addSlot(2015, data => {
                process.send({ event: "ss-data", content: { type: 2015, data: data } });
            });
            ManulTrader.addSlot(2017, data => {
                process.send({ event: "ss-data", content: { type: 2017, data: data } });
            });
            ManulTrader.addSlot(2023, data => {
                process.send({ event: "ss-data", content: { type: 2023, data: data } });
            });
            ManulTrader.addSlot(2025, data => {
                process.send({ event: "ss-data", content: { type: 2025, data: data } });
            });
            ManulTrader.addSlot(5022, data => {
                process.send({ event: "ss-data", content: { type: 5022, data: data } });
            });
            ManulTrader.addSlot(2021, data => {
                process.send({ event: "ss-data", content: { type: 2021, data: data } });
            });
            ManulTrader.addSlot(2022, data => {
                process.send({ event: "ss-data", content: { type: 2022, data: data } });
            });
            ManulTrader.addSlot(3011, data => {
                process.send({ event: "ss-data", content: { type: 3011, data: data } });
            });
            ManulTrader.addSlot(3510, data => {
                process.send({ event: "ss-data", content: { type: 3510, data: data } });
            });
            ManulTrader.addSlot(2040, data => {
                process.send({ event: "ss-data", content: { type: 2040, data: data } });
            });
            ManulTrader.addSlot(5021, data => {
                process.send({ event: "ss-data", content: { type: 5021, data: data } });
            });
            ManulTrader.addSlot(5024, data => {
                process.send({ event: "ss-data", content: { type: 5024, data: data } });
            });
            ManulTrader.addSlot(8000, data => {
                process.send({ event: "ss-data", content: { type: 8000, data: data } });
            });
            ManulTrader.init(m.params.port, m.params.host);
            break;
        case "ss-send":
            ss_sendHandle(m.params);
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

function ss_sendHandle(data: any) {
    let type = data.type;
    let content = data.data;
    switch (type) {
        case "sendorder":
            ManulTrader.submitOrder(content);
            break;
        case "cancelorder":
            ManulTrader.cancelorder(content);
            break;
        case "singleBuy":
            ManulTrader.singleBuy(content.account, content.askPriceLevel, content.bidPriceLevel, content.askOffset, content.bidOffset, content.ukey, content.qty);
            break;
        case "singleCancel":
            ManulTrader.singleCancel(content.account, content.ukey);
            break;
        case "submitBasket":
            ManulTrader.submitBasket(content.type, content.indexSymbol, content.divideNum, content.account, content.initPos);
            break;
        case "sendAllSel":
            ManulTrader.sendAllSel(content.account, content.count, content.askPriceLevel, content.bidPriceLevel, content.askOffset, content.bidOffset, content.sendArr);
            break;
        case "cancelAllSel":
            ManulTrader.cancelAllSel(content.account, content.count, content.sendArr);
            break;
        case "getProfitInfo":
            ManulTrader.getProfitInfo();
            break;
        case "submitPara":
            ManulTrader.submitPara(content);
            break;
        case "strategyControl":
            ManulTrader.strategyControl(content.tip, content.strategyid);
            break;
        case "registerAccPos":
            ManulTrader.registerAccPos(content);
            break;
        default:
            break;
    }
}