/**
 * created by chenlei
 * used to created custom user control based on className and dataSource.
 */
import { Component, AfterContentInit } from "@angular/core";
import { NgForm } from '@angular/forms';
import { Control, CssStyle } from "./control";

@Component({
    moduleId: module.id,
    selector: 'usercontrol',
    template: `
        <template ngFor let-child [ngForOf]="children">
            <span *ngIf="child.styleObj.type=='label'" [class]="child.className">
                {{child.dataSource.value}}
            </span>
            <button *ngIf="child.styleObj.type=='button'" [class]="child.className" [name]="child.dataSource.name"
             (click)="child.dataSource.click()">
                {{child.dataSource.value}}
            </button>
            <input type="text" *ngIf="child.styleObj.type=='textbox'" [(ngModel)]="child.dataSource.modelVal"
             [class]="child.className" [name]="child.dataSource.name">
            <input type="radio" *ngIf="child.styleObj.type=='radiobtn'" [class]="child.className">
            <input type="checkbox" *ngIf="child.styleObj.type=='checkbox'" [class]="child.className">
            <input type="range" *ngIf="child.styleObj.type=='range'" [class]="child.className">
            <dock-table *ngIf="child.className=='table'" [className]="className" [dataSource]="child.dataSource"></dock-table>
            <usercontrol *ngIf="child.className=='controls'" [children]="child.children" [dataSource]="child.dataSource"
             [class]="child.styleObj.type">
            </usercontrol>
        </template>
    `,
    inputs: ['children', 'dataSource', 'styleObj']
})
export class UserControlComponent implements AfterContentInit {
    children: any[];
    dataSource: any;
    styleObj: CssStyle;

    onClick(): void {
        this.dataSource.click();
    }
    ngAfterContentInit(): void {
        // console.log(JSON.stringify(this.children));
    }
}

export class ComboControl extends Control {
    constructor(type: string) {
        super();
        this.className = "controls";
        this.styleObj = {
            type: type, // store this controls container's css class.
            width: null,
            height: null
        };
        this.children = [];
    }

    addChild(childControl: Control): ComboControl {
        this.children.push(childControl);
        return this;
    }
}

export class MetaControl extends Control {
    constructor(type: string) {
        super();
        this.styleObj = {
            type: type,
            width: null,
            height: null
        };
        this.dataSource = new Object();
    }

    onClick(aaa: any): void {
        this.dataSource.click = aaa;
        //console.log(JSON.stringify(this.dataSource));
    }

    set Class(classStr: string) {
        this.className = classStr;
    }

    set Value(value: string) {
        this.dataSource.value = value;
    }

    set ModelVal(value: string) {
        this.dataSource.modelVal = value;
    }

    get ModelVal(): string {
        return this.dataSource.modelVal;
    }

    set Name(name: string) {
        this.dataSource.name = name;
    }
}