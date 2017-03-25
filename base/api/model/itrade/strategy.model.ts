/**
 * created by cl, date 2017/03/23
 */
"use strict";

import { Message, Header } from "./message.model";

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
    key: number;  // 4
    name: string;  // 50
    status: number;  // 4
    category: number; // 4
    parent: number;  // 4
    maxorderid: number; // 4
    minorderid: number; // 4
    orderidstep: number; // 4
    currorderid: number; // 4
    ismanualtrader: boolean;

    toBuffer(): Buffer {
        return null;
    }

    fromBuffer(buf: Buffer, offset = 0): number {
        this.key = buf.readUInt32LE(offset); offset += 4;
        this.name = buf.slice(offset, buf.indexOf(0, offset)).toString("utf-8"); offset += 50;
        this.status = buf.readUInt8(offset); offset += 2;
        this.category = buf.readUInt32LE(offset); offset += 4;
        this.parent = buf.readUInt32LE(offset); offset += 4;
        this.maxorderid = buf.readUInt32LE(offset); offset += 4;
        this.minorderid = buf.readUInt32LE(offset); offset += 4;
        this.orderidstep = buf.readUInt32LE(offset); offset += 4;
        this.currorderid = buf.readUInt32LE(offset); offset += 4;
        this.ismanualtrader = buf.readUInt8(offset) === 1 ? true : false;
        return offset;
    }
};