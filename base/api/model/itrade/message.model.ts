/**
 * chenlei
 */
"use strict";

export enum SSMsgType {
    PS_UNKNOWN,
    PS_TRANSACTION,
    PS_ORDER,
    PS_MARKETDATA,
    PS_INDEXDATA,
    PS_SUSPENDED,
    PS_ORDERQUEUE,
    PS_CANCEL_ORDER,

    MSG_HEARTBEAT = 255,

    // #begin message below used from PriceServer Begin
    PS_REGISTER = 65,
    PS_UNREGISTER = 66,
    // #end
    PS_UPDATE_DATE = 57,

    PS_IOPV_P = 1001,
    PS_IOPV_T = 1002,
    PS_IOPV_M = 1003,
    PS_IOPV_R = 1004,


    PS_CODETABLE = 6,
    PS_TRANSACTION_EX = 1105,
    PS_MARKETDATA_FUTURES = 1106,
    PS_UPDATE_DATE_SUB = 1118,
    PS_FUTURES = 100,
    PS_SZ_SNAPSHOT = 201,
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

    abstract fromBuffer(buffer: Buffer, offset: number): number;
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

    fromBuffer(buf: Buffer): number {
        let offset = 0;
        this.type = buf.readInt16LE(offset); offset += 2;
        this.subtype = buf.readInt16LE(offset); offset += 2;
        this.msglen = buf.readUInt32LE(offset); offset += 4;

        return offset;
    }
}