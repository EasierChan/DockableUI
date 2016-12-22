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
        // let row1col1 = new DockContainer("v").addChild(leftPanel);
        // col 1
        // row1.addChild(row1col1);
        // Splitter
        // row1.addChild(new Splitter("v"));
        // col 2
        var btn_dayview = new user_component_1.MetaControl("button");
        btn_dayview.Class = "sd-button prespace";
        btn_dayview.Name = "test";
        btn_dayview.Value = "Change";
        var lbl_min = new user_component_1.MetaControl("label");
        lbl_min.Value = "Min:";
        var txt_min = new user_component_1.MetaControl("textbox");
        txt_min.Class = "sd-input";
        txt_min.Name = "min";
        txt_min.ModelVal = "";
        var lbl_max = new user_component_1.MetaControl("label");
        lbl_max.Value = "Max:";
        var txt_max = new user_component_1.MetaControl("textbox");
        txt_max.Class = "sd-input";
        txt_max.Name = "max";
        txt_max.ModelVal = "";
        var lbl_tick = new user_component_1.MetaControl("label");
        lbl_tick.Value = "Tick:";
        var txt_tick = new user_component_1.MetaControl("textbox");
        txt_tick.Class = "sd-input";
        txt_tick.Name = "Tick";
        txt_tick.ModelVal = "";
        var lbl_TimeRange = new user_component_1.MetaControl("label");
        lbl_TimeRange.Value = "TimeRange:";
        var txt_TimeRange = new user_component_1.MetaControl("textbox");
        txt_TimeRange.Class = "sd-input";
        txt_TimeRange.Name = "TimeRange";
        txt_TimeRange.ModelVal = "";
        var lbl_Slippage = new user_component_1.MetaControl("label");
        lbl_Slippage.Value = "Slippage:";
        var txt_Slippage = new user_component_1.MetaControl("textbox");
        txt_Slippage.Class = "sd-input";
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
        // headControls.addChild(lbl_TimeRange);
        // headControls.addChild(txt_TimeRange);
        // headControls.addChild(lbl_Slippage);
        // headControls.addChild(txt_Slippage);
        // let table: DataTable = new DataTable();
        // table.addColumn("姓名").addColumn("年龄").addColumn("性别").addColumn("成绩");
        var data = {
            keys: [],
            values: {},
            times: [],
            yMax: 1,
            yMin: 0
        };
        var spreadViewer = new SpreadViewer(this.priceServ);
        spreadViewer.setConfig({
            symbolCode1: "IF1701",
            innerCode1: 2008296,
            coeff1: 1,
            symbolCode2: "IF1703",
            innerCode2: 2006912,
            coeff2: 1,
            durations: [
                {
                    start: {
                        hour: 13,
                        minute: 30
                    },
                    end: {
                        hour: 15,
                        minute: 30
                    }
                }
            ]
        });
        btn_dayview.onClick(function () {
            var yaxis = {};
            if (txt_min.ModelVal.length > 0)
                yaxis.min = parseFloat(txt_min.ModelVal);
            if (txt_max.ModelVal.length > 0)
                yaxis.max = parseFloat(txt_max.ModelVal);
            if (txt_tick.ModelVal.length > 0)
                yaxis.interval = parseFloat(txt_tick.ModelVal);
            spreadViewer.setEChartOption({ yAxis: yaxis });
            yaxis = null;
        });
        var body = new user_component_1.ComboControl("col");
        body.addChild(headControls);
        body.addChild(spreadViewer.ControlRef);
        row1.addChild(new control_1.DockContainer("v", 800, null).addChild(body));
        this.children.push(row1);
        spreadViewer.start();
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
var SpreadViewer = (function () {
    function SpreadViewer(priceServ) {
        this.priceServ = priceServ;
        this._msgs = {};
        this._lastIdx = {};
        this._firstIdx = -1;
        this._curIdx = -1;
        this._xInterval = 1000;
        this._marketdataType1 = "MARKETDATA";
        this._marketdataType2 = "MARKETDATA";
        this._echart = new data_component_1.EChart();
    }
    SpreadViewer.prototype.start = function () {
        var _this = this;
        this.priceServ.subscribeMarketData([this._innerCode1, this._innerCode2], function (msg) {
            _this.setMarketData(msg);
        });
        this._timeoutHandler = setInterval(function () {
            if (_this._lastIdx[_this._innerCode1] === -1 || _this._lastIdx[_this._innerCode2] === -1)
                return;
            if (!_this._msgs[_this._innerCode1][_this._curIdx] || !_this._msgs[_this._innerCode2][_this._curIdx]) {
                console.warn("curIdx: " + _this._curIdx + " don't have data of both.");
                return;
            }
            // console.info(this._curIdx, this.values);
            _this.values[0][_this._curIdx] = _this.getSpreadValue1(_this._curIdx);
            _this.values[1][_this._curIdx] = _this.getSpreadValue2(_this._curIdx);
            var newOption = {
                series: [{
                        name: _this.names[0],
                        data: _this.values[0]
                    }, {
                        name: _this.names[1],
                        data: _this.values[1]
                    }]
            };
            _this.setEChartOption(newOption);
            ++_this._curIdx;
        }, SpreadViewer.xInternal);
    };
    Object.defineProperty(SpreadViewer.prototype, "ControlRef", {
        get: function () {
            return this._echart;
        },
        enumerable: true,
        configurable: true
    });
    SpreadViewer.prototype.setConfig = function (config) {
        this._symbolCode1 = config.symbolCode1;
        this._innerCode1 = config.innerCode1;
        this._coeff1 = config.coeff1;
        this._symbolCode2 = config.symbolCode2;
        this._innerCode2 = config.innerCode2;
        this._coeff2 = config.coeff2;
        this._durations = config.durations;
        if (config.marketdataType1)
            this._marketdataType1 = config.marketdataType1;
        if (config.marketdataType2)
            this._marketdataType2 = config.marketdataType2;
        if (config.xInterval)
            this._xInterval = config.xInterval;
        this._lastIdx[this._innerCode1] = -1;
        this._lastIdx[this._innerCode2] = -1;
        var echartOption = {
            title: {
                bottom: 10,
                text: "SpreadViewer"
            },
            tooltip: {
                trigger: "axis"
            },
            legend: {
                bottom: 10,
                data: this.names,
                textStyle: {
                    color: "#fff"
                }
            },
            grid: {
                left: 100,
                right: 80,
                bottom: 100,
                containLabel: false
            },
            xAxis: {
                type: "category",
                boundaryGap: false,
                data: this.timePoints
            },
            yAxis: {
                type: "value",
                min: "dataMin",
                max: "dataMax"
            },
            dataZoom: [
                {
                    type: "inside",
                    xAxisIndex: 0
                },
            ],
            series: [
                {
                    name: this.names[0],
                    type: "line",
                    // smooth: true,
                    data: this.values[0],
                    lineStyle: {
                        normal: {
                            width: 1
                        }
                    },
                    tooltip: {
                        formatter: function (param) {
                            return JSON.stringify(param);
                        }
                    }
                },
                {
                    name: this.names[1],
                    type: "line",
                    // smooth: true,
                    data: this.values[1],
                    lineStyle: {
                        normal: {
                            width: 1
                        }
                    }
                }
            ]
        };
        this._echart.setOption(echartOption);
        echartOption = null;
    };
    SpreadViewer.prototype.setEChartOption = function (option) {
        this._echart.resetOption(option);
    };
    Object.defineProperty(SpreadViewer.prototype, "names", {
        get: function () {
            if (!this._names) {
                this._names = [this.getSpreadTraceName1(), this.getSpreadTraceName2()];
            }
            return this._names;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpreadViewer.prototype, "timePoints", {
        get: function () {
            var _this = this;
            if (!this._timePoints) {
                this._timePoints = [];
                var today_1 = new Date(), min_date_1;
                this._durations.forEach(function (duration) {
                    var seconds = (duration.end.hour - duration.start.hour) * 3600 + (duration.end.minute - duration.start.minute) * 60;
                    var originLen = _this._timePoints.length;
                    _this._timePoints.length += seconds;
                    min_date_1 = new Date(today_1.getFullYear(), today_1.getMonth(), today_1.getDate(), duration.start.hour, duration.start.minute);
                    for (var sec = 0; sec < seconds; ++sec) {
                        _this._timePoints[originLen + sec] = min_date_1.toLocaleTimeString([], { hour12: false });
                        min_date_1.setSeconds(min_date_1.getSeconds() + 1);
                    }
                });
                min_date_1 = null;
                today_1 = null;
            }
            return this._timePoints;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpreadViewer.prototype, "values", {
        get: function () {
            var _this = this;
            if (!this._values) {
                this._values = new Array(this.names.length);
                this.names.forEach(function (name, index) {
                    _this._values[index] = new Array(_this.timePoints.length).fill(null);
                });
            }
            return this._values;
        },
        enumerable: true,
        configurable: true
    });
    SpreadViewer.prototype.getSpreadTraceName1 = function () {
        var namePrimary = this._symbolCode1 + ".askPrice1";
        var nameSecondary = this._symbolCode2 + ".bidPrice1";
        return namePrimary + "-" + (Math.abs(this._coeff1 - 1) < SpreadViewer.EPS ? "" : this._coeff1.toFixed(2) + " * ") + nameSecondary;
    };
    SpreadViewer.prototype.getSpreadTraceName2 = function () {
        var namePrimary = this._symbolCode1 + ".bidPrice1";
        var nameSecondary = this._symbolCode2 + ".askPrice1";
        return namePrimary + "-" + (Math.abs(this._coeff2 - 1) < SpreadViewer.EPS ? "" : this._coeff2.toFixed(2) + "*") + nameSecondary;
    };
    SpreadViewer.prototype.getSpreadValue1 = function (idx, multiplier) {
        if (multiplier === void 0) { multiplier = 1; }
        // console.info(idx, this._msgs[this._innerCode1], this._msgs[this._innerCode2]);
        return Math.round((this._msgs[this._innerCode1][idx].askPrice1 - this._coeff1 * this._msgs[this._innerCode2][idx].bidPrice1) * multiplier * 100) / 100;
    };
    SpreadViewer.prototype.getSpreadValue2 = function (idx, multiplier) {
        if (multiplier === void 0) { multiplier = 1; }
        return Math.round((this._msgs[this._innerCode1][idx].bidPrice1 - this._coeff2 * this._msgs[this._innerCode2][idx].askPrice1) * multiplier * 100) / 100;
    };
    SpreadViewer.prototype.index = function (timestamp) {
        var itime = Math.floor(timestamp / 1000);
        var ihour = Math.floor(itime / 10000);
        var iminute = Math.floor(itime % 10000 / 100);
        return (ihour - this._durations[0].start.hour) * 60 * 60 + (iminute - this._durations[0].start.minute) * 60 +
            +itime % 10000 % 100;
    };
    SpreadViewer.prototype.setMarketData = function (msg) {
        if (!msg.InstrumentID || !this.hasInstrumentID(msg.InstrumentID))
            return;
        var idx = this.index(msg.Time);
        if (idx > this.timePoints.length || idx < 0) {
            console.error("msg time: " + msg.Time + " is not valid");
            return;
        }
        if (!this._msgs[msg.UKey])
            this._msgs[msg.UKey] = {};
        if (!this._msgs[msg.UKey][idx])
            this._msgs[msg.UKey][idx] = {};
        this._msgs[msg.UKey][idx].askPrice1 = msg.AskPrice / SpreadViewer.YUAN_PER_UNIT;
        this._msgs[msg.UKey][idx].bidPrice1 = msg.BidPrice / SpreadViewer.YUAN_PER_UNIT;
        if (this._lastIdx[this._innerCode1] !== -1 && this._lastIdx[this._innerCode2] !== -1) {
            // console.info(msg.UKey, this._lastIdx, idx, this._msgs);
            for (var i = this._lastIdx[this._innerCode1] + 1; i < idx; ++i) {
                if (!this._msgs[this._innerCode1][i])
                    this._msgs[this._innerCode1][i] = {};
                this._msgs[this._innerCode1][i].askPrice1 = this._msgs[this._innerCode1][i - 1].askPrice1;
                this._msgs[this._innerCode1][i].bidPrice1 = this._msgs[this._innerCode1][i - 1].bidPrice1;
            }
            for (var i = this._lastIdx[this._innerCode2] + 1; i < idx; ++i) {
                if (!this._msgs[this._innerCode2][i])
                    this._msgs[this._innerCode2][i] = {};
                this._msgs[this._innerCode2][i].askPrice1 = this._msgs[this._innerCode2][i - 1].askPrice1;
                this._msgs[this._innerCode2][i].bidPrice1 = this._msgs[this._innerCode2][i - 1].bidPrice1;
            }
            if (msg.UKey === this._innerCode1 && idx > this._lastIdx[this._innerCode2]) {
                if (!this._msgs[this._innerCode2][idx])
                    this._msgs[this._innerCode2][idx] = {};
                this._msgs[this._innerCode2][idx].askPrice1 = this._msgs[this._innerCode2][idx - 1].askPrice1;
                this._msgs[this._innerCode2][idx].bidPrice1 = this._msgs[this._innerCode2][idx - 1].bidPrice1;
            }
            if (msg.UKey === this._innerCode2 && idx > this._lastIdx[this._innerCode1]) {
                if (!this._msgs[this._innerCode1][idx])
                    this._msgs[this._innerCode1][idx] = {};
                this._msgs[this._innerCode1][idx].askPrice1 = this._msgs[this._innerCode1][idx - 1].askPrice1;
                this._msgs[this._innerCode1][idx].bidPrice1 = this._msgs[this._innerCode1][idx - 1].bidPrice1;
            }
        }
        else if (this._lastIdx[this._innerCode1] === -1 && this._lastIdx[this._innerCode2] === -1) {
            this._firstIdx = idx;
        }
        else {
            if (this._lastIdx[this._innerCode1] === -1) {
                if (msg.UKey === this._innerCode1) {
                    // for (let i = this._lastIdx[this._innerCode2] + 1; i <= idx; ++i) {
                    //   if (!this._msgs[this._innerCode2][i])
                    //     this._msgs[this._innerCode2][i] = {};
                    //   this._msgs[this._innerCode2][i].askPrice1 = this._msgs[this._innerCode2][i - 1].askPrice1;
                    //   this._msgs[this._innerCode2][i].bidPrice1 = this._msgs[this._innerCode2][i - 1].bidPrice1;
                    // }
                    if (!this._msgs[this._innerCode2][idx])
                        this._msgs[this._innerCode2][idx] = {};
                    this._msgs[this._innerCode2][idx].askPrice1 = this._msgs[this._innerCode2][this._lastIdx[this._innerCode2]].askPrice1;
                    this._msgs[this._innerCode2][idx].bidPrice1 = this._msgs[this._innerCode2][this._lastIdx[this._innerCode2]].bidPrice1;
                    this._curIdx = idx;
                }
                else {
                }
            }
            else {
                if (msg.UKey === this._innerCode2) {
                    // for (let i = this._lastIdx[this._innerCode1] + 1; i <= idx; ++i) {
                    //   if (!this._msgs[this._innerCode1][i])
                    //     this._msgs[this._innerCode1][i] = {};
                    //   this._msgs[this._innerCode1][i].askPrice1 = this._msgs[this._innerCode1][i - 1].askPrice1;
                    //   this._msgs[this._innerCode1][i].bidPrice1 = this._msgs[this._innerCode1][i - 1].bidPrice1;
                    // }
                    if (!this._msgs[this._innerCode1][idx])
                        this._msgs[this._innerCode1][idx] = {};
                    this._msgs[this._innerCode1][idx].askPrice1 = this._msgs[this._innerCode1][this._lastIdx[this._innerCode1]].askPrice1;
                    this._msgs[this._innerCode1][idx].bidPrice1 = this._msgs[this._innerCode1][this._lastIdx[this._innerCode1]].bidPrice1;
                    this._curIdx = idx;
                }
                else {
                }
            }
        }
        this._lastIdx[msg.UKey] = idx;
    };
    SpreadViewer.prototype.hasInstrumentID = function (instrumentID) {
        return this._symbolCode1.startsWith(instrumentID.substr(0, 6)) || this._symbolCode2.startsWith(instrumentID.substr(0, 6));
    };
    SpreadViewer.prototype.dispose = function () {
        if (this._timeoutHandler) {
            clearTimeout(this._timeoutHandler);
        }
    };
    SpreadViewer.EPS = 1.0e-5;
    SpreadViewer.YUAN_PER_UNIT = 10000;
    SpreadViewer.xInternal = 1000; // ms
    return SpreadViewer;
}());
exports.SpreadViewer = SpreadViewer;
//# sourceMappingURL=app.component.js.map