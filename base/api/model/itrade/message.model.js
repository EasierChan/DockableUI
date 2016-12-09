'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var UNIT_PER_YUAN = 10000.0;
var MsgInnerCode = (function () {
    function MsgInnerCode() {
    }
    MsgInnerCode.len = 4;
    return MsgInnerCode;
}());
exports.MsgInnerCode = MsgInnerCode;
var Message = (function () {
    function Message() {
    }
    Message.prototype.toString = function () {
        var props = Object.getOwnPropertyNames(this);
        var rets = "|";
        for (var i in props) {
            if (typeof this[props[i]] == 'function' || props[i] == "len")
                continue;
            rets = rets.concat(props[i], '=', this[props[i]], '|');
        }
        return rets;
    };
    return Message;
}());
exports.Message = Message;
var MsgUpdateDate = (function (_super) {
    __extends(MsgUpdateDate, _super);
    function MsgUpdateDate() {
        _super.apply(this, arguments);
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
    MsgUpdateDate.len = 20;
    return MsgUpdateDate;
}(Message));
exports.MsgUpdateDate = MsgUpdateDate;
var MsgBidAskIOPV = (function (_super) {
    __extends(MsgBidAskIOPV, _super);
    function MsgBidAskIOPV() {
        _super.apply(this, arguments);
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
    MsgBidAskIOPV.len = 32;
    return MsgBidAskIOPV;
}(Message));
exports.MsgBidAskIOPV = MsgBidAskIOPV;
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
})(exports.MsgType || (exports.MsgType = {}));
var MsgType = exports.MsgType;
//# sourceMappingURL=message.model.js.map