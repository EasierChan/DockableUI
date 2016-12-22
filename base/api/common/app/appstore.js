/**
 * app store manager the apps.
 */
"use strict";
var electron_1 = require("electron");
var fs = require("fs");
var path = require("path");
var windows_1 = require("./windows");
var UApplication = (function () {
    function UApplication() {
    }
    UApplication.initStore = function (userApps) {
        var _this = this;
        fs.readdir(this._appstoreHome, function (err, files) {
            files.forEach(function (curfile) {
                fs.stat(path.join(_this._appstoreHome, curfile), function (err, stat) {
                    if (stat.isDirectory()) {
                        if (userApps.indexOf(curfile) >= 0 || userApps[0] === "*")
                            _this._apps[curfile] = require(path.join(_this._appstoreHome, curfile, "startup"));
                    }
                });
            });
        });
    };
    UApplication.startupAnApp = function (name) {
        if (this._apps.hasOwnProperty(name)) {
            this._apps[name].StartUp.instance().bootstrap();
            return true;
        }
        else {
            return false;
        }
    };
    UApplication.bootstrap = function () {
        var contentWindow = new windows_1.ContentWindow({ state: { x: 200, y: 100, width: 1000, height: 600 } });
        contentWindow.loadURL(path.join(this._appstoreHome, "..", "workbench", "index.html"));
        this._apps[this._workbench] = contentWindow;
        contentWindow.show();
        electron_1.ipcMain.on("appstore://startupAnApp", function (event, appname) {
            event.returnValue = UApplication.startupAnApp(appname);
        });
        electron_1.ipcMain.on("appstore://initStore", function (event, apps) {
            UApplication.initStore(apps);
        });
    };
    UApplication.quit = function () {
        this._apps[this._workbench].close();
    };
    UApplication._appstoreHome = path.join(__dirname, "..", "..", "..", "..", "appstore");
    UApplication._apps = {};
    UApplication._workbench = "workbench";
    return UApplication;
}());
exports.UApplication = UApplication;
//# sourceMappingURL=appstore.js.map