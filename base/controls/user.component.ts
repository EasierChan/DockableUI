/**
 * created by chenlei
 * used to created custom user control based on className and dataSource.
 */
import {
    Component, AfterContentInit, Input, ElementRef, AfterViewInit,
    ViewChild, Renderer, HostListener, HostBinding, ChangeDetectorRef
} from "@angular/core";
import { NgForm } from "@angular/forms";
import {
    CssStyle, Control, ComboControl, Dialog, StatusBar, TabPanel
} from "./control";
import {
    ScrollerBarTable
} from "./data.component";

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
    inputs: ["className", "children", "dataSource", "styleObj"]
})
export class DockContainerComponent implements AfterViewInit {
    className: string;
    children: Control[];
    styleObj: any;
    dataSource: any;
    static splitter: any = null;
    static startPoint: any = [0, 0];
    static lastEnterEle = null;
    @ViewChild("container") container: ElementRef;
    @ViewChild("navSN") navSN: ElementRef;
    @ViewChild("navEW") navEW: ElementRef;
    @ViewChild("north") north: ElementRef;
    @ViewChild("south") south: ElementRef;
    @ViewChild("west") west: ElementRef;
    @ViewChild("east") east: ElementRef;
    @ViewChild("center") center: ElementRef;
    @ViewChild("navCover") navCover: ElementRef;

    constructor(private renderer: Renderer, private ele: ElementRef, private detector: ChangeDetectorRef) { }

