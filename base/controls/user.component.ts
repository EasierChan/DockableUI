/**
 * created by chenlei
 * used to created custom user control based on className and dataSource.
 */
import {
    Component, Input, ElementRef, AfterViewInit, OnInit, HostBinding, Directive,
    ViewChild, Renderer, HostListener, ChangeDetectorRef, Output, EventEmitter
} from "@angular/core";
import { NgForm } from "@angular/forms";
import {
    CssStyle, Control, ComboControl, Dialog, StatusBar, TabPanel
} from "./control";
import {
    ScrollerBarTable
} from "./data.component";
import { SecuMasterService } from "../api/services/backend.service";

@Component({
    moduleId: module.id,
    selector: "usercontrol",
    templateUrl: "usercontrol.html",
    inputs: ["children", "dataSource", "styleObj"]
})
export class UserControlComponent implements AfterViewInit {
    children: any[];
    dataSource: any;
    styleObj: any;

    ngAfterViewInit(): void {

    }
}

@Component({
    moduleId: module.id,
    selector: "usercontrol",
    templateUrl: "usercontrol2.html",
    inputs: ["children", "dataSource", "styleObj"]
})
export class UserControlComponent2 {
    children: any[];
    dataSource: any;
    styleObj: any;
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
    static timeouter: any = null;
    static hasActive: boolean;
    static splitter: any = null;
    static startPoint: any = [0, 0];
    static lastEnterEle = null;
    @ViewChild("container") container: ElementRef;
    // @ViewChild("navSN") navSN: ElementRef;
    // @ViewChild("navEW") navEW: ElementRef;
    @ViewChild("north") north: ElementRef;
    @ViewChild("south") south: ElementRef;
    @ViewChild("west") west: ElementRef;
    @ViewChild("east") east: ElementRef;
    @ViewChild("center") center: ElementRef;
    @ViewChild("navCover") navCover: ElementRef;

    constructor(private renderer: Renderer, private ele: ElementRef, private detector: ChangeDetectorRef) { }

