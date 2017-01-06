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
// data Component
/**
 * author: chenlei
 * desc: components for acesss data, such as datatable, treeview, charts,
 */
var core_1 = require("@angular/core");
var control_1 = require("./control");
var echarts = require("../script/echart/echarts");
var DataTableComponent = (function () {
    function DataTableComponent() {
    }
    DataTableComponent.prototype.ngOnInit = function () {
        // console.log(this.dataSource);
    };
    DataTableComponent.prototype.ngAfterViewInit = function () {
    };
    DataTableComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "dock-table",
            template: "\n        <div class=\"tb-header\">\n            <div *ngFor=\"let col of dataSource.columns\" class=\"td\">\n                {{col.columnHeader}}\n            </div>\n        </div>\n        <div class=\"tb-body\">\n            <div class=\"tr\" *ngFor=\"let row of dataSource.rows\">\n                <div *ngFor=\"let col of row.values\" class=\"td\">\n                    {{col}}\n                </div>\n            </div>\n        <div>\n    ",
            inputs: ["className", "dataSource"]
        }), 
        __metadata('design:paramtypes', [])
    ], DataTableComponent);
    return DataTableComponent;
}());
exports.DataTableComponent = DataTableComponent;
var DataTable = (function (_super) {
    __extends(DataTable, _super);
    function DataTable() {
        _super.call(this);
        this.columns = [];
        this.rows = [];
        this.enableFooter = false;
        this.className = "table";
        this.dataSource = {
            columns: null,
            rows: null,
            enableFooter: this.enableFooter
        };
        this.styleObj = { type: null, width: null, height: null };
    }
    DataTable.prototype.newRow = function () {
        var row = new DataTableRow(this.columns.length);
        this.rows.push(row);
        this.dataSource.rows = this.rows;
        return row;
    };
    DataTable.prototype.addColumn = function (column) {
        this.columns.push(new DataTableColumn(column));
        this.dataSource.columns = this.columns;
        return this;
    };
    return DataTable;
}(control_1.Control));
exports.DataTable = DataTable;
var DataTableRow = (function () {
    function DataTableRow(columns) {
        this.columns = columns;
        this.values = new Array(this.columns);
    }
    return DataTableRow;
}());
exports.DataTableRow = DataTableRow;
var DataTableColumn = (function () {
    function DataTableColumn(columnHeader) {
        this.columnHeader = columnHeader;
    }
    return DataTableColumn;
}());
exports.DataTableColumn = DataTableColumn;
/**
 * chart components created by chenlei
 */
