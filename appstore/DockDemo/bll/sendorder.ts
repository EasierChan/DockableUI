"use strict";

import { ComConOrder, ComOrder, ComOrderCancel, EOrderType, ComContract } from "../../../base/api/model/itrade/orderstruct";
import { OrderService } from "../../../base/api/services/orderService";
import { AppComponent } from "../app.component";

export class ManulTrader {
    private static orderService = new OrderService();

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

    static submitBasket(type: number, indexSymbol: number, divideNum: number, account: number, initPos: any) {
        let offset: number = 0;
        console.log(initPos, initPos.length);
        let bufferLen = 12 + 4 + 4 + initPos.length * 12; // head+fphead+indexSymbol+divideNum+count*initposLen
        let buffer = new Buffer(bufferLen);
        let initPosLen = initPos.length;

        ManulTrader.writeUInt64LE(buffer, account, offset); offset += 8;
        buffer.writeUInt32LE(initPos.length, offset); offset += 4;

        buffer.writeUInt32LE(indexSymbol, offset); offset += 4;
        buffer.writeUInt32LE(divideNum, offset); offset += 4;
        initPos.forEach(function (item) {
            buffer.writeUInt32LE(item.ukey, offset); offset += 4;
            buffer.writeInt32LE(item.currPos, offset); offset += 4;
            buffer.writeInt32LE(item.targetPos, offset); offset += 4;
        });
        ManulTrader.orderService.sendOrder(5001, 0, buffer);
    }
    static cancelorder(data: any) {
        let order: ComConOrder = new ComConOrder();
        let offset: number = 0;
        let buffer = new Buffer(176 + 4);
        buffer.writeInt32LE(1, offset); offset += 4;
        buffer.writeInt32LE(EOrderType.ORDER_TYPE_CANCEL, offset); offset += 8;
        buffer.writeUInt32LE(order.con.contractid, offset); offset += 8;
        ManulTrader.writeUInt64LE(buffer, order.con.account, offset); offset += 8;
        buffer.write(order.con.orderaccount, offset, 20); offset += 20;
        buffer.write(order.con.tradeunit, offset, 10); offset += 10;
        buffer.write(order.con.tradeproto, offset, 10); offset += 10;
        // datetime timeval
        buffer.writeUIntLE(0, offset, 8); offset += 8;
        buffer.writeUIntLE(0, offset, 8); offset += 8;
        // data ComOrder
        let comorder_data = order.data as ComOrderCancel;
        buffer.writeUInt32LE(data.strategyid, offset); offset += 4;
        buffer.writeUInt32LE(comorder_data.algorid, offset); offset += 4;
        buffer.writeUInt32LE(data.orderid, offset); offset += 4;
        buffer.writeUInt32LE(comorder_data.algorindex, offset); offset += 4;
        buffer.writeUInt32LE(data.ukey, offset); offset += 4;
        buffer.writeUInt32LE(comorder_data.price, offset); offset += 4;
        buffer.writeUInt32LE(comorder_data.quantity, offset); offset += 4;
        offset += 68;
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
        let account: number = 666600000040;
        ManulTrader.writeUInt64LE(buffer, account, offset); offset += 8;
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
        buffer.writeInt32LE(length, offset); offset += 4;
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

    static init() {
        ManulTrader.orderService.registerServices();  // send register info
    }

}