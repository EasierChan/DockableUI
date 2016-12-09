'use strict';
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
var AppComponent = (function () {
    function AppComponent() {
        this.isAuthorized = false;
    }
    AppComponent.prototype.OnLogin = function () {
        //alert('hello')
        console.log(this.username, this.password);
        // send username and password to server. get user profile to determine which apps user can access.
        if (this.username == 'chenlei' && this.password == '123') {
            this.isAuthorized = true;
            this.apps = [
                {
                    name: 'Dockable-layout'
                },
                {
                    name: 'SpreadViewer'
                }
            ];
            return true;
        }
        else {
            $.Notify({
                caption: 'Error',
                content: 'Username or password wrong.',
                type: 'alert'
            });
            return false;
        }
    };
    AppComponent.prototype.OnReset = function () {
        this.username = '';
        this.password = '';
    };
    AppComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'body',
            templateUrl: 'workbench.html',
            styleUrls: ['appcomponent.css']
        }), 
        __metadata('design:paramtypes', [])
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