/**
 * chenlei 2017/01/13
 */
"use strict";

import { Parser } from "../browser/parser";
import { Pool } from "../browser/pool";
import { TcpClient } from "../browser/tcpclient";

import { Injectable, EventEmitter } from "@angular/core";
import { TValueCallback } from "../common/base/common";
import { Header, MsgType } from "../model/itrade/message.model";
import {
    MsgUpdateDate, DepthMarketData,
    MsgBidAskIOPV, SZSnapshotMsg
} from "../model/itrade/price.model";

declare var electron: Electron.ElectronMainAndRenderer;
const logger = console;

@Injectable()
export class PriceService extends EventEmitter<any> {
    private _port: number;
    private _host: string;
    private _interval: number;
    private _state: number = 0;
    private _innercodesMap: any = {};
    private _client: PSClient;
    private onClose: Function;
    private _messageMap: any;

    constructor() {
        super();
        this._client = new PSClient();
        this._client.useSelfBuffer = true;
        this._client.addParser(new MDParser(this._client));
        this._messageMap = new Object();
    }
    /**
     * QTS::MSG::PS_MSG_TYPE_MARKETDATA
     */
    subscribeMarketData(innerCode: number, typestr: string, listener: TValueCallback<any>): void {
        electron.ipcRenderer.send("dal://itrade/ps/marketdata", { type: typestr, code: innerCode });
        electron.ipcRenderer.on("dal://itrade/ps/marketdata-reply", (e, msg) => {
            if (msg.UKey === innerCode) {
                listener(msg);
            }
        });
    }

    setEndpoint(port: number, host: string = "127.0.0.1"): void {
        this._port = port;
        this._host = host;
        let self = this;
        this._client.connect(this._port, this._host);

        self._client.on("connect", () => {
            this._messageMap[9000].callback("1");
            this._state = 1;
        });

        self._client.on("data", data => {
            try {
                self.emit(data[0]);
                this._messageMap[9000].callback("2");
            } catch (err) {
                console.error(`${err.message}`);
                console.error(data.toString());
            }
        });
        self._client.on("error", (err) => {
            this._messageMap[9000].callback("3");
            this._state = 2;
            console.error(err.message);
        });
        self._client.on("close", err => {
            this._messageMap[9000].callback("4");
            this._state = 2;
            if (this.onClose) {
                this.onClose();
            }
            console.info("remote closed");
        });
        self._client.on("end", err => {
            this._messageMap[9000].callback("5");
            this._state = 2;
            console.info("remote closed");
        });
    }

    setHeartBeat(interval: number): void {
        this._interval = interval > 5000 ? interval : 5000;
        setInterval(() => {
            if (this._port && this._host && this._state === 2) {
                this.setEndpoint(this._port, this._host);
                this.sendCodes();
            }
        }, this._interval);
    }

    register(innercodes: number[], subtype = MsgType.PS_MSG_TYPE_MARKETDATA): void {
        if (!this._innercodesMap.hasOwnProperty(subtype))
            this._innercodesMap[subtype] = [];

        innercodes.forEach(code => {
            if (!this._innercodesMap[subtype].includes(code))
                this._innercodesMap[subtype].push(code);
        });
        this.sendCodes();
    }

    private sendCodes(subtype = MsgType.PS_MSG_TYPE_MARKETDATA) {
        let header: Header = new Header();
        header.type = MsgType.PS_MSG_REGISTER;
        header.subtype = subtype;
        header.msglen = 0;
        // console.log(JSON.stringify(obj));
        this._client.sendMessage(header, {
            innerCodes: this._innercodesMap[subtype]
        });
    }
    addslot(type: number, cb: Function, context?: any) {
        if (this._messageMap.hasOwnProperty(type))
            return;
        this._messageMap[type] = { callback: cb, context: context };
    }
}