    ngAfterViewInit() {
        if (this.isDockContainer()) {
            this.styleObj.getWidth = () => {
                return this.ele.nativeElement.clientWidth > 0 ? this.ele.nativeElement.clientWidth : this.container.nativeElement.clientWidth;
            };
            this.styleObj.getHeight = () => {
                return this.ele.nativeElement.clientHeight > 0 ? this.ele.nativeElement.clientHeight : this.container.nativeElement.clientHeight;
            };
            this.renderer.listen(this.container.nativeElement, "dragenter", (event: DragEvent) => {
                event.preventDefault();
                event.stopPropagation();

                // if (event.srcElement.className !== "dock-cover" && event.srcElement.className !== "panel-title")
                //     return;

                // console.info(event);
                this.detector.detach();
                this.dataSource.showNavbar();
                // this.renderer.setElementStyle(this.navSN.nativeElement, "display", "flex");
                this.renderer.setElementStyle(this.navSN.nativeElement, "top", "0");
                this.renderer.setElementStyle(this.navSN.nativeElement, "left", `${(this.container.nativeElement.clientWidth - 30) / 2}`);
                this.renderer.setElementStyle(this.navEW.nativeElement, "top", `${(this.container.nativeElement.clientHeight - 30) / 2}`);
                this.renderer.setElementStyle(this.navEW.nativeElement, "left", "0");

                if (this.styleObj.canHoldpage) {
                    this.dataSource.showCover();
                    this.renderer.setElementStyle(this.navCover.nativeElement, "top", "0");
                    this.renderer.setElementStyle(this.navCover.nativeElement, "left", "0");
                    this.renderer.setElementStyle(this.navCover.nativeElement, "width", "100%");
                    this.renderer.setElementStyle(this.navCover.nativeElement, "height", "100%");
                }

                this.detector.detectChanges();

                if (DockContainerComponent.lastEnterEle !== null && DockContainerComponent.lastEnterEle !== this) {
                    DockContainerComponent.lastEnterEle.detector.detectChanges();
                    DockContainerComponent.lastEnterEle.detector.reattach();
                }

                DockContainerComponent.lastEnterEle = this;
            });
            this.renderer.listen(this.container.nativeElement, "dragover", (event: DragEvent) => {
                event.preventDefault();
                event.stopPropagation();
            });
            this.renderer.listen(this.container.nativeElement, "drop", (event: DragEvent) => {
                event.preventDefault();
                this.locateTo(event, 0);
                this.detector.detectChanges();
                this.detector.reattach();

                DockContainerComponent.lastEnterEle = null;
            });
            // this.renderer.listen(this.center.nativeElement, "dragover", (event: DragEvent) => {
            //     this.dataSource.showCover();
            //     this.renderer.setElementStyle(this.navCover.nativeElement, "top", "0");
            //     this.renderer.setElementStyle(this.navCover.nativeElement, "left", "0");
            //     this.renderer.setElementStyle(this.navCover.nativeElement, "width", "100%");
            //     this.renderer.setElementStyle(this.navCover.nativeElement, "height", "100%");
            // });
            this.renderer.listen(this.north.nativeElement, "dragenter", (event: DragEvent) => {
                event.preventDefault();
                event.stopPropagation();
                this.dataSource.showCover();
                this.renderer.setElementStyle(this.navCover.nativeElement, "top", "0");
                this.renderer.setElementStyle(this.navCover.nativeElement, "left", "0");
                this.renderer.setElementStyle(this.navCover.nativeElement, "width", "100%");
                this.renderer.setElementStyle(this.navCover.nativeElement, "height", "30%");
                this.detector.detectChanges();
            });
            this.renderer.listen(this.north.nativeElement, "dragover", (event: DragEvent) => {
                event.preventDefault();
            });
            this.renderer.listen(this.north.nativeElement, "drop", (event: DragEvent) => {
                this.locateTo(event, 1);
                this.detector.detectChanges();
                this.detector.reattach();

                DockContainerComponent.lastEnterEle = null;
            });
            this.renderer.listen(this.south.nativeElement, "dragenter", (event: DragEvent) => {
                event.preventDefault();
                event.stopPropagation();
                this.dataSource.showCover();
                this.renderer.setElementStyle(this.navCover.nativeElement, "top", "70%");
                this.renderer.setElementStyle(this.navCover.nativeElement, "left", "0");
                this.renderer.setElementStyle(this.navCover.nativeElement, "width", "100%");
                this.renderer.setElementStyle(this.navCover.nativeElement, "height", "30%");
                this.detector.detectChanges();
            });
            this.renderer.listen(this.south.nativeElement, "dragover", (event: DragEvent) => {
                event.preventDefault();
            });
            this.renderer.listen(this.south.nativeElement, "drop", (event: DragEvent) => {
                this.locateTo(event, 3);
                this.detector.detectChanges();
                this.detector.reattach();

                DockContainerComponent.lastEnterEle = null;
            });
            this.renderer.listen(this.west.nativeElement, "dragenter", (event: DragEvent) => {
                event.preventDefault();
                event.stopPropagation();
                this.dataSource.showCover();
                this.renderer.setElementStyle(this.navCover.nativeElement, "top", "0");
                this.renderer.setElementStyle(this.navCover.nativeElement, "left", "0");
                this.renderer.setElementStyle(this.navCover.nativeElement, "width", "30%");
                this.renderer.setElementStyle(this.navCover.nativeElement, "height", "100%");
                this.detector.detectChanges();
            });
            this.renderer.listen(this.west.nativeElement, "dragover", (event: DragEvent) => {
                event.preventDefault();
            });
            this.renderer.listen(this.west.nativeElement, "drop", (event: DragEvent) => {
                this.locateTo(event, 4);
                this.detector.detectChanges();
                this.detector.reattach();

                DockContainerComponent.lastEnterEle = null;
            });
            this.renderer.listen(this.east.nativeElement, "dragenter", (event: DragEvent) => {
                event.preventDefault();
                event.stopPropagation();
                this.dataSource.showCover();
                this.renderer.setElementStyle(this.navCover.nativeElement, "top", "0");
                this.renderer.setElementStyle(this.navCover.nativeElement, "left", "70%");
                this.renderer.setElementStyle(this.navCover.nativeElement, "width", "30%");
                this.renderer.setElementStyle(this.navCover.nativeElement, "height", "100%");
                this.detector.detectChanges();
            });
            this.renderer.listen(this.east.nativeElement, "dragover", (event: DragEvent) => {
                event.preventDefault();
            });
            this.renderer.listen(this.east.nativeElement, "drop", (event: DragEvent) => {
                this.locateTo(event, 2);
                this.detector.detectChanges();
                this.detector.reattach();

                DockContainerComponent.lastEnterEle = null;
            });
        }

        if (this.isSplitter()) {
            DockContainerComponent.startWatchMouse();
            this.renderer.listen(this.container.nativeElement, "mousedown", (event: MouseEvent) => {
                event.preventDefault();
                event.stopPropagation();
                DockContainerComponent.splitter = this;
                DockContainerComponent.startPoint = [event.pageX, event.pageY];
            });
        }
    }

