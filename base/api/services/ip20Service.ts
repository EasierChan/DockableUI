/**
 * chenlei 2017/01/16
 */
"use strict";
import { TcpClient } from "../browser/tcpclient";
import { Parser } from "../browser/parser";
import { Pool } from "../browser/pool";
import { ISONPack2Header, ISONPack2 } from "../model/isonpack/isonpack.model";
import { Injectable } from "@angular/core";

const logger = console;

class ItradeParser extends Parser {
    private _curHeader: ISONPack2Header = null;
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
            if (buflen >= ISONPack2Header.len) {
                this._curHeader = new ISONPack2Header()
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
            if (buflen >= this._curHeader.packlen) {
                let tempBuffer = Buffer.concat(this._oPool.remove(bufCount + 1), buflen);

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


class ISONPackParser extends ItradeParser {
    private _intervalRead: NodeJS.Timer;
    constructor(private _client: TcpClient) {
        super(_client.bufferQueue);
        this.init();
    }

    init(): void {
        this.registerMsgFunction("17", this, this.processLoginMsg);
        this.registerMsgFunction("270", this, this.processTemplateMsg);
        this._intervalRead = setInterval(() => {
            this.processRead();
        }, 500);
    }

    processLoginMsg(args: any[]): void {
        let header: ISONPack2Header = args[0];
        let all = args[1];
        console.info(header);
        switch (header.packid) {
            case 43: // Login
                let msg = new ISONPack2();
                msg.fromBuffer(all);
                this._client.emit("data", msg);
                // logger.info("updatedate data: ", msg.newDate);
                break;
            default:
                logger.info(`appid=${header.appid}, packid=${header.packid}, msglen=${header.packlen}`);
                break;
        }
    }

    processTemplateMsg(args: any[]): void {
        let header: ISONPack2Header = args[0];
        let all = args[1];
        console.info(header);
        switch (header.packid) {
            case 194: // Login
                let msg = new ISONPack2();
                msg.fromBuffer(all);
                this._client.emit("data", msg);
                // logger.info("updatedate data: ", msg.newDate);
                break;
            default:
                logger.info(`appid=${header.appid}, packid=${header.packid}, msglen=${header.packlen}`);
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

class ISONPackClient extends TcpClient {
    private _intervalHeart: NodeJS.Timer;
    private _parsers: ItradeParser[] = [];
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

@Injectable()
export class IP20Service {
    private client: ISONPackClient;
    constructor() {
        this.client = new ISONPackClient();
        this.client.addParser(new ISONPackParser(this.client));
    };

    connect(port, host = "127.0.0.1") {
        this.client.on("data", msg => {
            logger.info(msg[0]);
        });
        this.client.connect(port, host);
    }

    send(appid: number, packid, jsonstr: Object) {
        this.client.sendMessage(appid, packid, jsonstr);
    }
}







// let p = new ISONPack2();
// p.head.appid = 2;
// p.head.packid = 5;
// p.content = "hello world";


// let p2 = new ISONPack2();
// p2.fromBuffer(p.toBuffer());
// console.log(p2);