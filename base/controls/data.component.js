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
var echarts = require("../third/echart/echarts");
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
        if (this.dataSource.events && this.dataSource.events.hasOwnProperty("click")) {
            this.render.listen(this.el.nativeElement, "click", this.dataSource.events["click"]);
        }
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
                _this.dataSource.setOption = function (option) {
                    myChart.setOption(option);
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
    /**
     * @param option refer to http://echarts.baidu.com/option.html
     */
    EChart.prototype.setOption = function (option) {
        this.dataSource.option = option;
    };
    EChart.prototype.resetOption = function (option) {
        if (this.dataSource.setOption) {
            this.dataSource.setOption(option);
        }
    };
    EChart.prototype.onClick = function (cb) {
        this.dataSource.events["click"] = cb;
    };
    return EChart;
}(control_1.Control));
exports.EChart = EChart;
//# sourceMappingURL=data.component.js.map