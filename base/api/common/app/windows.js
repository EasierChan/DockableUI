"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 *
 */
var logger_1 = require("../base/logger");
var window_1 = require("../base/window");
// MenuWindow 
var MenuWindow = (function (_super) {
    __extends(MenuWindow, _super);
    function MenuWindow(config) {
        if (config) {
            config.state.wStyle = window_1.WindowStyle.System;
            config.menuTemplate = [
                {
                    label: "文件",
                    submenu: [
                        {
                            label: "退出",
                            role: "quit"
                        }
                    ]
                },
                {
                    label: "查看"
                },
                {
                    label: "窗口"
                },
                {
                    label: "帮助"
                }
            ];
        }
        // 修改最小高度
        window_1.UWindow.MIN_HEIGHT = 30;
        _super.call(this, config);
        this._defaultTemplate = config.menuTemplate;
        this.build();
    }
    MenuWindow.prototype.insertMenu = function (pos, name, clickCallback) {
        if (pos.level1 >= this._defaultTemplate.length || pos.level1 < 0) {
            logger_1.DefaultLogger.error("菜单设置不合法！");
            return;
        }
        var menuItem = {
            label: name,
            click: clickCallback
        };
        if (!this._defaultTemplate[pos.level1].hasOwnProperty("submenu"))
            this._defaultTemplate[pos.level1]["submenu"] = [];
        if (pos.level2 == null) {
            this._defaultTemplate[pos.level1]["submenu"].push(menuItem);
            this.setMenu(this._defaultTemplate);
            return;
        }
        if (pos.level2 < 0 || pos.level2 >= this._defaultTemplate[pos.level1]["submenu"].length) {
            logger_1.DefaultLogger.error("菜单设置不合法！");
            return;
        }
        if (pos.level2 && !this._defaultTemplate[pos.level2].hasOwnProperty("submenu"))
            this._defaultTemplate[pos.level1]["submenu"][pos.level2]["submenu"] = [];
        this._defaultTemplate[pos.level1]["submenu"][pos.level2]["submenu"].push(menuItem);
        this.setMenu(this._defaultTemplate);
    };
    return MenuWindow;
}(window_1.UWindow));
exports.MenuWindow = MenuWindow;
var ContentWindow = (function (_super) {
    __extends(ContentWindow, _super);
    function ContentWindow(config) {
        _super.call(this, config);
    }
    return ContentWindow;
}(window_1.UWindow));
exports.ContentWindow = ContentWindow;
// Win10 start menu Container
var StartWindow = (function (_super) {
    __extends(StartWindow, _super);
    function StartWindow(config) {
        _super.call(this, config);
    }
    StartWindow.prototype.addAppItem = function (appname, option) {
    };
    return StartWindow;
}(window_1.UWindow));
exports.StartWindow = StartWindow;
//# sourceMappingURL=windows.js.map