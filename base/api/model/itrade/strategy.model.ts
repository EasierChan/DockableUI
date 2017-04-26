/**
 * created by cl, date 2017/03/23
 */
"use strict";

import { Message, Header } from "./message.model";
import { BufferUtil } from "../app.model";

enum EStrategyStatus {
    STRATEGY_STATUS_INIT,
    STRATEGY_STATUS_CREATE,
    STRATEGY_STATUS_RUN,
    STRATEGY_STATUS_PAUSE,
    STRATEGY_STATUS_STOP,
    STRATEGY_STATUS_WATCH,
    STRATEGY_STATUS_ERROR
};

export class RegisterMessage extends Message {
    headers: Header[] = [];

    toBuffer(): Buffer {
        let buf = Buffer.alloc(this.headers.length * Header.len);
        let offset = 0;
        this.headers.forEach(header => {
            offset += header.toBuffer().copy(buf, offset);
        });

        return buf;
    }

    fromBuffer(buf: Buffer): void {
        return;
    }
}

// //ACK  2011
export class ComStrategyInfo extends Message {
    static readonly len = 84;
    key: number = 0;  // 4
    name: string = "";  // 50
    status: EStrategyStatus = 0;  // 1
    category: number = 0; // 4
    parent: number = 0;  // 4
    maxorderid: number = 0; // 4
    minorderid: number = 0; // 4
    orderidstep: number = 0; // 4
    currorderid: number = 0; // 4
    ismanualtrader: boolean = false;

    toBuffer(): Buffer {
        return null;
    }

    fromBuffer(buf: Buffer, offset = 0): number {
        // this.key = buf.readUInt32LE(offset); offset += 4;
        // this.name = buf.slice(offset, buf.indexOf(0, offset)).toString("utf-8"); offset += 50;
        // this.status = buf.readUInt8(offset); offset += 2;
        // this.category = buf.readUInt32LE(offset); offset += 4;
        // this.parent = buf.readUInt32LE(offset); offset += 4;
        // this.maxorderid = buf.readUInt32LE(offset); offset += 4;
        // this.minorderid = buf.readUInt32LE(offset); offset += 4;
        // this.orderidstep = buf.readUInt32LE(offset); offset += 4;
        // this.currorderid = buf.readUInt32LE(offset); offset += 4;
        // this.ismanualtrader = buf.readUInt8(offset) === 1 ? true : false;
        return BufferUtil.format(buf, offset, "1i50s1b1p6i1b3p", this);
    }
};

// //ASK  2047  ACK 2048
export class ComTotalProfitInfo extends Message {
    static readonly len = 104;
    strategyid: number = 0;  // 4
    account: number = 0; // 8
    totalpositionpnl: number = 0; // 8
    totaltodaypositionpnl: number = 0; // 8
    totallastpositionpnl: number = 0; // 8
    totaltradingpnl: number = 0; // 8
    totallasttradingfee: number = 0; // 8
    totaltradingfee: number = 0; // 8
    totalintradaytradingfee: number = 0; // 8
    totalpnl: number = 0; // 8
    totalposition: number = 0; // 8
    totaltodayposition: number = 0; // 8
    totalLastposition: number = 0; // 8

    toBuffer(): Buffer {
        return null;
    }

    fromBuffer(buf: Buffer, offset = 0): number {
        return BufferUtil.format(buf, offset, "1i4p1l11L", this);
    }
};

export class ComGuiAckStrategy extends Message {
    static readonly len = 24;

    strategyid: number = 0; // 4
    key: number = 0; // 4
    value: number = 0; // 8
    success: boolean = false;
    error: number = 0; // 4

    toBuffer(): Buffer {
        return null;
    }

    fromBuffer(buf: Buffer, offset = 0): number {
        return BufferUtil.format(buf, offset, "2i1L1B3p1I", this);
    }
}

export class ComStrategyCfg extends Message {
    static readonly len = 80;

    strategyid: number = 0; // 4
    key: number = 0;  // 4
    name: string = ""; // 50
    value: number = 0; // 8
    decimal: number = 0; // 1
    type: number = 0; // 1
    level: number = 0; // 1
    save: number = 0; // 1
    modify: number = 0; // 1
    dirty: number = 0; // 1

