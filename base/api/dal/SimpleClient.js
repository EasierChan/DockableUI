"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var client_1 = require("../common/base/client");
var logger_1 = require("../common/base/logger");
/**
 * QtpMessageClient
 */
var SimpleClient = (function (_super) {
    __extends(SimpleClient, _super);
    function SimpleClient(resolver) {
        return _super.call(this, resolver) || this;
    }
    SimpleClient.prototype.send = function (data) {
        logger_1.DefaultLogger.debug(data);
        // TODO custom protocol to encode data.
        var header = Buffer.alloc(12, 0);
        header.writeUInt16LE(data.msgtype, 2);
        var total = header;
        if (data) {
            var content = Buffer.from(JSON.stringify(data));
            header.writeUInt32LE(content.length, 8);
            total = Buffer.concat([header, content], header.length + content.length);
            // 释放资源
            content = null;
        }
        // send the encoded data.
        _super.prototype.send.call(this, total);
        total = null;
        header = null;
    };
    SimpleClient.prototype.onReceived = function (data) {
        // TODO deal the json Object Data.
        logger_1.DefaultLogger.info(data);
    };
    return SimpleClient;
}(client_1.TcpClient));
exports.SimpleClient = SimpleClient;
//# sourceMappingURL=SimpleClient.js.map