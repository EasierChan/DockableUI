"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var UNIT_PER_YUAN = 10000.0;
var MsgInnerCode = (function () {
    function MsgInnerCode() {
    }
    return MsgInnerCode;
}());
MsgInnerCode.len = 4;
exports.MsgInnerCode = MsgInnerCode;
var Message = (function () {
    function Message() {
    }
    Message.prototype.toString = function () {
        var props = Object.getOwnPropertyNames(this);
        var rets = "|";
        for (var i in props) {
            if (typeof this[props[i]] === "function" || props[i] === "len")
                continue;
            rets = rets.concat(props[i], "=", this[props[i]], "|");
        }
        return rets;
    };
    return Message;
}());
exports.Message = Message;
var MsgUpdateDate = (function (_super) {
    __extends(MsgUpdateDate, _super);
    function MsgUpdateDate() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MsgUpdateDate.prototype.fromBuffer = function (buffer) {
        if (buffer.length < MsgUpdateDate.len) {
            console.error("MsgUpdateDate::fromBuffer error");
            return;
        }
        var offset = 0;
        this.type = buffer.readInt32LE(offset);
        offset += 4;
        this.market = buffer.readInt32LE(offset);
        offset += 4;
        this.oldDate = buffer.readInt32LE(offset);
        offset += 4;
        this.newDate = buffer.readInt32LE(offset);
        offset += 4;
        this.seqNum = buffer.readInt32LE(offset);
        offset += 4;
    };
    return MsgUpdateDate;
}(Message));
MsgUpdateDate.len = 20;
exports.MsgUpdateDate = MsgUpdateDate;
var MsgBidAskIOPV = (function (_super) {
    __extends(MsgBidAskIOPV, _super);
    function MsgBidAskIOPV() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MsgBidAskIOPV.prototype.fromBuffer = function (buffer) {
        if (buffer.length < MsgBidAskIOPV.len) {
            console.error("MsgBidAskIOPV::fromBuffer error");
            return;
        }
        var offset = 0;
        this.type = buffer.readInt32LE(offset);
        offset += 4;
        this.innerCode = buffer.readInt32LE(offset);
        offset += 4;
        this.time = buffer.readInt32LE(offset);
        offset += 4;
        this.bidIOPV = buffer.readInt32LE(offset);
        offset += 8;
        this.askIOPV = buffer.readInt32LE(offset);
        offset += 8;
        this.seqNum = buffer.readInt32LE(offset);
        offset += 4;
    };
    return MsgBidAskIOPV;
}(Message));
MsgBidAskIOPV.len = 32;
exports.MsgBidAskIOPV = MsgBidAskIOPV;
var DepthMarketData = (function (_super) {
    __extends(DepthMarketData, _super);
    function DepthMarketData() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DepthMarketData.prototype.fromBuffer = function (buffer) {
        if (buffer.length < DepthMarketData.len) {
            console.error("MarketDataMsg::fromBuffer error");
            return;
        }
        var offset = 0;
        this.type = buffer.readInt32LE(offset);
        offset += 4;
        this.UKey = buffer.readInt32LE(offset);
        offset += 4;
        this.LastPrice = buffer.readIntLE(offset, 8);
        offset += 8;
        this.PreClosePrice = buffer.readIntLE(offset, 8);
        offset += 8;
        this.PreSettlePrice = buffer.readIntLE(offset, 8);
        offset += 8;
        this.OpenPrice = buffer.readIntLE(offset, 8);
        offset += 8;
        this.HighestPrice = buffer.readIntLE(offset, 8);
        offset += 8;
        this.LowestPrice = buffer.readIntLE(offset, 8);
        offset += 8;
        this.Volume = buffer.readInt32LE(offset);
        offset += 4;
        this.VolumeGap = buffer.readInt32LE(offset);
        offset += 4;
        this.Time = buffer.readIntLE(offset, 8);
        offset += 8;
        this.BidPrice = buffer.readIntLE(offset, 8);
        offset += 8;
        this.BidVolume = buffer.readIntLE(offset, 4);
        offset += 4;
        this.AskPrice = buffer.readIntLE(offset, 8);
        offset += 8;
        this.AskVolume = buffer.readInt32LE(offset);
        offset += 4;
        this.InstrumentID = buffer.toString("utf-8", offset);
    };
    return DepthMarketData;
}(Message));
DepthMarketData.len = 128;
exports.DepthMarketData = DepthMarketData;
var MsgType;
(function (MsgType) {
    MsgType[MsgType["PS_MSG_TYPE_UNKNOWN"] = 0] = "PS_MSG_TYPE_UNKNOWN";
    MsgType[MsgType["PS_MSG_TYPE_TRANSACTION"] = 1] = "PS_MSG_TYPE_TRANSACTION";
    MsgType[MsgType["PS_MSG_TYPE_ORDER"] = 2] = "PS_MSG_TYPE_ORDER";
    MsgType[MsgType["PS_MSG_TYPE_MARKETDATA"] = 3] = "PS_MSG_TYPE_MARKETDATA";
    MsgType[MsgType["PS_MSG_TYPE_INDEXDATA"] = 4] = "PS_MSG_TYPE_INDEXDATA";
    MsgType[MsgType["PS_MSG_TYPE_SUSPENDED"] = 5] = "PS_MSG_TYPE_SUSPENDED";
    MsgType[MsgType["PS_MSG_TYPE_ORDERQUEUE"] = 6] = "PS_MSG_TYPE_ORDERQUEUE";
    MsgType[MsgType["PS_MSG_TYPE_CANCEL_ORDER"] = 7] = "PS_MSG_TYPE_CANCEL_ORDER";
    MsgType[MsgType["MSG_HEARTBEAT"] = 255] = "MSG_HEARTBEAT";
    // #begin message below used from PriceServer Begin
    MsgType[MsgType["PS_MSG_REGISTER"] = 65] = "PS_MSG_REGISTER";
    MsgType[MsgType["PS_MSG_UNREGISTER"] = 66] = "PS_MSG_UNREGISTER";
    // #end 
    MsgType[MsgType["PS_MSG_TYPE_UPDATE_DATE"] = 57] = "PS_MSG_TYPE_UPDATE_DATE";
    MsgType[MsgType["PS_MSG_TYPE_IOPV_P"] = 1001] = "PS_MSG_TYPE_IOPV_P";
    MsgType[MsgType["PS_MSG_TYPE_IOPV_T"] = 1002] = "PS_MSG_TYPE_IOPV_T";
    MsgType[MsgType["PS_MSG_TYPE_IOPV_M"] = 1003] = "PS_MSG_TYPE_IOPV_M";
    MsgType[MsgType["PS_MSG_TYPE_IOPV_R"] = 1004] = "PS_MSG_TYPE_IOPV_R";
    MsgType[MsgType["MSG_TYPE_CODETABLE"] = 6] = "MSG_TYPE_CODETABLE";
    MsgType[MsgType["MSG_TYPE_TRANSACTION_EX"] = 1105] = "MSG_TYPE_TRANSACTION_EX";
    MsgType[MsgType["MSG_TYPE_MARKETDATA"] = 1102] = "MSG_TYPE_MARKETDATA";
    MsgType[MsgType["MSG_TYPE_MARKETDATA_FUTURES"] = 1106] = "MSG_TYPE_MARKETDATA_FUTURES";
    MsgType[MsgType["MSG_TYPE_UPDATE_DATE"] = 1118] = "MSG_TYPE_UPDATE_DATE";
    MsgType[MsgType["MSG_TYPE_FUTURES"] = 100] = "MSG_TYPE_FUTURES";
})(MsgType = exports.MsgType || (exports.MsgType = {}));
//# sourceMappingURL=message.model.js.map