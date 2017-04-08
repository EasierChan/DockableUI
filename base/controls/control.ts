/**
 * created by chenlei
 */
import { PriceService } from "../../base/api/services/priceService";
const EventEmitter = require("@node/events");

export interface CssStyle {
    type: string;
    width: number;
    height: number;
}

export class Control {
    protected className: string;
    protected children: any[];
    protected dataSource: any;
    protected styleObj: any;
    protected listeners: any;
}

export class DockContainer extends Control {

    constructor(type: "v" | "h", width?: number, height?: number) {
        super();
        if (type === "v") {
            this.className = "dock-container vertical";
            this.styleObj = {
                type: "",
                width: width === undefined ? 300 : width,
                height: null
            };
        } else {
            this.className = "dock-container horizental";
            this.styleObj = {
                type: "",
                width: null,
                height: height === undefined ? 200 : height
            };
        }
        this.children = [];
    }

    addChild(containerRef: any): DockContainer {
        this.children.push(containerRef);
        return this;
    }

}

export class Splitter extends Control {
    constructor(type) {
        super();
        this.className = type === "v" ? "splitter-bar vertical" : "splitter-bar horizental";
    }
}

export class TabPanel extends Control {
    protected pages: TabPages;
    protected headers: TabHeaders;
    constructor() {
        super();
        this.pages = new TabPages();
        this.headers = new TabHeaders();
        this.className = "tab-panel";
        this.children = [];
        this.children.push(this.pages);
        this.children.push(this.headers);
    }
    /**
     * pageId connection between header and title
     * @param pageId connection between header and title
     * @param pageTitle show the tab desc
     */
    addTab2(pageId, pageTitle): TabPanel {
        this.headers.addHeader(new TabHeader(pageId));
        this.pages.addPage(new TabPage(pageId, pageTitle));
        return this;
    }

    addTab(page: TabPage): TabPanel {
        this.headers.addHeader(new TabHeader(page.id));
        this.pages.addPage(page);
        return this;
    }

    setActive(pageId: string): TabPanel {
        this.pages.getAllPage().forEach(page => {
            if (page.id === pageId)
                page.setActive();
        });

        this.headers.getAllHeader().forEach(header => {
            if (header.targetId === pageId)
                header.setActive();
        });
        return this;
    }
}

export class TabPages extends Control {
    protected pages: TabPage[] = [];
    constructor() {
        super();
    }

    addPage(page: TabPage): TabPages {
        this.pages.push(page);
        return this;
    }

    getAllPage(): TabPage[] {
        return this.pages;
    }
}
export class TabHeaders extends Control {
    protected headers: TabHeader[] = [];
    constructor() {
        super();
    }

    addHeader(header: TabHeader): TabHeaders {
        this.headers.push(header);
        return this;
    }

    getAllHeader(): TabHeader[] {
        return this.headers;
    }
}

export class TabPage extends Control {
    _content: ComboControl;
    constructor(private _id: string, private _title: string) {
        super();
        this.className = "tab-page";
    }

    get id(): string {
        return this._id;
    }

    get content(): Control {
        return this._content;
    }

    get title(): string {
        return this._title;
    }

    setActive(): TabPage {
        this.className = this.className + " active";
        return this;
    }

    setContent(ele: ComboControl): TabPage {
        this._content = ele;
        return this;
    }
}

export class TabHeader extends Control {
    targetId: string = "";
    constructor(targetId?: string) {
        super();
        this.className = "tab";
        this.targetId = targetId;
    }

    setTargetId(value: string): void {
        this.targetId = value;
    }

    setActive(): TabHeader {
        this.className = this.className + " active";
        return this;
    }
}


export class ComboControl extends Control {
    constructor(type: string) {
        super();
        this.className = "controls";
        this.styleObj = {
            type: type, // store this controls container's css class.
            width: null,
            height: null
        };
        this.children = [];
        this.styleObj.minWidth = null;
        this.styleObj.minHeight = null;
    }

    addChild(childControl: Control): ComboControl {
        this.children.push(childControl);
        return this;
    }

    set MinHeight(value: number) {
        this.styleObj.minHeight = value;
    }

    set MinWidth(value: number) {
        this.styleObj.minWidth = value;
    }
}

export class MetaControl extends Control {
    protected _dataObj: any;
    constructor(type: "button" | "textbox" | "dropdown" | "radio" | "checkbox" | "plaintext" | "range") {
        super();
        this.styleObj = {
            type: type,
            width: null,
            height: null
        };
        this.className = "default";
        this.dataSource = new Object();
        this.dataSource.click = () => { };
        this.dataSource.input = null;
        this.styleObj.left = 2;
        this.styleObj.top = 0;
    }

