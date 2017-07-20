/**
 * chenlei 2017/01/13
 */
"use strict";

import { EventEmitter } from "events";
import net = require("net");

const localhost: string = "127.0.0.1";
const logger = console;
/**
 * TcpClient is
 */
export class TcpSocket {
    private _sock: net.Socket;
    private _ip: string;
    private _port: number;
    private _emitter: NodeJS.EventEmitter = new EventEmitter();

    on(event: string | symbol, listener: Function) {
        return this._emitter.on(event, listener);
    }

    emit(event: string | symbol, ...args: any[]) {
        return this._emitter.emit(event, args);
    }
    /**
     * resolver: Resolver的实例
     */
    constructor() {
    }
    /**
     * 连接
     */
    connect(port: number, ip = localhost): void {
        if (this._sock && this._sock !== null) {
            this._sock.end();
        }
        this._ip = ip;
        this._port = port;
        logger.info(`start to connect to ${ip}:${port}...`);
        this._sock = null;
        this._sock = net.connect(port, ip, (e) => {
            logger.info(`${this._sock.remoteAddress + ":" + this._sock.remotePort} connected.`);
            this.emit("connect", e);
        });

        this._sock.setKeepAlive(true);

        this._sock.on("error", (err) => {
            logger.error(err.message);
            try {
                this.emit("error", err);
            } catch (e) {
                console.info(e.message);
            }
        });

        this._sock.on("data", (data) => {
            this.emit("data", data);
        });

        this._sock.on("end", () => {
            logger.info(`Receive an FIN packet from ${this._sock.remoteAddress + ":" + this._sock.remotePort}`);
            this.emit("end");
        });

        this._sock.on("close", (has_error) => {
            console.warn(`${this._ip + ":" + this._port} is closed ${has_error ? "successfully" : "unexpected"}!`);
            this.emit("close", has_error);
        });
    }
    /**
     * 发送数据
     */
    send(data: any): void {
        if (this._sock && this._sock.writable) {
            this._sock.write(data);
            return;
        }
        logger.error("connection is not writable.");
        this.connect(this._port, this._ip);
        this._sock.on("connect", (e) => {
            this._sock.write(data);
        });
    }
    /**
     * 关闭连接
     */
    close(): void {
        if (this._sock && this._sock.writable) {
            this._sock.end();
            return;
        }
    }
}