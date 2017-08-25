"use strict";

import { IHeader, MsgType, Header, Message } from "../model/itrade/message.model";
import {
    ComStrategyInfo, ComRecordPos, ESSSecuCategory, ComEquitPos, ComOrderData, AlphaSignalInfo,
    ComFuturePos, ComGWNetGuiInfo, ComProfitInfo, ComOrderRecord, ComContract, TimeVal,
    ComConOrderStatus, ComConOrderErrorInfo, ComOrderErrorInfo, ComOrderStatus, ComGuiAskStrategy,
    ComAccountPos, ComStrategyCfg, ComFundPos, ComMarginPos, MarginPos, ComTotalProfitInfo,
    ComConOrder, EOrderType, ComOrder, ComOrderCancel, StatArbOrder, ComGuiAckStrategy, FpPosUpdate
} from "../model/itrade/orderstruct";
import { TcpClient } from "../common/base/tcpclient";
import { Parser } from "../common/base/parser";
import { Pool } from "../common/base/pool";
import { ULogger } from "../common/base/logger";

const logger = ULogger.file() || console;
declare var electron: Electron.ElectronMainAndRenderer;

export class OrderService {
    private _messageMap: any;
    private _sessionid: number;
    private _client: ItradeClient;
    private _port: number;
    private _host: string;
    private _parser: ItradeParser;

    constructor() {
        this._sessionid = 0;
        this._client = new ItradeClient();
        this._client.useSelfBuffer = true;
        this._messageMap = new Object();
        this._parser = new StrategyParser(this._client);
        this._client.addParser(this._parser);
        let msgObj = new Array<Object>();
    }

    set sessionID(value: number) {
        this._sessionid = value;
    }

    get sessionID(): number {
        return this._sessionid;
    }
    registerServices(port: number, host: string): void {
        this._port = port;
        this._host = host;
        this.connect(port, host);  // 9611 51.4
    }

    connect(port: number, host: string) {
        this.start();
        this._client.connect(port, host);
    }

    start() {
        this._client.on("connect", () => {
            this._client.sendHeartBeat(10);
            // SS
            this._messageMap[8000].callback(true, this._sessionid);
            this.regist();
        });
        this._client.on("data", msg => {
            if (this._messageMap.hasOwnProperty(msg[0].type)) {
                if (this._messageMap[msg[0].type].context !== undefined)
                    this._messageMap[msg[0].type].callback.call(this._messageMap[msg[0].type].context, msg[1], this._sessionid);
                else
                    this._messageMap[msg[0].type].callback(msg[1], this._sessionid);
            }
        });
        this._client.on("close", () => {
            this._client.sendHeartBeat(0);
            this._messageMap[8000].callback(false, this._sessionid);
            setTimeout(() => {
                this._client.reconnect(this._port, this._host);
            }, 10000);
        });
    }
    stop() {
        this._client.dispose();
    }

    regist() {
        let offset: number = 0;
        let connectBuffer = new Buffer(196);

        this.write2buffer(connectBuffer, 2998, 0, 188, offset);
        connectBuffer.writeUInt32LE(23, offset += 8);
        this.write2buffer(connectBuffer, 2048, 1, 0, offset += 4);
        this.write2buffer(connectBuffer, 2001, 0, 0, offset += 8);
        this.write2buffer(connectBuffer, 2032, 0, 0, offset += 8);
        this.write2buffer(connectBuffer, 2033, 0, 0, offset += 8);
        this.write2buffer(connectBuffer, 2011, 0, 0, offset += 8);
        this.write2buffer(connectBuffer, 2029, 0, 0, offset += 8);

        // order  register
        this.write2buffer(connectBuffer, 2013, 0, 0, offset += 8);
        this.write2buffer(connectBuffer, 2013, 1, 0, offset += 8);
        this.write2buffer(connectBuffer, 2013, 2, 0, offset += 8);
        this.write2buffer(connectBuffer, 2021, 1, 0, offset += 8);
        this.write2buffer(connectBuffer, 2022, 0, 0, offset += 8);
        this.write2buffer(connectBuffer, 2023, 0, 0, offset += 8);
        this.write2buffer(connectBuffer, 2017, 0, 0, offset += 8);
        this.write2buffer(connectBuffer, 3510, 0, 0, offset += 8);
        this.write2buffer(connectBuffer, 3502, 0, 0, offset += 8);
        this.write2buffer(connectBuffer, 2040, 1, 0, offset += 8);
        this.write2buffer(connectBuffer, 2040, 2, 0, offset += 8);
        this.write2buffer(connectBuffer, 2040, 3, 0, offset += 8);
        this.write2buffer(connectBuffer, 2040, 4, 0, offset += 8);
        this.write2buffer(connectBuffer, 2048, 0, 0, offset += 8);
        this.write2buffer(connectBuffer, 2025, 1000, 0, offset += 8);
        this.write2buffer(connectBuffer, 2025, 1001, 0, offset += 8);
        this.write2buffer(connectBuffer, 2025, 1002, 0, offset += 8);
        this._client.send(connectBuffer);
        connectBuffer = null;
        offset = 0;

        connectBuffer = new Buffer(8);
        this.write2buffer(connectBuffer, 2010, 0, 0, 0);
        this._client.send(connectBuffer);
        connectBuffer = null;

        connectBuffer = new Buffer(8);
        this.write2buffer(connectBuffer, 3503, 0, 0, 0);
        this._client.send(connectBuffer);
        connectBuffer = null;

        connectBuffer = new Buffer(8);
        this.write2buffer(connectBuffer, 3010, 0, 0, 0);
        this._client.send(connectBuffer);
        connectBuffer = null;

        connectBuffer = new Buffer(8);
        this.write2buffer(connectBuffer, 3509, 0, 0, 0);
        this._client.send(connectBuffer);
        connectBuffer = null;

        connectBuffer = new Buffer(8);
        this.write2buffer(connectBuffer, 2016, 0, 0, 0);
        this._client.send(connectBuffer);
        connectBuffer = null;

        connectBuffer = new Buffer(8);
        this.write2buffer(connectBuffer, 2044, 0, 0, 0);
        this._client.send(connectBuffer);
        connectBuffer = null;

        offset = 0;
        connectBuffer = new Buffer(52);
        this.write2buffer(connectBuffer, 2998, 0, 44, offset); offset += 8;
        connectBuffer.writeUInt32LE(5, offset); offset += 4;
        this.write2buffer(connectBuffer, 5001, 0, 0, offset); offset += 8;
        this.write2buffer(connectBuffer, 5021, 0, 0, offset); offset += 8;
        this.write2buffer(connectBuffer, 5002, 0, 0, offset); offset += 8;
        this.write2buffer(connectBuffer, 5005, 0, 0, offset); offset += 8;
        this.write2buffer(connectBuffer, 5006, 0, 0, offset);
        this._client.send(connectBuffer);
        connectBuffer = null;
        offset = 0;
    }

