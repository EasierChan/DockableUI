import { Component, OnInit } from "@angular/core";
import { Control, DockContainer, Splitter, TabPanel } from "../../base/controls/control";
import { DataTable, DataTableRow, DataTableColumn, SpreadViewer, SpreadViewerConfig } from "../../base/controls/data.component";
import { ComboControl, MetaControl } from "../../base/controls/user.component";
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
  spreadviewer: SpreadViewer;

  constructor(private priceServ: PriceService) {
  }

  clickItem(item: SpreadViewerConfig): void {
    this.bHiddenProfile = true;
    this.spreadviewer.start();
  }

  ngOnInit(): void {
    this.bHiddenProfile = false;
    this.profiles = [];
    this.profiles.push(
      {
        symbolCode1: "IF1701",
        innerCode1: 2008296,
        coeff1: 1,
        symbolCode2: "IF1703",
        innerCode2: 2006912,
        coeff2: 1,
        durations: [
          {
            start: {
              hour: 20,
              minute: 30
            },
            end: {
              hour: 22,
              minute: 30
            }
          }
        ],
        multiplier: 1,
        marketdataType1: "MARKETDATA",
        marketdataType2: "MARKETDATA"
      });


    let row1: DockContainer = new DockContainer("h", null, 800);
    let btn_dayview = new MetaControl("button");
    btn_dayview.Class = "sd-button prespace";
    btn_dayview.Name = "test";
    btn_dayview.Value = "Change";

    let lbl_min = new MetaControl("label");
    lbl_min.Value = "Min:";

    let txt_min = new MetaControl("textbox");
    txt_min.Class = "sd-input";
    txt_min.Name = "min";
    txt_min.ModelVal = "";

    let lbl_max = new MetaControl("label");
    lbl_max.Value = "Max:";

    let txt_max = new MetaControl("textbox");
    txt_max.Class = "sd-input";
    txt_max.Name = "max";
    txt_max.ModelVal = "";

    let lbl_tick = new MetaControl("label");
    lbl_tick.Value = "Tick:";

    let txt_tick = new MetaControl("textbox");
    txt_tick.Class = "sd-input";
    txt_tick.Name = "Tick";
    txt_tick.ModelVal = "";

    let lbl_TimeRange = new MetaControl("label");
    lbl_TimeRange.Value = "TimeRange:";

    let txt_TimeRange = new MetaControl("textbox");
    txt_TimeRange.Class = "sd-input";
    txt_TimeRange.Name = "TimeRange";
    txt_TimeRange.ModelVal = "";

    let lbl_Slippage = new MetaControl("label");
    lbl_Slippage.Value = "Slippage:";

    let txt_Slippage = new MetaControl("textbox");
    txt_Slippage.Class = "sd-input";
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

    let body = new ComboControl("col");
    body.addChild(headControls);

    let viewConfigs: SpreadViewerConfig[] = electron.ipcRenderer.sendSync("svc://get-config", null);
    this.spreadviewer = new SpreadViewer(this.priceServ);
    this.spreadviewer.setConfig(viewConfigs[0]);
    btn_dayview.onClick(() => {
      let yaxis: any = {};
      if (txt_min.ModelVal.length > 0) yaxis.min = parseFloat(txt_min.ModelVal);
      if (txt_max.ModelVal.length > 0) yaxis.max = parseFloat(txt_max.ModelVal);
      if (txt_tick.ModelVal.length > 0) yaxis.interval = parseFloat(txt_tick.ModelVal);

      this.spreadviewer.setEChartOption({ yAxis: yaxis });

      yaxis = null;
    });

    body.addChild(this.spreadviewer.ControlRef);
    row1.addChild(new DockContainer("v", 800, null).addChild(body));
    this.children.push(row1);
  }
}


