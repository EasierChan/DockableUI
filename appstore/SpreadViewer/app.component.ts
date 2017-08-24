/**
 * created by cl, 2017/05/09
 * update: [date]
 * desc:
 */
"use strict";

import { Component, OnInit, ChangeDetectorRef, OnDestroy } from "@angular/core";
import {
    Control, ComboControl, MetaControl, SpreadViewer, SpreadViewerConfig,
    VBox, HBox, TextBox, Button, DockContainer, ChartViewer
} from "../../base/controls/control";
import { IP20Service } from "../../base/api/services/ip20.service";
import { AppStateCheckerRef, SecuMasterService, TranslateService, MessageBox, File } from "../../base/api/services/backend.service";
import * as echarts from "echarts";

@Component({
    moduleId: module.id,
    selector: "body",
    template: `
        <dock-control [className]="main.className" [children]="main.children" [styleObj]="main.styleObj" [dataSource]="main.dataSource">
        </dock-control>
    `,
    providers: [
        IP20Service,
        AppStateCheckerRef,
        SecuMasterService,
        TranslateService
    ]
})
export class AppComponent2 implements OnInit {
    private readonly apptype = "spreadviewer";
    private languageType = 0;
    main: any;
    option: any;

    constructor(private tgw: IP20Service, private state: AppStateCheckerRef, private secuinfo: SecuMasterService, private langServ: TranslateService) {
        this.state.onInit(this, this.onReady);
    }

    onReady(option: any) {
        this.option = option;
        this.tgw.connect(this.option.port, this.option.host);
        let language = this.option.lang;
        switch (language) {
            case "zh-cn":
                this.languageType = 1;
                break;
            case "en-us":
                this.languageType = 0;
                break;
            default:
                this.languageType = 0;
                break;
        }

        this.loginTGW();
    }

    loginTGW() {
        let timestamp: Date = new Date();
        let stimestamp = timestamp.getFullYear() + ("0" + (timestamp.getMonth() + 1)).slice(-2) +
            ("0" + timestamp.getDate()).slice(-2) + ("0" + timestamp.getHours()).slice(-2) + ("0" + timestamp.getMinutes()).slice(-2) +
            ("0" + timestamp.getSeconds()).slice(-2) + ("0" + timestamp.getMilliseconds()).slice(-2);
        let loginObj = { "cellid": "1", "userid": "8.999", "password": "*32C5A4C0E3733FA7CC2555663E6DB6A5A6FB7F0EDECAC9704A503124C34AA88B", "termid": "12.345", "conlvl": 1, "clientesn": "", "clienttm": stimestamp };
        this.tgw.addSlot({
            appid: 17,
            packid: 43,
            callback: msg => {
                console.info(`tgw ans=>${msg}`);
                // this.tgw.send(17, 101, { topic: 3112, kwlist: [2163460] });
            }
        });
        this.tgw.addSlot({
            appid: 17,
            packid: 120,
            callback: msg => {
                console.info(msg);
            }
        });
        this.tgw.send(17, 41, loginObj);
    }

