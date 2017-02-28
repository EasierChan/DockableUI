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
// data Component
/**
 * author: chenlei
 * desc: components for acesss data, such as datatable, treeview, charts,
 */
var core_1 = require("@angular/core");
var control_1 = require("./control");
var echarts = require("../script/echart/echarts");
var DataTableComponent = (function () {
    function DataTableComponent(render, ele) {
        var _this = this;
        this.render = render;
        this.ele = ele;
        this.render.listen(this.ele.nativeElement, "mousewheel", function (e) {
            _this.curData = new control_1.DataTable();
            if (!_this.dataSource.rows || _this.dataSource.rows.length === 0)
                return;
            // e.deltaY < 0  move up
            if (e.deltaY < 0 && _this.curPage > 0) {
                --_this.curPage;
            }
            else if (e.deltaY > 0 && _this.dataSource.rows.length / _this.pageSize - 1 > _this.curPage) {
                ++_this.curPage;
            }
            _this.curData.rows = _this.dataSource.rows.slice(_this.curPage * _this.pageSize);
            // e.deltaY > 0 move down
            // console.log(this.curData);
        });
    }
    DataTableComponent.prototype.ngOnInit = function () {
        this.curPage = 0;
        this.pageSize = 10;
        this.curData = this.dataSource;
    };
    DataTableComponent.prototype.ngAfterViewInit = function () {
    };
    DataTableComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "dock-table",
            templateUrl: "data.table.html",
            inputs: ["className", "dataSource"]
        }), 
        __metadata('design:paramtypes', [core_1.Renderer, core_1.ElementRef])
    ], DataTableComponent);
    return DataTableComponent;
}());
exports.DataTableComponent = DataTableComponent;
var VThumb = (function () {
    function VThumb() {
    }
    VThumb = __decorate([
        core_1.Directive({ selector: ".vscrollerbar .thumb" }), 
        __metadata('design:paramtypes', [])
    ], VThumb);
    return VThumb;
}());
exports.VThumb = VThumb;
var TableDirective = (function () {
    function TableDirective() {
    }
    TableDirective = __decorate([
        core_1.Directive({ selector: ".scroller-table" }), 
        __metadata('design:paramtypes', [])
    ], TableDirective);
    return TableDirective;
}());
exports.TableDirective = TableDirective;
var ScrollerBarTable = (function () {
    function ScrollerBarTable(ele, render) {
        this.ele = ele;
        this.render = render;
        this.iFirstRow = 0;
        this.scrollTop = 0;
        this.bScrollStart = false;
        this.startPositionY = 0;
        this.thumbHeight = 0;
        this.clientHeight = 0;
        this.rowHeight = 22;
    }
    ScrollerBarTable.prototype.ngOnInit = function () {
        this.curData = this.dataSource;
    };
    ScrollerBarTable.prototype.ngAfterViewInit = function () {
        if (this.scollerTable.nativeElement === null)
            console.error("not supported in webworker.");
    };
    ScrollerBarTable.prototype.onMouseEnter = function () {
        this.scrollHeight = (this.dataSource.rows.length + 1) * this.rowHeight;
        if (this.scrollHeight > this.scollerTable.nativeElement.clientHeight - this.rowHeight) {
            this.clientHeight = this.scollerTable.nativeElement.clientHeight - this.rowHeight;
            var scrollDiff = this.scrollHeight - this.clientHeight;
            this.thumbHeight = this.clientHeight - scrollDiff;
            this.render.setElementStyle(this.vThumb.nativeElement, "height", this.thumbHeight.toString());
            this.render.setElementStyle(this.vThumb.nativeElement, "display", "block");
        }
    };
    ScrollerBarTable.prototype.onMouseLeave = function () {
        this.render.setElementStyle(this.vThumb.nativeElement, "display", "none");
    };
    ScrollerBarTable.prototype.onTrackClick = function (e) {
        if (e.target !== e.currentTarget)
            return;
        var moveY = e.offsetY - this.scrollTop; // relative distance.
        if (this.scrollTop + moveY < 0) {
            this.scrollTop = 0;
        }
        else if (moveY + this.thumbHeight + this.scrollTop > this.clientHeight) {
            this.scrollTop = this.clientHeight - this.thumbHeight;
        }
        else {
            this.scrollTop += moveY;
        }
        // console.log(this.scrollTop, this.thumbHeight, e.offsetY, moveY, this.clientHeight);
        this.render.setElementStyle(this.vThumb.nativeElement, "margin-top", this.scrollTop.toString());
        this.refreshDataTable();
        moveY = null;
    };
    ScrollerBarTable.prototype.onScrollStart = function (type, e) {
        var _this = this;
        this.bScrollStart = true;
        this.startPositionY = e.pageY;
        document.onmouseup = function (e) {
            if (!_this.bScrollStart)
                return;
            _this.bScrollStart = false;
        };
        document.onmousemove = function (e) {
            if (!_this.bScrollStart)
                return;
            var moveY = e.pageY - _this.startPositionY;
            if (_this.scrollTop + moveY < 0) {
                _this.scrollTop = 0;
            }
            else if (moveY + _this.thumbHeight + _this.scrollTop > _this.clientHeight) {
                _this.scrollTop = _this.clientHeight - _this.thumbHeight;
            }
            else {
                _this.scrollTop += moveY;
            }
            _this.startPositionY = e.pageY;
            _this.render.setElementStyle(_this.vThumb.nativeElement, "margin-top", _this.scrollTop.toString());
            _this.refreshDataTable();
            moveY = null;
        };
    };
    ScrollerBarTable.prototype.refreshDataTable = function () {
        this.iFirstRow = Math.floor(this.scrollTop / this.rowHeight);
        this.curData = new control_1.DataTable();
        if (!this.dataSource.rows || this.dataSource.rows.length === 0)
            return;
        this.curData.rows = this.dataSource.rows.slice(this.iFirstRow);
    };
    __decorate([
        core_1.ViewChild("vthumb"), 
        __metadata('design:type', core_1.ElementRef)
    ], ScrollerBarTable.prototype, "vThumb", void 0);
    __decorate([
        core_1.ViewChild("scollerTable"), 
        __metadata('design:type', core_1.ElementRef)
    ], ScrollerBarTable.prototype, "scollerTable", void 0);
    __decorate([
        core_1.HostListener("mouseenter"), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], ScrollerBarTable.prototype, "onMouseEnter", null);
    __decorate([
        core_1.HostListener("mouseleave"), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], ScrollerBarTable.prototype, "onMouseLeave", null);
    ScrollerBarTable = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "dock-table2",
            templateUrl: "data.scrollerbar-table.html",
            inputs: ["className", "dataSource"]
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef, core_1.Renderer])
    ], ScrollerBarTable);
    return ScrollerBarTable;
}());
exports.ScrollerBarTable = ScrollerBarTable;
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
//# sourceMappingURL=data.component.js.map