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