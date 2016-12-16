"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var events_1 = require("events");
var net = require("net");
var logger_1 = require("./logger");
var localhost = "127.0.0.1";
/**
 * TcpClient is
 */
var TcpClient = (function (_super) {
    __extends(TcpClient, _super);
    /**
     * resolver: Resolver的实例
     */
    function TcpClient(resolver) {
        _super.call(this);
        this._resolver = resolver;
    }
    /**
     * 连接
     */
    TcpClient.prototype.connect = function (port, ip) {
        var _this = this;
        if (ip === void 0) { ip = localhost; }
        this._ip = ip;
        this._port = port;
        logger_1.DefaultLogger.info("start to connect to " + ip + ":" + port + "...");
        this._sock = null;
        this._sock = net.connect(port, ip, function (e) {
            _this._resolver.onConnected(e);
        });
        this._sock.on("error", function (err) {
            _this._resolver.onError(err);
        });
        this._sock.on("data", function (data) {
            _this._resolver.onData(data);
        });
        this._sock.on("end", function () {
            _this._resolver.onEnd({ remoteAddr: _this._sock.remoteAddress, remotePort: _this._sock.remotePort });
        });
        this._sock.on("close", function (had_error) {
            _this._resolver.onClose(had_error);
        });
    };
    /**
     * 发送数据
     */
    TcpClient.prototype.send = function (data) {
        if (this._sock && this._sock.writable) {
            this._sock.write(data);
            return;
        }
        logger_1.DefaultLogger.error("connection is not writable.");
        this.connect(this._port, this._ip);
    };
    /**
     * 关闭连接
     */
    TcpClient.prototype.close = function () {
        if (this._sock && this._sock.writable) {
            this._sock.end();
            return;
        }
    };
    return TcpClient;
}(events_1.EventEmitter));
exports.TcpClient = TcpClient;
//# sourceMappingURL=client.js.map