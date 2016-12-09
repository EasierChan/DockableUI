'use strict';

import { Injectable } from "@angular/core";
import { EventEmitter } from 'events';
import { TValueCallback } from "../common/base/common";
import { PriceClient, PriceResolver } from "../dal/itrade/priceDal";

@Injectable()
export class PriceService extends EventEmitter{
    _client: PriceClient;

    start(): void{
        if(!this._client){
            this._client = new PriceClient(new PriceResolver());
        }
        this._client.connect(10001);
        this._client.onReceived 
    }
    /**
     * QTS::MSG::PS_MSG_TYPE_MARKETDATA
     */
    subscribeMarketData(listener: TValueCallback<string>): void {
        this.on("PS_MSG_TYPE_MARKETDATA", listener);
    }
    /**
     * IOPV MarketData
     */
    subscribeMarketDataIOPV(listener: TValueCallback<string>): void{
        this.on("PS_MSG_IOPV_MARKETDATA", listener);
    }

}

