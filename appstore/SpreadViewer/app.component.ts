import { Component, OnInit } from "@angular/core";
import {
  Control, DockContainer, Splitter,
  TabPanel, ComboControl, MetaControl, DataTable,
  DataTableRow, DataTableColumn, SpreadViewer,
  SpreadViewerConfig
} from "../../base/controls/control";
import { PriceService } from "../../base/api/services/priceService";

declare var electron: Electron.ElectronMainAndRenderer;
@Component({
  moduleId: module.id,
  selector: "body",
  templateUrl: "spreadview.html",
  styleUrls: ["spreadview.css"],
  providers: [
    PriceService
  ]
})
export class AppComponent implements OnInit {
  className: string = "dock-container vertical";
  children: Control[] = [];
  bHiddenProfile: boolean;
  profiles: SpreadViewerConfig[];
  spreadviewers: SpreadViewer[];
  currentViewer: SpreadViewer;

  constructor(private priceServ: PriceService) {
  }

  clickItem(item: SpreadViewerConfig): void {
    this.bHiddenProfile = true;
    this.profiles.forEach((profile, index) => {
      if (profile === item) {
        this.currentViewer = this.spreadviewers[index];
        this.currentViewer.show();
        window.resizeBy(1, 1);
      }
    });

    this.currentViewer.start();
  }

  ngOnInit(): void {
    this.bHiddenProfile = false;

    let row1: DockContainer = new DockContainer("h", null, 800);
    let btn_dayview = new MetaControl("button");
    btn_dayview.Class = "sd-button prespace";
    btn_dayview.Name = "test";
    btn_dayview.Text = "Change";

    let lbl_min = new MetaControl("label");
    lbl_min.Text = "Min:";

    let txt_min = new MetaControl("textbox");
    txt_min.Class = "sd-input";
    txt_min.Name = "min";
    txt_min.Text = "";

    let lbl_max = new MetaControl("label");
    lbl_max.Text = "Max:";

    let txt_max = new MetaControl("textbox");
    txt_max.Class = "sd-input";
    txt_max.Name = "max";
    txt_max.Text = "";

    let lbl_tick = new MetaControl("label");
    lbl_tick.Text = "Tick:";

    let txt_tick = new MetaControl("textbox");
    txt_tick.Class = "sd-input";
    txt_tick.Name = "Tick";
    txt_tick.Text = "";

    let lbl_TimeRange = new MetaControl("label");
    lbl_TimeRange.Text = "TimeRange:";

    let txt_TimeRange = new MetaControl("textbox");
    txt_TimeRange.Class = "sd-input";
    txt_TimeRange.Name = "TimeRange";
    txt_TimeRange.Text = "";

    let lbl_Slippage = new MetaControl("label");
    lbl_Slippage.Text = "Slippage:";

    let txt_Slippage = new MetaControl("textbox");
    txt_Slippage.Class = "sd-input";
    txt_Slippage.Name = "Slippage";
    txt_Slippage.Text = "";


    let headControls = new ComboControl("row");
    headControls.addChild(btn_dayview);
    headControls.addChild(lbl_min);
    headControls.addChild(txt_min);
    headControls.addChild(lbl_max);
    headControls.addChild(txt_max);
    headControls.addChild(lbl_tick);
    headControls.addChild(txt_tick);

    let body = new ComboControl("col");
    body.addChild(headControls);
    this.profiles = [];
    this.spreadviewers = [];
    this.profiles = electron.ipcRenderer.sendSync("svc://get-config", null);

    this.profiles.forEach((profile, index) => {
      this.spreadviewers.push(new SpreadViewer(this.priceServ));
      this.spreadviewers[index].setConfig(profile);
      this.spreadviewers[index].hidden();
      body.addChild(this.spreadviewers[index].ControlRef);
    });
    btn_dayview.OnClick = () => {
      let yaxis: any = {};
      if (txt_min.Text.length > 0) yaxis.min = parseFloat(txt_min.Text);
      if (txt_max.Text.length > 0) yaxis.max = parseFloat(txt_max.Text);
      if (txt_tick.Text.length > 0) yaxis.interval = parseFloat(txt_tick.Text);

      this.currentViewer.setEChartOption({ yAxis: yaxis });

      yaxis = null;
    };

    row1.addChild(new DockContainer("v", 800, null).addChild(body));
    this.children.push(row1);
  }
}


