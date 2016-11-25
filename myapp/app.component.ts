import { Component, OnInit } from '@angular/core';


import { Control, DockContainer, Splitter } from 'controls/control';

@Component({
  selector: 'body',
  template: `
    <div id="root" class="{{className}}">
      <div *ngFor="let child of children" class="{{child.className}}">
      </div>
    </div>
    `
})
export class AppComponent implements OnInit {
  className : string;
  children: Control[] = [];
  ngOnInit(): void{
    this.className = "dock-container vertical";
    let horizentalContainer:DockContainer = new DockContainer("h");
    horizentalContainer.addChildContianer(new DockContainer("v")).addChildContianer(new DockContainer("v"));
    this.children.push(horizentalContainer);
    horizentalContainer = null;
    this.children.push(new Splitter("h"));

    horizentalContainer = new DockContainer("h");
    horizentalContainer.addChildContianer(new DockContainer("v")).addChildContianer(new DockContainer("v"));
    this.children.push(horizentalContainer);
  }
}