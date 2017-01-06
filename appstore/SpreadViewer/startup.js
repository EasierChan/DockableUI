/**
 * App startup entry
 */
"use strict";
var backend_1 = require("../../base/api/backend");
var path = require("path");
var fs = require("fs");
var electron_1 = require("electron");
var StartUp = (function () {
    function StartUp() {
        this._windowMgr = new backend_1.UWindwManager();
    }
    /**
     * bootstrap
     */
    StartUp.prototype.bootstrap = function () {
        var bHasConfig = false;
        var svcpath = null;
        process.argv.forEach(function (arg) {
            if (arg.startsWith("--svc=")) {
                bHasConfig = true;
                svcpath = arg.substr(6);
            }
        });
        if (!bHasConfig) {
            electron_1.dialog.showMessageBox({
                title: "Startup Error",
                type: "error",
                message: "spreadviewer config need to be specified.",
                detail: "--svc=filepath",
                buttons: ["Got it"]
            });
            return;
        }
        electron_1.ipcMain.on("svc://get-config", function (e, arg) {
            e.returnValue = path.isAbsolute(svcpath) ? JSON.parse(fs.readFileSync(svcpath, { encoding: "utf-8" }))
                : JSON.parse(fs.readFileSync(path.join(process.cwd(), svcpath), { encoding: "utf-8" }));
        });
        var contentWindow = new backend_1.ContentWindow();
        contentWindow.loadURL(path.join(__dirname, "index.html"));
        this._windowMgr.addContentWindow(contentWindow);
        contentWindow.show();
    };
    /**
     * quit
     */
    StartUp.prototype.quit = function () {
        this._windowMgr.closeAll();
    };
    /**
     * restart
     */
    StartUp.prototype.restart = function () {
        this.quit();
        this.bootstrap();
    };
    StartUp.instance = function () {
        return new StartUp();
    };
    return StartUp;
}());
exports.StartUp = StartUp;
//# sourceMappingURL=startup.js.map