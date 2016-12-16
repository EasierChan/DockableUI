import { EventEmitter } from "events";
import { IResolver } from "./resolver";
import * as net from "net";
import { DefaultLogger } from "./logger";

const localhost: string = "127.0.0.1";
/**
 * TcpClient is
 */
export class TcpClient extends EventEmitter {
    private _sock: net.Socket;
    private _resolver: IResolver;
    private _ip: string;
    private _port: number;
    /**
     * resolver: Resolver的实例
     */
    constructor(resolver: IResolver) {
        super();
        this._resolver = resolver;
    }
    /**
     * 连接
     */
    connect(port: number, ip = localhost): void {
        this._ip = ip;
        this._port = port;
        DefaultLogger.info(`start to connect to ${ip}:${port}...`);
        this._sock = null;
        this._sock = net.connect(port, ip, (e) => {
            this._resolver.onConnected(e);
        });

        this._sock.on("error", (err) => {
            this._resolver.onError(err);
        });

        this._sock.on("data", (data) => {
            this._resolver.onData(data);
        });

        this._sock.on("end", () => {
            this._resolver.onEnd({ remoteAddr: this._sock.remoteAddress, remotePort: this._sock.remotePort });
        });

        this._sock.on("close", (had_error) => {
            this._resolver.onClose(had_error);
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
        DefaultLogger.error("connection is not writable.");
        this.connect(this._port, this._ip);
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