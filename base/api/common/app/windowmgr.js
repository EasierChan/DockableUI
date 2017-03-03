"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UWindwManager = (function () {
    function UWindwManager() {
        this._windows = [];
        this._menuWindow = null;
    }
    /**
     * add menu window
     */
    UWindwManager.prototype.addMenuWindow = function (menuWindow) {
        var _this = this;
        if (!this._menuWindow) {
            this._menuWindow = menuWindow;
            this._menuWindow.onClosed = function () {
                _this.closeAll();
            };
            this._windows.push(this._menuWindow);
        }
    };
    /**
     * add content window
     */
    UWindwManager.prototype.addContentWindow = function (contentWindow) {
        this._windows.push(contentWindow);
    };
    /**
     * @description 添加菜单
     * @param window an instance of UWindow.
     * @param presentName item"s presentation on MenuWindow, it supports
     * @param fatherPath presentItem attached to.
     */
    UWindwManager.prototype.addWindowToMenu = function (window, presentItem, fatherPath) {
        this._windows.push(window);
        this._menuWindow.insertMenu(fatherPath, presentItem, function () {
            window.show();
        });
    };
    /**
     * @description 广播消息
     */
    UWindwManager.prototype.broadcastMessage = function (message) {
    };
    /**
     * @description 发消息至某个窗口
     */
    UWindwManager.prototype.sendMessage = function (windowItem, message) {
    };
    /**
     * @description 关闭所有窗口
     */
    UWindwManager.prototype.closeAll = function () {
        this._windows.forEach(function (window) {
            if (window.win !== null) {
                window.win.removeAllListeners();
                window.close();
            }
        });
    };
    return UWindwManager;
}());
exports.UWindwManager = UWindwManager;
//# sourceMappingURL=windowmgr.js.map