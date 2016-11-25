/**
 * created by chenlei
 */

export class Control {
  className: string;
  children: any[];
}

export class DockContainer extends Control{
  children: DockContainer[] = [];
  constructor(type) {
    super();
    if(type === "v"){
      this.className = "dock-container vertical";
    }else{
      this.className = "dock-container horizental";
    }
  }

  addChildContianer(containerRef: DockContainer): DockContainer {
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