    send(type: number, subtype: number, body: any): void {
        return this._client.sendMessage(type, subtype, body);
    }

    addSlot(type: number, cb: Function, context?: any) {
        if (this._messageMap.hasOwnProperty(type))
            return;
        this._messageMap[type] = { callback: cb, context: context };
    }


    write2buffer(buffer: Buffer, type: number, subtype: number, msglen: number, offset: number): void {
        buffer.writeInt16LE(type, offset);
        buffer.writeInt16LE(subtype, offset += 2);
        buffer.writeUInt32LE(msglen, offset += 2);
    }

    sendOrder(type: number, subtype: number, buffer: Buffer) {
        this._client.sendMessage(type, subtype, buffer);
    }

}


class ItradeClient extends TcpClient {
    private _intervalHeart: NodeJS.Timer;
    private _parsers: ItradeParser[] = [];
    constructor() {
        super();
    }

    addParser(parser: any): void {
        this._parsers.push(parser);
    }

    sendMessage(type: number, subtype: number, body: Message | Buffer): void {
        // console.log("send msg-->tpe:", type, ",subtype:", subtype);
        let head = new Header();
        head.type = type;
        head.subtype = subtype;
        head.msglen = 0;

        if (body === undefined || body === null) {
            this.send(head.toBuffer());
        } else if (body instanceof Buffer) {
            head.msglen = body.length;
            this.send(Buffer.concat([head.toBuffer(), body], Header.len + head.msglen));
        } else {
            let buf = body.toBuffer();
            head.msglen = buf.length;
            this.send(Buffer.concat([head.toBuffer(), buf], Header.len + head.msglen));
        }
        head = null;
    }

    sendHeartBeat(interval = 10): void {
        if (interval === 0) {
            if (this._intervalHeart !== null) {
                clearInterval(this._intervalHeart);
                this._intervalHeart = null;
            }

            return;
        }

        let header: Header = new Header();
        header.type = 255;
        header.subtype = 0;
        header.msglen = 0;
        this._intervalHeart = setInterval(() => {
            this.send(header.toBuffer());
        }, interval * 1000);
    }

    dispose(): void {
        this._parsers.forEach(parser => {
            parser.dispose();
        });
        super.dispose();
    }
}

class ItradeParser extends Parser {
    private _curHeader: Header = null;
    constructor(_oPool: Pool<Buffer>) {
        super(_oPool);
    }

    processRead(): void {
        if (this.processMsgHeader() && this.processMsg() && this._oPool.length > 0) {
            this._curHeader = null;
            this.processRead();
        }
    }
    /**
     * process message head.
     */
    processMsgHeader(): boolean {
        if (this._oPool.length === 0 || this._curHeader !== null)
            return false;

        let ret = false;
        let bufCount = 0;
        let buflen = 0;
        let restLen = 0;
        for (; bufCount < this._oPool.length; ++bufCount) {
            buflen += this._oPool.peek(bufCount + 1)[bufCount].length;
            if (buflen >= Header.len) {
                this._curHeader = new Header();
                let tempBuffer = Buffer.concat(this._oPool.peek(bufCount + 1), buflen);
                this._curHeader.fromBuffer(tempBuffer);
                tempBuffer = null;
                ret = true;
                break;
            }
        }
        restLen = null;
        buflen = null;
        bufCount = null;
        return ret;
    }
    /**
     * process msg body
     */
    processMsg(): boolean {
        let ret = false;
        let bufCount = 0;
        let buflen = 0;
        let restLen = 0;
        for (; bufCount < this._oPool.length; ++bufCount) {
            buflen += this._oPool.peek(bufCount + 1)[bufCount].length;
            if (buflen >= this._curHeader.msglen + Header.len) {
                let tempBuffer = Buffer.concat(this._oPool.remove(bufCount + 1), buflen);
                logger.info(`processMsg:: type=${this._curHeader.type}, subtype=${this._curHeader.subtype}, msglen=${this._curHeader.msglen}`);
                this.emit(this._curHeader.type.toString(), this._curHeader, tempBuffer.slice(Header.len));

                restLen = buflen - this._curHeader.msglen - Header.len;
                if (restLen > 0) {
                    let restBuf = Buffer.alloc(restLen);
                    tempBuffer.copy(restBuf, 0, buflen - restLen);
                    this._oPool.prepend(restBuf);
                    restBuf = null;
                }
                this._curHeader = null;
                tempBuffer = null;
                ret = true;
                break;
            }
        }
        restLen = null;
        buflen = null;
        bufCount = null;
        return ret;
    }
}

class StrategyParser extends ItradeParser {
    private _intervalRead: NodeJS.Timer;
    constructor(private _client: ItradeClient) {
        super(_client.bufferQueue);
        this.init();
    }

    init(): void {
        this.registerMsgFunction("2001", this, this.processStrategyMsg);
        this.registerMsgFunction("2033", this, this.processStrategyMsg);
        this.registerMsgFunction("2000", this, this.processStrategyMsg);
        this.registerMsgFunction("2002", this, this.processStrategyMsg);
        this.registerMsgFunction("2004", this, this.processStrategyMsg);
        this.registerMsgFunction("2049", this, this.processStrategyMsg);
        this.registerMsgFunction("2030", this, this.processStrategyMsg);
        this.registerMsgFunction("2029", this, this.processStrategyMsg);
        this.registerMsgFunction("2032", this, this.processStrategyMsg);
        this.registerMsgFunction("2011", this, this.processStrategyMsg);
        this.registerMsgFunction("2003", this, this.processStrategyMsg);
        this.registerMsgFunction("2005", this, this.processStrategyMsg);
        this.registerMsgFunction("2050", this, this.processStrategyMsg);
        this.registerMsgFunction("2031", this, this.processStrategyMsg);
        this.registerMsgFunction("2048", this, this.processStrategyMsg);
        this.registerMsgFunction("2020", this, this.processStrategyMsg);
        this.registerMsgFunction("2013", this, this.processStrategyMsg);
        this.registerMsgFunction("3502", this, this.processStrategyMsg);
        this.registerMsgFunction("3504", this, this.processStrategyMsg);
        this.registerMsgFunction("2015", this, this.processStrategyMsg);
        this.registerMsgFunction("2017", this, this.processStrategyMsg);
        this.registerMsgFunction("2023", this, this.processStrategyMsg);
        this.registerMsgFunction("2025", this, this.processStrategyMsg);
        this.registerMsgFunction("2021", this, this.processStrategyMsg);
        this.registerMsgFunction("2022", this, this.processStrategyMsg);
        this.registerMsgFunction("3011", this, this.processStrategyMsg);
        this.registerMsgFunction("3510", this, this.processStrategyMsg);
        this.registerMsgFunction("2040", this, this.processStrategyMsg);
        this.registerMsgFunction("5021", this, this.processStrategyMsg);
        this.registerMsgFunction("5024", this, this.processStrategyMsg);
        this.registerMsgFunction("5022", this, this.processStrategyMsg);
        this.registerMsgFunction("5022", this, this.processStrategyMsg);
        this._intervalRead = setInterval(() => {
            this.processRead();
        }, 500);
    }

