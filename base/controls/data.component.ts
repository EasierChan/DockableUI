/**
 * author: chenlei
 * desc: components for acesss data, such as datatable, treeview, charts, 
 */
import { Component, AfterContentInit } from "@angular/core";

@Component({
    moduleId: module.id,
    selector: "dock-table",
    template: `
        <table [class]="className">
            <thead>
                <tr>
                    <th *ngFor="let col of dataSource.columns">
                        {{col.columnHeader}}
                    </th>
                </tr>
            </thead>
            <tfoot *ngIf="enableFooter">
                <tr>
                    <td [colspan]="dataSource.columns.length">
                    </td>
                </tr>
            </tfoot>
            <tbody>
                <tr *ngFor="let row of rows">
                    <td *ngFor="let col of row.values">
                        {{col}}
                    </td>
                </tr>
            </tbody>
        </table>
    `,
    inputs: ['className', 'dataSource']
})
export class DataTableComponent implements AfterContentInit {
    className: string;
    dataSource: DataTable;

    ngAfterContentInit():void{
        $(this.className).fixedHeaderTable({ fixedColumn: true });
    }
}

export class DataTable{
    public columns: DataTableColumn[] = [];
    public rows: DataTableRow[] = [];
    public enableFooter: boolean = false; 
    constructor(private className: string){}

    newRow(): DataTableRow{
        return new DataTableRow(this.columns.length);
    }
}

export class DataTableRow{
    values: string[];
    constructor(private columns:number){
        this.values = new Array<string>(this.columns);
    }
}

export class DataTableColumn{
    constructor(private columnId: string,
            private columnHeader: string){               
    }
}