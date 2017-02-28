"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var message_model_1 = require("../model/itrade/message.model");
var Socket = require("@node/net").Socket;
// const EventEmitter = require("@node/events");
var PriceService = (function (_super) {
    __extends(PriceService, _super);
    function PriceService() {
        _super.call(this);
    }
    /**
     * QTS::MSG::PS_MSG_TYPE_MARKETDATA
     */
    PriceService.prototype.subscribeMarketData = function (innerCode, typestr, listener) {
        electron.ipcRenderer.send("dal://itrade/ps/marketdata", { type: typestr, code: innerCode });
        electron.ipcRenderer.on("dal://itrade/ps/marketdata-reply", function (e, msg) {
            if (msg.UKey === innerCode) {
                listener(msg);
            }
        });
    };
    PriceService.prototype.register = function (innercodes) {
        var self = this;
        var socket = new Socket();
        socket.connect(20000, "127.0.0.1", function () {
            var obj = {
                header: {
                    type: message_model_1.MsgType.PS_MSG_REGISTER, subtype: message_model_1.MsgType.PS_MSG_TYPE_MARKETDATA, msglen: 0
                },
                body: {
                    innerCodes: innercodes
                }
            };
            // console.log(JSON.stringify(obj));
            socket.write(JSON.stringify(obj));
        });
        socket.on("data", function (data) {
            try {
                // console.info(data.toString());
                data.toString().split("$").forEach(function (item) {
                    if (item !== "") {
                        var obj = JSON.parse(item);
                        self.emit(obj);
                    }
                });
            }
            catch (err) {
                console.error("" + err.message);
                console.error(data.toString());
            }
        });
        socket.on("error", function (err) {
            console.error(err.message);
        });
    };
    PriceService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], PriceService);
    return PriceService;
}(core_1.EventEmitter));
exports.PriceService = PriceService;
//# sourceMappingURL=priceService.js.map