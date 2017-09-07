/**
 * created by chenlei
 */
import { Menu, MenuItem } from "../api/services/backend.service";
import { DockContainerComponent } from "./user.component";

export interface CssStyle {
    type: string;
    width: number;
    height: number;
}

export class Control {
    protected className: string;
    protected children: any[];
    protected dataSource: any;
    protected styleObj: any;
    protected listeners: any;
}

export class DockContainer extends Control {
    static dockMap: Object = {};
    static docksn: number = 1;
    private id: string;
    private subpanel: TabPanel;

    constructor(private parent: DockContainer, type: "v" | "h", width?: number, height?: number) {
        super();
        this.id = "u-dock" + DockContainer.docksn++;
        DockContainer.dockMap[this.id] = this;

        if (type === "v") {
            this.className = "dock-container vertical";
            this.styleObj = {
                type: type,
                width: width === undefined ? 300 : width,
                height: null
            };
        } else {
            this.className = "dock-container horizental";
            this.styleObj = {
                type: type,
                width: null,
                height: height === undefined ? 200 : height
            };
        }

        this.styleObj.canHoldpage = false;
        this.styleObj.showNavbar = false;
        this.styleObj.showCover = false;
        this.children = [];
        this.dataSource = {};
        this.dataSource.appendTabpage = (pageid: string, panelId: string, location: number) => {
            if (TabPanel.fromPanelId(panelId) === null)
                return;

            if (this.subpanel && this.subpanel.id === panelId && this.subpanel.getAllTabs().length === 1) {
                return;
            }
            // console.info("drop", location);
            switch (location) {
                case 0: // center
                    if (this.subpanel && this.subpanel.id !== panelId) {
                        this.subpanel.addTab(TabPanel.fromPanelId(panelId).removeTab(pageid));
                        this.subpanel.setActive(pageid);
                    }
                    break;
                case 1: // north
                    let northHeight = Math.round(this.height / 2);
                    let dockNorth;
                    let panelNorth = new TabPanel();
                    panelNorth.addTab(TabPanel.fromPanelId(panelId).removeTab(pageid));
                    panelNorth.setActive(pageid);

                    if (this.styleObj.type === "v") {
                        dockNorth = new DockContainer(this, "h", null, northHeight);
                        dockNorth.addChild(panelNorth);

                        let dockSouth = new DockContainer(this, "h", null, this.height - 5 - northHeight);
                        this.children.forEach(child => {
                            dockSouth.addChild(child);
                        });

                        this.children.length = 0;
                        this.subpanel = null;

                        this.addChild(dockNorth);
                        this.addChild(new Splitter("h", this));
                        this.addChild(dockSouth);
                    } else {
                        dockNorth = new DockContainer(this.parent, "h", null, northHeight);
                        dockNorth.addChild(panelNorth);

                        this.styleObj.height = this.height - 5 - northHeight;
                        this.parent.children.splice(this.parent.children.indexOf(this), 0, dockNorth, new Splitter("h", this.parent));
                    }
                    break;
                case 2: // east
                    let eastWidth = Math.round(this.width / 2);
                    let dockEast;
                    let panelEast = new TabPanel();
                    panelEast.addTab(TabPanel.fromPanelId(panelId).removeTab(pageid));
                    panelEast.setActive(pageid);

                    if (this.styleObj.type === "v") {
                        dockEast = new DockContainer(this.parent, "v", eastWidth, null);
                        dockEast.addChild(panelEast);

                        this.styleObj.width = this.width - 5 - eastWidth;
                        this.parent.children.splice(this.parent.children.indexOf(this) + 1, 0, new Splitter("v", this.parent), dockEast);
                    } else {
                        dockEast = new DockContainer(this, "v", eastWidth, null);
                        dockEast.addChild(panelEast);

                        let dockWest = new DockContainer(this, "v", this.width - 5 - eastWidth, null);
                        this.children.forEach(child => {
                            dockWest.addChild(child);
                        });
                        this.children.length = 0;
                        this.subpanel = null;

                        this.addChild(dockWest);
                        this.addChild(new Splitter("v", this));
                        this.addChild(dockEast);
                    }
                    break;
                case 3: // south
                    let southHeight = Math.round(this.height / 2);
                    let dockSouth;
                    let panelSouth = new TabPanel();
                    panelSouth.addTab(TabPanel.fromPanelId(panelId).removeTab(pageid));
                    panelSouth.setActive(pageid);

                    if (this.styleObj.type === "v") {
                        dockSouth = new DockContainer(this, "h", null, southHeight);
                        dockSouth.addChild(panelSouth);

                        let dockNorth = new DockContainer(this, "h", null, this.height - 5 - southHeight);
                        this.children.forEach(child => {
                            dockNorth.addChild(child);
                        });
                        this.children.length = 0;
                        this.subpanel = null;

                        this.addChild(dockNorth);
                        this.addChild(new Splitter("h", this));
                        this.addChild(dockSouth);
                    } else {
                        dockSouth = new DockContainer(this.parent, "h", null, southHeight);
                        dockSouth.addChild(panelSouth);

                        this.styleObj.height = this.height - 5 - southHeight;
                        this.parent.children.splice(this.parent.children.indexOf(this) + 1, 0, new Splitter("h", this.parent), dockSouth);
                    }
                    break;
                case 4: // west
                    let westWidth = Math.round(this.width / 2);
                    let dockWest: DockContainer;
                    let panelWest = new TabPanel();
                    panelWest.addTab(TabPanel.fromPanelId(panelId).removeTab(pageid));
                    panelWest.setActive(pageid);

                    if (this.styleObj.type === "v") {
                        dockWest = new DockContainer(this.parent, "v", westWidth, null);
                        dockWest.addChild(panelWest);
                        this.styleObj.width = this.width - 5 - westWidth;
                        this.parent.children.splice(this.parent.children.indexOf(this), 0, dockWest, new Splitter("v", this.parent));
                        console.info(this.id, this.parent);
                    } else {
                        dockWest = new DockContainer(this, "v", westWidth, null);
                        dockWest.addChild(panelWest);

                        let dockEast = new DockContainer(this, "v", this.width - 5 - westWidth, null);
                        this.children.forEach(child => {
                            dockEast.addChild(child);
                        });
                        this.children.length = 0;
                        this.subpanel = null;

                        this.addChild(dockWest);
                        this.addChild(new Splitter("v", this));
                        this.addChild(dockEast);
                    }
                    break;
                default:
                    break;
            }

            if (TabPanel.fromPanelId(panelId).getAllTabs().length === 0) {
                DockContainer.clearUnvalidUp(this, panelId);
            }
        };
        this.dataSource.showNavbar = () => {
            this.styleObj.showNavbar = true;
            for (let prop in DockContainer.dockMap) {
                if (prop !== this.id) {
                    DockContainer.dockMap[prop].styleObj.showNavbar = false;
                    DockContainer.dockMap[prop].styleObj.showCover = false;
                }
            }
        };
        this.dataSource.hideNavbar = () => {
            this.styleObj.showNavbar = false;
        };
        this.dataSource.showCover = () => {
            this.styleObj.showCover = true;

            for (let prop in DockContainer.dockMap) {
                if (prop !== this.id) {
                    DockContainer.dockMap[prop].styleObj.showCover = false;
                }
            }
        };
        this.dataSource.hideCover = () => {
            this.styleObj.showCover = false;
        };
    }

    addChild(containerRef: any): DockContainer {
        if (containerRef instanceof TabPanel) {
            this.subpanel = containerRef;
            this.styleObj.canHoldpage = true;
        }

        containerRef.parent = this;
        this.children.push(containerRef);
        return this;
    }

    get width() {
        if (typeof this.styleObj.getWidth === "function")
            return this.styleObj.getWidth();
        else
            return this.styleObj.width;
    }

