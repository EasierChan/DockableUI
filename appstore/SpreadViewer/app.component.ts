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
import { AppStateCheckerRef, SecuMasterService, TranslateService } from "../../base/api/services/backend.service";
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
        let loginObj = { "cellid": "000003", "userid": "000003.1", "password": "88888", "termid": "12.345", "conlvl": 2, "clienttm": stimestamp };
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

                chart.setMarketData({ UKey: msg.content.ukey, Time: parseInt(stime), AskPrice: msg.content.ask_price[0], BidPrice: msg.content.bid_price[0] });
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
    ukeys: number[];
    spreadChart: any;
    timeLineChart: any;
    worker: Worker;

    constructor(private quote: IP20Service, private state: AppStateCheckerRef,
        private secuinfo: SecuMasterService) {
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
        let loginObj = { "cellid": "000003", "userid": "000003.1", "password": "88888", "termid": "12.345", "conlvl": 2, "clienttm": stimestamp };
        this.quote.addSlot({
            appid: 17,
            packid: 43,
            callback: msg => {
                console.info(`quote ans=>${msg}`);
                if (afterLogin)
                    afterLogin.call(this);
                // this.quote.send(17, 101, { topic: 3112, kwlist: [2163460] });
            }
        });
        this.quote.addSlot({
            appid: 17,
            packid: 120,
            callback: msg => {
                console.info(msg);
            }
        });
        this.quote.send(17, 41, loginObj);
    }

    ngOnInit() {
        this.spreadChart = {};
        this.timeLineChart = {};

        let res = this.secuinfo.getSecuinfoByCode(this.option.details.code1, this.option.details.code2);
        this.ukeys = [parseInt(res[this.option.details.code1].ukey), parseInt(res[this.option.details.code2].ukey)];

        let lines = [`${this.option.details.code2}.ask_price[0] - ${this.option.details.code1}.bid_price[0]`,
        `${this.option.details.code2}.bid_price[0] - ${this.option.details.code1}.ask_price[0]`, this.option.details.code1, this.option.details.code2];

        this.durations.push([21, 0, 2, 30], [9, 0, 11, 30], [13, 0, 15, 30]);
        this.spreadChart.chartOption = this.createLinesChart(lines);

        this.loginTGW(() => {
            this.quote.send(17, 101, { topic: 3112, kwlist: this.ukeys });
        });

        this.registerListeners();
    }

    latestItem: any = {};
    durations = [];

    registerListeners() {
        this.worker = new Worker("spreadWorker.js");
        this.worker.postMessage({ type: "init", legs: this.ukeys });

        let self = this;
        let beg = null;
        let end = null;
        let option = { series: this.spreadChart.chartOption.series };

        this.quote.addSlot({
            appid: 17,
            packid: 110,
            callback(msg) {
                // console.info(msg.content);
                self.worker.postMessage({ type: "add", ukey: msg.content.ukey, value: msg.content });
                self.worker.postMessage({ type: "get", time: msg.content.time });
                self.latestItem[msg.content.ukey] = msg.content;

                if (beg === null) {
                    beg = msg.content.time / 100 * 100;

                    for (let i = beg - 300; i < beg + 300; ++i) {
                        self.spreadChart.chartOption.xAxis[0].data.push(new Date(i * 1000));
                        self.spreadChart.chartOption.xAxis[1].data.push(new Date(i * 1000));
                    }

                    self.spreadChart.chartOption.series[0].data.length = 300;
                    self.spreadChart.chartOption.series[1].data.length = 300;
                    self.spreadChart.chartOption.series[2].data.length = 300;
                    self.spreadChart.chartOption.series[3].data.length = 300;
                    (self.spreadChart.instance as echarts.ECharts).setOption(self.spreadChart.chartOption, true);
                }
            }
        });

        this.worker.onmessage = (ev: MessageEvent) => {
            option.series[0].data.push(ev.data[0]); // tslint:disable-line
            option.series[1].data.push(ev.data[1]); // tslint:disable-line
            option.series[2].data.push(ev.data[2]); // tslint:disable-line
            option.series[3].data.push(ev.data[3]); // tslint:disable-line
            (self.spreadChart.instance as echarts.ECharts).setOption(option, false);
        };
    }

    code(ukey: number) {
        return this.latestItem[ukey];
    }

    ngOnDestroy() {
        if (this.spreadChart.instance) {
            this.spreadChart.instance.dispose();
            this.spreadChart.instance = null;
        }

        if (this.worker) {
            this.worker.terminate();
        }
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
    }

    createLinesChart(lines: string[], xAxisPoints: any[] = []) {
        return {
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
                                let cur = new Date(params.value);
                                return [cur.getFullYear(), cur.getMonth() + 1, cur.getDate()].join("/") + " " + [cur.getHours(), cur.getMinutes()].join(":");
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
                textStyle: { color: "#F3F3F5" }
            },
            grid: [{
                show: true,
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
                data: xAxisPoints,
                axisLabel: {
                    show: false
                    // textStyle: { color: "#F3F3F5" },
                    // formatter: function (value, index) {
                    //     let date = new Date(value);
                    //     let hms = [date.getHours(), date.getMinutes(), date.getSeconds()];

                    //     if (index === 0) {
                    //         let ymd = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
                    //         return ymd.join("/") + " " + hms.join(":");
                    //     }

                    //     return hms.join(":");
                    // },
                    // interval: (index: number, value: string) => {
                    //     let date = new Date(value);
                    //     return date.getSeconds() === 0 && date.getMinutes() % 5 === 0;
                    // }
                }
            }, {
                gridIndex: 1,
                data: xAxisPoints,
                axisLabel: {
                    textStyle: { color: "#F3F3F5" },
                    formatter: function(value, index) {
                        let date = new Date(value);
                        let hms = [date.getHours(), date.getMinutes(), date.getSeconds()];

                        if (index === 0) {
                            let ymd = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
                            return ymd.join("/") + " " + hms.join(":");
                        }

                        return hms.join(":");
                    },
                    interval: (index: number, value: string) => {
                        let date = new Date(value);
                        return date.getSeconds() === 0 && date.getMinutes() % 5 === 0;
                    }
                }
            }],
            yAxis: [{
                axisLabel: {
                    show: true,
                    textStyle: { color: "#F3F3F5" }
                },
                splitLine: { lineStyle: { color: "#1a0000" } },
                scale: true,
                boundaryGap: [0.2, 0.2]
            }, {
                gridIndex: 1,
                axisLabel: {
                    show: true,
                    textStyle: { color: "#F3F3F5" }
                },
                splitLine: { lineStyle: { color: "#1a0000" } },
                scale: true,
                boundaryGap: [0.2, 0.2]
            }, {
                gridIndex: 1,
                position: "right",
                axisLabel: {
                    show: true,
                    textStyle: { color: "#F3F3F5" }
                },
                splitLine: { lineStyle: { color: "#1a0000" } },
                scale: true,
                boundaryGap: [0.2, 0.2]
            }],
            series: [{
                name: lines[0],
                type: "line",
                data: []
            }, {
                name: lines[1],
                type: "line",
                data: []
            }, {
                xAxisIndex: 1,
                yAxisIndex: 1,
                name: lines[2],
                type: "line",
                data: []
            }, {
                xAxisIndex: 1,
                yAxisIndex: 2,
                name: lines[3],
                type: "line",
                data: []
            }],
            dataZoom: [{
                type: "inside",
                xAxisIndex: [0, 1]
            }]
        };
    }
}