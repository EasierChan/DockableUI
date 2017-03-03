"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var message_model_1 = require("../model/itrade/message.model");
var Socket = require("@node/net").Socket;
// const EventEmitter = require("@node/events");
var PriceService = (function (_super) {
    __extends(PriceService, _super);
    function PriceService() {
        var _this = _super.call(this) || this;
        _this._socket = new Socket();
        _this._state = 0;
        _this._innercodes = [];
        return _this;
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
    PriceService.prototype.setEndpoint = function (port, host) {
        var _this = this;
        if (host === void 0) { host = "127.0.0.1"; }
        this._port = port;
        this._host = host;
        var self = this;
        this._socket.connect(this._port, this._host);
        self._socket.on("connect", function () {
            _this._state = 1;
        });
        self._socket.on("data", function (data) {
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
        self._socket.on("error", function (err) {
            _this._state = 2;
            console.error(err.message);
        });
        self._socket.on("end", function (err) {
            _this._state = 2;
            console.info("remote closed");
        });
    };
    PriceService.prototype.setHeartBeat = function (interval) {
        var _this = this;
        this._interval = interval > 5000 ? interval : 5000;
        setInterval(function () {
            if (_this._port && _this._host && _this._state === 2) {
                _this.setEndpoint(_this._port, _this._host);
                _this.sendCodes();
            }
        }, this._interval);
    };
    PriceService.prototype.register = function (innercodes) {
        var self = this;
        innercodes.forEach(function (code) {
            if (!self._innercodes.includes(code))
                self._innercodes.push(code);
        });
        this.sendCodes();
    };
    PriceService.prototype.sendCodes = function () {
        var obj = {
            header: {
                type: message_model_1.MsgType.PS_MSG_REGISTER, subtype: message_model_1.MsgType.PS_MSG_TYPE_MARKETDATA, msglen: 0
            },
            body: {
                innerCodes: this._innercodes
            }
        };
        // console.log(JSON.stringify(obj));
        this._socket.write(JSON.stringify(obj));
    };
    return PriceService;
}(core_1.EventEmitter));
PriceService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [])
], PriceService);
exports.PriceService = PriceService;
//# sourceMappingURL=priceService.js.map