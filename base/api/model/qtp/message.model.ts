/**
 * created by chenlei, 2017/04/27
 */
"use strict";

import { Message } from "../app.model";

export class Header extends Message {
    static len = 12;
    version: number = 0;
    service: number = 0;
    msgtype: number = 0;
    topic: number = 0;
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
    body: string | Buffer;
    private options: QtpMessageOption[] = [];

    fromBuffer(buf: Buffer, offset = 0): number {
        let optlen = this.header.optslen;
        while (optlen > 0) {
            let option = new QtpMessageOption();
            offset = option.fromBuffer(buf, offset);
            this.options.push(option);
            optlen -= option.len + 4;
        }

        this.body = Buffer.from(buf.slice(offset, offset + this.header.datalen));
        offset += this.header.datalen;
        return offset;
    }

    toBuffer(): Buffer {
        let offset = 0;
        this.header.datalen = this.body.length;
        let buf = Buffer.alloc(Header.len + this.header.optslen + this.header.datalen);
        this.header.toBuffer().copy(buf, offset);
        offset += Header.len;

        this.options.forEach((option) => {
            option.toBuffer().copy(buf, offset);
            offset += option.len + 4;
        });

        if (typeof this.body === "string")
            Buffer.from(this.body as string).copy(buf, offset);
        else
            (this.body as Buffer).copy(buf, offset);

        return buf;
    }

    addOption(option: QtpMessageOption): void {
        option.len = option.value.length;
        this.header.optslen += option.len;
        this.options.push(option);
    }
}

class QtpMessageOption {
    id: number; // uint_16
    len: number; // uint_16
    value: string; // string

    toBuffer(): Buffer {
        let buf = Buffer.alloc(4 + this.len);
        buf.writeUInt16LE(this.id, 0);
        buf.writeUInt16LE(this.len, 2);
        buf.write(this.value, 4);
        return buf;
    }

    fromBuffer(buf: Buffer, offset = 0): number {
        this.id = buf.readUInt16LE(offset); offset += 2;
        this.len = buf.readUInt16LE(offset); offset += 2;
        this.value = buf.slice(offset, this.len).toString(); offset += this.len;
        return offset;
    }
}