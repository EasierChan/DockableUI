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

export class MsgUpdateDate extends Message {
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

    toBuffer(): Buffer {
        let buf: Buffer = Buffer.alloc(MsgUpdateDate.len);
        let offset = 0;
        buf.writeInt32LE(this.type, offset); offset += 4;
        buf.writeInt32LE(this.market, offset); offset += 4;
        buf.writeInt32LE(this.oldDate, offset); offset += 4;
        buf.writeInt32LE(this.newDate, offset); offset += 4;
        buf.writeInt32LE(this.seqNum, offset); offset += 4;
        return buf;
    }
}

export class MsgBidAskIOPV extends Message {
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
        this.bidIOPV = buffer.readIntLE(offset, 8); offset += 8;
        this.askIOPV = buffer.readIntLE(offset, 8); offset += 8;
        this.seqNum = buffer.readInt32LE(offset); offset += 4;
    }

    toBuffer(): Buffer {
        let buf: Buffer = Buffer.alloc(MsgBidAskIOPV.len);
        let offset = 0;
        buf.writeInt32LE(this.type, offset); offset += 4;
        buf.writeInt32LE(this.innerCode, offset); offset += 4;
        buf.writeInt32LE(this.time, offset); offset += 4;
        buf.writeIntLE(this.bidIOPV, offset, 8); offset += 8;
        buf.writeIntLE(this.askIOPV, offset, 8); offset += 8;
        buf.writeInt32LE(this.seqNum, offset); offset += 4;
        return buf;
    }
}

export class DepthMarketData extends Message {
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
        this.type = buffer.readInt32LE(offset); offset += 4;
        this.UKey = buffer.readInt32LE(offset); offset += 4;
        this.LastPrice = buffer.readIntLE(offset, 8); offset += 8;
        this.PreClosePrice = buffer.readIntLE(offset, 8); offset += 8;
        this.PreSettlePrice = buffer.readIntLE(offset, 8); offset += 8;
        this.OpenPrice = buffer.readIntLE(offset, 8); offset += 8;
        this.HighestPrice = buffer.readIntLE(offset, 8); offset += 8;
        this.LowestPrice = buffer.readIntLE(offset, 8); offset += 8;
        this.Volume = buffer.readInt32LE(offset); offset += 4;
        this.VolumeGap = buffer.readInt32LE(offset); offset += 4;
        this.Time = buffer.readIntLE(offset, 8); offset += 8;
        this.BidPrice = buffer.readIntLE(offset, 8); offset += 8;
        this.BidVolume = buffer.readIntLE(offset, 4); offset += 4;
        this.AskPrice = buffer.readIntLE(offset, 8); offset += 8;
        this.AskVolume = buffer.readInt32LE(offset); offset += 4;
        this.InstrumentID = buffer.toString("utf-8", offset, offset + 32);
    }

    toBuffer(): Buffer {
        let buf: Buffer = Buffer.alloc(MsgBidAskIOPV.len);
        let offset = 0;
        buf.writeInt32LE(this.type, offset); offset += 4;
        buf.writeInt32LE(this.UKey, offset); offset += 4;
        buf.writeIntLE(this.LastPrice, offset, 8); offset += 8;
        buf.writeIntLE(this.PreClosePrice, offset, 8); offset += 8;
        buf.writeIntLE(this.PreSettlePrice, offset, 8); offset += 8;
        buf.writeIntLE(this.OpenPrice, offset, 8); offset += 8;
        buf.writeIntLE(this.HighestPrice, offset, 8); offset += 8;
        buf.writeIntLE(this.LowestPrice, offset, 8); offset += 8;
        buf.writeInt32LE(this.Volume, offset); offset += 4;
        buf.writeInt32LE(this.VolumeGap, offset); offset += 4;
        buf.writeIntLE(this.Time, offset, 8); offset += 8;
        buf.writeIntLE(this.BidPrice, offset, 8); offset += 8;
        buf.writeIntLE(this.BidVolume, offset, 4); offset += 4;
        buf.writeIntLE(this.AskPrice, offset, 8); offset += 8;
        buf.writeInt32LE(this.AskVolume, offset); offset += 4;
        buf.write(this.InstrumentID, offset, 32, "utf-8");
        return buf;
    }
}

