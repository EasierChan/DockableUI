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
var control_1 = require("controls/control");
var AppComponent = (function () {
    function AppComponent() {
        this.children = [];
    }
    AppComponent.prototype.ngOnInit = function () {
        this.className = "dock-container vertical";
        var horizentalContainer = new control_1.DockContainer("h");
        var leftPanel = new control_1.TabPanel();
        leftPanel.addTab("Toolbox", "Toolbox");
        leftPanel.addTab("Server", "Server");
        leftPanel.setActive("Toolbox");
        var child = new control_1.DockContainer("v").addChild(leftPanel);
        horizentalContainer.addChild(child);
        horizentalContainer.addChild(new control_1.Splitter("v"));
        horizentalContainer.addChild(new control_1.DockContainer("v"));
        horizentalContainer.addChild(new control_1.Splitter("v"));
        horizentalContainer.addChild(new control_1.DockContainer("v"));
        this.children.push(horizentalContainer);
        horizentalContainer = null;
        this.children.push(new control_1.Splitter("h"));
        horizentalContainer = new control_1.DockContainer("h");
        this.children.push(horizentalContainer);
        horizentalContainer = null;
    };
    return AppComponent;
}());
AppComponent = __decorate([
    core_1.Component({
        selector: 'body',
        template: "\n    <div id=\"root\" class=\"{{className}}\">\n        <dock-control *ngFor=\"let child of children\" [className]=\"child.className\" [children]=\"child.children\">\n        </dock-control>\n    </div>\n    <div class=\"dock-ew\">\n      <div class=\"dock-west\">\n        <div class=\"bar-block\"></div>\n        <div class=\"bar-arrow\"></div>\n      </div>\n      <div class=\"dock-center\"></div>\n      <div class=\"dock-east\">\n        <div class=\"bar-block\"></div>\n        <div class=\"bar-arrow\"></div>\n      </div>\n    </div>\n    <div class=\"dock-sn\">\n      <div class=\"dock-north\">\n        <div class=\"bar-block\"></div>\n        <div class=\"bar-arrow\"></div>\n      </div>\n      <div class=\"dock-south\">\n        <div class=\"bar-block\"></div>\n        <div class=\"bar-arrow\"></div>\n      </div>\n    </div>\n    <div class=\"dock-cover\"></div>\n    "
    }),
    __metadata("design:paramtypes", [])
], AppComponent);
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map