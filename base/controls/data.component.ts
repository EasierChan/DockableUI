// data Component
/**
 * author: chenlei
 * desc: components for acesss data, such as datatable, treeview, charts
 */
import {
  Component, ViewChild, ContentChild, Input, OnInit, AfterViewInit,
  Directive, ElementRef, Renderer, HostListener, ChangeDetectorRef,
  OnChanges, SimpleChanges
} from "@angular/core";
import { Control, MetaControl, CssStyle, DataTable } from "./control";

const echarts: ECharts = require("../script/echart/echarts");

@Component({
  moduleId: module.id,
  selector: "dock-table",
  templateUrl: "data.table.html",
  inputs: ["className", "dataSource"]
})
export class DataTableComponent implements OnInit, AfterViewInit {
  className: string;
  dataSource: any;
  curData: any;
  pageSize: number;
  curPage: number;

  constructor(private render: Renderer, private ele: ElementRef, private ref: ChangeDetectorRef) {
    this.render.listen(this.ele.nativeElement, "mousewheel", (e) => {
      this.curData = new DataTable();
      if (!this.dataSource.rows || this.dataSource.rows.length === 0)
        return;
      // e.deltaY < 0  move up
      if (e.deltaY < 0 && this.curPage > 0) {
        --this.curPage;
      } else if (e.deltaY > 0 && this.dataSource.rows.length / this.pageSize - 1 > this.curPage) {
        ++this.curPage;
      }
      this.curData.rows = this.dataSource.rows.slice(this.curPage * this.pageSize);
      // e.deltaY > 0 move down
      // console.log(this.curData);
    });
  }


  ngOnInit(): void {
    // console.info(this.dataSource.columns);
    this.curPage = 0;
    this.pageSize = 10;
    this.curData = this.dataSource;
    this.dataSource.detectChanges = () => this.ref.detectChanges;
  }

  ngAfterViewInit(): void {
  }
}

@Component({
  moduleId: module.id,
  selector: "dock-table2",
  templateUrl: "data.scrollerbar-table.html",
  inputs: ["className", "dataSource"]
})
export class ScrollerBarTable implements OnInit, AfterViewInit {
  className: string;
  dataSource: any;

  @ViewChild("content") content: ElementRef;
  @ViewChild("head") head: ElementRef;

  constructor(private ele: ElementRef, private render: Renderer,
    private ref: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.dataSource.detectChanges = () => {
      this.ref.detectChanges();
      this.resizeHeader();
    };
  }

  ngAfterViewInit() {
    this.resizeHeader();
  }

  @HostListener("scroll")
  onScroll() {
    this.head.nativeElement.style.top = this.ele.nativeElement.scrollTop + "px";
    this.head.nativeElement.style.display = "table";
    this.resizeHeader();
  }

  @HostListener("resize")
  onResize() {
    this.resizeHeader();
  }

  resizeHeader() {
    this.head.nativeElement.style.width = this.content.nativeElement.clientWidth + "px";
    let headCells = this.head.nativeElement.querySelectorAll("thead > tr:first-child > th");
    this.content.nativeElement.querySelectorAll("thead > tr:first-child > th").forEach((th, index) => {
      headCells[index].style.width = th.clientWidth + "px";
    });
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

