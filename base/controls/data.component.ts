// data Component
/**
 * author: chenlei
 * desc: components for acesss data, such as datatable, treeview, charts, 
 */
import { Component, Input, OnInit, AfterViewInit, Directive, ElementRef, Renderer } from "@angular/core";
import { Control, CssStyle } from "./control";
import { PriceService } from "../../base/api/services/priceService";

const echarts: ECharts = require("../script/echart/echarts");

@Component({
  moduleId: module.id,
  selector: "dock-table",
  template: `
        <div class="tb-header">
            <div *ngFor="let col of dataSource.columns" class="td">
                {{col.columnHeader}}
            </div>
        </div>
        <div class="tb-body">
            <div class="tr" *ngFor="let row of dataSource.rows">
                <div *ngFor="let col of row.values" class="td">
                    {{col}}
                </div>
            </div>
        <div>
    `,
  inputs: ["className", "dataSource"]
})
export class DataTableComponent implements OnInit, AfterViewInit {
  className: string;
  dataSource: DataTable;

  ngOnInit(): void {
    // console.log(this.dataSource);
  }

  ngAfterViewInit(): void {
  }
}

export class DataTable extends Control {
  public columns: DataTableColumn[] = [];
  public rows: DataTableRow[] = [];
  public enableFooter: boolean = false;
  constructor() {
    super();
    this.className = "table";
    this.dataSource = {
      columns: null,
      rows: null,
      enableFooter: this.enableFooter
    };
    this.styleObj = { type: null, width: null, height: null };
  }

  newRow(): DataTableRow {
    let row = new DataTableRow(this.columns.length);
    this.rows.push(row);
    this.dataSource.rows = this.rows;
    return row;
  }

  addColumn(column: string): DataTable {
    this.columns.push(new DataTableColumn(column));
    this.dataSource.columns = this.columns;
    return this;
  }
}

export class DataTableRow {
  values: string[];
  constructor(private columns: number) {
    this.values = new Array<string>(this.columns);
  }
}

export class DataTableColumn {
  constructor(private columnHeader: string) {
  }
}

/**
 * chart components created by chenlei
 */
@Component({
  selector: "echart",
  template: "",
  inputs: [
    "className",
    "dataSource"
  ]
})
export class EChartComponent implements OnInit, AfterViewInit {
  className: string;
  dataSource: any;
  _echart: EChartsInstance;

  constructor(private el: ElementRef, private render: Renderer) {
  }

  ngOnInit(): void {
    // this.dataSource.init = () => {
    //   this._echart = echarts.init(this.el.nativeElement);
    //   this._echart.setOption(this.dataSource.option, true);
    //   window.addEventListener("resize", () => {
    //     this._echart.resize();
    //   });
    //   this.dataSource.setOption = (option) => {
    //     this._echart.setOption(option);
    //   };
    // };
  }

  ngAfterViewInit(): void {
    if (this.dataSource.option) {
      setTimeout(() => {
        let myChart: EChartsInstance = echarts.init(this.el.nativeElement);
        myChart.setOption(this.dataSource.option, true);

        window.addEventListener("resize", () => {
          myChart.resize();
        });

        this.dataSource.setOption = (option, notMerge) => {
          myChart.setOption(option, notMerge);
        };
      }, 100);
    }
  }
}

export class EChart extends Control {
  // private _option: Object = null;
  // private _events: Object = null;

  constructor() {
    super();
    this.styleObj = {
      type: "echart",
      width: null,
      height: null
    };
    this.dataSource = {
      option: {},
      events: {}
    };
  }

  init(): void {
    if (this.dataSource.init)
      this.dataSource.init();
    else
      console.error("echart::init failed.");
  }
  /**
   * @param option refer to http://echarts.baidu.com/option.html
   */
  setOption(option: Object): void {
    this.dataSource.option = option;
  }

  resetOption(option: Object, notMerge: boolean = false): void {
    if (this.dataSource.setOption) {
      this.dataSource.setOption(option, notMerge);
    }
  }

  onClick(cb: Function) {
    this.dataSource.events["click"] = cb;
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
  multiplier?: number;
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
  private _multiplier: number = 1;

  private _symbolCode1: string;
  private _innerCode1: number;
  private _coeff1: number;
  private _symbolCode2: string;
  private _innerCode2: number;
  private _coeff2: number;
  private _marketdataType1: string = "MARKETDATA";
  private _marketdataType2: string = "MARKETDATA";

  private _echart: EChart;
  private _bReset: boolean;

  constructor(private priceServ: PriceService) {
    this._echart = new EChart();
  }

  init(): void {
    this._echart.init();
  }

  start(): void {
    this.priceServ.subscribeMarketData(this._innerCode1, this._marketdataType1, msg => {
      this.setMarketData(msg);
    });

    this.priceServ.subscribeMarketData(this._innerCode2, this._marketdataType2, msg => {
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
      console.info(newOption);
      this.setEChartOption(newOption);
      ++this._curIdx;
    }, SpreadViewer.xInternal);
  }

  get ControlRef() {
    return this._echart;
  }
  // only can change the names
  setConfig(config: SpreadViewerConfig, bReset: boolean = false): void {
    this._bReset = bReset;
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
    if (config.multiplier) this._multiplier = config.multiplier;

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

    if (!bReset)
      this._echart.setOption(echartOption);
    else
      this._echart.resetOption(echartOption, false);
    echartOption = null;
  }

  setEChartOption(option: any): void {
    this._echart.resetOption(option);
  }

  get names() {
    if (!this._names || this._bReset) {
      this._names = [this.getSpreadTraceName1(), this.getSpreadTraceName2()];
    }
    return this._names;
  }

  get timePoints() {
    if (!this._timePoints || this._bReset) {
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
    if (!this._values || this._bReset) {
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

  getSpreadValue1(idx: number): number {
    // console.info(idx, this._msgs[this._innerCode1], this._msgs[this._innerCode2]);
    return Math.round((this._msgs[this._innerCode1][idx].askPrice1 - this._coeff1 * this._msgs[this._innerCode2][idx].bidPrice1) * this._multiplier * 100) / 100;
  }

  getSpreadValue2(idx: number): number {
    return Math.round((this._msgs[this._innerCode1][idx].bidPrice1 - this._coeff2 * this._msgs[this._innerCode2][idx].askPrice1) * this._multiplier * 100) / 100;
  }

  private index(timestamp: number): number {
    let itime = Math.floor(timestamp / 1000);
    let ihour = Math.floor(itime / 10000);
    let iminute = Math.floor(itime % 10000 / 100);
    return (ihour - this._durations[0].start.hour) * 60 * 60 + (iminute - this._durations[0].start.minute) * 60 +
      + itime % 10000 % 100;
  }

  setMarketData(msg: any): void {
    console.log(msg.Time, msg.UKey);
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
