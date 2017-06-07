/**
 * chenlei 2017/01/13
 */
"use strict";

import { EventEmitter } from "events";
import { Pool } from "./pool";

export abstract class Parser {
    private _emitter: NodeJS.EventEmitter = new EventEmitter();

    on(event: string | symbol, listener: Function) {
        return this._emitter.on(event, listener);
    }

    emit(event: string | symbol, ...args: any[]) {
        return this._emitter.emit(event, args);
    }
    /**
     * constructor
     */
    constructor(protected _oPool: Pool<Buffer>) {
    }
    /**
     * destructor
     */
    dispose(): void {
        this._oPool = null;
    }

    abstract processRead(): void;

    registerMsgFunction(type: any, self: any, func: Function): void {
        this.on(type.toString(), args => {
            func.call(self, args);
        });
    }
}