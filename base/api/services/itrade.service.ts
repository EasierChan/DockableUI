/**
 * created by cl, 2017/02/11
 */

"use strict";

import { TcpClient } from "../browser/tcpclient";
import { Parser } from "../browser/parser";
import { Pool } from "../browser/pool";
import { Header, MsgType, Message } from "../model/itrade/message.model";
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
    constructor(private _client: TcpClient) {
        super(_client.bufferQueue);
        this.init();
    }

    init(): void {
        // this.registerMsgFunction("17", this, this.processLoginMsg);
        this._intervalRead = setInterval(() => {
            this.processRead();
        }, 500);
    }

    processLoginMsg(args: any[]): void {
        let header: Header = args[0];
        let content = args[1];
        console.info(header);
        switch (header.type) {
            // case 43: // Login
            // let msg = new ISONPack2();
            // msg.fromBuffer(all);
            // this._client.emit("data", msg);
            // logger.info("updatedate data: ", msg.newDate);
            // break;
            default:
                logger.info(`type=${header.type}, subtype=${header.subtype}, msglen=${header.msglen}`);
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

class ItradeClient extends TcpClient {
    private _intervalHeart: NodeJS.Timer;
    private _parsers: ItradeParser[] = [];
    constructor() {
        super();
    }

    addParser(parser: any): void {
        this._parsers.push(parser);
    }

    sendMessage(type: number, subtype: number, body: Message): void {
        let head = new Header();
        head.type = type;
        head.subtype = subtype;

        let buf = body.toBuffer();
        head.msglen = buf.length;
        this.send(Buffer.concat([head.toBuffer(), buf], Header.len + head.msglen));
    }

    sendHeartBeat(interval = 10): void {
        let header: Header = new Header();
        header.type = 255;
        header.subtype = 0;
        header.msglen = 0;
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
export class ItradeService {
    private client: ItradeClient;
    constructor() {
        this.client = new ItradeClient();
        this.client.addParser(new StrategyParser(this.client));
    };

    connect(port, host = "127.0.0.1") {
        this.client.on("data", msg => {
            logger.info(msg[0]);
        });
        this.client.connect(port, host);
    }

    get send(): (type: number, subtype: number, body: Message) => void {
        return this.client.sendMessage;
    }
}