    get height() {
        if (typeof this.styleObj.getHeight === "function")
            return this.styleObj.getHeight();
        else
            return this.styleObj.height;
    }

    hasTabpage(pageid: string) {
        if (!this.subpanel)
            return false;
        return this.subpanel.getAllTabs().includes(pageid);
    }

    showNavbar() {
        this.styleObj.showNavbar = true;
        for (let prop in DockContainer.dockMap) {
            if (prop !== this.id) {
                DockContainer.dockMap[prop].styleObj.showNavbar = false;
            }
        }
    }

    hideNavbar() {
        this.styleObj.showNavbar = false;
    }

    reallocSize(width, height) {
        let childTotalWH = 0;
        let diff = 0;
        let zoomRate = 0;
        // console.info(this.id, this.styleObj.type, width, height);
        if (this.styleObj.type === "v") {
            this.styleObj.width = width;
            if (this.subpanel)
                return;

            this.children.forEach(hitem => {
                childTotalWH += hitem.height;
            });
            diff = height - childTotalWH;
            zoomRate = height / childTotalWH;
            this.children.forEach((item, index) => {
                if (item instanceof DockContainer) {
                    if (index === this.children.length - 1) {
                        item.reallocSize(width, item.height + diff);
                        return;
                    }
                    diff -= item.height * (zoomRate - 1);
                    item.reallocSize(width, item.height * zoomRate);
                }
            });
        } else {
            this.styleObj.height = height;
            if (this.subpanel)
                return;

            this.children.forEach(hitem => {
                childTotalWH += hitem.width;
            });

            diff = width - childTotalWH;
            zoomRate = width / childTotalWH;

            this.children.forEach((item, index) => {
                if (item instanceof DockContainer) {
                    if (index === this.children.length - 1) {
                        item.reallocSize(item.width + diff, height);
                        return;
                    }
                    diff -= item.width * (zoomRate - 1);
                    item.reallocSize(item.width * zoomRate, height);
                }
            });
        }
        childTotalWH = null;
        diff = null;
        zoomRate = null;
    }

    /**
     * find the unvalid item from bottom to top, then remove it and resize.
     * @param leaf It's the container include the page from panel whose id is 'panelId.'
     * @param panelId whose panel don't have any tabpage.
     */
    static clearUnvalidUp(leaf: DockContainer, panelId) {
        // console.info("clearUnvalidUP");
        if (leaf.parent === null)
            return;

        let siblings = leaf.parent.children;
        let len = siblings.length;

        if (len === 1) {
            return DockContainer.clearUnvalidUp(leaf.parent, panelId);
        }

        for (let index = 0; index < len; ++index) {
            if (siblings[index] instanceof DockContainer && siblings[index] !== leaf) {
                if (!siblings[index].subpanel) {
                    if (DockContainer.clearUnvalidDown(siblings[index], panelId))
                        return;
                } else {
                    if (siblings[index].subpanel.id === panelId) {
                        // TODO clear unvalid clear
                        // have siblings
                        if (len > 1) {
                            if (index === len - 1) { // last one
                                if (siblings[index - 2].styleObj.type === "v") {
                                    siblings[index - 2].styleObj.width =
                                        siblings[index - 1].width + siblings[index].width + siblings[index - 2].width;
                                    siblings[index - 2].reallocSize(siblings[index - 2].styleObj.width, siblings[index - 2].height);
                                } else {
                                    siblings[index - 2].styleObj.height =
                                        siblings[index - 1].height + siblings[index].height + siblings[index - 2].height;
                                    siblings[index - 2].reallocSize(siblings[index - 2].width, siblings[index - 2].styleObj.height);
                                }

                                siblings.splice(index - 1, 2);
                            } else {
                                if (siblings[index + 2].styleObj.type === "v") {
                                    siblings[index + 2].styleObj.width =
                                        siblings[index].width + siblings[index + 1].width + siblings[index + 2].width;
                                    siblings[index + 2].reallocSize(siblings[index + 2].styleObj.width, siblings[index + 2].height);
                                } else {
                                    siblings[index + 2].styleObj.height =
                                        siblings[index].height + siblings[index + 1].height + siblings[index + 2].height;
                                    siblings[index + 2].reallocSize(siblings[index + 2].width, siblings[index + 2].styleObj.height);
                                }

                                siblings.splice(index, 2);
                            }
                        } else {
                            siblings.splice(index, 1);
                        }

                        return;
                    }
                }
            }
        }

        return DockContainer.clearUnvalidUp(leaf.parent, panelId);
    }

    /**
     * find a empty panel from top to bottom
     * @param leaf find into it.
     * @param panelId the empty panel's id.
     */
    static clearUnvalidDown(leaf: DockContainer, panelId) {
        if (leaf === null)
            return false;

        let children = leaf.children;
        let len = children.length;

        for (let index = 0; index < len; ++index) {
            if (children[index] instanceof DockContainer) {
                if (children[index].subpanel) {
                    // TODO clear unvalid clear
                    if (children[index].subpanel.id === panelId) {
                        // have siblings
                        if (len > 1) {
                            if (index === len - 1) { // last one
                                if (children[index - 2].styleObj.type === "v") {
                                    children[index - 2].styleObj.width =
                                        children[index - 1].width + children[index].width + children[index - 2].width;
                                    children[index - 2].reallocSize(children[index - 2].styleObj.width, children[index - 2].height);
                                } else {
                                    children[index - 2].styleObj.height =
                                        children[index - 1].height + children[index].height + children[index - 2].height;
                                    children[index - 2].reallocSize(children[index - 2].width, children[index - 2].styleObj.height);
                                }

                                children.splice(index - 1, 2);
                            } else {
                                if (children[index + 2].styleObj.type === "v") {
                                    children[index + 2].styleObj.width =
                                        children[index].width + children[index + 1].width + children[index + 2].width;
                                    children[index + 2].reallocSize(children[index + 2].styleObj.width, children[index + 2].height);
                                } else {
                                    children[index + 2].styleObj.height =
                                        children[index].height + children[index + 1].height + children[index + 2].height;
                                    children[index + 2].reallocSize(children[index + 2].width, children[index + 2].styleObj.height);
                                }

                                children.splice(index, 2);
                            }
                        }

                        if (children.length === 1) { // container only have a container
                            leaf.subpanel = null;

                            children[0].children.forEach(child => {
                                leaf.addChild(child);
                            });

                            leaf.children.splice(0, 1);
                        }

                        return true;
                    }
                } else {
                    if (DockContainer.clearUnvalidDown(children[index], panelId))
                        break;
                }
            }
        }

        return false;
    }

    getLayout() {
        let layout: any = {};
        layout.type = this.styleObj.type;
        layout.width = this.width;
        layout.height = this.height;

        if (this.subpanel && this.children.length === 1) {
            layout.modules = this.subpanel.getAllTabs();
        } else {
            layout.children = [];
            this.children.forEach(child => {
                if (child instanceof DockContainer) {
                    layout.children.push(child.getLayout());
                }
            });
        }

        return layout;
    }

    removeTabpage(pageid: string) {
        if (this.subpanel) {
            if (this.subpanel.removeTab(pageid) !== null) {
                if (this.subpanel.getAllTabs().length === 0) {
                    DockContainer.clearUnvalidUp(this, this.subpanel.id);
                }
                return true;
            }
        }

        let len = this.children.length;
        for (let i = 0; i < len; ++i) {
            if (this.children[i] instanceof DockContainer) {
                if (this.children[i].removeTabpage(pageid)) {
                    return true;
                }
            }
        }

        return false;
    }

    getFirstChildPanel(): TabPanel {
        if (this.subpanel)
            return this.subpanel;

        let len = this.children.length;
        for (let i = 0; i < len; ++i) {
            if (this.children[i] instanceof DockContainer) {
                if (this.children[i].subpanel) {
                    return this.children[i].subpanel;
                } else {
                    return this.children[i].getFirstChildPanel();
                }
            }
        }

        return null;
    }
}