    toBuffer(): Buffer {
        let offset = 0;
        let buf = Buffer.alloc(ComStrategyCfg.len, 0);
        buf.writeUInt32LE(this.strategyid, offset); offset += 4;
        buf.writeUInt32LE(this.key, offset); offset += 4;
        buf.write(this.name, offset, this.name.length, "utf-8"); offset += 56;
        buf.writeIntLE(this.value, offset, 8); offset += 8;
        buf.writeInt8(this.decimal, offset); offset += 1;
        buf.writeInt8(this.type, offset); offset += 1;
        buf.writeInt8(this.level, offset); offset += 1;
        buf.writeInt8(this.save, offset); offset += 1;
        buf.writeInt8(this.modify, offset); offset += 1;
        buf.writeInt8(this.dirty, offset); offset += 1;
        return buf;
    }

    fromBuffer(buf: Buffer, offset = 0): number {
        return BufferUtil.format(buf, offset, "2i50s6p1L6B2p", this);
    }
};

export enum EOrderPriceType {
    ORDER_STATUS_TYPE_UNKNOWN,
    ORDER_STATUS_TYPE_ACTIVE,
    ORDER_STATUS_TYPE_PASSIVE
};

export enum EOrderStatus {
    ORDER_STATUS_INVALID,                         // 0:invalid status 无效
    ORDER_STATUS_INIT,                            // 1:init status 未报
    ORDER_STATUS_WAIT_SEND,                       // 2:待报
    ORDER_STATUS_SEND,                            // 3:已报
    ORDER_STATUS_SEND_WAIT_CANCEL,                // 4:已报待撤
    ORDER_STATUS_PART_WAIT_CANCEL,                // 5:部成待撤
    ORDER_STATUS_PART_CANCELED,                   // 6:部撤             end status
    ORDER_STATUS_CANCELED,                        // 7:已撤             end status
    ORDER_STATUS_PART_DEALED,                     // 8:部成
    ORDER_STATUS_DEALED,                          // 9:已成             end status
    ORDER_STATUS_DISCARDED                        // 10:废单            end status
};

export class TimeVal {
    tv_sec: number = 0;
    tv_usec: number = 0;
};

export class AlphaSignalInfo {
    id: number = 0; // 4
    value: number = 0; // 8
};

export class ComOrderData {
    strategyid: number = 0;  // 4
    algorid: number = 0;  // 4
    orderid: number = 0;  // 4
    algorindex: number = 0;  // 4
    innercode: number = 0;  // 4
    oprice: number = 0;  // 4
    ovolume: number = 0;  // 4
    action: number = 0;          // EOrderAction 1
    property: number = 0;        // EOrderProperty 1
    currency: number = 0;        // EOrderCurrency 1
    covered: number = 0;         // EOrderCoveredFlag 1
    iprice: number = 0;  // 4
    ivolume: number = 0;  // 4
    status: EOrderStatus = 0;
    odatetime: TimeVal = new TimeVal();
    idatetime: TimeVal = new TimeVal();
    signal: AlphaSignalInfo[] = new Array<AlphaSignalInfo>(4); // 4

    toBuffer(): Buffer {
        return null;
    }

