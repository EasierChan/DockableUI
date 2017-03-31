"use strict";

import { DefaultLogger } from "../../common/base/logger";
import { IHeader, MsgType } from "../../model/itrade/message.model";
import { ItradeClient, ItradeResolver } from "./base";
import {
    MsgUpdateDate, MsgBidAskIOPV, DepthMarketData
} from "../../model/itrade/price.model";


// dal://itrade/data/order
import { IPCManager } from "../ipcManager";
IPCManager.register("dal://itrade/data/order", (e, param) => {
    switch (param.type) {
        case -1:
            OrderDal.start();
            break;
        default:
            DefaultLogger.error("0.0.0.0.0.0.");
            OrderDal.sendMsg(param.type, param.subtype, param.buffer);
            break;
    }
    OrderDal.addListener("order", (data) => {
        if (!e.sender.isDestroyed()) {
            e.sender.send("dal://itrade/data/order-reply", data);
        }
    });
});

// it is a eventemitter
export class OrderResolver extends ItradeResolver {
    readContent(header: IHeader, content: Buffer): void {
        // resolve  msg  & send out
        //  console.log("receive msg:head:", header);
        this.emit("data", { header, content });
    }
}

export class OrderDal {
    static _client: ItradeClient;
    static _resolver: OrderResolver;
    static _listeners: Object = new Object();

    static start(): void {
        if (!OrderDal._client) {
            OrderDal._resolver = new OrderResolver();
            OrderDal._client = new ItradeClient(OrderDal._resolver);
            OrderDal._client.connect(9080, "172.24.51.4");
            OrderDal._resolver.on("dal://itrade/connected", () => {
                // register
                let offset: number = 0;
                let connectBuffer = new Buffer(196);

                let orderdal: OrderDal = new OrderDal();
                orderdal.write2buffer(connectBuffer, 2998, 0, 188, offset);
                connectBuffer.writeUInt32LE(23, offset += 8);
                orderdal.write2buffer(connectBuffer, 2048, 1, 0, offset += 4);
                orderdal.write2buffer(connectBuffer, 2001, 0, 0, offset += 8);
                orderdal.write2buffer(connectBuffer, 2032, 0, 0, offset += 8);
                orderdal.write2buffer(connectBuffer, 2033, 0, 0, offset += 8);
                orderdal.write2buffer(connectBuffer, 2011, 0, 0, offset += 8);
                orderdal.write2buffer(connectBuffer, 2029, 0, 0, offset += 8);

                // order  register
                orderdal.write2buffer(connectBuffer, 2013, 0, 0, offset += 8);
                orderdal.write2buffer(connectBuffer, 2013, 1, 0, offset += 8);
                orderdal.write2buffer(connectBuffer, 2013, 2, 0, offset += 8);
                orderdal.write2buffer(connectBuffer, 2021, 1, 0, offset += 8);
                orderdal.write2buffer(connectBuffer, 2022, 0, 0, offset += 8);
                orderdal.write2buffer(connectBuffer, 2023, 0, 0, offset += 8);
                orderdal.write2buffer(connectBuffer, 2017, 0, 0, offset += 8);
                orderdal.write2buffer(connectBuffer, 3510, 0, 0, offset += 8);
                orderdal.write2buffer(connectBuffer, 3502, 0, 0, offset += 8);
                orderdal.write2buffer(connectBuffer, 2040, 1, 0, offset += 8);
                orderdal.write2buffer(connectBuffer, 2040, 2, 0, offset += 8);
                orderdal.write2buffer(connectBuffer, 2040, 3, 0, offset += 8);
                orderdal.write2buffer(connectBuffer, 2040, 4, 0, offset += 8);
                orderdal.write2buffer(connectBuffer, 2048, 0, 0, offset += 8);
                orderdal.write2buffer(connectBuffer, 2025, 1000, 0, offset += 8);
                orderdal.write2buffer(connectBuffer, 2025, 1001, 0, offset += 8);
                orderdal.write2buffer(connectBuffer, 2025, 1002, 0, offset += 8);
                OrderDal._client.send(connectBuffer);
                connectBuffer = null;
                offset = 0;

                connectBuffer = new Buffer(8);
                orderdal.write2buffer(connectBuffer, 2010, 0, 0, 0);
                OrderDal._client.send(connectBuffer);
                connectBuffer = null;

                connectBuffer = new Buffer(8);
                orderdal.write2buffer(connectBuffer, 3503, 0, 0, 0);
                OrderDal._client.send(connectBuffer);
                connectBuffer = null;

                connectBuffer = new Buffer(8);
                orderdal.write2buffer(connectBuffer, 3010, 0, 0, 0);
                OrderDal._client.send(connectBuffer);
                connectBuffer = null;

                connectBuffer = new Buffer(8);
                orderdal.write2buffer(connectBuffer, 3509, 0, 0, 0);
                OrderDal._client.send(connectBuffer);
                connectBuffer = null;

                connectBuffer = new Buffer(8);
                orderdal.write2buffer(connectBuffer, 2016, 0, 0, 0);
                OrderDal._client.send(connectBuffer);
                connectBuffer = null;

                connectBuffer = new Buffer(8);
                orderdal.write2buffer(connectBuffer, 2044, 0, 0, 0);
                OrderDal._client.send(connectBuffer);
                connectBuffer = null;
            });
            OrderDal._client.sendHeartBeat(10);
        }
    }

    // register PriceServer msg
    static sendMsg(type: number, subtype: number, buffer: Buffer): void {
        DefaultLogger.error(type, subtype);
        console.log("send Msg:type:", type, ",subtype:", subtype, ",msglen:", (buffer === null ? 0 : buffer.length));
        OrderDal.start();
        OrderDal._client.sendWithHead(type, subtype, buffer);
    }

    // send msg to client
    static addListener(name: string, cb: Function): void {
        OrderDal.start();
        if (!OrderDal._listeners.hasOwnProperty(name)) {
            OrderDal._listeners[name] = cb;
            OrderDal._resolver.on("data", (data) => {
                cb(data);
            });
        }
    }

    write2buffer(buffer: Buffer, type: number, subtype: number, msglen: number, offset: number): void {
        buffer.writeInt16LE(type, offset);
        buffer.writeInt16LE(subtype, offset += 2);
        buffer.writeUInt32LE(msglen, offset += 2);
    }
}

