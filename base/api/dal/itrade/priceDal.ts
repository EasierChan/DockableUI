"use strict";

import { DefaultLogger } from "../../common/base/logger";
import { Header, MsgType } from "../../model/itrade/message.model";
import { ItradeClient, ItradeResolver } from "./base";
import { IPCManager } from "../ipcManager";
import {
    MsgUpdateDate, MsgBidAskIOPV, DepthMarketData
} from "../../model/itrade/price.model";

export class PriceResolver extends ItradeResolver {
    readContent(header: Header, content: Buffer): void {

        switch (header.type) {
            case MsgType.PS_MSG_TYPE_UPDATE_DATE:
                let msgupdate = new MsgUpdateDate();
                msgupdate.fromBuffer(content);
                DefaultLogger.debug("market date: ", msgupdate.newDate);
                // DefaultLogger.info(msgupdate.toString());
                // this.emit("dal://itrade/data/ps", msgupdate);
                break;
            case MsgType.PS_MSG_TYPE_MARKETDATA:
                // deserializeMarketData();
                DefaultLogger.debug("=== New Quote Data ===");
                switch (header.subtype) {
                    case MsgType.MSG_TYPE_FUTURES:
                        let futureMarketData = new DepthMarketData();
                        futureMarketData.fromBuffer(content);
                        // DefaultLogger.debug(futureMarketData.toString());
                        this.emit("dal://itrade/data/ps", futureMarketData);
                        break;
                    default:
                        DefaultLogger.debug("type=", content.readInt32LE(0));
                        break;
                }
                break;
            default:
                switch (header.subtype) {
                    case MsgType.PS_MSG_TYPE_IOPV_P:
                    case MsgType.PS_MSG_TYPE_IOPV_M:
                    case MsgType.PS_MSG_TYPE_IOPV_T:
                    case MsgType.PS_MSG_TYPE_IOPV_R:
                        // deserializeMarketDataIopvItem();
                        let iopvMsg = new MsgBidAskIOPV();
                        iopvMsg.fromBuffer(content);
                        this.emit("dal://itrade/data/ps", iopvMsg);
                        break;
                }
                break;
        }
    }
}

export class PriceDal {
    static _client: ItradeClient;
    static _resolver: PriceResolver;
    static start(): void {
        if (!PriceDal._client) {
            PriceDal._resolver = new PriceResolver();
            PriceDal._client = new ItradeClient(PriceDal._resolver);
            PriceDal._client.connect(10000, "172.24.51.4");
            PriceDal._client.sendHeartBeat(10);
        }
        // PriceDal.registerQuoteMsg("MARKETDATA", [2006622]);
    }

    // register PriceServer msg
    static registerQuoteMsg(name: string, innercode: number): void {
        PriceDal.start();

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
        PriceDal._client.sendWithHead(type, subtype, data);
    }

    static addListener(name: string, cb: Function): void {
        PriceDal.start();
        PriceDal._resolver.on("dal://itrade/data/ps", (data) => {
            switch (name) {
                case "MARKETDATA":
                    switch (data.type) {
                        case MsgType.MSG_TYPE_FUTURES:
                            // DefaultLogger.info(data.toString());
                            cb(data);
                            break;
                        default:
                            DefaultLogger.info(data.toString());
                            break;
                    }
                    break;
                default:
                    DefaultLogger.info(`listener >> ${name} is not valid`);
                    break;
            }
        });
    }
}

// IPCManager.register("dal://itrade/ps/marketdata", (e, param, cb) => {
//     PriceDal.registerQuoteMsg(param.type, param.code);
//     PriceDal.addListener(param.type, (data) => {
//         if (!e.sender.isDestroyed())
//             e.sender.send("dal://itrade/ps/marketdata-reply", data);
//     });
// });