    fromBuffer(buf: Buffer, offset: number): number {
        this.strategyid = buf.readUInt32LE(offset); offset += 4;
        this.algorid = buf.readUInt32LE(offset); offset += 4;
        this.orderid = buf.readUInt32LE(offset); offset += 4;
        this.algorindex = buf.readUInt32LE(offset); offset += 4;
        this.innercode = buf.readUInt32LE(offset); offset += 4;
        this.oprice = buf.readUInt32LE(offset); offset += 4;
        this.ovolume = buf.readUInt32LE(offset); offset += 4;
        this.action = buf.readUInt8(offset); offset += 1;
        this.property = buf.readUInt8(offset); offset += 1;
        this.currency = buf.readUInt8(offset); offset += 1;
        this.covered = buf.readUInt8(offset); offset += 1;
        this.iprice = buf.readUInt32LE(offset); offset += 4;
        this.ivolume = buf.readUInt32LE(offset); offset += 4;
        this.status = buf.readUInt8(offset); offset += 8;
        this.odatetime.tv_sec = buf.readUIntLE(offset, 8); offset += 8;
        this.odatetime.tv_usec = buf.readUIntLE(offset, 8); offset += 8;
        this.idatetime.tv_sec = buf.readUIntLE(offset, 8); offset += 8;
        this.idatetime.tv_usec = buf.readUIntLE(offset, 8); offset += 8;
        for (let j = 0; j < 4; ++j) {
            // this.signal[j] = new AlphaSignalInfo();
            this.signal[j].id = buf.readUInt32LE(offset); offset += 8;
            this.signal[j].value = buf.readUIntLE(offset, 8); offset += 8;
        }
        return offset;
    }
};

export class ComContract extends Message {
    contractid: number = 0; // 4
    account: number = 0; // 8
    orderaccount: string = ""; // 20
    tradeunit: string = ""; // 10
    tradeproto: string = ""; // 10

    toBuffer(): Buffer {
        return null;
    }

    fromBuffer(buf: Buffer, offset: number): number {
        this.contractid = buf.readUInt32LE(offset); offset += 8;
        this.account = buf.readUIntLE(offset, 8); offset += 8;
        this.orderaccount = buf.slice(offset, buf.indexOf(0, offset)).toString("utf-8"); offset += 20;
        this.tradeunit = buf.slice(offset, buf.indexOf(0, offset)).toString("utf-8"); offset += 10;
        this.tradeproto = buf.slice(offset, buf.indexOf(0, offset)).toString("utf-8"); offset += 10;
        return offset;
    }
};
// //ACK  2022
export class ComOrderRecord extends Message {
    poolindex: number = 0;  // 4
    poolpri: number = 0;  // 4
    datatype: number = 0;        // EOrderDataType
    secucategory: number = 0;    // SECU_CATEGORY 4
    donetype: EOrderPriceType = 0;
    cancel: boolean = false;
    con: ComContract = new ComContract();
    od: ComOrderData = new ComOrderData();

    toBuffer(): Buffer {
        return null;
    }

    fromBuffer(buf: Buffer, offset: number): number {
        this.poolindex = buf.readInt32LE(offset); offset += 4;
        this.poolpri = buf.readInt32LE(offset); offset += 4;
        this.datatype = buf.readUInt8(offset); offset += 4;
        this.secucategory = buf.readUInt32LE(offset); offset += 4;
        this.donetype = buf.readUInt8(offset); offset += 1;
        this.cancel = buf.readUInt8(offset) === 1 ? true : false; offset += 7;
        offset += this.con.fromBuffer(buf, offset);
        offset += this.od.fromBuffer(buf, offset);
        return offset;
    }
};

export enum ESSSecuCategory {
    SS_SECU_CATEGORY_UNKNOW,
    SS_SECU_CATEGORY_EQUIT,
    SS_SECU_CATEGORY_FUTURE
};

class FundPos extends Message {
    date: number = 0; // 4
    account: number = 0; // 8
    c: string = "";  // 1
    TotalAmount: number = 0; // 8
    AvlAmount: number = 0; // 8
    FrzAmount: number = 0; // 8

    toBuffer(): Buffer {
        return null;
    }

    fromBuffer(buf: Buffer, offset: number): number {
        this.date = buf.readUInt32LE(offset); offset += 8;
        this.account = buf.readUIntLE(offset, 8); offset += 8;
        this.c = buf.slice(offset, offset + 1).toString("utf-8"); offset += 8;
        this.TotalAmount = buf.readUIntLE(offset, 8); offset += 8;
        this.AvlAmount = buf.readUIntLE(offset, 8); offset += 8;
        this.FrzAmount = buf.readUIntLE(offset, 8); offset += 8;
        return offset;
    }
};

class MarginPos extends Message {
    date: number = 0; // 4
    account: number = 0; // 8
    c: string;  // 1
    TotalAmount: number = 0; // 8
    AvlAmount: number = 0; // 8
    FrzAmount: number = 0; // 8