    set OnClick(value: Function) {
        this.dataSource.click = value;
        // console.log(JSON.stringify(this.dataSource));
    }

    set OnInput(value: Function) {
        this.dataSource.input = value;
    }

    set Class(value: string) {
        this.className = value;
    }

    get Class() {
        return this.className;
    }

    set Text(value: any) {
        this.dataSource.text = value;
    }

    get Text(): any {
        return this.dataSource.text;
    }

    set Title(value: string) {
        this.dataSource.title = value;
    }

    get Title() {
        return this.dataSource.title;
    }

    set Name(value: string) {
        this.dataSource.name = value;
    }

    get Name() {
        return this.dataSource.name;
    }

    set Left(value: number) {
        this.styleObj.left = value;
    }

    get Left() {
        return this.styleObj.left;
    }

    set Top(value: number) {
        this.styleObj.top = value;
    }

    get Top() {
        return this.styleObj.top;
    }

    set Width(value: number) {
        this.styleObj.width = value;
    }

    get Width() {
        return this.styleObj.width;
    }

    set ReadOnly(value: boolean) {
        this.styleObj.readonly = value;
    }

    get ReadOnly() {
        return this.styleObj.readonly;
    }

    set Disable(value: boolean) {
        this.styleObj.disable = value;
    }

    get Disable() {
        return this.styleObj.disable;
    }

    set Data(value: any) {
        this._dataObj = value;
    }

    get Data() {
        return this._dataObj;
    }
}

export class URange extends MetaControl {
    constructor() {
        super("range");
        this.dataSource.min = 0;
        this.dataSource.max = 100;
    }

    get MinValue() {
        return this.dataSource.min;
    }

    set MinValue(value: number) {
        this.dataSource.min = value;
    }

    get MaxValue() {
        return this.dataSource.max;
    }

    set MaxValue(value: number) {
        this.dataSource.max = value;
    }
}

export class DropDown extends MetaControl {
    constructor() {
        super("dropdown");
        this.dataSource.items = new Array<DropDownItem>();
        this.dataSource.selectedItem = null;
        this.styleObj.dropdown = false;
        this.dataSource.click = () => {
            this.styleObj.dropdown = !this.styleObj.dropdown;
        };
        this.dataSource.select = (item) => {
            if (this.dataSource.selectedItem !== item) {
                this.dataSource.selectedItem = item;
                if (this.dataSource.selectchange) {
                    this.dataSource.selectchange(item);
                }
            }
            this.styleObj.dropdown = false;

        };
    }

    addItem(item: DropDownItem) {
        this.dataSource.items.push(item);
        this.dataSource.selectedItem = this.dataSource.items[0];
    }

    set SelectedItem(value: DropDownItem) {
        this.dataSource.selectedItem = value;
    }

    get SelectedItem(): DropDownItem {
        return this.dataSource.selectedItem;
    }

    get Items(): DropDownItem[] {
        return this.dataSource.items;
    }

    set SelectChange(value: Function) {
        this.dataSource.selectchange = value;
    }
}

export interface DropDownItem {
    Text: string;
    Value: any;
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

    setClassName(className: string): void {
        this.className = className;
    }

    onClick(cb: Function) {
        this.dataSource.events["click"] = cb;
    }
}


export interface SpreadViewerConfig {
    width: number;
    height: number;
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
    private _width: number;
    private _height: number;

    constructor(private priceServ: PriceService) {
        this._echart = new EChart();
    }

    init(): void {
        this._echart.init();
    }

    hidden(): void {
        this._echart.setClassName("hidden");
    }