    ngOnInit() {
        let res = this.secuinfo.getSecuinfoByCode(this.option.details.code1, this.option.details.code2);

        let spreadviewerContent = new VBox();
        let svHeaderRow1 = new HBox();
        let txt_code1 = new TextBox();
        txt_code1.Text = this.option.details.code1;
        let code1Rtn = this.langServ.getTranslateInfo(this.languageType, "Code1");
        if (this.languageType === 0)
            txt_code1.Title = code1Rtn + ":";
        else
            txt_code1.Title = "　" + code1Rtn + ":";
        txt_code1.Left = 100;
        txt_code1.Width = 80;
        txt_code1.ReadOnly = true;
        svHeaderRow1.addChild(txt_code1);
        let txt_code2 = new TextBox();
        txt_code2.Text = this.option.details.code2;
        let code2Rtn = this.langServ.getTranslateInfo(this.languageType, "Code2");
        if (this.languageType === 0)
            txt_code2.Title = code2Rtn + ":";
        else
            txt_code2.Title = "　" + code2Rtn + ":";
        txt_code2.Left = 10;
        txt_code2.Width = 80;
        txt_code2.ReadOnly = true;
        svHeaderRow1.addChild(txt_code2);
        let txt_coeff = new TextBox();
        txt_coeff.Text = "";
        let coeffRtn = this.langServ.getTranslateInfo(this.languageType, "Coeff");
        if (0 === this.languageType)
            txt_coeff.Title = coeffRtn + ":";
        else
            txt_coeff.Title = "　　" + coeffRtn + ":";
        txt_coeff.Left = 10;
        txt_coeff.Width = 80;
        svHeaderRow1.addChild(txt_coeff);
        let btn_init = new Button();
        btn_init.Class = "primary";
        let initRtn = this.langServ.getTranslateInfo(this.languageType, "Initialize");
        btn_init.Text = initRtn + "";
        btn_init.Left = 10;
        svHeaderRow1.addChild(btn_init);

        let svHeaderRow2 = new HBox();
        let txt_min = new TextBox();
        txt_min.Text = "";
        let minRtn = this.langServ.getTranslateInfo(this.languageType, "Min");
        if (0 === this.languageType)
            txt_min.Title = "  " + minRtn + ":";
        else
            txt_min.Title = minRtn + ":";
        txt_min.Left = 100;
        txt_min.Width = 80;
        txt_min.Disable = true;
        svHeaderRow2.addChild(txt_min);
        let txt_max = new TextBox();
        txt_max.Text = "";
        let maxRtn = this.langServ.getTranslateInfo(this.languageType, "Max");
        if (0 === this.languageType)
            txt_max.Title = "  " + maxRtn + ":";
        else
            txt_max.Title = maxRtn + ":";
        txt_max.Left = 10;
        txt_max.Width = 80;
        txt_max.Disable = true;
        svHeaderRow2.addChild(txt_max);
        let txt_tick = new TextBox();
        txt_tick.Text = "";
        let tickRtn = this.langServ.getTranslateInfo(this.languageType, "Tick");
        if (0 === this.languageType)
            txt_tick.Title = " " + tickRtn + ":";
        else
            txt_tick.Title = tickRtn + ":";
        txt_tick.Left = 10;
        txt_tick.Width = 80;
        txt_tick.Disable = true;
        svHeaderRow2.addChild(txt_tick);
        let btn_dayview = new Button();
        btn_dayview.Class = "primary";
        let changeRtn = this.langServ.getTranslateInfo(this.languageType, "Change");
        btn_dayview.Text = changeRtn + "　";
        btn_dayview.Left = 10;
        btn_dayview.Disable = true;
        svHeaderRow2.addChild(btn_dayview);

        spreadviewerContent.addChild(svHeaderRow1);
        spreadviewerContent.addChild(svHeaderRow2);
        let chart = new SpreadViewer();
        chart.show();

        // let names = [];
        // names.push(this.option.details.code1 + ".askPrice1-" + this.option.details.code2 + ".bidPrice1");
        // names.push(this.option.details.code1 + ".bidPrice1-" + this.option.details.code2 + ".askPrice1");
        // let chart = this.createChart(names);
        spreadviewerContent.addChild(chart.ControlRef);

        btn_init.OnClick = () => {
            chart.setConfig({
                symbolCode1: this.option.details.code1,
                innerCode1: parseInt(res[this.option.details.code1].ukey),
                coeff1: parseFloat(txt_coeff.Text),
                symbolCode2: this.option.details.code2,
                innerCode2: parseInt(res[this.option.details.code2].ukey),
                coeff2: parseFloat(txt_coeff.Text),
                durations: [{
                    start: {
                        hour: 9,
                        minute: 0
                    },
                    end: {
                        hour: 11,
                        minute: 30
                    }
                }, {
                    start: {
                        hour: 13,
                        minute: 0
                    },
                    end: {
                        hour: 15,
                        minute: 30
                    }
                }, {
                    start: {
                        hour: 20,
                        minute: 0
                    },
                    end: {
                        hour: 24,
                        minute: 0
                    }
                }],
                multiplier: 1,
                marketdataType1: "MARKETDATA",
                marketdataType2: "MARKETDATA"
            });

            if (spreadviewerContent.childrenLen === 2) {
                spreadviewerContent.addChild(chart.ControlRef);
                chart.show();
            }

            setTimeout(() => {
                chart.init();
                chart.start();
                txt_max.Disable = txt_min.Disable = txt_tick.Disable = btn_dayview.Disable = false;
                this.tgw.send(17, 101, { topic: 3112, kwlist: [parseInt(res[this.option.details.code1].ukey), parseInt(res[this.option.details.code2].ukey)] });
            }, 100);

            // chart.init();
            // this.tgw.send(17, 101, { topic: 3112, kwlist: [parseInt(res[this.option.details.code1].ukey), parseInt(res[this.option.details.code2].ukey)] });
            // this.coeff = parseFloat(txt_coeff.Text);
        };

        btn_dayview.OnClick = () => {
            let yaxis: any = {};
            if (txt_min.Text.length > 0) yaxis.min = parseFloat(txt_min.Text);
            if (txt_max.Text.length > 0) yaxis.max = parseFloat(txt_max.Text);
            if (txt_tick.Text.length > 0) yaxis.interval = parseFloat(txt_tick.Text);
            chart.setEChartOption({ yAxis: yaxis });
            yaxis = null;
        };

        this.main = spreadviewerContent;

        this.tgw.addSlot({
            appid: 17,
            packid: 110,
            callback: (msg) => {
                let time = new Date(msg.content.time * 1000);
                let stime = ("0" + time.getHours()).slice(-2) + ("0" + time.getMinutes()).slice(-2) + ("0" + time.getSeconds()).slice(-2);

                if (!msg.content.ukey || !chart.hasInstrumentID(msg.content.ukey)) {
                    console.warn(`unvalid ukey => ${msg.content.ukey}`);
                    return;
                }

                chart.setMarketData({ ukey: msg.content.ukey, Time: parseInt(stime), AskPrice: msg.content.ask_price[0], BidPrice: msg.content.bid_price[0] });
            }
        });
    }
}

/**
 * date 2017/07/24
 * author: cl
 * desc: to draw the lines with EchartDirective 
 */
@Component({
    moduleId: module.id,
    selector: "body",
    templateUrl: "spreadviewer.html",
    styleUrls: ["spreadview.css"],
    providers: [
        IP20Service,
        AppStateCheckerRef,
        SecuMasterService
    ]
})
export class AppComponent implements OnInit, OnDestroy {
    private readonly apptype = "spreadviewer";
    option: any;
    languageType = 0;
    spreadviewer: USpreadViewer;
    codes: string[];
    lines: any[];
    name: string;
    yAxisOption: any;
    rangeType: number;
    interval: any;
    groupMDWorker: Worker;
    groupUKeys: number[];
    quoteHeart: any = null;

    constructor(private quote: IP20Service, private state: AppStateCheckerRef,
        private secuinfo: SecuMasterService, private ref: ChangeDetectorRef) {
        this.state.onInit(this, this.onReady);
    }

    onReady(option: any) {
        this.option = option;
        this.quote.connect(this.option.port, this.option.host);
        let language = this.option.lang;
        switch (language) {
            case "zh-cn":
                this.languageType = 1;
                break;
            case "en-us":
                this.languageType = 0;
                break;
            default:
                this.languageType = 0;
                break;
        }
    }

    loginTGW(afterLogin?: Function) {
        let timestamp: Date = new Date();
        let stimestamp = timestamp.getFullYear() + ("0" + (timestamp.getMonth() + 1)).slice(-2) +
            ("0" + timestamp.getDate()).slice(-2) + ("0" + timestamp.getHours()).slice(-2) + ("0" + timestamp.getMinutes()).slice(-2) +
            ("0" + timestamp.getSeconds()).slice(-2) + ("0" + timestamp.getMilliseconds()).slice(-2);
        let loginObj = { "cellid": "1", "userid": "8.999", "password": "88888", "termid": "12.345", "conlvl": 2, "clienttm": stimestamp };
        this.quote.addSlot(
            {
                appid: 17,
                packid: 43,
                callback: msg => {
                    console.info(`quote ans=>${msg}`);
                    if (afterLogin)
                        afterLogin.call(this);

                    if (this.quoteHeart !== null) {
                        clearInterval(this.quoteHeart);
                        this.quoteHeart = null;
                    }

                    this.quoteHeart = setInterval(() => {
                        this.quote.send(17, 0, {});
                    }, 60000);
                }
            }, {
                appid: 17,
                packid: 120,
                callback: msg => {
                    console.info(msg);
                }
            });

        this.quote.send(17, 41, loginObj);
    }