export class SZSnapshotMsg extends Message {
    static len: number = 296;
    securityID: string;
    type: number = MsgType.MSG_TYPE_SZ_SNAPSHOT;
    market: number;
    category: number;
    ukey: number;
    date: number;
    time: number;
    marketstatus: number;
    securitystatus: number;
    preclose: number;
    open: number;
    high: number;
    low: number;
    numtrades: number;
    match: number;
    volume: number;
    volumegap: number;
    turnover: number;
    totalbidvol: number;
    totalaskvol: number;
    highlimited: number;
    lowlimited: number;
    // abdetail: SZSAABDetail
    asklevel: number;
    bidlevel: number;
    askprices: number[];
    askvols: number[];
    bidprices: number[];
    bidvols: number[];

    fromBuffer(buffer: Buffer): void {
        if (buffer.length < DepthMarketData.len) {
            console.error("MarketDataMsg::fromBuffer error");
            return;
        }

        let offset = 0;
        this.type = buffer.readInt32LE(offset); offset += 4;
        this.market = buffer.readInt32LE(offset); offset += 4;
        this.category = buffer.readInt32LE(offset); offset += 4;
        this.ukey = buffer.readInt32LE(offset); offset += 4;
        this.date = buffer.readInt32LE(offset); offset += 4;
        this.time = buffer.readInt32LE(offset); offset += 4;
        this.marketstatus = buffer.readInt32LE(offset); offset += 4;
        this.securitystatus = buffer.readInt32LE(offset); offset += 4;
        this.preclose = buffer.readIntLE(offset, 8); offset += 8;
        this.open = buffer.readIntLE(offset, 8); offset += 8;
        this.high = buffer.readIntLE(offset, 8); offset += 8;
        this.low = buffer.readIntLE(offset, 8); offset += 8;
        this.numtrades = buffer.readIntLE(offset, 8); offset += 8;
        this.match = buffer.readIntLE(offset, 8); offset += 8;
        this.volume = buffer.readIntLE(offset, 8); offset += 8;
        this.volumegap = buffer.readIntLE(offset, 8); offset += 8;
        this.turnover = buffer.readIntLE(offset, 8); offset += 8;
        this.totalbidvol = buffer.readIntLE(offset, 8); offset += 8;
        this.totalaskvol = buffer.readIntLE(offset, 8); offset += 8;
        this.highlimited = buffer.readUInt32LE(offset); offset += 4;
        this.lowlimited = buffer.readUInt32LE(offset); offset += 4;
        // SZSABDetail
        this.asklevel = buffer.readUInt32LE(offset); offset += 4;
        this.askprices = new Array<number>(this.asklevel);
        this.askvols = new Array<number>(this.asklevel);

        this.bidlevel = buffer.readUInt32LE(offset); offset += 4;
        this.bidprices = new Array<number>(this.bidlevel);
        this.bidvols = new Array<number>(this.bidlevel);

        for (let i = 0; i < this.asklevel; ++i) {
            this.askprices[i] = buffer.readUInt32LE(offset); offset += 4;
        }

        for (let i = 0; i < this.asklevel; ++i) {
            this.askvols[i] = buffer.readUInt32LE(offset); offset += 4;
        }

        for (let i = 0; i < this.bidlevel; ++i) {
            this.bidprices[i] = buffer.readUInt32LE(offset); offset += 4;
        }

        for (let i = 0; i < this.bidlevel; ++i) {
            this.bidvols[i] = buffer.readUInt32LE(offset); offset += 4;
        }
    }

    toBuffer(): Buffer {
        return null;
    }
}