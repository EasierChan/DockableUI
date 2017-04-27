/**
 * created by chenlei, 2017/04/27
 */
"use strict";

import { Message } from "../app.model";
const logger = console;

export class Header extends Message {
    static len = 12;
    version: number = 0;
    service: number = 0;
    msgtype: number = 0;
    topic: number   = 0;
    optslen: number = 0;
    datalen: number = 0;

    toBuffer(): Buffer {
        let buf = Buffer.alloc(Header.len, 0);
        let offset = 0;
        buf.writeUInt8(this.version, offset), offset += 1;
        buf.writeUInt8(this.service, offset), offset += 1;
        buf.writeUInt16LE(this.msgtype, offset), offset += 2;
        buf.writeUInt16LE(this.topic, offset); offset += 2;
        buf.writeUInt16LE(this.optslen, offset); offset += 2;
        buf.writeUInt32LE(this.datalen, offset); offset += 4;
        return buf;
    }

    fromBuffer(buf: Buffer, offset: number): number {
        this.version = buf.readUInt8(offset), offset += 1;
        this.service = buf.readUInt8(offset), offset += 1;
        this.msgtype = buf.readUInt16LE(offset), offset += 2;
        this.topic = buf.readUInt16LE(offset), offset += 2;
        this.optslen = buf.readUInt16LE(offset), offset += 2;
        this.datalen = buf.readUInt32LE(offset), offset += 4;
        return offset;
    }
}

export class QTPMessage extends Message {
    header: Header = new Header();
    body: Object;

    fromBuffer(buf: Buffer, offset = 0): number {
        this.body = JSON.parse(buf.slice(offset, this.header.datalen + offset).toString());
        offset += this.header.datalen;
        return offset;
    }

    toBuffer(): Buffer {
        return null;
    }
}