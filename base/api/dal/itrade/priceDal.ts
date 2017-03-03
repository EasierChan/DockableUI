"use strict";

import { TcpClient } from "../../common/base/client";
import { IResolver } from "../../common/base/resolver";
import { DefaultLogger } from "../../common/base/logger";
import { EventEmitter } from "events";
import {
    Header, MsgType, MsgUpdateDate,
    MsgBidAskIOPV, DepthMarketData
} from "../../model/itrade/message.model";


export class PriceClient extends TcpClient {
    public constructor(resolver: IResolver) {
        super(resolver);
    }

    send(data: any): void {
        DefaultLogger.debug(data);
        super.send(Buffer.from(JSON.stringify(data)));
    }

    sendWithHead(type: number, subtype: number, data: Buffer): void {

        // TODO custom protocol to encode data.
        let msgLen = 0;
        let header = Buffer.alloc(8, 0);
        header.writeUInt16LE(type, 0);
        header.writeUInt16LE(subtype, 2);
        header.writeUInt32LE(0, 4);
        let total;
        if (data != null) {
            header.writeUInt32LE(data.length, 4);
            msgLen = data.length;
            total = Buffer.concat([header, data], header.length + data.length);
            super.send(total);

            DefaultLogger.debug("type: ", type, "subtype: ", subtype, "msglen: ", msgLen);
        } else {
            super.send(header);
            DefaultLogger.debug("type: ", type, "subtype: ", subtype, "msglen: ", msgLen);
        }

        total = null;
        header = null;
    }

    sendHeartBeat(interval: number = 300): void {
        setInterval(() => {
            this.sendWithHead(MsgType.MSG_HEARTBEAT, 0, null);
        }, interval * 1000);
    }

    onReceived(data: any): void {
        // TODO deal the json Object Data.
        // DefaultLogger.info(data);
        this.emit("PS_MSG", data);
    }
}

/**
 * resolve for PriceServer
 */
export class PriceResolver extends EventEmitter implements IResolver {
    // 缓冲区长度下限 4K
    private bufMiniumLen: number = 1 << 12;
    // 缓冲区长度上限 1G
    private bufMaxiumLen: number = 1 << 30;
    // 缓冲区初始大小 4M
    private bufLen: number = 1 << 22;
    // 缓冲区
    private buffer: Buffer;
    private bufBeg: number = 0;
    private bufEnd: number = 0;
    // 消息格式
    private headLen: number = 8;

    resetBuffer(bufLen?: number): void {
        if (bufLen) {
            if (bufLen < this.bufMiniumLen) {
                DefaultLogger.error("buffer minium length can\"t less than " + this.bufMiniumLen);
                throw Error("buffer minium length can\"t less than " + this.bufMiniumLen);
            } else {
                this.bufLen = bufLen;
            }
        }

        this.buffer = Buffer.alloc(this.bufLen);
    }

    setHeadLen(len: number = 8): void {
        this.headLen = len;
    }

    constructor(bufLen?: number) {
        super();
        this.resetBuffer(bufLen);
    }

    onConnected(arg: any): void {
        DefaultLogger.info("connected!");
    }

    onError(err: any): void {
        // DefaultLogger.info(err);
        this.emit("ps-error" , err);
    }

    onData(data: Buffer): void {
        DefaultLogger.trace("got data from server! datalen= %d", data.length);
        // auto grow buffer to store big data unless it greater than maxlimit.
        while (data.length + this.bufEnd > this.bufLen) {
            DefaultLogger.warn("more buffer length required.");
            if ((this.bufLen << 1) > this.bufMaxiumLen) {
                DefaultLogger.fatal("too max buffer");
                throw Error("too max buffer");
            }
            this.buffer = Buffer.concat([this.buffer, Buffer.alloc(this.bufLen)], this.bufLen << 1);
            this.bufLen <<= 1;
        }

        data.copy(this.buffer, this.bufEnd);
        this.bufEnd += data.length;

        let readLen = this.readMsg();
        while (readLen > 0) {
            this.bufBeg += readLen;

            if (this.bufBeg > (this.bufLen >> 1)) {
                this.bufBeg -= (this.bufLen >> 1);
                this.bufEnd -= (this.bufLen >> 1);
            }

            readLen = this.readMsg();
        }
    }

    onEnd(arg: any): void {
        DefaultLogger.info("got a FIN");
    }

    onClose(arg: any): void {
        DefaultLogger.info("connection closed!");
    }

