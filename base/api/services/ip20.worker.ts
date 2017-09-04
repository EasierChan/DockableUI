/**
 * chenlei 2017/01/16
 */
"use strict";

import { TcpClient } from "../common/base/tcpclient";
import { Parser } from "../common/base/parser";
import { Pool } from "../common/base/pool";
import { ISONPack2Header, ISONPack2 } from "../model/isonpack/isonpack.model";
import { Header } from "../model/itrade/message.model";
import { DefaultLogger } from "../common/base/logger";

const logger = console;

const kFileName = "ip20work";

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

        if (this._curHeader !== null)
            return true;

        let ret = false;
        let bufCount = 0;
        let buflen = 0;
        let restLen = 0;

        for (; bufCount < this._oPool.length; ++bufCount) {
            buflen += this._oPool.peek(bufCount + 1)[bufCount].byteLength;
            if (buflen >= ISONPack2Header.len) {
                this._curHeader = new ISONPack2Header();
                let tempBuffer = null;

                if (bufCount > 1) {
                    tempBuffer = Buffer.concat(this._oPool.peek(bufCount + 1), buflen);

                    this._curHeader.fromBuffer(tempBuffer);
                } else {
                    this._curHeader.fromBuffer(this._oPool.peek(bufCount + 1)[0]);
                    tempBuffer = this._oPool.peek(bufCount + 1)[0];
                }

                //  remove unvalid message header
                if (this._curHeader.packlen === 0) {
                    this._oPool.remove(bufCount + 1);
                    restLen = buflen - ISONPack2Header.len;

                    if (restLen > 0) {
                        let restBuf = Buffer.alloc(restLen);
                        tempBuffer.copy(restBuf, 0, buflen - restLen);
                        this._oPool.prepend(restBuf);
                        restBuf = null;
                    }

                    tempBuffer = null;
                    this._curHeader = null;
                    ret = false;
                    break;
                }

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
            if (buflen >= this._curHeader.packlen) {
                let tempBuffer = Buffer.concat(this._oPool.remove(bufCount + 1), buflen);
                logger.info(`${kFileName}:105 processMsg: appid=${this._curHeader.appid}, packid=${this._curHeader.packid}, packlen=${this._curHeader.packlen}`);
                this.emit(this._curHeader.appid.toString(), this._curHeader, tempBuffer);

                restLen = buflen - this._curHeader.packlen;
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

    processTemplateMsg(args: any[]): void {
        let header: ISONPack2Header = args[0];
        let msg = new ISONPack2();
        msg.fromBuffer(args[1]);
        this._client.emit("data", msg);

        // switch (header.packid) {
        //     case 194:
        //     case 2001:
        //     case 2003:
        //         msg = new ISONPack2();
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

    sendMessage(appid: number, packid: number, body: Object): void {
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
        this._parsers.forEach(parser => {
            parser.dispose();
        });
        super.dispose();
    }
}

export class IP20Service {
    private _client: ISONPackClient;
    private _messageMap: Object;
    private _timer: any;
    private _parser: ISONPackParser;

    constructor() {
        this._messageMap = new Object();
        this._client = new ISONPackClient();
        this._client.useSelfBuffer = true;
        this._parser = new ISONPackParser(this._client);
        this._client.addParser(this._parser);
    };

    connect(port, host = "127.0.0.1") {
        let self = this;

        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }

        this._client.on("data", msg => {
            msg = msg[0];
            if (self._messageMap.hasOwnProperty(msg.head.appid) && self._messageMap[msg.head.appid].hasOwnProperty(msg.head.packid)) {
                self._messageMap[msg.head.appid][msg.head.packid](msg);
            }
            else
                console.warn(`unknown message appid = ${msg.head.appid}, packid = ${msg.head.packid}`);
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
                this._client.reconnect(port, host);
            }, 10000);

            if (this.onClose)
                this.onClose();
        });
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
            this.send(appid, packid, head.toBuffer());
        } else if (msg.body instanceof Buffer) {
            head.msglen = msg.body.length;
            this.send(appid, packid, Buffer.concat([head.toBuffer(), msg.body], Header.len + head.msglen));
        } else {
            let buf = msg.body.toBuffer();
            head.msglen = buf.length;
            this.send(appid, packid, Buffer.concat([head.toBuffer(), buf], Header.len + head.msglen));
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

export class IP20Factory {
    private static tgw: IP20Service;
    static get instance() {
        if (!IP20Factory.tgw)
            IP20Factory.tgw = new IP20Service();

        return IP20Factory.tgw;
    }
}