export class ItradeParser extends Parser {
    static readonly kHeaderLen = 8;
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
            if (buflen >= ItradeParser.kHeaderLen) {
                let tempBuffer = Buffer.concat(this._oPool.peek(bufCount + 1), buflen);
                this._curHeader = new Header();
                this._curHeader.type = tempBuffer.readInt16LE(0);
                this._curHeader.subtype = tempBuffer.readInt16LE(2);
                this._curHeader.msglen = tempBuffer.readInt32LE(4);
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
    processMsg(): void {
        let bufCount = 0;
        let buflen = 0;
        let restLen = 0;
        for (; bufCount < this._oPool.length; ++bufCount) {
            buflen += this._oPool.peek(bufCount + 1)[bufCount].length;
            if (buflen >= ItradeParser.kHeaderLen + this._curHeader.msglen) {
                let tempBuffer = Buffer.concat(this._oPool.remove(bufCount + 1), buflen);
                this.emit(this._curHeader.type.toString(), this._curHeader, tempBuffer.slice(ItradeParser.kHeaderLen, ItradeParser.kHeaderLen + this._curHeader.msglen));

                restLen = buflen - (ItradeParser.kHeaderLen + this._curHeader.msglen);
                if (restLen > 0) {
                    let restBuf = Buffer.alloc(restLen);
                    tempBuffer.copy(restBuf, 0, buflen - restLen);
                    this._oPool.prepend(restBuf);
                    restBuf = null;
                }
                this._curHeader = null;
                tempBuffer = null;
                break;
            }
        }
        restLen = null;
        buflen = null;
        bufCount = null;
    }
}


export class MDParser extends ItradeParser {
    private _intervalRead: NodeJS.Timer;
    constructor(private _client: TcpClient) {
        super(_client.bufferQueue);
        this.init();
    }

    init(): void {
        this.registerMsgFunction(MsgType.PS_MSG_TYPE_MARKETDATA.toString(), this, this.processMarketDataMsg);
        this.registerMsgFunction(MsgType.PS_MSG_TYPE_UPDATE_DATE.toString(), this, this.processMarketDataMsg);
        this._intervalRead = setInterval(() => {
            this.processRead();
        }, 500);
    }

    processMarketDataMsg(msg): void {
        let [header, body] = msg;
        switch (header.subtype) {
            case MsgType.MSG_TYPE_UPDATE_DATE:
                let msg = new MsgUpdateDate();
                msg.fromBuffer(body);
                // this._client.emit("data", msg);
                logger.info("updatedate data: ", msg.newDate);
                break;
            case MsgType.MSG_TYPE_FUTURES:
                let futuredata = new DepthMarketData();
                futuredata.fromBuffer(body);
                this._client.emit("data", futuredata);
                // logger.info("futures data: ", futuredata.toString());
                break;
            case MsgType.PS_MSG_TYPE_IOPV_P:
            case MsgType.PS_MSG_TYPE_IOPV_M:
            case MsgType.PS_MSG_TYPE_IOPV_T:
            case MsgType.PS_MSG_TYPE_IOPV_R:
                let iopvdata = new MsgBidAskIOPV();
                iopvdata.fromBuffer(body);
                this._client.emit("data", iopvdata);
                // logger.info("iopv data: ", iopvdata.toString());
                break;
            case MsgType.MSG_TYPE_SZ_SNAPSHOT:
                let szsnapshot = new SZSnapshotMsg();
                szsnapshot.fromBuffer(body);
                this._client.emit("data", szsnapshot);
                break;
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

export class PSClient extends TcpClient {
    private _intervalHeart: NodeJS.Timer;
    private _parsers: ItradeParser[] = [];
    constructor() {
        super();
    }

    addParser(parser: any): void {
        this._parsers.push(parser);
    }

    sendMessage(header: Header, body: any): void {
        switch (header.type) {
            case MsgType.PS_MSG_REGISTER:
                switch (header.subtype) {
                    case MsgType.PS_MSG_TYPE_MARKETDATA:
                        header.msglen = body.innerCodes.length * 4 + 4;
                        let buf: Buffer = Buffer.alloc(8 + header.msglen);
                        let offset = 8;
                        buf.writeInt32LE(body.innerCodes.length, offset); offset += 4;
                        body.innerCodes.forEach(ukey => {
                            buf.writeInt32LE(ukey, offset); offset += 4;
                        });
                        header.toBuffer().copy(buf, 0, 0);
                        this.send(buf);
                        break;
                }
                break;
        }
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
