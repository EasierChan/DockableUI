"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var control_1 = require("./control");
var UserControlComponent = (function () {
    function UserControlComponent() {
    }
    UserControlComponent.prototype.onClick = function () {
        this.dataSource.click();
    };
    UserControlComponent.prototype.ngAfterContentInit = function () {
        // console.log(JSON.stringify(this.children));
    };
    UserControlComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "usercontrol",
            template: "\n        <template ngFor let-child [ngForOf]=\"children\">\n            <span *ngIf=\"child.styleObj.type=='label'\" [class]=\"child.className\">\n                {{child.dataSource.value}}\n            </span>\n            <button *ngIf=\"child.styleObj.type=='button'\" [class]=\"child.className\" [name]=\"child.dataSource.name\"\n             (click)=\"child.dataSource.click()\">\n                {{child.dataSource.value}}\n            </button>\n            <input type=\"text\" *ngIf=\"child.styleObj.type=='textbox'\" [(ngModel)]=\"child.dataSource.modelVal\"\n             [class]=\"child.className\" [name]=\"child.dataSource.name\">\n            <input type=\"radio\" *ngIf=\"child.styleObj.type=='radiobtn'\" [class]=\"child.className\">\n            <input type=\"checkbox\" *ngIf=\"child.styleObj.type=='checkbox'\" [class]=\"child.className\">\n            <input type=\"range\" *ngIf=\"child.styleObj.type=='range'\" [class]=\"child.className\">\n            <dock-table *ngIf=\"child.className=='table'\" [className]=\"className\" [dataSource]=\"child.dataSource\"></dock-table>\n            <echart *ngIf=\"child.styleObj.type=='echart'\" [dataSource]=\"child.dataSource\"></echart>\n            <usercontrol *ngIf=\"child.className=='controls'\" [children]=\"child.children\" [dataSource]=\"child.dataSource\"\n             [class]=\"child.styleObj.type\">\n            </usercontrol>\n        </template>\n    ",
            inputs: ["children", "dataSource", "styleObj"]
        }), 
        __metadata('design:paramtypes', [])
    ], UserControlComponent);
    return UserControlComponent;
}());
exports.UserControlComponent = UserControlComponent;
var ComboControl = (function (_super) {
    __extends(ComboControl, _super);
    function ComboControl(type) {
        _super.call(this);
        this.className = "controls";
        this.styleObj = {
            type: type,
            width: null,
            height: null
        };
        this.children = [];
    }
    ComboControl.prototype.addChild = function (childControl) {
        this.children.push(childControl);
        return this;
    };
    return ComboControl;
}(control_1.Control));
exports.ComboControl = ComboControl;
var MetaControl = (function (_super) {
    __extends(MetaControl, _super);
    function MetaControl(type) {
        _super.call(this);
        this.styleObj = {
            type: type,
            width: null,
            height: null
        };
        this.dataSource = new Object();
    }
    MetaControl.prototype.onClick = function (aaa) {
        this.dataSource.click = aaa;
        // console.log(JSON.stringify(this.dataSource));
    };
    Object.defineProperty(MetaControl.prototype, "Class", {
        set: function (classStr) {
            this.className = classStr;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MetaControl.prototype, "Value", {
        set: function (value) {
            this.dataSource.value = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MetaControl.prototype, "ModelVal", {
        get: function () {
            return this.dataSource.modelVal;
        },
        set: function (value) {
            this.dataSource.modelVal = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MetaControl.prototype, "Name", {
        set: function (name) {
            this.dataSource.name = name;
        },
        enumerable: true,
        configurable: true
    });
    return MetaControl;
}(control_1.Control));
exports.MetaControl = MetaControl;
//# sourceMappingURL=user.component.js.map