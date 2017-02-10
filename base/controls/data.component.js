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
            template: "\n        <table class=\"table table-condensed table-hover\">\n          <thead>\n            <tr>\n              <th *ngIf=\"dataSource.bRowHeader\">#</th>\n              <th *ngFor=\"let col of dataSource.columns\">\n                {{col.columnHeader}}\n              </th>\n            </tr>\n          </thead>\n          <tbody>\n            <tr *ngFor=\"let row of curData.rows;let i = index;\">\n              <td *ngIf=\"dataSource.bRowHeader\">{{i + 1 + pageSize * curPage}}</td>\n              <td *ngFor=\"let cell of row.cells\">\n                <button *ngIf=\"cell.styleObj.type=='button'\" class=\"btn btn-default btn-{{cell.className}} btn-xs \" [name]=\"cell.dataSource.name\"\n                  (click)=\"cell.dataSource.click()\">\n                    {{cell.dataSource.text}}\n                </button>\n                <input type=\"text\" *ngIf=\"cell.styleObj.type=='textbox'\" [(ngModel)]=\"cell.dataSource.modelVal\"\n                 [readonly]=\"cell.dataSource.readonly\" [name]=\"cell.dataSource.name\"\n                  class=\"btn-default btn-{{cell.className}} btn-xs\">\n              </td>\n            </tr>\n          </tbody>\n        </table>\n    ",
            inputs: ["className", "dataSource"]
        }), 
        __metadata('design:paramtypes', [core_1.Renderer, core_1.ElementRef])
    ], DataTableComponent);
    return DataTableComponent;
}());
exports.DataTableComponent = DataTableComponent;
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