    ngOnInit() {
        if (this.option) {
            this.codes = this.option.codes || ["", ""];
            this.lines = this.option.lines || [{ coeffs: [1, 1], levels: [1, -1], offsets: [0, 0] }, { coeffs: [1, 1], levels: [-1, 1], offsets: [0, 0] }];
            this.name = this.option.name || "";
        } else {
            this.codes = ["", ""];
            this.lines = [{ coeffs: [1, 1], levels: [1, -1], offsets: [0, 0] }, { coeffs: [1, 1], levels: [-1, 1], offsets: [0, 0] }];
            this.name = "";
        }

        this.yAxisOption = { min: null, max: null, step: null };
        this.rangeType = 1;
        this.groupUKeys = [];
        this.loginTGW(null);
        this.registerListeners();
    }

    registerListeners() {
        let self = this;

        this.groupMDWorker = new Worker("groupMDWorker.js");
        this.groupMDWorker.onmessage = (ev: MessageEvent) => {
            switch (ev.data.type) {
                case "group-md":
                    if (this.spreadviewer)
                        self.spreadviewer.addMDData(ev.data.value);
                    break;
                default:
                    break;
            }
        };

        this.quote.addSlot({
            appid: 17,
            packid: 110,
            callback: (msg) => {
                if (self.spreadviewer) {
                    if (this.groupUKeys.includes(msg.content.ukey)) {
                        this.groupMDWorker.postMessage({ type: "add-md", value: msg.content });
                    } else {
                        self.spreadviewer.addMDData(msg.content);
                    }
                }
            }
        });
    }

    calcSpread() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }

        if (this.spreadviewer) {
            this.spreadviewer.dispose();
            this.spreadviewer = null;
            this.ref.detectChanges();
            this.quote.send(17, 101, { topic: 3112, kwlist: [] });
            this.groupUKeys = [];
        }

        if (this.codes[0].length < 1 || this.codes[1].length < 1) {
            alert("请输入代码!");
            return;
        }

        if (this.codes[0].endsWith(".csv") || this.codes[1].endsWith(".csv")) {
            let nickCodes = [this.codes[0], this.codes[1]];
            let ukeys = [0, 0];
            let res;

            let group1 = {};
            let ok1 = true;
            if (this.codes[0].endsWith(".csv")) {
                ok1 = false;
                File.readLineByLine(this.codes[0], (linestr: string) => {
                    linestr.trim();
                    let fields = linestr.split(",");
                    group1[fields[0]] = { count: fields[1] };
                }, () => {
                    nickCodes[0] = "组合1";
                    ukeys[0] = 1;
                    this.secuinfo.getSecuinfoByWindCodes(Object.getOwnPropertyNames(group1)).forEach(item => {
                        group1[item.windCode].ukey = item.ukey;
                        this.groupUKeys.push(item.ukey);
                    });
                    ok1 = true;
                });
            } else {
                res = this.secuinfo.getSecuinfoByCode(this.codes[0]);
                ukeys[0] = parseInt(res[this.codes[0]].ukey);
            }

            let group2 = {};
            let ok2 = true;
            if (this.codes[1].endsWith(".csv")) {
                ok2 = false;
                File.readLineByLine(this.codes[1], (linestr: string) => {
                    linestr.trim();
                    let fields = linestr.split(",");
                    group2[fields[0]] = { count: fields[1] };
                }, () => {
                    nickCodes[1] = "组合2";
                    ukeys[1] = 2;
                    this.secuinfo.getSecuinfoByWindCodes(Object.getOwnPropertyNames(group2)).forEach(item => {
                        group2[item.windCode].ukey = item.ukey;
                        this.groupUKeys.push(item.ukey);
                    });
                    ok2 = true;
                });
            } else {
                res = this.secuinfo.getSecuinfoByCode(this.codes[1]);
                ukeys[1] = parseInt(res[this.codes[1]].ukey);
            }

            this.interval = setInterval(() => {
                if (ok1 && ok2) {
                    clearInterval(this.interval);
                    this.interval = null;

                    let groups = [];
                    if (nickCodes[0] !== this.codes[0]) {
                        groups.push({ ukey: 1, items: group1 });
                    }

                    if (nickCodes[1] !== this.codes[1]) {
                        groups.push({ ukey: 2, items: group2 });
                    }

                    this.groupMDWorker.postMessage({ type: "init", groups: groups });

                    this.lines.forEach(line => {
                        for (let i = 0; i < this.lines.length; ++i) {
                            line.coeffs[i] = parseFloat(line.coeffs[i]);
                            line.levels[i] = parseFloat(line.levels[i]);
                            line.offsets[i] = parseFloat(line.offsets[i]);
                        }
                    });

                    this.spreadviewer = new USpreadViewer(nickCodes, ukeys, this.lines);

                    let kwlist = [];
                    kwlist = kwlist.concat(this.groupUKeys);
                    ukeys.forEach(ukey => {
                        if (ukey > 2)
                            kwlist.push(ukey);
                    });

                    console.info(kwlist);
                    this.quote.send(17, 101, { topic: 3112, kwlist: kwlist });

                    kwlist = null;
                    groups = null;
                }
            }, 100);
        } else {
            let res: Object = this.secuinfo.getSecuinfoByCode(this.codes[0], this.codes[1]);

            if (Object.getOwnPropertyNames(res).length < this.codes.length) {
                alert("未找到对应代码!");
                return;
            }

            this.lines.forEach(line => {
                for (let i = 0; i < this.lines.length; ++i) {
                    line.coeffs[i] = parseFloat(line.coeffs[i]);
                    line.levels[i] = parseFloat(line.levels[i]);
                    line.offsets[i] = parseFloat(line.offsets[i]);
                }
            });

            let ukeys = [parseInt(res[this.codes[0]].ukey), parseInt(res[this.codes[1]].ukey)];
            this.spreadviewer = new USpreadViewer(this.codes, ukeys, this.lines);
            this.quote.send(17, 101, { topic: 3112, kwlist: ukeys });
            res = null;
        }
    }

    save() {
        if (this.name.length < 1)
            return;

        this.state.saveAs(this, this.name, { codes: this.codes, lines: this.lines, name: this.name });
    }

    openFile(idx: number) {
        MessageBox.openFileDialog("选择文件", (filenames: string[]) => {
            this.codes[idx] = filenames[0];
        }, [{ name: "股票组合(csv文件)", extensions: ["csv"] }]);
    }

    changeChartOption(type: number) {
        if (this.spreadviewer) {
            switch (type) {
                case 0:
                    this.spreadviewer.changeYAxisInterval(parseFloat(this.yAxisOption.min), parseFloat(this.yAxisOption.max), parseFloat(this.yAxisOption.step));
                    break;
                case 1:
                    this.spreadviewer.changeYAxisInterval(null, null, null);
                    break;
                case 2:
                    this.spreadviewer.changeXAxisRange(1); // ten min seconds;
                    this.rangeType = 1;
                    break;
                case 3:
                    this.spreadviewer.changeXAxisRange(2); // an hour seconds;
                    this.rangeType = 2;
                    break;
                case 4:
                    this.spreadviewer.changeXAxisRange(3); // one day
                    this.rangeType = 3;
                    break;
                default:
                    break;
            }
        }
    }

    ngOnDestroy() {
        this.spreadviewer.dispose();

        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }

        if (this.groupMDWorker) {
            this.groupMDWorker.terminate();
        }
    }
}

