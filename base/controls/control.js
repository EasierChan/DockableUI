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
 */
var core_1 = require("@angular/core");
var DockContainerComponent = (function () {
    function DockContainerComponent() {
    }
    return DockContainerComponent;
}());
DockContainerComponent = __decorate([
    core_1.Component({
        selector: 'dock-control',
        template: "\n  <div class=\"{{className}}\">\n    <dock-control *ngFor=\"let child of children\" [className]=\"child.className\" [children]=\"child.children\">\n    </dock-control>\n  </div>\n  ",
        inputs: ['className', 'children']
    }),
    __metadata("design:paramtypes", [])
], DockContainerComponent);
exports.DockContainerComponent = DockContainerComponent;
var Control = (function () {
    function Control() {
    }
    return Control;
}());
exports.Control = Control;
var DockContainer = (function (_super) {
    __extends(DockContainer, _super);
    function DockContainer(type) {
        var _this = _super.call(this) || this;
        _this.children = [];
        if (type === "v") {
            _this.className = "dock-container vertical";
        }
        else {
            _this.className = "dock-container horizental";
        }
        return _this;
    }
    DockContainer.prototype.addChild = function (containerRef) {
        this.children.push(containerRef);
        return this;
    };
    return DockContainer;
}(Control));
exports.DockContainer = DockContainer;
var Splitter = (function (_super) {
    __extends(Splitter, _super);
    function Splitter(type) {
        var _this = _super.call(this) || this;
        _this.className = type == "v" ? "splitter-bar vertical" : "splitter-bar horizental";
        return _this;
    }
    return Splitter;
}(Control));
exports.Splitter = Splitter;
//# sourceMappingURL=control.js.map