"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MessageTranfer = (function () {
    function MessageTranfer() {
    }
    /**
     * type in message body
     */
    MessageTranfer.GetMsg = function (buffer) {
        var msg = null;
        if (buffer) {
            var type = buffer.readInt32LE(0);
            msg = MessageMapper.instance.getMsg(type);
        }
        return msg;
    };
    return MessageTranfer;
}());
exports.MessageTranfer = MessageTranfer;
var MessageMapper = (function () {
    function MessageMapper() {
    }
    Object.defineProperty(MessageMapper, "instance", {
        get: function () {
            if (!MessageMapper._instance) {
                MessageMapper._instance = new MessageMapper();
            }
            return MessageMapper._instance;
        },
        enumerable: true,
        configurable: true
    });
    MessageMapper.prototype.getMsg = function (type) {
        return null;
    };
    return MessageMapper;
}());
exports.MessageMapper = MessageMapper;
var IMessage = (function () {
    function IMessage() {
    }
    return IMessage;
}());
exports.IMessage = IMessage;
//# sourceMappingURL=msgTransfer.js.map