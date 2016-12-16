"use strict";


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
        for (let i in props) {
            if (typeof this[props[i]] === "function" || props[i] === "len")
                continue;
            rets = rets.concat(props[i], "=", this[props[i]], "|");
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

export class DepthMarketData extends Message implements BufferDecoder {
    static len: number = 128;
    type: number;
    UKey: number;
    LastPrice: number;
    PreClosePrice: number;
    PreSettlePrice: number;
    OpenPrice: number;
    HighestPrice: number;
    LowestPrice: number;
    Volume: number;
    VolumeGap: number;
    Time: number;
    BidPrice: number;
    BidVolume: number;
    AskPrice: number;
    AskVolume: number;
    InstrumentID: string;

    fromBuffer(buffer: Buffer): void {
        if (buffer.length < DepthMarketData.len) {
            console.error("MarketDataMsg::fromBuffer error");
            return;
        }

        let offset = 0;
        this.type       = buffer.readInt32LE(offset); offset += 4;
        this.UKey       = buffer.readInt32LE(offset); offset += 4;
        this.LastPrice  = buffer.readIntLE(offset, 8); offset += 8;
        this.PreClosePrice  = buffer.readIntLE(offset, 8); offset += 8;
        this.PreSettlePrice = buffer.readIntLE(offset, 8); offset += 8;
        this.OpenPrice      = buffer.readIntLE(offset, 8); offset += 8;
        this.HighestPrice   = buffer.readIntLE(offset, 8); offset += 8;
        this.LowestPrice    = buffer.readIntLE(offset, 8); offset += 8;
        this.Volume         = buffer.readInt32LE(offset); offset += 4;
        this.VolumeGap      = buffer.readInt32LE(offset); offset += 4;
        this.Time           = buffer.readIntLE(offset, 8); offset += 8;
        this.BidPrice       = buffer.readIntLE(offset, 8); offset += 8;
        this.BidVolume      = buffer.readIntLE(offset, 4); offset += 4;
        this.AskPrice       = buffer.readIntLE(offset, 8); offset += 8;
        this.AskVolume      = buffer.readInt32LE(offset); offset += 4;
        this.InstrumentID   = buffer.toString("utf-8", offset);
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
    PS_MSG_TYPE_IOPV_R = 1004,


    MSG_TYPE_CODETABLE = 6,
    MSG_TYPE_TRANSACTION_EX = 1105,
    MSG_TYPE_MARKETDATA = 1102,
    MSG_TYPE_MARKETDATA_FUTURES = 1106,
    MSG_TYPE_UPDATE_DATE = 1118,
    MSG_TYPE_FUTURES = 100
}