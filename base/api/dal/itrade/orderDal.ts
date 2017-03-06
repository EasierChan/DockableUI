"use strict";

import { DefaultLogger } from "../../common/base/logger";
import { Header, MsgType } from "../../model/itrade/message.model";
import { ItradeClient, ItradeResolver } from "./base";
import {
    MsgUpdateDate, MsgBidAskIOPV, DepthMarketData
} from "../../model/itrade/price.model";

// it is a eventemitter
export class OrderResolver extends ItradeResolver {
    readContent(header: Header, content: Buffer): void {
        switch (header.type) {
            default:
                this.emit("data", "default");
                break;
        }
    }
}

export class OrderDal {
    static _client: ItradeClient;
    static _resolver: OrderResolver;
    static start(): void {
        if (!OrderDal._client) {
            OrderDal._resolver = new OrderResolver();
            OrderDal._client = new ItradeClient(OrderDal._resolver);
            OrderDal._client.connect(10000, "172.24.13.5");
            OrderDal._client.sendHeartBeat(10);
        }
        // OrderDal.registerMsg("MARKETDATA", [2006622]);
    }

    // register PriceServer msg
    static registerMsg(name: string, innercode: number): void {
        OrderDal.start();

        let type: number = 0;
        let subtype: number = 0;

        switch (name) {
            case "IOPVP":
                type = MsgType.PS_MSG_REGISTER;
                subtype = MsgType.PS_MSG_TYPE_IOPV_P;
                break;
            case "IOPVT":
                type = MsgType.PS_MSG_REGISTER;
                subtype = MsgType.PS_MSG_TYPE_IOPV_T;
                break;
            case "IOPVM":
                type = MsgType.PS_MSG_REGISTER;
                subtype = MsgType.PS_MSG_TYPE_IOPV_M;
                break;
            case "IOPVR":
                type = MsgType.PS_MSG_REGISTER;
                subtype = MsgType.PS_MSG_TYPE_IOPV_R;
                break;
            case "MARKETDATA":
                type = MsgType.PS_MSG_REGISTER;
                subtype = MsgType.PS_MSG_TYPE_MARKETDATA;
                break;
            default:
                DefaultLogger.info("Wrong type in message, must be IOPV or FUTURES, but got ", name);
                break;
        }

        let offset = 0;
        let data = new Buffer(4 + 4); // count + innercode

        data.writeInt32LE(1, 0);
        offset += 4;

        data.writeInt32LE(innercode, offset);
        offset += 4;
        OrderDal._client.sendWithHead(type, subtype, data);
    }

    static addListener(name: string, cb: Function): void {
        OrderDal.start();
        OrderDal._resolver.on("data", (data) => {
            switch (name) {
                default:
                    DefaultLogger.info(`listener >> ${name} is not valid`);
                    break;
            }
        });
    }
}

// dal://itrade/data/order
import { ipcMain } from "electron";
ipcMain.on("dal://itrade/data/order", (e, param) => {
    OrderDal.registerMsg(param.type, param.code);
    OrderDal.addListener(param.type, (data) => {
        if (!e.sender.isDestroyed())
            e.sender.send("dal://itrade/ps/marketdata-reply", data);
    });
});