    processStrategyMsg(args: any[]): void {
        // console.log("+++++", args[0].type);
        let msgtype = args[0].type;
        let msgsubtype = args[0].subtype;
        let msglen = args[0].msglen;
        let msgObj = new Array<Object>();
        switch (msgtype) {
            // 'StrategyInfo'
            case 2011:
            case 2033:
                msgObj = this.readStrategyInfo(args[1], msgtype, msgsubtype, msglen);
                break;
            // StrategyCfg
            case 2000:
            case 2002:
            case 2004:
            case 2049:
            case 2030:
            case 2029:
            case 2032:
                msgObj = this.readStrategyCfg(args[1], msgtype, msgsubtype, msglen);
                break;
            // GuiCmdAck
            case 2001:
            case 2003:
            case 2005:
            case 2050:
            case 2031:
                msgObj = this.readGuiCmdAck(args[1], msgtype, msgsubtype, msglen);
                break;
            // ComTotalProfitInfo
            case 2048:
                msgObj = this.readComTotalProfitInfo(args[1], msgtype, msgsubtype, msglen);
                break;
            // order
            case 2020:
                msgObj = this.readComConOrder(args[1], msgtype, msgsubtype, msglen);
                break;
            case 2013:
                msgObj = this.readComAccountPos(args[1], msgtype, msgsubtype, msglen);
                break;
            case 3502:
            case 3504:
                msgObj = this.readComRecordPos(args[1], msgtype, msgsubtype, msglen);
                break;
            case 2015:
            case 2017:
                msgObj = this.readComGWNetGuiInfo(args[1], msgtype, msgsubtype, msglen);
                break;
            case 2023:
                msgObj = this.readComProfitInfo(args[1], msgtype, msgsubtype, msglen);
                break;
            case 2025:
                msgObj = this.readStatArbOrder(args[1], msgtype, msgsubtype, msglen);
                break;
            case 2021:
                if (msgsubtype === 0) {
                    msgObj = this.readComConOrderStatus(args[1], msgtype, msglen);
                }
                else if (msgsubtype === 1) {
                    msgObj = this.readComConOrderErrorInfo(args[1], msgtype, msglen);
                }
                break;
            // orderDone
            case 2022:
            case 3011:
            case 3510:
                msgObj = this.readComOrderRecord(args[1], msgtype, msgsubtype, msglen);
                break;
            case 2040:
                msgObj = this.readLog(args[1], msgtype, msgsubtype, msglen);
                break;
            case 5021:
                msgObj = this.readBasketBack(args[1], msgtype, msgsubtype, msglen);
                break;
            case 5024:
                msgObj = this.readPortfolioSummary(args[1], msgtype, msgsubtype, msglen);
                break;
            case 5022:
                msgObj = this.readPortfolioMsgError(args[1], msgtype, msgsubtype, msglen);
                break;
            default:
                break;
        }
        this._client.emit("data", args[0], msgObj);
    }

    dispose(): void {
        if (this._intervalRead || this._intervalRead !== null) {
            clearInterval(this._intervalRead);
        }
        super.dispose();
    }


    readPortfolioMsgError(buffer: Buffer, msgtype: number, subtype: number, msglen: number) {
        let offset: number = 0;
        let unknowncount = buffer.readUInt32LE(offset); offset += 4;
        let account = buffer.readUIntLE(offset, 8); offset += 8;
        let count = buffer.readUInt32LE(offset); offset += 4;
        let ukey = buffer.readUInt32LE(offset); offset += 4;
        let logStr = buffer.slice(offset, offset += 256).toString("utf-8");
        logStr = String(logStr).slice(0, logStr.indexOf("\u0000"));
        // console.log(unknowncount, account, count, ukey, logStr);
        return [{ type: msgtype, logStr: logStr }];
    }
    readPortfolioSummary(buffer: Buffer, msgtype: number, subtype: number, msglen: number) {
        let res = [];
        let offset: number = 0;
        let unknowncount = buffer.readUInt32LE(offset); offset += 4;
        let account = buffer.readUIntLE(offset, 8); offset += 8;
        let count = buffer.readUInt32LE(offset); offset += 4;
        let ukey = buffer.readUInt32LE(offset); offset += 4;
        let indexLots = buffer.readUInt32LE(offset); offset += 4;
        let dayPnl = this.readInt64LE(buffer, offset); offset += 8;
        let onPnl = this.readInt64LE(buffer, offset); offset += 8;
        let value = this.readInt64LE(buffer, offset); offset += 8;
        // console.log(unknowncount, account, count, ukey, indexLots, dayPnl, onPnl, value);
        return [{ unknowncount: unknowncount, account: account, count: count, ukey: ukey, dayPnl: dayPnl, onPnl: onPnl, value: value }];
    }
    readBasketBack(buffer: Buffer, msgtype: number, subtype: number, msglen: number): Array<Object> {
        let res = [];
        let tableArr = [];
        let count: number = 0;
        let offset: number = 0;
        let unknowncount = buffer.readUInt32LE(offset); offset += 4;
        let account = buffer.readUIntLE(offset, 8); offset += 8;
        count = buffer.readUInt32LE(offset); offset += 4;
        if (count === 0) {
            return [{ account: account, data: tableArr }];
        } else {
            for (let i = 0; i < count; ++i) {
                let fpPosUpdate = new FpPosUpdate();
                fpPosUpdate.UKey = buffer.readUInt32LE(offset); offset += 4;
                fpPosUpdate.LastPrice = buffer.readUInt32LE(offset); offset += 4;
                fpPosUpdate.PreClose = buffer.readUInt32LE(offset); offset += 4;
                fpPosUpdate.BidSize = buffer.readUInt32LE(offset); offset += 4;
                fpPosUpdate.BidPrice = buffer.readUInt32LE(offset); offset += 4;
                fpPosUpdate.AskPrice = buffer.readUInt32LE(offset); offset += 4;
                fpPosUpdate.AskSize = buffer.readUInt32LE(offset); offset += 4;
                fpPosUpdate.InitPos = buffer.readInt32LE(offset); offset += 4;
                fpPosUpdate.TgtPos = buffer.readInt32LE(offset); offset += 4;
                fpPosUpdate.CurrPos = buffer.readInt32LE(offset); offset += 4;
                fpPosUpdate.WorkingVol = buffer.readUInt32LE(offset); offset += 4;
                fpPosUpdate.Diff = buffer.readInt32LE(offset); offset += 4;
                fpPosUpdate.Traded = buffer.readInt32LE(offset); offset += 4;
                fpPosUpdate.AvgBuyPrice = buffer.readUInt32LE(offset); offset += 4;
                fpPosUpdate.AvgSellPrice = buffer.readUInt32LE(offset); offset += 4;
                fpPosUpdate.Percentage = buffer.readUInt16LE(offset); offset += 2;
                fpPosUpdate.DayPnLCon = this.readInt64LE(buffer, offset); offset += 8;
                fpPosUpdate.ONPnLCon = this.readInt64LE(buffer, offset); offset += 8;
                fpPosUpdate.ValueCon = this.readInt64LE(buffer, offset); offset += 8;
                fpPosUpdate.PreValue = this.readInt64LE(buffer, offset); offset += 8;
                fpPosUpdate.Flag = buffer.readInt32LE(offset); offset += 4;
                if (fpPosUpdate.UKey !== 0)
                    tableArr.push(fpPosUpdate);
            }
        }
        console.log(tableArr);
        return [{ account: account, data: tableArr, count: count }];
    }

