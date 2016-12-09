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
            inputs: ['className', 'dataSource']
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
var ChartComponent = (function () {
    function ChartComponent() {
    }
    ChartComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'chart',
            template: "\n        <div></div>\n    "
        }), 
        __metadata('design:paramtypes', [])
    ], ChartComponent);
    return ChartComponent;
}());
exports.ChartComponent = ChartComponent;
//# sourceMappingURL=data.component.js.map