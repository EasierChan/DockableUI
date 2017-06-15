/**
 * chenlei 2017/04/27
 */
"use strict";

import { TcpClient } from "../common/base/tcpclient";
import { Parser } from "../common/base/parser";
import { Pool } from "../common/base/pool";
import { DefaultLogger } from "../common/base/logger";
import { Header, QTPMessage } from "../model/qtp/message.model";

const logger = DefaultLogger;

class QTPParser extends Parser {
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
            buflen += this._oPool.peek(bufCount + 1)[bufCount].byteLength;
            if (buflen >= Header.len) {
                this._curHeader = new Header();
                if (bufCount > 1) {
                    let tempBuffer = Buffer.concat(this._oPool.peek(bufCount + 1), buflen);
                    this._curHeader.fromBuffer(tempBuffer, 0);
                    tempBuffer = null;
                } else {
                    this._curHeader.fromBuffer(this._oPool.peek(bufCount + 1)[0], 0);
                }
                ret = true;
                break;
            }
            console.info(this._oPool.length);
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
        this.registerMsgFunction("8012", this, this.processQtpMsg);
        this.registerMsgFunction("8015", this, this.processQtpMsg);
        this.registerMsgFunction("8017", this, this.processQtpMsg);
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
        // switch (header.msgtype) {
        //     case 43: // Login
        //         msg.fromBuffer(content);
        //         this._client.emit("data", msg);
        //         break;
        //     case 120: // login error
        //         msg.fromBuffer(content);
        //         this._client.emit("data", msg);
        //         break;
        //     default:
        //         logger.warn(`unknown message: appid=${header.msgtype}`);
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

export class QtpService {
    private _client: QTPClient;
    private _messageMap: Object;
    private _timer: any;
    constructor() {
        this._messageMap = new Object();
        this._client = new QTPClient();
        this._client.useSelfBuffer = true;
        this._client.addParser(new QTPMessageParser(this._client));
    };

    connect(port, host = "127.0.0.1") {
        let self = this;
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }

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
            this._timer = setTimeout(() => {
                this._client.reconnect(port, host);
            }, 10000);
        });
        this._client.on("connect", () => {
            if (this._timer) {
                clearTimeout(this._timer);
            }
        });
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
            if (!this._messageMap.hasOwnProperty(slot.msgtype))
                this._messageMap[slot.msgtype] = new Object();
            this._messageMap[slot.msgtype] = {
                callback: slot.callback,
                context: slot.context
            };
        });
    }
}

export interface Slot {
    msgtype: number;
    callback: Function;
    context?: any;
}


export class QTPFactory {
    private static qtp: QtpService;
    static get instance() {
        if (!QTPFactory.qtp)
            QTPFactory.qtp = new QtpService();

        return QTPFactory.qtp;
    }
}