export class Splitter extends Control {
    static readonly size = 5;
    constructor(type, parent) {
        super();
        this.className = type === "v" ? "splitter-bar vertical" : "splitter-bar horizental";
        this.dataSource = { parent: parent };
        this.dataSource.prev = () => { return this.prev(); };
        this.dataSource.next = () => { return this.next(); };
    }

    get height() {
        return Splitter.size;
    }

    get width() {
        return Splitter.size;
    }

    get parent() {
        return this.dataSource.parent;
    }

    set parent(value: any) {
        this.dataSource.parent = value;
    }

    get index() {
        return this.parent.children.indexOf(this);
    }

    prev(): DockContainer {
        return this.parent.children[this.index - 1];
    }

    next(): DockContainer {
        return this.parent.children[this.index + 1];
    }
}

export class TabPanel extends Control {
    private static sn = 1;
    private static panelMap: Object = {};
    id: string;
    protected pages: TabPages;
    protected headers: TabHeaders;
    private afterPageClosed: Function;
    parent: any;

    constructor() {
        super();
        this.id = "u-tabpanel" + TabPanel.sn++;
        this.pages = new TabPages();
        this.headers = new TabHeaders();
        this.className = "tab-panel";
        this.styleObj = {
            type: "tabpanel",
            width: null,
            height: null
        };
        this.children = [];
        this.children.push(this.pages);
        this.children.push(this.headers);
        this.dataSource = { id: this.id };
        this.dataSource.setActive = (pageid) => {
            this.setActive(pageid);
        };
        this.dataSource.onClose = (pageid) => {
            this.removeTab(pageid);
            if (this.getAllTabs().length === 0) {
                if (!DockContainer.clearUnvalidDown(this.parent.parent, this.id)) {
                    DockContainer.clearUnvalidDown(this.parent.parent.parent, this.id);
                }
            }
            if (this.afterPageClosed) {
                this.afterPageClosed(pageid);
            }
            if (TabPanel.afterAnyPageClosed) {
                TabPanel.afterAnyPageClosed(pageid);
            }
        };
        TabPanel.panelMap[this.id] = this;
    }
    /**
     * pageId connection between header and title
     * @param pageId connection between header and title
     * @param pageTitle show the tab desc
     */
    addTab2(pageId, pageTitle): TabPanel {
        this.headers.addHeader(new TabHeader(pageId, pageTitle));
        this.pages.addPage(new TabPage(pageId, pageTitle));
        return this;
    }

    addTab(page: TabPage, closeable = true): TabPanel {
        let header = new TabHeader(page.id, page.title);
        header.closeable = closeable;
        this.headers.addHeader(header);
        this.pages.addPage(page);
        return this;
    }

    getAllTabs(): string[] {
        let res = [];

        this.pages.getAllPage().forEach(item => {
            res.push(item.id);
        });

        return res;
    }

    removeTab(pageid: string) {
        this.headers.removeHeader(pageid);
        let respage = this.pages.removePage(pageid);
        this.headers.getAllHeader().forEach((header, index) => {
            if (index === 0)
                header.setActive();
            else
                header.unActive();
        });
        this.pages.getAllPage().forEach(page => {
            if (page.id === this.headers.at(0).targetId)
                page.setActive();
            else
                page.unActive();
        });
        return respage;
    }

    setActive(pageId: string): TabPanel {
        this.pages.getAllPage().forEach(page => {
            if (page.id === pageId)
                page.setActive();
            else
                page.unActive();
        });

        this.headers.getAllHeader().forEach(header => {
            if (header.targetId === pageId)
                header.setActive();
            else
                header.unActive();
        });
        return this;
    }

    static fromPanelId(panelId: string): TabPanel {
        if (TabPanel.panelMap.hasOwnProperty(panelId) && TabPanel.panelMap[panelId]) {
            return TabPanel.panelMap[panelId];
        }

        return null;
    }

    static afterAnyPageClosed: Function;
}

export class TabPages extends Control {
    protected pages: TabPage[] = [];
    constructor() {
        super();
    }

    addPage(page: TabPage): TabPages {
        this.pages.push(page);
        return this;
    }

    removePage(id: string) {
        let len = this.pages.length - 1;
        for (; len >= 0; --len) {
            if (this.pages[len].id === id) {
                return this.pages.splice(len, 1)[0];
            }
        }

        return null;
    }

    getAllPage(): TabPage[] {
        return this.pages;
    }
}

export class TabHeaders extends Control {
    protected headers: TabHeader[] = [];
    constructor() {
        super();
    }

    addHeader(header: TabHeader): TabHeaders {
        this.headers.push(header);
        return this;
    }

    removeHeader(id: string): void {
        let len = this.headers.length - 1;
        for (; len >= 0; --len) {
            if (this.headers[len].targetId === id) {
                this.headers.splice(len, 1);
                break;
            }
        }
    }

    at(index: number) {
        if (this.headers.length > index)
            return this.headers[index];
        return null;
    }

    getAllHeader(): TabHeader[] {
        return this.headers;
    }
}

export class TabPage extends Control {
    _content: ComboControl;
    constructor(private _id: string, private _title: string) {
        super();
        this.className = "tab-page";
    }

    onDrag(event: DragEvent, panelId: string) {
        event.dataTransfer.setData("text/plain", `${this._id}&${panelId}`);
    }

    onDragEnd(event: DragEvent) {
        if (DockContainerComponent.hasActive && DockContainerComponent.lastEnterEle !== null) {
            DockContainerComponent.lastEnterEle.dataSource.hideNavbar();
            DockContainerComponent.lastEnterEle.dataSource.hideCover();
            DockContainerComponent.lastEnterEle.detector.detectChanges();
            DockContainerComponent.lastEnterEle.detector.reattach();

            DockContainerComponent.hasActive = false;
            DockContainerComponent.lastEnterEle = null;
        }
    }

    get id(): string {
        return this._id;
    }

    get content(): Control {
        return this._content;
    }

    get title(): string {
        return this._title;
    }

    setActive(): TabPage {
        this.className = this.className + " active";
        return this;
    }

    unActive() {
        if (this.className.indexOf("active") < 0)
            return;
        this.className = this.className.substr(0, this.className.indexOf("active") - 1);
    }

    setContent(ele: ComboControl): TabPage {
        this._content = ele;
        return this;
    }
}

export class TabHeader extends Control {
    targetId: string = "";
    tabName: string = "";
    bcloseable: boolean;
    constructor(targetId: string, tabName: string) {
        super();
        this.className = "tab";
        this.targetId = targetId;
        this.tabName = tabName;
        this.bcloseable = true;
    }

    setTargetId(value: string): void {
        this.targetId = value;
    }

    setActive(): TabHeader {
        this.className = this.className + " active";
        return this;
    }

    unActive() {
        if (this.className.indexOf("active") < 0)
            return;
        this.className = this.className.substr(0, this.className.indexOf("active") - 1);
    }

    set closeable(value: boolean) {
        this.bcloseable = value;
    }

    get closeable() {
        return this.bcloseable;
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
        this.styleObj.minWidth = null;
        this.styleObj.minHeight = null;
    }

    addChild(childControl: Control): ComboControl {
        this.children.push(childControl);
        return this;
    }

    get childrenLen() {
        return this.children.length;
    }

    set MinHeight(value: number) {
        this.styleObj.minHeight = value;
    }

    set MinWidth(value: number) {
        this.styleObj.minWidth = value;
    }

    set align(value: "left" | "right" | "center") {
        switch (value) {
            case "left":
                this.styleObj.align = "flex-start";
                break;
            case "right":
                this.styleObj.align = "flex-end";
                break;
            case "center":
                this.styleObj.align = "center";
                break;
            default:
                console.error(`unvalid align value => ${value}`);
                break;
        }
        this.styleObj.align = value;
    }

