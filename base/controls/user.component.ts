/**
 * created by chenlei
 * used to created custom user control based on className and dataSource.
 */
import { Component, AfterContentInit, Input, ElementRef, AfterViewInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { CssStyle, Control, ComboControl, Dialog, StatusBar } from "./control";

@Component({
    moduleId: module.id,
    selector: "usercontrol",
    templateUrl: "usercontrol.html",
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
export class DockContainerComponent implements AfterViewInit {
    className: string;
    children: Control[];
    @Input() styleObj: any;
    @Input() dataSource: any;
    @ViewChild("container") container: ElementRef;

    ngAfterViewInit() {
        if (this.className.startsWith("dock-container")) {
            this.styleObj.getWidth = () => {
                return this.container.nativeElement.clientWidth;
            };
            this.styleObj.getHeight = () => {
                return this.container.nativeElement.clientHeight;
            };
        }
    }
}

@Component({
    moduleId: module.id,
    selector: ".dialog",
    templateUrl: "dialog.component.html",
    styleUrls: ["../css/easier-icons.css"],
    inputs: ["dialog"]
})
export class DialogComponent {
    dialog: Dialog;
}


@Component({
    moduleId: module.id,
    selector: ".statusbar",
    templateUrl: "statusbar.html",
    inputs: ["statusbar"]
})
export class StatusBarComponent {
    statusbar: StatusBar;
}