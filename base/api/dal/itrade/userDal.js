/**
 * chenlei 2017/01/11
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
var mongodb_1 = require("mongodb");
var events_1 = require("events");
var logger_1 = require("../../common/base/logger");
/**
 * access database file.
 * Event: 'error', 'connect', 'authorize', 'userprofile'
 */
var UserDal = (function (_super) {
    __extends(UserDal, _super);
    function UserDal(url, bReset) {
        if (url === void 0) { url = "mongodb://172.24.13.5:27016/itrade"; }
        if (bReset === void 0) { bReset = false; }
        var _this = _super.call(this) || this;
        _this.init();
        return _this;
    }
    UserDal.prototype.init = function (url, bReset) {
        if (url === void 0) { url = "mongodb://172.24.13.5:27016/itrade"; }
        if (bReset === void 0) { bReset = false; }
        var self = this;
        if (bReset === false && UserDal._db && UserDal._bConnected) {
            this.emit("connect");
            return;
        }
        // Use connect method to connect to the server
        mongodb_1.MongoClient.connect(url, function (err, db) {
            if (err) {
                logger_1.DefaultLogger.error(err.message);
                self.emit("error", err);
                return;
            }
            UserDal._db = db;
            // dbuser:dbpasswd
            UserDal._db.authenticate("itrade", "itrade", function (err2, res2) {
                if (err2) {
                    self.emit("error", err2);
                    return;
                }
                self.emit("connect");
                UserDal._bConnected = true;
            });
        });
    };
    UserDal.prototype.getUserProfile = function (username, password) {
        var self = this;
        this.on("connect", function () {
            var userprofiles = UserDal._db.collection("users");
            userprofiles.find({ name: username, password: password }, null, 0, 1, 1000).next(function (err, result) {
                if (err) {
                    self.emit("error", err);
                    return;
                }
                self.emit("userprofile", result);
            });
        });
        this.init();
    };
    return UserDal;
}(events_1.EventEmitter));
exports.UserDal = UserDal;
//# sourceMappingURL=userDal.js.map