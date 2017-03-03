/**
 * App startup entry
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        // let menuWindow: MenuWindow = new MenuWindow({ state: { width: 300, height: 60 } });
        // menuWindow.ready().then(function () {
        //     console.log("when MenuWindow ready say: hello");
        // });
        // menuWindow.loadURL(__dirname + "/appstore/start/sample.html");
        // this._windowMgr.addMenuWindow(menuWindow);
        var contentWindow = new backend_1.ContentWindow({ state: { x: 0, y: 0, width: 1200, height: 800 } });
        contentWindow.loadURL(path.join(__dirname, "index.html"));
        contentWindow.setMenuBarVisibility(true);
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