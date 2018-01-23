"use strict";

import { ComConOrder, ComOrder, ComOrderCancel, EOrderType, ComContract } from "../../../base/api/model/itrade/orderstruct";
import { OrderService } from "../../../base/api/services/orderService";

export class ManulTrader {
    private static orderService = new OrderService();
    // private static secuinfo = new SecuMasterService();
    static submitOrder(...orders: ComConOrder[]): void {
        let offset: number = 0;
        // handle with array
        let mem_size: number = 176;
        let length = orders.length;
        let msg_length = 4 + length * mem_size;

        let buffer = new Buffer(msg_length);
        // orders's length
        buffer.writeInt32LE(length, offset);
        offset += 4;

        for (let i = 0; i < length; ++i) {
            buffer.writeUInt32LE(orders[i].ordertype, offset);
            offset += 8;

            buffer.writeUInt32LE(orders[i].con.contractid, offset);
            offset += 8;
            ManulTrader.writeUInt64LE(buffer, orders[i].con.account, offset);
            offset += 8;

            buffer.write(orders[i].con.orderaccount, offset, 20);
            offset += 20;
            buffer.write(orders[i].con.tradeunit, offset, 10);
            offset += 10;
            buffer.write(orders[i].con.tradeproto, offset, 10);
            offset += 10;

            // datetime timeval
            buffer.writeUIntLE(0, offset, 8);
            offset += 8;
            buffer.writeUIntLE(0, offset, 8);
            offset += 8;

            // data ComOrder
            let comorder_data = orders[i].data as ComOrder;

            buffer.writeUInt32LE(comorder_data.strategyid, offset);
            offset += 4;
            buffer.writeUInt32LE(comorder_data.algorid, offset);
            offset += 4;
            buffer.writeUInt32LE(comorder_data.orderid, offset);
            offset += 4;
            buffer.writeUInt32LE(comorder_data.algorindex, offset);
            offset += 4;
            buffer.writeUInt32LE(comorder_data.innercode, offset);
            offset += 4;
            buffer.writeUInt32LE(comorder_data.price, offset);
            offset += 4;
            buffer.writeUInt32LE(comorder_data.quantity, offset);
            offset += 4;

            buffer.writeIntLE(comorder_data.action, offset, 1);
            offset += 1;
            buffer.writeIntLE(comorder_data.property, offset, 1);
            offset += 1;
            buffer.writeIntLE(comorder_data.currency, offset, 1);
            offset += 1;
            buffer.writeIntLE(comorder_data.covered, offset, 1);
            offset += 1;

            for (let j = 0; j < 4; ++j) {
                buffer.writeUInt32LE(comorder_data.signal[j].id, offset);
                offset += 8;
                ManulTrader.writeUInt64LE(buffer, comorder_data.signal[j].value, offset);
                offset += 8;
            }
            offset += mem_size;
        }
        ManulTrader.orderService.sendOrder(2020, 0, buffer);
    }

    static submitPara(data: any) {
        //  console.log("+++++++", data);
        let offset: number = 0;
        let mem_size: number = 80;
        let length = data.length;
        let msg_length = 4 + length * mem_size;
        let buffer = new Buffer(msg_length);
        buffer.writeInt32LE(length, offset); offset += 4;

        for (let i = 0; i < length; ++i) {
            buffer.writeUInt32LE(data[i].strategyid, offset); offset += 4;
            buffer.writeUInt32LE(data[i].key, offset); offset += 4;
            buffer.write("", offset, 50); offset += 56;
            buffer.writeIntLE(data[i].value, offset, 8); offset += 8;
            buffer.writeIntLE(0, offset, 1); offset += 1;
            buffer.writeIntLE(data[i].type, offset, 1); offset += 1;
            buffer.writeIntLE(0, offset, 1); offset += 1;
            buffer.writeIntLE(0, offset, 1); offset += 1;
            buffer.writeIntLE(0, offset, 1); offset += 1;
            buffer.writeIntLE(0, offset, 1); offset += 1;
            offset += 2;
        }
        ManulTrader.orderService.sendOrder(2030, 0, buffer);
    }