    isTabPanel() {
        return this.className === "tab-panel";
    }

    isDockContainer() {
        return this.className.startsWith("dock-container");
    }

    isSplitter() {
        return this.className.startsWith("splitter");
    }

    locateTo(event: DragEvent, locate: number) {
        event.preventDefault();
        event.stopPropagation();
        this.dataSource.hideNavbar();
        this.dataSource.hideCover();
        let [srcTabpageId, srcPanelId] = event.dataTransfer.getData("text/plain").split("&");
        this.dataSource.appendTabpage(srcTabpageId, srcPanelId, locate);
    }

    static bInit = false;
    static startWatchMouse() {
        if (DockContainerComponent.bInit)
            return;

        DockContainerComponent.bInit = true;
        let ev_resize = document.createEvent("CustomEvent");
        ev_resize.initCustomEvent("resize", false, false, null);

        document.onmousemove = (event) => {
            if (DockContainerComponent.splitter === null)
                return;

            if (DockContainerComponent.splitter.className.includes("vertical")) {
                let gap = event.pageX - DockContainerComponent.startPoint[0];

                if (DockContainerComponent.splitter.ele.nativeElement.previousSibling.firstChild.clientWidth + gap < 0
                    || DockContainerComponent.splitter.ele.nativeElement.nextSibling.firstChild.clientWidth - gap < 0) {
                    return;
                }

                DockContainerComponent.splitter.renderer.setElementStyle(DockContainerComponent.splitter.ele.nativeElement.previousSibling.firstChild, "width",
                    `${DockContainerComponent.splitter.ele.nativeElement.previousSibling.firstChild.clientWidth + gap}`);

                DockContainerComponent.splitter.renderer.setElementStyle(DockContainerComponent.splitter.ele.nativeElement.nextSibling.firstChild, "width",
                    `${DockContainerComponent.splitter.ele.nativeElement.nextSibling.firstChild.clientWidth - gap}`);

            } else {
                let gap = event.pageY - DockContainerComponent.startPoint[1];

                if (DockContainerComponent.splitter.ele.nativeElement.previousSibling.firstChild.clientHeight + gap < 0
                    || DockContainerComponent.splitter.ele.nativeElement.nextSibling.firstChild.clientHeight - gap < 0) {
                    return;
                }

                DockContainerComponent.splitter.renderer.setElementStyle(DockContainerComponent.splitter.ele.nativeElement.previousSibling.firstChild, "height",
                    `${DockContainerComponent.splitter.ele.nativeElement.previousSibling.firstChild.clientHeight + gap}`);

                DockContainerComponent.splitter.renderer.setElementStyle(DockContainerComponent.splitter.ele.nativeElement.nextSibling.firstChild, "height",
                    `${DockContainerComponent.splitter.ele.nativeElement.nextSibling.firstChild.clientHeight - gap}`);
            }

            let leftTb = DockContainerComponent.splitter.ele.nativeElement.previousSibling.querySelector("dock-table2");
            let rightTb = DockContainerComponent.splitter.ele.nativeElement.nextSibling.querySelector("dock-table2");

            if (leftTb !== null) {
                leftTb.dispatchEvent(ev_resize);
            }

            if (rightTb !== null) {
                rightTb.dispatchEvent(ev_resize);
            }

            DockContainerComponent.startPoint = [event.pageX, event.pageY];
            // DockContainerComponent.splitter = null;
        };

        document.onmouseup = event => {
            DockContainerComponent.splitter = null;
        };
    }
}

/**
 * Dialog
 */
@Component({
    moduleId: module.id,
    selector: ".dialog",
    templateUrl: "dialog.html",
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