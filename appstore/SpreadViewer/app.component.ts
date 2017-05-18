/**
 * created by cl, 2017/05/09
 * update: [date]
 * desc:
 */

import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import {
    Control, ComboControl, MetaControl, SpreadViewer, SpreadViewerConfig,
    VBox, HBox, TextBox, Button, DockContainer
} from "../../base/controls/control";
import { IP20Service } from "../../base/api/services/ip20.service";
import { AppStateCheckerRef, File, Environment, Sound } from "../../base/api/services/backend.service";
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
        AppStateCheckerRef
    ]
})
export class AppComponent implements OnInit {
    main: any;
    option: any;

    constructor(private tgw: IP20Service, private state: AppStateCheckerRef) {
        this.state.onInit(this, this.onReady);
    }

    onReady(option: any) {
        this.option = option;
    }

    ngOnInit() {
        let spreadviewerContent = new VBox();
        let svHeaderRow1 = new HBox();
        let txt_code1 = new TextBox();
        txt_code1.Text = "";
        txt_code1.Title = "Code1:";
        txt_code1.Left = 100;
        txt_code1.Width = 80;
        svHeaderRow1.addChild(txt_code1);
        let txt_code2 = new TextBox();
        txt_code2.Text = "";
        txt_code2.Title = "Code2:";
        txt_code2.Left = 10;
        txt_code2.Width = 80;
        svHeaderRow1.addChild(txt_code2);
        let txt_coeff = new TextBox();
        txt_coeff.Text = "";
        txt_coeff.Title = "Coeff:";
        txt_coeff.Left = 10;
        txt_coeff.Width = 80;
        svHeaderRow1.addChild(txt_coeff);
        let btn_init = new Button();
        btn_init.Class = "primary";
        btn_init.Text = "Initialize";
        btn_init.Left = 10;
        svHeaderRow1.addChild(btn_init);

        let svHeaderRow2 = new HBox();
        let txt_min = new TextBox();
        txt_min.Text = "";
        txt_min.Title = "  Min:";
        txt_min.Left = 100;
        txt_min.Width = 80;
        txt_min.Disable = true;
        svHeaderRow2.addChild(txt_min);
        let txt_max = new TextBox();
        txt_max.Text = "";
        txt_max.Title = "  Max:";
        txt_max.Left = 10;
        txt_max.Width = 80;
        txt_max.Disable = true;
        svHeaderRow2.addChild(txt_max);
        let txt_tick = new TextBox();
        txt_tick.Text = "";
        txt_tick.Title = " Tick:";
        txt_tick.Left = 10;
        txt_tick.Width = 80;
        txt_tick.Disable = true;
        svHeaderRow2.addChild(txt_tick);
        let btn_dayview = new Button();
        btn_dayview.Class = "primary";
        btn_dayview.Text = "Change";
        btn_dayview.Left = 10;
        btn_dayview.Disable = true;
        svHeaderRow2.addChild(btn_dayview);

        spreadviewerContent.addChild(svHeaderRow1);
        spreadviewerContent.addChild(svHeaderRow2);
        let viewer = new SpreadViewer(this.tgw);

        btn_init.OnClick = () => {
            viewer.setConfig({
                symbolCode1: txt_code1.Text,
                innerCode1: 3,
                coeff1: parseFloat(txt_coeff.Text),
                symbolCode2: txt_code2.Text,
                innerCode2: 6,
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

        this.tgw.connect(8012, "172.24.51.4");
        let timestamp: any = new Date();
        timestamp = timestamp.format("yyyymmddHHMMss") + "" + timestamp.getMilliseconds();
        timestamp = timestamp.substr(0, timestamp.length - 1);
        let loginObj = { "cellid": "000003", "userid": "000003.1", "password": "88888", "termid": "12.345", "conlvl": 2, "clienttm": timestamp }; // 
        this.tgw.send(17, 41, loginObj);
    }
}