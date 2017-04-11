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