    set left(value: number) {
        this.styleObj.left = value;
    }

    set top(value: number) {
        this.styleObj.top = value;
    }
}

export class VBox extends ComboControl {
    constructor() {
        super("col");
    }
}

export class HBox extends ComboControl {
    constructor() {
        super("row");
    }

    set height(value: string | number) {
        this.styleObj.height = value;
    }
}

export class MetaControl extends Control {
    protected _dataObj: any;
    constructor(type: "button" | "textbox" | "dropdown" | "radio" | "checkbox" | "plaintext" | "range" | "date") {
        super();
        this.styleObj = {
            type: type,
            width: null,
            height: null
        };
        this.className = "default";
        this.dataSource = new Object();
        this.dataSource.click = () => { };
        this.dataSource.input = null;
        this.dataSource.change = null;
        this.styleObj.left = 2;
        this.styleObj.top = 0;
    }

    set OnClick(value: Function) {
        this.dataSource.click = value;
        // console.log(JSON.stringify(this.dataSource));
    }

    set OnInput(value: Function) {
        this.dataSource.input = value;
    }

    set onChange(value: Function) {
        this.dataSource.change = value;
    }

    set Class(value: string) {
        this.className = value;
    }

    get Class() {
        return this.className;
    }

    set Text(value: any) {
        this.dataSource.text = value;
    }

    get Text(): any {
        return this.dataSource.text;
    }

    set Title(value: string) {
        this.dataSource.title = value;
    }

    get Title() {
        return this.dataSource.title;
    }

    set Name(value: string) {
        this.dataSource.name = value;
    }

    get Name() {
        return this.dataSource.name;
    }

    set Left(value: number) {
        this.styleObj.left = value;
    }

    get Left() {
        return this.styleObj.left;
    }

    set Top(value: number) {
        this.styleObj.top = value;
    }

    get Top() {
        return this.styleObj.top;
    }

    set Width(value: number) {
        this.styleObj.width = value;
    }

    get Width() {
        return this.styleObj.width;
    }

    set ReadOnly(value: boolean) {
        this.styleObj.readonly = value;
    }

    get ReadOnly() {
        return this.styleObj.readonly;
    }

    set Disable(value: boolean) {
        this.styleObj.disable = value;
    }

    get Disable() {
        return this.styleObj.disable;
    }

    set Data(value: any) {
        this._dataObj = value;
    }

    get Data() {
        return this._dataObj;
    }
}

export class Button extends MetaControl {
    constructor() {
        super("button");
    }
}

export class TextBox extends MetaControl {
    constructor() {
        super("textbox");
    }
}

export class Label extends MetaControl {
    constructor() {
        super("plaintext");
    }
}

export class CheckBox extends MetaControl {
    constructor() {
        super("checkbox");
    }
}

export class CompleteListItem {
    constructor(private value = "", private label = "") {
    }
}

export class ComboBox extends MetaControl {
    constructor() {
        super("textbox");
        this.dataSource.completelist = null;
        this.styleObj.dropdown = false;
        this.dataSource.input = () => {
            this.styleObj.dropdown = true;
        };
    }

    set Completelist(value: CompleteListItem[]) {
        this.dataSource.completelist = value;
    }

    get Completelist() {
        return this.dataSource.completelist;
    }
}

export class DateTimeBox extends MetaControl {
    constructor() {
        super("date");
    }
}

export class URange extends MetaControl {
    constructor() {
        super("range");
        this.dataSource.min = 0;
        this.dataSource.max = 100;
    }

    get MinValue() {
        return this.dataSource.min;
    }

    set MinValue(value: number) {
        this.dataSource.min = value;
    }

    get MaxValue() {
        return this.dataSource.max;
    }

    set MaxValue(value: number) {
        this.dataSource.max = value;
    }
}

export class DropDown extends MetaControl {
    private completelistCount: number;
    private matchmethod: (inputtext: string) => DropDownItem[];
    private curidx = -1;

    constructor() {
        super("dropdown");
        this.dataSource.items = new Array<DropDownItem>();
        this.dataSource.completelist = new Array<DropDownItem>();
        this.dataSource.selectedItem = null;
        this.styleObj.dropdown = false;
        this.styleObj.acceptInput = false;
        this.completelistCount = 10;
        this.dataSource.blur = () => { };
        this.dataSource.keyup = () => { };
        this.dataSource.click = () => {
            this.styleObj.dropdown = !this.styleObj.dropdown;
        };

        this.dataSource.input = (e) => {
            if (this.styleObj.acceptInput) {
                this.dataSource.completelist = [];
                if (e.srcElement.value && e.srcElement.value.length > 0) { // have input text
                    let value = e.srcElement.value;
                    if (this.matchMethod) {
                        this.dataSource.completelist = this.matchMethod(value);
                    } else {
                        let uvalue = value.toUpperCase();
                        for (let i = 0; i < this.Items.length; ++i) {
                            if (this.Items[i].Text.startsWith(uvalue)) {
                                if (this.dataSource.completelist.push(this.Items[i]) === this.completelistCount)
                                    break;
                            }
                        }
                        uvalue = null;
                    }

                    value = null;
                    if (this.dataSource.completelist.length > 0)
                        this.showDropdown();
                    else
                        this.hideDropdown();
                } else { // no input text
                    this.hideDropdown();
                }
            }
        };

        this.dataSource.select = (item) => {
            if (this.dataSource.selectedItem !== item) {
                this.dataSource.selectedItem = item;
                if (this.dataSource.selectchange) {
                    this.dataSource.selectchange(item);
                }
            }
            this.dataSource.text = item.Text;
            this.hideDropdown();
        };

        this.dataSource.mouseleave = () => {
            this.dataSource.blur = () => {
                this.hideDropdown();
            };
        };

        this.dataSource.mouseover = () => {
            this.dataSource.blur = () => { };
        };
    }

    /**
     * a user interface to match with custom rule.
     * @param value a function to do matching with input text.
     */
    set matchMethod(value: (inputtext: string) => DropDownItem[]) {
        this.matchmethod = value;
    }

    get matchMethod() {
        return this.matchmethod;
    }

    showDropdown() {
        this.curidx = 0;
        this.dataSource.keyup = (event: KeyboardEvent) => {
            if (event.code !== "ArrowDown" && event.code !== "ArrowUp" && event.code !== "Enter")
                return;

            if (event.code === "ArrowDown") {
                this.curidx = this.curidx < 0 ? 0 : (this.curidx + 1 + this.dataSource.completelist.length) % this.dataSource.completelist.length;
            } else if (event.code === "ArrowUp") { // ArrowUp
                this.curidx = this.curidx < 0 ? (this.dataSource.completelist.length - 1)
                    : ((this.curidx - 1 + this.dataSource.completelist.length) % this.dataSource.completelist.length);
            } else { // Enter
                this.dataSource.select(this.dataSource.completelist[this.curidx < 0 ? 0 : this.curidx]);
            }
        };
        this.styleObj.dropdown = true;
    }

    hideDropdown() {
        this.dataSource.keyup = () => { };
        this.styleObj.dropdown = false;
        this.curidx = -1;
    }

    addItem(item: DropDownItem) {
        this.dataSource.items.push(item);
        this.dataSource.selectedItem = this.dataSource.items[0];
    }

    resetItems(items: DropDownItem[]) {
        this.dataSource.items = null;
        this.dataSource.items = items;
        this.dataSource.selectedItem = this.dataSource.items[0];
    }

    set SelectedItem(value: DropDownItem) {
        this.dataSource.selectedItem = value;
    }

    get SelectedItem(): DropDownItem {
        return this.dataSource.selectedItem;
    }

    get Items(): DropDownItem[] {
        return this.dataSource.items;
    }

    set SelectChange(value: Function) {
        this.dataSource.selectchange = value;
    }

    set AcceptInput(value: boolean) {
        this.styleObj.acceptInput = value;
    }
}

