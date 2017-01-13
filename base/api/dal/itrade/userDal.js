/**
 * chenlei 2017/01/11
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
        _super.call(this);
    }
    UserDal.prototype.init = function (url, bReset) {
        if (url === void 0) { url = "mongodb://172.24.13.5:27016/itrade"; }
        if (bReset === void 0) { bReset = false; }
        var self = this;
        if (bReset === false && UserDal._db)
            return;
        // Use connect method to connect to the server
        mongodb_1.MongoClient.connect(url, function (err, db) {
            if (err) {
                logger_1.DefaultLogger.error(err);
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
            });
        });
    };
    UserDal.prototype.authorize = function (username, password) {
        if (UserDal._db === null) {
            this.emit("error", "need a db instance.");
            return;
        }
        var self = this;
        var userprofiles = UserDal._db.collection("users");
        userprofiles.count({ name: username, password: password }, function (err, nRet) {
            if (err) {
                logger_1.DefaultLogger.error(err);
                self.emit("error", err);
                return;
            }
            if (nRet > 0)
                self.emit("authorize", true);
            else
                self.emit("authorize", false);
        });
    };
    UserDal.prototype.getUserProfile = function (username) {
        var self = this;
        var userprofiles = UserDal._db.collection("users");
        userprofiles.find({ name: username }, null, 0, 1, 1000).next(function (err, result) {
            if (err) {
                self.emit("error", err);
                return;
            }
            self.emit("userprofile", result);
        });
    };
    return UserDal;
}(events_1.EventEmitter));
exports.UserDal = UserDal;
//# sourceMappingURL=userDal.js.map