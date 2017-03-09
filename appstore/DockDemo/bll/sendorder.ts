"use strict";

import { ComConOrder, ComOrder, ComOrderCancel, EOrderType, ComContract } from "../../../base/api/model/itrade/orderstruct";
import { OrderService } from "../../../base/api/services/orderService";

export class ManulTrader {
    private static orderService = new OrderService();
    registerStrategy(): void {      

    }

    static submitOrder(...orders: ComConOrder[]): void {
        console.log("combine data & send out")
        let offset: number = 0;
        //handle with array
        let mem_size: number = 176;
        let length = orders.length;
        let msg_length = 4 + length * mem_size;

        let buffer = new Buffer(msg_length);
        //orders's length 
        buffer.writeInt32LE(length, offset);
        offset += 4;

        for (let i = 0; i < length; ++i) {
            buffer[offset] = orders[i].ordertype;
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
            offset == 10;

            //datetime timeval
            ManulTrader.writeUInt64LE(buffer, orders[i].datetime.tv_sec, offset);
            offset += 8;
            ManulTrader.writeUInt64LE(buffer, orders[i].datetime.tv_usec, offset);
            offset += 8;

            //data ComOrder
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

            buffer[offset] = comorder_data.action;
            offset += 1;
            buffer[offset] = comorder_data.property;
            offset += 1;
            buffer[offset] = comorder_data.currency;
            offset += 1;
            buffer[offset] = comorder_data.covered;
            offset += 1;

            for (let j = 0; j < 4; ++j) {
                buffer.writeUInt32LE(comorder_data.signal[j].id, offset);
                offset += 8;
                ManulTrader.writeUInt64LE(buffer, comorder_data.signal[j].value, offset);
                offset += 8;
            }
            offset += mem_size;
        }
        ManulTrader.orderService.sendOrder(2020, 0, buffer, (data)=>{
            
        });
    }

    static writeUInt64LE(buffer: Buffer, time: number, offset: number): void {
        let max_uint32: number = 0xFFFFFFFF;
        let big: number = ~~(time / max_uint32);
        let low: number = (time % max_uint32) - big;

        buffer.writeUInt32LE(low, offset);
        offset += 4;
        buffer.writeUInt32LE(big, offset);
    }

}