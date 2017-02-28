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
var SingletonWindowComponent = (function () {
    function SingletonWindowComponent() {
        this.className = "dock-container vertical";
        this.children = [];
    }
    SingletonWindowComponent.prototype.ngOnInit = function () {
        // this.className = "dock-container vertical";
        // row 1
        var row1 = new control_1.DockContainer("h", null, 800);
        var leftPanel = new control_1.TabPanel();
        leftPanel.addTab2("Toolbox", "Toolbox");
        leftPanel.addTab2("Server", "Server");
        leftPanel.setActive("Toolbox");
        var row1col1 = new control_1.DockContainer("v").addChild(leftPanel);
        // col 1
        row1.addChild(row1col1);
        // Splitter
        row1.addChild(new control_1.Splitter("v"));
        // col 2
        var btn_dayview = new control_1.MetaControl("button");
        btn_dayview.Name = "test";
        btn_dayview.Text = "AllDayView";
        var lbl_min = new control_1.MetaControl("label");
        lbl_min.Text = "Min:";
        var txt_min = new control_1.MetaControl("textbox");
        txt_min.Name = "min";
        txt_min.Text = "";
        var lbl_max = new control_1.MetaControl("label");
        lbl_max.Text = "Max:";
        var txt_max = new control_1.MetaControl("textbox");
        txt_max.Name = "max";
        txt_max.Text = "";
        var lbl_tick = new control_1.MetaControl("label");
        lbl_tick.Text = "Tick:";
        var txt_tick = new control_1.MetaControl("textbox");
        txt_tick.Name = "Tick";
        txt_tick.Text = "";
        var lbl_TimeRange = new control_1.MetaControl("label");
        lbl_TimeRange.Text = "TimeRange:";
        var txt_TimeRange = new control_1.MetaControl("textbox");
        txt_TimeRange.Name = "TimeRange";
        txt_TimeRange.Text = "";
        var lbl_Slippage = new control_1.MetaControl("label");
        lbl_Slippage.Text = "Slippage:";
        var txt_Slippage = new control_1.MetaControl("textbox");
        txt_Slippage.Name = "Slippage";
        txt_Slippage.Text = "";
        var headControls = new control_1.ComboControl("row");
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
        var table = new control_1.DataTable();
        table.addColumn("姓名").addColumn("年龄").addColumn("性别").addColumn("成绩");
        btn_dayview.OnClick(function () {
            for (var i = 0; i < 100; ++i) {
                var row = table.newRow();
                row.cells[0].Text = "leige";
                row.cells[0].Type = "button";
                row.cells[0].Class = "info";
                row.cells[1].Text = "18";
                row.cells[1].ReadOnly = true;
                row.cells[2].Text = "男";
                row.cells[3].Text = "100.1";
            }
        });
        var body = new control_1.ComboControl("col");
        body.addChild(headControls);
        body.addChild(table);
        body.addChild(headControls);
        row1.addChild(new control_1.DockContainer("v", 800, null).addChild(body));
        row1.addChild(new control_1.Splitter("v"));
        // col 3
        row1.addChild(new control_1.DockContainer("v"));
        this.children.push(row1);
        // splitter between row1 and row2
        this.children.push(new control_1.Splitter("h"));
        // row 2
        var row2 = new control_1.DockContainer("h");
        this.children.push(row2);
    };
    SingletonWindowComponent = __decorate([
        core_1.Component({
            selector: "body",
            template: "\n    <div id=\"root\" [class]=\"className\">\n        <dock-control *ngFor=\"let child of children\" [className]=\"child.className\" [children]=\"child.children\" [styleObj]=\"child.styleObj\">\n        </dock-control>\n    </div>\n    <div class=\"dock-sn\">\n      <div class=\"dock-north\">\n        <div class=\"bar-block\"></div>\n        <div class=\"bar-arrow\"></div>\n      </div>\n      <div class=\"dock-south\">\n        <div class=\"bar-block\"></div>\n        <div class=\"bar-arrow\"></div>\n      </div>\n    </div>\n    <div class=\"dock-ew\">\n      <div class=\"dock-west\">\n        <div class=\"bar-block\"></div>\n        <div class=\"bar-arrow\"></div>\n      </div>\n      <div class=\"dock-center\"></div>\n      <div class=\"dock-east\">\n        <div class=\"bar-block\"></div>\n        <div class=\"bar-arrow\"></div>\n      </div>\n    </div>\n    <div class=\"dock-cover\"></div>\n    "
        }), 
        __metadata('design:paramtypes', [])
    ], SingletonWindowComponent);
    return SingletonWindowComponent;
}());
exports.SingletonWindowComponent = SingletonWindowComponent;
//# sourceMappingURL=SingletonWindow.js.map