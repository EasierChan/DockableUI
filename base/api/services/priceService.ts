"use strict";

import { Injectable } from "@angular/core";
import { TValueCallback } from "../common/base/common";

declare var electron: Electron.ElectronMainAndRenderer;

@Injectable()
export class PriceService {
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
}

