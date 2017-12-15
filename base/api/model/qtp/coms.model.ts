
import { Message, BufferUtil } from "../app.model";

export class FundInfoMessage extends Message {
    static readonly len = 84;
    key: number = 0;  // 4
    name: string = "";  // 50
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
        return BufferUtil.format(buf, offset, "1i50s1b1p6i1b3p", this);
    }
};