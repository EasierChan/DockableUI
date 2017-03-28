"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var events = require("events");
var logger_1 = require("../common/base/logger");
/**
 * SimpleResover extends Resolver
 */
var SimpleResolver = (function (_super) {
    __extends(SimpleResolver, _super);
    function SimpleResolver(bufLen) {
        var _this = _super.call(this) || this;
        // 缓冲区长度下限 4K
        _this.bufMiniumLen = 1 << 12;
        // 缓冲区长度上限 1G
        _this.bufMaxiumLen = 1 << 30;
        // 缓冲区初始大小 4M
        _this.bufLen = 1 << 22;
        _this.bufBeg = 0;
        _this.bufEnd = 0;
        // 消息格式
        _this.headLen = 12;
        _this.resetBuffer(bufLen);
        return _this;
    }
    SimpleResolver.prototype.resetBuffer = function (bufLen) {
        if (bufLen) {
            if (bufLen < this.bufMiniumLen) {
                logger_1.DefaultLogger.error("buffer minium length can\"t less than " + this.bufMiniumLen);
                throw Error("buffer minium length can\"t less than " + this.bufMiniumLen);
            }
            else {
                this.bufLen = bufLen;
            }
        }
        this.buffer = Buffer.alloc(this.bufLen);
    };
    SimpleResolver.prototype.setHeadLen = function (len) {
        if (len === void 0) { len = 12; }
        this.headLen = len;
    };
    SimpleResolver.prototype.onConnected = function (arg) {
        logger_1.DefaultLogger.info("connected!");
    };
    SimpleResolver.prototype.onError = function (err) {
        logger_1.DefaultLogger.info(err);
    };
    SimpleResolver.prototype.onData = function (data) {
        logger_1.DefaultLogger.trace("got data from server! datalen= %d", data.length);
        // auto grow buffer to store big data unless it greater than maxlimit.
        while (data.length + this.bufEnd > this.bufLen) {
            logger_1.DefaultLogger.warn("more buffer length required.");
            if ((this.bufLen << 1) > this.bufMaxiumLen) {
                logger_1.DefaultLogger.fatal("too max buffer");
                throw Error("too max buffer");
            }
            this.buffer = Buffer.concat([this.buffer, Buffer.alloc(this.bufLen)], this.bufLen << 1);
            this.bufLen <<= 1;
        }
        data.copy(this.buffer, this.bufEnd);
        this.bufEnd += data.length;
        var readLen = this.readMsg();
        while (readLen > 0) {
            this.bufBeg += readLen;
            if (this.bufBeg > (this.bufLen >> 1)) {
                this.bufBeg -= (this.bufLen >> 1);
                this.bufEnd -= (this.bufLen >> 1);
            }
            readLen = this.readMsg();
        }
    };
    SimpleResolver.prototype.onEnd = function (arg) {
        logger_1.DefaultLogger.info("got a FIN");
    };
    SimpleResolver.prototype.onClose = function (arg) {
        logger_1.DefaultLogger.info("connection closed!");
    };
    SimpleResolver.prototype.onResolved = function (callback) {
        this.on("data", callback);
    };
    SimpleResolver.prototype.readHeader = function () {
        return {
            version: this.buffer.readUInt8(this.bufBeg),
            service: this.buffer.readUInt8((this.bufBeg + 1)),
            msgtype: this.buffer.readUInt16LE((this.bufBeg + 2)),
            topic: this.buffer.readUInt16LE((this.bufBeg + 4)),
            optslen: this.buffer.readUInt16LE((this.bufBeg + 6)),
            datalen: this.buffer.readUInt32LE((this.bufBeg + 8))
        };
    };
    // really unpack msg
    SimpleResolver.prototype.readMsg = function () {
        if (this.bufEnd < this.bufBeg + this.headLen) {
            return 0;
        }
        // read head
        var header = this.readHeader();
        if (header.datalen === 0) {
            logger_1.DefaultLogger.warn("empty message!(maybe a Heartbeat)");
            return this.headLen;
        }
        // read content
        if (this.bufEnd < this.bufBeg + this.headLen + header.datalen) {
            return 0;
        }
        var content = JSON.stringify(this.buffer.slice((this.bufBeg + this.headLen), (this.bufBeg + this.headLen + header.datalen)));
        var temp = JSON.parse(content, function (k, v) {
            return v && v.type === "Buffer" ? new Buffer(v.data) : v;
        });
        var msgObj = JSON.parse(temp.toString());
        this.emit("data", msgObj);
        return this.headLen + header.datalen;
    };
    return SimpleResolver;
}(events.EventEmitter));
exports.SimpleResolver = SimpleResolver;
//# sourceMappingURL=SimpleResolver.js.map