    readGuiCmdAck(buffer: Buffer, msgtype: number, subtype: number, msglen: number): Array<Object> {
        let res = [];
        let count: number = 0;
        let offset: number = 0;
        let comGuiAckStrategy = new ComGuiAckStrategy();
        count = buffer.readUInt32LE(offset); offset += 4;
        comGuiAckStrategy.strategyid = buffer.readUInt32LE(offset); offset += 4;
        comGuiAckStrategy.key = buffer.readUInt32LE(offset); offset += 4;
        comGuiAckStrategy.value = this.readInt64LE(buffer, offset); offset += 8;
        comGuiAckStrategy.success = buffer.readUInt8(offset) === 1 ? true : false; offset += 4;
        comGuiAckStrategy.error = buffer.readUInt32LE(offset); offset += 4;
        res.push(comGuiAckStrategy);
        // console.log(comGuiAckStrategy);
        return res;

    }
    readLog(buffer: Buffer, msgtype: number, subtype: number, msglen: number): Array<Object> {
        let res = [];
        let offset: number = 0;
        let count: number = 0;
        count = buffer.readUInt32LE(offset); offset += 4;
        let logStr = buffer.slice(offset, offset += 1024).toString("utf-8");
        logStr = String(logStr).slice(0, logStr.indexOf("\u0000"));
        res.push(logStr);
        return res;
    }

