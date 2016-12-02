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
var core_1 = require('@angular/core');
var control_1 = require('../base/controls/control');
var data_component_1 = require('../base/controls/data.component');
var user_component_1 = require('./user.component');
var AppComponent = (function () {
    function AppComponent() {
        this.className = "dock-container vertical";
        this.children = [];
    }
    AppComponent.prototype.ngOnInit = function () {
        // this.className = "dock-container vertical";
        // row 1
        var horizentalContainer = new control_1.DockContainer("h", null, 800);
        var leftPanel = new control_1.TabPanel();
        leftPanel.addTab("Toolbox", "Toolbox");
        leftPanel.addTab("Server", "Server");
        leftPanel.setActive("Toolbox");
        var child = new control_1.DockContainer("v").addChild(leftPanel);
        // col 1
        horizentalContainer.addChild(child);
        // Splitter
        horizentalContainer.addChild(new control_1.Splitter("v"));
        // col 2
        var btn_dayview = new user_component_1.MetaControl("btn");
        btn_dayview.Name = "test";
        btn_dayview.Value = "AllDayView";
        var lbl_min = new user_component_1.MetaControl("text-plain");
        lbl_min.Value = "Min:";
        var txt_min = new user_component_1.MetaControl("input-text");
        txt_min.Name = "min";
        txt_min.ModelVal = "";
        var lbl_max = new user_component_1.MetaControl("text-plain");
        lbl_max.Value = "Max:";
        var txt_max = new user_component_1.MetaControl("input-text");
        txt_max.Name = "max";
        txt_max.ModelVal = "";
        var lbl_tick = new user_component_1.MetaControl("text-plain");
        lbl_tick.Value = "Tick:";
        var txt_tick = new user_component_1.MetaControl("input-text");
        txt_tick.Name = "Tick";
        txt_tick.ModelVal = "";
        var lbl_TimeRange = new user_component_1.MetaControl("text-plain");
        lbl_TimeRange.Value = "TimeRange:";
        var txt_TimeRange = new user_component_1.MetaControl("input-text");
        txt_TimeRange.Name = "TimeRange";
        txt_TimeRange.ModelVal = "";
        var lbl_Slippage = new user_component_1.MetaControl("text-plain");
        lbl_Slippage.Value = "Slippage:";
        var txt_Slippage = new user_component_1.MetaControl("input-text");
        txt_Slippage.Name = "Slippage";
        txt_Slippage.ModelVal = "";
        var headControls = new user_component_1.ComboControl("row");
        headControls.addChild(btn_dayview);
        headControls.addChild(lbl_min);
        headControls.addChild(txt_min);
        headControls.addChild(lbl_max);
        headControls.addChild(txt_max);
        headControls.addChild(lbl_tick);
        headControls.addChild(txt_tick);
        headControls.addChild(lbl_TimeRange);
        headControls.addChild(txt_TimeRange);
        headControls.addChild(lbl_Slippage);
        headControls.addChild(txt_Slippage);
        btn_dayview.onClick(function () {
            console.log(JSON.stringify(txt_min.ModelVal));
        });
        var table = new data_component_1.DataTable();
        table.addColumn("姓名").addColumn("年龄").addColumn("性别").addColumn("成绩");
        for (var i = 0; i < 100; ++i) {
            var row = table.newRow();
            row.values[0] = "leige";
            row.values[1] = "1212";
            row.values[2] = "男";
            row.values[3] = "100.1";
        }
        var body = new user_component_1.ComboControl("col");
        body.addChild(headControls);
        body.addChild(table);
        horizentalContainer.addChild(new control_1.DockContainer("v", 800, null).addChild(body));
        horizentalContainer.addChild(new control_1.Splitter("v"));
        //col 3
        horizentalContainer.addChild(new control_1.DockContainer("v"));
        this.children.push(horizentalContainer);
        horizentalContainer = null;
        this.children.push(new control_1.Splitter("h"));
        // row 2
        horizentalContainer = new control_1.DockContainer("h");
        this.children.push(horizentalContainer);
        horizentalContainer = null;
    };
    AppComponent = __decorate([
        core_1.Component({
            selector: 'body',
            template: "\n    <div id=\"root\" [class]=\"className\">\n        <dock-control *ngFor=\"let child of children\" [className]=\"child.className\" [children]=\"child.children\" [styleObj]=\"child.styleObj\">\n        </dock-control>\n    </div>\n    <div class=\"dock-sn\">\n      <div class=\"dock-north\">\n        <div class=\"bar-block\"></div>\n        <div class=\"bar-arrow\"></div>\n      </div>\n      <div class=\"dock-south\">\n        <div class=\"bar-block\"></div>\n        <div class=\"bar-arrow\"></div>\n      </div>\n    </div>\n    <div class=\"dock-ew\">\n      <div class=\"dock-west\">\n        <div class=\"bar-block\"></div>\n        <div class=\"bar-arrow\"></div>\n      </div>\n      <div class=\"dock-center\"></div>\n      <div class=\"dock-east\">\n        <div class=\"bar-block\"></div>\n        <div class=\"bar-arrow\"></div>\n      </div>\n    </div>\n    <div class=\"dock-cover\"></div>\n    "
        }), 
        __metadata('design:paramtypes', [])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map