    ngAfterViewInit() {
        if (this.isDockContainer() && this.children.length === 1) {
            this.styleObj.getWidth = () => {
                return this.ele.nativeElement.clientWidth > 0 ? this.ele.nativeElement.clientWidth : this.container.nativeElement.clientWidth;
            };
            this.styleObj.getHeight = () => {
                return this.ele.nativeElement.clientHeight > 0 ? this.ele.nativeElement.clientHeight : this.container.nativeElement.clientHeight;
            };
            this.renderer.listen(this.container.nativeElement, "dragenter", (event: DragEvent) => {
                event.preventDefault();
                event.stopPropagation();
                DockContainerComponent.hasActive = true;
                this.detector.detach();
                this.dataSource.showNavbar();
                // this.renderer.setElementStyle(this.navSN.nativeElement, "top", "0");
                // this.renderer.setElementStyle(this.navSN.nativeElement, "left", `${(this.container.nativeElement.clientWidth - 30) / 2}`);
                // this.renderer.setElementStyle(this.navEW.nativeElement, "top", `${(this.container.nativeElement.clientHeight - 30) / 2}`);
                // this.renderer.setElementStyle(this.navEW.nativeElement, "left", "0");

                // if (this.styleObj.canHoldpage) {
                //     this.dataSource.showCover();
                //     this.renderer.setElementStyle(this.navCover.nativeElement, "top", "0");
                //     this.renderer.setElementStyle(this.navCover.nativeElement, "left", "0");
                //     this.renderer.setElementStyle(this.navCover.nativeElement, "width", "100%");
                //     this.renderer.setElementStyle(this.navCover.nativeElement, "height", "100%");
                // }

                this.detector.detectChanges();

                if (DockContainerComponent.lastEnterEle !== null && DockContainerComponent.lastEnterEle !== this) {
                    DockContainerComponent.lastEnterEle.detector.detectChanges();
                    DockContainerComponent.lastEnterEle.detector.reattach();
                }

                DockContainerComponent.lastEnterEle = this;
            });
            // this.renderer.listen(this.container.nativeElement, "dragover", (event: DragEvent) => {
            //     event.preventDefault();
            //     event.stopPropagation();
            // });
            // this.renderer.listen(this.container.nativeElement, "drop", (event: DragEvent) => {
            //     event.preventDefault();
            //     this.locateTo(event, 0);
            //     this.detector.detectChanges();
            //     this.detector.reattach();

            //     DockContainerComponent.lastEnterEle = null;
            // });
            this.renderer.listen(this.center.nativeElement, "dragenter", (event: DragEvent) => {
                this.dataSource.showCover();
                this.renderer.setElementStyle(this.navCover.nativeElement, "top", "0");
                this.renderer.setElementStyle(this.navCover.nativeElement, "left", "0");
                this.renderer.setElementStyle(this.navCover.nativeElement, "width", "100%");
                this.renderer.setElementStyle(this.navCover.nativeElement, "height", "100%");
            });
            this.renderer.listen(this.center.nativeElement, "dragover", (event: DragEvent) => {
                event.preventDefault();
                event.stopPropagation();
            });
            this.renderer.listen(this.center.nativeElement, "drop", (event: DragEvent) => {
                event.preventDefault();
                this.locateTo(event, 0);
                this.detector.detectChanges();
                this.detector.reattach();

                DockContainerComponent.lastEnterEle = null;
            });
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

                DockContainerComponent.hasActive = false;
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
                    `${DockContainerComponent.splitter.ele.nativeElement.previousSibling.firstChild.clientWidth + gap}px`);

                DockContainerComponent.splitter.renderer.setElementStyle(DockContainerComponent.splitter.ele.nativeElement.nextSibling.firstChild, "width",
                    `${DockContainerComponent.splitter.ele.nativeElement.nextSibling.firstChild.clientWidth - gap}px`);

                let leftTb = DockContainerComponent.splitter.ele.nativeElement.previousSibling.querySelectorAll("dock-table2");
                let rightTb = DockContainerComponent.splitter.ele.nativeElement.nextSibling.querySelectorAll("dock-table2");

                if (leftTb !== null) {
                    leftTb.forEach(element => {
                        element.dispatchEvent(ev_resize);
                    });
                }

                if (rightTb !== null) {
                    rightTb.forEach(element => {
                        element.dispatchEvent(ev_resize);
                    });
                }
            } else {
                let gap = event.pageY - DockContainerComponent.startPoint[1];

                if (DockContainerComponent.splitter.ele.nativeElement.previousSibling.firstChild.clientHeight + gap < 0
                    || DockContainerComponent.splitter.ele.nativeElement.nextSibling.firstChild.clientHeight - gap < 0) {
                    return;
                }

                DockContainerComponent.splitter.renderer.setElementStyle(DockContainerComponent.splitter.ele.nativeElement.previousSibling.firstChild, "height",
                    `${DockContainerComponent.splitter.ele.nativeElement.previousSibling.firstChild.clientHeight + gap}px`);
                DockContainerComponent.splitter.dataSource.prev().reallocSize(DockContainerComponent.splitter.ele.nativeElement.previousSibling.firstChild.clientWidth,
                    DockContainerComponent.splitter.ele.nativeElement.previousSibling.firstChild.clientHeight + gap);

                DockContainerComponent.splitter.renderer.setElementStyle(DockContainerComponent.splitter.ele.nativeElement.nextSibling.firstChild, "height",
                    `${DockContainerComponent.splitter.ele.nativeElement.nextSibling.firstChild.clientHeight - gap}px`);
                DockContainerComponent.splitter.dataSource.next().reallocSize(DockContainerComponent.splitter.ele.nativeElement.nextSibling.firstChild.clientWidth,
                    DockContainerComponent.splitter.ele.nativeElement.nextSibling.firstChild.clientHeight - gap);
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
export class DialogComponent implements AfterViewInit {
    dialog: Dialog;
    @ViewChild("head") head: ElementRef;
    @ViewChild("holder") holder: ElementRef;
    bMouseDown: boolean;
    startPoint: number[];

    constructor(private ele: ElementRef, private render: Renderer) {
        this.bMouseDown = false;
    }

    ngAfterViewInit() {
        this.render.setElementStyle(this.holder.nativeElement, "width", `${this.dialog.width}px`);
        this.render.setElementStyle(this.holder.nativeElement, "height", `${this.dialog.height}px`);
        this.render.setElementStyle(this.holder.nativeElement, "left", `${((this.ele.nativeElement.clientWidth - this.holder.nativeElement.clientWidth) / 2)}px`);
        this.render.setElementStyle(this.holder.nativeElement, "top", `${((this.ele.nativeElement.clientHeight - this.holder.nativeElement.clientHeight) / 2)}px`);
        this.render.listen(this.head.nativeElement, "mousedown", (event: MouseEvent) => {
            this.bMouseDown = true;
            this.startPoint = [event.pageX, event.pageY];
        });
    }

    @HostListener("mousemove", ["$event"])
    onMouseMove(event: MouseEvent) {
        if (!this.bMouseDown)
            return false;

        let [offsetX, offsetY] = [event.pageX - this.startPoint[0], event.pageY - this.startPoint[1]];
        this.render.setElementStyle(this.holder.nativeElement, "left", `${(this.holder.nativeElement.offsetLeft + offsetX)}px`);
        this.render.setElementStyle(this.holder.nativeElement, "top", `${(this.holder.nativeElement.offsetTop + offsetY)}px`);
        this.startPoint = [event.pageX, event.pageY];
    }

    @HostListener("mouseup")
    onMouseUp() {
        this.bMouseDown = false;
    }
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



@Component({
    moduleId: module.id,
    selector: "action-bar",
    styleUrls: ["actionbar.css"],
    templateUrl: "actionbar.html",
    inputs: ["styleObj", "dataSource"]
})
export class ActionBarComponent implements OnInit {
    styleObj: any;
    dataSource: any;

    @HostBinding("attr.role") role = "navigation";
    @HostBinding("style.backgroundColor") get backgroundColor() {
        if (this.styleObj.backgroundColor)
            return this.styleObj.backgroundColor;

        return "#333";
    };

    @HostBinding("style.margin-left") get left() {
        if (typeof this.styleObj.left !== "undefined")
            return this.styleObj.left + "px";

        return "0";
    }

    @HostBinding("style.width") get width() {
        if (typeof this.styleObj.width !== "undefined")
            return this.styleObj.width + "px";

        return "50px";
    }

    constructor(private ele: ElementRef, private render: Renderer) {
    }

    ngOnInit() {
    }
}

@Component({
    moduleId: module.id,
    selector: "tilearea",
    styleUrls: ["tilearea.css"],
    templateUrl: "tilearea.html",
    inputs: ["styleObj", "dataSource"]
})
export class TileAreaComponent {
    styleObj: any;
    dataSource: any;

    @HostBinding("style.display") get display() {
        return "flex";
    }

    @HostBinding("style.flex-flow") get flow() {
        return "column";
    }
}

@Component({
    moduleId: module.id,
    selector: "u-codes",
    styleUrls: ["code.searcher.css"],
    template: `
        <input type="text" class="btn-default" placeholder="Search..." (input)="onSearch(searcher.value)" (blur)="autoHide()" [ngModel]="selectedItem?.symbolCode" ondragstart="return false;" #searcher>
        <ul *ngIf="resList&&resList.length > 0" class="dropdown">
            <li *ngFor="let item of resList; let i = index" (click)="listClick($event, item)" [style.backgroundColor]="i === curIdx ? 'black': null">{{item.symbolCode}} {{item.SecuAbbr}}</li>
        </ul>
    `
})
export class CodeComponent {
    resList: any;
    curIdx = 0;

    @Input("selectedItem") selectedItem: any;
    @Output() onSelect: EventEmitter<any> = new EventEmitter<any>();
    @Output() onInput: EventEmitter<any> = new EventEmitter<any>();

    constructor(private secuinfo: SecuMasterService) {
    }

    @HostListener("keyup", ["$event"])
    onKeyUp(event: KeyboardEvent) {
        if (this.resList === undefined || this.resList === null) {
            return;
        }

        if (event.keyCode !== 40 && event.keyCode !== 38 && event.keyCode !== 13)
            return;

        if (event.keyCode === 40) {
            this.curIdx = this.curIdx < 0 ? 0 : (this.curIdx + 1 + this.resList.length) % this.resList.length;
        } else if (event.keyCode === 38) { // ArrowUp
            this.curIdx = this.curIdx < 0 ? (this.resList.length - 1)
                : ((this.curIdx - 1 + this.resList.length) % this.resList.length);
        } else { // Enter
            this.listClick(event, this.resList[this.curIdx < 0 ? 0 : this.curIdx]);
        }
    }

    onSearch(value) {
        this.resList = this.secuinfo.getCodeList(value);
        this.curIdx = 0;
        this.onInput.emit(value);
    }

    autoHide() {
        setTimeout(() => {
            this.resList = null;
        }, 500);
    }

    listClick(event: Event, item) {
        event.preventDefault();
        event.stopPropagation();
        this.selectedItem = item;
        this.onSelect.emit(item);
        this.resList = null;
    }
}

@Component({
    moduleId: module.id,
    selector: "button-group",
    template: `
        <button *ngFor="let item of buttons; let index = index" type="button" class="btn btn-xs btn-{{btnClass}}" (click)="itemClick($event, index)" [disabled]="option?.disable.includes(index)">
            <span class="glyphicon glyphicon-{{item}}" aria-hidden="true"></span>
        </button>
    `,
    inputs: ["buttons", "option", "btnClass"]
})
export class ButtonGroupComponent implements OnInit {
    buttons: string[];
    option: any;
    btnClass: string;

    @HostBinding("class") cssClass: string = "btn-group";
    @HostBinding("style.width.px") width: number;
    @HostBinding("attr.role") role: string = "group";
    @Output() onClick: EventEmitter<any> = new EventEmitter<any>();

    ngOnInit() {
        this.width = this.buttons.length * 25;
    }

    itemClick(event: Event, index: number) {
        event.stopPropagation();
        event.preventDefault();
        this.onClick.emit(index);
    }
}

@Directive({
    selector: "[hbox]",
    host: {
        "[style.display]": "flex",
        "[style.flex-flow]": "row"
    }
})
export class VBoxDirective {
}