    readStatArbOrder(buffer: Buffer, msgtype: number, subtype: number, msglen: number): Array<Object> {
        let count: number = 0;
        let offset: number = 0;
        count = buffer.readUInt32LE(offset); offset += 4;
        let res = [];
        for (let i = 0; i < count; ++i) {
            let statArbOrder = new StatArbOrder();
            statArbOrder.strategyid = buffer.readUInt32LE(offset); offset += 4;
            statArbOrder.code = buffer.readUInt32LE(offset); offset += 4;
            statArbOrder.pricerate = buffer.readInt32LE(offset); offset += 8;
            statArbOrder.position = this.readInt64LE(buffer, offset); offset += 8;
            statArbOrder.quantity = this.readInt64LE(buffer, offset); offset += 8;
            statArbOrder.amount = this.readInt64LE(buffer, offset); offset += 8;
            statArbOrder.diffQty = this.readInt64LE(buffer, offset); offset += 8;
            res.push(statArbOrder);
        }
        logger.info(`msginfo::statarborder,info:`, subtype, res);
        return [{ subtype: subtype, content: res }];
    }
    readComConOrder(buffer: Buffer, msgtype: number, subtype: number, msglen: number): Array<Object> {
        let count: number = 0;
        let offset: number = 0;
        count = buffer.readUInt32LE(offset); offset += 4;
        let getOrderType: number = 0;
        let res = [];
        for (let i = 0; i < count; ++i) {
            let comConOrder = new ComConOrder();
            comConOrder.ordertype = buffer.readUInt8(offset); offset += 8;
            getOrderType = comConOrder.ordertype;
            comConOrder.con = new ComContract();
            comConOrder.con.contractid = buffer.readUInt32LE(offset); offset += 8;
            comConOrder.con.account = buffer.readUIntLE(offset, 8); offset += 8;
            comConOrder.con.orderaccount = buffer.slice(offset, offset + 20).toString("utf-8"); offset += 20;
            comConOrder.con.tradeunit = buffer.slice(offset, offset + 10).toString("utf-8"); offset += 10;
            comConOrder.con.tradeproto = buffer.slice(offset, offset + 10).toString("utf-8"); offset += 10;
            comConOrder.datetime = new TimeVal();
            comConOrder.datetime.tv_sec = buffer.readUIntLE(offset, 8); offset += 8;
            comConOrder.datetime.tv_usec = buffer.readUIntLE(offset, 8); offset += 8;
            if (comConOrder.ordertype === EOrderType.ORDER_TYPE_ORDER) {
                let orderdata = comConOrder.data = new ComOrder();
                orderdata.strategyid = buffer.readUInt32LE(offset); offset += 4;
                orderdata.algorid = buffer.readUInt32LE(offset); offset += 4;
                orderdata.orderid = buffer.readUInt32LE(offset); offset += 4;
                orderdata.algorindex = buffer.readUInt32LE(offset); offset += 4;
                orderdata.innercode = buffer.readUInt32LE(offset); offset += 4;
                orderdata.price = buffer.readUInt32LE(offset); offset += 4;
                orderdata.quantity = buffer.readUInt32LE(offset); offset += 4;
                orderdata.action = buffer.readUInt8(offset); offset += 1;
                orderdata.property = buffer.readUInt8(offset); offset += 1;
                orderdata.currency = buffer.readUInt8(offset); offset += 1;
                orderdata.covered = buffer.readUInt8(offset); offset += 1;
                orderdata.signal = [];
                for (let j = 0; j < 4; ++j) {
                    orderdata.signal[j] = new AlphaSignalInfo();
                    orderdata.signal[j].id = buffer.readUInt32LE(offset); offset += 8;
                    orderdata.signal[j].value = buffer.readUIntLE(offset, 8); offset += 8;
                }
            } else if (comConOrder.ordertype === EOrderType.ORDER_TYPE_CANCEL) {
                let canceldata = comConOrder.data = new ComOrderCancel();
                canceldata.strategyid = buffer.readUInt32LE(offset); offset += 4;
                canceldata.algorid = buffer.readUInt32LE(offset); offset += 4;
                canceldata.orderid = buffer.readUInt32LE(offset); offset += 4;
                canceldata.algorindex = buffer.readUInt32LE(offset); offset += 4;
                canceldata.innercode = buffer.readUInt32LE(offset); offset += 4;
                canceldata.price = buffer.readUInt32LE(offset); offset += 4;
                canceldata.quantity = buffer.readUInt32LE(offset); offset += 4;
                canceldata.action = buffer.readUInt8(offset); offset += 4;
                offset += 64;
            }
            res.push({ ordertype: getOrderType, content: comConOrder });
        }
        return res;
    }
    readComTotalProfitInfo(buffer: Buffer, msgtype: number, subtype: number, msglen: number): Array<Object> {
        let count: number = 0;
        let offset: number = 0;
        count = buffer.readUInt32LE(offset); offset += 4;
        let res = [];
        for (let i = 0; i < count; ++i) {
            let comTotalProfitInfo = new ComTotalProfitInfo();
            comTotalProfitInfo.strategyid = buffer.readUInt32LE(offset); offset += 8;
            comTotalProfitInfo.account = buffer.readUIntLE(offset, 8); offset += 8;
            comTotalProfitInfo.totalpositionpnl = this.readInt64LE(buffer, offset); offset += 8;
            comTotalProfitInfo.totaltodaypositionpnl = this.readInt64LE(buffer, offset); offset += 8;
            comTotalProfitInfo.totallastpositionpnl = this.readInt64LE(buffer, offset); offset += 8;
            comTotalProfitInfo.totaltradingpnl = this.readInt64LE(buffer, offset); offset += 8;
            comTotalProfitInfo.totallasttradingfee = this.readInt64LE(buffer, offset); offset += 8;
            comTotalProfitInfo.totaltradingfee = this.readInt64LE(buffer, offset); offset += 8;
            comTotalProfitInfo.totalintradaytradingfee = this.readInt64LE(buffer, offset); offset += 8;
            comTotalProfitInfo.totalpnl = this.readInt64LE(buffer, offset); offset += 8;
            comTotalProfitInfo.totalposition = this.readInt64LE(buffer, offset); offset += 8;
            comTotalProfitInfo.totaltodayposition = this.readInt64LE(buffer, offset); offset += 8;
            comTotalProfitInfo.totalLastposition = this.readInt64LE(buffer, offset); offset += 8;
            res.push(comTotalProfitInfo);
        }
        return [{ subtype: subtype, content: res }];
    }
    readStrategyInfo(buffer: Buffer, msgtype: number, subtype: number, msglen: number): Array<Object> {
        let count: number = 0;
        let offset: number = 0;
        count = buffer.readUInt32LE(offset); offset += 4;
        let getParabuffer = new Buffer(4 + 4);
        let res = [];
        for (let i = 0; i < count; ++i) {
            let strategyInfo = new ComStrategyInfo();
            strategyInfo.key = buffer.readUInt32LE(offset); offset += 4;
            strategyInfo.name = buffer.slice(offset, offset += 50).toString("utf-8");
            strategyInfo.status = buffer.readUInt8(offset); offset += 2;
            strategyInfo.category = buffer.readUInt32LE(offset); offset += 4;
            strategyInfo.parent = buffer.readUInt32LE(offset); offset += 4;
            strategyInfo.maxorderid = buffer.readUInt32LE(offset); offset += 4;
            strategyInfo.minorderid = buffer.readUInt32LE(offset); offset += 4;
            strategyInfo.orderidstep = buffer.readUInt32LE(offset); offset += 4;
            strategyInfo.currorderid = buffer.readUInt32LE(offset); offset += 4;
            strategyInfo.ismanualtrader = buffer.readUInt8(offset) === 1 ? true : false;
            if (msgtype === 2011) {
                // send  2028 & get strategy parameter
                let comGuiAskStrateg = new ComGuiAskStrategy();
                comGuiAskStrateg.strategyid = strategyInfo.key;
                let getParaOffset: number = 0;
                getParabuffer.writeInt32LE(1, getParaOffset); getParaOffset += 4;
                getParabuffer.writeInt32LE(strategyInfo.key, getParaOffset); getParaOffset += 4;
                this._client.sendMessage(2012, 0, getParabuffer);
                this._client.sendMessage(2028, 0, getParabuffer);
            }
            res.push(strategyInfo);
            //  console.log("strategyInfo:", strategyInfo);

        }
        return res;
    }
    readComRecordPos(buffer: Buffer, msgtype: number, subtype: number, msglen: number): Array<Object> {
        let count: number = 0;
        let offset: number = 0;
        count = buffer.readUInt32LE(offset); offset += 4;
        let res = [];
        // console.log("print readComRecordPos info-count :", count, buffer);
        for (let i = 0; i < count; ++i) {
            let comRecordPos = new ComRecordPos();
            comRecordPos.poolindex = buffer.readUInt32LE(offset); offset += 4;
            comRecordPos.poolpri = buffer.readUInt32LE(offset); offset += 4;
            comRecordPos.secucategory = buffer.readUInt8(offset); offset += 4;
            comRecordPos.strategyid = buffer.readUInt32LE(offset); offset += 4;
            comRecordPos.initpos = this.readInt64LE(buffer, offset); offset += 8;
            if (ESSSecuCategory.SS_SECU_CATEGORY_EQUIT === comRecordPos.secucategory) {
                comRecordPos.record = new ComEquitPos();
                comRecordPos.record.date = buffer.readInt32LE(offset); offset += 8;
                comRecordPos.record.account = this.readInt64LE(buffer, offset); offset += 8;
                comRecordPos.record.code = buffer.readInt32LE(offset); offset += 8;
                comRecordPos.record.TotalVol = this.readInt64LE(buffer, offset); offset += 8;
                comRecordPos.record.AvlVol = this.readInt64LE(buffer, offset); offset += 8;
                comRecordPos.record.WorkingVol = this.readInt64LE(buffer, offset); offset += 8;
                comRecordPos.record.TotalCost = this.readInt64LE(buffer, offset); offset += 8;
                comRecordPos.record.AvlCreRedempVol = this.readInt64LE(buffer, offset); offset += 8;
                comRecordPos.record.CovedFrzVol = this.readInt64LE(buffer, offset); offset += 8;
                comRecordPos.record.type = buffer.readInt32LE(offset); offset += 16;
            } else if (ESSSecuCategory.SS_SECU_CATEGORY_FUTURE === comRecordPos.secucategory) {
                comRecordPos.record = new ComFuturePos();
                comRecordPos.record.date = buffer.readInt32LE(offset); offset += 8;
                comRecordPos.record.account = this.readInt64LE(buffer, offset); offset += 8;
                comRecordPos.record.code = buffer.readInt32LE(offset); offset += 8;
                comRecordPos.record.TotalVol = this.readInt64LE(buffer, offset); offset += 8;
                comRecordPos.record.AvlVol = this.readInt64LE(buffer, offset); offset += 8;
                comRecordPos.record.WorkingVol = this.readInt64LE(buffer, offset); offset += 8;
                comRecordPos.record.TotalCost = this.readInt64LE(buffer, offset); offset += 8;
                comRecordPos.record.MarginAveragePrice = this.readInt64LE(buffer, offset); offset += 8;
                comRecordPos.record.AveragePrice = this.readInt64LE(buffer, offset); offset += 8;
                comRecordPos.record.type = buffer.readInt32LE(offset); offset += 8;
                comRecordPos.record.TodayOpen = this.readInt64LE(buffer, offset); offset += 8;
            }
            res.push(comRecordPos);
            //  console.log("print readComRecordPos info---- :", comRecordPos, offset);
            logger.info(`msginfo::position,info:`, comRecordPos);
        }
        return res;
    }

