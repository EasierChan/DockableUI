/**
 * created by chenlei
 * used to created custom user control based on className and dataSource.
 */
import { Component, AfterContentInit, Input } from "@angular/core";
import { NgForm } from "@angular/forms";
import { CssStyle, Control } from "./control";

@Component({
    moduleId: module.id,
    selector: "usercontrol",
    template: `
        <template ngFor let-child [ngForOf]="children">
            <span *ngIf="child.styleObj.type=='label'" [class]="child.className">
                {{child.dataSource.text}}
            </span>
            <button *ngIf="child.styleObj.type=='button'" class="btn btn-{{child.className}} btn-xs" [name]="child.dataSource.name"
             (click)="child.dataSource.click()" [style.margin-left.px]="child.styleObj.left" [style.margin-top.px]="child.styleObj.top">
                {{child.dataSource.text}}
            </button>
            <label *ngIf="child.styleObj.type=='textbox'" [style.margin-left.px]="child.styleObj.left" [style.margin-top.px]="child.styleObj.top">
                <pre>{{child.dataSource.text}}</pre>
                <input type="text" [(ngModel)]="child.dataSource.modelVal" [name]="child.dataSource.name" placeholder="" class="btn-{{child.className}} btn-xs">
             </label>
             <div *ngIf="child.styleObj.type=='dropdown'" [style.margin-left.px]="child.styleObj.left" [style.margin-top.px]="child.styleObj.top">
                <pre>{{child.dataSource.text}}</pre>
                <div class="btn-group">
                    <button type="button" class="btn-xs btn-default dropdown-toggle" (click)="child.dataSource.click()">
                        <pre>{{child.dataSource.selectedItem.Text}}</pre> <span class="caret"></span>
                    </button>
                    <ul class="dropdown-menu" [style.display]="child.dataSource.dropdown?'block':'none'">
                        <li *ngFor="let item of child.dataSource.items" (click)="child.dataSource?.onselect(item)"><a href="#">{{item.Text}}</a></li>
                    </ul>
                </div>
             </div>
             <label *ngIf="child.styleObj.type=='radio'">
                {{child.dataSource.text}}
                <input [name]="child.dataSource.name" type="radio"> 
             </label>
            <label *ngIf="child.styleObj.type=='checkbox'">
                <input [name]="child.dataSource.name" type="checkbox" checked="checked"> 
                <span style="break-word: keep-all">{{child.dataSource.text}}</span>
            </label>
             <label *ngIf="child.styleObj.type=='range'">
                {{child.dataSource.text}} <input type="range" [class]="child.className">
             </label>
            <dock-table *ngIf="child.className=='table'" [className]="className" [dataSource]="child.dataSource"></dock-table>
            <echart *ngIf="child.styleObj.type=='echart'" [dataSource]="child.dataSource" [class]="child.className"></echart>
            <usercontrol *ngIf="child.className=='controls'" [children]="child.children" [dataSource]="child.dataSource"
             [class]="child.styleObj.type" [style.min-width.px]="child.styleObj?.minWidth" [style.min-height.px]="child.styleObj?.minHeight">
            </usercontrol>
        </template>
    `,
    inputs: ["children", "dataSource", "styleObj"]
})
export class UserControlComponent implements AfterContentInit {
    children: any[];
    dataSource: any;
    styleObj: any;

    ngAfterContentInit(): void {
        // console.log(JSON.stringify(this.children));
    }
}

@Component({
    moduleId: module.id,
    selector: "dock-control",
    templateUrl: "controlTree.html",
    inputs: ["className", "children"]
})
export class DockContainerComponent {
    className: string;
    children: Control[];
    @Input() styleObj: any;
    @Input() dataSource: any;
}
