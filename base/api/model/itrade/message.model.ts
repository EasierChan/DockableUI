'use strict';


const UNIT_PER_YUAN: number = 10000.0;
/**
 * 
 */
export interface MSGHEADER {
    type: number;
    subtype: number;
    msglen: number;
}

export class MsgInnerCode {
    static len: number = 4;
    innerCode: number;
}

export class Message {

    toString(): string {
        let props = Object.getOwnPropertyNames(this);
        let rets = "|";
        for (var i in props) {
            if (typeof this[props[i]] == 'function' || props[i] == "len")
                continue;
            rets = rets.concat(props[i], '=', this[props[i]], '|');
        }
        return rets;
    }
}

export interface BufferDecoder {
    fromBuffer(buffer: Buffer): void;
}

export class MsgUpdateDate extends Message implements BufferDecoder {
    static len: number = 20;
    type: number;
    market: number;
    oldDate: number;
    newDate: number;
    seqNum: number;

    fromBuffer(buffer: Buffer): void {
        if (buffer.length < MsgUpdateDate.len) {
            console.error("MsgUpdateDate::fromBuffer error");
            return;
        }

        let offset = 0;
        this.type = buffer.readInt32LE(offset); offset += 4;
        this.market = buffer.readInt32LE(offset); offset += 4;
        this.oldDate = buffer.readInt32LE(offset); offset += 4;
        this.newDate = buffer.readInt32LE(offset); offset += 4;
        this.seqNum = buffer.readInt32LE(offset); offset += 4;
    }
}

export class MsgBidAskIOPV extends Message implements BufferDecoder {
    static len: number = 32;
    type: number;
    innerCode: number;
    time: number;
    bidIOPV: number;
    askIOPV: number;
    seqNum: number;

    fromBuffer(buffer: Buffer): void {
        if (buffer.length < MsgBidAskIOPV.len) {
            console.error("MsgBidAskIOPV::fromBuffer error");
            return;
        }

        let offset = 0;
        this.type = buffer.readInt32LE(offset); offset += 4;
        this.innerCode = buffer.readInt32LE(offset); offset += 4;
        this.time = buffer.readInt32LE(offset); offset += 4;
        this.bidIOPV = buffer.readInt32LE(offset); offset += 8;
        this.askIOPV = buffer.readInt32LE(offset); offset += 8;
        this.seqNum = buffer.readInt32LE(offset); offset += 4;
    }
}

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
    PS_MSG_TYPE_IOPV_R = 1004
}