    readComGWNetGuiInfo(buffer: Buffer, msgtype: number, subtype: number, msglen: number): Array<Object> {
        let count: number = 0;
        let offset: number = 0;
        let res = [];
        count = buffer.readUInt32LE(offset); offset += 4;
        for (let i = 0; i < count; ++i) {
            let comStrategyInfo = new ComGWNetGuiInfo();
            comStrategyInfo.key = buffer.readUInt32LE(offset); offset += 4;
            let tempname = buffer.slice(offset, offset += 50).toString("utf-8");
            comStrategyInfo.name = String(tempname).slice(0, tempname.indexOf("\u0000"));
            comStrategyInfo.connected = buffer.readUInt8(offset) === 0 ? false : true;
            // console.log("comStrategyInfo:", comStrategyInfo);
            res.push(comStrategyInfo);
        }
        return res;
    }
    readComProfitInfo(buffer: Buffer, msgtype: number, subtype: number, msglen: number): Array<Object> {
        let count: number = 0;
        let offset: number = 0;
        let res = [];
        count = buffer.readUInt32LE(offset); offset += 4;
        // console.log("profit buffer :", buffer);
        for (let i = 0; i < count; ++i) {
            let comProfitInfo = new ComProfitInfo();
            comProfitInfo.strategyid = buffer.readUInt32LE(offset); offset += 8;
            comProfitInfo.account = buffer.readUIntLE(offset, 8); offset += 8;
            comProfitInfo.totalpositionpnl = this.readInt64LE(buffer, offset); offset += 8;
            comProfitInfo.totaltodaypositionpnl = this.readInt64LE(buffer, offset); offset += 8;
            comProfitInfo.totallastpositionpnl = this.readInt64LE(buffer, offset); offset += 8;
            comProfitInfo.totaltradingpnl = this.readInt64LE(buffer, offset); offset += 8;
            comProfitInfo.totallasttradingfee = this.readInt64LE(buffer, offset); offset += 8;
            comProfitInfo.totaltradingfee = this.readInt64LE(buffer, offset); offset += 8;
            comProfitInfo.totalintradaytradingfee = this.readInt64LE(buffer, offset); offset += 8;
            comProfitInfo.totalpnl = buffer.readUIntLE(offset, 8); offset += 8;
            comProfitInfo.totalposition = this.readInt64LE(buffer, offset); offset += 8;
            comProfitInfo.totaltodayposition = this.readInt64LE(buffer, offset); offset += 8;
            comProfitInfo.totalLastposition = this.readInt64LE(buffer, offset); offset += 8;

            comProfitInfo.innercode = buffer.readUInt32LE(offset); offset += 8;
            comProfitInfo.avgpriceforbuy = this.readInt64LE(buffer, offset); offset += 8;
            comProfitInfo.avgpriceforsell = this.readInt64LE(buffer, offset); offset += 8;
            comProfitInfo.positionpnl = this.readInt64LE(buffer, offset); offset += 8;
            comProfitInfo.tradingpnl = this.readInt64LE(buffer, offset); offset += 8;
            comProfitInfo.iopv = this.readInt64LE(buffer, offset); offset += 8;
            comProfitInfo.lasttradingfee = this.readInt64LE(buffer, offset); offset += 8;
            comProfitInfo.tradingfee = this.readInt64LE(buffer, offset); offset += 8;
            comProfitInfo.lastpositionpnl = this.readInt64LE(buffer, offset); offset += 8;
            comProfitInfo.todaypositionpnl = this.readInt64LE(buffer, offset); offset += 8;
            comProfitInfo.pnl = this.readInt64LE(buffer, offset); offset += 8;
            comProfitInfo.lastposition = this.readInt64LE(buffer, offset); offset += 8;
            comProfitInfo.todayposition = this.readInt64LE(buffer, offset); offset += 8;
            comProfitInfo.lastclose = this.readInt64LE(buffer, offset); offset += 8;
            comProfitInfo.marketprice = this.readInt64LE(buffer, offset); offset += 8;
            comProfitInfo.intradaytradingfee = this.readInt64LE(buffer, offset); offset += 8;
            res.push(comProfitInfo);
            // console.log("comProfitInfo:", comProfitInfo);
        }
        return res;
    }

