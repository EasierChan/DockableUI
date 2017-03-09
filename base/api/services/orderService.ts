"use strict";

import { Injectable, EventEmitter } from "@angular/core";
import { MsgType } from "../model/itrade/message.model";

declare var electron: Electron.ElectronMainAndRenderer;

export class OrderService {
    private _messageMap: any;
    constructor(){
        this._messageMap = new Object();
        let self = this;
        electron.ipcRenderer.on("dal://itrade/data/order-reply", (e, data)=>{
            // whether function
            self._messageMap[data.type]();
        });
    }

    sendOrder(type: number, subtype: number, buffer: Buffer, cb: Function){
        
        electron.ipcRenderer.send("dal://itrade/data/order", {
            type: type,
            subtype: subtype,
            buffer: buffer
        });
        this._messageMap[0]= cb;
        this._messageMap[1]= cb;
    }

    register(type: number, subtype: number, buffer: Buffer, cb: Function){
        electron.ipcRenderer.send("dal://itrade/data/order", {
            type: type,
            subtype: subtype,
            buffer: buffer
        });
        this._messageMap[3]= cb;
    }
}