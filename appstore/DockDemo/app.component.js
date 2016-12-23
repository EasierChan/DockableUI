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
var control_1 = require("../../base/controls/control");
var data_component_1 = require("../../base/controls/data.component");
var user_component_1 = require("../../base/controls/user.component");
var AppComponent = (function () {
    function AppComponent() {
        this.className = "dock-container vertical";
        this.children = [];
    }
    AppComponent.prototype.ngOnInit = function () {
        // this.className = "dock-container vertical";
        // row 1
        var row1 = new control_1.DockContainer("h", null, 800);
        var leftPanel = new control_1.TabPanel();
        leftPanel.addTab("Toolbox", "Toolbox");
        leftPanel.addTab("Server", "Server");
        leftPanel.setActive("Toolbox");
        var row1col1 = new control_1.DockContainer("v").addChild(leftPanel);
        // col 1
        row1.addChild(row1col1);
        // Splitter
        row1.addChild(new control_1.Splitter("v"));
        // col 2
        var btn_dayview = new user_component_1.MetaControl("button");
        btn_dayview.Name = "test";
        btn_dayview.Value = "AllDayView";
        // let lbl_min = new MetaControl("label");
        // lbl_min.Value = "Min:";
        var txt_min = new user_component_1.MetaControl("textbox");
        txt_min.Name = "min";
        txt_min.Value = "Min:";
        txt_min.ModelVal = "";
        var txt_max = new user_component_1.MetaControl("radio");
        txt_max.Name = "sex";
        txt_max.Value = "male:";
        txt_max.ModelVal = "";
        var txt_tick = new user_component_1.MetaControl("radio");
        txt_tick.Name = "sex";
        txt_tick.Value = "female:";
        txt_tick.ModelVal = "";
        var txt_TimeRange = new user_component_1.MetaControl("checkbox");
        txt_TimeRange.Name = "All";
        txt_TimeRange.Value = "All:";
        txt_TimeRange.ModelVal = "";
        var txt_Slippage = new user_component_1.MetaControl("range");
        txt_Slippage.Name = "TimeRange";
        txt_Slippage.Value = "TimeRange:";
        txt_Slippage.ModelVal = "";
        var headControls = new user_component_1.ComboControl("row");
        headControls.addChild(btn_dayview);
        // headControls.addChild(lbl_min);
        headControls.addChild(txt_min);
        headControls.addChild(txt_max);
        headControls.addChild(txt_tick);
        headControls.addChild(txt_TimeRange);
        headControls.addChild(txt_Slippage);
        var table = new data_component_1.DataTable();
        table.addColumn("姓名").addColumn("年龄").addColumn("性别").addColumn("成绩");
        btn_dayview.onClick(function () {
            for (var i = 0; i < 100; ++i) {
                var row = table.newRow();
                row.values[0] = "leige";
                row.values[1] = "1212";
                row.values[2] = "男";
                row.values[3] = "100.1";
            }
        });
        var body = new user_component_1.ComboControl("col");
        body.addChild(headControls);
        body.addChild(table);
        row1.addChild(new control_1.DockContainer("v", 800, null).addChild(body));
        row1.addChild(new control_1.Splitter("v"));
        // col 3
        var rightPanel = new control_1.TabPanel();
        rightPanel.addTab("Solution", "Solution");
        rightPanel.setActive("Solution");
        row1.addChild(new control_1.DockContainer("v").addChild(rightPanel));
        this.children.push(row1);
        // splitter between row1 and row2
        this.children.push(new control_1.Splitter("h"));
        // row 2
        var bottomPanel = new control_1.TabPanel();
        var outputPage = new control_1.TabPage("Output", "Output");
        bottomPanel.addTab2(outputPage);
        outputPage.setContent(body);
        bottomPanel.setActive(outputPage.id);
        var row2 = new control_1.DockContainer("h").addChild(bottomPanel);
        this.children.push(row2);
    };
    AppComponent = __decorate([
        core_1.Component({
            selector: "body",
            template: "\n    <div id=\"root\" [class]=\"className\">\n        <dock-control *ngFor=\"let child of children\" [className]=\"child.className\" [children]=\"child.children\" [styleObj]=\"child.styleObj\">\n        </dock-control>\n    </div>\n    <div class=\"dock-sn\">\n      <div class=\"dock-north\">\n        <div class=\"bar-block\"></div>\n        <div class=\"bar-arrow\"></div>\n      </div>\n      <div class=\"dock-south\">\n        <div class=\"bar-block\"></div>\n        <div class=\"bar-arrow\"></div>\n      </div>\n    </div>\n    <div class=\"dock-ew\">\n      <div class=\"dock-west\">\n        <div class=\"bar-block\"></div>\n        <div class=\"bar-arrow\"></div>\n      </div>\n      <div class=\"dock-center\"></div>\n      <div class=\"dock-east\">\n        <div class=\"bar-block\"></div>\n        <div class=\"bar-arrow\"></div>\n      </div>\n    </div>\n    <div class=\"dock-cover\"></div>\n    "
        }), 
        __metadata('design:paramtypes', [])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map