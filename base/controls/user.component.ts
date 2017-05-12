/**
 * created by chenlei
 * used to created custom user control based on className and dataSource.
 */
import { Component, AfterContentInit, Input, ElementRef, AfterViewInit, ViewChild, Renderer } from "@angular/core";
import { NgForm } from "@angular/forms";
import { CssStyle, Control, ComboControl, Dialog, StatusBar, TabPanel } from "./control";

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

    constructor(private renderer: Renderer) { }

    ngAfterViewInit() {
        if (this.className.startsWith("dock-container")) {
            this.styleObj.getWidth = () => {
                return this.container.nativeElement.clientWidth;
            };
            this.styleObj.getHeight = () => {
                return this.container.nativeElement.clientHeight;
            };
        }

        let removedPage = null;
        this.renderer.listen(this.container.nativeElement, "addpage", ($event) => {
            // console.info("addpage", $event.detail.pageid);
            // let len = this.children.length;
            // for (; len >= 0; --len) {
            //     if (this.children[len] instanceof TabPanel) {
            //         let ipanel = this.children[len] as TabPanel;
            //         ipanel.addTab(removedPage);
            //     }
            // }
        });

        this.renderer.listen(this.container.nativeElement, "removepage", ($event) => {
            // console.info("removepage", $event.detail.pageid);
            // let len = this.children.length;
            // for (; len >= 0; --len) {
            //     if (this.children[len] instanceof TabPanel) {
            //         let ipanel = this.children[len] as TabPanel;
            //         removedPage = ipanel.removeTab($event.detail.pageid);
            //         break;
            //     }
            // }
        });

        this.renderer.listen(this.container.nativeElement, "adddock", ($event) => {
            // console.info("adddock", $event);
        });

        this.renderer.listen(this.container.nativeElement, "removedock", ($event) => {
            // console.info("removedock", $event);
        });
    }
}

/**
 * Dialog
 */
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

/**
 * StatusBar
 */
@Component({
    moduleId: module.id,
    selector: ".statusbar",
    templateUrl: "statusbar.html",
    inputs: ["statusbar"]
})
export class StatusBarComponent {
    statusbar: StatusBar;
}