    show(): void {
        this._echart.setClassName("");
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
        // this._width = config.width;
        // this._height = config.height;
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

    // get width(){
    //   return this._width;
    // }

    // get height(){
    //   return this._height;
    // }

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


export class DataTable extends Control {
    public columns: DataTableColumn[] = [];
    public rows: DataTableRow[] = [];
    private _cellclick: Function;
    private _rowclick: Function;

    constructor(type: "table" | "table2" = "table") {
        super();
        this.className = "table";
        this.dataSource = {
            headerColumnCount: 0,
            columns: null,
            rows: null,
            bRowIndex: true,
            detectChanges: null,
            cellpadding: null
        };
        this.styleObj = { type: type, width: null, height: null };
    }

    newRow(): DataTableRow {
        let row = new DataTableRow(this.columns.length);
        row.OnCellClick = this._cellclick;
        row.OnRowClick = this._rowclick;
        this.rows.push(row);
        this.dataSource.rows = this.rows;
        return row;
    }

    set RowIndex(value: boolean) {
        this.dataSource.bRowIndex = value;
    }

    addColumn(...columns: string[]): DataTable {
        columns.forEach(item => {
            this.columns.push(new DataTableColumn(item));
            this.rows.forEach(item => item.insertCell(new DataTableRowCell(), this.columns.length));
        });
        this.dataSource.columns = this.columns;
        return this;
    }

    /**
     * insert a column to specified index.
     * @param column columnHeader string
     * @param index  insert before index (note: zero-based location)
     */
    insertColumn(column: string, index: number): DataTable {
        this.columns.splice(index, 0, new DataTableColumn(column));
        this.rows.forEach(item => item.insertCell(new DataTableRowCell(), index));
        return this;
    }

    set OnCellClick(value: Function) {
        this._cellclick = value;
        this.rows.forEach(item => {
            item.OnCellClick = value;
        });
    }

    set OnRowClick(value: Function) {
        this._rowclick = value;
        this.rows.forEach(item => {
            item.OnRowClick = value;
        });
    }

    set cellPadding(value: number) {
        this.dataSource.cellpadding = value;
    }

    detectChanges(): void {
        this.dataSource.detectChanges();
    }
}

export class DataTableRow extends Control {
    cells: DataTableRowCell[] = [];
    private parent: DataTable;
    private bHidden: boolean;
    private bgcolor: string;
    constructor(private columns: number) {
        super();
        this.bHidden = false;
        this.dataSource = {
            cellclick: () => { },
            rowclick: () => { }
        };

        for (let i = 0; i < columns; ++i) {
            this.cells.push(new DataTableRowCell());
            this.cells[i].OnClick = (cellIndex, rowIndex) => {
                if (this.dataSource.cellclick) {
                    this.dataSource.cellclick(this.cells[cellIndex], cellIndex, rowIndex);
                }
                if (this.dataSource.rowclick) {
                    this.dataSource.rowclick(this, rowIndex);
                }
            };
        }
    }

    insertCell(cell: DataTableRowCell, index: number): void {
        this.cells.splice(index, 0, new DataTableRowCell());
        this.cells[index].OnClick = (cellIndex, rowIndex) => {
            if (this.dataSource.cellclick) {
                this.dataSource.cellclick(this.cells[cellIndex], cellIndex, rowIndex);
            }
            if (this.dataSource.rowclick) {
                this.dataSource.rowclick(this, rowIndex);
            }
        };
    }

    set OnCellClick(value: Function) {
        this.dataSource.cellclick = value;
    }

    set OnRowClick(value: Function) {
        this.dataSource.rowclick = value;
    }

    set hidden(value: boolean) {
        this.bHidden = value;
    }

    set backgroundColor(value: string) {
        this.bgcolor = value;
    }
}

export class DataTableRowCell extends MetaControl {
    constructor(type: "textbox" | "button" | "plaintext" | "checkbox" = "plaintext") {
        super(type);
    }

    set Type(value: string) {
        this.styleObj.type = value;
    }

    get Type() {
        return this.styleObj.type;
    }
}

export class DataTableColumn {
    private bHidden: boolean = false;
    constructor(private columnHeader: string) {
    }

    set hidden(value: boolean) {
        this.bHidden = value;
    }

    get hidden(){
        return this.bHidden;
    }

    get Name() {
        return this.columnHeader;
    }
}

export class Dialog {
    public content: ComboControl;
    private bshow: boolean;
    private title: string;
    private static _instance: Dialog;
    private width: number;
    private height: number;

    private constructor() {
        this.bshow = false;
    }

    private static get instance() {
        return Dialog._instance || (Dialog._instance = new Dialog());
    }

    show(): void {
        this.bshow = true;
    }

    hide(): void {
        this.bshow = false;
    }

    static popup(owner: any, content: ComboControl, option: DialogOption): void {
        Dialog.instance.content = content;
        Dialog.instance.title = option.title;
        Dialog.instance.width = option.width;
        Dialog.instance.height = option.height;
        owner.dialog = Dialog.instance;
        Dialog.instance.show();
    }

    static close(): void {
        Dialog.instance.hide();
    }
}

export interface DialogOption {
    title: string;
    width?: number;
    height?: number;
}

export class StatusBar {
    items: StatusBarItem[];
    constructor() {
        this.items = [];
    }
}

export class StatusBarItem {
    text: string = "";
    section: "left" | "right" = "right";
    click: Function = () => { };
    color: "white" | "red" | "green" = "white";
    data: any;
    width: number;

    constructor(text: string) {
        this.text = text;
    }
}