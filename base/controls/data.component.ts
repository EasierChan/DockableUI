// data Component
/**
 * author: chenlei
 * desc: components for acesss data, such as datatable, treeview, charts, 
 */
import {
  Component, ViewChild, ContentChild, Input, OnInit, AfterViewInit,
  Directive, ElementRef, Renderer, HostListener, ChangeDetectorRef
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
    console.info(this.dataSource.columns);
    this.curPage = 0;
    this.pageSize = 10;
    this.curData = this.dataSource;
  }

  detectChanges(): void {
    this.ref.detectChanges();
  }

  ngAfterViewInit(): void {
  }
}


@Directive({ selector: ".vscrollerbar .thumb" })
export class VThumb {
}

@Directive({ selector: ".scroller-table" })
export class TableDirective {
}

@Component({
  moduleId: module.id,
  selector: "dock-table2",
  templateUrl: "data.scrollerbar-table.html",
  inputs: ["className", "dataSource"]
})
export class ScrollerBarTable implements AfterViewInit {
  className: string;
  dataSource: any;
  curData: any;
  iFirstRow: number = 0;

  scrollTop: number = 0;
  bScrollStart: boolean = false;
  startPositionY: number = 0;
  thumbHeight: number = 0;
  clientHeight: number = 0;
  scrollHeight: number;

  private rowHeight = 22;

  @ViewChild("vthumb") vThumb: ElementRef;
  @ViewChild("scollerTable") scollerTable: ElementRef;

  constructor(private ele: ElementRef, private render: Renderer) { }

  ngOnInit(): void {
    this.curData = this.dataSource;
  }

  ngAfterViewInit(): void {
    if (this.scollerTable.nativeElement === null)
      console.error("not supported in webworker.");
  }

  @HostListener("mouseenter") onMouseEnter() {
    this.scrollHeight = (this.dataSource.rows.length + 1) * this.rowHeight;
    if (this.scrollHeight > this.scollerTable.nativeElement.clientHeight - this.rowHeight) {
      this.clientHeight = this.scollerTable.nativeElement.clientHeight - this.rowHeight;
      let scrollDiff = this.scrollHeight - this.clientHeight;
      this.thumbHeight = this.clientHeight - scrollDiff;
      this.render.setElementStyle(this.vThumb.nativeElement, "height", this.thumbHeight.toString());
      this.render.setElementStyle(this.vThumb.nativeElement, "display", "block");
    }
  }

  @HostListener("mouseleave") onMouseLeave() {
    this.render.setElementStyle(this.vThumb.nativeElement, "display", "none");
  }

  onTrackClick(e: MouseEvent) {
    if (e.target !== e.currentTarget)
      return;
    let moveY = e.offsetY - this.scrollTop; // relative distance.
    if (this.scrollTop + moveY < 0) {
      this.scrollTop = 0;
    } else if (moveY + this.thumbHeight + this.scrollTop > this.clientHeight) {
      this.scrollTop = this.clientHeight - this.thumbHeight;
    } else {
      this.scrollTop += moveY;
    }
    // console.log(this.scrollTop, this.thumbHeight, e.offsetY, moveY, this.clientHeight);
    this.render.setElementStyle(this.vThumb.nativeElement, "margin-top", this.scrollTop.toString());
    this.refreshDataTable();
    moveY = null;
  }

  onScrollStart(type: string, e: MouseEvent) {
    this.bScrollStart = true;
    this.startPositionY = e.pageY;

    document.onmouseup = (e) => {
      if (!this.bScrollStart)
        return;

      this.bScrollStart = false;
    };

    document.onmousemove = (e) => {
      if (!this.bScrollStart)
        return;
      let moveY = e.pageY - this.startPositionY;
      if (this.scrollTop + moveY < 0) {
        this.scrollTop = 0;
      } else if (moveY + this.thumbHeight + this.scrollTop > this.clientHeight) {
        this.scrollTop = this.clientHeight - this.thumbHeight;
      } else {
        this.scrollTop += moveY;
      }
      this.startPositionY = e.pageY;
      this.render.setElementStyle(this.vThumb.nativeElement, "margin-top", this.scrollTop.toString());
      this.refreshDataTable();
      moveY = null;
    };
  }

  refreshDataTable() {
    this.iFirstRow = Math.floor(this.scrollTop / this.rowHeight);
    this.curData = new DataTable();
    if (!this.dataSource.rows || this.dataSource.rows.length === 0)
      return;

    this.curData.rows = this.dataSource.rows.slice(this.iFirstRow);
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

