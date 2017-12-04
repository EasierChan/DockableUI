/**
 * created by chenlei, 2017/04/27
 */
"use strict";

import { Message } from "../app.model";

export class Header extends Message {
    static len = 12;
    version: number = 0x1;
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
    body: String | Buffer;
    options: QtpMessageOption[] = [];

    fromBuffer(buf: Buffer, offset = 0): number {
        let optlen = this.header.optslen;
        while (optlen > 0) {
            let option = new QtpMessageOption();
            offset = option.fromBuffer(buf, offset);
            this.options.push(option);
            optlen -= option.len + 4;
        }

        if (this.header.datalen > 0) {
            this.body = Buffer.from(buf.slice(offset, offset + this.header.datalen));
            offset += this.header.datalen;
        }

        return offset;
    }

    toBuffer(): Buffer {
        let offset = 0;
        let bodyBuf: Buffer;

        if (this.body) {
            if (typeof this.body === "string")
                bodyBuf = Buffer.from(this.body as string);
            else
                bodyBuf = (this.body as Buffer);

            this.header.datalen = bodyBuf.byteLength;
        }

        let buf = Buffer.alloc(Header.len + this.header.optslen + this.header.datalen);
        this.header.toBuffer().copy(buf, offset);
        offset += Header.len;

        this.options.forEach((option) => {
            option.toBuffer().copy(buf, offset);
            offset += option.len + 4;
        });

        if (this.body)
            bodyBuf.copy(buf, offset);

        return buf;
    }

    addOption(option: QtpMessageOption): void {
        option.len = option.value.byteLength;
        this.header.optslen += option.len + 4;
        this.options.push(option);
    }
}

export class QtpMessageOption {
    id: number; // uint_16
    len: number; // uint_16
    value: Buffer; // string

    toBuffer(): Buffer {
        let buf = Buffer.alloc(4 + this.len);
        buf.writeUInt16LE(this.id, 0);
        buf.writeUInt16LE(this.len, 2);
        this.value.copy(buf, 4);
        return buf;
    }

    fromBuffer(buf: Buffer, offset = 0): number {
        this.id = buf.readUInt16LE(offset); offset += 2;
        this.len = buf.readUInt16LE(offset); offset += 2;
        this.value = buf.slice(offset, offset + this.len); offset += this.len;
        return offset;
    }
}

export enum OptionType {
    kItemSize = 59901,
    kItemCnt = 59902,
    kInstanceID = 59903,
    kSessionID = 59904,
    kSubscribeKey = 59905
}

export enum FGS_MSG {
    kFGSAns = 100,
    kLogin = 101,
    kLoginAns = 102,
    kSubscribe = 105,
    kUnSubscribe = 106,
    kPublish = 107,
    kComboSubscribe = 108,
    kComboUnsubscribe = 109,
    kComboPublish = 100
}

export enum ServiceType {
    kFGS = 0,
    kLogin = 10,
    kStrategy = 20,
    kSSGW = 21,
    kCOMS = 30,
    kCMS = 40,
    kSDS = 50,
    kBackServer = 60,
    kSimServer = 61
}