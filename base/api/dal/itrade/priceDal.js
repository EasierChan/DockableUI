"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var client_1 = require("../../common/base/client");
var logger_1 = require("../../common/base/logger");
var events_1 = require("events");
var message_model_1 = require("../../model/itrade/message.model");
var PriceClient = (function (_super) {
    __extends(PriceClient, _super);
    function PriceClient(resolver) {
        _super.call(this, resolver);
    }
    PriceClient.prototype.send = function (data) {
        logger_1.DefaultLogger.debug(data);
        _super.prototype.send.call(this, Buffer.from(JSON.stringify(data)));
    };
    PriceClient.prototype.sendWithHead = function (type, subtype, data) {
        // TODO custom protocol to encode data.
        var msgLen = 0;
        var header = Buffer.alloc(8, 0);
        header.writeUInt16LE(type, 0);
        header.writeUInt16LE(subtype, 2);
        header.writeUInt32LE(0, 4);
        var total;
        if (data != null) {
            header.writeUInt32LE(data.length, 4);
            msgLen = data.length;
            total = Buffer.concat([header, data], header.length + data.length);
            _super.prototype.send.call(this, total);
            logger_1.DefaultLogger.debug("type: ", type, "subtype: ", subtype, "msglen: ", msgLen);
        }
        else {
            _super.prototype.send.call(this, header);
            logger_1.DefaultLogger.debug("type: ", type, "subtype: ", subtype, "msglen: ", msgLen);
        }
        total = null;
        header = null;
    };
    PriceClient.prototype.sendHeartBeat = function (interval) {
        var _this = this;
        if (interval === void 0) { interval = 300; }
        setInterval(function () {
            _this.sendWithHead(message_model_1.MsgType.MSG_HEARTBEAT, 0, null);
        }, interval * 1000);
    };
    PriceClient.prototype.onReceived = function (data) {
        // TODO deal the json Object Data.
        // DefaultLogger.info(data);
        this.emit("PS_MSG", data);
    };
    return PriceClient;
}(client_1.TcpClient));
exports.PriceClient = PriceClient;
/**
 * resolve for PriceServer
 */