export class USpreadViewer {
    initPadding; // unit is seconds
    padding = 60;
    ukeys: number[];
    codes: string[];
    lines: any[];
    durations: number[][];
    spreadChart: any = {};
    timeLineChart: any = {};
    hoursOfDay: number;
    worker: Worker;
    msgs: any;
    lastIdx: any;
    interval: any;
    dataOption: any;

    clockPoint: AxisPoint;
    dataPoint: AxisPoint;
    maxPoint: AxisPoint;
    minPoint: AxisPoint;

    static readonly YUAN_PER_UNIT = 10000;

    constructor(codes: string[], ukeys: number[], lines: any[], initPadding = 300) {
        this.ukeys = ukeys;
        this.codes = codes;
        this.lines = lines;
        this.initPadding = initPadding;

        let names = [`${this.codes[0]}.${this.lines[0].levels[0] === 1 ? "ask" : "bid"}_price[0] - ${this.lines[0].coeffs[1]}x${this.codes[1]}.${this.lines[0].levels[1] === 1 ? "ask" : "bid"}_price[0]`,
        `${this.codes[0]}.${this.lines[1].levels[0] === 1 ? "ask" : "bid"}_price[0] - ${this.lines[1].coeffs[1]}x${this.codes[1]}.${this.lines[1].levels[1] === 1 ? "ask" : "bid"}_price[0]`,
        this.codes[0], this.codes[1]];
        this.spreadChart.chartOption = this.createLinesChart(names);
        this.durations = [[21, 0, 2, 30], [9, 0, 11, 30], [13, 0, 15, 30]];
        this.hoursOfDay = 0;
        this.durations.forEach(duration => {
            this.hoursOfDay += (duration[2] + 24 - duration[0]) % 24 + (duration[3] - duration[1]) / 60;
        });

        this.lastIdx = {};
        this.lastIdx[this.ukeys[0]] = -1;
        this.lastIdx[this.ukeys[1]] = -1;
        this.interval = { inst: null, value: 1000 };
        this.msgs = {};
        this.clockPoint = new AxisPoint();
        this.dataPoint = new AxisPoint();
        this.maxPoint = new AxisPoint();
        this.minPoint = new AxisPoint();
    }

    onChartInit(chart: echarts.ECharts, type: number) {
        switch (type) {
            case 0:
                this.spreadChart.instance = chart;
                break;
            case 1:
                this.timeLineChart.instance = chart;
                break;
        }

        // this.worker = new Worker("spreadWorker.js");
        // this.worker.postMessage({ type: "init", legs: this.ukeys, offset: [offset] });
        this.dataOption = { series: this.spreadChart.chartOption.series, xAxis: this.spreadChart.chartOption.xAxis, dataZoom: this.spreadChart.chartOption.dataZoom };

        this.interval.inst = setInterval(() => {
            while (true) {
                if (this.lastIdx[this.ukeys[0]] === -1 || this.lastIdx[this.ukeys[1]] === -1)
                    break;

                if (this.clockPoint.time > Math.min(this.lastIdx[this.ukeys[0]], this.lastIdx[this.ukeys[1]]))
                    break;

                console.warn(this.clockPoint.time, this.lastIdx[this.ukeys[0]], this.lastIdx[this.ukeys[1]]);
                try {
                    this.dataOption.series[0].data[this.clockPoint.index] =
                        (this.lines[0].coeffs[0] * this.msgs[this.ukeys[0]][this.clockPoint.time][this.lines[0].levels[0] === 1 ? "askPrice1" : "bidPrice1"] + this.lines[0].offsets[0] - this.lines[0].offsets[1] -
                            this.lines[0].coeffs[1] * this.msgs[this.ukeys[1]][this.clockPoint.time][this.lines[0].levels[1] === 1 ? "askPrice1" : "bidPrice1"]).toFixed(2); // tslint:disable-line
                    this.dataOption.series[1].data[this.clockPoint.index] =
                        (this.lines[1].coeffs[0] * this.msgs[this.ukeys[0]][this.clockPoint.time][this.lines[1].levels[0] === 1 ? "askPrice1" : "bidPrice1"] + this.lines[1].offsets[0] - this.lines[1].offsets[1] -
                            this.lines[1].coeffs[1] * this.msgs[this.ukeys[1]][this.clockPoint.time][this.lines[1].levels[1] === 1 ? "askPrice1" : "bidPrice1"]).toFixed(2); // tslint:disable-line
                    this.dataOption.series[2].data[this.clockPoint.index] = this.msgs[this.ukeys[0]][this.clockPoint.time].bidPrice1; // tslint:disable-line
                    this.dataOption.series[3].data[this.clockPoint.index] = this.msgs[this.ukeys[1]][this.clockPoint.time].bidPrice1; // tslint:disable-line
                    this.clockPoint.time = this.increaseTime(this.clockPoint);
                    ++this.clockPoint.index;

                    if (this.clockPoint.time > this.maxPoint.time - this.padding) {
                        let count = this.initPadding;

                        while (--count) {
                            this.maxPoint.time = this.increaseTime(this.maxPoint);
                            this.dataOption.series.forEach(serie => {
                                serie.data.push(null);
                            });

                            let date;
                            let ymdhms;

                            this.dataOption.xAxis.forEach(axis => {
                                date = new Date(this.maxPoint.time * 1000);
                                ymdhms = [date.getFullYear(), ("0" + (date.getMonth() + 1)).slice(-2), ("0" + date.getDate()).slice(-2)].join("/")
                                    + " " + [("0" + date.getHours()).slice(-2), ("0" + date.getMinutes()).slice(-2), ("0" + date.getSeconds()).slice(-2)].join(":");
                                axis.data.push(ymdhms);
                            });

                            ymdhms = null;
                            date = null;
                        }
                    }
                } catch (e) {
                    console.error(`Exception: ${e};`, this.msgs, this.clockPoint.time, this.lastIdx);
                }
            }

            this.spreadChart.instance.setOption(this.dataOption);
        }, this.interval.value);
    }

