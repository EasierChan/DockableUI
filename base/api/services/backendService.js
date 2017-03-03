"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var AppStoreService = (function () {
    function AppStoreService() {
    }
    AppStoreService.prototype.startApp = function (name) {
        return electron.ipcRenderer.sendSync("appstore://startupAnApp", name);
    };
    AppStoreService.prototype.getUserProfile = function (loginInfo) {
        return electron.ipcRenderer.sendSync("appstore://login", loginInfo);
    };
    return AppStoreService;
}());
AppStoreService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [])
], AppStoreService);
exports.AppStoreService = AppStoreService;
var Menu = (function () {
    function Menu() {
        this._menu = new electron.remote.Menu();
    }
    Menu.prototype.addItem = function (menuItem, pos) {
        if (pos) {
            this._menu.insert(pos, menuItem);
        }
        else {
            this._menu.append(menuItem);
        }
    };
    Menu.prototype.popup = function (x, y) {
        this._menu.popup();
    };
    return Menu;
}());
Menu = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [])
], Menu);
exports.Menu = Menu;
var MenuItem = (function () {
    function MenuItem() {
    }
    Object.defineProperty(MenuItem.prototype, "submenu", {
        set: function (value) {
            this._submenu = value;
        },
        enumerable: true,
        configurable: true
    });
    return MenuItem;
}());
MenuItem = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [])
], MenuItem);
exports.MenuItem = MenuItem;
//# sourceMappingURL=backendService.js.map