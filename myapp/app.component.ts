import { Component, OnInit } from '@angular/core';


import { Control, DockContainer, Splitter } from 'controls/control';
// <dock-control *ngFor="let child of children" [className]="child.className" [children]="child.children">
//       </dock-control>
      // <div *ngFor="let child of children" className="{{child.className}}"> </div>
     
@Component({
  selector: 'body',
  template: `
    <div id="root" class="{{className}}">
        <dock-control *ngFor="let child of children" [className]="child.className" [children]="child.children">
        </dock-control>
    </div>
    `
})
export class AppComponent implements OnInit {
  className: string;
  children: Control[] = [];
  ngOnInit(): void {
    this.className = "dock-container vertical";
    let horizentalContainer: DockContainer = new DockContainer("h");
    horizentalContainer.addChild(new DockContainer("v"));
    horizentalContainer.addChild(new Splitter("v"));
    horizentalContainer.addChild(new DockContainer("v"));
    this.children.push(horizentalContainer);
    horizentalContainer = null;

    this.children.push(new Splitter("h"));

    horizentalContainer = new DockContainer("h");
    horizentalContainer.addChild(new DockContainer("v"));
    horizentalContainer.addChild(new Splitter("v"));
    horizentalContainer.addChild(new DockContainer("v"));
    this.children.push(horizentalContainer);
    horizentalContainer = null;
  }
}