    BuyFrzAmt: number = 0; // 8
    SellFrzAmt: number = 0; // 8
    BuyMargin: number = 0; // 8
    SellMargin: number = 0; // 8
    TotalMargin: number = 0; // 8
    Fee: number = 0; // 8
    PositionPL: number = 0; // 8
    ClosePL: number = 0; // 8
    PreFee: number = 0; // 8
    PreFundVal: number = 0; //  8     上日结存

    toBuffer(): Buffer {
        return null;
    }

    fromBuffer(buf: Buffer, offset: number): number {
        this.date = buf.readUInt32LE(offset); offset += 8;
        this.account = buf.readUIntLE(offset, 8); offset += 8;
        this.c = buf.slice(offset, offset + 1).toString("utf-8"); offset += 8;
        this.TotalAmount = buf.readUIntLE(offset, 8); offset += 8;
        this.AvlAmount = buf.readUIntLE(offset, 8); offset += 8;
        this.FrzAmount = buf.readUIntLE(offset, 8); offset += 8;

        this.BuyFrzAmt = buf.readUIntLE(offset, 8); offset += 8;
        this.SellFrzAmt = buf.readUIntLE(offset, 8); offset += 8;
        this.BuyMargin = buf.readUIntLE(offset, 8); offset += 8;
        this.SellFrzAmt = buf.readUIntLE(offset, 8); offset += 8;
        this.TotalMargin = buf.readUIntLE(offset, 8); offset += 8;
        this.Fee = buf.readUIntLE(offset, 8); offset += 8;
        this.PositionPL = buf.readUIntLE(offset, 8); offset += 8;
        this.ClosePL = buf.readUIntLE(offset, 8); offset += 8;
        this.PreFee = buf.readUIntLE(offset, 8); offset += 8;
        this.PreFundVal = buf.readUIntLE(offset, 8); offset += 8;
        return offset;
    }
};

export class ComAccountPos extends Message {
    market: number = 0;  // 4
    secucategory: number = 0;  // 1
    strategyid: number = 0; // 4
    record: MarginPos | FundPos;

    toBuffer(): Buffer {
        return null;
    }

    fromBuffer(buf: Buffer, offset: number): number {
        this.market = buf.readUInt32LE(offset); offset += 4;
        this.secucategory = buf.readUInt8(offset); offset += 4;
        this.strategyid = buf.readUInt32LE(offset); offset += 8;
        if (ESSSecuCategory.SS_SECU_CATEGORY_EQUIT === this.secucategory) {
            this.record = new FundPos();
        } else if (ESSSecuCategory.SS_SECU_CATEGORY_FUTURE === this.secucategory) {
            this.record = new MarginPos();
        }
        this.record.fromBuffer(buf, offset);
        offset += 80;
        return offset;
    }
}

class ComEquitPos extends Message {
    date: number = 0; // 4
    account: number = 0; // 8
    code: number = 0; // 4
    TotalVol: number = 0; // 8
    AvlVol: number = 0; // 8
    WorkingVol: number = 0; // 8
    TotalCost: number = 0; // 8
    AvlCreRedempVol: number = 0; // 8
    CovedFrzVol: number = 0; // 8
    type: number = 0;  // 4

    toBuffer(): Buffer {
        return null;
    }

    fromBuffer(buf: Buffer, offset: number): number {
        this.date = buf.readUInt32LE(offset); offset += 8;
        this.account = buf.readUIntLE(offset, 8); offset += 8;
        this.code = buf.readUInt32LE(offset); offset += 8;
        this.TotalVol = buf.readUIntLE(offset, 8); offset += 8;
        this.AvlVol = buf.readUIntLE(offset, 8); offset += 8;
        this.WorkingVol = buf.readUIntLE(offset, 8); offset += 8;
        this.TotalCost = buf.readUIntLE(offset, 8); offset += 8;
        this.AvlCreRedempVol = buf.readUIntLE(offset, 8); offset += 8;
        this.CovedFrzVol = buf.readUIntLE(offset, 8); offset += 8;
        this.type = buf.readUInt32LE(offset); offset += 16;
        return offset;
    }
};

