"use strict";

export interface IApp {
    id: string;
    name: string;
    desc: string;
    category: string;
    version?: string;
    author?: string;
}

export class UserProfile {
    username: any;
    password: string;
    roles: string[];
    apps: string[];
}

export class BasketPCF {
    params: any = {};
    components: { code: string, amount: number, cash_rep: number, rep_codes: { code: string, amount: number }[] }[] = [];

    toText(): string {
        let text: string = "[Parameters]\n";
        for (let prop in this.params) {
            text += `${prop}=${this.params[prop]}\n`;
        }

        text += "[Components]\n";
        this.components.forEach(item => {
            text += [item.code, item.amount, item.cash_rep].join(",");

            if (item.rep_codes) {
                item.rep_codes.forEach(rep => {
                    text += "," + [rep.code, rep.amount].join(",");
                });
            }

            text += "\n";
        });

        return text;
    }
}

export abstract class Message {
    toString(): string {
        let props = Object.getOwnPropertyNames(this);
        let rets = "|";
        for (let i in props) {
            if ((typeof this[props[i]] === "function") || (typeof this[props[i]] === "undefined") || props[i] === "len")
                continue;
            rets = rets.concat(props[i], "=", this[props[i]], "|");
        }
        return rets;
    }

    abstract fromBuffer(buffer: Buffer, offset: number): number;
    abstract toBuffer(): Buffer;
}

export class BufferUtil {
    /**
     * @desc
     * according to fmt string, parse the buffer into Message.
     * i - integer
     * c - string
     * u - unsigned
     * f - float
     * d - double
     * p - padding
     * @param buf  source buffer.
     * @param fmt a format string.
     */
    static format(buf: Buffer, offset: number, fmt: string, msg: any): number {
        let props = Object.getOwnPropertyNames(msg);
        let marr = fmt.match(/\d+[bBwWiIlLspfd]/g);
        let len = 0;
        let iprop = 0;
        marr.forEach(item => {
            len = parseInt(item.substr(0, item.length - 1));

            switch (item[item.length - 1]) {
                case "b":
                    for (; len > 0; --len) {
                        msg[props[iprop++]] = buf.readUInt8(offset);
                        offset += 1;
                    }
                    break;
                case "w":
                    for (; len > 0; --len) {
                        msg[props[iprop++]] = buf.readUInt16LE(offset);
                        offset += 2;
                    }
                    break;
                case "i":
                    for (; len > 0; --len) {
                        msg[props[iprop++]] = buf.readUInt32LE(offset);
                        offset += 4;
                    }
                    break;
                case "l":
                    for (; len > 0; --len) {
                        msg[props[iprop++]] = BufferUtil.readInt64LE(buf, offset);
                        offset += 8;
                    }
                    break;
                case "B":
                    for (; len > 0; --len) {
                        msg[props[iprop++]] = buf.readInt8(offset);
                        offset += 1;
                    }
                    break;
                case "W":
                    for (; len > 0; --len) {
                        msg[props[iprop++]] = buf.readInt16LE(offset);
                        offset += 2;
                    }
                    break;
                case "I":
                    for (; len > 0; --len) {
                        msg[props[iprop++]] = buf.readInt32LE(offset);
                        offset += 4;
                    }
                    break;
                case "L":
                    for (; len > 0; --len) {
                        msg[props[iprop++]] = BufferUtil.readInt64LE(buf, offset);
                        offset += 8;
                    }
                    break;
                case "s":
                    msg[props[iprop++]] = buf.toString("utf-8", offset, buf.indexOf(0, offset));
                    offset += len;
                    break;
                case "p":
                    offset += len;
                    break;
                case "f":
                    for (; len > 0; --len) {
                        msg[props[iprop++]] = buf.readFloatLE(offset);
                        offset += 4;
                    }
                    break;
                case "d":
                    for (; len > 0; --len) {
                        msg[props[iprop++]] = buf.readDoubleLE(offset);
                        offset += 8;
                    }
                    break;
                default:
                    console.error(`unknown format identifier ${item}`);
                    return -1;
            }
        });

        return offset;
    }

    static readInt64LE(buffer: Buffer, offset: number): any {
        let low: number = buffer.readInt32LE(offset); offset += 4;
        let n: number = buffer.readInt32LE(offset) * 4294967296 + low; offset += 4;
        if (low < 0) n += 4294967296;
        return n;
    }
}