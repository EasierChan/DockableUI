/**
 * created by chenlei
 */
import { Component, Input } from "@angular/core"

@Component({
  selector: 'dock-control',
  template: `
  <div class="{{className}}">
    <dock-control *ngFor="let child of children" [className]="child.className" [children]="child.children">
    </dock-control>
  </div>
  `,
  inputs: ['className','children']
})
export class DockContainerComponent{
  className: string;
  children: Control[];
}


export class Control {
  className: string;
  children: any[];
}

export class DockContainer extends Control{
  children: Control[] = [];
  constructor(type) {
    super();
    if(type === "v"){
      this.className = "dock-container vertical";
    }else{
      this.className = "dock-container horizental";
    }
  }

  addChild(containerRef: Control): DockContainer {
    this.children.push(containerRef);
    return this;
  }
}

export class Splitter extends Control{
  className: string;
  constructor(type){
    super();
    this.className = type == "v" ? "splitter-bar vertical" : "splitter-bar horizental";
  }
}