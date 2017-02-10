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
    UserControlComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "usercontrol",
            template: "\n        <template ngFor let-child [ngForOf]=\"children\">\n            <span *ngIf=\"child.styleObj.type=='label'\" [class]=\"child.className\">\n                {{child.dataSource.text}}\n            </span>\n            <button *ngIf=\"child.styleObj.type=='button'\" class=\"btn btn-{{child.className}} btn-xs\" [name]=\"child.dataSource.name\"\n             (click)=\"child.dataSource.click()\" [style.margin-left.px]=\"child.styleObj.left\" [style.margin-top.px]=\"child.styleObj.top\">\n                {{child.dataSource.text}}\n            </button>\n            <label *ngIf=\"child.styleObj.type=='textbox'\" [style.margin-left.px]=\"child.styleObj.left\" [style.margin-top.px]=\"child.styleObj.top\">\n                <pre>{{child.dataSource.text}}</pre>\n                <input type=\"text\" [(ngModel)]=\"child.dataSource.modelVal\" [name]=\"child.dataSource.name\" placeholder=\"\" class=\"btn-{{child.className}} btn-xs\">\n             </label>\n             <div *ngIf=\"child.styleObj.type=='dropdown'\" [style.margin-left.px]=\"child.styleObj.left\" [style.margin-top.px]=\"child.styleObj.top\">\n                <pre>{{child.dataSource.text}}</pre>\n                <div class=\"btn-group\">\n                    <button type=\"button\" class=\"btn-xs btn-default dropdown-toggle\" (click)=\"child.dataSource.click()\">\n                        <pre>{{child.dataSource.selectedItem.Text}}</pre> <span class=\"caret\"></span>\n                    </button>\n                    <ul class=\"dropdown-menu\" [style.display]=\"child.dataSource.dropdown?'block':'none'\">\n                        <li *ngFor=\"let item of child.dataSource.items\" (click)=\"child.dataSource?.onselect(item)\"><a href=\"#\">{{item.Text}}</a></li>\n                    </ul>\n                </div>\n             </div>\n             <label *ngIf=\"child.styleObj.type=='radio'\">\n                {{child.dataSource.text}}\n                <input [name]=\"child.dataSource.name\" type=\"radio\"> \n             </label>\n            <label *ngIf=\"child.styleObj.type=='checkbox'\">\n                <input [name]=\"child.dataSource.name\" type=\"checkbox\" checked=\"checked\"> \n                <span style=\"break-word: keep-all\">{{child.dataSource.text}}</span>\n            </label>\n             <label *ngIf=\"child.styleObj.type=='range'\">\n                {{child.dataSource.text}} <input type=\"range\" [class]=\"child.className\">\n             </label>\n            <dock-table *ngIf=\"child.className=='table'\" [className]=\"className\" [dataSource]=\"child.dataSource\"></dock-table>\n            <echart *ngIf=\"child.styleObj.type=='echart'\" [dataSource]=\"child.dataSource\" [class]=\"child.className\"></echart>\n            <usercontrol *ngIf=\"child.className=='controls'\" [children]=\"child.children\" [dataSource]=\"child.dataSource\"\n             [class]=\"child.styleObj.type\" [style.min-width.px]=\"child.styleObj?.minWidth\" [style.min-height.px]=\"child.styleObj?.minHeight\">\n            </usercontrol>\n        </template>\n    ",
            inputs: ["children", "dataSource", "styleObj"]
        }), 
        __metadata('design:paramtypes', [])
    ], UserControlComponent);
    return UserControlComponent;
}());
exports.UserControlComponent = UserControlComponent;
var DockContainerComponent = (function () {
    function DockContainerComponent() {
    }
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], DockContainerComponent.prototype, "styleObj", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], DockContainerComponent.prototype, "dataSource", void 0);
    DockContainerComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "dock-control",
            templateUrl: "controlTree.html",
            inputs: ["className", "children"]
        }), 
        __metadata('design:paramtypes', [])
    ], DockContainerComponent);
    return DockContainerComponent;
}());
exports.DockContainerComponent = DockContainerComponent;
//# sourceMappingURL=user.component.js.map