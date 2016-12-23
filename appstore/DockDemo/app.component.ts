import { Component, OnInit } from "@angular/core";
import { Control, DockContainer, Splitter, TabPanel, TabPage } from "../../base/controls/control";
import { DataTable, DataTableRow, DataTableColumn } from "../../base/controls/data.component";
import { ComboControl, MetaControl } from "../../base/controls/user.component";

@Component({
  selector: "body",
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
    let row1: DockContainer = new DockContainer("h", null, 800);

    let leftPanel: TabPanel = new TabPanel();
    leftPanel.addTab("Toolbox", "Toolbox");
    leftPanel.addTab("Server", "Server");
    leftPanel.setActive("Toolbox");
    let row1col1 = new DockContainer("v").addChild(leftPanel);
    // col 1
    row1.addChild(row1col1);
    // Splitter
    row1.addChild(new Splitter("v"));
    // col 2
    let btn_dayview = new MetaControl("button");
    btn_dayview.Name = "test";
    btn_dayview.Value = "AllDayView";

    // let lbl_min = new MetaControl("label");
    // lbl_min.Value = "Min:";

    let txt_min = new MetaControl("textbox");
    txt_min.Name = "min";
    txt_min.Value = "Min:";
    txt_min.ModelVal = "";

    let txt_max = new MetaControl("radio");
    txt_max.Name = "sex";
    txt_max.Value = "male:";
    txt_max.ModelVal = "";

    let txt_tick = new MetaControl("radio");
    txt_tick.Name = "sex";
    txt_tick.Value = "female:";
    txt_tick.ModelVal = "";

    let txt_TimeRange = new MetaControl("checkbox");
    txt_TimeRange.Name = "All";
    txt_TimeRange.Value = "All:";
    txt_TimeRange.ModelVal = "";

    let txt_Slippage = new MetaControl("range");
    txt_Slippage.Name = "TimeRange";
    txt_Slippage.Value = "TimeRange:";
    txt_Slippage.ModelVal = "";


    let headControls = new ComboControl("row");
    headControls.addChild(btn_dayview);
    // headControls.addChild(lbl_min);
    headControls.addChild(txt_min);
    headControls.addChild(txt_max);
    headControls.addChild(txt_tick);
    headControls.addChild(txt_TimeRange);
    headControls.addChild(txt_Slippage);

    let table: DataTable = new DataTable();
    table.addColumn("姓名").addColumn("年龄").addColumn("性别").addColumn("成绩");


    btn_dayview.onClick(() => {
      for (let i = 0; i < 100; ++i) {
        let row = table.newRow();
        row.values[0] = "leige";
        row.values[1] = "1212";
        row.values[2] = "男";
        row.values[3] = "100.1";
      }
    });

    let body = new ComboControl("col");
    body.addChild(headControls);
    body.addChild(table);
    row1.addChild(new DockContainer("v", 800, null).addChild(body));
    row1.addChild(new Splitter("v"));
    // col 3
    let rightPanel: TabPanel = new TabPanel();
    rightPanel.addTab("Solution", "Solution");
    rightPanel.setActive("Solution");
    row1.addChild(new DockContainer("v").addChild(rightPanel));
    this.children.push(row1);
    // splitter between row1 and row2
    this.children.push(new Splitter("h"));
    // row 2
    let bottomPanel: TabPanel = new TabPanel();
    let outputPage = new TabPage("Output", "Output");
    bottomPanel.addTab2(outputPage);
    outputPage.setContent(body);
    bottomPanel.setActive(outputPage.id);
    let row2 = new DockContainer("h").addChild(bottomPanel);
    this.children.push(row2);
  }
}