    addMDData(mdItem: any) {
        console.info(mdItem.time, mdItem.ukey);
        // this.worker.postMessage({ type: "add", ukey: mdItem.ukey, value: mdItem });
        let curDuration = this.getDuration(mdItem.time);
        if (curDuration === -1) {
            console.error(`msg time: ${new Date(mdItem.time * 1000).toLocaleString()} is not valid.`);
            return;
        }

        if (!this.msgs[mdItem.ukey])
            this.msgs[mdItem.ukey] = {};

        if (!this.msgs[mdItem.ukey][mdItem.time])
            this.msgs[mdItem.ukey][mdItem.time] = {};

        this.msgs[mdItem.ukey][mdItem.time].askPrice1 = mdItem.ask_price[0] / USpreadViewer.YUAN_PER_UNIT;
        this.msgs[mdItem.ukey][mdItem.time].bidPrice1 = mdItem.bid_price[0] / USpreadViewer.YUAN_PER_UNIT;

        if (this.lastIdx[this.ukeys[0]] !== -1 && this.lastIdx[this.ukeys[1]] !== -1) {

            if (mdItem.time > this.dataPoint.time) {
                while (mdItem.time > this.dataPoint.time) {
                    let nextTime = this.increaseTime(this.dataPoint);

                    if (nextTime < mdItem.time) {
                        if (!this.msgs[this.ukeys[0]].hasOwnProperty(nextTime)) {
                            this.msgs[this.ukeys[0]][nextTime] = {};
                            Object.assign(this.msgs[this.ukeys[0]][nextTime], this.msgs[this.ukeys[0]][this.dataPoint.time]);
                        }

                        if (!this.msgs[this.ukeys[1]].hasOwnProperty(nextTime)) {
                            this.msgs[this.ukeys[1]][nextTime] = {};
                            Object.assign(this.msgs[this.ukeys[1]][nextTime], this.msgs[this.ukeys[1]][this.dataPoint.time]);
                        }
                    }

                    this.dataPoint.time = nextTime;
                }
            }

            if (mdItem.ukey === this.ukeys[0] && mdItem.time > this.lastIdx[this.ukeys[1]]) {
                if (!this.msgs[this.ukeys[1]].hasOwnProperty(mdItem.time))
                    this.msgs[this.ukeys[1]][mdItem.time] = {};

                Object.assign(this.msgs[this.ukeys[1]][mdItem.time], this.msgs[this.ukeys[1]][mdItem.time - 1]);
            }

            if (mdItem.ukey === this.ukeys[1] && mdItem.time > this.lastIdx[this.ukeys[0]]) {
                if (!this.msgs[this.ukeys[0]][mdItem.time])
                    this.msgs[this.ukeys[0]][mdItem.time] = {};

                Object.assign(this.msgs[this.ukeys[0]][mdItem.time], this.msgs[this.ukeys[0]][mdItem.time - 1]);
            }
        } else if (this.lastIdx[this.ukeys[0]] === -1 && this.lastIdx[this.ukeys[1]] === -1) { // first quote data
            // init axises;
            this.lastIdx[mdItem.ukey] = mdItem.time;
            this.dataPoint.duration = curDuration;
            this.dataPoint.time = mdItem.time;
            this.dataPoint.index = this.initPadding - 1;
            this.initOption(mdItem.time);
            this.clockPoint.duration = curDuration;
            this.clockPoint.index = this.initPadding - 1;
            this.clockPoint.time = mdItem.time;
        } else { // only one is -1
            if (this.lastIdx[mdItem.ukey] === -1) { // another leg's data come in.
                if (mdItem.ukey === this.ukeys[0] && mdItem.time !== this.lastIdx[this.ukeys[1]]) {
                    if (mdItem.time > this.lastIdx[this.ukeys[1]]) {
                        this.msgs[this.ukeys[1]][mdItem.time] = {};
                        Object.assign(this.msgs[this.ukeys[1]][mdItem.time], this.msgs[this.ukeys[1]][this.lastIdx[this.ukeys[1]]]);
                        this.moveTo(this.dataPoint, mdItem.time);
                    } else {
                        this.msgs[mdItem.ukey][this.lastIdx[this.ukeys[1]]] = {};
                        Object.assign(this.msgs[mdItem.ukey][this.lastIdx[this.ukeys[1]]], this.msgs[mdItem.ukey][mdItem.time]);
                        this.moveTo(this.dataPoint, this.lastIdx[this.ukeys[1]]);
                    }

                    Object.assign(this.clockPoint, this.dataPoint);
                } else if (mdItem.ukey === this.ukeys[1] && mdItem.time !== this.lastIdx[this.ukeys[0]]) {
                    if (mdItem.time > this.lastIdx[this.ukeys[0]]) {
                        this.msgs[this.ukeys[0]][mdItem.time] = {};
                        Object.assign(this.msgs[this.ukeys[0]][mdItem.time], this.msgs[this.ukeys[0]][this.lastIdx[this.ukeys[0]]]);
                        this.moveTo(this.dataPoint, mdItem.time);
                    } else {
                        this.msgs[mdItem.ukey][this.lastIdx[this.ukeys[0]]] = {};
                        Object.assign(this.msgs[mdItem.ukey][this.lastIdx[this.ukeys[0]]], this.msgs[mdItem.ukey][mdItem.time]);
                        this.moveTo(this.dataPoint, this.lastIdx[this.ukeys[0]]);
                    }

                    Object.assign(this.clockPoint, this.dataPoint);
                }
            } else { // also one leg data;
                ;
            }
        }

        this.lastIdx[mdItem.ukey] = mdItem.time;
    }

