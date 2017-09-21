/**
 * chenlei 2017/01/16
 */
"use strict";

import { TcpSocket } from "./socket";
import { Pool } from "./pool";
const { EventEmitter } = require("@node/events");

/**
 * tcp client
 */
export class TcpClient {
    private _emitter: NodeJS.EventEmitter = new EventEmitter();
    private _clientSock: TcpSocket;

    on(event: string | symbol, listener: Function) {
        return this._emitter.on(event, listener);
    }

    emit(event: string | symbol, ...args: any[]) {
        return this._emitter.emit(event, args);
    }
    /**
     * common buffer queue
     */
    private static _s_bufferQueue: Pool<Buffer>;
    /**
     * self buffer queue
     */
    private _buffer_Queue: Pool<Buffer>;
    /**
     * constructor
     * @param _clientSock
     * @param _bUseSelfBuffer use its own buffer queue or global.
     */
    constructor(private _bUseSelfBuffer = false) {
    }

    set useSelfBuffer(val: boolean) {
        this._bUseSelfBuffer = val;
    }

    connect(port: number, ip?: string): void {
        if (this._clientSock) {
            return;
        }

        this._clientSock = new TcpSocket();
        this._clientSock.connect(port, ip);
        this._clientSock.on("data", (data: any) => {
            if (data instanceof Buffer) {
                this.bufferQueue.append(data);
            } else if (data instanceof Array) {
                data.forEach(item => {
                    this.bufferQueue.append(new Buffer(item.buffer));
                });
            }
        });
        this._clientSock.on("connect", () => {
            this.emit("connect");
        });

        this._clientSock.on("error", (err) => {
            this.emit("error");
            this._clientSock.close();
            this._clientSock = null;
        });
        this._clientSock.on("end", (err) => {
            this.emit("end");
            this._clientSock.close();
            this._clientSock = null;
        });
        this._clientSock.on("close", (err) => {
            this.emit("close");
            this._clientSock.close();
            this._clientSock = null;
        });
    }

    reconnect(port: number, ip?: string) {
        if (this._clientSock)
            this._clientSock.connect(port, ip);
    }

    send(buf: Buffer | string): void {
        this._clientSock.send(buf);
    }

    dispose(): void {
        this._buffer_Queue = null;
    }

    static dispose(): void {
        TcpClient._s_bufferQueue = null;
    }
    /**
     *
     */
    get bufferQueue(): Pool<Buffer> {
        if (this._buffer_Queue)
            return this._buffer_Queue;

        if (this._bUseSelfBuffer)
            this._buffer_Queue = new Pool<Buffer>();
        else
            this._buffer_Queue = TcpClient._s_bufferQueue || (TcpClient._s_bufferQueue = new Pool<Buffer>());
        return this._buffer_Queue;
    }

    static get commonPoolInstance(): Pool<Buffer> {
        if (TcpClient._s_bufferQueue === null)
            TcpClient._s_bufferQueue = new Pool<Buffer>();
        return TcpClient._s_bufferQueue;
    }
}