/**
 * created by cl, 2017/02/11
 */

"use strict";

import { TcpClient } from "../browser/tcpclient";
import { Parser } from "../browser/parser";
import { Pool } from "../browser/pool";
import { Header, MsgType, Message } from "../model/itrade/message.model";
import {
    ComStrategyInfo, ComTotalProfitInfo, ComGuiAckStrategy,
    ComStrategyCfg, ComOrderRecord, ComAccountPos, ComRecordPos,
    ComGWNetGuiInfo, StatArbOrder, ComConOrderStatus, ComConOrderErrorInfo
} from "../model/itrade/strategy.model";
import { Injectable } from "@angular/core";

const logger = console;

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

/**
 *
 */
class StrategyParser extends ItradeParser {
    private _intervalRead: NodeJS.Timer;
    constructor(private _client: TcpClient) {
        super(_client.bufferQueue);
        this.init();
    }

    init(): void {
        this.registerMsgFunction("2001", this, this.processStrategyMsg);
        this.registerMsgFunction("2003", this, this.processStrategyMsg);
        this.registerMsgFunction("2005", this, this.processStrategyMsg);
        this.registerMsgFunction("2050", this, this.processStrategyMsg);
        this.registerMsgFunction("2011", this, this.processStrategyMsg);
        this.registerMsgFunction("2033", this, this.processStrategyMsg);
        this.registerMsgFunction("2048", this, this.processStrategyMsg);
        // StrategyCfg
        this.registerMsgFunction("2000", this, this.processStrategyMsg);
        this.registerMsgFunction("2002", this, this.processStrategyMsg);
        this.registerMsgFunction("2004", this, this.processStrategyMsg);
        this.registerMsgFunction("2049", this, this.processStrategyMsg);
        this.registerMsgFunction("2030", this, this.processStrategyMsg);
        this.registerMsgFunction("2029", this, this.processStrategyMsg);
        this.registerMsgFunction("2032", this, this.processStrategyMsg);
        // ComOrderRecord
        this.registerMsgFunction("2022", this, this.processStrategyMsg);
        this.registerMsgFunction("3011", this, this.processStrategyMsg);
        this.registerMsgFunction("3510", this, this.processStrategyMsg);
        // ComAccountPos
        this.registerMsgFunction("2013", this, this.processStrategyMsg);
        // ComRecordPos
        this.registerMsgFunction("3502", this, this.processStrategyMsg);
        this.registerMsgFunction("3504", this, this.processStrategyMsg);
        // ComGWNetGuiInfo
        this.registerMsgFunction("2015", this, this.processStrategyMsg);
        this.registerMsgFunction("2017", this, this.processStrategyMsg);
        this._intervalRead = setInterval(() => {
            this.processRead();
        }, 500);
    }

    processStrategyMsg(args: any[]): void {
        let header: Header = args[0];
        let content = args[1] as Buffer;
        let count = 0;
        let offset = 0;
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
                    this._client.emit("data", header, msg);
                }
                break;
            case 2033:
            case 2011: // ComStrategyInfo
                count = content.readUInt32LE(offset);
                offset += 4;
                msg = new ComStrategyInfo();

                for (let i = 0; i < count; ++i) {
                    offset = msg.fromBuffer(content, offset);
                    this._client.emit("data", header, msg);
                }
                break;
            case 2048: // ComTotalProfitInfo
                count = content.readUInt32LE(offset);
                offset += 4;
                msg = new ComTotalProfitInfo();

                for (let i = 0; i < count; ++i) {
                    offset = msg.fromBuffer(content, offset);
                    this._client.emit("data", header, msg);
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
                    this._client.emit("data", header, msg);
                }
                break;
            case 2022:
                count = content.readUInt32LE(offset);
                offset += 4;
                msg = new ComOrderRecord();
                for (let i = 0; i < count; ++i) {
                    offset = msg.fromBuffer(content, offset);
                    this._client.emit("data", header, msg);
                }
                break;
            case 2013:
                count = content.readUInt32LE(offset);
                offset += 4;
                msg = new ComAccountPos();
                for (let i = 0; i < count; ++i) {
                    offset = msg.fromBuffer(content, offset);
                    this._client.emit("data", header, msg);
                }
                break;
            case 3502:
            case 3504:
                count = content.readUInt32LE(offset);
                offset += 4;
                msg = new ComRecordPos();
                for (let i = 0; i < count; ++i) {
                    offset = msg.fromBuffer(content, offset);
                    this._client.emit("data", header, msg);
                }
                break;
            case 2015:
            case 2017:
                count = content.readUInt32LE(offset);
                offset += 4;
                msg = new ComGWNetGuiInfo();
                for (let i = 0; i < count; ++i) {
                    offset = msg.fromBuffer(content, offset);
                    this._client.emit("data", header, msg);
                }
                break;
            case 2025:
                count = content.readUInt32LE(offset);
                offset += 4;
                msg = new StatArbOrder();
                for (let i = 0; i < count; ++i) {
                    offset = msg.fromBuffer(content, offset);
                    this._client.emit("data", header, msg);
                }
                break;
            case 2021:
                count = content.readUInt32LE(offset);
                offset += 4;
                msg = header.subtype === 0 ? new ComConOrderStatus() : new ComConOrderErrorInfo();
                for (let i = 0; i < count; ++i) {
                    offset = msg.fromBuffer(content, offset);
                    this._client.emit("data", header, msg);
                }
                break;
            case 2040:
                msg = content.slice(offset, content.indexOf(0, offset));
                this._client.emit("data", header, msg);
                break;
            default:
                logger.warn(`unhandle msg=> type=${header.type}, subtype=${header.subtype}, msglen=${header.msglen}`);
                break;
        }
    }

    dispose(): void {
        if (this._intervalRead || this._intervalRead !== null) {
            clearInterval(this._intervalRead);
        }
        super.dispose();
    }
}

