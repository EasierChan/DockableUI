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

    // let row1col1 = new DockContainer("v").addChild(leftPanel);
    // col 1
    // row1.addChild(row1col1);
    // Splitter
    // row1.addChild(new Splitter("v"));
    // col 2
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
    // headControls.addChild(lbl_TimeRange);
    // headControls.addChild(txt_TimeRange);
    // headControls.addChild(lbl_Slippage);
    // headControls.addChild(txt_Slippage);


    // let table: DataTable = new DataTable();
    // table.addColumn("姓名").addColumn("年龄").addColumn("性别").addColumn("成绩");

    let data = {
      keys: [],
      values: {},
      times: [],
      yMax: 1,
      yMin: 0
    };

    let spreadViewer = new SpreadViewer(this.priceServ);
    spreadViewer.setConfig({
      symbolCode1: "IF1701",
      innerCode1: 2008296,
      coeff1: 1,
      symbolCode2: "IF1703",
      innerCode2: 2006912,
      coeff2: 1,
      durations: [
        {
          start: {
            hour: 13,
            minute: 30
          },
          end: {
            hour: 15,
            minute: 30
          }
        }
      ]
    });
    btn_dayview.onClick(() => {
      let yaxis: any = {};
      if (txt_min.ModelVal.length > 0) yaxis.min = parseFloat(txt_min.ModelVal);
      if (txt_max.ModelVal.length > 0) yaxis.max = parseFloat(txt_max.ModelVal);
      if (txt_tick.ModelVal.length > 0) yaxis.interval = parseFloat(txt_tick.ModelVal);

      spreadViewer.setEChartOption({ yAxis: yaxis });

      yaxis = null;
    });

    let body = new ComboControl("col");
    body.addChild(headControls);
    body.addChild(spreadViewer.ControlRef);
    row1.addChild(new DockContainer("v", 800, null).addChild(body));
    this.children.push(row1);
    spreadViewer.start();
  }
}

export interface SpreadViewerConfig {
  symbolCode1: string;
  innerCode1: number;
  coeff1: number;
  symbolCode2: string;
  innerCode2: number;
  coeff2: number;
  durations: Array<{ start: DatePoint, end: DatePoint }>;
  marketdataType1?: string;
  marketdataType2?: string;
  xInterval?: number;
}

interface DatePoint {
  hour: number;
  minute: number;
}

export class SpreadViewer {
  static readonly EPS: number = 1.0e-5;
  static readonly YUAN_PER_UNIT = 10000;
  static readonly xInternal = 1000; // ms
  private _msgs: Object = {};
  private _lastIdx = {};
  private _firstIdx: number = -1;
  private _curIdx: number = -1;
  private _xInterval: number = 1000;
  private _durations: Array<{ start: DatePoint, end: DatePoint }>;
  private _names: string[];
  private _timePoints: string[];
  private _values: Array<any>[];
  private _timeoutHandler: any;

  private _symbolCode1: string;
  private _innerCode1: number;
  private _coeff1: number;
  private _symbolCode2: string;
  private _innerCode2: number;
  private _coeff2: number;
  private _marketdataType1: string = "MARKETDATA";
  private _marketdataType2: string = "MARKETDATA";

  private _echart: EChart;

  constructor(private priceServ: PriceService) {
    this._echart = new EChart();
  }

  start(): void {
    this.priceServ.subscribeMarketData([this._innerCode1, this._innerCode2], msg => {
      this.setMarketData(msg);
    });

    this._timeoutHandler = setInterval(() => {
      if (this._lastIdx[this._innerCode1] === -1 || this._lastIdx[this._innerCode2] === -1) // both have one at least
        return;

      if (!this._msgs[this._innerCode1][this._curIdx] || !this._msgs[this._innerCode2][this._curIdx]) {
        console.warn(`curIdx: ${this._curIdx} don't have data of both.`);
        return;
      }

      // console.info(this._curIdx, this.values);
      this.values[0][this._curIdx] = this.getSpreadValue1(this._curIdx);
      this.values[1][this._curIdx] = this.getSpreadValue2(this._curIdx);
      let newOption: any = {
        series: [{
          name: this.names[0],
          data: this.values[0]
        }, {
          name: this.names[1],
          data: this.values[1]
        }]
      };

      this.setEChartOption(newOption);
      ++this._curIdx;
    }, SpreadViewer.xInternal);
  }

