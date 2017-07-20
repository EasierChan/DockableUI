/**
 * created by cl, 2017/05/09
 * update: [date]
 * desc:
 */
"use strict";

import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import {
    Control, ComboControl, MetaControl, SpreadViewer, SpreadViewerConfig,
    VBox, HBox, TextBox, Button, DockContainer, ChartViewer
} from "../../base/controls/control";
import { IP20Service } from "../../base/api/services/ip20.service";
import { AppStateCheckerRef, File, Environment, Sound, SecuMasterService, TranslateService } from "../../base/api/services/backend.service";
declare let window: any;

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
export class AppComponent implements OnInit {
    private readonly apptype = "spreadviewer";
    private languageType = 0;
    main: any;
    option: any;
    xAxisData: any[];
    lines: any[];
    codeLastData: any;
    ukeys: number[];
    coeff: number;

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
        this.xAxisData = [];
        this.lines = new Array<number[]>(2);
        this.lines[0] = [];
        this.lines[1] = [];
        this.codeLastData = {};
        let res = this.secuinfo.getSecuinfoByCode(this.option.details.code1, this.option.details.code2);
        this.ukeys = [parseInt(res[this.option.details.code1].ukey), parseInt(res[this.option.details.code2].ukey)];
        this.codeLastData[this.ukeys[0]] = 0;
        this.codeLastData[this.ukeys[1]] = 0;

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
                    console.warn(`unvalid ukey => ${msg.content.ukey}, ${this.ukeys}`);
                    return;
                }

                chart.setMarketData({ UKey: msg.content.ukey, Time: parseInt(stime), AskPrice: msg.content.ask_price[0], BidPrice: msg.content.bid_price[0] });
            }
        });
    }

    createChart(names: string[]) {
        let chart = new ChartViewer();
        chart.setOption({
            title: {
                bottom: 10,
                text: "SpreadViewer"
            },
            tooltip: {
                trigger: "axis",
                backgroundColor: "rgba(245, 245, 245, 0.8)",
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 10,
                textStyle: {
                    color: "#000"
                }
            },
            legend: {
                bottom: 10,
                data: names,
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
                scale: true,
                type: "category",
                axisLabel: {
                    textStyle: {
                        color: "#fff"
                    },
                    formatter: (param) => {
                        return param;
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: "#fff"
                    }
                },
                boundaryGap: [0.2, 0.2],
                data: []
            },
            yAxis: {
                scale: true,
                boundaryGap: [0.2, 0.2],
                axisLabel: {
                    textStyle: {
                        color: "#fff"
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: "#fff"
                    }
                }
            },
            dataZoom: [
                {
                    type: "inside",
                    xAxisIndex: 0
                },
            ],
            series: [
                {
                    name: names[0],
                    type: "line",
                    connectNulls: true,
                    data: [],
                    lineStyle: {
                        normal: {
                            color: "#0f0",
                            width: 1
                        }
                    }
                },
                {
                    name: names[1],
                    type: "line",
                    connectNulls: true,
                    data: [],
                    lineStyle: {
                        normal: {
                            color: "#f00",
                            width: 1
                        }
                    }
                }
            ]
        });

        this.tgw.addSlot({
            appid: 17,
            packid: 110,
            callback: (msg) => {
                let time = new Date(msg.content.time * 1000);
                let stime = [time.getFullYear(), (time.getMonth() + 1), (time.getDate())].join("/") + " " +
                    [("0" + time.getHours()).slice(-2), ("0" + time.getMinutes()).slice(-2), ("0" + time.getSeconds()).slice(-2)].join(":");

                // if (!msg.content.ukey || !viewer.hasInstrumentID(msg.content.ukey)) {
                if (!msg.content.ukey || !(this.ukeys[0] === msg.content.ukey || this.ukeys[1] === msg.content.ukey)) {
                    console.warn(`unvalid ukey => ${msg.content.ukey}, ${this.ukeys}`);
                    return;
                }

                this.xAxisData.push(stime);

                this.codeLastData[msg.content.ukey] = JSON.parse(JSON.stringify(msg.content));
                if (this.codeLastData[this.ukeys[0]] !== 0 && this.codeLastData[this.ukeys[1]] !== 0) {
                    this.lines[0].push((this.codeLastData[this.ukeys[0]].ask_price[0] - this.coeff * this.codeLastData[this.ukeys[1]].bid_price[0]) / 10000);
                    this.lines[1].push((this.codeLastData[this.ukeys[0]].bid_price[0] - this.coeff * this.codeLastData[this.ukeys[1]].ask_price[0]) / 10000);
                }

                chart.changeOption({
                    xAxis: [
                        {
                            type: "category",
                            boundaryGap: false,
                            data: this.xAxisData
                        }
                    ], series: [
                        {
                            name: names[0],
                            type: "line",
                            data: this.lines[0]
                        },
                        {
                            name: names[1],
                            type: "line",
                            data: this.lines[1]
                        }
                    ]
                });

                // viewer.setMarketData({ UKey: msg.content.ukey, Time: parseInt(stime), AskPrice: msg.content.ask_price[0], BidPrice: msg.content.bid_price[0] });
            }
        });

        return chart;
    }
}