    static singleBuy(account: number, askPriceLevel: number, bidPriceLevel: number, askOffset: number, bidOffset: number, ukey: number, qty: number) {
        let offset: number = 0;
        let bufferLen = 12 + 4 + 4 + 4;
        let buffer = new Buffer(bufferLen);
        ManulTrader.writeUInt64LE(buffer, account, offset); offset += 8;
        buffer.writeUInt32LE(1, offset); offset += 4;
        buffer.writeUInt32LE(ukey, offset); offset += 4;
        buffer.writeUInt8(askPriceLevel, offset); offset += 1;
        buffer.writeUInt8(bidPriceLevel, offset); offset += 1;
        buffer.writeInt8(askOffset, offset); offset += 1;
        buffer.writeInt8(bidOffset, offset); offset += 1;
        buffer.writeUInt32LE(qty, offset); offset += 4;
        ManulTrader.orderService.sendOrder(5004, 0, buffer);
    }

    static singleCancel(account: number, ukey: number) {
        let offset: number = 0;
        let bufferLen = 12 + 4;
        let buffer = new Buffer(bufferLen);
        buffer.writeUIntLE(account, offset, 8); offset += 8;
        buffer.writeUInt32LE(1, offset); offset += 4;
        buffer.writeUInt32LE(ukey, offset); offset += 4;
        ManulTrader.orderService.sendOrder(5005, 0, buffer);
    }

    static sendAllSel(account: number, count: number, askPriceLevel: number, bidPriceLevel: number, askOffset: number, bidOffset: number, sendArr: any) {
        let offset: number = 0;
        let bufferLen = 12 + (4 + 4 + 4) * count;
        let buffer = new Buffer(bufferLen);
        buffer.writeUIntLE(account, offset, 8); offset += 8;
        buffer.writeUInt32LE(count, offset); offset += 4;
        for (let i = 0; i < count; ++i) {
            buffer.writeUInt32LE(sendArr[i].ukey, offset); offset += 4;
            buffer.writeUInt8(askPriceLevel, offset); offset += 1;
            buffer.writeUInt8(bidPriceLevel, offset); offset += 1;
            buffer.writeInt8(askOffset, offset); offset += 1;
            buffer.writeInt8(bidOffset, offset); offset += 1;
            buffer.writeUInt32LE(sendArr[i].qty, offset); offset += 4;
        }

        ManulTrader.orderService.sendOrder(5004, 0, buffer);
    }

    static cancelAllSel(account: number, count: number, sendArr: any) {
        let offset: number = 0;
        let bufferLen = 12 + 4 * count;
        let buffer = new Buffer(bufferLen);
        buffer.writeUIntLE(account, offset, 8); offset += 8;
        buffer.writeUInt32LE(count, offset); offset += 4;
        for (let i = 0; i < count; ++i) {
            buffer.writeUInt32LE(sendArr[i], offset); offset += 4;
        }
        ManulTrader.orderService.sendOrder(5005, 0, buffer);
    }

    static submitBasket(type: number, indexSymbol: number, divideNum: number, account: number, initPos: any) {
        let offset: number = 0;
        let bufferLen = 12 + 4 + 4 + initPos.length * 12; // head+fphead+indexSymbol+divideNum+count*initposLen
        let buffer = new Buffer(bufferLen);
        let initPosLen = initPos.length;

        ManulTrader.writeUInt64LE(buffer, account, offset); offset += 8;
        buffer.writeUInt32LE(initPos.length, offset); offset += 4;

        buffer.writeUInt32LE(indexSymbol, offset); offset += 4;
        buffer.writeUInt32LE(divideNum, offset); offset += 4;
        initPos.forEach(function (item) {
            buffer.writeUInt32LE(parseInt(item.ukey + ""), offset); offset += 4;
            buffer.writeInt32LE(parseInt(item.currPos + ""), offset); offset += 4;
            buffer.writeInt32LE(parseInt(item.targetPos + ""), offset); offset += 4;
        });
        ManulTrader.orderService.sendOrder(5001, 0, buffer);
    }

