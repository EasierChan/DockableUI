// data Component
/**
 * author: chenlei
 * desc: components for acesss data, such as datatable, treeview, charts
 */
import {
    Component, ViewChild, ContentChild, Input, Output, OnInit, AfterViewInit,
    Directive, ElementRef, Renderer, HostListener, ChangeDetectorRef, NgZone,
    SimpleChanges, EventEmitter, OnChanges, OnDestroy
} from "@angular/core";
import { Control, MetaControl, CssStyle, DataTable } from "./control";
import * as echarts from "echarts";

@Component({
    moduleId: module.id,
    selector: "dock-table",
    templateUrl: "data.table.html",
    inputs: ["className", "dataSource", "styleObj"]
})
export class DataTableComponent implements OnInit, AfterViewInit {
    className: string;
    dataSource: any;
    styleObj: any;
    curData: any;
    pageSize: number;
    curPage: number;

    constructor(private render: Renderer, private ele: ElementRef, private ref: ChangeDetectorRef) {
        // this.render.listen(this.ele.nativeElement, "mousewheel", (e) => {
        //   this.curData = new DataTable();
        //   if (!this.dataSource.rows || this.dataSource.rows.length === 0)
        //     return;
        //   // e.deltaY < 0  move up
        //   if (e.deltaY < 0 && this.curPage > 0) {
        //     --this.curPage;
        //   } else if (e.deltaY > 0 && this.dataSource.rows.length / this.pageSize - 1 > this.curPage) {
        //     ++this.curPage;
        //   }

        //   this.curData.rows = this.dataSource.rows.slice(this.curPage * this.pageSize);
        //   // e.deltaY > 0 move down
        //   // console.log(this.curData);
        // });
    }


    ngOnInit(): void {
        // console.info(this.dataSource.columns);
        this.curPage = 0;
        this.pageSize = 10;
        this.curData = this.dataSource;
        this.dataSource.detectChanges = () => {
            this.ref.detectChanges();
        };
    }

    ngAfterViewInit(): void {
    }
}

@Component({
    moduleId: module.id,
    selector: "dock-table2",
    templateUrl: "data.scrollerbar-table.html",
    inputs: ["className", "dataSource", "styleObj"]
})
export class ScrollerBarTable implements OnInit {
    className: string;
    dataSource: any;
    styleObj: any;

    @ViewChild("content") content: ElementRef;
    @ViewChild("head") head: ElementRef;

