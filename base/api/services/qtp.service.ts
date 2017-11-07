/**
 * chenlei 2017/04/27
 */
"use strict";

import { TcpClient } from "../browser/tcpclient";
import { Parser } from "../browser/parser";
import { Pool } from "../browser/pool";
import { Header, QTPMessage } from "../model/qtp/message.model";
import { Injectable } from "@angular/core";

const logger = console;

class QTPParser extends Parser {
    private _curHeader: Header = null;
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
            if (buflen >= Header.len) {
                this._curHeader = new Header();
                this._curHeader.fromBuffer(bufCount >= 1 ? Buffer.concat(peekBuf, buflen) : peekBuf[0], 0);
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

            if (buflen >= this._curHeader.datalen + Header.len) {
                let tempBuffer = Buffer.concat(this._oPool.remove(bufCount + 1), buflen);
                console.info(`processMsg: appid=${this._curHeader.msgtype}, msglen=${this._curHeader.datalen}`);
                this.emit(this._curHeader.msgtype.toString(), this._curHeader, tempBuffer);

                restLen = buflen - Header.len - this._curHeader.datalen;
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

class QTPMessageParser extends QTPParser {
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

    processQtpMsg(args: any[]): void {
        let [header, all] = args;
        let msg: QTPMessage = new QTPMessage();
        msg.header = header;
        msg.fromBuffer(all, Header.len);
        this._client.emit("data", msg);
    }

    dispose(): void {
        if (this._intervalRead || this._intervalRead !== null) {
            clearInterval(this._intervalRead);
        }
        super.dispose();
    }
}

class QTPClient extends TcpClient {
    private _intervalHeart: NodeJS.Timer;
    private _parsers: QTPMessageParser[] = [];
    constructor() {
        super();
    }

    addParser(parser: any): void {
        this._parsers.push(parser);
    }

    sendMessage(msg: QTPMessage): void {
        this.send(msg.toBuffer());
    }

    sendHeartBeat(appid: number, interval = 10): void {
        let header: Header = new Header();
        header.msgtype = 255;
        header.optslen = 0;
        header.datalen = 0;
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

@Injectable()
export class QtpService {
    private _client: QTPClient;
    private _messageMap: Object;
    private _timer: any;
    private _port: number;
    private _host: string;
    private _parser: QTPMessageParser;

    constructor() {
        this._messageMap = new Object();
        this._client = new QTPClient();
        this._client.useSelfBuffer = true;
        this._parser = new QTPMessageParser(this._client);
        this._client.addParser(this._parser);
        let self = this;

        this._client.on("data", msg => {
            msg = msg[0];
            if (self._messageMap.hasOwnProperty(msg.header.msgtype)) {
                if (self._messageMap[msg.header.msgtype].context)
                    self._messageMap[msg.header.msgtype].callback.call(self._messageMap[msg.header.msgtype].context, msg.body);
                else
                    self._messageMap[msg.header.msgtype].callback(msg.body);
            }
            else
                console.warn(`unknown message appid = ${msg.header.msgtype}`);
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

        this._client.on("connect", () => {
            if (this._timer) {
                clearTimeout(this._timer);
                this._timer = null;
            }

            if (this.onConnect)
                this.onConnect();
        });
    };

    connect(port, host = "127.0.0.1") {
        this._port = port;
        this._host = host;

        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }
        this._client.connect(port, host);
    }

    send(msgtype: number, body: Object) {
        let msg = new QTPMessage();
        msg.header.msgtype = msgtype;
        msg.body = body;
        this._client.sendMessage(msg);
    }

    /**
     *
     */
    addSlot(...slots: Slot[]) {
        slots.forEach(slot => {
            if (!this._messageMap.hasOwnProperty(slot.msgtype)) {
                this._messageMap[slot.msgtype] = new Object();
                this._parser.registerMsgFunction(slot.msgtype, this._parser, this._parser.processQtpMsg);
            }
            this._messageMap[slot.msgtype] = {
                callback: slot.callback,
                context: slot.context
            };


        });
    }
    onConnect: Function;
    onClose: Function;
}

export interface Slot {
    msgtype: number;
    callback: Function;
    context?: any;
}
