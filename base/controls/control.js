"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var EventEmitter = require("@node/events");
var Control = (function () {
    function Control() {
    }
    return Control;
}());
exports.Control = Control;
var DockContainer = (function (_super) {
    __extends(DockContainer, _super);
    function DockContainer(type, width, height) {
        _super.call(this);
        if (type === "v") {
            this.className = "dock-container vertical";
            this.styleObj = {
                type: "",
                width: width === undefined ? 300 : width,
                height: null
            };
        }
        else {
            this.className = "dock-container horizental";
            this.styleObj = {
                type: "",
                width: null,
                height: height === undefined ? 200 : height
            };
        }
        this.children = [];
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
        _super.call(this);
        this.className = type === "v" ? "splitter-bar vertical" : "splitter-bar horizental";
    }
    return Splitter;
}(Control));
exports.Splitter = Splitter;
var TabPanel = (function (_super) {
    __extends(TabPanel, _super);
    function TabPanel() {
        _super.call(this);
        this.pages = new TabPages();
        this.headers = new TabHeaders();
        this.className = "tab-panel";
        this.children = [];
        this.children.push(this.pages);
        this.children.push(this.headers);
    }
    /**
     * @param pageId connection between header and title
     * @param pageTitle show the tab desc
     */
    TabPanel.prototype.addTab2 = function (pageId, pageTitle) {
        this.headers.addHeader(new TabHeader(pageId));
        this.pages.addPage(new TabPage(pageId, pageTitle));
        return this;
    };
    TabPanel.prototype.addTab = function (page) {
        this.headers.addHeader(new TabHeader(page.id));
        this.pages.addPage(page);
        return this;
    };
    TabPanel.prototype.setActive = function (pageId) {
        this.pages.getAllPage().forEach(function (page) {
            if (page.id === pageId)
                page.setActive();
        });
        this.headers.getAllHeader().forEach(function (header) {
            if (header.targetId === pageId)
                header.setActive();
        });
        return this;
    };
    return TabPanel;
}(Control));
exports.TabPanel = TabPanel;
var TabPages = (function (_super) {
    __extends(TabPages, _super);
    function TabPages() {
        _super.call(this);
        this.pages = [];
    }
    TabPages.prototype.addPage = function (page) {
        this.pages.push(page);
        return this;
    };
    TabPages.prototype.getAllPage = function () {
        return this.pages;
    };
    return TabPages;
}(Control));
exports.TabPages = TabPages;
var TabHeaders = (function (_super) {
    __extends(TabHeaders, _super);
    function TabHeaders() {
        _super.call(this);
        this.headers = [];
    }
    TabHeaders.prototype.addHeader = function (header) {
        this.headers.push(header);
        return this;
    };
    TabHeaders.prototype.getAllHeader = function () {
        return this.headers;
    };
    return TabHeaders;
}(Control));
exports.TabHeaders = TabHeaders;
var TabPage = (function (_super) {
    __extends(TabPage, _super);
    function TabPage(_id, _title) {
        _super.call(this);
        this._id = _id;
        this._title = _title;
        this.className = "tab-page";
    }
    Object.defineProperty(TabPage.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TabPage.prototype, "content", {
        get: function () {
            return this._content;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TabPage.prototype, "title", {
        get: function () {
            return this._title;
        },
        enumerable: true,
        configurable: true
    });
    TabPage.prototype.setActive = function () {
        this.className = this.className + " active";
        return this;
    };
    TabPage.prototype.setContent = function (ele) {
        this._content = ele;
        return this;
    };
    return TabPage;
}(Control));
exports.TabPage = TabPage;
var TabHeader = (function (_super) {
    __extends(TabHeader, _super);
    function TabHeader(targetId) {
        _super.call(this);
        this.targetId = "";
        this.className = "tab";
        this.targetId = targetId;
    }
    TabHeader.prototype.setTargetId = function (value) {
        this.targetId = value;
    };
    TabHeader.prototype.setActive = function () {
        this.className = this.className + " active";
        return this;
    };
    return TabHeader;
}(Control));
exports.TabHeader = TabHeader;
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
        this.styleObj.minWidth = null;
        this.styleObj.minHeight = null;
    }
    ComboControl.prototype.addChild = function (childControl) {
        this.children.push(childControl);
        return this;
    };
    Object.defineProperty(ComboControl.prototype, "MinHeight", {
        set: function (value) {
            this.styleObj.minHeight = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ComboControl.prototype, "MinWidth", {
        set: function (value) {
            this.styleObj.minWidth = value;
        },
        enumerable: true,
        configurable: true
    });
    return ComboControl;
}(Control));
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
        this.className = "default";
        this.dataSource = new Object();
        this.dataSource.click = function () { };
        this.styleObj.left = 2;
        this.styleObj.top = 0;
    }
    Object.defineProperty(MetaControl.prototype, "OnClick", {
        set: function (value) {
            this.dataSource.click = value;
            // console.log(JSON.stringify(this.dataSource));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MetaControl.prototype, "Class", {
        set: function (value) {
            this.className = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MetaControl.prototype, "Text", {
        get: function () {
            return this.dataSource.text;
        },
        set: function (value) {
            this.dataSource.text = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MetaControl.prototype, "Title", {
        set: function (value) {
            this.dataSource.title = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MetaControl.prototype, "Name", {
        set: function (value) {
            this.dataSource.name = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MetaControl.prototype, "Left", {
        set: function (value) {
            this.styleObj.left = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MetaControl.prototype, "Top", {
        set: function (value) {
            this.styleObj.top = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MetaControl.prototype, "Width", {
        set: function (value) {
            this.styleObj.width = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MetaControl.prototype, "ReadOnly", {
        set: function (value) {
            this.styleObj.readonly = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MetaControl.prototype, "Disable", {
        set: function (value) {
            this.styleObj.disable = value;
        },
        enumerable: true,
        configurable: true
    });
    return MetaControl;
}(Control));
exports.MetaControl = MetaControl;
var DropDown = (function (_super) {
    __extends(DropDown, _super);
    function DropDown() {
        var _this = this;
        _super.call(this, "dropdown");
        this.dataSource.items = new Array();
        this.dataSource.selectedItem = null;
        this.styleObj.dropdown = false;
        this.dataSource.click = function () {
            _this.styleObj.dropdown = !_this.styleObj.dropdown;
        };
        this.dataSource.select = function (item) {
            if (_this.dataSource.selectedItem !== item) {
                _this.dataSource.selectedItem = item;
                if (_this.dataSource.selectchange) {
                    _this.dataSource.selectchange(item);
                }
            }
            _this.styleObj.dropdown = false;
        };
    }
    DropDown.prototype.addItem = function (item) {
        this.dataSource.items.push(item);
        this.dataSource.selectedItem = this.dataSource.items[0];
    };
    Object.defineProperty(DropDown.prototype, "SelectedItem", {
        get: function () {
            return this.dataSource.selectedItem;
        },
        set: function (value) {
            this.dataSource.selectedItem = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DropDown.prototype, "Items", {
        get: function () {
            return this.dataSource.items;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DropDown.prototype, "SelectChange", {
        set: function (value) {
            this.dataSource.selectchange = value;
        },
        enumerable: true,
        configurable: true
    });
    return DropDown;
}(MetaControl));
exports.DropDown = DropDown;
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
}(Control));
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
var DataTable = (function (_super) {
    __extends(DataTable, _super);
    function DataTable(type) {
        if (type === void 0) { type = "table"; }
        _super.call(this);
        this.columns = [];
        this.rows = [];
        this.className = "table";
        this.dataSource = {
            headerColumnCount: 0,
            columns: null,
            rows: null,
            bRowIndex: true
        };
        this.styleObj = { type: type, width: null, height: null };
    }
    DataTable.prototype.newRow = function () {
        var row = new DataTableRow(this.columns.length);
        this.rows.push(row);
        this.dataSource.rows = this.rows;
        return row;
    };
    Object.defineProperty(DataTable.prototype, "RowIndex", {
        set: function (value) {
            this.dataSource.bRowIndex = value;
        },
        enumerable: true,
        configurable: true
    });
    DataTable.prototype.addColumn = function () {
        var _this = this;
        var columns = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            columns[_i - 0] = arguments[_i];
        }
        columns.forEach(function (item) { return _this.columns.push(new DataTableColumn(item)); });
        this.dataSource.columns = this.columns;
        return this;
    };
    Object.defineProperty(DataTable.prototype, "OnCellClick", {
        set: function (value) {
            this.rows.forEach(function (row) { return row.OnCellClick = value; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataTable.prototype, "OnRowClick", {
        set: function (value) {
            this.rows.forEach(function (row) { return row.OnRowClick = value; });
        },
        enumerable: true,
        configurable: true
    });
    return DataTable;
}(Control));
exports.DataTable = DataTable;
var DataTableRow = (function (_super) {
    __extends(DataTableRow, _super);
    function DataTableRow(columns) {
        var _this = this;
        _super.call(this);
        this.columns = columns;
        this.cells = [];
        this.dataSource = {
            cellclick: function () { },
            rowclick: function () { }
        };
        for (var i = 0; i < columns; ++i) {
            this.cells.push(new DataTableRowCell());
            this.cells[i].OnClick = function (cellIndex, rowIndex) {
                if (_this.dataSource.cellclick) {
                    _this.dataSource.cellclick(_this.cells[cellIndex], cellIndex, rowIndex);
                }
                if (_this.dataSource.rowclick) {
                    _this.dataSource.rowclick(_this, rowIndex);
                }
            };
        }
    }
    Object.defineProperty(DataTableRow.prototype, "OnCellClick", {
        set: function (value) {
            this.dataSource.cellclick = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataTableRow.prototype, "OnRowClick", {
        set: function (value) {
            this.dataSource.rowclick = value;
        },
        enumerable: true,
        configurable: true
    });
    return DataTableRow;
}(Control));
exports.DataTableRow = DataTableRow;
var DataTableRowCell = (function (_super) {
    __extends(DataTableRowCell, _super);
    function DataTableRowCell(type) {
        if (type === void 0) { type = "plaintext"; }
        _super.call(this, type);
    }
    Object.defineProperty(DataTableRowCell.prototype, "Type", {
        set: function (value) {
            this.styleObj.type = value;
        },
        enumerable: true,
        configurable: true
    });
    return DataTableRowCell;
}(MetaControl));
exports.DataTableRowCell = DataTableRowCell;
var DataTableColumn = (function () {
    function DataTableColumn(columnHeader) {
        this.columnHeader = columnHeader;
    }
    return DataTableColumn;
}());
exports.DataTableColumn = DataTableColumn;
//# sourceMappingURL=control.js.map