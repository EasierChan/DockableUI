/**
 * autoupdater
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var os = require("os");
var common_1 = require("./common");
var UAutoUpdaterImpl = (function () {
    function UAutoUpdaterImpl() {
    }
    UAutoUpdaterImpl.prototype.setFeedURL = function (url) {
        this.url = url;
    };
    Object.defineProperty(UAutoUpdaterImpl.prototype, "cachePath", {
        get: function () {
            var result = path.join(os.tmpdir(), "universalui-update");
            return new Promise(function (c, e) { return common_1.mkdirp(result, null, function (err) { return err ? e(err) : c(result); }); });
        },
        enumerable: true,
        configurable: true
    });
    UAutoUpdaterImpl.prototype.checkForUpdates = function () {
        if (!this.url) {
            throw new Error("No feed url set");
        }
    };
    return UAutoUpdaterImpl;
}());
exports.UAutoUpdaterImpl = UAutoUpdaterImpl;
//# sourceMappingURL=updater.js.map