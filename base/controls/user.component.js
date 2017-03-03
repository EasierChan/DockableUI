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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * created by chenlei
 * used to created custom user control based on className and dataSource.
 */
var core_1 = require("@angular/core");
var UserControlComponent = (function () {
    function UserControlComponent() {
    }
    UserControlComponent.prototype.ngAfterContentInit = function () {
        // console.log(JSON.stringify(this.children));
    };
    return UserControlComponent;
}());
UserControlComponent = __decorate([
    core_1.Component({
        moduleId: module.id,
        selector: "usercontrol",
        templateUrl: "usercontrol.html",
        inputs: ["children", "dataSource", "styleObj"]
    })
], UserControlComponent);
exports.UserControlComponent = UserControlComponent;
var DockContainerComponent = (function () {
    function DockContainerComponent() {
    }
    return DockContainerComponent;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], DockContainerComponent.prototype, "styleObj", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], DockContainerComponent.prototype, "dataSource", void 0);
DockContainerComponent = __decorate([
    core_1.Component({
        moduleId: module.id,
        selector: "dock-control",
        templateUrl: "controlTree.html",
        inputs: ["className", "children"]
    })
], DockContainerComponent);
exports.DockContainerComponent = DockContainerComponent;
//# sourceMappingURL=user.component.js.map