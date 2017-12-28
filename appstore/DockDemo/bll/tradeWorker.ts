"use strict";

import { IP20Service } from "../../../base/api/services/ip20.worker";
import { QtpService } from "../../../base/api/services/qtp.worker";
import { Header, Message } from "../../../base/api/model/itrade/message.model";
import {
    RegisterMessage, ComStrategyInfo, ComGuiAckStrategy, ComTotalProfitInfo,
    ComConOrderStatus, ComStrategyCfg, ComOrderRecord, ComAccountPos,
    ComRecordPos, ComGWNetGuiInfo, StatArbOrder, ComConOrderErrorInfo,
    ComProfitInfo, FpPosUpdate, ComConOrder, ComOrder, ComOrderCancel, EOrderType, ComContract,
    FpHead, FpQtyOrder, ComGuiAskStrategy, TWAPParameter
} from "../../../base/api/model/itrade/strategy.model";
import { Sound } from "../../../base/api/services/backend.worker";
import { ULogger } from "../../../base/api/common/base/logger";
import { FGS_MSG, ServiceType, OptionType, QtpMessageOption } from "../../../base/api/model";

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
                loginTGW(quotePoint);
            };

            quotePoint.onClose = () => {
                process.send({ event: "ps-close" });
                quotePoint = null;
                if (quoteHeart !== null) {
                    clearInterval(quoteHeart);
                    quoteHeart = null;
                }
            };

            quotePoint.addSlot(
                {
                    appid: 17,
                    packid: 43,
                    callback(msg) {
                        logger.info(`tgw ans=>${msg}`);
                        process.send({ event: "ps-connect" });

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
            if (quotePoint)
                quotePoint.send(m.params.appid, m.params.packid, m.params.msg);
            break;
        case "ps-stop":
            break;
        case "ss-start":
            logger.debug(`tradeWorker.ts:81  tgw-appid=${m.params.appid}`);
            trade = new StrategyDealer(m.params.appid, m.params.loginInfo);
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
    tradePoint: QtpService;
    appid: number;
    loginInfo: any;
    connectState: number;
    dataList: { type: number, subtype: number, data: Object[] }[];
    chunkLen: number;

    constructor(appid: number, loginInfo) {
        this.tradePoint = new QtpService();
        this.appid = appid;
        this.loginInfo = loginInfo;
        this.connectState = 0;
        this.dataList = [];
        this.chunkLen = 30;

        setInterval(() => {
            let obj = { event: "ss-data", content: [] };
            let count = this.chunkLen;
            let i = 0;

            for (; i < this.dataList.length; ++i) {
                if (count > 0) {
                    if (this.dataList[i].data.length > count) {
                        obj.content.push({ type: this.dataList[i].type, subtype: this.dataList[i].subtype, data: this.dataList[i].data.splice(0, count) });
                        break;
                    } else {
                        obj.content.push(this.dataList[i]);
                        count -= this.dataList[i].data.length;
                    }

                    continue;
                }

                break;
            }

            if (obj.content.length > 0) {
                process.send(obj);
                console.error(`render to GUI[${Date.now()}] => ${obj.content.length}, datalist = ${this.dataList.length}, i=${i}`);
                obj.content.length = 0;

                this.dataList.splice(0, i);
            }

            count = this.chunkLen;
        }, 1000);
    }

    connect(port, host) {
        this.registerListeners();
        this.tradePoint.connect(port, host);
    }

    registerListeners() {
        let lasttry = Date.now();
        let tryTimer = null;
        let tradeHeart = null;
        this.tradePoint.onConnect = () => {
            this.tradePoint.send(FGS_MSG.kLogin, JSON.stringify({ data: this.loginInfo }), ServiceType.kLogin);
        };

        this.tradePoint.onClose = () => {
            process.send({ event: "ss-close" });
        };

        this.tradePoint.addSlot({
            service: ServiceType.kLogin,
            msgtype: FGS_MSG.kLoginAns,
            callback: (msg) => {
                logger.info(`tgw ans=>${msg}`);

                this.tradePoint.onTopic(2001, (key) => {
                    if (this.connectState === 0) {
                        this.connectState = 1;
                        process.send({ event: "ss-connect" });
                        this.registerMessages();
                    }
                });

                this.tradePoint.subscribe(1, [ServiceType.kStrategy]);
                this.tradePoint.subscribe(2001, [this.appid]);
                this.tradePoint.onTopic(1, (key, body) => {
                    let data = (body as Buffer);
                    if (data.readIntLE(0, 8) === this.appid) {
                        this.connectState = 0;
                        process.send({ event: "ss-close" });
                        data = null;
                    }
                });
            }
        }, {
                service: ServiceType.kStrategy,
                msgtype: 1001,
                callback: (body) => {
                    this.decode(body);
                }
            },
            {
                service: ServiceType.kFGS,
                msgtype: FGS_MSG.kFGSAns,
                callback: (msg) => {
                    console.info(msg.toString());
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

                for (let i = 0; i < count; ++i) {
                    msg = new ComGuiAckStrategy();
                    offset = msg.fromBuffer(content, offset);
                    msgArr.push(msg);
                }
                break;
            case 2033:
            case 2011: // ComStrategyInfo
                count = content.readUInt32LE(offset);
                offset += 4;
                let askOffset: number = 0;
                let ask: ComGuiAskStrategy;
                let askBuf = Buffer.alloc(count * ComGuiAckStrategy.len + 4);
                askBuf.writeUInt32LE(count, askOffset); askOffset += 4;

                for (let i = 0; i < count; ++i) {
                    msg = new ComStrategyInfo();
                    offset = msg.fromBuffer(content, offset);
                    msgArr.push(msg);
                    ask = new ComGuiAskStrategy();
                    ask.strategyid = msg.key;
                    ask.toBuffer().copy(askBuf, askOffset);
                }

                this.sendQtp({ type: 2028, subtype: 0, body: askBuf });
                askBuf = null;
                ask = null;
                askOffset = null;
                break;
            case 2048: // ComTotalProfitInfo
                count = content.readUInt32LE(offset);
                offset += 4;

                let dataArr = [];
                for (let i = 0; i < count; ++i) {
                    msg = new ComTotalProfitInfo();
                    offset = msg.fromBuffer(content, offset);
                    dataArr.push(msg);
                }

                msgArr.push({ subtype: header.subtype, content: dataArr });
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
                for (let i = 0; i < count; ++i) {
                    msg = new ComStrategyCfg();
                    offset = msg.fromBuffer(content, offset);
                    msgArr.push(msg);
                }
                break;
            case 2022:
            case 3011:
            case 3510:
                count = content.readUInt32LE(offset);
                offset += 4;

                for (let i = 0; i < count; ++i) {
                    msg = new ComOrderRecord();
                    offset = msg.fromBuffer(content, offset);
                    msgArr.push(msg);
                }
                break;
            case 2023: // ComProfitInfo
                count = content.readUInt32LE(offset);
                offset += 4;

                for (let i = 0; i < count; ++i) {
                    msg = new ComProfitInfo();
                    offset = msg.fromBuffer(content, offset);
                    msgArr.push(msg);
                }
                break;
            case 2013:
                count = content.readUInt32LE(offset);
                offset += 4;

                for (let i = 0; i < count; ++i) {
                    msg = new ComAccountPos();
                    offset = msg.fromBuffer(content, offset);
                    msgArr.push(msg);
                }
                break;
            case 3502:
            case 3504:
                count = content.readUInt32LE(offset);
                offset += 4;
                for (let i = 0; i < count; ++i) {
                    msg = new ComRecordPos();
                    offset = msg.fromBuffer(content, offset);
                    msgArr.push(msg);
                }
                break;
            case 2015:
            case 2017:
                count = content.readUInt32LE(offset);
                offset += 4;

                for (let i = 0; i < count; ++i) {
                    msg = new ComGWNetGuiInfo();
                    offset = msg.fromBuffer(content, offset);
                    msgArr.push(msg);
                    logger.debug(`ComGWNetGuiInfo=>${msg}`);
                }
                break;
            case 2025:
                count = content.readUInt32LE(offset);
                offset += 4;

                for (let i = 0; i < count; ++i) {
                    msg = new StatArbOrder();
                    offset = msg.fromBuffer(content, offset);
                    msgArr.push(msg);
                }
                break;
            case 2021:
                count = content.readUInt32LE(offset);
                offset += 4;

                for (let i = 0; i < count; ++i) {
                    msg = header.subtype === 0 ? new ComConOrderStatus() : new ComConOrderErrorInfo();
                    offset = msg.fromBuffer(content, offset);
                    msgArr.push(msg);
                }

                break;
            case 2040:
                count = content.readUInt32LE(offset);
                offset += 4;
                msg = content.slice(offset, content.indexOf(0, offset)).toString();
                console.info(msg);
                msgArr.push(msg);
                break;
            case 5031:
            case 5021:
                count = content.readUInt32LE(offset); offset += 4;
                let account = content.readUIntLE(offset, 8); offset += 8;
                count = content.readUInt32LE(offset); offset += 4;
                let arr = [];

                for (let i = 0; i < count; ++i) {
                    msg = new FpPosUpdate();
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
        let type = header.type;
        let subtype = header.subtype;
        this.dataList.push({ type: type, subtype: subtype, data: msgArr });
        logger.info(`count = ${this.dataList.length}`);
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
                order.toBuffer().copy(body, offset);
                this.sendQtp({ type: 2020, subtype: 0, body: body });
                logger.info(`order=>ordersize=1`);
                break;
            case "order-fp":
                let orderhead = new FpHead();
                orderhead.account = params.data.account;
                orderhead.count = params.data.orders.length;
                body = orderhead.toBuffer();
                orderhead = null;
                let fporder = new FpQtyOrder();
                fporder.askPriceLevel = params.data.askPriceLevel;
                fporder.bidPriceLevel = params.data.bidPriceLevel;
                fporder.askOffset = params.data.askOffset;
                fporder.bidOffset = params.data.bidOffset;
                params.data.orders.forEach(order => {
                    fporder.ukey = order.ukey;
                    fporder.qty = order.qty;
                    body = Buffer.concat([body, fporder.toBuffer()], body.byteLength + FpQtyOrder.len);
                });

                fporder = null;
                this.sendQtp({ type: 5004, subtype: 0, body: body });
                logger.info(`order-fp=>ordersize=${params.data.orders.length}`);
                break;
            case "cancel-fp":
                body = Buffer.alloc(12 + params.data.ukeys.length * 4, 0); // FP_HEAD
                body.writeUIntLE(params.data.account, offset, 8); offset += 8;
                body.writeUInt32LE(params.data.ukeys.length, offset); offset += 4;
                params.data.ukeys.forEach(ukey => {
                    body.writeUInt32LE(ukey, offset); offset += 4;
                });
                this.sendQtp({ type: 5005, subtype: 0, body: body });
                break;
            case "TWAPPortfolio-fp":
                body = Buffer.alloc(FpHead.len + 20);
                let mbHead = new FpHead();
                mbHead.account = params.data.account;
                mbHead.count = params.data.list.length;
                mbHead.toBuffer().copy(body, 0);
                offset += FpHead.len;

                let twapParam = new TWAPParameter();
                twapParam.bid_level = params.data.params["BidLevel"] ? parseInt(params.data.params["BidLevel"]) : 0;
                twapParam.ask_level = params.data.params["AskLevel"] ? parseInt(params.data.params["AskLevel"]) : 0;
                twapParam.order_valid_time = params.data.params["OrderValidTime"] ? parseInt(params.data.params["OrderValidTime"]) : 0;
                twapParam.max_chase_time = params.data.params["MaxChaseTimes"] ? parseInt(params.data.params["MaxChaseTimes"]) : 0;
                twapParam.begin_time = params.data.params["BeginTime"] ? parseInt(params.data.params["BeginTime"]) : 0;
                twapParam.end_time = params.data.params["EndTime"] ? parseInt(params.data.params["EndTime"]) : 0;
                twapParam.interval = params.data.params["Interval"] ? parseInt(params.data.params["Interval"]) : 0;
                twapParam.toBuffer().copy(body, offset);
                this.sendQtp({ type: 5007, subtype: 0, body: body });
                logger.info(`send=>type=5007, subtype=0, body: ${body.byteLength}`);
            case "basket-fp":
                offset = 0;
                body = Buffer.alloc(FpHead.len + 8 + params.data.list.length * 12);
                let basketHead = new FpHead();
                basketHead.account = params.data.account;
                basketHead.count = params.data.list.length;
                basketHead.toBuffer().copy(body, 0);
                offset += FpHead.len;
                body.writeUInt32LE(8016930, offset); offset += 4;
                body.writeUInt32LE(300, offset); offset += 4;
                params.data.list.forEach(item => {
                    body.writeUInt32LE(item.ukey, offset); offset += 4;
                    body.writeInt32LE(item.currPos, offset); offset += 4;
                    body.writeInt32LE(item.targetPos, offset); offset += 4;
                });
                this.sendQtp({ type: 5001, subtype: 0, body: body });
                logger.info(`basket-order-size = ${basketHead.count}`);
                break;
            case "getProfitInfo":
                this.sendQtp({ type: 2047, subtype: 0, body: null });
                this.sendQtp({ type: 2044, subtype: 0, body: null });
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

                this.sendQtp({ type: 2030, subtype: 0, body: body });
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

                this.sendQtp({ type: type, subtype: 0, body: body });
                break;
            case "account-position-load":
                let fpHead = new FpHead();
                fpHead.account = params.account;
                fpHead.count = 0;
                this.sendQtp({ type: 5002, subtype: 0, body: fpHead.toBuffer() });
                fpHead = null;
                break;
            default:
                break;
        }
        body = null;
    }

    sendQtp(msg: { type: number, subtype: number, body: any }) {
        let head = new Header();
        head.type = msg.type;
        head.subtype = msg.subtype;
        head.msglen = msg.body ? msg.body.byteLength : 0;
        let option = new QtpMessageOption();
        option.id = OptionType.kInstanceID;
        option.value = Buffer.alloc(8, 0);
        option.value.writeIntLE(this.appid, 0, 8);
        this.tradePoint.sendWithOption(1000, [option], msg.body ? Buffer.concat([head.toBuffer(), msg.body], Header.len + head.msglen) : head.toBuffer(), ServiceType.kStrategy);
        head = null;
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

        this.sendQtp({ type: 2998, subtype: 0, body: registerMsg.toBuffer() });

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

        header = new Header();
        header.type = 5031;
        registerMsg.headers.push(header);

        this.sendQtp({ type: 2998, subtype: 0, body: registerMsg.toBuffer() });
        this.sendQtp({ type: 2010, subtype: 0, body: null });
        this.sendQtp({ type: 2012, subtype: 0, body: null });
        this.sendQtp({ type: 2016, subtype: 0, body: null });
        this.sendQtp({ type: 2044, subtype: 0, body: null });
        this.sendQtp({ type: 2024, subtype: 1000, body: null });
        this.sendQtp({ type: 3503, subtype: 0, body: null });
        this.sendQtp({ type: 3509, subtype: 0, body: null });
        this.sendQtp({ type: 3010, subtype: 0, body: null });
        // setInterval(() => {
        //     this.sendQtp({ type: 255, subtype: 0, body: null });
        // }, 30000);
        header = null;
        registerMsg = null;
    }
}

function loginTGW(ip20: IP20Service, loginObj?: any) {
    let timestamp: Date = new Date();
    let stimestamp = timestamp.getFullYear() + ("0" + (timestamp.getMonth() + 1)).slice(-2) +
        ("0" + timestamp.getDate()).slice(-2) + ("0" + timestamp.getHours()).slice(-2) + ("0" + timestamp.getMinutes()).slice(-2) +
        ("0" + timestamp.getSeconds()).slice(-2) + ("0" + timestamp.getMilliseconds()).slice(-2);
    if (loginObj) {
        loginObj.clienttm = stimestamp;
        ip20.send(17, 41, loginObj);
    }
    else
        ip20.send(17, 41, { "cellid": "1", "userid": "8.999", "password": "*32C5A4C0E3733FA7CC2555663E6DB6A5A6FB7F0EDECAC9704A503124C34AA88B", "termid": "12.345", "conlvl": 1, "clientesn": "", "clienttm": stimestamp });

}