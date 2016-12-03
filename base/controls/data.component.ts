// data Component
/**
 * author: chenlei
 * desc: components for acesss data, such as datatable, treeview, charts, 
 */
import { Component, Input, OnInit, AfterViewInit } from "@angular/core"
import { Control, CssStyle } from "./control";

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
    inputs: ['className', 'dataSource']
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
        this.styleObj = {type:null, width:null, height:null};
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
    moduleId: module.id,
    selector: 'chart',
    template: `
        <div></div>
    `
})
export class ChartComponent{
    
}