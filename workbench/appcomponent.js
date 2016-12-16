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
var backendService_1 = require("../base/api/services/backendService");
var core_1 = require("@angular/core");
var AppComponent = (function () {
    function AppComponent(appService) {
        this.appService = appService;
        this.isAuthorized = false;
    }
    AppComponent.prototype.OnLogin = function () {
        // alert("hello")
        console.log(this.username, this.password);
        // send username and password to server. get user profile to determine which apps user can access.
        if (this.username === "chenlei" && this.password === "123") {
            this.isAuthorized = true;
            this.apps = [
                {
                    id: "DockDemo",
                    name: "DockDemo",
                    desc: "Dockable-layout"
                },
                {
                    id: "SimpleDemo",
                    name: "SimpleDemo",
                    desc: "SpreadViewer"
                }
            ];
            var appnames_1 = [];
            this.apps.forEach(function (item) {
                appnames_1.push(item.name);
            });
            this.appService.initStore(appnames_1);
            return true;
        }
        else {
            this.showError("Error", "Username or password wrong.", "alert");
            return false;
        }
    };
    AppComponent.prototype.OnReset = function () {
        this.username = "";
        this.password = "";
    };
    AppComponent.prototype.OnStartApp = function (name) {
        if (name) {
            if (!this.appService.startApp(name))
                this.showError("Error", "start app error!", "alert");
        }
        else {
            this.showError("Error", "App is unvalid!", "alert");
        }
    };
    AppComponent.prototype.showError = function (caption, content, type) {
        $.Notify({
            caption: caption,
            content: content,
            type: type
        });
    };
    AppComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "body",
            templateUrl: "workbench.html",
            styleUrls: ["appcomponent.css"],
            providers: [
                backendService_1.AppStoreService
            ]
        }), 
        __metadata('design:paramtypes', [backendService_1.AppStoreService])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
/**
 * <div class="tile-square bg-orange fg-white" data-role="tile">
                    <div class="tile-content iconic">
                        <span class="icon mif-cloud"></span>
                        <span class="tile-label">Dockable-Layout</span>
                    </div>
                </div>
                <div class="title">
                <span class="close">&times;</span>
            </div>
 */
//# sourceMappingURL=appcomponent.js.map