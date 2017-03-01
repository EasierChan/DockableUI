"use strict";

import { Injectable, EventEmitter } from "@angular/core";
import { TValueCallback } from "../common/base/common";
import { MsgType } from "../model/itrade/message.model";

declare var electron: Electron.ElectronMainAndRenderer;
const { Socket } = require("@node/net");
// const EventEmitter = require("@node/events");

@Injectable()
export class PriceService extends EventEmitter<any> {

    constructor() {
        super();
    }
    /**
     * QTS::MSG::PS_MSG_TYPE_MARKETDATA
     */
    subscribeMarketData(innerCode: number, typestr: string, listener: TValueCallback<any>): void {
        electron.ipcRenderer.send("dal://itrade/ps/marketdata", { type: typestr, code: innerCode });
        electron.ipcRenderer.on("dal://itrade/ps/marketdata-reply", (e, msg) => {
            if (msg.UKey === innerCode) {
                listener(msg);
            }
        });
    }

    register(innercodes: number[]): void {
        let self = this;
        let socket = new Socket();
        socket.connect(20000, "127.0.0.1", () => {
            let obj = {
                header: {
                    type: MsgType.PS_MSG_REGISTER, subtype: MsgType.PS_MSG_TYPE_MARKETDATA, msglen: 0
                },
                body: {
                    innerCodes: innercodes
                }
            };
            // console.log(JSON.stringify(obj));
            socket.write(JSON.stringify(obj));
        });
        socket.on("data", data => {
            try {
                // console.info(data.toString());
                data.toString().split("$").forEach(item => {
                    if (item !== "") {
                        let obj = JSON.parse(item);
                        self.emit(obj);
                    }
                });
            } catch (err) {
                console.error(`${err.message}`);
                console.error(data.toString());
            }
        });
        socket.on("error", (err) => {
            console.error(err.message);
        });
    }
}