    static cancelorder(orders: any) {
        let offset: number = 0;
        // handle with array
        let mem_size: number = 176;
        let msg_length = 4 + mem_size;
        let buffer = new Buffer(msg_length);
        buffer.writeInt32LE(1, offset);
        offset += 4;

        buffer.writeUInt32LE(orders.ordertype, offset);
        offset += 8;
        buffer.writeUInt32LE(orders.con.contractid, offset);
        offset += 8;
        ManulTrader.writeUInt64LE(buffer, orders.con.account, offset);
        offset += 8;

        buffer.write(orders.con.orderaccount, offset, 20);
        offset += 20;
        buffer.write(orders.con.tradeunit, offset, 10);
        offset += 10;
        buffer.write(orders.con.tradeproto, offset, 10);
        offset += 10;

        // datetime timeval
        buffer.writeUIntLE(0, offset, 8);
        offset += 8;
        buffer.writeUIntLE(0, offset, 8);
        offset += 8;

        // data ComOrder
        let comorder_data = orders.data as ComOrder;

        buffer.writeUInt32LE(comorder_data.strategyid, offset);
        offset += 4;
        buffer.writeUInt32LE(comorder_data.algorid, offset);
        offset += 4;
        buffer.writeUInt32LE(comorder_data.orderid, offset);
        offset += 4;
        buffer.writeUInt32LE(comorder_data.algorindex, offset);
        offset += 4;
        buffer.writeUInt32LE(comorder_data.innercode, offset);
        offset += 4;
        buffer.writeUInt32LE(comorder_data.price, offset);
        offset += 4;
        buffer.writeUInt32LE(comorder_data.quantity, offset);
        offset += 4;

        buffer.writeIntLE(comorder_data.action, offset, 1);
        offset += 1;
        offset += 67;
        // buffer.writeIntLE(comorder_data.property, offset, 1);
        // offset += 1;
        // buffer.writeIntLE(comorder_data.currency, offset, 1);
        // offset += 1;
        // buffer.writeIntLE(comorder_data.covered, offset, 1);
        // offset += 1;

        // for (let j = 0; j < 4; ++j) {
        //     buffer.writeUInt32LE(comorder_data.signal[j].id, offset);
        //     offset += 8;
        //     ManulTrader.writeUInt64LE(buffer, comorder_data.signal[j].value, offset);
        //     offset += 8;
        // }
        // offset += mem_size;
        ManulTrader.orderService.sendOrder(2020, 0, buffer);
    }

    static getProfitInfo(): void {
        ManulTrader.orderService.sendOrder(2047, 0, null);
        ManulTrader.orderService.sendOrder(2044, 0, null);
    }

    static registerAccPos(data: any) {
        let offset: number = 0;
        let buffer = new Buffer(12);
        // fetch position
        ManulTrader.writeUInt64LE(buffer, data, offset); offset += 8;
        buffer.writeUInt32LE(0, offset); offset += 4;
        ManulTrader.orderService.sendOrder(5002, 0, buffer);
    }

    static write2buffer(buffer: Buffer, type: number, subtype: number, msglen: number, offset: number): void {
        buffer.writeInt16LE(type, offset);
        buffer.writeInt16LE(subtype, offset += 2);
        buffer.writeUInt32LE(msglen, offset += 2);
    }

    static strategyControl(type: number, strategyid: number) {
        let msgLen = 8;
        let offset: number = 0;
        let buffer = new Buffer(msgLen);
        buffer.writeInt32LE(1, offset); offset += 4;
        buffer.writeInt32LE(strategyid, offset);
        if (type === 0) {
            ManulTrader.orderService.sendOrder(2000, 0, buffer);
        } else if (type === 1) {
            ManulTrader.orderService.sendOrder(2004, 0, buffer);
        } else if (type === 2) {
            ManulTrader.orderService.sendOrder(2002, 0, buffer);
        } else if (type === 3) {
            ManulTrader.orderService.sendOrder(2049, 0, buffer);
        }
    }

    static writeUInt64LE(buffer: Buffer, time: number, offset: number): void {
        let max_uint32: number = 0xFFFFFFFF;
        let big: number = ~~(time / max_uint32);
        let low: number = (time % max_uint32) - big;
        buffer.writeUInt32LE(low, offset);
        offset += 4;
        buffer.writeUInt32LE(big, offset);
    }

    static addSlot(type: number, cb: Function) {
        ManulTrader.orderService.addSlot(type, cb);
    }

    static init(port: number, host: string) {
        ManulTrader.orderService.registerServices(port, host);  // send register info
    }

}