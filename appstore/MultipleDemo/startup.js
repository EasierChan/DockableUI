/**
 * App startup entry
 */
"use strict";
var backend_1 = require("../../base/api/backend");
var path = require("path");
var StartUp = (function () {
    function StartUp() {
        this._windowMgr = new backend_1.UWindwManager();
    }
    /**
     * bootstrap
     */
    StartUp.prototype.bootstrap = function () {
        var _this = this;
        var menuWindow = new backend_1.MenuWindow({ state: { x: 500, y: 0, width: 300, height: 60 } });
        menuWindow.ready().then(function () {
            backend_1.DefaultLogger.info("when MenuWindow ready say: hello");
        });
        menuWindow.win.on("closed", function () {
            _this.quit();
        });
        menuWindow.loadURL(path.join(__dirname, "menu.html"));
        this._windowMgr.addMenuWindow(menuWindow);
        var singleton = new backend_1.SingletonWindow();
        singleton.loadURL(path.join(__dirname, "singleton.html"));
        this._windowMgr.addWindowToMenu(singleton, "SingletonWindow", { level1: 2 });
        var multiple = new backend_1.MultiWindow();
        multiple.loadURL(path.join(__dirname, "singleton.html"));
        this._windowMgr.addWindowToMenu(multiple, "MultipleWin", { level1: 2 });
        menuWindow.show();
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
        if (!StartUp._instance) {
            return new StartUp();
        }
    };
    return StartUp;
}());
exports.StartUp = StartUp;
//# sourceMappingURL=startup.js.map