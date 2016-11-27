import { Component, OnInit } from '@angular/core';
import { Control, DockContainer, Splitter, TabPanel } from 'controls/control';
 
@Component({
  selector: 'body',
  template: `
    <div id="root" class="{{className}}">
        <dock-control *ngFor="let child of children" [className]="child.className" [children]="child.children">
        </dock-control>
    </div>
    <div class="dock-sn">
      <div class="dock-north">
        <div class="bar-block"></div>
        <div class="bar-arrow"></div>
      </div>
      <div class="dock-south">
        <div class="bar-block"></div>
        <div class="bar-arrow"></div>
      </div>
    </div>
    <div class="dock-ew">
      <div class="dock-west">
        <div class="bar-block"></div>
        <div class="bar-arrow"></div>
      </div>
      <div class="dock-center"></div>
      <div class="dock-east">
        <div class="bar-block"></div>
        <div class="bar-arrow"></div>
      </div>
    </div>
    <div class="dock-cover"></div>
    `
})
export class AppComponent implements OnInit {
  className: string;
  children: Control[] = [];
  ngOnInit(): void {
    this.className = "dock-container vertical";
    let horizentalContainer: DockContainer = new DockContainer("h");
    let leftPanel: TabPanel = new TabPanel();
    leftPanel.addTab("Toolbox", "Toolbox");
    leftPanel.addTab("Server", "Server");
    leftPanel.setActive("Toolbox");

    let child = new DockContainer("v").addChild(leftPanel);
    horizentalContainer.addChild(child);
    horizentalContainer.addChild(new Splitter("v"));
    horizentalContainer.addChild(new DockContainer("v"));
    horizentalContainer.addChild(new Splitter("v"));
    horizentalContainer.addChild(new DockContainer("v"));
    this.children.push(horizentalContainer);
    horizentalContainer = null;

    this.children.push(new Splitter("h"));

    horizentalContainer = new DockContainer("h");
    this.children.push(horizentalContainer);
    horizentalContainer = null;
  }
}