    constructor(private ele: ElementRef, private render: Renderer,
        private ref: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.dataSource.detectChanges = () => {
            this.ref.detectChanges();
            // this.resizeHeader();
        };
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

    @HostListener("window:resize")
    onWindowResize() {
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
    _echart: echarts.ECharts;

    constructor(private el: ElementRef, private render: Renderer) {
    }

    ngOnInit(): void {
        // console.info(this.dataSource.option);
        if (this.dataSource.option) {
            let self = this;
            this.dataSource.init = () => {
                let myChart: echarts.ECharts = echarts.init(self.el.nativeElement);
                myChart.setOption(self.dataSource.option, true);

                window.addEventListener("resize", () => {
                    myChart.resize();
                });

                self.dataSource.setOption = (option, notMerge) => {
                    myChart.setOption(option, notMerge);
                };
            };
        }
    }

    ngAfterViewInit(): void {
    }
}

@Component({
    selector: "echart",
    templateUrl: "sliders.html",
    styleUrls: ["sliders.css"]
})
export class SliderComponent {

}


@Directive({
    selector: "[echarts]"
})
export class EchartsDirective implements OnChanges, OnDestroy {
    @Input() options: any;
    @Input() dataset: any[];
    @Input() theme: string = "";
    @Input() loading: boolean;

    // chart events:
    @Output() chartInit: EventEmitter<any> = new EventEmitter<any>();
    @Output() chartClick: EventEmitter<any> = new EventEmitter<any>();
    @Output() chartDblClick: EventEmitter<any> = new EventEmitter<any>();
    @Output() chartMouseDown: EventEmitter<any> = new EventEmitter<any>();
    @Output() chartMouseUp: EventEmitter<any> = new EventEmitter<any>();
    @Output() chartMouseOver: EventEmitter<any> = new EventEmitter<any>();
    @Output() chartMouseOut: EventEmitter<any> = new EventEmitter<any>();
    @Output() chartGlobalOut: EventEmitter<any> = new EventEmitter<any>();
    @Output() chartContextMenu: EventEmitter<any> = new EventEmitter<any>();
    @Output() chartDataZoom: EventEmitter<any> = new EventEmitter<any>();

    private myChart: any = null;
    private currentWindowWidth: any = null;
    private currentWindowHeight: any = null;

    constructor(private el: ElementRef, private renderer: Renderer, private _ngZone: NgZone) {
    }

    private createChart() {
        this.theme = this.theme || "";
        this.currentWindowWidth = window.innerWidth;
        this.currentWindowHeight = window.innerHeight;

        if (this.theme) {
            return this._ngZone.runOutsideAngular(() => { return echarts.init(this.el.nativeElement, this.theme); });
        } else {
            return this._ngZone.runOutsideAngular(() => { return echarts.init(this.el.nativeElement); });
        }
    }

    private updateChart() {
        this.myChart.setOption(this.options);
        this.myChart.resize();
    }

    @HostListener("window:resize", ["$event"]) onWindowResize(event: any) {
        if (event.target.innerWidth !== this.currentWindowWidth || event.target.innerHeight !== this.currentWindowWidth) {
            this.currentWindowWidth = event.target.innerWidth;
            this.currentWindowHeight = event.target.innerHeight;
            if (this.myChart) {
                this.myChart.resize();
            }
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes["dataset"]) {
            this.onDatasetChange(this.dataset);
        }

        if (changes["options"]) {
            this.onOptionsChange(this.options);
        }

        if (changes["loading"]) {
            this.onLoadingChange(this.loading);
        }
    }

    ngOnDestroy() {
        if (this.myChart) {
            this.myChart.dispose();
            this.myChart = null;
        }
    }

    private onOptionsChange(opt: any) {
        if (opt) {
            if (!this.myChart) {
                this.myChart = this.createChart();

                // output echart instance:
                this.chartInit.emit(this.myChart);

                // register events:
                this.registerEvents(this.myChart);
            }

            if (this.hasData()) {
                this.updateChart();
            } else if (this.dataset && this.dataset.length) {
                this.mergeDataset(this.dataset);
                this.updateChart();
            }
        }
    }

    private onDatasetChange(dataset: any[]) {
        if (this.myChart && this.options) {
            if (!this.options.series) {
                this.options.series = [];
            }

            this.mergeDataset(dataset);
            this.updateChart();
        }
    }

    private onLoadingChange(loading: boolean) {
        if (this.myChart) {
            if (loading) {
                this.myChart.showLoading();
            } else {
                this.myChart.hideLoading();
            }
        }
    }

    private mergeDataset(dataset: any[]) {
        for (let i = 0, len = dataset.length; i < len; i++) {
            if (!this.options.series[i]) {
                this.options.series[i] = { data: dataset[i] };
            } else {
                this.options.series[i].data = dataset[i];
            }
        }
    }

    /**
     * method to check if the option has dataset.
     */
    private hasData(): boolean {
        if (!this.options.series || !this.options.series.length) {
            return false;
        }

        for (let serie of this.options.series) {
            if (serie.data && serie.data.length > 0) {
                return true;
            }
        }

        return false;
    }

    private registerEvents(myChart: any) {
        if (myChart) {
            // register mouse events:
            myChart.on("click", (e: any) => { this.chartClick.emit(e); });
            myChart.on("dblClick", (e: any) => { this.chartDblClick.emit(e); });
            myChart.on("mousedown", (e: any) => { this.chartMouseDown.emit(e); });
            myChart.on("mouseup", (e: any) => { this.chartMouseUp.emit(e); });
            myChart.on("mouseover", (e: any) => { this.chartMouseOver.emit(e); });
            myChart.on("mouseout", (e: any) => { this.chartMouseOut.emit(e); });
            myChart.on("globalout", (e: any) => { this.chartGlobalOut.emit(e); });
            myChart.on("contextmenu", (e: any) => { this.chartContextMenu.emit(e); });

            // other events;
            myChart.on("dataZoom", (e: any) => { this.chartDataZoom.emit(e); });
        }
    }
}