class FuturePos extends Message {
    date: number = 0; // 4
    account: number = 0; // 8
    code: number = 0; // 4
    TotalVol: number = 0; // 8
    AvlVol: number = 0; // 8
    WorkingVol: number = 0; // 8
    TotalCost: number = 0; // 8
    MarginAveragePrice: number = 0; // 8
    AveragePrice: number = 0; // 8
    type: number = 0; // 4
    TodayOpen: number = 0; // 8

    toBuffer(): Buffer {
        return null;
    }

    fromBuffer(buf: Buffer, offset: number): number {
        this.date = buf.readUInt32LE(offset); offset += 8;
        this.account = buf.readUIntLE(offset, 8); offset += 8;
        this.code = buf.readUInt32LE(offset); offset += 8;
        this.TotalVol = buf.readUIntLE(offset, 8); offset += 8;
        this.AvlVol = buf.readUIntLE(offset, 8); offset += 8;
        this.WorkingVol = buf.readUIntLE(offset, 8); offset += 8;
        this.TotalCost = buf.readUIntLE(offset, 8); offset += 8;
        this.MarginAveragePrice = buf.readUIntLE(offset, 8); offset += 8;
        this.AveragePrice = buf.readUIntLE(offset, 8); offset += 8;
        this.type = buf.readUInt32LE(offset); offset += 8;
        this.TodayOpen = buf.readUIntLE(offset, 8); offset += 8;
        return offset;
    }
};

export class ComRecordPos extends Message {
    poolindex: number = 0;
    poolpri: number = 0;
    secucategory: number = 0;  // 1
    strategyid: number = 0;  // 4
    initpos: number = 0; // 8
    record: ComEquitPos | FuturePos;

    toBuffer(): Buffer {
        return null;
    }

    fromBuffer(buf: Buffer, offset: number): number {
        this.poolindex = buf.readUInt32LE(offset); offset += 4;
        this.poolpri = buf.readUInt32LE(offset); offset += 4;
        this.secucategory = buf.readUInt8(offset); offset += 4;
        this.strategyid = buf.readUInt32LE(offset); offset += 4;
        this.initpos = buf.readUIntLE(offset, 8); offset += 8;
        if (ESSSecuCategory.SS_SECU_CATEGORY_EQUIT === this.secucategory) {
            this.record = new ComEquitPos();

        } else if (ESSSecuCategory.SS_SECU_CATEGORY_FUTURE === this.secucategory) {
            this.record = new FuturePos();
        } else {
            console.error(`unknown secucategory = ${this.secucategory}`);
        }
        return this.record.fromBuffer(buf, offset);
    }
}

export class ComGWNetGuiInfo extends Message {
    key: number = 0; // 4
    name: string = ""; // 50
    connected: boolean = false;

    toBuffer(): Buffer {
        return null;
    }

    fromBuffer(buf: Buffer, offset: number): number {
        this.key = buf.readUInt32LE(offset); offset += 4;
        this.name = buf.slice(offset, buf.indexOf(0, offset)).toString("utf-8"); offset += 50;
        this.connected = buf.readUInt8(offset) === 0 ? false : true; offset += 2;
        return offset;
    }
}

export class StatArbOrder extends Message {
    strategyid: number = 0;   // UINT 4
    code: number = 0; // UINT 4
    pricerate: number = 0;  // INT 4
    position: number = 0; // INT64 8
    quantity: number = 0; // INT64 8
    amount: number = 0; // INT64 8
    diffQty: number = 0; // INT64 8

    toBuffer(): Buffer {
        return null;
    }

    fromBuffer(buf: Buffer, offset: number): number {
        this.strategyid = buf.readUInt32LE(offset); offset += 4;
        this.code = buf.readUInt32LE(offset); offset += 4;
        this.pricerate = buf.readInt32LE(offset); offset += 8;
        this.position = buf.readIntLE(offset, 8); offset += 8;
        this.quantity = buf.readIntLE(offset, 8); offset += 8;
        this.amount = buf.readIntLE(offset, 8); offset += 8;
        this.diffQty = buf.readIntLE(offset, 8); offset += 8;
        return offset;
    }
}

