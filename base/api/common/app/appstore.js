/**
 * app store manager the apps.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var fs = require("fs");
var path = require("path");
var windows_1 = require("./windows");
var logger_1 = require("../base/logger");
var AppStore = (function () {
    function AppStore() {
    }
    AppStore.initStore = function (userApps) {
        fs.readdir(AppStore._appstoreHome, function (err, files) {
            if (err) {
                logger_1.DefaultLogger.info(err);
                return;
            }
            files.forEach(function (curfile) {
                if (fs.statSync(path.join(AppStore._appstoreHome, curfile)).isDirectory()) {
                    if (userApps.indexOf(curfile) >= 0 || userApps[0] === "*")
                        AppStore._apps[curfile] = require(path.join(AppStore._appstoreHome, curfile, "startup"));
                }
            });
            electron_1.ipcMain.emit("appstore://ready");
        });
    };
    AppStore.startupAnApp = function (name) {
        if (AppStore._apps.hasOwnProperty(name)) {
            AppStore._apps[name].StartUp.instance().bootstrap();
            return true;
        }
        else {
            return false;
        }
    };
    AppStore.bootstrap = function () {
        AppStore.parseCommandArgs();
        var contentWindow = new windows_1.ContentWindow({ state: { x: 0, y: 0, width: 1000, height: 800 } });
        contentWindow.loadURL(path.join(AppStore._appstoreHome, "..", "workbench", "index.html"));
        AppStore._apps[AppStore._workbench] = contentWindow;
        contentWindow.win.on("close", function (e) {
            e.preventDefault();
            contentWindow.win.hide();
        });
        electron_1.ipcMain.on("appstore://startupAnApp", function (event, appname) {
            event.returnValue = AppStore.startupAnApp(appname);
        });
        electron_1.ipcMain.on("appstore://login", function (event, loginInfo) {
            // begin test
            var apps = [
                {
                    id: "DockDemo",
                    name: "DockDemo",
                    desc: "TradeMonitor",
                    category: "Transanctional"
                }
            ];
            var appIds = [];
            apps.forEach(function (item) {
                appIds.push(item.id);
            });
            AppStore.initStore(appIds);
            AppStore._appInfo = apps;
            event.returnValue = apps;
            return;
            // end test
            // if (AppStore._appInfo) {
            //     event.returnValue = AppStore._appInfo;
            //     return;
            // }
            // AppStore._userDal = AppStore._userDal || new UserDal();
            // AppStore._userDal.on("error", (error) => {
            //     if (event !== null)
            //         event.returnValue = false;
            //     AppStore._bAuthorized = false;
            // });
            // AppStore._userDal.getUserProfile(loginInfo.username, loginInfo.password);
            // AppStore._userDal.on("userprofile", (res) => {
            //     let appIds = [];
            //     res.apps.forEach((item) => {
            //         appIds.push(item.id);
            //     });
            //     AppStore.initStore(appIds);
            //     AppStore._appInfo = res.apps;
            //     if (event !== null)
            //         event.returnValue = AppStore._appInfo;
            // });
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
        // work with args
        if (AppStore._env.hideStore !== true) {
            contentWindow.show();
        }
        if (AppStore._env.startapps && AppStore._env.startapps.length > 0
            && AppStore._env.username && AppStore._env.password) {
            electron_1.ipcMain.emit("appstore://login", null, { username: AppStore._env.username, password: AppStore._env.password });
            electron_1.ipcMain.on("appstore://ready", function () {
                AppStore._env.startapps.forEach(function (app) {
                    AppStore.startupAnApp(app);
                });
            });
        }
    };
    AppStore.quit = function () {
        AppStore._apps[AppStore._workbench].close();
    };
    AppStore.parseCommandArgs = function () {
        AppStore._env = AppStore._env || new Object();
        process.argv.forEach(function (arg) {
            if (arg === "--hide-store") {
                AppStore._env.hideStore = true;
            }
            else if (arg.startsWith("--startapps=")) {
                AppStore._env.startapps = arg.substr(12).split(",");
            }
            else if (arg.startsWith("--username=")) {
                AppStore._env.username = arg.substr(11);
            }
            else if (arg.startsWith("--password=")) {
                AppStore._env.password = arg.substr(11);
            }
        });
    };
    return AppStore;
}());
AppStore._bAuthorized = false;
AppStore._appstoreHome = path.join(__dirname, "..", "..", "..", "..", "appstore");
AppStore._apps = {};
AppStore._workbench = "workbench";
exports.AppStore = AppStore;
//# sourceMappingURL=appstore.js.map