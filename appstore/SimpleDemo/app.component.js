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
var priceService_1 = require("../../base/api/services/priceService");
var AppComponent = (function () {
    function AppComponent(priceServ) {
        this.priceServ = priceServ;
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
        // row1.addChild(row1col1);
        // Splitter
        // row1.addChild(new Splitter("v"));
        // col 2
        var btn_dayview = new user_component_1.MetaControl("button");
        btn_dayview.Name = "test";
        btn_dayview.Value = "AllDayView";
        var lbl_min = new user_component_1.MetaControl("label");
        lbl_min.Value = "Min:";
        var txt_min = new user_component_1.MetaControl("textbox");
        txt_min.Name = "min";
        txt_min.ModelVal = "";
        var lbl_max = new user_component_1.MetaControl("label");
        lbl_max.Value = "Max:";
        var txt_max = new user_component_1.MetaControl("textbox");
        txt_max.Name = "max";
        txt_max.ModelVal = "";
        var lbl_tick = new user_component_1.MetaControl("label");
        lbl_tick.Value = "Tick:";
        var txt_tick = new user_component_1.MetaControl("textbox");
        txt_tick.Name = "Tick";
        txt_tick.ModelVal = "";
        var lbl_TimeRange = new user_component_1.MetaControl("label");
        lbl_TimeRange.Value = "TimeRange:";
        var txt_TimeRange = new user_component_1.MetaControl("textbox");
        txt_TimeRange.Name = "TimeRange";
        txt_TimeRange.ModelVal = "";
        var lbl_Slippage = new user_component_1.MetaControl("label");
        lbl_Slippage.Value = "Slippage:";
        var txt_Slippage = new user_component_1.MetaControl("textbox");
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
        // let table: DataTable = new DataTable();
        // table.addColumn("姓名").addColumn("年龄").addColumn("性别").addColumn("成绩");
        // btn_dayview.onClick(() => {
        //   for (let i = 0; i < 100; ++i) {
        //     let row = table.newRow();
        //     row.values[0] = "leige";
        //     row.values[1] = "1212";
        //     row.values[2] = "男";
        //     row.values[3] = "100.1";
        //   }
        // });
        var data = {
            keys: [],
            values: {},
            times: [],
            yMax: 1,
            yMin: 0
        };
        var spreadViewer = new SpreadViewer("IF1612", "2006622", 1, "IF1703", "2006912", 1);
        data.keys.push(spreadViewer.getSpreadTraceName1());
        data.keys.push(spreadViewer.getSpreadTraceName2());
        data.keys.forEach(function (item) {
            data.values[item] = new Array();
        });
        var today = new Date();
        var min_date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30, 0);
        function randomData(openPrice) {
            return (openPrice * 0.9 + Math.random() * openPrice * 0.2).toFixed(2);
        }
        for (var i = 9.5 * 60 * 60; i <= 11.5 * 60 * 60; ++i) {
            data.keys.forEach(function (item) {
                data.values[item].push(null);
            });
            data.times.push(min_date.getHours() + ":" + (min_date.getMinutes() < 10 ? "0" : "") + min_date.getMinutes()
                + ":" + (min_date.getSeconds() < 10 ? "0" : "") + min_date.getSeconds());
            min_date.setSeconds(min_date.getSeconds() + 1);
        }
        min_date.setMinutes(min_date.getMinutes() + 89);
        for (var i = 13 * 60 * 60; i <= 15 * 60 * 60; ++i) {
            data.keys.forEach(function (item) {
                data.values[item].push(null);
            });
            data.times.push(min_date.getHours() + ":" + (min_date.getMinutes() < 10 ? "0" : "") + min_date.getMinutes()
                + ":" + (min_date.getSeconds() < 10 ? "0" : "") + min_date.getSeconds());
            min_date.setSeconds(min_date.getSeconds() + 1);
        }
        // console.log(values, times);
        var echart = new data_component_1.EChart();
        echart.setOption({
            title: {
                bottom: 10,
                text: "SpreadViewer"
            },
            tooltip: {
                trigger: "axis"
            },
            legend: {
                bottom: 10,
                data: data.keys,
                textStyle: {
                    color: "#fff"
                }
            },
            grid: {
                left: "10%",
                right: "8%",
                bottom: "15%",
                containLabel: false
            },
            xAxis: {
                type: "category",
                boundaryGap: false,
                data: data.times
            },
            yAxis: {
                type: "value"
            },
            series: [
                {
                    name: data.keys[0],
                    type: "line",
                    smooth: true,
                    data: data.values[data.keys[0]],
                    lineStyle: {
                        normal: {
                            width: 1
                        }
                    }
                },
                {
                    name: data.keys[1],
                    type: "line",
                    smooth: true,
                    data: data.values[data.keys[1]],
                    lineStyle: {
                        normal: {
                            width: 1
                        }
                    }
                }
            ]
        });
        // console.log(data.values, data.values["IF1612"])
        var count = 0;
        this.priceServ.subscribeMarketData([2006622, 2006912], function (msg) {
            var time = msg.Time / 100000;
            var idx = (time / 100 > 21 ? time / 100 - 21 + 2 : time / 100 - 17.5) * 60 * 60 + time % 100;
            if (idx > 241 * 60)
                return;
            if (msg.InstrumentID && spreadViewer.hasInstrumentID(msg.InstrumentID)) {
                var pair = spreadViewer.getSpreadValuePair(idx, msg);
                if (pair === null)
                    return;
                data.values[data.keys[0]][Math.round(idx)] = pair.a; // tradeTime
                data.values[data.keys[1]][Math.round(idx)] = pair.b; // tradeTime
                echart.resetOption({
                    series: [{
                            name: data.keys[0],
                            data: data.values[data.keys[0]]
                        }, {
                            name: data.keys[1],
                            data: data.values[data.keys[1]]
                        }]
                });
            }
        });
        var body = new user_component_1.ComboControl("col");
        body.addChild(headControls);
        body.addChild(echart);
        row1.addChild(new control_1.DockContainer("v", 800, null).addChild(body));
        this.children.push(row1);
    };
    AppComponent = __decorate([
        core_1.Component({
            selector: "body",
            template: "\n    <div id=\"root\" [class]=\"className\">\n        <dock-control *ngFor=\"let child of children\" [className]=\"child.className\" [children]=\"child.children\" [styleObj]=\"child.styleObj\">\n        </dock-control>\n    </div>\n    <div class=\"dock-sn\">\n      <div class=\"dock-north\">\n        <div class=\"bar-block\"></div>\n        <div class=\"bar-arrow\"></div>\n      </div>\n      <div class=\"dock-south\">\n        <div class=\"bar-block\"></div>\n        <div class=\"bar-arrow\"></div>\n      </div>\n    </div>\n    <div class=\"dock-ew\">\n      <div class=\"dock-west\">\n        <div class=\"bar-block\"></div>\n        <div class=\"bar-arrow\"></div>\n      </div>\n      <div class=\"dock-center\"></div>\n      <div class=\"dock-east\">\n        <div class=\"bar-block\"></div>\n        <div class=\"bar-arrow\"></div>\n      </div>\n    </div>\n    <div class=\"dock-cover\"></div>\n    ",
            providers: [
                priceService_1.PriceService
            ]
        }), 
        __metadata('design:paramtypes', [priceService_1.PriceService])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
var EPS = 1.0e-5;
var YUAN_PER_UNIT = 10000;
var SpreadViewer = (function () {
    function SpreadViewer(symbolCode1, innerCode1, coeff1, symbolCode2, innerCode2, coeff2, marketdataType1, marketdataType2) {
        if (marketdataType1 === void 0) { marketdataType1 = "MARKETDATA"; }
        if (marketdataType2 === void 0) { marketdataType2 = "MARKETDATA"; }
        this.symbolCode1 = symbolCode1;
        this.innerCode1 = innerCode1;
        this.coeff1 = coeff1;
        this.symbolCode2 = symbolCode2;
        this.innerCode2 = innerCode2;
        this.coeff2 = coeff2;
        this.marketdataType1 = marketdataType1;
        this.marketdataType2 = marketdataType2;
        this._msgs = {};
    }
    SpreadViewer.prototype.getSpreadTraceName1 = function () {
        var namePrimary = this.symbolCode1 + ".askPrice1";
        var nameSecondary = this.symbolCode2 + ".bidPrice1";
        return namePrimary + "-" + (Math.abs(this.coeff1 - 1) < EPS ? "" : this.coeff1.toFixed(4) + " * ") + nameSecondary;
    };
    SpreadViewer.prototype.getSpreadTraceName2 = function () {
        var namePrimary = this.symbolCode1 + ".bidPrice1";
        var nameSecondary = this.symbolCode2 + ".askPrice1";
        return namePrimary + "-" + (Math.abs(this.coeff2 - 1) < EPS ? "" : this.coeff2.toFixed(4) + "*") + nameSecondary;
    };
    SpreadViewer.prototype.getSpreadValue1 = function (idx, multiplier) {
        if (multiplier === void 0) { multiplier = 1; }
        return (this._msgs[this.innerCode1][idx].askPrice1 - this.coeff1 * this._msgs[this.innerCode2][idx].bidPrice1) * multiplier;
    };
    SpreadViewer.prototype.getSpreadValue2 = function (idx, multiplier) {
        if (multiplier === void 0) { multiplier = 1; }
        return (this._msgs[this.innerCode1][idx].bidPrice1 - this.coeff2 * this._msgs[this.innerCode2][idx].askPrice1) * multiplier;
    };
    SpreadViewer.prototype.getSpreadValuePair = function (idx, msg) {
        if (!this._msgs.hasOwnProperty(msg.UKey))
            this._msgs[msg.UKey] = {};
        if (!this._msgs[msg.UKey].hasOwnProperty(idx))
            this._msgs[msg.UKey][idx] = {};
        this._msgs[msg.UKey][idx].askPrice1 = msg.AskPrice / YUAN_PER_UNIT;
        this._msgs[msg.UKey][idx].bidPrice1 = msg.BidPrice / YUAN_PER_UNIT;
        if (this._msgs[this.innerCode1] && this._msgs[this.innerCode1].hasOwnProperty(idx) &&
            this._msgs[this.innerCode2] && this._msgs[this.innerCode2].hasOwnProperty(idx)) {
            return {
                a: this.getSpreadValue1(idx),
                b: this.getSpreadValue2(idx)
            };
        }
        else {
            return null;
        }
    };
    SpreadViewer.prototype.hasInstrumentID = function (instrumentID) {
        return this.symbolCode1.startsWith(instrumentID.substr(0, 6)) || this.symbolCode2.startsWith(instrumentID.substr(0, 6));
    };
    return SpreadViewer;
}());
exports.SpreadViewer = SpreadViewer;
//# sourceMappingURL=app.component.js.map