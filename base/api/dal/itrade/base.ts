/**
 * created by cl, 2017/03/06
 */
"use strict";

import { EventEmitter } from "events";
import { TcpClient } from "../../common/base/client";
import { IResolver } from "../../common/base/resolver";
import { DefaultLogger } from "../../common/base/logger";
import { Header, MsgType } from "../../model/itrade/message.model";


export class ItradeClient extends TcpClient {
    private _timer: any;
    public constructor(resolver: IResolver) {
        super(resolver);
    }
    
    send(data: any): void {
        super.send(data);
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



    sendHeartBeat(interval: number = 30): void {
        this._timer = setInterval(() => {
            this.sendWithHead(MsgType.MSG_HEARTBEAT, 0, null);
        }, interval * 1000);
    }

    stopHeartBeat(): void {
        clearInterval(this._timer);
    }
}

/**
 * resolve for PriceServer
 */
export abstract class ItradeResolver extends EventEmitter implements IResolver {
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
        this.emit("dal://itrade/connected", null);
        DefaultLogger.info("connected!");
    }

    onError(err: any): void {
        // DefaultLogger.info(err);
        this.emit("dal://itrade/error", err);
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
    // child realize this method.
    abstract readContent(header: Header, content: Buffer): void;
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

        // read Content
        this.readContent(header, content);

        return this.headLen + header.msglen;
    }
}