export interface DropDownItem {
    Text: string;
    Value: any;
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

    init(): void {
        if (this.dataSource.init)
            this.dataSource.init();
        else
            console.error("echart::init failed.");
    }
    /**
     * @param option refer to http://echarts.baidu.com/option.html
     */
    setOption(option: Object): void {
        this.dataSource.option = option;
    }

    resetOption(option: Object, notMerge: boolean = false): void {
        if (this.dataSource.setOption) {
            this.dataSource.setOption(option, notMerge);
        }
    }

    setClassName(className: string): void {
        this.className = className;
    }

    onClick(cb: Function) {
        this.dataSource.events["click"] = cb;
    }
}


export interface SpreadViewerConfig {
    symbolCode1: string;
    innerCode1: number;
    coeff1: number;
    symbolCode2: string;
    innerCode2: number;
    coeff2: number;
    durations: Array<{ start: DatePoint, end: DatePoint }>;
    marketdataType1?: string;
    marketdataType2?: string;
    xInterval?: number;
    multiplier?: number;
}

interface DatePoint {
    hour: number;
    minute: number;
}

/**
 * note: first=>setConfig(), second=>init(), third=>start()
 *
 */
export class SpreadViewer {
    static readonly EPS: number = 1.0e-5;
    static readonly YUAN_PER_UNIT = 10000;
    static readonly xInternal = 1000; // ms
    private _msgs: Object;
    private _lastIdx: Object;
    private _firstIdx: number;
    private _curIdx: number;
    private _xInterval: number = 1000;
    private _durations: Array<{ start: DatePoint, end: DatePoint }>;
    private _names: string[];
    private _timePoints: string[];
    private _values: Array<any>[];
    private _timeoutHandler: any;
    private _multiplier: number = 1;

    private _symbolCode1: string;
    private _innerCode1: number;
    private _coeff1: number;
    private _symbolCode2: string;
    private _innerCode2: number;
    private _coeff2: number;
    private _marketdataType1: string = "MARKETDATA";
    private _marketdataType2: string = "MARKETDATA";

    private _echart: EChart;
    private _bReset: boolean;
    private _state = 0;

    constructor() {
        this._echart = new EChart();
        this.hidden();
    }

    init(): void {
        this._echart.init();
        this._state = 2;
    }

    hidden(): void {
        this._state = 0;
        this._echart.setClassName("hidden");
    }

    show(): void {
        this._state = 1;
        this._echart.setClassName("none");
    }

    get state() {
        return this._state;
    }

    start(): void {

        this._timeoutHandler = setInterval(() => {
            if (this._lastIdx[this._innerCode1] === -1 || this._lastIdx[this._innerCode2] === -1) // both have one at least
                return;

            if (!this._msgs[this._innerCode1][this._curIdx] || !this._msgs[this._innerCode2][this._curIdx]) {
                console.warn(`curIdx: ${this._curIdx} don't have data of both.`);
                // if (!this._msgs[this._innerCode1][this._curIdx]) {
                //     this._msgs[this._innerCode1][this._curIdx] = this._msgs[this._innerCode1][this._lastIdx[this._innerCode1]];
                // }

                // if (!this._msgs[this._innerCode2][this._curIdx]) {
                //     this._msgs[this._innerCode2][this._curIdx] = this._msgs[this._innerCode2][this._lastIdx[this._innerCode2]];
                // }
                return;
            }

            // console.info(this._curIdx);
            this.values[0][this._curIdx] = this.getSpreadValue1(this._curIdx);
            this.values[1][this._curIdx] = this.getSpreadValue2(this._curIdx);
            let newOption: any = {
                series: [{
                    name: this.names[0],
                    data: this.values[0]
                }, {
                    name: this.names[1],
                    data: this.values[1]
                }]
            };
            // console.info(newOption);
            this.setEChartOption(newOption);
            ++this._curIdx;
        }, SpreadViewer.xInternal);
    }

    get ControlRef() {
        return this._echart;
    }
    // only can change the names
    setConfig(config: SpreadViewerConfig, bReset: boolean = false): void {
        this._bReset = bReset;
        this._symbolCode1 = config.symbolCode1;
        this._innerCode1 = config.innerCode1;
        this._coeff1 = config.coeff1;
        this._symbolCode2 = config.symbolCode2;
        this._innerCode2 = config.innerCode2;
        this._coeff2 = config.coeff2;
        this._durations = config.durations;
        if (config.marketdataType1) this._marketdataType1 = config.marketdataType1;
        if (config.marketdataType2) this._marketdataType2 = config.marketdataType2;
        if (config.xInterval) this._xInterval = config.xInterval;
        if (config.multiplier) this._multiplier = config.multiplier;

        this._msgs = {};
        this._lastIdx = {};
        this._lastIdx[this._innerCode1] = -1;
        this._lastIdx[this._innerCode2] = -1;
        this._curIdx = -1;
        this._firstIdx = -1;
        this._timePoints = null;
        this._names = null;
        this._values = null;
        if (this._timeoutHandler) {
            clearInterval(this._timeoutHandler);
            this._timeoutHandler = null;
        }

        let echartOption = {
            title: {
                bottom: 10,
                text: "SpreadViewer"
            },
            tooltip: {
                trigger: "axis",
                backgroundColor: "rgba(245, 245, 245, 0.8)",
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 10,
                textStyle: {
                    color: "#000"
                }
            },
            legend: {
                bottom: 10,
                data: this.names,
                textStyle: {
                    color: "#fff"
                }
            },
            grid: {
                left: 100,
                right: 80,
                bottom: 100,
                containLabel: false
            },
            xAxis: {
                scale: true,
                type: "category",
                axisLabel: {
                    textStyle: {
                        color: "#fff"
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: "#fff"
                    }
                },
                boundaryGap: false,
                data: this.timePoints
            },
            yAxis: {
                scale: true,
                boundaryGap: [0.2, 0.2],
                axisLabel: {
                    textStyle: {
                        color: "#fff"
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: "#fff"
                    }
                }
            },
            dataZoom: [
                {
                    type: "inside",
                    xAxisIndex: 0
                },
            ],
            series: [
                {
                    name: this.names[0],
                    type: "line",
                    connectNulls: true,
                    data: this.values[0],
                    lineStyle: {
                        normal: {
                            color: "#0f0",
                            width: 1
                        }
                    }
                },
                {
                    name: this.names[1],
                    type: "line",
                    connectNulls: true,
                    data: this.values[1],
                    lineStyle: {
                        normal: {
                            color: "#f00",
                            width: 1
                        }
                    }
                }
            ]
        };

        if (!bReset)
            this._echart.setOption(echartOption);
        else
            this._echart.resetOption(echartOption, bReset);
        echartOption = null;
    }

    setEChartOption(option: any): void {
        this._echart.resetOption(option, false);
    }

    get names() {
        if (!this._names || this._bReset) {
            this._names = [this.getSpreadTraceName1(), this.getSpreadTraceName2()];
        }
        return this._names;
    }

    get timePoints() {
        if (!this._timePoints || this._bReset) {
            this._timePoints = [];
            let today = new Date(), min_date: Date;
            this._durations.forEach(duration => {
                let seconds = (duration.end.hour - duration.start.hour) * 3600 + (duration.end.minute - duration.start.minute) * 60;
                let originLen = this._timePoints.length;
                this._timePoints.length += seconds;
                min_date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), duration.start.hour, duration.start.minute);
                for (let sec = 0; sec < seconds; ++sec) {
                    this._timePoints[originLen + sec] = min_date.toLocaleTimeString([], { hour12: false });
                    min_date.setSeconds(min_date.getSeconds() + 1);
                }
            });