  get ControlRef() {
    return this._echart;
  }

  setConfig(config: SpreadViewerConfig): void {
    this._symbolCode1 = config.symbolCode1;
    this._innerCode1 = config.innerCode1;
    this._coeff1 = config.coeff1;
    this._symbolCode2 = config.symbolCode2;
    this._innerCode2 = config.innerCode2;
    this._coeff2 = config.coeff2;
    this._durations = config.durations;
    if (config.marketdataType1) this._marketdataType1 = config.marketdataType1;
    if (config.marketdataType2) this._marketdataType2 = config.marketdataType2;
    if (config.xInterval) this._xInterval = config.xInterval;

    this._lastIdx[this._innerCode1] = -1;
    this._lastIdx[this._innerCode2] = -1;

    let echartOption = {
      title: {
        bottom: 10,
        text: "SpreadViewer"
      },
      tooltip: {
        trigger: "axis"
      },
      legend: {
        bottom: 10,
        data: this.names,
        textStyle: {
          color: "#fff"
        }
      },
      grid: {
        left: 100,
        right: 80,
        bottom: 100,
        containLabel: false
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: this.timePoints
      },
      yAxis: {
        type: "value",
        min: "dataMin",
        max: "dataMax"
      },
      dataZoom: [
        {
          type: "inside",
          xAxisIndex: 0
        },
      ],
      series: [
        {
          name: this.names[0],
          type: "line",
          // smooth: true,
          data: this.values[0],
          lineStyle: {
            normal: {
              width: 1
            }
          },
          tooltip: {
            formatter: function (param) {
              return JSON.stringify(param);
            }
          }
        },
        {
          name: this.names[1],
          type: "line",
          // smooth: true,
          data: this.values[1],
          lineStyle: {
            normal: {
              width: 1
            }
          }
        }
      ]
    };
    this._echart.setOption(echartOption);
    echartOption = null;
  }

  setEChartOption(option: any): void {
    this._echart.resetOption(option);
  }

  get names() {
    if (!this._names) {
      this._names = [this.getSpreadTraceName1(), this.getSpreadTraceName2()];
    }
    return this._names;
  }

  get timePoints() {
    if (!this._timePoints) {
      this._timePoints = [];
      let today = new Date(), min_date: Date;
      this._durations.forEach(duration => {
        let seconds = (duration.end.hour - duration.start.hour) * 3600 + (duration.end.minute - duration.start.minute) * 60;
        let originLen = this._timePoints.length;
        this._timePoints.length += seconds;
        min_date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), duration.start.hour, duration.start.minute);
        for (let sec = 0; sec < seconds; ++sec) {
          this._timePoints[originLen + sec] = min_date.toLocaleTimeString([], { hour12: false });
          min_date.setSeconds(min_date.getSeconds() + 1);
        }
      });