    createLinesChart(lines: string[]) {
        return JSON.parse(JSON.stringify({
            title: {
                show: false,
            },
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "cross",
                    label: {
                        show: true, backgroundColor: "rgba(0,0,0,1)",
                        formatter: (params) => {
                            if (typeof params.value === "string") {
                                return params.value;
                            }

                            return params.value.toFixed(2);
                        }
                    }
                }
            },
            axisPointer: {
                link: { xAxisIndex: "all" }
            },
            legend: {
                data: lines,
                textStyle: { color: "#F3F3F5" },
                top: 0,
                left: "10%"
            },
            grid: [{
                show: true,
                top: 30,
                left: "10%",
                right: "8%",
                height: "40%"
            }, {
                show: true,
                left: "10%",
                right: "8%",
                top: "55%",
                height: "40%"
            }],
            xAxis: [{
                data: [],
                axisLabel: {
                    textStyle: { color: "#F3F3F5" }
                },
                interval: 60
            }, {
                gridIndex: 1,
                data: [],
                axisLabel: {
                    textStyle: { color: "#F3F3F5" }
                },
                interval: 60
            }],
            yAxis: [{
                axisLabel: {
                    show: true,
                    textStyle: { color: "#F3F3F5" }
                },
                splitLine: { lineStyle: { color: "#888888" } },
                scale: true,
                boundaryGap: [0.2, 0.2]
            }, {
                gridIndex: 1,
                axisLabel: {
                    show: true,
                    textStyle: { color: "#F3F3F5" }
                },
                splitLine: { lineStyle: { color: "#888888" } },
                splitNumber: 5,
                scale: true,
                boundaryGap: [0.2, 0.2]
            }, {
                gridIndex: 1,
                position: "right",
                axisLabel: {
                    show: true,
                    textStyle: { color: "#F3F3F5" }
                },
                splitLine: { show: false },
                splitNumber: 5,
                scale: true,
                boundaryGap: [0.2, 0.2]
            }],
            series: [{
                name: lines[0],
                type: "line",
                connectNulls: true,
                data: []
            }, {
                name: lines[1],
                type: "line",
                connectNulls: true,
                data: []
            }, {
                xAxisIndex: 1,
                yAxisIndex: 1,
                name: lines[2],
                type: "line",
                connectNulls: true,
                data: []
            }, {
                xAxisIndex: 1,
                yAxisIndex: 2,
                name: lines[3],
                type: "line",
                connectNulls: true,
                data: []
            }],
            dataZoom: {
                type: "inside",
                xAxisIndex: [0, 1]
            }
        }));
    }

    initOption(time) {
        this.minPoint.time = time;
        this.minPoint.duration = this.dataPoint.duration;
        this.maxPoint.time = time;
        this.maxPoint.duration = this.dataPoint.duration;
        let padding = 2 * this.initPadding;
        let date: Date = null;
        let ymdhms;

        while (padding--) {
            date = new Date(this.minPoint.time * 1000);
            ymdhms = [date.getFullYear(), ("0" + (date.getMonth() + 1)).slice(-2), ("0" + date.getDate()).slice(-2)].join("/")
                + " " + [("0" + date.getHours()).slice(-2), ("0" + date.getMinutes()).slice(-2), ("0" + date.getSeconds()).slice(-2)].join(":");
            this.spreadChart.chartOption.xAxis[0].data.unshift(ymdhms);
            this.spreadChart.chartOption.xAxis[1].data.unshift(ymdhms);

            if (date.getMinutes() % 10 === 0 && date.getSeconds() === 0) // integral multiple of 10 min.
                break;

            this.minPoint.time = this.decreaseTime(this.minPoint);
        }

        while (padding--) {
            this.maxPoint.time = this.increaseTime(this.maxPoint);
            date = new Date(this.maxPoint.time * 1000);
            ymdhms = [date.getFullYear(), ("0" + (date.getMonth() + 1)).slice(-2), ("0" + date.getDate()).slice(-2)].join("/")
                + " " + [("0" + date.getHours()).slice(-2), ("0" + date.getMinutes()).slice(-2), ("0" + date.getSeconds()).slice(-2)].join(":");
            this.spreadChart.chartOption.xAxis[0].data.push(ymdhms);
            this.spreadChart.chartOption.xAxis[1].data.push(ymdhms);

            if (date.getMinutes() % 10 === 0 && date.getSeconds() === 0) // integral multiple of 10 min.
                break;
        }

        date = null;
        ymdhms = null;
        this.spreadChart.chartOption.series[0].data.length = this.initPadding * 2;
        this.spreadChart.chartOption.series[1].data.length = this.initPadding * 2;
        this.spreadChart.chartOption.series[2].data.length = this.initPadding * 2;
        this.spreadChart.chartOption.series[3].data.length = this.initPadding * 2;
        if (this.spreadChart.instance)
            (this.spreadChart.instance as echarts.ECharts).setOption(this.spreadChart.chartOption, true);
        else
            setTimeout(() => { (this.spreadChart.instance as echarts.ECharts).setOption(this.spreadChart.chartOption, true); }, 1000);
    }

    changeXAxisRange(type: number = 1) {
        let padding = 0;
        switch (type) {
            case 1:
                padding = 600;
                break;
            case 2:
                padding = 3600;
                break;
            case 3:
                padding = this.hoursOfDay * 3600;
                break;
            default:
                break;
        }

        let date: Date = null;
        let ymdhms;
        this.dataOption.dataZoom.moveOnMouseMove = true;

        if (this.maxPoint.time - this.minPoint.time >= padding) {
            if (type === 3 || this.maxPoint.time - this.minPoint.time === padding) {
                setTimeout(() => {
                    this.spreadChart.instance.dispatchAction({
                        type: "dataZoom",
                        start: 0,
                        end: 100
                    });
                }, 1000);
            } else {
                let leftPoint: AxisPoint = Object.assign({}, this.clockPoint);
                while (padding--) {
                    date = new Date(leftPoint.time * 1000);
                    ymdhms = [date.getFullYear(), ("0" + (date.getMonth() + 1)).slice(-2), ("0" + date.getDate()).slice(-2)].join("/")
                        + " " + [("0" + date.getHours()).slice(-2), ("0" + date.getMinutes()).slice(-2), ("0" + date.getSeconds()).slice(-2)].join(":");

                    if (type === 1 && date.getMinutes() % 10 === 0 && date.getSeconds() === 0) // integral multiple of 10 min.
                        break;

                    if (type === 2 && date.getMinutes() === 0 && date.getSeconds() === 0)
                        break;

                    leftPoint.time = this.decreaseTime(leftPoint);
                }

                let startValue = ymdhms;
                leftPoint = null;

                let rightPoint: AxisPoint = Object.assign({}, this.clockPoint);
                while (padding--) {
                    rightPoint.time = this.increaseTime(rightPoint);
                    date = new Date(rightPoint.time * 1000);
                    ymdhms = [date.getFullYear(), ("0" + (date.getMonth() + 1)).slice(-2), ("0" + date.getDate()).slice(-2)].join("/")
                        + " " + [("0" + date.getHours()).slice(-2), ("0" + date.getMinutes()).slice(-2), ("0" + date.getSeconds()).slice(-2)].join(":");

                    if (type === 1 && date.getMinutes() % 10 === 0 && date.getSeconds() === 0) // integral multiple of 10 min.
                        break;

                    if (type === 2 && date.getMinutes() === 0 && date.getSeconds() === 0)
                        break;
                }

                let endValue = ymdhms;
                rightPoint = null;

                console.error(startValue, endValue);
                setTimeout(() => {
                    this.spreadChart.instance.dispatchAction({
                        type: "dataZoom",
                        startValue: startValue,
                        endValue: endValue
                    });
                }, 1000);
            }

            return;
        }

        while (padding--) {
            date = new Date(this.minPoint.time * 1000);
            ymdhms = [date.getFullYear(), ("0" + (date.getMonth() + 1)).slice(-2), ("0" + date.getDate()).slice(-2)].join("/")
                + " " + [("0" + date.getHours()).slice(-2), ("0" + date.getMinutes()).slice(-2), ("0" + date.getSeconds()).slice(-2)].join(":");
            this.dataOption.xAxis[0].data.unshift(ymdhms);
            this.dataOption.xAxis[1].data.unshift(ymdhms);
            this.dataOption.series.forEach(serie => {
                serie.data.unshift(null);
            });
            ++this.clockPoint.index;

            if (type === 1 && date.getMinutes() % 10 === 0 && date.getSeconds() === 0) // integral multiple of 10 min.
                break;

            if (type === 2 && date.getMinutes() === 0 && date.getSeconds() === 0)
                break;

            if (type === 3 && date.getHours() === this.durations[0][0] && date.getMinutes() === this.durations[0][1] && date.getSeconds() === 0)
                break;

            this.minPoint.time = this.decreaseTime(this.minPoint);
        }

        while (padding--) {
            this.maxPoint.time = this.increaseTime(this.maxPoint);
            date = new Date(this.maxPoint.time * 1000);
            ymdhms = [date.getFullYear(), ("0" + (date.getMonth() + 1)).slice(-2), ("0" + date.getDate()).slice(-2)].join("/")
                + " " + [("0" + date.getHours()).slice(-2), ("0" + date.getMinutes()).slice(-2), ("0" + date.getSeconds()).slice(-2)].join(":");
            this.dataOption.xAxis[0].data.push(ymdhms);
            this.dataOption.xAxis[1].data.push(ymdhms);
            this.dataOption.series.forEach(serie => {
                serie.data.push(null);
            });

            if (type === 1 && date.getMinutes() % 10 === 0 && date.getSeconds() === 0) // integral multiple of 10 min.
                break;

            if (type === 2 && date.getMinutes() === 0 && date.getSeconds() === 0)
                break;

            if (type === 3 && date.getHours() === this.durations[this.durations.length - 1][2] && date.getMinutes() === this.durations[this.durations.length - 1][3])
                break;
        }

        date = null;
        ymdhms = null;

        setTimeout(() => {
            this.spreadChart.instance.dispatchAction({
                type: "dataZoom",
                start: 0,
                end: 100
            });
        }, 1000);
    }

    changeYAxisInterval(min: number, max: number, interval: number) {
        if (this.spreadChart.instance) {
            this.spreadChart.instance.setOption({ yAxis: [{ min: min, max: max, interval: interval }] });
        }
    }

    reset(codes: string[], ukeys: number[], lines: any[]) {
        this.ukeys = ukeys;
        this.codes = codes;
        this.lines = lines;

        let names = [`${this.codes[0]}.${this.lines[0].levels[0] === 1 ? "ask" : "bid"}_price[0] - ${this.codes[1]}.${this.lines[0].levels[1] === 1 ? "ask" : "bid"}_price[0]`,
        `${this.codes[0]}.${this.lines[1].levels[0] === 1 ? "ask" : "bid"}_price[0] - ${this.codes[1]}.${this.lines[1].levels[1] === 1 ? "ask" : "bid"}_price[0]`,
        this.codes[0], this.codes[1]];
        this.spreadChart.chartOption = this.createLinesChart(names);
        this.durations = [[21, 0, 2, 30], [9, 0, 11, 30], [13, 0, 15, 30]];
        this.lastIdx = {};
        this.lastIdx[this.ukeys[0]] = -1;
        this.lastIdx[this.ukeys[1]] = -1;
        this.interval = { inst: null, value: 1000 };
        this.msgs = {};
        this.clockPoint = new AxisPoint();
        this.dataPoint = new AxisPoint();
        this.maxPoint = new AxisPoint();
        this.minPoint = new AxisPoint();
    }

    getDuration(time): number {
        let begDate = new Date(time * 1000);
        let begMinutes = begDate.getHours() * 60 + begDate.getMinutes();
        let k = 0;

        for (; k < this.durations.length; ++k) {
            if (this.durations[k][0] * 60 + this.durations[k][1] > this.durations[k][2] * 60 + this.durations[k][3]) {
                if (begMinutes >= (this.durations[k][0] * 60 + this.durations[k][1]) ||
                    begMinutes * 60 + begDate.getSeconds() <= (this.durations[k][2] * 60 + this.durations[k][3]) * 60) {
                    break;
                }
            } else {
                if (begMinutes >= (this.durations[k][0] * 60 + this.durations[k][1]) &&
                    begMinutes * 60 + begDate.getSeconds() <= (this.durations[k][2] * 60 + this.durations[k][3]) * 60) {
                    break;
                }
            }
        }

        begMinutes = null;
        begDate = null;

        return this.durations.length !== k ? k : -1;
    }

    increaseTime(axis): number {
        if (axis.time === null)
            return 0;

        let ret = 0;
        let curDate = new Date(axis.time * 1000);
        let begMinutes = curDate.getHours() * 60 + curDate.getMinutes();
        let k = axis.duration;

        if (this.durations[k][0] * 60 + this.durations[k][1] > this.durations[k][2] * 60 + this.durations[k][3]) {
            if (begMinutes >= (this.durations[k][0] * 60 + this.durations[k][1])) {
                ret = axis.time + 1;
            } else if (begMinutes < this.durations[k][2] * 60 + this.durations[k][3]) {
                ret = axis.time + 1;
            } else if (begMinutes * 60 + curDate.getSeconds() === (this.durations[k][2] * 60 + this.durations[k][3]) * 60) {
                if (this.durations[(k + 1) % this.durations.length][0] < this.durations[k][2]) {
                    curDate.setDate(curDate.getDate() + 1);
                }

                curDate.setHours(this.durations[(k + 1) % this.durations.length][0]);
                curDate.setMinutes(this.durations[(k + 1) % this.durations.length][1]);
                curDate.setSeconds(0);
                ret = Math.floor(curDate.getTime() / 1000);
                axis.duration = (k + 1) % this.durations.length;
            }
        } else {
            if (begMinutes >= (this.durations[k][0] * 60 + this.durations[k][1]) &&
                begMinutes < this.durations[k][2] * 60 + this.durations[k][3]) {
                ret = axis.time + 1;
            } else if (begMinutes * 60 + curDate.getSeconds() === (this.durations[k][2] * 60 + this.durations[k][3]) * 60) {
                if (this.durations[(k + 1) % this.durations.length][0] < this.durations[k][2]) {
                    curDate.setDate(curDate.getDate() + 1);
                }

                curDate.setHours(this.durations[(k + 1) % this.durations.length][0]);
                curDate.setMinutes(this.durations[(k + 1) % this.durations.length][1]);
                curDate.setSeconds(0);
                ret = Math.floor(curDate.getTime() / 1000);
                axis.duration = (k + 1) % this.durations.length;
            }
        }

        begMinutes = null;
        curDate = null;
        return ret;
    }

    decreaseTime(axis): number {
        if (axis.time === null)
            return 0;

        let ret = 0;
        let curDate = new Date(axis.time * 1000);
        let begMinutes = curDate.getHours() * 60 + curDate.getMinutes();
        let k = axis.duration;

        if (this.durations[k][0] * 60 + this.durations[k][1] > this.durations[k][2] * 60 + this.durations[k][3]) {
            if (begMinutes >= (this.durations[k][0] * 60 + this.durations[k][1])) {
                if (begMinutes === (this.durations[k][0] * 60 + this.durations[k][1]) && curDate.getSeconds() === 0) {
                    if (this.durations[(k - 1 + this.durations.length) % this.durations.length][2] > this.durations[k][0]) {
                        curDate.setDate(curDate.getDate() - 1);
                    }

                    curDate.setHours(this.durations[(k - 1 + this.durations.length) % this.durations.length][2]);
                    curDate.setMinutes(this.durations[(k - 1 + this.durations.length) % this.durations.length][3]);
                    curDate.setSeconds(0);
                    ret = Math.floor(curDate.getTime() / 1000);
                    axis.duration = (k - 1 + this.durations.length) % this.durations.length;
                } else {
                    ret = axis.time - 1;
                }
            } else if (begMinutes * 60 + curDate.getSeconds() <= (this.durations[k][2] * 60 + this.durations[k][3]) * 60) {
                ret = axis.time - 1;
            } else {
                console.warn(`unvalid date: ${curDate.toLocaleString()}`);
            }
        } else {
            if (begMinutes >= (this.durations[k][0] * 60 + this.durations[k][1]) &&
                begMinutes < this.durations[k][2] * 60 + this.durations[k][3]) {
                if (begMinutes === (this.durations[k][0] * 60 + this.durations[k][1]) && curDate.getSeconds() === 0) {
                    if (this.durations[(k - 1 + this.durations.length) % this.durations.length][2] > this.durations[k][0]) {
                        curDate.setDate(curDate.getDate() - 1);
                    }

                    curDate.setHours(this.durations[(k - 1 + this.durations.length) % this.durations.length][2]);
                    curDate.setMinutes(this.durations[(k - 1 + this.durations.length) % this.durations.length][3]);
                    curDate.setSeconds(0);
                    ret = Math.floor(curDate.getTime() / 1000);
                    axis.duration = (k - 1 + this.durations.length) % this.durations.length;
                } else
                    ret = axis.time - 1;
            } else if (begMinutes * 60 + curDate.getSeconds() <= (this.durations[k][2] * 60 + this.durations[k][3]) * 60) {
                ret = axis.time - 1;
            } else {
                console.warn(`unvalid date: ${curDate.toLocaleString()}`);
            }
        }

        begMinutes = null;
        curDate = null;
        return ret;
    }

    moveTo(axis, timepoint) {
        if (timepoint > axis.time) {
            do {
                axis.time = this.increaseTime(axis);
                ++axis.index;
            } while (axis.time < timepoint);
        }
    }

    dispose() {
        if (this.spreadChart.instance) {
            this.spreadChart.instance.dispose();
            this.spreadChart.instance = null;
        }

        if (this.worker) {
            this.worker.terminate();
        }

        if (this.interval.inst) {
            clearInterval(this.interval.inst);
        }

        if (this.msgs) {
            this.msgs = null;
        }

        this.dataPoint = null;
        this.maxPoint = null;
        this.minPoint = null;
    }
}


export class AxisPoint {
    time: number;
    index: number;
    duration: number;
}