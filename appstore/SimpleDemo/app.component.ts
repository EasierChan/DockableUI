import { Component, OnInit } from "@angular/core";
import { Control, DockContainer, Splitter, TabPanel } from "../../base/controls/control";
import { DataTable, DataTableRow, DataTableColumn, EChart } from "../../base/controls/data.component";
import { ComboControl, MetaControl } from "../../base/controls/user.component";
import { PriceService } from "../../base/api/services/priceService";

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
    `,
  providers: [
    PriceService
  ]
})
export class AppComponent implements OnInit {
  className: string = "dock-container vertical";
  children: Control[] = [];

  constructor(private priceServ: PriceService) {
  }

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
    // row1.addChild(row1col1);
    // Splitter
    // row1.addChild(new Splitter("v"));
    // col 2
    let btn_dayview = new MetaControl("button");
    btn_dayview.Name = "test";
    btn_dayview.Value = "AllDayView";

    let lbl_min = new MetaControl("label");
    lbl_min.Value = "Min:";

    let txt_min = new MetaControl("textbox");
    txt_min.Name = "min";
    txt_min.ModelVal = "";

    let lbl_max = new MetaControl("label");
    lbl_max.Value = "Max:";

    let txt_max = new MetaControl("textbox");
    txt_max.Name = "max";
    txt_max.ModelVal = "";

    let lbl_tick = new MetaControl("label");
    lbl_tick.Value = "Tick:";

    let txt_tick = new MetaControl("textbox");
    txt_tick.Name = "Tick";
    txt_tick.ModelVal = "";

    let lbl_TimeRange = new MetaControl("label");
    lbl_TimeRange.Value = "TimeRange:";

    let txt_TimeRange = new MetaControl("textbox");
    txt_TimeRange.Name = "TimeRange";
    txt_TimeRange.ModelVal = "";

    let lbl_Slippage = new MetaControl("label");
    lbl_Slippage.Value = "Slippage:";

    let txt_Slippage = new MetaControl("textbox");
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


    // let table: DataTable = new DataTable();
    // table.addColumn("姓名").addColumn("年龄").addColumn("性别").addColumn("成绩");


    // btn_dayview.onClick(() => {
    //   for (let i = 0; i < 100; ++i) {
    //     let row = table.newRow();
    //     row.values[0] = "leige";
    //     row.values[1] = "1212";
    //     row.values[2] = "男";
    //     row.values[3] = "100.1";
    //   }
    // });
    let data = {
      keys: [],
      values: {},
      times: [],
      yMax: 1,
      yMin: 0
    };

    let spreadViewer = new SpreadViewer("IF1612", "2006622", 1, "IF1703", "2006912", 1);
    data.keys.push(spreadViewer.getSpreadTraceName1());
    data.keys.push(spreadViewer.getSpreadTraceName2());

    data.keys.forEach((item) => {
      data.values[item] = new Array();
    });

    let today = new Date();
    let min_date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30, 0);
    function randomData(openPrice: number) {
      return (openPrice * 0.9 + Math.random() * openPrice * 0.2).toFixed(2);
    }

    for (let i = 9.5 * 60 * 60; i <= 11.5 * 60 * 60; ++i) { // 9:30 - 11:30
      data.keys.forEach((item) => {
        data.values[item].push(null);
      });
      data.times.push(min_date.getHours() + ":" + (min_date.getMinutes() < 10 ? "0" : "") + min_date.getMinutes()
        + ":" + (min_date.getSeconds() < 10 ? "0" : "") + min_date.getSeconds());
      min_date.setSeconds(min_date.getSeconds() + 1);
    }

    min_date.setMinutes(min_date.getMinutes() + 89);
    for (let i = 13 * 60 * 60; i <= 15 * 60 * 60; ++i) {
      data.keys.forEach((item) => {
        data.values[item].push(null);
      });
      data.times.push(min_date.getHours() + ":" + (min_date.getMinutes() < 10 ? "0" : "") + min_date.getMinutes()
        + ":" + (min_date.getSeconds() < 10 ? "0" : "") + min_date.getSeconds());
      min_date.setSeconds(min_date.getSeconds() + 1);
    }
    // console.log(values, times);
    let echart: EChart = new EChart();
    echart.setOption({
      title: {
        bottom: 10,
        text: "SpreadViewer"
      },
      tooltip: {
        trigger: "axis"
      },
      legend: {
        bottom: 10,
        data: data.keys,
        textStyle: {
          color: "#fff"
        }
      },
      grid: {
        left: "10%",
        right: "8%",
        bottom: "15%",
        containLabel: false
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: data.times
      },
      yAxis: {
        type: "value"
      },
      series: [
        {
          name: data.keys[0],
          type: "line",
          smooth: true,
          data: data.values[data.keys[0]],
          lineStyle: {
            normal: {
              width: 1
            }
          }
        },
        {
          name: data.keys[1],
          type: "line",
          smooth: true,
          data: data.values[data.keys[1]],
          lineStyle: {
            normal: {
              width: 1
            }
          }
        }
      ]
    });

    // console.log(data.values, data.values["IF1612"])
    let count = 0;
    this.priceServ.subscribeMarketData([2006622, 2006912], (msg) => {
      let time = msg.Time / 100000;
      let idx = (time / 100 > 21 ? time / 100 - 21 + 2 : time / 100 - 17.5) * 60 * 60 + time % 100;
      if (idx > 241 * 60)
        return;

      if (msg.InstrumentID && spreadViewer.hasInstrumentID(msg.InstrumentID)) {
        let pair = spreadViewer.getSpreadValuePair(idx, msg);
        if (pair === null)
          return;
        data.values[data.keys[0]][Math.round(idx)] = pair.a; // tradeTime
        data.values[data.keys[1]][Math.round(idx)] = pair.b; // tradeTime
        echart.resetOption({
          series: [{
            name: data.keys[0],
            data: data.values[data.keys[0]]
          }, {
            name: data.keys[1],
            data: data.values[data.keys[1]]
          }]
        })
      }
    });

    let body = new ComboControl("col");
    body.addChild(headControls);
    body.addChild(echart);
    row1.addChild(new DockContainer("v", 800, null).addChild(body));
    this.children.push(row1);
  }
}

const EPS: number = 1.0e-5;
const YUAN_PER_UNIT = 10000;
export class SpreadViewer {
  private _msgs: Object = {};

  constructor(private symbolCode1: string,
    private innerCode1: string,
    private coeff1: number,
    private symbolCode2: string,
    private innerCode2: string,
    private coeff2: number,
    private marketdataType1: string = "MARKETDATA",
    private marketdataType2: string = "MARKETDATA") {
  }

  getSpreadTraceName1(): string {
    let namePrimary: string = this.symbolCode1 + ".askPrice1";
    let nameSecondary: string = this.symbolCode2 + ".bidPrice1";
    return namePrimary + "-" + (Math.abs(this.coeff1 - 1) < EPS ? "" : this.coeff1.toFixed(4) + " * ") + nameSecondary;
  }

  getSpreadTraceName2(): string {
    let namePrimary: string = this.symbolCode1 + ".bidPrice1";
    let nameSecondary: string = this.symbolCode2 + ".askPrice1";
    return namePrimary + "-" + (Math.abs(this.coeff2 - 1) < EPS ? "" : this.coeff2.toFixed(4) + "*") + nameSecondary;
  }

  getSpreadValue1(idx: number, multiplier: number = 1): number {
    return (this._msgs[this.innerCode1][idx].askPrice1 - this.coeff1 * this._msgs[this.innerCode2][idx].bidPrice1) * multiplier;
  }

  getSpreadValue2(idx: number, multiplier: number = 1): number {
    return (this._msgs[this.innerCode1][idx].bidPrice1 - this.coeff2 * this._msgs[this.innerCode2][idx].askPrice1) * multiplier;
  }

  getSpreadValuePair(idx: number, msg: any): { a: number, b: number } {
    if (!this._msgs.hasOwnProperty(msg.UKey))
      this._msgs[msg.UKey] = {};

    if (!this._msgs[msg.UKey].hasOwnProperty(idx))
      this._msgs[msg.UKey][idx] = {};

    this._msgs[msg.UKey][idx].askPrice1 = msg.AskPrice / YUAN_PER_UNIT;
    this._msgs[msg.UKey][idx].bidPrice1 = msg.BidPrice / YUAN_PER_UNIT;

    if (this._msgs[this.innerCode1] && this._msgs[this.innerCode1].hasOwnProperty(idx) &&
      this._msgs[this.innerCode2] && this._msgs[this.innerCode2].hasOwnProperty(idx)) {
      return {
        a: this.getSpreadValue1(idx),
        b: this.getSpreadValue2(idx)
      }
    } else {
      return null;
    }
  }

  hasInstrumentID(instrumentID: string): boolean {
    return this.symbolCode1.startsWith(instrumentID.substr(0, 6)) || this.symbolCode2.startsWith(instrumentID.substr(0, 6));
  }
}
