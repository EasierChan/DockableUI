/**
 * app store manager the apps.
 */
'use strict';
var fs = require('fs');
var windows_1 = require('./windows');
require('../../dal/itrade/priceDal');
var UApplication = (function () {
    function UApplication() {
    }
    UApplication.initStore = function (userApps) {
        var _this = this;
        fs.readdir(this._appstoreHome, function (err, files) {
            files.forEach(function (curfile) {
                fs.stat(_this._appstoreHome + curfile, function (err, stat) {
                    if (stat.isDirectory() && fs.existsSync(_this._appstoreHome + curfile + '/index.html')) {
                        if (userApps.indexOf(curfile) >= 0 || userApps[0] == '*')
                            _this._windows[curfile] = new windows_1.ContentWindow();
                    }
                });
            });
        });
    };
    UApplication.startupAnApp = function (name) {
        if (this._windows.hasOwnProperty(name)) {
            this._windows[name].loadURL(this._appstoreHome + name + '/index.html');
            this._windows[name].show();
        }
    };
    UApplication.bootstrap = function () {
        var contentWindow = new windows_1.ContentWindow();
        contentWindow.loadURL(this._appstoreHome + '../workbench' + '/index.html');
        this._windows[this._workbench] = contentWindow;
        contentWindow.show();
    };
    UApplication.quit = function () {
        this._windows[this._workbench].close();
    };
    UApplication._appstoreHome = __dirname + '/../../../../appstore/';
    UApplication._windows = {};
    UApplication._workbench = "workbench";
    return UApplication;
}());
exports.UApplication = UApplication;
//# sourceMappingURL=appstore.js.map