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

const HeaderLen = 8;
export interface Header {
    type: number;
    subtype: number;
    msglen: number;
}

export let encodeHeader = (headr: Header): Buffer => {
    let buf: Buffer = Buffer.alloc(HeaderLen);
    let offset = 0;
    buf.writeInt16LE(headr.type, offset); offset += 2;
    buf.writeInt16LE(headr.subtype, offset); offset += 2;
    buf.writeInt32LE(headr.msglen, offset); offset += 4;
    return buf;
};

export abstract class Message {
    toString(): string {
        let props = Object.getOwnPropertyNames(this);
        let rets = "|";
        for (let i in props) {
            if (typeof this[props[i]] === "function" || props[i] === "len")
                continue;
            rets = rets.concat(props[i], "=", this[props[i]], "|");
        }
        return rets;
    }

    abstract fromBuffer(buffer: Buffer): void;
    abstract toBuffer(): Buffer;
}