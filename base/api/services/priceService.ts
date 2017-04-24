/**
 * created by cl, 2017/02/11
 */
"use strict";

import { Injectable, EventEmitter } from "@angular/core";
import { TValueCallback } from "../common/base/common";
import { MsgType } from "../model/itrade/message.model";

declare var electron: Electron.ElectronMainAndRenderer;
const { Socket } = require("@node/net");
// const EventEmitter = require("@node/events");

@Injectable()
export class PriceService extends EventEmitter<any> {
    private _socket = new Socket();
    private _port: number;
    private _host: string;
    private _interval: number;
    private _state: number = 0;
    private _innercodesMap: any = {};
    private onClose: Function;

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

    setEndpoint(port: number, host: string = "127.0.0.1"): void {
        this._port = port;
        this._host = host;
        let self = this;
        this._socket.connect(this._port, this._host);

        self._socket.on("connect", () => {
            this._state = 1;
        });

        self._socket.on("data", data => {
            try {
                // console.info(data.toString());
                data.toString().split("$").forEach(item => {
                    if (item && item !== "") {
                        let obj = JSON.parse(item);
                        self.emit(obj);
                    }
                });
            } catch (err) {
                console.error(`${err.message}`);
                console.error(data.toString());
            }
        });
        self._socket.on("error", (err) => {
            this._state = 2;
            if (this.onClose) {
                this.onClose();
            }
            console.error(err.message);
        });
        self._socket.on("close", err => {
            this._state = 2;
            if (this.onClose) {
                this.onClose();
            }
            console.info("remote closed");
        });
        self._socket.on("end", err => {
            this._state = 2;
            if (this.onClose) {
                this.onClose();
            }
            console.info("remote closed");
        });
    }

    setHeartBeat(interval: number): void {
        this._interval = interval > 5000 ? interval : 5000;
        setInterval(() => {
            if (this._port && this._host && this._state === 2) {
                this.setEndpoint(this._port, this._host);
                for (let prop in this._innercodesMap)
                    this.sendCodes(parseInt(prop));
            }
        }, this._interval);
    }

    register(innercodes: number[], subtype: number = MsgType.PS_MSG_TYPE_MARKETDATA): void {
        if (!this._innercodesMap.hasOwnProperty(subtype))
            this._innercodesMap[subtype] = [];

        innercodes.forEach(code => {
            if (!this._innercodesMap[subtype].includes(code))
                this._innercodesMap[subtype].push(code);
        });
        this.sendCodes(subtype);
    }

    private sendCodes(subtype: number) {

        let obj = {
            header: {
                type: MsgType.PS_MSG_REGISTER, subtype: subtype, msglen: 0
            },
            body: {
                innerCodes: this._innercodesMap[subtype]
            }
        };
        // console.log(JSON.stringify(obj));
        this._socket.write(JSON.stringify(obj));
    }
}