            min_date = null;
            today = null;
        }
        return this._timePoints;
    }

    get values() {
        if (!this._values || this._bReset) {
            this._values = new Array(this.names.length);
            this.names.forEach((name, index) => {
                this._values[index] = new Array<number>(this.timePoints.length).fill(null);
            });
        }
        return this._values;
    }

    getSpreadTraceName1(): string {
        let namePrimary: string = this._symbolCode1 + ".askPrice1";
        let nameSecondary: string = this._symbolCode2 + ".bidPrice1";
        return namePrimary + "-" + (Math.abs(this._coeff1 - 1) < SpreadViewer.EPS ? "" : this._coeff1.toFixed(2) + " * ") + nameSecondary;
    }

    getSpreadTraceName2(): string {
        let namePrimary: string = this._symbolCode1 + ".bidPrice1";
        let nameSecondary: string = this._symbolCode2 + ".askPrice1";
        return namePrimary + "-" + (Math.abs(this._coeff2 - 1) < SpreadViewer.EPS ? "" : this._coeff2.toFixed(2) + "*") + nameSecondary;
    }

    getSpreadValue1(idx: number): number {
        // console.info(idx, this._msgs[this._innerCode1], this._msgs[this._innerCode2]);
        return Math.round((this._msgs[this._innerCode1][idx].askPrice1 - this._coeff1 * this._msgs[this._innerCode2][idx].bidPrice1) * this._multiplier * 100) / 100;
    }

    getSpreadValue2(idx: number): number {
        return Math.round((this._msgs[this._innerCode1][idx].bidPrice1 - this._coeff2 * this._msgs[this._innerCode2][idx].askPrice1) * this._multiplier * 100) / 100;
    }

    private index(seconds: number): number {
        // let itime = Math.floor(timestamp / 1000);
        let ihour = Math.floor(seconds / 10000);
        let iminute = Math.floor(seconds % 10000 / 100);
        let num = ihour * 60 + iminute;

        if (num < this._durations[0].end.hour * 60 + this._durations[0].end.minute) {
            return (num - this._durations[0].start.hour * 60 - this._durations[0].start.minute) * 60 +
                + seconds % 10000 % 100;
        } else if (this._durations.length >= 2) {
            if (num < this._durations[1].start.hour * 60 + this._durations[1].start.minute)
                return -1;

            if (num >= this._durations[1].start.hour * 60 + this._durations[1].start.minute
                && num < this._durations[1].end.hour * 60 + this._durations[1].end.minute) {
                return (num - this._durations[1].start.hour * 60 - this._durations[1].start.minute) * 60 +
                    + seconds % 10000 % 100 + (this._durations[0].end.hour - this._durations[0].start.hour) * 60 * 60
                    + (this._durations[0].end.minute - this._durations[0].start.minute) * 60;
            } else if (this._durations.length === 3) {
                if (num < this._durations[2].start.hour * 60 + this._durations[2].start.minute)
                    return -1;

                if (num >= this._durations[2].start.hour * 60 + this._durations[2].start.minute
                    && num < this._durations[2].end.hour * 60 + this._durations[2].end.minute) {
                    return (num - this._durations[2].start.hour * 60 - this._durations[2].start.minute) * 60 +
                        + seconds % 10000 % 100
                        + (this._durations[1].end.hour - this._durations[1].start.hour) * 60 * 60
                        + (this._durations[1].end.minute - this._durations[1].start.minute) * 60
                        + (this._durations[0].end.hour - this._durations[0].start.hour) * 60 * 60
                        + (this._durations[0].end.minute - this._durations[0].start.minute) * 60;
                }
            } else {
                return -1;
            }
        }

        return -1;
    }

    setMarketData(msg: any): void {
        // console.log(msg.Time, msg.UKey);

        let idx = this.index(msg.Time);
        if (idx > this.timePoints.length || idx < 0) {
            console.error(`msg time: ${msg.Time} is not valid. idx=${idx}; maxlength=${this.timePoints.length}`);
            return;
        }

        if (!this._msgs[msg.UKey])
            this._msgs[msg.UKey] = {};

        if (!this._msgs[msg.UKey][idx])
            this._msgs[msg.UKey][idx] = {};

        this._msgs[msg.UKey][idx].askPrice1 = msg.AskPrice / SpreadViewer.YUAN_PER_UNIT;
        this._msgs[msg.UKey][idx].bidPrice1 = msg.BidPrice / SpreadViewer.YUAN_PER_UNIT;
        console.info(msg.UKey, this._lastIdx, idx, this._msgs);
        if (this._lastIdx[this._innerCode1] !== -1 && this._lastIdx[this._innerCode2] !== -1) {
            for (let i = this._lastIdx[this._innerCode1] + 1; i < idx; ++i) {
                if (!this._msgs[this._innerCode1].hasOwnProperty(i))
                    this._msgs[this._innerCode1][i] = {};
                this._msgs[this._innerCode1][i].askPrice1 = this._msgs[this._innerCode1][i - 1].askPrice1;
                this._msgs[this._innerCode1][i].bidPrice1 = this._msgs[this._innerCode1][i - 1].bidPrice1;
            }
            for (let i = this._lastIdx[this._innerCode2] + 1; i < idx; ++i) {
                if (!this._msgs[this._innerCode2].hasOwnProperty(i))
                    this._msgs[this._innerCode2][i] = {};
                this._msgs[this._innerCode2][i].askPrice1 = this._msgs[this._innerCode2][i - 1].askPrice1;
                this._msgs[this._innerCode2][i].bidPrice1 = this._msgs[this._innerCode2][i - 1].bidPrice1;
            }

            if (msg.UKey === this._innerCode1 && idx > this._lastIdx[this._innerCode2]) {
                if (!this._msgs[this._innerCode2].hasOwnProperty(idx))
                    this._msgs[this._innerCode2][idx] = {};
                this._msgs[this._innerCode2][idx].askPrice1 = this._msgs[this._innerCode2][idx - 1].askPrice1;
                this._msgs[this._innerCode2][idx].bidPrice1 = this._msgs[this._innerCode2][idx - 1].bidPrice1;
            }

            if (msg.UKey === this._innerCode2 && idx > this._lastIdx[this._innerCode1]) {
                if (!this._msgs[this._innerCode1][idx])
                    this._msgs[this._innerCode1][idx] = {};
                this._msgs[this._innerCode1][idx].askPrice1 = this._msgs[this._innerCode1][idx - 1].askPrice1;
                this._msgs[this._innerCode1][idx].bidPrice1 = this._msgs[this._innerCode1][idx - 1].bidPrice1;
            }

            this._curIdx = idx;
        } else if (this._lastIdx[this._innerCode1] === -1 && this._lastIdx[this._innerCode2] === -1) { // first quote data
            this._firstIdx = idx;
        } else { // only one is -1
            if (this._lastIdx[msg.UKey] === -1) {
                if (msg.UKey === this._innerCode1) {
                    if (!this._msgs[this._innerCode2].hasOwnProperty(idx))
                        this._msgs[this._innerCode2][idx] = {};

                    this._msgs[this._innerCode2][idx].askPrice1 = this._msgs[this._innerCode2][this._lastIdx[this._innerCode2]].askPrice1;
                    this._msgs[this._innerCode2][idx].bidPrice1 = this._msgs[this._innerCode2][this._lastIdx[this._innerCode2]].bidPrice1;
                    this._curIdx = Math.max(this._lastIdx[this._innerCode2], idx);
                }

                if (msg.UKey === this._innerCode2) {
                    if (!this._msgs[this._innerCode1].hasOwnProperty(idx))
                        this._msgs[this._innerCode1][idx] = {};

                    this._msgs[this._innerCode1][idx].askPrice1 = this._msgs[this._innerCode1][this._lastIdx[this._innerCode1]].askPrice1;
                    this._msgs[this._innerCode1][idx].bidPrice1 = this._msgs[this._innerCode1][this._lastIdx[this._innerCode1]].bidPrice1;
                    this._curIdx = Math.max(this._lastIdx[this._innerCode1], idx);
                }
            }
        }
        this._lastIdx[msg.UKey] = idx;
    }

    hasInstrumentID(ukey: number): boolean {
        return this._innerCode1 === ukey || this._innerCode2 === ukey;
    }

    dispose(): void {
        this._msgs = null;
        this._lastIdx = null;
        this._curIdx = null;
        this._firstIdx = null;
        this._timePoints = null;
        this._durations = null;
        this._names = null;
        this._values = null;
        if (this._timeoutHandler) {
            clearInterval(this._timeoutHandler);
        }
    }
}

