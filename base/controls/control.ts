/**
 * created by chenlei
 */
import { Component, Input } from "@angular/core"

@Component({
  moduleId: module.id,
  selector: 'dock-control',
  templateUrl: 'controlTree.html',
  inputs: ['className', 'children']
})
export class DockContainerComponent {
  className: string;
  children: Control[];
}


export class Control {
  protected className: string;
  protected children: any[];
}

export class DockContainer extends Control {
  constructor(type) {
    super();
    if (type === "v") {
      this.className = "dock-container vertical";
    } else {
      this.className = "dock-container horizental";
    }
    this.children = [];
  }

  addChild(containerRef: Control): DockContainer {
    this.children.push(containerRef);
    return this;
  }
}

export class Splitter extends Control {
  constructor(type) {
    super();
    this.className = type == "v" ? "splitter-bar vertical" : "splitter-bar horizental";
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

  addTab(pageId, pageTitle): TabPanel {
    this.headers.addHeader(new TabHeader(pageId))
    this.pages.addPage(new TabPage(pageId, pageTitle));
    return this;
  }

  addTab2(page: TabPage): TabPanel {
    this.headers.addHeader(new TabHeader(page.id));
    this.pages.addPage(page);
    return this;
  }

  setActive(pageId: string): TabPanel{
    this.pages.getAllPage().forEach(page=>{
      if(page.id == pageId)
        page.setActive();
    });

    this.headers.getAllHeader().forEach(header=>{
      if(header.targetId == pageId)
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
  constructor(private id_: string, private title_: string) {
    super();
    this.className = "tab-page";
  }

  get id(): string {
    return this.id_;
  }

  get title(): string {
    return this.title_;
  }

  setActive(): TabPage{
    this.className = this.className + " active";
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

  setActive(): TabHeader{
    this.className = this.className + " active";
    return this;
  }
}