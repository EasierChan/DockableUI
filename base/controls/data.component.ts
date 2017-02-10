// data Component
/**
 * author: chenlei
 * desc: components for acesss data, such as datatable, treeview, charts, 
 */
import { Component, Input, OnInit, AfterViewInit, Directive, ElementRef, Renderer } from "@angular/core";
import { Control, MetaControl, CssStyle, DataTable } from "./control";

const echarts: ECharts = require("../script/echart/echarts");

@Component({
  moduleId: module.id,
  selector: "dock-table",
  template: `
        <table class="table table-condensed table-hover">
          <thead>
            <tr>
              <th *ngIf="dataSource.bRowHeader">#</th>
              <th *ngFor="let col of dataSource.columns">
                {{col.columnHeader}}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of curData.rows;let i = index;">
              <td *ngIf="dataSource.bRowHeader">{{i + 1 + pageSize * curPage}}</td>
              <td *ngFor="let cell of row.cells">
                <button *ngIf="cell.styleObj.type=='button'" class="btn btn-default btn-{{cell.className}} btn-xs " [name]="cell.dataSource.name"
                  (click)="cell.dataSource.click()">
                    {{cell.dataSource.text}}
                </button>
                <input type="text" *ngIf="cell.styleObj.type=='textbox'" [(ngModel)]="cell.dataSource.modelVal"
                 [readonly]="cell.dataSource.readonly" [name]="cell.dataSource.name"
                  class="btn-default btn-{{cell.className}} btn-xs">
              </td>
            </tr>
          </tbody>
        </table>
    `,
  inputs: ["className", "dataSource"]
})
export class DataTableComponent implements OnInit, AfterViewInit {
  className: string;
  dataSource: DataTable;
  curData: DataTable;
  pageSize: number;
  curPage: number;

  constructor(private render: Renderer, private ele: ElementRef) {
    this.render.listen(this.ele.nativeElement, "mousewheel", (e) => {
      this.curData = new DataTable();
      if (!this.dataSource.rows || this.dataSource.rows.length === 0)
        return;
      // e.deltaY < 0  move up
      if (e.deltaY < 0 && this.curPage > 0) {
        --this.curPage;
      }
      else if (e.deltaY > 0 && this.dataSource.rows.length / this.pageSize - 1 > this.curPage) {
        ++this.curPage;
      }
      this.curData.rows = this.dataSource.rows.slice(this.curPage * this.pageSize);
      // e.deltaY > 0 move down
      // console.log(this.curData);
    });
  }

  ngOnInit(): void {
    this.curPage = 0;
    this.pageSize = 10;
    this.curData = this.dataSource;
  }

  ngAfterViewInit(): void {
  }
}


/**
 * chart components created by chenlei
 */
@Component({
  selector: "echart",
  template: "",
  inputs: [
    "className",
    "dataSource"
  ]
})
export class EChartComponent implements OnInit, AfterViewInit {
  className: string;
  dataSource: any;
  _echart: EChartsInstance;

  constructor(private el: ElementRef, private render: Renderer) {
  }

  ngOnInit(): void {
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
  }

  ngAfterViewInit(): void {
    if (this.dataSource.option) {
      setTimeout(() => {
        let myChart: EChartsInstance = echarts.init(this.el.nativeElement);
        myChart.setOption(this.dataSource.option, true);

        window.addEventListener("resize", () => {
          myChart.resize();
        });

        this.dataSource.setOption = (option, notMerge) => {
          myChart.setOption(option, notMerge);
        };
      }, 100);
    }
  }
}