      min_date = null;
      today = null;
    }
    return this._timePoints;
  }

  get values() {
    if (!this._values) {
      this._values = new Array(this.names.length);
      this.names.forEach((name, index) => {
        this._values[index] = new Array<number>(this.timePoints.length).fill(null);
      });
    }
    return this._values;
  }

  getSpreadTraceName1(): string {
    let namePrimary: string = this._symbolCode1 + ".askPrice1";
    let nameSecondary: string = this._symbolCode2 + ".bidPrice1";
    return namePrimary + "-" + (Math.abs(this._coeff1 - 1) < SpreadViewer.EPS ? "" : this._coeff1.toFixed(2) + " * ") + nameSecondary;
  }

  getSpreadTraceName2(): string {
    let namePrimary: string = this._symbolCode1 + ".bidPrice1";
    let nameSecondary: string = this._symbolCode2 + ".askPrice1";
    return namePrimary + "-" + (Math.abs(this._coeff2 - 1) < SpreadViewer.EPS ? "" : this._coeff2.toFixed(2) + "*") + nameSecondary;
  }

  getSpreadValue1(idx: number, multiplier: number = 1): number {
    // console.info(idx, this._msgs[this._innerCode1], this._msgs[this._innerCode2]);
    return Math.round((this._msgs[this._innerCode1][idx].askPrice1 - this._coeff1 * this._msgs[this._innerCode2][idx].bidPrice1) * multiplier * 100) / 100;
  }

  getSpreadValue2(idx: number, multiplier: number = 1): number {
    return Math.round((this._msgs[this._innerCode1][idx].bidPrice1 - this._coeff2 * this._msgs[this._innerCode2][idx].askPrice1) * multiplier * 100) / 100;
  }

  private index(timestamp: number): number {
    let itime = Math.floor(timestamp / 1000);
    let ihour = Math.floor(itime / 10000);
    let iminute = Math.floor(itime % 10000 / 100);
    return (ihour - this._durations[0].start.hour) * 60 * 60 + (iminute - this._durations[0].start.minute) * 60 +
      + itime % 10000 % 100;
  }

  setMarketData(msg: any): void {
    if (!msg.InstrumentID || !this.hasInstrumentID(msg.InstrumentID))
      return;

    let idx = this.index(msg.Time);
    if (idx > this.timePoints.length || idx < 0) {
      console.error(`msg time: ${msg.Time} is not valid`);
      return;
    }

    if (!this._msgs[msg.UKey])
      this._msgs[msg.UKey] = {};

    if (!this._msgs[msg.UKey][idx])
      this._msgs[msg.UKey][idx] = {};

    this._msgs[msg.UKey][idx].askPrice1 = msg.AskPrice / SpreadViewer.YUAN_PER_UNIT;
    this._msgs[msg.UKey][idx].bidPrice1 = msg.BidPrice / SpreadViewer.YUAN_PER_UNIT;
    if (this._lastIdx[this._innerCode1] !== -1 && this._lastIdx[this._innerCode2] !== -1) {
      // console.info(msg.UKey, this._lastIdx, idx, this._msgs);
      for (let i = this._lastIdx[this._innerCode1] + 1; i < idx; ++i) {
        if (!this._msgs[this._innerCode1][i])
          this._msgs[this._innerCode1][i] = {};
        this._msgs[this._innerCode1][i].askPrice1 = this._msgs[this._innerCode1][i - 1].askPrice1;
        this._msgs[this._innerCode1][i].bidPrice1 = this._msgs[this._innerCode1][i - 1].bidPrice1;
      }
      for (let i = this._lastIdx[this._innerCode2] + 1; i < idx; ++i) {
        if (!this._msgs[this._innerCode2][i])
          this._msgs[this._innerCode2][i] = {};
        this._msgs[this._innerCode2][i].askPrice1 = this._msgs[this._innerCode2][i - 1].askPrice1;
        this._msgs[this._innerCode2][i].bidPrice1 = this._msgs[this._innerCode2][i - 1].bidPrice1;
      }

      if (msg.UKey === this._innerCode1 && idx > this._lastIdx[this._innerCode2]) {
        if (!this._msgs[this._innerCode2][idx])
          this._msgs[this._innerCode2][idx] = {};
        this._msgs[this._innerCode2][idx].askPrice1 = this._msgs[this._innerCode2][idx - 1].askPrice1;
        this._msgs[this._innerCode2][idx].bidPrice1 = this._msgs[this._innerCode2][idx - 1].bidPrice1;
      }

      if (msg.UKey === this._innerCode2 && idx > this._lastIdx[this._innerCode1]) {
        if (!this._msgs[this._innerCode1][idx])
          this._msgs[this._innerCode1][idx] = {};
        this._msgs[this._innerCode1][idx].askPrice1 = this._msgs[this._innerCode1][idx - 1].askPrice1;
        this._msgs[this._innerCode1][idx].bidPrice1 = this._msgs[this._innerCode1][idx - 1].bidPrice1;
      }
    } else if (this._lastIdx[this._innerCode1] === -1 && this._lastIdx[this._innerCode2] === -1) { // first quote data
      this._firstIdx = idx;
    } else { // only one is -1
      if (this._lastIdx[this._innerCode1] === -1) { // innerCode1 none of marketdata.
        if (msg.UKey === this._innerCode1) { // it's marketdata of innercode1
          // for (let i = this._lastIdx[this._innerCode2] + 1; i <= idx; ++i) {
          //   if (!this._msgs[this._innerCode2][i])
          //     this._msgs[this._innerCode2][i] = {};
          //   this._msgs[this._innerCode2][i].askPrice1 = this._msgs[this._innerCode2][i - 1].askPrice1;
          //   this._msgs[this._innerCode2][i].bidPrice1 = this._msgs[this._innerCode2][i - 1].bidPrice1;
          // }
          if (!this._msgs[this._innerCode2][idx])
            this._msgs[this._innerCode2][idx] = {};
          this._msgs[this._innerCode2][idx].askPrice1 = this._msgs[this._innerCode2][this._lastIdx[this._innerCode2]].askPrice1;
          this._msgs[this._innerCode2][idx].bidPrice1 = this._msgs[this._innerCode2][this._lastIdx[this._innerCode2]].bidPrice1;
          this._curIdx = idx;
        } else {
          // for (let i = this._lastIdx[this._innerCode2] + 1; i < idx; ++i) {
          //   if (!this._msgs[this._innerCode2][i])
          //     this._msgs[this._innerCode2][i] = {};
          //   this._msgs[this._innerCode2][i].askPrice1 = this._msgs[this._innerCode2][i - 1].askPrice1;
          //   this._msgs[this._innerCode2][i].bidPrice1 = this._msgs[this._innerCode2][i - 1].bidPrice1;
          // }
        }
      } else { // innerCode2 none of marketdata
        if (msg.UKey === this._innerCode2) {
          // for (let i = this._lastIdx[this._innerCode1] + 1; i <= idx; ++i) {
          //   if (!this._msgs[this._innerCode1][i])
          //     this._msgs[this._innerCode1][i] = {};
          //   this._msgs[this._innerCode1][i].askPrice1 = this._msgs[this._innerCode1][i - 1].askPrice1;
          //   this._msgs[this._innerCode1][i].bidPrice1 = this._msgs[this._innerCode1][i - 1].bidPrice1;
          // }
          if (!this._msgs[this._innerCode1][idx])
            this._msgs[this._innerCode1][idx] = {};
          this._msgs[this._innerCode1][idx].askPrice1 = this._msgs[this._innerCode1][this._lastIdx[this._innerCode1]].askPrice1;
          this._msgs[this._innerCode1][idx].bidPrice1 = this._msgs[this._innerCode1][this._lastIdx[this._innerCode1]].bidPrice1;
          this._curIdx = idx;
        } else {
          // for (let i = this._lastIdx[this._innerCode1] + 1; i < idx; ++i) {
          //   if (!this._msgs[this._innerCode1][i])
          //     this._msgs[this._innerCode1][i] = {};
          //   this._msgs[this._innerCode1][i].askPrice1 = this._msgs[this._innerCode1][i - 1].askPrice1;
          //   this._msgs[this._innerCode1][i].bidPrice1 = this._msgs[this._innerCode1][i - 1].bidPrice1;
          // }
        }
      }
    }
    this._lastIdx[msg.UKey] = idx;
  }

  hasInstrumentID(instrumentID: string): boolean {
    return this._symbolCode1.startsWith(instrumentID.substr(0, 6)) || this._symbolCode2.startsWith(instrumentID.substr(0, 6));
  }

  dispose(): void {
    if (this._timeoutHandler) {
      clearTimeout(this._timeoutHandler);
    }
  }
}


