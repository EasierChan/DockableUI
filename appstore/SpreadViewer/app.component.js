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
var priceService_1 = require("../../base/api/services/priceService");
var AppComponent = (function () {
    function AppComponent(priceServ) {
        this.priceServ = priceServ;
        this.className = "dock-container vertical";
        this.children = [];
    }
    AppComponent.prototype.clickItem = function (item) {
        var _this = this;
        this.bHiddenProfile = true;
        this.profiles.forEach(function (profile, index) {
            if (profile === item) {
                _this.currentViewer = _this.spreadviewers[index];
                _this.currentViewer.show();
                window.resizeBy(1, 1);
            }
        });
        this.currentViewer.start();
    };
    AppComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.bHiddenProfile = false;
        var row1 = new control_1.DockContainer("h", null, 800);
        var btn_dayview = new control_1.MetaControl("button");
        btn_dayview.Class = "sd-button prespace";
        btn_dayview.Name = "test";
        btn_dayview.Text = "Change";
        var lbl_min = new control_1.MetaControl("label");
        lbl_min.Text = "Min:";
        var txt_min = new control_1.MetaControl("textbox");
        txt_min.Class = "sd-input";
        txt_min.Name = "min";
        txt_min.ModelVal = "";
        var lbl_max = new control_1.MetaControl("label");
        lbl_max.Text = "Max:";
        var txt_max = new control_1.MetaControl("textbox");
        txt_max.Class = "sd-input";
        txt_max.Name = "max";
        txt_max.ModelVal = "";
        var lbl_tick = new control_1.MetaControl("label");
        lbl_tick.Text = "Tick:";
        var txt_tick = new control_1.MetaControl("textbox");
        txt_tick.Class = "sd-input";
        txt_tick.Name = "Tick";
        txt_tick.ModelVal = "";
        var lbl_TimeRange = new control_1.MetaControl("label");
        lbl_TimeRange.Text = "TimeRange:";
        var txt_TimeRange = new control_1.MetaControl("textbox");
        txt_TimeRange.Class = "sd-input";
        txt_TimeRange.Name = "TimeRange";
        txt_TimeRange.ModelVal = "";
        var lbl_Slippage = new control_1.MetaControl("label");
        lbl_Slippage.Text = "Slippage:";
        var txt_Slippage = new control_1.MetaControl("textbox");
        txt_Slippage.Class = "sd-input";
        txt_Slippage.Name = "Slippage";
        txt_Slippage.ModelVal = "";
        var headControls = new control_1.ComboControl("row");
        headControls.addChild(btn_dayview);
        headControls.addChild(lbl_min);
        headControls.addChild(txt_min);
        headControls.addChild(lbl_max);
        headControls.addChild(txt_max);
        headControls.addChild(lbl_tick);
        headControls.addChild(txt_tick);
        var body = new control_1.ComboControl("col");
        body.addChild(headControls);
        this.profiles = [];
        this.spreadviewers = [];
        this.profiles = electron.ipcRenderer.sendSync("svc://get-config", null);
        this.profiles.forEach(function (profile, index) {
            _this.spreadviewers.push(new control_1.SpreadViewer(_this.priceServ));
            _this.spreadviewers[index].setConfig(profile);
            _this.spreadviewers[index].hidden();
            body.addChild(_this.spreadviewers[index].ControlRef);
        });
        btn_dayview.onClick(function () {
            var yaxis = {};
            if (txt_min.ModelVal.length > 0)
                yaxis.min = parseFloat(txt_min.ModelVal);
            if (txt_max.ModelVal.length > 0)
                yaxis.max = parseFloat(txt_max.ModelVal);
            if (txt_tick.ModelVal.length > 0)
                yaxis.interval = parseFloat(txt_tick.ModelVal);
            _this.currentViewer.setEChartOption({ yAxis: yaxis });
            yaxis = null;
        });
        row1.addChild(new control_1.DockContainer("v", 800, null).addChild(body));
        this.children.push(row1);
    };
    AppComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "body",
            templateUrl: "spreadview.html",
            styleUrls: ["spreadview.css"],
            providers: [
                priceService_1.PriceService
            ]
        }), 
        __metadata('design:paramtypes', [priceService_1.PriceService])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map