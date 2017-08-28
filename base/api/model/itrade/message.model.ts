/**
 * chenlei
 */
"use strict";

export enum MsgType {
    PS_MSG_TYPE_UNKNOWN,
    PS_MSG_TYPE_TRANSACTION,
    PS_MSG_TYPE_ORDER,
    PS_MSG_TYPE_MARKETDATA,
    PS_MSG_TYPE_INDEXDATA,
    PS_MSG_TYPE_SUSPENDED,
    PS_MSG_TYPE_ORDERQUEUE,
    PS_MSG_TYPE_CANCEL_ORDER,

    MSG_HEARTBEAT = 255,

    // #begin message below used from PriceServer Begin
    PS_MSG_REGISTER = 65,
    PS_MSG_UNREGISTER = 66,
    // #end
    PS_MSG_TYPE_UPDATE_DATE = 57,

    PS_MSG_TYPE_IOPV_P = 1001,
    PS_MSG_TYPE_IOPV_T = 1002,
    PS_MSG_TYPE_IOPV_M = 1003,
    PS_MSG_TYPE_IOPV_R = 1004,


    MSG_TYPE_CODETABLE = 6,
    MSG_TYPE_TRANSACTION_EX = 1105,
    MSG_TYPE_MARKETDATA = 1102,
    MSG_TYPE_MARKETDATA_FUTURES = 1106,
    MSG_TYPE_UPDATE_DATE = 1118,
    MSG_TYPE_FUTURES = 100,
    MSG_TYPE_SZ_SNAPSHOT = 201
}

export abstract class Message {
    toString(): string {
        let props = Object.getOwnPropertyNames(this);
        let rets = "|";
        for (let i in props) {
            if ((typeof this[props[i]] === "function") || (typeof this[props[i]] === "undefined") || props[i] === "len")
                continue;
            rets = rets.concat(props[i], "=", this[props[i]], "|");
        }
        return rets;
    }

    abstract fromBuffer(buffer: Buffer, offset: number): void;
    abstract toBuffer(): Buffer;
}

export interface IHeader {
    type: number;
    subtype: number;
    msglen: number;
}

export class Header extends Message {
    static len = 8;
    type: number = 0;
    subtype: number = 0;
    msglen: number = 0;

    toBuffer(): Buffer {
        let buf: Buffer = Buffer.alloc(Header.len);
        let offset = 0;
        buf.writeInt16LE(this.type, offset); offset += 2;
        buf.writeInt16LE(this.subtype, offset); offset += 2;
        buf.writeInt32LE(this.msglen, offset); offset += 4;
        return buf;
    }

    fromBuffer(buf: Buffer): void {
        let offset = 0;
        this.type = buf.readInt16LE(offset); offset += 2;
        this.subtype = buf.readInt16LE(offset); offset += 2;
        this.msglen = buf.readUInt32LE(offset); offset += 4;
    }
}