    readComOrderRecord(buffer: Buffer, msgtype: number, subtype: number, msglen: number): Array<Object> {
        let count: number = 0;
        let offset: number = 0;
        count = buffer.readUInt32LE(offset); offset += 4;
        let res = [];
        for (let i = 0; i < count; ++i) {
            let comOrderRecord = new ComOrderRecord();
            comOrderRecord.poolindex = buffer.readUInt32LE(offset); offset += 4;
            comOrderRecord.poolpri = buffer.readUInt32LE(offset); offset += 4;
            comOrderRecord.datatype = buffer.readUInt8(offset); offset += 4;
            comOrderRecord.secucategory = buffer.readUInt32LE(offset); offset += 4;
            comOrderRecord.donetype = buffer.readUInt8(offset); offset += 1;
            comOrderRecord.cancel = buffer.readUInt8(offset) === 1 ? true : false; offset += 7;
            comOrderRecord.con = new ComContract();
            comOrderRecord.con.contractid = buffer.readUInt32LE(offset); offset += 8;
            comOrderRecord.con.account = buffer.readUIntLE(offset, 8); offset += 8;
            comOrderRecord.con.orderaccount = buffer.slice(offset, offset += 20).toString("utf-8");
            comOrderRecord.con.tradeunit = buffer.slice(offset, offset += 10).toString("utf-8");
            comOrderRecord.con.tradeproto = buffer.slice(offset, offset += 10).toString("utf-8");
            comOrderRecord.od = new ComOrderData();
            comOrderRecord.od.strategyid = buffer.readUInt32LE(offset); offset += 4;
            comOrderRecord.od.algorid = buffer.readUInt32LE(offset); offset += 4;
            comOrderRecord.od.orderid = buffer.readUInt32LE(offset); offset += 4;
            comOrderRecord.od.algorindex = buffer.readUInt32LE(offset); offset += 4;
            comOrderRecord.od.innercode = buffer.readUInt32LE(offset); offset += 4;
            comOrderRecord.od.oprice = buffer.readUInt32LE(offset); offset += 4;
            comOrderRecord.od.ovolume = buffer.readUInt32LE(offset); offset += 4;

            comOrderRecord.od.action = buffer.readUInt8(offset); offset += 1;
            comOrderRecord.od.property = buffer.readUInt8(offset); offset += 1;
            comOrderRecord.od.currency = buffer.readUInt8(offset); offset += 1;
            comOrderRecord.od.covered = buffer.readUInt8(offset); offset += 1;

            comOrderRecord.od.iprice = buffer.readUInt32LE(offset); offset += 4;
            comOrderRecord.od.ivolume = buffer.readUInt32LE(offset); offset += 4;
            comOrderRecord.od.status = buffer.readUInt8(offset); offset += 8;
            comOrderRecord.od.odatetime = new TimeVal();
            comOrderRecord.od.idatetime = new TimeVal();
            comOrderRecord.od.odatetime.tv_sec = buffer.readUIntLE(offset, 8); offset += 8;
            comOrderRecord.od.odatetime.tv_usec = buffer.readUIntLE(offset, 8); offset += 8;
            comOrderRecord.od.idatetime.tv_sec = buffer.readUIntLE(offset, 8); offset += 8;
            comOrderRecord.od.idatetime.tv_usec = buffer.readUIntLE(offset, 8); offset += 8;
            comOrderRecord.od.signal = [];
            for (let j = 0; j < 4; ++j) {
                comOrderRecord.od.signal[j] = new AlphaSignalInfo();
                comOrderRecord.od.signal[j].id = buffer.readUInt32LE(offset); offset += 8;
                comOrderRecord.od.signal[j].value = buffer.readUIntLE(offset, 8); offset += 8;
            }
            res.push(comOrderRecord);
            logger.info(`msginfo::order,info:`, res, comOrderRecord.od.odatetime, comOrderRecord.od.idatetime);
        }
        return res;
    }
    readComConOrderStatus(buffer: Buffer, msgtype: number, msglen: number): Array<Object> {
        let count: number = 0;
        let offset: number = 0;
        let res = [];
        count = buffer.readUInt32LE(offset); offset += 4;
        for (let i = 0; i < count; ++i) {
            let comConOrderStatus = new ComConOrderStatus();
            comConOrderStatus.valid = buffer.readUInt8(offset); offset += 8;
            comConOrderStatus.con = new ComContract();
            comConOrderStatus.con.contractid = buffer.readUInt32LE(offset); offset += 8;
            comConOrderStatus.con.account = buffer.readUIntLE(offset, 8); offset += 8;
            comConOrderStatus.con.orderaccount = buffer.slice(offset, offset += 20).toString("utf-8");
            comConOrderStatus.con.tradeunit = buffer.slice(offset, offset += 10).toString("utf-8");
            comConOrderStatus.con.tradeproto = buffer.slice(offset, offset += 10).toString("utf-8");
            comConOrderStatus.os = new ComOrderStatus();
            comConOrderStatus.os.strategyid = buffer.readUInt32LE(offset); offset += 4;
            comConOrderStatus.os.algorid = buffer.readUInt32LE(offset); offset += 4;
            comConOrderStatus.os.orderid = buffer.readUInt32LE(offset); offset += 4;
            comConOrderStatus.os.algorindex = buffer.readUInt32LE(offset); offset += 4;
            comConOrderStatus.os.innercode = buffer.readUInt32LE(offset); offset += 4;
            comConOrderStatus.os.action = buffer.readUInt8(offset); offset += 4;
            comConOrderStatus.os.price = buffer.readUInt32LE(offset); offset += 4;
            comConOrderStatus.os.quantity = buffer.readUInt32LE(offset); offset += 4;
            comConOrderStatus.os.datetime = new TimeVal();
            comConOrderStatus.os.datetime.tv_sec = this.readInt64LE(buffer, offset); offset += 8;
            comConOrderStatus.os.datetime.tv_usec = buffer.readUIntLE(offset, 8); offset += 8;
            comConOrderStatus.os.ordertype = buffer.readUInt8(offset); offset += 1;
            comConOrderStatus.os.tradetype = buffer.readUInt8(offset); offset += 1;
            comConOrderStatus.os.status = buffer.readUInt8(offset); offset += 1;
            res.push(comConOrderStatus);
            // console.log("comConOrderStatus:", comConOrderStatus);
        }
        return [{ subytpe: 0, content: res }];
    }
    readComConOrderErrorInfo(buffer: Buffer, msgtype: number, msglen: number): Array<Object> {
        let count: number = 0;
        let offset: number = 0;
        let res = [];
        let rtnStr: String = "";
        count = buffer.readUInt32LE(offset); offset += 4;
        for (let i = 0; i < count; ++i) {
            let comConOrderErrorInfo = new ComConOrderErrorInfo();
            comConOrderErrorInfo.con = new ComContract();
            comConOrderErrorInfo.con.contractid = buffer.readUInt32LE(offset); offset += 8;
            comConOrderErrorInfo.con.account = buffer.readUIntLE(offset, 8); offset += 8;
            comConOrderErrorInfo.con.orderaccount = buffer.slice(offset, offset += 20).toString("utf-8");
            comConOrderErrorInfo.con.tradeunit = buffer.slice(offset, offset += 10).toString("utf-8");
            comConOrderErrorInfo.con.tradeproto = buffer.slice(offset, offset += 10).toString("utf-8");
            comConOrderErrorInfo.os = new ComOrderErrorInfo();
            comConOrderErrorInfo.os.strategyid = buffer.readUInt32LE(offset); offset += 4;
            comConOrderErrorInfo.os.algorid = buffer.readUInt32LE(offset); offset += 4;
            comConOrderErrorInfo.os.orderid = buffer.readUInt32LE(offset); offset += 4;
            comConOrderErrorInfo.os.algorindex = buffer.readUInt32LE(offset); offset += 4;
            comConOrderErrorInfo.os.innercode = buffer.readUInt32LE(offset); offset += 4;
            comConOrderErrorInfo.os.action = buffer.readUInt8(offset); offset += 4;
            comConOrderErrorInfo.os.errorid = buffer.readInt32LE(offset); offset += 4;
            let logStr = buffer.slice(offset, offset += 1024).toString("utf-8");
            comConOrderErrorInfo.os.errormsg = String(logStr).slice(0, logStr.indexOf("\u0000"));
            rtnStr = "errorid:" + comConOrderErrorInfo.os.errorid + ";errorMsg:" + comConOrderErrorInfo.os.errormsg;
            offset += 4;
            comConOrderErrorInfo.os.datetime = new TimeVal();
            comConOrderErrorInfo.os.datetime.tv_sec = buffer.readUIntLE(offset, 8); offset += 8;
            comConOrderErrorInfo.os.datetime.tv_usec = buffer.readUIntLE(offset, 8); offset += 8;
            res.push(comConOrderErrorInfo);
            // console.log("comConOrderErrorInfo:", comConOrderErrorInfo);
        }
        return [{ type: 2021, subytpe: 1, logStr: rtnStr }];
    }