export class ChartViewer {
    private _chart: EChart;

    constructor() {
        this._chart = new EChart();
    }

    setOption(option) {
        this._chart.setOption(option);
    }

    changeOption(option) {
        this._chart.resetOption(option);
    }

    init() {
        this._chart.init();
    }

    get containerRef() {
        return this._chart;
    }
}

export class DataTable extends Control {
    public columns: DataTableColumn[] = [];
    public rows: DataTableRow[] = [];
    private _cellclick: Function;
    private _cellDBClick: Function;
    private _rowclick: Function;
    private _rowDBClick: Function;
    private _menu: Menu = new Menu();

    constructor(type: "table" | "table2" = "table") {
        super();
        this.className = "table";
        this.dataSource = {
            columns: null,
            rows: null,
            detectChanges: null,
            tableHeaderClick: () => { },
            sortKey: null,
            bAsc: true,
        };

        this.styleObj = {
            type: type,
            width: null,
            height: null,
            cellpadding: null,
            bRowIndex: true
        };

        this.dataSource.sort = (col: DataTableColumn, idx: number) => {
            if (!col.sortable || !col.onCompare)
                return;

            if (col.Name !== this.dataSource.sortKey || !this.dataSource.bAsc) {
                this.dataSource.sortKey = col.Name;
                this.dataSource.bAsc = true;
                this.dataSource.rows = this.rows = this.rows.sort((a, b) => {
                    return col.onCompare(a.cells[idx].Text, b.cells[idx].Text);
                });
            } else {
                this.dataSource.bAsc = !this.dataSource.bAsc;
                this.dataSource.rows = this.rows = this.rows.sort((a, b) => {
                    return col.onCompare(b.cells[idx].Text, a.cells[idx].Text);
                });
            }
        };
    }

    newRow(bInsertFirst: boolean = false): DataTableRow {
        let row = new DataTableRow(this.columns.length);
        row.onCellClick = this._cellclick;
        row.onRowClick = this._rowclick;
        row.onCellDBClick = this._cellDBClick;
        row.onRowDBClick = this._rowDBClick;
        bInsertFirst ? this.rows.unshift(row) : this.rows.push(row);
        this.dataSource.rows = this.rows;
        return row;
    }

    set RowIndex(value: boolean) {
        this.styleObj.bRowIndex = value;
    }

    addColumn(...columns: string[]): DataTable {
        columns.forEach(item => {
            let col = new DataTableColumn(item);
            this.columns.push(col);
            this._menu.addItem(MenuItem.create(col.Name, (self) => {
                if (col.Name === self.label) {
                    col.hidden = !self.checked;
                    // this.detectChanges();
                }
            }, "checkbox", { visible: !col.hidden, checked: true }), null);
            this.rows.forEach(item => item.insertCell(new DataTableRowCell(), this.columns.length));
        });

        this.dataSource.columns = this.columns;

        return this;
    }

    addColumn2(column: DataTableColumn): DataTable {
        this.columns.push(column);

        this._menu.addItem(MenuItem.create(column.Name, (self) => {
            if (column.Name === self.label) {
                column.hidden = !self.checked;
                // this.detectChanges();
            }
        }, "checkbox", { visible: !column.hidden, checked: true }), null);

        this.rows.forEach(item => item.insertCell(new DataTableRowCell(), this.columns.length));
        this.dataSource.columns = this.columns;

        return this;
    }

    /**
     * insert a column to specified index.
     * @param column columnHeader string
     * @param index  insert before index (note: zero-based location)
     */
    insertColumn(column: string, index: number): DataTable {
        this.columns.splice(index, 0, new DataTableColumn(column));
        this.rows.forEach(item => item.insertCell(new DataTableRowCell(), index));
        return this;
    }

    set onCellClick(value: Function) {
        this._cellclick = value;
        this.rows.forEach(item => {
            item.onCellClick = value;
        });
    }

    set onCellDBClick(value: Function) {
        this._cellDBClick = value;
        this.rows.forEach(item => {
            item.onCellDBClick = value;
        });
    }

    set onRowClick(value: Function) {
        this._rowclick = value;
        this.rows.forEach(item => {
            item.onRowClick = value;
        });
    }

    set onRowDBClick(value: Function) {
        this._rowDBClick = value;
        this.rows.forEach(item => {
            item.onRowDBClick = value;
        });
    }

    set cellPadding(value: number) {
        this.styleObj.cellpadding = value;
    }

    set columnConfigurable(value: boolean) {
        if (value) {
            this.dataSource.tableHeaderClick = (e: MouseEvent) => {
                e.preventDefault();

                if (e.button === 2) { // right click
                    this._menu.popup();
                }
            };
        } else {
            this.dataSource.tableHeaderClick = () => { };
        }
    }

    set width(value: number) {
        this.styleObj.width = value;
    }

    set height(value: number) {
        this.styleObj.height = value;
    }

    set align(value: string) {
        this.styleObj.alignment = value;
    }

    set backgroundColor(value: string) {
        this.styleObj.bgColor = value;
    }

    detectChanges(): void {
        this.dataSource.detectChanges();
    }

    set pageSize(value: number) {
        this.styleObj.pageSize = value;
    }

    get pageCount() {
        return this.styleObj.pageCount = Math.floor(this.dataSource.rows.length / this.styleObj.pageSize)
            + (this.dataSource.rows.length % this.styleObj.pageSize === 0 ? 0 : 1);
    }

    set curPage(value: number) {
        this.styleObj.curPage = value > this.pageCount
            ? this.pageCount
            : this.pageCount < 1 ? 1 : value;
    }
}

export class DataTableRow extends Control {
    cells: DataTableRowCell[] = [];
    private parent: DataTable;
    private bHidden: boolean;
    private bgcolor: string;
    private static _timeout: any;
    constructor(private columns: number) {
        super();
        this.bHidden = false;
        this.dataSource = {
            cellclick: () => { },
            rowclick: () => { }
        };

        for (let i = 0; i < columns; ++i) {
            this.cells.push(new DataTableRowCell());
            this.cells[i].OnClick = (cellIndex, rowIndex) => {
                if (DataTableRow._timeout) {
                    clearTimeout(DataTableRow._timeout);
                    DataTableRow._timeout = null;

                    if (this.dataSource.cellDBClick) {
                        this.dataSource.cellDBClick(this.cells[cellIndex], cellIndex, rowIndex);
                    }

                    if (this.dataSource.rowDBClick) {
                        this.dataSource.rowDBClick(this, rowIndex);
                    }
                    return;
                }

                DataTableRow._timeout = setTimeout(() => {
                    DataTableRow._timeout = null;

                    if (this.dataSource.cellclick) {
                        this.dataSource.cellclick(this.cells[cellIndex], cellIndex, rowIndex);
                    }

                    if (this.dataSource.rowclick) {
                        this.dataSource.rowclick(this, rowIndex);
                    }
                }, 300); // hack for double click duration;
            };
        }
    }

