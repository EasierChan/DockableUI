"use strict";

import { IP20Service } from "../../../base/api/services/ip20.worker";
import { Header } from "../../../base/api/model/itrade/message.model";
import {
    RegisterMessage, ComStrategyInfo, ComGuiAckStrategy, ComTotalProfitInfo,
    ComConOrderStatus, ComStrategyCfg, ComOrderRecord, ComAccountPos,
    ComRecordPos, ComGWNetGuiInfo, StatArbOrder, ComConOrderErrorInfo
} from "../../../base/api/model/itrade/strategy.model";
import { ComConOrder, ComOrder, ComOrderCancel, EOrderType, ComContract } from "../../../base/api/model/itrade/orderstruct";
import { OrderService } from "../../../base/api/services/orderService";
import { ManulTrader } from "./sendorder";
import { Sound } from "../../../base/api/services/backend.worker";
import { ULogger } from "../../../base/api/common/base/logger";

ULogger.init("alert", process.argv[2]);
const logger = ULogger.console();
/**
 * interface for single pro.
 */

process.on("message", (m: WSIP20, sock) => {

    switch (m.command) {
        case "ps-start":
            let quotePoint = new IP20Service();
            let quoteHeart = null;
            quotePoint.onConnect = () => {
                process.send({ event: "ps-connect" });
                loginTGW(quotePoint);
            };

            quotePoint.onClose = () => {
                process.send({ event: "ps-close" });
            };

            quotePoint.addSlot(
                {
                    appid: 17,
                    packid: 43,
                    callback(msg) {
                        logger.info(`tgw ans=>${msg}`);

                        if (quoteHeart !== null) {
                            clearInterval(quoteHeart);
                            quoteHeart = null;
                        }

                        quoteHeart = setInterval(() => {
                            quotePoint.send(17, 0, {});
                        }, 60000);
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

            quotePoint.connect(m.params.port, m.params.host);
            break;
        case "ps-send":
            quotePoint.send(m.params.appid, m.params.packid, m.params.msg);
            break;
        case "ps-stop":
            break;
        case "ss-start":
            let trade = new StrategyDealer();
            trade.connect(6114, "172.24.50.10");
            break;
        case "ss-send":
            ss_sendHandle(m.params);
            break;
        case "send":
            Sound.play(m.params.type);
            break;
        default:
            logger.error(`unvalid command => ${m.command}`);
            break;
    }
});

process.on("close", () => {
    logger.info(`process closed`);
});

process.on("disconnect", () => {
    logger.info(`process disconnect`);
});

process.on("error", () => {
    logger.info(`process error`);
});

process.on("exit", (code) => {
    logger.info(`process about exit with code: ${code}.`);
});

interface WSIP20 {
    command: string;
    params: any;
}


export class StrategyDealer {
    tradePoint: IP20Service;

    constructor() {
        this.tradePoint = new IP20Service();
    }

    connect(port, host) {
        this.registerListeners();
        this.tradePoint.connect(port, host);
    }

    registerListeners() {
        let tradeHeart = null;
        this.tradePoint.onConnect = () => {
            process.send({ event: "ps-connect" });
            loginTGW(this.tradePoint);
        };

        this.tradePoint.onClose = () => {
            process.send({ event: "ps-close" });
        };

        this.tradePoint.addSlot(
            {
                appid: 17,
                packid: 43,
                callback: (msg) => {
                    logger.info(`tgw ans=>${msg}`);
                    this.registerMessages();

                    if (tradeHeart !== null) {
                        clearInterval(tradeHeart);
                        tradeHeart = null;
                    }

                    tradeHeart = setInterval(() => {
                        this.tradePoint.send(17, 0, {});
                    }, 60000);
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
            }, {
                appid: 800,
                packid: 1001,
                callback: (msg) => {
                    console.info(msg.content.length);
                    this.decode(msg.content);
                }
            }
        );
    }

    decode(content: Buffer) {
        let header: Header = new Header();
        header.fromBuffer(content);

        let offset = Header.len;
        let count = 0;
        let msg;

        switch (header.type) {
            case 2001: // ComGuiAckStrategy start
            case 2003: // ComGuiAckStrategy stop
            case 2005: // ComGuiAckStrategy pause
            case 2050: // ComGuiAckStrategy watch
            case 2031: // ComGuiAckStrategy submit
                count = content.readUInt32LE(offset);
                offset += 4;
                msg = new ComGuiAckStrategy();

                for (let i = 0; i < count; ++i) {
                    offset = msg.fromBuffer(content, offset);
                }
                break;
            case 2033:
            case 2011: // ComStrategyInfo
                count = content.readUInt32LE(offset);
                offset += 4;
                msg = new ComStrategyInfo();

                for (let i = 0; i < count; ++i) {
                    offset = msg.fromBuffer(content, offset);
                }
                break;
            case 2048: // ComTotalProfitInfo
                count = content.readUInt32LE(offset);
                offset += 4;
                msg = new ComTotalProfitInfo();

                for (let i = 0; i < count; ++i) {
                    offset = msg.fromBuffer(content, offset);
                }
                break;
            case 2000:
            case 2002:
            case 2004:
            case 2049:
            case 2030:
            case 2029:
            case 2032:
                count = content.readUInt32LE(offset);
                offset += 4;
                msg = new ComStrategyCfg();
                for (let i = 0; i < count; ++i) {
                    offset = msg.fromBuffer(content, offset);
                }
                break;
            case 2022:
                count = content.readUInt32LE(offset);
                offset += 4;
                msg = new ComOrderRecord();
                for (let i = 0; i < count; ++i) {
                    offset = msg.fromBuffer(content, offset);
                }
                break;
            case 2013:
                count = content.readUInt32LE(offset);
                offset += 4;
                msg = new ComAccountPos();
                for (let i = 0; i < count; ++i) {
                    offset = msg.fromBuffer(content, offset);
                }
                break;
            case 3502:
            case 3504:
                count = content.readUInt32LE(offset);
                offset += 4;
                msg = new ComRecordPos();
                for (let i = 0; i < count; ++i) {
                    offset = msg.fromBuffer(content, offset);
                }
                break;
            case 2015:
            case 2017:
                count = content.readUInt32LE(offset);
                offset += 4;
                msg = new ComGWNetGuiInfo();
                for (let i = 0; i < count; ++i) {
                    offset = msg.fromBuffer(content, offset);
                }
                break;
            case 2025:
                count = content.readUInt32LE(offset);
                offset += 4;
                msg = new StatArbOrder();
                for (let i = 0; i < count; ++i) {
                    offset = msg.fromBuffer(content, offset);
                }
                break;
            case 2021:
                count = content.readUInt32LE(offset);
                offset += 4;
                msg = header.subtype === 0 ? new ComConOrderStatus() : new ComConOrderErrorInfo();
                for (let i = 0; i < count; ++i) {
                    offset = msg.fromBuffer(content, offset);
                }
                break;
            case 2040:
                msg = content.slice(offset, content.indexOf(0, offset));
                break;
            default:
                logger.warn(`unhandle msg=> type=${header.type}, subtype=${header.subtype}, msglen=${header.msglen}`);
                break;
        }
        // process of strategy init
        // ManulTrader.addSlot(2011, data => {
        //     process.send({ event: "ss-data", content: { type: 2011, data: data } });
        // });
        // ManulTrader.addSlot(2033, data => {
        //     process.send({ event: "ss-data", content: { type: 2033, data: data } });
        // });
        // ManulTrader.addSlot(2000, data => {
        //     process.send({ event: "ss-data", content: { type: 2000, data: data } });
        // });
        // ManulTrader.addSlot(2002, data => {
        //     process.send({ event: "ss-data", content: { type: 2002, data: data } });
        // });
        // ManulTrader.addSlot(2004, data => {
        //     process.send({ event: "ss-data", content: { type: 2004, data: data } });
        // });
        // ManulTrader.addSlot(2049, data => {
        //     process.send({ event: "ss-data", content: { type: 2049, data: data } });
        // });
        // ManulTrader.addSlot(2030, data => {
        //     process.send({ event: "ss-data", content: { type: 2030, data: data } });
        // });
        // ManulTrader.addSlot(2029, data => {
        //     process.send({ event: "ss-data", content: { type: 2029, data: data } });
        // });
        // ManulTrader.addSlot(2032, data => {
        //     process.send({ event: "ss-data", content: { type: 2032, data: data } });
        // });
        // ManulTrader.addSlot(2001, data => {
        //     process.send({ event: "ss-data", content: { type: 2001, data: data } });
        // });
        // ManulTrader.addSlot(2003, data => {
        //     process.send({ event: "ss-data", content: { type: 2003, data: data } });
        // });
        // ManulTrader.addSlot(2005, data => {
        //     process.send({ event: "ss-data", content: { type: 2005, data: data } });
        // });
        // ManulTrader.addSlot(2050, data => {
        //     process.send({ event: "ss-data", content: { type: 2050, data: data } });
        // });
        // ManulTrader.addSlot(2031, data => {
        //     process.send({ event: "ss-data", content: { type: 2031, data: data } });
        // });
        // ManulTrader.addSlot(2048, data => {
        //     process.send({ event: "ss-data", content: { type: 2048, data: data } });
        // });
        // ManulTrader.addSlot(2020, data => {
        //     process.send({ event: "ss-data", content: { type: 2020, data: data } });
        // });
        // ManulTrader.addSlot(2013, data => {
        //     process.send({ event: "ss-data", content: { type: 2013, data: data } });
        // });
        // ManulTrader.addSlot(3502, data => {
        //     process.send({ event: "ss-data", content: { type: 3502, data: data } });
        // });
        // ManulTrader.addSlot(3504, data => {
        //     process.send({ event: "ss-data", content: { type: 3504, data: data } });
        // });
        // ManulTrader.addSlot(2015, data => {
        //     process.send({ event: "ss-data", content: { type: 2015, data: data } });
        // });
        // ManulTrader.addSlot(2017, data => {
        //     process.send({ event: "ss-data", content: { type: 2017, data: data } });
        // });
        // ManulTrader.addSlot(2023, data => {
        //     process.send({ event: "ss-data", content: { type: 2023, data: data } });
        // });
        // ManulTrader.addSlot(2025, data => {
        //     process.send({ event: "ss-data", content: { type: 2025, data: data } });
        // });
        // ManulTrader.addSlot(5022, data => {
        //     process.send({ event: "ss-data", content: { type: 5022, data: data } });
        // });
        // ManulTrader.addSlot(2021, data => {
        //     process.send({ event: "ss-data", content: { type: 2021, data: data } });
        // });
        // ManulTrader.addSlot(2022, data => {
        //     process.send({ event: "ss-data", content: { type: 2022, data: data } });
        // });
        // ManulTrader.addSlot(3011, data => {
        //     process.send({ event: "ss-data", content: { type: 3011, data: data } });
        // });
        // ManulTrader.addSlot(3510, data => {
        //     process.send({ event: "ss-data", content: { type: 3510, data: data } });
        // });
        // ManulTrader.addSlot(2040, data => {
        //     process.send({ event: "ss-data", content: { type: 2040, data: data } });
        // });
        // ManulTrader.addSlot(5021, data => {
        //     process.send({ event: "ss-data", content: { type: 5021, data: data } });
        // });
        // ManulTrader.addSlot(5024, data => {
        //     process.send({ event: "ss-data", content: { type: 5024, data: data } });
        // });
        // ManulTrader.addSlot(8000, data => {
        //     process.send({ event: "ss-data", content: { type: 8000, data: data } });
        // });
    }

    registerMessages() {
        let registerMsg = new RegisterMessage();
        // strategy about
        let header = new Header();
        header.type = 2048;
        header.subtype = 1;
        registerMsg.headers.push(header);

        header = new Header();
        header.type = 2001;
        registerMsg.headers.push(header);

        header = new Header();
        header.type = 2032;
        registerMsg.headers.push(header);

        header = new Header();
        header.type = 2033;
        registerMsg.headers.push(header);

        header = new Header();
        header.type = 2011;
        registerMsg.headers.push(header);

        header = new Header();
        header.type = 2029;
        registerMsg.headers.push(header);

        /* order about
        header = new Header();
        header.type = 2013;
        registerMsg.headers.push(header);

        header = new Header();
        header.type = 2013;
        header.subtype = 1;
        registerMsg.headers.push(header);

        header = new Header();
        header.type = 2013;
        header.subtype = 2;
        registerMsg.headers.push(header);

        header = new Header();
        header.type = 2021;
        header.subtype = 1;
        registerMsg.headers.push(header);

        header = new Header();
        header.type = 2022;
        registerMsg.headers.push(header);

        header = new Header();
        header.type = 2023;
        registerMsg.headers.push(header);

        header = new Header();
        header.type = 2017;
        registerMsg.headers.push(header);

        header = new Header();
        header.type = 3510;
        registerMsg.headers.push(header);

        header = new Header();
        header.type = 3502;
        registerMsg.headers.push(header);

        header = new Header();
        header.type = 2040;
        header.subtype = 1;
        registerMsg.headers.push(header);

        header = new Header();
        header.type = 2040;
        header.subtype = 2;
        registerMsg.headers.push(header);

        header = new Header();
        header.type = 2040;
        header.subtype = 3;
        registerMsg.headers.push(header);

        header = new Header();
        header.type = 2040;
        header.subtype = 4;
        registerMsg.headers.push(header);

        header = new Header();
        header.type = 2048;
        registerMsg.headers.push(header);

        header = new Header();
        header.type = 2025;
        header.subtype = 1000;
        registerMsg.headers.push(header);

        header = new Header();
        header.type = 2025;
        header.subtype = 1001;
        registerMsg.headers.push(header);

        header = new Header();
        header.type = 2025;
        header.subtype = 1002;
        registerMsg.headers.push(header); */

        this.tradePoint.sendQtp(800, 1000, { type: 2998, subtype: 0, body: registerMsg.toBuffer() });

        registerMsg = new RegisterMessage();
        header = new Header();
        header.type = 5001;
        registerMsg.headers.push(header);

        header = new Header();
        header.type = 5002;
        registerMsg.headers.push(header);

        header = new Header();
        header.type = 5005;
        registerMsg.headers.push(header);

        header = new Header();
        header.type = 5006;
        registerMsg.headers.push(header);

        header = new Header();
        header.type = 5021;
        registerMsg.headers.push(header);

        this.tradePoint.sendQtp(800, 1000, { type: 2998, subtype: 0, body: registerMsg.toBuffer() });
        this.tradePoint.sendQtp(800, 1000, { type: 2010, subtype: 0, body: registerMsg.toBuffer() });
        // this.tradePoint.sendQtp(800, 1000, { type: 2016, subtype: 0, body: registerMsg.toBuffer() });
        // this.tradePoint.sendQtp(800, 1000, { type: 2044, subtype: 0, body: registerMsg.toBuffer() });
        // this.tradePoint.sendQtp(800, 1000, { type: 3503, subtype: 0, body: registerMsg.toBuffer() });
        // this.tradePoint.sendQtp(800, 1000, { type: 3509, subtype: 0, body: registerMsg.toBuffer() });
        // this.tradePoint.sendQtp(800, 1000, { type: 3010, subtype: 0, body: registerMsg.toBuffer() });
        header = null;
    }
}

function loginTGW(ip20: IP20Service) {
    let timestamp: Date = new Date();
    let stimestamp = timestamp.getFullYear() + ("0" + (timestamp.getMonth() + 1)).slice(-2) +
        ("0" + timestamp.getDate()).slice(-2) + ("0" + timestamp.getHours()).slice(-2) + ("0" + timestamp.getMinutes()).slice(-2) +
        ("0" + timestamp.getSeconds()).slice(-2) + ("0" + timestamp.getMilliseconds()).slice(-2);
    let loginObj = { "cellid": "1", "userid": "8.999", "password": "*32C5A4C0E3733FA7CC2555663E6DB6A5A6FB7F0EDECAC9704A503124C34AA88B", "termid": "12.345", "conlvl": 1, "clientesn": "", "clienttm": stimestamp };
    ip20.send(17, 41, loginObj);
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