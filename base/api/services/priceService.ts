"use strict";

import { Injectable } from "@angular/core";
import { TValueCallback } from "../common/base/common";

declare var electron: Electron.ElectronMainAndRenderer;

@Injectable()
export class PriceService {
    /**
     * QTS::MSG::PS_MSG_TYPE_MARKETDATA
     */
    subscribeMarketData(innerCodeList, listener: TValueCallback<any>): void {
        electron.ipcRenderer.send("dal://itrade/ps/marketdata", { name: "MARKETDATA", codes: innerCodeList });
        electron.ipcRenderer.on("dal://itrade/ps/marketdata-reply", (e, msg) => {
            listener(msg);
        });
    }
    /**
     * IOPV MarketData
     */
    subscribeMarketDataIOPV(listener: TValueCallback<Object>): void {
        electron.ipcRenderer.send("dal://itrade/ps/marketdataIOPV", {}, listener);
    }

}

