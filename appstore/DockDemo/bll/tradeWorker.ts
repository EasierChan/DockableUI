"use strict";

import { IP20Service } from "../../../base/api/services/ip20.worker";
import { Header, Message } from "../../../base/api/model/itrade/message.model";
import {
    RegisterMessage, ComStrategyInfo, ComGuiAckStrategy, ComTotalProfitInfo,
    ComConOrderStatus, ComStrategyCfg, ComOrderRecord, ComAccountPos,
    ComRecordPos, ComGWNetGuiInfo, StatArbOrder, ComConOrderErrorInfo,
    ComProfitInfo, FpPosUpdate, ComConOrder, ComOrder, ComOrderCancel, EOrderType, ComContract
} from "../../../base/api/model/itrade/strategy.model";
import { OrderService } from "../../../base/api/services/orderService";
import { ManulTrader } from "./sendorder";
import { Sound } from "../../../base/api/services/backend.worker";
import { ULogger } from "../../../base/api/common/base/logger";

ULogger.init("alert", process.argv[2]);
const logger = ULogger.file();
/**
 * interface for single pro.
 */

let quotePoint: IP20Service;
let trade: StrategyDealer;
process.on("message", (m: WSIP20, sock) => {
    switch (m.command) {
        case "ps-start":
            quotePoint = new IP20Service();
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
            trade = new StrategyDealer(m.params.appid);
            trade.connect(m.params.port, m.params.host);
            break;
        case "ss-send":
            trade.send(m.params);
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
    appid: number;
    packid: number;

    constructor(appid: number) {
        this.tradePoint = new IP20Service();
        this.appid = appid;
        this.packid = 1000;
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
                    logger.info(`tgw ans=>${JSON.stringify(msg.content)}`);
                }
            }, {
                appid: 17,
                packid: 110,
                callback(msg) {
                    process.send({ event: "ps-data", content: msg });
                }
            }, {
                appid: this.appid,
                packid: 1001,
                callback: (msg) => {
                    this.decode(msg.content);
                }
            }
        );
    }

    decode(content: Buffer) {
        let header: Header = new Header();
        header.fromBuffer(content);
        logger.info(`decode=>type=${header.type} subtype=${header.subtype} msglen=${header.msglen}`);
        let offset: number = Header.len;
        let count = 0;
        let msg: Message | any;
        let msgArr = [];

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
                    msgArr.push(msg);
                }
                break;
            case 2033:
            case 2011: // ComStrategyInfo
                count = content.readUInt32LE(offset);
                offset += 4;
                msg = new ComStrategyInfo();

                for (let i = 0; i < count; ++i) {
                    offset = msg.fromBuffer(content, offset);
                    msgArr.push(msg);
                }
                break;
            case 2048: // ComTotalProfitInfo
                count = content.readUInt32LE(offset);
                offset += 4;
                msg = new ComTotalProfitInfo();

                for (let i = 0; i < count; ++i) {
                    offset = msg.fromBuffer(content, offset);
                    msgArr.push(msg);
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
                    msgArr.push(msg);
                }
                break;
            case 2022:
            case 3011:
            case 3501:
                count = content.readUInt32LE(offset);
                offset += 4;
                msg = new ComOrderRecord();

                for (let i = 0; i < count; ++i) {
                    offset = msg.fromBuffer(content, offset);
                    msgArr.push(msg);
                }
                break;
            case 2023: // ComProfitInfo
                count = content.readUInt32LE(offset);
                offset += 4;
                msg = new ComProfitInfo();

                for (let i = 0; i < count; ++i) {
                    offset = msg.fromBuffer(content, offset);
                    msgArr.push(msg);
                }
                break;
            case 2013:
                count = content.readUInt32LE(offset);
                offset += 4;
                msg = new ComAccountPos();

                for (let i = 0; i < count; ++i) {
                    offset = msg.fromBuffer(content, offset);
                    msgArr.push(msg);
                }
                break;
            case 3502:
            case 3504:
                count = content.readUInt32LE(offset);
                offset += 4;
                msg = new ComRecordPos();

                for (let i = 0; i < count; ++i) {
                    offset = msg.fromBuffer(content, offset);
                    msgArr.push(msg);
                    logger.debug(`ComRecordPos=>${JSON.stringify(msg.record)}`);
                }
                break;
            case 2015:
            case 2017:
                count = content.readUInt32LE(offset);
                offset += 4;
                msg = new ComGWNetGuiInfo();

                for (let i = 0; i < count; ++i) {
                    offset = msg.fromBuffer(content, offset);
                    msgArr.push(msg);
                }
                break;
            case 2025:
                count = content.readUInt32LE(offset);
                offset += 4;
                msg = new StatArbOrder();

                for (let i = 0; i < count; ++i) {
                    offset = msg.fromBuffer(content, offset);
                    msgArr.push(msg);
                }
                break;
            case 2021:
                count = content.readUInt32LE(offset);
                offset += 4;
                msg = header.subtype === 0 ? new ComConOrderStatus() : new ComConOrderErrorInfo();

                for (let i = 0; i < count; ++i) {
                    offset = msg.fromBuffer(content, offset);
                    msgArr.push(msg);
                }

                break;
            case 2040:
                msg = content.slice(offset, content.indexOf(0, offset));
                msgArr.push(msg);
                break;
            case 5021:
                count = content.readUInt32LE(offset); offset += 4;
                let account = content.readUIntLE(offset, 8); offset += 8;
                count = content.readUInt32LE(offset); offset += 4;
                msg = new FpPosUpdate();
                let arr = [];

                for (let i = 0; i < count; ++i) {
                    offset = msg.fromBuffer(content, offset);
                    arr.push(msg);
                }

                msgArr.push({ account: account, data: arr, count: count });
                arr = null;
                account = null;
                break;
            case 5022:
                offset += 20;
                msgArr.push(content.slice(offset, content.indexOf(0, offset)).toString("utf-8"));
                break;
            case 5024:
                offset += 24;
                let dayPnl = content.readIntLE(offset, 8); offset += 8;
                let onPnl = content.readIntLE(offset, 8); offset += 8;
                let value = content.readIntLE(offset, 8); offset += 8;
                msgArr.push({
                    dayPnl: dayPnl,
                    onPnl: onPnl,
                    value: value
                });
                break;
            default:
                logger.warn(`unhandle msg=> type=${header.type}, subtype=${header.subtype}, msglen=${header.msglen}`);
                break;
        }

        msg = null;
        count = null;
        process.send({ event: "ss-data", content: { type: header.type, data: msgArr } });
    }

    send(params) {
        const maxOrderSize = 100;
        let body: Buffer;
        let offset = 0;

        switch (params.type) {
            case "order":
                body = Buffer.alloc(4 + ComConOrder.len, 0);
                body.writeUInt32LE(1, offset); offset += 4;
                let order = new ComConOrder();
                order.ordertype = params.data.ordertype;
                Object.assign(order.con, params.data.con);
                Object.assign(order.datetime, params.data.datetime);
                order.data = order.ordertype === EOrderType.ORDER_TYPE_ORDER ? new ComOrder() : new ComOrderCancel();
                Object.assign(order.data, params.data.data);
                console.info(order.data, params.data.data);
                order.toBuffer().copy(body, offset);
                console.info(order);
                this.tradePoint.sendQtp(this.appid, this.packid, { type: 2020, subtype: 0, body: body });
                logger.info(`send=>ordersize=1`);
                break;
            case "singleBuy":
                // ManulTrader.singleBuy(content.account, content.askPriceLevel, content.bidPriceLevel, content.askOffset, content.bidOffset, content.ukey, content.qty);
                break;
            case "singleCancel":
                body = Buffer.alloc(16, 0); // FP_HEAD
                body.writeUIntLE(params.data.account, offset, 8); offset += 8;
                body.writeUInt32LE(1, offset); offset += 4;
                body.writeUInt32LE(params.data.ukey, offset); offset += 4;
                this.tradePoint.sendQtp(this.appid, this.packid, { type: 5005, subtype: 0, body: body });
                break;
            case "submitBasket":
                // ManulTrader.submitBasket(content.type, content.indexSymbol, content.divideNum, content.account, content.initPos);
                break;
            case "sendAllSel":
                // ManulTrader.sendAllSel(content.account, content.count, content.askPriceLevel, content.bidPriceLevel, content.askOffset, content.bidOffset, content.sendArr);
                break;
            case "cancelAllSel":
                // ManulTrader.cancelAllSel(content.account, content.count, content.sendArr);
                break;
            case "getProfitInfo":
                this.tradePoint.sendQtp(this.appid, this.packid, { type: 2047, subtype: 0, body: null });
                this.tradePoint.sendQtp(this.appid, this.packid, { type: 2044, subtype: 0, body: null });
                break;
            case "strategy-param":
                body = Buffer.alloc(4 + params.data.length * ComStrategyCfg.len);
                body.writeUInt32LE(params.data.length, offset); offset += 4;
                let cfg: ComStrategyCfg;
                params.data.forEach(item => {
                    cfg = new ComStrategyCfg();
                    cfg.strategyid = item.strategyid;
                    cfg.key = item.key;
                    cfg.value = item.value;
                    cfg.type = item.type;
                    cfg.toBuffer().copy(body, offset); offset += ComStrategyCfg.len;
                });

                this.tradePoint.sendQtp(this.appid, this.packid, { type: 2030, subtype: 0, body: body });
                break;
            case "strategy-cmd":
                body = new Buffer(8);
                body.writeInt32LE(1, offset); offset += 4;
                body.writeInt32LE(params.data.strategyid, offset);
                let type;
                switch (params.data.tip) {
                    case 0:
                        type = 2000;
                        break;
                    case 1:
                        type = 2004;
                        break;
                    case 2:
                        type = 2002;
                        break;
                    case 3:
                        type = 2049;
                        break;
                }

                this.tradePoint.sendQtp(this.appid, this.packid, { type: type, subtype: 0, body: body });
                break;
            case "registerAccPos":
                body = new Buffer(12);
                body.writeUIntLE(params.data, offset, 8); offset += 8;
                body.writeUInt32LE(0, offset); offset += 4;
                this.tradePoint.sendQtp(this.appid, this.packid, { type: 5002, subtype: 0, body: body });
                break;
            default:
                break;
        }
        body = null;
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

        /* order about */
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
        registerMsg.headers.push(header);

        this.tradePoint.sendQtp(this.appid, this.packid, { type: 2998, subtype: 0, body: registerMsg.toBuffer() });

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

        this.tradePoint.sendQtp(this.appid, this.packid, { type: 2998, subtype: 0, body: registerMsg.toBuffer() });
        this.tradePoint.sendQtp(this.appid, this.packid, { type: 2010, subtype: 0, body: null });
        this.tradePoint.sendQtp(this.appid, this.packid, { type: 2012, subtype: 0, body: null });
        this.tradePoint.sendQtp(this.appid, this.packid, { type: 2016, subtype: 0, body: null });
        this.tradePoint.sendQtp(this.appid, this.packid, { type: 2044, subtype: 0, body: null });
        this.tradePoint.sendQtp(this.appid, this.packid, { type: 2044, subtype: 0, body: null });
        this.tradePoint.sendQtp(this.appid, this.packid, { type: 3503, subtype: 0, body: null });
        this.tradePoint.sendQtp(this.appid, this.packid, { type: 3509, subtype: 0, body: null });
        this.tradePoint.sendQtp(this.appid, this.packid, { type: 3010, subtype: 0, body: null });
        header = null;
        registerMsg = null;
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

}