/**
 * created by cl, 2017/05/09
 * update: [date]
 * desc:
 */
"use strict";

import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import {
    Control, ComboControl, MetaControl, SpreadViewer, SpreadViewerConfig,
    VBox, HBox, TextBox, Button, DockContainer
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
    }

    ngOnInit() {
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
        let viewer = new SpreadViewer();

        let res = this.secuinfo.getSecuinfoByCode(this.option.details.code1, this.option.details.code2);
        btn_init.OnClick = () => {
            viewer.setConfig({
                symbolCode1: this.option.details.code1,
                innerCode1: parseInt(res[this.option.details.code1].ukey),
                coeff1: parseFloat(txt_coeff.Text),
                symbolCode2: this.option.details.code2,
                innerCode2: parseInt(res[this.option.details.code2].ukey),
                coeff2: parseFloat(txt_coeff.Text),
                durations: [{
                    start: {
                        hour: 9,
                        minute: 30
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
                spreadviewerContent.addChild(viewer.ControlRef);
                viewer.show();
            }
            setTimeout(() => {
                viewer.init();
                viewer.start();
                txt_max.Disable = txt_min.Disable = txt_tick.Disable = btn_dayview.Disable = false;
                this.tgw.send(17, 101, { topic: 3112, kwlist: [parseInt(res[this.option.details.code1].ukey), parseInt(res[this.option.details.code2].ukey)] });
            }, 100);
        };
        btn_dayview.OnClick = () => {
            let yaxis: any = {};
            if (txt_min.Text.length > 0) yaxis.min = parseFloat(txt_min.Text);
            if (txt_max.Text.length > 0) yaxis.max = parseFloat(txt_max.Text);
            if (txt_tick.Text.length > 0) yaxis.interval = parseFloat(txt_tick.Text);
            viewer.setEChartOption({ yAxis: yaxis });
            yaxis = null;
        };

        this.main = spreadviewerContent;


        // this.priceServ.register([this._innerCode1, this._innerCode2]);
        // this.priceServ.subscribe(msg => {
        //     if (!msg.ukey || !this.hasInstrumentID(msg.ukey)) {
        //         console.info(msg);
        //         return;
        //     }

        //     switch (msg.type) {
        //         case 201: // Snapshot
        //             this.setMarketData({ UKey: msg.ukey, Time: msg.time, AskPrice: msg.askprices[0], BidPrice: msg.bidprices[0] });
        //             break;
        //         case 100: // Futures
        //             this.setMarketData(msg);
        //             break;
        //         case 1001:
        //         case 1002:
        //         case 1003:
        //         case 1004:
        //         default: // IOPV
        //             this.setMarketData({ UKey: msg.innerCode, Time: msg.time, AskPrice: msg.askIOPV, BidPrice: msg.bidIOPV });
        //             break;
        //     }
        // });

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

        this.tgw.addSlot({
            appid: 17,
            packid: 110,
            callback: (msg) => {
                let time = new Date(msg.content.time * 1000);
                let stime = ("0" + time.getHours()).slice(-2) + ("0" + time.getMinutes()).slice(-2) + ("0" + time.getSeconds()).slice(-2);

                if (!msg.content.ukey || !viewer.hasInstrumentID(msg.content.ukey)) {
                    console.warn(`unvalid ukey => ${msg.content.ukey}`);
                    return;
                }

                viewer.setMarketData({ UKey: msg.content.ukey, Time: parseInt(stime), AskPrice: msg.content.ask_price[0], BidPrice: msg.content.bid_price[0] });
            }
        });

    }
}


import { ActionBar, Label } from "../../base/controls/control";
/**
 * for actionBar test
 */
@Component({
    moduleId: module.id,
    selector: "body",
    template: `
        <usercontrol [children]="main.children" [dataSource]="main.dataSource" [class]="main.styleObj.type"
    style="height: 100%">
  </usercontrol>
    `
})
export class AppComponent2 implements OnInit {
    private readonly apptype = "spreadviewer";
    main: HBox;
    constructor() { }

    ngOnInit() {
        this.main = new HBox();
        this.main.left = 0;
        let actionBar = new ActionBar();
        actionBar.addFeature({
            iconName: "home",
            tooltip: "Home",
            title: "Home",
            active: true
        });

        actionBar.addFeature({
            iconName: "search",
            tooltip: "Search",
            title: "Search",
            active: false
        });

        actionBar.addFeature({
            iconName: "time",
            tooltip: "History",
            title: "History",
            active: false
        });

        let content = new VBox();
        let header = new HBox();
        let lbl_title = new Label();
        lbl_title.Text = "Home";
        header.addChild(lbl_title);
        content.addChild(header);
        this.main.addChild(actionBar).addChild(content);
    }
}