class ComOrderStatus extends Message {
    strategyid: number = 0; // 4
    algorid: number = 0; // 4
    orderid: number = 0; // 4
    algorindex: number = 0; // 4
    innercode: number = 0; // 4
    action: number = 0; // EOrderAction 1
    price: number = 0; // 4
    quantity: number = 0; // 4
    datetime: TimeVal = new TimeVal();
    ordertype: number = 0;        // EOrderPriceType 1
    tradetype: number = 0;         // EOrderTradeType 1
    // status: EOrderStatusGW | EOrderStatus;
    status: EOrderStatus = 0;

    toBuffer(): Buffer {
        return null;
    }

    fromBuffer(buf: Buffer, offset: number): number {
        this.strategyid = buf.readUInt32LE(offset); offset += 4;
        this.algorid = buf.readUInt32LE(offset); offset += 4;
        this.orderid = buf.readUInt32LE(offset); offset += 4;
        this.algorindex = buf.readUInt32LE(offset); offset += 4;
        this.innercode = buf.readUInt32LE(offset); offset += 4;
        this.action = buf.readUInt8(offset); offset += 4;
        this.price = buf.readUInt32LE(offset); offset += 4;
        this.quantity = buf.readUInt32LE(offset); offset += 4;
        this.datetime.tv_sec = buf.readIntLE(offset, 8); offset += 8;
        this.datetime.tv_usec = buf.readUIntLE(offset, 8); offset += 8;
        this.ordertype = buf.readUInt8(offset); offset += 1;
        this.tradetype = buf.readUInt8(offset); offset += 1;
        this.status = buf.readUInt8(offset); offset += 1;
        offset += 5;
        return offset;
    }
};

export class ComConOrderStatus extends Message {
    valid: number = 0;  // 1
    con: ComContract = new ComContract();
    os: ComOrderStatus = new ComOrderStatus();

    toBuffer(): Buffer {
        return null;
    }

    fromBuffer(buf: Buffer, offset: number): number {
        this.valid = buf.readUInt8(offset); offset += 8;
        offset += this.con.fromBuffer(buf, offset);
        offset += this.os.fromBuffer(buf, offset);
        return offset;
    }
}

class ComOrderErrorInfo extends Message {
    strategyid: number = 0;  // 4
    algorid: number = 0;  // 4
    orderid: number = 0;  // 4
    algorindex: number = 0;  // 4
    innercode: number = 0;  // 4
    action: number = 0; // EOrderAction 1
    errorid: number = 0;  // 4
    errormsg: string = ""; // 1024
    datetime: TimeVal = new TimeVal();

    toBuffer(): Buffer {
        return null;
    }

    fromBuffer(buf: Buffer, offset: number): number {
        this.strategyid = buf.readUInt32LE(offset); offset += 4;
        this.algorid = buf.readUInt32LE(offset); offset += 4;
        this.orderid = buf.readUInt32LE(offset); offset += 4;
        this.algorindex = buf.readUInt32LE(offset); offset += 4;
        this.innercode = buf.readUInt32LE(offset); offset += 4;
        this.action = buf.readUInt8(offset); offset += 4;
        this.errorid = buf.readUInt32LE(offset); offset += 4;
        this.errormsg = buf.slice(offset, buf.indexOf(0, offset)).toString("utf-8");
        offset += 1028;
        this.datetime.tv_sec = buf.readUIntLE(offset, 8); offset += 8;
        this.datetime.tv_usec = buf.readUIntLE(offset, 8); offset += 8;
        return offset;
    }
}

export class ComConOrderErrorInfo extends Message {
    con: ComContract = new ComContract();
    os: ComOrderErrorInfo = new ComOrderErrorInfo();

    toBuffer(): Buffer {
        return null;
    }

    fromBuffer(buf: Buffer, offset: number): number {
        offset += this.con.fromBuffer(buf, offset);
        offset += this.os.fromBuffer(buf, offset);
        return offset;
    }
}