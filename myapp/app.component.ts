import { Component, OnInit } from '@angular/core';
import { Control, DockContainer, Splitter, TabPanel } from '../base/controls/control';
import { DataTable, DataTableRow, DataTableColumn } from '../base/controls/data.component';
import { ComboControl, MetaControl } from './user.component';
 
@Component({
  selector: 'body',
  template: `
    <div id="root" [class]="className">
        <dock-control *ngFor="let child of children" [className]="child.className" [children]="child.children" [styleObj]="child.styleObj">
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
  className: string = "dock-container vertical";
  children: Control[] = [];
  ngOnInit(): void {
    // this.className = "dock-container vertical";
    // row 1
    let horizentalContainer: DockContainer = new DockContainer("h", null, 800);

    let leftPanel: TabPanel = new TabPanel();
    leftPanel.addTab("Toolbox", "Toolbox");
    leftPanel.addTab("Server", "Server");
    leftPanel.setActive("Toolbox");
    let child = new DockContainer("v").addChild(leftPanel);
    // col 1
    horizentalContainer.addChild(child);
    // Splitter
    horizentalContainer.addChild(new Splitter("v"));
    // col 2
    let btn_dayview = new MetaControl("btn");
    btn_dayview.Name = "test";
    btn_dayview.Value = "AllDayView";

    let lbl_min = new MetaControl("text-plain");
    lbl_min.Value= "Min:";

    let txt_min = new MetaControl("input-text");
    txt_min.Name = "min";
    txt_min.ModelVal = "";

    let lbl_max = new MetaControl("text-plain");
    lbl_max.Value= "Max:";

    let txt_max = new MetaControl("input-text");
    txt_max.Name = "max";
    txt_max.ModelVal = "";

    let lbl_tick = new MetaControl("text-plain");
    lbl_tick.Value= "Tick:";

    let txt_tick = new MetaControl("input-text");
    txt_tick.Name = "Tick";
    txt_tick.ModelVal = "";
    
    let lbl_TimeRange = new MetaControl("text-plain");
    lbl_TimeRange.Value= "TimeRange:";

    let txt_TimeRange = new MetaControl("input-text");
    txt_TimeRange.Name = "TimeRange";
    txt_TimeRange.ModelVal = "";
    
    let lbl_Slippage= new MetaControl("text-plain");
    lbl_Slippage.Value= "Slippage:";

    let txt_Slippage = new MetaControl("input-text");
    txt_Slippage.Name = "Slippage";
    txt_Slippage.ModelVal = "";

    
    let headControls = new ComboControl("row");
    headControls.addChild(btn_dayview);
    headControls.addChild(lbl_min);
    headControls.addChild(txt_min);
    headControls.addChild(lbl_max);
    headControls.addChild(txt_max);
    headControls.addChild(lbl_tick);
    headControls.addChild(txt_tick);
    headControls.addChild(lbl_TimeRange);
    headControls.addChild(txt_TimeRange);
    headControls.addChild(lbl_Slippage);
    headControls.addChild(txt_Slippage);
    btn_dayview.onClick(()=>{
      console.log(JSON.stringify(txt_min.ModelVal));
    });

    let table: DataTable = new DataTable();
    table.addColumn("姓名").addColumn("年龄").addColumn("性别").addColumn("成绩");
    for(let i = 0; i< 100; ++i){
      let row = table.newRow();
      row.values[0] = "leige";
      row.values[1] = "1212";
      row.values[2] = "男";
      row.values[3] = "100.1";
    }

    let body = new ComboControl("col");
    body.addChild(headControls);
    body.addChild(table);
    horizentalContainer.addChild(new DockContainer("v", 800, null).addChild(body));
    horizentalContainer.addChild(new Splitter("v"));
    //col 3
    horizentalContainer.addChild(new DockContainer("v"));
    this.children.push(horizentalContainer);
    horizentalContainer = null;

    this.children.push(new Splitter("h"));
    // row 2
    horizentalContainer = new DockContainer("h");
    this.children.push(horizentalContainer);
    horizentalContainer = null;
  }
}