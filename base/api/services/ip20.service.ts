/**
 * chenlei 2017/01/16
 */
"use strict";

import { TcpClient } from "../browser/tcpclient";
import { Parser } from "../browser/parser";
import { Pool } from "../browser/pool";
import { ISONPack2Header, ISONPack2 } from "../model/isonpack/isonpack.model";
import { Header } from "../model/itrade/message.model";
import { Injectable } from "@angular/core";
import { ULogger } from "./backend.service";

let logger = ULogger;

class IP20Parser extends Parser {
    private _curHeader: ISONPack2Header = null;
    constructor(_oPool: Pool<Buffer>) {
        super(_oPool);
    }

    processRead(): void {
        while (this.processMsgHeader() && this.processMsg()) {
            this._curHeader = null;

            if (this._oPool.length === 0)
                break;

            logger.info(`pool length: ${this._oPool.length}`);
        }
    }
    /**
     * process message head.
     */
    processMsgHeader(): boolean {
        if (this._oPool.length === 0)
            return false;

        if (this._curHeader !== null) {
            logger.warn(`curHeader: ${JSON.stringify(this._curHeader)}, poolLen=${this._oPool.length}`);
            return true;
        }

        let ret = false;
        let bufCount = 0;
        let buflen = 0;
        let restLen = 0;
        let peekBuf = null;

        for (; bufCount < this._oPool.length; ++bufCount) {
            peekBuf = this._oPool.peek(bufCount + 1);
            buflen += peekBuf[bufCount].byteLength;
            if (buflen >= ISONPack2Header.len) {
                logger.info(`buflen=${buflen}, ISONPack2Header.len=${ISONPack2Header.len}, bufCount=${bufCount + 1}`);
                this._curHeader = new ISONPack2Header();
                this._curHeader.fromBuffer(bufCount >= 1 ? Buffer.concat(peekBuf, buflen) : peekBuf[0]);
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
        let peekBuf = null;

        for (; bufCount < this._oPool.length; ++bufCount) {
            peekBuf = this._oPool.peek(bufCount + 1);
            buflen += peekBuf[bufCount].byteLength;
            if (buflen >= this._curHeader.packlen) {
                let tempBuffer = Buffer.concat(this._oPool.remove(bufCount + 1), buflen);
                logger.info(`processMsg: appid=${this._curHeader.appid}, packid=${this._curHeader.packid}, packlen=${this._curHeader.packlen}, buflen=${tempBuffer.length}`);
                this.emit(this._curHeader.appid.toString(), this._curHeader, tempBuffer);

                restLen = buflen - this._curHeader.packlen;
                if (restLen > 0) {
                    let restBuf = Buffer.alloc(restLen);
                    tempBuffer.copy(restBuf, 0, buflen - restLen);
                    this._oPool.prepend(restBuf);
                    restBuf = null;
                    logger.warn(`restLen=${restLen}, tempBuffer=${tempBuffer.length}`);
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

class ISONPackParser extends IP20Parser {
    private _intervalRead: NodeJS.Timer;
    constructor(private _client: TcpClient) {
        super(_client.bufferQueue);
        this.init();
    }

    init(): void {
        this._intervalRead = setInterval(() => {
            this.processRead();
        }, 500);
    }

    processLoginMsg(args: any[]): void {
        let header: ISONPack2Header = args[0];
        let all = args[1];
        let msg = new ISONPack2();
        switch (header.packid) {
            case 43: // Login
            case 120: // login error
            case 109:
            case 110:
                msg.fromBuffer(all);
                this._client.emit("data", msg);
                break;
            default:
                logger.warn(`unknown message: appid=${header.appid}, packid=${header.packid}, msglen=${header.packlen}`);
                break;
        }
    }

    processTemplateMsg(args: any[]): void {
        let header: ISONPack2Header = args[0];
        let all = args[1];
        let msg = new ISONPack2();
        msg.fromBuffer(all);
        this._client.emit("data", msg);
        // switch (header.packid) {
        //     case 194:
        //     case 216:
        //     case 218:
        //     case 2001:
        //     case 2003:
        //         msg.fromBuffer(all);
        //         this._client.emit("data", msg);
        //         break;
        //     default:
        //         logger.warn(`unknown message: appid=${header.appid}, packid=${header.packid}, msglen=${header.packlen}`);
        //         break;
        // }
    }

    dispose(): void {
        if (this._intervalRead || this._intervalRead !== null) {
            clearInterval(this._intervalRead);
        }
        super.dispose();
    }
}

class ISONPackClient extends TcpClient {
    private _intervalHeart: NodeJS.Timer;
    private _parsers: IP20Parser[] = [];
    constructor() {
        super();
    }

    addParser(parser: any): void {
        this._parsers.push(parser);
    }

    sendMessage(appid: number, packid: number, body: any): void {
        let pack = new ISONPack2();
        pack.content = body;
        pack.head.appid = appid;
        pack.head.packid = packid;
        this.send(pack.toBuffer());
    }

    sendHeartBeat(appid: number, interval = 10): void {
        let header: ISONPack2Header = new ISONPack2Header();
        header.appid = appid;
        header.packid = 0;
        header.packlen = ISONPack2Header.len;
        header.bitmap = 0x40;
        this._intervalHeart = setInterval(() => {
            this.send(header.toBuffer());
        }, interval * 1000);
    }

    dispose(): void {
        if (this._intervalHeart !== null) {
            clearInterval(this._intervalHeart);
            this._intervalHeart = null;
        }

        super.dispose();
    }
}

@Injectable()
export class IP20Service {
    private _client: ISONPackClient;
    private _messageMap: Object;
    private _timer: any;
    private _parser: ISONPackParser;
    private _port: number;
    private _host: string;

    constructor() {
        this._messageMap = new Object();
        this._client = new ISONPackClient();
        this._client.useSelfBuffer = true;
        this._parser = new ISONPackParser(this._client);
        this._client.addParser(this._parser);
        let self = this;
        this._client.on("data", msg => {
            msg = msg[0];
            if (self._messageMap.hasOwnProperty(msg.head.appid) && self._messageMap[msg.head.appid].hasOwnProperty(msg.head.packid)) {
                self._messageMap[msg.head.appid][msg.head.packid](msg);
            }
            else
                logger.warn(`unknown message appid = ${msg.head.appid}, packid = ${msg.head.packid}`);
        });

        this._client.on("connect", () => {
            if (this._timer) {
                clearTimeout(this._timer);
                this._timer = null;
            }

            if (this.onConnect)
                this.onConnect();
        });

        this._client.on("close", () => {
            console.info("remote closed");

            if (this._timer) {
                clearTimeout(this._timer);
                this._timer = null;
            }

            this._timer = setTimeout(() => {
                this._client.connect(this._port, this._host);
            }, 10000);

            if (this.onClose)
                this.onClose();
        });
    };

    connect(port, host = "127.0.0.1") {
        this._port = port;
        this._host = host;

        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }

        this._client.dispose();
        this._client.connect(port, host);
    }

    send(appid: number, packid, jsonstr: any) {
        this._client.sendMessage(appid, packid, jsonstr);
    }

    sendQtp(appid: number, packid, msg: { type: number, subtype: number, body: any }) {
        let head = new Header();
        head.type = msg.type;
        head.subtype = msg.subtype;
        head.msglen = 0;

        if (msg.body === undefined || msg.body === null) {
            this.send(appid, 1000, head.toBuffer());
        } else if (msg.body instanceof Buffer) {
            head.msglen = msg.body.length;
            this.send(appid, 1000, Buffer.concat([head.toBuffer(), msg.body], Header.len + head.msglen));
        } else {
            let buf = msg.body.toBuffer();
            head.msglen = buf.length;
            this.send(appid, 1000, Buffer.concat([head.toBuffer(), buf], Header.len + head.msglen));
        }

        head = null;
    }
    /**
     *
     */
    addSlot(...slots: Slot[]) {
        slots.forEach(slot => {
            if (!this._messageMap.hasOwnProperty(slot.appid)) {
                this._messageMap[slot.appid] = new Object();
                this._parser.registerMsgFunction(slot.appid, this._parser, this._parser.processTemplateMsg);
            }

            this._messageMap[slot.appid][slot.packid] = slot.callback;
        });
    }

    onConnect: Function;
    onClose: Function;
}

export interface Slot {
    appid: number;
    packid: number;
    callback: Function;
}

class IP20Factory {
    private static tgw: IP20Service;
    static get instance() {
        if (!IP20Factory.tgw)
            IP20Factory.tgw = new IP20Service();

        return IP20Factory.tgw;
    }
}