/**
 *
 */
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
        let header: Header = new Header();
        header.type = 255;
        header.subtype = 0;
        header.msglen = 0;
        if (this._intervalHeart) {
            clearInterval(this._intervalHeart);
            this._intervalHeart = null;
        }

        if (interval > 0) {
            this._intervalHeart = setInterval(() => {
                this.send(header.toBuffer());
            }, interval * 1000);
        }
    }

    dispose(): void {
        if (this._intervalHeart !== null) {
            clearInterval(this._intervalHeart);
            this._intervalHeart = null;
        }
        this._parsers.forEach(parser => {
            parser.dispose();
        });
        super.dispose();
    }
}


@Injectable()
export class ItradeService {
    private _client: ItradeClient;
    private _parser: ItradeParser;
    private _messageMap: Object;
    private _sessionid: number;
    private _port: number;
    private _host: string;
    private _timer: any;
    constructor() {
        this._sessionid = 0;
        this._messageMap = {};
        this._client = new ItradeClient();
        this._client.useSelfBuffer = true;
        this._parser = new StrategyParser(this._client);
        this._client.addParser(this._parser);
    };

    set sessionID(value: number) {
        this._sessionid = value;
    }

    get sessionID(): number {
        return this._sessionid;
    }

    connect(port, host = "127.0.0.1") {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }

        this.start();
        this._client.connect(port, host);
        this._port = port;
        this._host = host;
    }

    start(): void {
        this._client.on("data", msg => {
            if (this._messageMap.hasOwnProperty(msg[0].type)) {
                if (this._messageMap[msg[0].type].context !== undefined)
                    this._messageMap[msg[0].type].callback.call(this._messageMap[msg[0].type].context, msg[1], this._sessionid);
                else
                    this._messageMap[msg[0].type].callback(msg[1], this._sessionid);
            } else {
                console.warn(`unhandle message type=${msg[0].type}`);
            }
        });

        this._client.on("connect", () => {
            if (this._timer) {
                clearTimeout(this._timer);
                this._timer = null;
            }
            this._client.sendHeartBeat(10);
            if (this._messageMap.hasOwnProperty(0)) {
                if (this._messageMap[0].context !== undefined)
                    this._messageMap[0].callback.call(this._messageMap[0].context, this._sessionid);
                else
                    this._messageMap[0].callback(this._sessionid);
            }
        });

        this._client.on("close", () => {
            this._client.sendHeartBeat(0);
            this._timer = setTimeout(() => {
                clearTimeout(this._timer);
                this._timer = null;
                this._client.reconnect(this._port, this._host);
            }, 10000);

            if (this._messageMap.hasOwnProperty(-1)) {
                if (this._messageMap[-1].context !== undefined)
                    this._messageMap[-1].callback.call(this._messageMap[-1].context, this._sessionid);
                else
                    this._messageMap[-1].callback(this._sessionid);
            }
        });
    }

    stop(): void {
        if (this._timer !== null) {
            clearTimeout(this._timer);
            this._timer = null;
        }
        this._client.dispose();
    }

    send(type: number, subtype: number, body: any): void {
        return this._client.sendMessage(type, subtype, body);
    }

    addSlot(type: number, cb: Function, context?: any): void {
        if (this._messageMap.hasOwnProperty(type))
            return;
        this._messageMap[type] = { callback: cb, context: context };
    }

    get client() {
        return this._client;
    }
}

/**
 * interface for single pro.
 */
process.on("message", (m: WSItrade, sock) => {
    switch (m.command) {
        case "start":
            ItradeFactory.instance.client.on("data", msg => {
                process.send({ event: "data", content: msg });
            });
            ItradeFactory.instance.client.on("connect", () => {
                process.send({ event: "connect" });
            });
            ItradeFactory.instance.client.on("error", () => {
                process.send({ event: "disconnect" });
            });
            ItradeFactory.instance.connect(m.params.port, m.params.host);
            break;
        case "stop":
            ItradeFactory.instance.stop();
            break;
        default:
            console.error(`unvalid command => ${m.command}`);
            break;
    }
});

interface WSItrade {
    command: string;
    params: any;
}

class ItradeFactory {
    private static itrade;
    static get instance() {
        if (!ItradeFactory.itrade)
            return ItradeFactory.itrade;
    }
}