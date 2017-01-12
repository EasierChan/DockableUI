/**
 * app store manager the apps.
 */
"use strict";
var electron_1 = require("electron");
var fs = require("fs");
var path = require("path");
var windows_1 = require("./windows");
var userDal_1 = require("../../dal/itrade/userDal");
var AppStore = (function () {
    function AppStore() {
    }
    AppStore.initStore = function (userApps) {
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
    AppStore.startupAnApp = function (name) {
        if (this._apps.hasOwnProperty(name)) {
            this._apps[name].StartUp.instance().bootstrap();
            return true;
        }
        else {
            return false;
        }
    };
    AppStore.authorize = function (username, password) {
        AppStore._userDal = AppStore._userDal || new userDal_1.UserDal();
        AppStore._userDal.on("connect", function () {
            AppStore._userDal.authorize(username, password);
        });
    };
    AppStore.bootstrap = function () {
        var contentWindow = new windows_1.ContentWindow({ state: { x: 200, y: 100, width: 1000, height: 600 } });
        contentWindow.loadURL(path.join(this._appstoreHome, "..", "workbench", "index.html"));
        this._apps[this._workbench] = contentWindow;
        // contentWindow.show();
        contentWindow.win.on("close", function (e) {
            e.preventDefault();
            contentWindow.win.hide();
        });
        electron_1.ipcMain.on("appstore://startupAnApp", function (event, appname) {
            event.returnValue = AppStore.startupAnApp(appname);
        });
        electron_1.ipcMain.on("appstore://login", function (event, loginInfo) {
            AppStore.authorize(loginInfo.username, loginInfo.password);
            AppStore._userDal.on("authorize", function (bRet) {
                if (bRet) {
                    AppStore._userDal.getUserProfile(loginInfo.username);
                }
                else {
                    event.returnValue = bRet;
                }
            });
            AppStore._userDal.on("userprofile", function (res) {
                var appIds = [];
                res.apps.forEach(function (item) {
                    appIds.push(item.id);
                });
                AppStore.initStore(appIds);
                event.returnValue = res.apps;
            });
            AppStore._userDal.on("error", function (error) {
                event.returnValue = false;
            });
        });
        // set tray icon
        AppStore._tray = new electron_1.Tray(path.join(__dirname, "..", "..", "..", "images", "AppStore.png"));
        var contextMenu = electron_1.Menu.buildFromTemplate([
            {
                label: "Show Workbench", click: function () {
                    contentWindow.show();
                }
            },
            {
                label: "Exit", click: function () {
                    contentWindow.win.removeAllListeners();
                    electron_1.app.quit();
                }
            }
        ]);
        AppStore._tray.setToolTip("This is appstore's Workbench.");
        AppStore._tray.setContextMenu(contextMenu);
    };
    AppStore.quit = function () {
        this._apps[this._workbench].close();
    };
    AppStore._appstoreHome = path.join(__dirname, "..", "..", "..", "..", "appstore");
    AppStore._apps = {};
    AppStore._workbench = "workbench";
    return AppStore;
}());
exports.AppStore = AppStore;
//# sourceMappingURL=appstore.js.map