var PriceResolver = (function (_super) {
    __extends(PriceResolver, _super);
    function PriceResolver(bufLen) {
        _super.call(this);
        // 缓冲区长度下限 4K
        this.bufMiniumLen = 1 << 12;
        // 缓冲区长度上限 1G
        this.bufMaxiumLen = 1 << 30;
        // 缓冲区初始大小 4M
        this.bufLen = 1 << 22;
        this.bufBeg = 0;
        this.bufEnd = 0;
        // 消息格式
        this.headLen = 8;
        this.resetBuffer(bufLen);
    }
    PriceResolver.prototype.resetBuffer = function (bufLen) {
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
    PriceResolver.prototype.setHeadLen = function (len) {
        if (len === void 0) { len = 8; }
        this.headLen = len;
    };
    PriceResolver.prototype.onConnected = function (arg) {
        logger_1.DefaultLogger.info("connected!");
    };
    PriceResolver.prototype.onError = function (err) {
        // DefaultLogger.info(err);
        this.emit("ps-error", err);
    };
    PriceResolver.prototype.onData = function (data) {
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
    PriceResolver.prototype.onEnd = function (arg) {
        logger_1.DefaultLogger.info("got a FIN");
    };
    PriceResolver.prototype.onClose = function (arg) {
        logger_1.DefaultLogger.info("connection closed!");
    };
    PriceResolver.prototype.readHeader = function () {
        return {
            type: this.buffer.readUInt16LE(this.bufBeg),
            subtype: this.buffer.readUInt16LE((this.bufBeg + 2)),
            msglen: this.buffer.readUInt32LE((this.bufBeg + 4))
        };
    };
    // really unpack msg
    PriceResolver.prototype.readMsg = function () {
        if (this.bufEnd < this.bufBeg + this.headLen) {
            return 0;
        }
        // read head
        var header = this.readHeader();
        logger_1.DefaultLogger.info("MsgHeader: ", header);
        if (header.msglen === 0) {
            logger_1.DefaultLogger.warn("empty message!(maybe a Heartbeat)");
            return this.headLen;
        }
        // read content
        if (this.bufEnd < this.bufBeg + this.headLen + header.msglen) {
            return 0;
        }
        var content = this.buffer.slice((this.bufBeg + this.headLen), (this.bufBeg + this.headLen + header.msglen));
        switch (header.type) {
            case message_model_1.MsgType.PS_MSG_TYPE_UPDATE_DATE:
                var msgupdate = new message_model_1.MsgUpdateDate();
                msgupdate.fromBuffer(content);
                logger_1.DefaultLogger.debug("market date: ", msgupdate.newDate);
                // DefaultLogger.info(msgupdate.toString());
                // this.emit("data", msgupdate);
                break;
            case message_model_1.MsgType.PS_MSG_TYPE_MARKETDATA:
                // deserializeMarketData();
                logger_1.DefaultLogger.debug("=== New Quote Data ===");
                switch (header.subtype) {
                    case message_model_1.MsgType.MSG_TYPE_FUTURES:
                        var futureMarketData = new message_model_1.DepthMarketData();
                        futureMarketData.fromBuffer(content);
                        // DefaultLogger.debug(futureMarketData.toString());
                        this.emit("data", futureMarketData);
                        break;
                    default:
                        logger_1.DefaultLogger.debug("type=", content.readInt32LE(0));
                        break;
                }
                break;
            default:
                {
                    switch (header.subtype) {
                        case message_model_1.MsgType.PS_MSG_TYPE_IOPV_P:
                        case message_model_1.MsgType.PS_MSG_TYPE_IOPV_M:
                        case message_model_1.MsgType.PS_MSG_TYPE_IOPV_T:
                        case message_model_1.MsgType.PS_MSG_TYPE_IOPV_R:
                            // deserializeMarketDataIopvItem();
                            var iopvMsg = new message_model_1.MsgBidAskIOPV();
                            iopvMsg.fromBuffer(content);
                            this.emit("data", iopvMsg);
                            break;
                    }
                }
                break;
        }
        return this.headLen + header.msglen;
    };
    return PriceResolver;
}(events_1.EventEmitter));
exports.PriceResolver = PriceResolver;
var PriceDal = (function () {
    function PriceDal() {
    }
    PriceDal.start = function () {
        if (!PriceDal._client) {
            PriceDal._resolver = new PriceResolver();
            PriceDal._client = new PriceClient(PriceDal._resolver);
            PriceDal._client.connect(10000, "172.24.13.5");
            PriceDal._client.sendHeartBeat(10);
        }
        // PriceDal.registerQuoteMsg("MARKETDATA", [2006622]);
    };
    // register PriceServer msg
    PriceDal.registerQuoteMsg = function (name, innercode) {
        PriceDal.start();
        var type = 0;
        var subtype = 0;
        switch (name) {
            case "IOPVP":
                type = message_model_1.MsgType.PS_MSG_REGISTER;
                subtype = message_model_1.MsgType.PS_MSG_TYPE_IOPV_P;
                break;
            case "IOPVT":
                type = message_model_1.MsgType.PS_MSG_REGISTER;
                subtype = message_model_1.MsgType.PS_MSG_TYPE_IOPV_T;
                break;
            case "IOPVM":
                type = message_model_1.MsgType.PS_MSG_REGISTER;
                subtype = message_model_1.MsgType.PS_MSG_TYPE_IOPV_M;
                break;
            case "IOPVR":
                type = message_model_1.MsgType.PS_MSG_REGISTER;
                subtype = message_model_1.MsgType.PS_MSG_TYPE_IOPV_R;
                break;
            case "MARKETDATA":
                type = message_model_1.MsgType.PS_MSG_REGISTER;
                subtype = message_model_1.MsgType.PS_MSG_TYPE_MARKETDATA;
                break;
            default:
                logger_1.DefaultLogger.info("Wrong type in message, must be IOPV or FUTURES, but got ", name);
                break;
        }
        var offset = 0;
        var data = new Buffer(4 + message_model_1.MsgInnerCode.len);
        data.writeInt32LE(1, 0);
        offset += 4;
        data.writeInt32LE(innercode, offset);
        offset += 4;
        PriceDal._client.sendWithHead(type, subtype, data);
    };
    PriceDal.addListener = function (name, cb) {
        PriceDal.start();
        PriceDal._resolver.on("data", function (data) {
            switch (name) {
                case "MARKETDATA":
                    switch (data.type) {
                        case message_model_1.MsgType.MSG_TYPE_FUTURES:
                            // DefaultLogger.info(data.toString());
                            cb(data);
                            break;
                        default:
                            logger_1.DefaultLogger.info(data.toString());
                            break;
                    }
                    break;
                default:
                    logger_1.DefaultLogger.info("listener >> " + name + " is not valid");
                    break;
            }
        });
    };
    return PriceDal;
}());
exports.PriceDal = PriceDal;
var electron_1 = require("electron");
electron_1.ipcMain.on("dal://itrade/ps/marketdata", function (e, param, cb) {
    PriceDal.registerQuoteMsg(param.type, param.code);
    PriceDal.addListener(param.type, function (data) {
        if (!e.sender.isDestroyed())
            e.sender.send("dal://itrade/ps/marketdata-reply", data);
    });
});
//# sourceMappingURL=priceDal.js.map