    readHeader(): Header {
        return {
            type: this.buffer.readUInt16LE(this.bufBeg),
            subtype: this.buffer.readUInt16LE((this.bufBeg + 2)),
            msglen: this.buffer.readUInt32LE((this.bufBeg + 4))
        };
    }
    // really unpack msg
    readMsg(): number {
        if (this.bufEnd < this.bufBeg + this.headLen) {
            return 0;
        }
        // read head
        let header = this.readHeader();
        DefaultLogger.info("MsgHeader: ", header);

        if (header.msglen === 0) {
            DefaultLogger.warn("empty message!(maybe a Heartbeat)");
            return this.headLen;
        }
        // read content
        if (this.bufEnd < this.bufBeg + this.headLen + header.msglen) {
            return 0;
        }

        let content: Buffer = this.buffer.slice((this.bufBeg + this.headLen), (this.bufBeg + this.headLen + header.msglen));

        switch (header.type) {
            case MsgType.PS_MSG_TYPE_UPDATE_DATE:
                let msgupdate = new MsgUpdateDate();
                msgupdate.fromBuffer(content);
                DefaultLogger.debug("market date: ", msgupdate.newDate);
                // DefaultLogger.info(msgupdate.toString());
                // this.emit("data", msgupdate);
                break;
            case MsgType.PS_MSG_TYPE_MARKETDATA:
                // deserializeMarketData();
                DefaultLogger.debug("=== New Quote Data ===");
                switch (header.subtype) {
                    case MsgType.MSG_TYPE_FUTURES:
                        let futureMarketData = new DepthMarketData();
                        futureMarketData.fromBuffer(content);
                        // DefaultLogger.debug(futureMarketData.toString());
                        this.emit("data", futureMarketData);
                        break;
                    default:
                        DefaultLogger.debug("type=", content.readInt32LE(0));
                        break;
                }
                break;
            default: {
                switch (header.subtype) {
                    case MsgType.PS_MSG_TYPE_IOPV_P:
                    case MsgType.PS_MSG_TYPE_IOPV_M:
                    case MsgType.PS_MSG_TYPE_IOPV_T:
                    case MsgType.PS_MSG_TYPE_IOPV_R:
                        // deserializeMarketDataIopvItem();
                        let iopvMsg = new MsgBidAskIOPV();
                        iopvMsg.fromBuffer(content);
                        this.emit("data", iopvMsg);
                        break;
                }
            }
                break;
        }

        return this.headLen + header.msglen;
    }
}


export class PriceDal {
    static _client: PriceClient;
    static _resolver: PriceResolver;
    static start(): void {
        if (!PriceDal._client) {
            PriceDal._resolver = new PriceResolver();
            PriceDal._client = new PriceClient(PriceDal._resolver);
            PriceDal._client.connect(10000, "172.24.13.5");
            PriceDal._client.sendHeartBeat(10);
        }
        // PriceDal.registerQuoteMsg("MARKETDATA", [2006622]);
    }

    // register PriceServer msg
    static registerQuoteMsg(name: string, innercode: number): void {
        PriceDal.start();

        let type: number = 0;
        let subtype: number = 0;

        switch (name) {
            case "IOPVP":
                type = MsgType.PS_MSG_REGISTER;
                subtype = MsgType.PS_MSG_TYPE_IOPV_P;
                break;
            case "IOPVT":
                type = MsgType.PS_MSG_REGISTER;
                subtype = MsgType.PS_MSG_TYPE_IOPV_T;
                break;
            case "IOPVM":
                type = MsgType.PS_MSG_REGISTER;
                subtype = MsgType.PS_MSG_TYPE_IOPV_M;
                break;
            case "IOPVR":
                type = MsgType.PS_MSG_REGISTER;
                subtype = MsgType.PS_MSG_TYPE_IOPV_R;
                break;
            case "MARKETDATA":
                type = MsgType.PS_MSG_REGISTER;
                subtype = MsgType.PS_MSG_TYPE_MARKETDATA;
                break;
            default:
                DefaultLogger.info("Wrong type in message, must be IOPV or FUTURES, but got ", name);
                break;
        }

        let offset = 0;
        let data = new Buffer(4 + 4); // count + innercode

        data.writeInt32LE(1, 0);
        offset += 4;

        data.writeInt32LE(innercode, offset);
        offset += 4;
        PriceDal._client.sendWithHead(type, subtype, data);
    }

    static addListener(name: string, cb: Function): void {
        PriceDal.start();
        PriceDal._resolver.on("data", (data) => {
            switch (name) {
                case "MARKETDATA":
                    switch (data.type) {
                        case MsgType.MSG_TYPE_FUTURES:
                            // DefaultLogger.info(data.toString());
                            cb(data);
                            break;
                        default:
                            DefaultLogger.info(data.toString());
                            break;
                    }
                    break;
                default:
                    DefaultLogger.info(`listener >> ${name} is not valid`);
                    break;
            }
        });
    }
}

import { ipcMain } from "electron";
ipcMain.on("dal://itrade/ps/marketdata", (e, param, cb) => {
    PriceDal.registerQuoteMsg(param.type, param.code);
    PriceDal.addListener(param.type, (data) => {
        if (!e.sender.isDestroyed())
            e.sender.send("dal://itrade/ps/marketdata-reply", data);
    });
});