    readComAccountPos(buffer: Buffer, msgtype: number, msgsubtype: number, msglen: number): Array<Object> {
        let count: number = 0;
        let offset: number = 0;
        let res = [];
        count = buffer.readUInt32LE(offset); offset += 4;
        for (let i = 0; i < count; ++i) {
            let comAccountPos = new ComAccountPos();
            comAccountPos.market = buffer.readUInt32LE(offset); offset += 4;
            comAccountPos.secucategory = buffer.readUInt8(offset); offset += 4;
            comAccountPos.strategyid = buffer.readUInt32LE(offset); offset += 8;
            if (ESSSecuCategory.SS_SECU_CATEGORY_EQUIT === comAccountPos.secucategory) {
                comAccountPos.record = new ComFundPos();
                comAccountPos.record.date = buffer.readUInt32LE(offset); offset += 8;
                comAccountPos.record.account = this.readInt64LE(buffer, offset); offset += 8;
                comAccountPos.record.c = buffer.slice(offset, offset + 1).toString("utf-8"); offset += 8;
                comAccountPos.record.TotalAmount = this.readInt64LE(buffer, offset); offset += 8;
                comAccountPos.record.AvlAmount = this.readInt64LE(buffer, offset); offset += 8;
                comAccountPos.record.FrzAmount = this.readInt64LE(buffer, offset); offset += 8;
                offset += 80;
            } else if (ESSSecuCategory.SS_SECU_CATEGORY_FUTURE === comAccountPos.secucategory) {
                let margin = new ComMarginPos();
                margin.date = buffer.readUInt32LE(offset); offset += 8;
                margin.account = this.readInt64LE(buffer, offset); offset += 8;
                margin.c = buffer.slice(offset, offset + 1).toString("utf-8"); offset += 8;
                margin.TotalAmount = this.readInt64LE(buffer, offset); offset += 8;
                margin.AvlAmount = this.readInt64LE(buffer, offset); offset += 8;
                margin.FrzAmount = this.readInt64LE(buffer, offset); offset += 8;

                margin.BuyFrzAmt = this.readInt64LE(buffer, offset); offset += 8;
                margin.SellFrzAmt = this.readInt64LE(buffer, offset); offset += 8;
                margin.BuyMargin = this.readInt64LE(buffer, offset); offset += 8;
                margin.SellMargin = this.readInt64LE(buffer, offset); offset += 8;
                margin.TotalMargin = this.readInt64LE(buffer, offset); offset += 8;
                margin.Fee = this.readInt64LE(buffer, offset); offset += 8;
                margin.PositionPL = this.readInt64LE(buffer, offset); offset += 8;
                margin.ClosePL = this.readInt64LE(buffer, offset); offset += 8;
                margin.PreFee = this.readInt64LE(buffer, offset); offset += 8;
                margin.PreFundVal = this.readInt64LE(buffer, offset); offset += 8;
                comAccountPos.record = margin;
            }
            res.push(comAccountPos);
            // console.log("comAccountPos:", comAccountPos);
        }
        return res;
    }
    readStrategyCfg(buf: Buffer, msgtype: number, msgsubtype: number, msglen: number): Array<Object> {
        let count: number = 0;
        let offset: number = 0;
        let res = [];
        count = buf.readUInt32LE(offset); offset += 4;
        for (let i = 0; i < count; ++i) {
            let comStrategyCfg = new ComStrategyCfg();
            comStrategyCfg.strategyid = buf.readUInt32LE(offset); offset += 4;
            comStrategyCfg.key = buf.readUInt32LE(offset); offset += 4;
            let str_end = buf.indexOf(0, offset);
            comStrategyCfg.name = buf.slice(offset, str_end).toString("utf-8");
            offset += 56;
            comStrategyCfg.value = this.readInt64LE(buf, offset); offset += 8;
            comStrategyCfg.decimal = buf.readUInt8(offset); offset += 1;
            comStrategyCfg.type = buf.readUInt8(offset); offset += 1;
            comStrategyCfg.level = buf.readUInt8(offset); offset += 1;
            comStrategyCfg.save = buf.readUInt8(offset); offset += 1;
            comStrategyCfg.modify = buf.readUInt8(offset); offset += 1;
            comStrategyCfg.dirty = buf.readUInt8(offset); offset += 1;
            offset += 2;
            res.push(comStrategyCfg);
            // console.log("comStrategyCfg:", comStrategyCfg);
        }
        return res;
    }

    readInt64LE(buffer: Buffer, offset: number): any {
        let low: number = buffer.readInt32LE(offset); offset += 4;
        let n: number = buffer.readInt32LE(offset) * 4294967296.0 + low; offset += 4;
        if (low < 0) n += 4294967296;
        return n;
    }
}