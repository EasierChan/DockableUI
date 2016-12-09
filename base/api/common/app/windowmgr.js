"use strict";
var UWindwManager = (function () {
    function UWindwManager() {
    }
    UWindwManager.addMenuWindow = function (menuWindow) {
        if (!this._menuWindow) {
            this._menuWindow = menuWindow;
            this._menuWindow.onClosed = function () {
                UWindwManager.closeAll();
            };
            this._windows.push(this._menuWindow);
        }
    };
    /**
     * @description 添加菜单
     * @param window an instance of UWindow.
     * @param presentName item's presentation on MenuWindow, it supports
     * @param fatherPath presentItem attached to.
     */
    UWindwManager.addWindowToMenu = function (window, presentItem, fatherPath) {
        this._menuWindow.insertMenu(fatherPath, presentItem, function () {
            window.show();
        });
        this._windows.push(window);
    };
    /**
     * @description 广播消息
     */
    UWindwManager.broadcastMessage = function (message) {
    };
    /**
     * @description 发消息至某个窗口
     */
    UWindwManager.sendMessage = function (windowItem, message) {
    };
    /**
     * @description 关闭所有窗口
     */
    UWindwManager.closeAll = function () {
        this._windows.forEach(function (window) {
            window.close();
        });
    };
    UWindwManager._windows = [];
    UWindwManager._menuWindow = null;
    return UWindwManager;
}());
exports.UWindwManager = UWindwManager;
//# sourceMappingURL=windowmgr.js.map