var EChartComponent = (function () {
    function EChartComponent(el, render) {
        this.el = el;
        this.render = render;
    }
    EChartComponent.prototype.ngOnInit = function () {
        // this.dataSource.init = () => {
        //   this._echart = echarts.init(this.el.nativeElement);
        //   this._echart.setOption(this.dataSource.option, true);
        //   window.addEventListener("resize", () => {
        //     this._echart.resize();
        //   });
        //   this.dataSource.setOption = (option) => {
        //     this._echart.setOption(option);
        //   };
        // };
    };
    EChartComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        if (this.dataSource.option) {
            setTimeout(function () {
                var myChart = echarts.init(_this.el.nativeElement);
                myChart.setOption(_this.dataSource.option, true);
                window.addEventListener("resize", function () {
                    myChart.resize();
                });
                _this.dataSource.setOption = function (option, notMerge) {
                    myChart.setOption(option, notMerge);
                };
            }, 100);
        }
    };
    EChartComponent = __decorate([
        core_1.Component({
            selector: "echart",
            template: "",
            inputs: [
                "className",
                "dataSource"
            ]
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef, core_1.Renderer])
    ], EChartComponent);
    return EChartComponent;
}());
exports.EChartComponent = EChartComponent;
var EChart = (function (_super) {
    __extends(EChart, _super);
    // private _option: Object = null;
    // private _events: Object = null;
    function EChart() {
        _super.call(this);
        this.styleObj = {
            type: "echart",
            width: null,
            height: null
        };
        this.dataSource = {
            option: {},
            events: {}
        };
    }
    EChart.prototype.init = function () {
        if (this.dataSource.init)
            this.dataSource.init();
        else
            console.error("echart::init failed.");
    };
    /**
     * @param option refer to http://echarts.baidu.com/option.html
     */
    EChart.prototype.setOption = function (option) {
        this.dataSource.option = option;
    };
    EChart.prototype.resetOption = function (option, notMerge) {
        if (notMerge === void 0) { notMerge = false; }
        if (this.dataSource.setOption) {
            this.dataSource.setOption(option, notMerge);
        }
    };
    EChart.prototype.setClassName = function (className) {
        this.className = className;
    };
    EChart.prototype.onClick = function (cb) {
        this.dataSource.events["click"] = cb;
    };
    return EChart;
}(control_1.Control));
exports.EChart = EChart;
var SpreadViewer = (function () {
    function SpreadViewer(priceServ) {
        this.priceServ = priceServ;
        this._msgs = {};
        this._lastIdx = {};
        this._firstIdx = -1;
        this._curIdx = -1;
        this._xInterval = 1000;
        this._multiplier = 1;
        this._marketdataType1 = "MARKETDATA";
        this._marketdataType2 = "MARKETDATA";
        this._echart = new EChart();
    }
    SpreadViewer.prototype.init = function () {
        this._echart.init();
    };
    SpreadViewer.prototype.hidden = function () {
        this._echart.setClassName("hidden");
    };
    SpreadViewer.prototype.show = function () {
        this._echart.setClassName("");
    };
    SpreadViewer.prototype.start = function () {
        var _this = this;
        this.priceServ.subscribeMarketData(this._innerCode1, this._marketdataType1, function (msg) {
            _this.setMarketData(msg);
        });
        this.priceServ.subscribeMarketData(this._innerCode2, this._marketdataType2, function (msg) {
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
            console.info(newOption);
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
    // only can change the names
    SpreadViewer.prototype.setConfig = function (config, bReset) {
        if (bReset === void 0) { bReset = false; }
        // this._width = config.width;
        // this._height = config.height;
        this._bReset = bReset;
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
        if (config.multiplier)
            this._multiplier = config.multiplier;
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
        if (!bReset)
            this._echart.setOption(echartOption);
        else
            this._echart.resetOption(echartOption, false);
        echartOption = null;
    };
    // get width(){
    //   return this._width;
    // }
    // get height(){
    //   return this._height;
    // }
    SpreadViewer.prototype.setEChartOption = function (option) {
        this._echart.resetOption(option);
    };
    Object.defineProperty(SpreadViewer.prototype, "names", {
        get: function () {
            if (!this._names || this._bReset) {
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
            if (!this._timePoints || this._bReset) {
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
            if (!this._values || this._bReset) {
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
    SpreadViewer.prototype.getSpreadValue1 = function (idx) {
        // console.info(idx, this._msgs[this._innerCode1], this._msgs[this._innerCode2]);
        return Math.round((this._msgs[this._innerCode1][idx].askPrice1 - this._coeff1 * this._msgs[this._innerCode2][idx].bidPrice1) * this._multiplier * 100) / 100;
    };
    SpreadViewer.prototype.getSpreadValue2 = function (idx) {
        return Math.round((this._msgs[this._innerCode1][idx].bidPrice1 - this._coeff2 * this._msgs[this._innerCode2][idx].askPrice1) * this._multiplier * 100) / 100;
    };
    SpreadViewer.prototype.index = function (timestamp) {
        var itime = Math.floor(timestamp / 1000);
        var ihour = Math.floor(itime / 10000);
        var iminute = Math.floor(itime % 10000 / 100);
        return (ihour - this._durations[0].start.hour) * 60 * 60 + (iminute - this._durations[0].start.minute) * 60 +
            +itime % 10000 % 100;
    };
    SpreadViewer.prototype.setMarketData = function (msg) {
        console.log(msg.Time, msg.UKey);
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
//# sourceMappingURL=data.component.js.map