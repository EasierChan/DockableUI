/**
 * created by chenlei
 */
import { Component, Input } from "@angular/core";
import { ComboControl } from "./user.component";

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


export interface CssStyle {
  type: string;
  width: number;
  height: number;
}

export class Control {
  protected className: string;
  protected children: any[];
  protected dataSource: any;
  protected styleObj: CssStyle;
  protected listeners: any;
}

export class DockContainer extends Control {

  constructor(type: string, width?: number, height?: number) {
    super();
    if (type === "v") {
      this.className = "dock-container vertical";
      this.styleObj = {
        type: "",
        width: width === undefined ? 300 : width,
        height: null
      };
    } else {
      this.className = "dock-container horizental";
      this.styleObj = {
        type: "",
        width: null,
        height: height === undefined ? 200 : height
      };
    }
    this.children = [];
  }

  addChild(containerRef: any): DockContainer {
    this.children.push(containerRef);
    return this;
  }

}

export class Splitter extends Control {
  constructor(type) {
    super();
    this.className = type === "v" ? "splitter-bar vertical" : "splitter-bar horizental";
  }
}

export class TabPanel extends Control {
  protected pages: TabPages;
  protected headers: TabHeaders;
  constructor() {
    super();
    this.pages = new TabPages();
    this.headers = new TabHeaders();
    this.className = "tab-panel";
    this.children = [];
    this.children.push(this.pages);
    this.children.push(this.headers);
  }
  /**
   * @param pageId connection between header and title
   * @param pageTitle show the tab desc
   */
  addTab(pageId, pageTitle): TabPanel {
    this.headers.addHeader(new TabHeader(pageId));
    this.pages.addPage(new TabPage(pageId, pageTitle));
    return this;
  }

  addTab2(page: TabPage): TabPanel {
    this.headers.addHeader(new TabHeader(page.id));
    this.pages.addPage(page);
    return this;
  }

  setActive(pageId: string): TabPanel {
    this.pages.getAllPage().forEach(page => {
      if (page.id === pageId)
        page.setActive();
    });

    this.headers.getAllHeader().forEach(header => {
      if (header.targetId === pageId)
        header.setActive();
    });
    return this;
  }
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

  setContent(ele: ComboControl): TabPage {
    this._content = ele;
    return this;
  }
}

export class TabHeader extends Control {
  targetId: string = "";
  constructor(targetId?: string) {
    super();
    this.className = "tab";
    this.targetId = targetId;
  }

  setTargetId(value: string): void {
    this.targetId = value;
  }

  setActive(): TabHeader {
    this.className = this.className + " active";
    return this;
  }
}