    insertCell(cell: DataTableRowCell, index: number): void {
        this.cells.splice(index, 0, new DataTableRowCell());
        this.cells[index].OnClick = (cellIndex, rowIndex) => {
            if (DataTableRow._timeout) {
                clearTimeout(DataTableRow._timeout);
                DataTableRow._timeout = null;

                if (this.dataSource.cellDBClick) {
                    this.dataSource.cellDBClick(this.cells[cellIndex], cellIndex, rowIndex);
                }

                if (this.dataSource.rowDBClick) {
                    this.dataSource.rowDBClick(this, rowIndex);
                }
                return;
            }

            DataTableRow._timeout = setTimeout(() => {
                DataTableRow._timeout = null;

                if (this.dataSource.cellclick) {
                    this.dataSource.cellclick(this.cells[cellIndex], cellIndex, rowIndex);
                }

                if (this.dataSource.rowclick) {
                    this.dataSource.rowclick(this, rowIndex);
                }
            }, 300); // hack for double click duration;
        };
    }

    set onCellClick(value: Function) {
        this.dataSource.cellclick = value;
    }

    set onCellDBClick(value: Function) {
        this.dataSource.cellDBClick = value;
    }

    set onRowClick(value: Function) {
        this.dataSource.rowclick = value;
    }

    set onRowDBClick(value: Function) {
        this.dataSource.rowDBClick = value;
    }

    set hidden(value: boolean) {
        this.bHidden = value;
    }

    set backgroundColor(value: string) {
        this.bgcolor = value;
    }
}

export class DataTableRowCell extends MetaControl {
    private color: string;
    private bgcolor: string;

    constructor(type: "textbox" | "button" | "plaintext" | "checkbox" = "plaintext") {
        super(type);
    }

    set Type(value: string) {
        this.styleObj.type = value;
    }

    get Type() {
        return this.styleObj.type;
    }

    set Color(value: string) {
        this.color = value;
    }

    get Color() {
        return this.color;
    }

    set bgColor(value: string) {
        this.bgcolor = value;
    }

    get bgColor() {
        return this.bgcolor;
    }
}

export class DataTableColumn {
    private compare: (prev, next) => number;
    private limitWidth: number;
    constructor(private columnHeader: string,
        private bHidden: boolean = false,
        private bSortable: boolean = false) {
        this.compare = (prev: string, next: string) => {
            return (prev < next) ? -1 : (prev === next ? 0 : 1);
        };
    }

    set hidden(value: boolean) {
        this.bHidden = value;
    }

    get hidden() {
        return this.bHidden;
    }

    get Name() {
        return this.columnHeader;
    }

    set sortable(value: boolean) {
        this.bSortable = value;
    }

    get sortable() {
        return this.bSortable;
    }

    set onCompare(value: (prev, next) => number) {
        this.compare = value;
    }

    get onCompare() {
        return this.compare;
    }

    set maxWidth(value: number) {
        this.limitWidth = value;
    }

    get maxWidth() {
        return this.limitWidth;
    }
}

export class Dialog {
    public content: ComboControl;
    private bshow: boolean;
    title: string;
    private static _instance: Dialog;
    width: number = 300;
    height: number = 300;

    private constructor() {
        this.bshow = false;
    }

    private static get instance() {
        return Dialog._instance || (Dialog._instance = new Dialog());
    }

    show(): void {
        this.bshow = true;
    }

    hide(): void {
        this.bshow = false;
    }

    static popup(owner: any, content: ComboControl, option: DialogOption): void {
        Dialog.instance.content = content;
        Dialog.instance.title = option.title;
        option.width ? Dialog.instance.width = option.width : null;
        option.height ? Dialog.instance.height = option.height : null;
        owner.dialog = Dialog.instance;
        Dialog.instance.show();
    }

    static close(): void {
        Dialog.instance.hide();
    }
}

export interface DialogOption {
    title: string;
    width?: number;
    height?: number;
}

export class StatusBar {
    items: StatusBarItem[];
    backgroundColor: string;
    constructor() {
        this.items = [];
    }
}

export class StatusBarItem {
    text: string = "";
    section: "left" | "right" = "right";
    click: Function = () => { };
    color: string;
    data: any;
    width: number;

    constructor(text: string) {
        this.text = text;
    }
}

export class ActionBar extends Control {
    private _activeItem: ActionItem = null;
    private _onClick: Function = null;

    constructor() {
        super();
        this.styleObj = {
            type: "actionbar",
            showDetailView: false
        };

        let self = this;
        this.dataSource = {
            features: [],
            settings: [],
            menuClick() {
                self.styleObj.showDetailView = !self.styleObj.showDetailView;
                self.width = self.styleObj.showDetailView ? 200 : 50;
            },
            onClick(item: ActionItem) {
                if (self._onClick)
                    self._onClick(item);
            }
        };
    }

    addFeature(item: ActionItem): void {
        if (item.active) {
            this.activeItem = item;
        }
        this.dataSource.features.push(item);
    }

    addSettings(item: ActionItem) {
        if (item.active) {
            this.activeItem = item;
        }
        this.dataSource.settings.push(item);
    }

    set backgroundColor(value: string) {
        this.styleObj.backgroundColor = value;
    }

    set onClick(value: Function) {
        this._onClick = value;
    }

    set activeItem(item: ActionItem) {
        if (this._activeItem !== null)
            this._activeItem.active = false;

        item.active = true;
        this._activeItem = item;
    }

    get activeItem() {
        return this._activeItem;
    }

    getItem(title: string) {
        let ret;
        ret = this.dataSource.features.find(item => { return item.title === title; });

        if (ret === undefined) {
            ret = this.dataSource.settings.find(item => { return item.title === title; });
        }

        return ret;
    }

    click(item) {
        if (this._onClick)
            this._onClick(item);
    }

    set left(value: number) {
        this.styleObj.left = value;
    }

    get left() {
        return this.styleObj.left;
    }

    set width(value: number) {
        this.styleObj.width = value;
    }

    get width() {
        return this.styleObj.width;
    }
}

interface ActionItem {
    iconName: string;
    tooltip: string;
    title: string;
    active?: boolean;
}

export class TileArea extends Control {
    creater: Tile;

    constructor() {
        super();
        this.styleObj = {
            type: "tilearea",
        };

        this.dataSource = {
            title: "",
            items: [],
            click: () => { }
        };

        this.creater = new Tile();
    }

    set title(value: string) {
        this.dataSource.title = value;
    }

    get title() {
        return this.dataSource.title;
    }

    addTile(tile: Tile) {
        this.dataSource.items.push(tile);
    }

    removeTile(title: string) {
        let tileCount = this.dataSource.items.length;

        for (let i = 0; i < tileCount; ++i) {
            if (this.dataSource.items[i].title === title) {
                this.dataSource.items.splice(i, 1);
                break;
            }
        }

        tileCount = null;
    }

    getTileAt(idx: number): Tile {
        return this.dataSource.items[idx];
    }

    getTile(name: string): Tile {
        let tileCount = this.dataSource.items.length;

        for (let i = 0; i < tileCount; ++i) {
            if (this.dataSource.items[i].title === name) {
                return this.dataSource.items[i];
            }
        }

        return null;
    }

    set onClick(value: Function) {
        this.dataSource.click = value;
    }

    set onCreate(value: Function) {
        this.dataSource.create = value;
    }

    set onSettingClick(value: Function) {
        this.dataSource.setting = value;
    }
}

export class Tile {
    color: string;
    backgroundColor: string;
    title: string;
    iconName: string;
    data: any;
}

class Slider {
    private pictures: string[];
    private curIdx: number;

    constructor() {
        this.pictures = [];
        this.curIdx = 0;
    }

    set present(value: number) {
        this.curIdx = (value - 1) % this.length;
    }

    get present() {
        return (this.curIdx + 1) % this.length;
    }

    addPicture(uri: string) {
        this.pictures.push(uri);
    }

    removePictureAt(idx: number) {
        this.pictures.splice(idx - 1, 1);
    }

    get length() {
        return this.pictures.length;
    }
}

export class Section {
    title: string;
    content: string | DataTable | ListItem[] | any;
}

export class ListItem {
    name: string;
    value: string;
}