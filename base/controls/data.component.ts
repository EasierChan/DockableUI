// data Component
/**
 * author: chenlei
 * desc: components for acesss data, such as datatable, treeview, charts, 
 */
import { Component, Input, OnInit, AfterViewInit, Directive, ElementRef, Renderer } from "@angular/core"
import { Control, CssStyle } from "./control";
const echarts: ECharts = require("../third/echart/echarts");

@Component({
    moduleId: module.id,
    selector: "dock-table",
    template: `
        <div class="tb-header">
            <div *ngFor="let col of dataSource.columns" class="td">
                {{col.columnHeader}}
            </div>
        </div>
        <div class="tb-body">
            <div class="tr" *ngFor="let row of dataSource.rows">
                <div *ngFor="let col of row.values" class="td">
                    {{col}}
                </div>
            </div>
        <div>
    `,
    inputs: ["className", "dataSource"]
})
export class DataTableComponent implements OnInit, AfterViewInit {
    className: string;
    dataSource: DataTable;

    ngOnInit(): void {
        // console.log(this.dataSource);
    }

    ngAfterViewInit(): void {
    }
}

export class DataTable extends Control {
    public columns: DataTableColumn[] = [];
    public rows: DataTableRow[] = [];
    public enableFooter: boolean = false;
    constructor() {
        super();
        this.className = "table";
        this.dataSource = {
            columns: null,
            rows: null,
            enableFooter: this.enableFooter
        }
        this.styleObj = { type: null, width: null, height: null };
    }

    newRow(): DataTableRow {
        let row = new DataTableRow(this.columns.length);
        this.rows.push(row);
        this.dataSource.rows = this.rows;
        return row;
    }

    addColumn(column: string): DataTable {
        this.columns.push(new DataTableColumn(column));
        this.dataSource.columns = this.columns;
        return this;
    }
}

export class DataTableRow {
    values: string[];
    constructor(private columns: number) {
        this.values = new Array<string>(this.columns);
    }
}

export class DataTableColumn {
    constructor(private columnHeader: string) {
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

    constructor(private el: ElementRef, private render: Renderer) {
    }

    ngOnInit(): void {
        if (this.dataSource.events && this.dataSource.events.hasOwnProperty("click")) {
            this.render.listen(this.el.nativeElement, "click", this.dataSource.events["click"]);
        }
    }

    ngAfterViewInit(): void {
        if (this.dataSource.option) {
            setTimeout(() => {
                let myChart: EChartsInstance = echarts.init(this.el.nativeElement);
                myChart.setOption(this.dataSource.option, true);

                window.addEventListener("resize", () => {
                    myChart.resize();
                });

                this.dataSource.setOption = (option) => {
                    myChart.setOption(option);
                };
            }, 100);
        }
    }
}

export class EChart extends Control {
    // private _option: Object = null;
    // private _events: Object = null;

    constructor() {
        super();
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
    setOption(option: Object): void {
        this.dataSource.option = option;
    }

    resetOption(option: Object): void {
        if (this.dataSource.setOption) {
            this.dataSource.setOption(option);
        }
    }

    onClick(cb: Function) {
        this.dataSource.events["click"] = cb;
    }
}