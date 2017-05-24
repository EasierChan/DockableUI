/**
 * created by cl, 2017/05/19
 * update: [date]
 * desc: show loopback test.
 */

import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import {
    VBox, HBox, DropDown, DropDownItem, Button, DataTable, Label, TabPanel
} from "../../base/controls/control";
import { QtpService } from "../../base/api/services/qtp.service";
import { AppStateCheckerRef, File, Environment, Sound } from "../../base/api/services/backend.service";
declare let window: any;

@Component({
    moduleId: module.id,
    selector: "body",
    template: `
        <dock-control style="width: 100%; height: 100%" [className]="main.className" [children]="main.children" [styleObj]="main.styleObj" [dataSource]="main.dataSource">
        </dock-control>
    `,
    providers: [
        QtpService,
        AppStateCheckerRef
    ]
})
export class AppComponent implements OnInit {
    private readonly apptype = "loopbacktest";
    main: any;
    option: any;
    dd_tests: DropDown;

    constructor(private state: AppStateCheckerRef, private qtp: QtpService) {
    }

    onReady(option: any) {
        this.option = option;
        document.title = this.option.name;
        this.qtp.connect(this.option.port, this.option.host);
    }

    ngOnInit() {
        this.state.onInit(this, this.onReady);
        let viewContent = new VBox();
        let svHeaderRow1 = new HBox();
        let dd_tests = new DropDown();
        dd_tests.Title = "Tests:";
        dd_tests.Left = 50;
        dd_tests.addItem({ Text: "--all--", Value: undefined });

        this.option.tests.forEach(item => {
            dd_tests.addItem({ Text: item.date + " " + item.id, Value: item });
        });
        svHeaderRow1.addChild(dd_tests);
        let lbl_mode = new Label();
        lbl_mode.Title = "Mode:";
        lbl_mode.Left = 10;
        lbl_mode.Width = 50;
        svHeaderRow1.addChild(lbl_mode);
        let lbl_speed = new Label();
        lbl_speed.Title = "Speed:";
        lbl_speed.Left = 10;
        lbl_speed.Width = 50;
        svHeaderRow1.addChild(lbl_speed);
        let lbl_duration = new Label();
        lbl_duration.Title = "Duration:";
        lbl_duration.Left = 10;
        svHeaderRow1.addChild(lbl_duration);
        let btn_query = new Button();
        btn_query.Left = 10;
        btn_query.Text = "Query";
        svHeaderRow1.addChild(btn_query);
        viewContent.addChild(svHeaderRow1);
        let panel = new TabPanel();
        panel.addTab2("speed", "speed");
        panel.setActive("speed");
        viewContent.addChild(panel);

        let table = new DataTable("table2");
        table.addColumn("Orderid", "Date", "Account", "Innercode", "Status", "Time", "OrderPrice", "OrderVol", "DealPrice", "DealVol", "DealAmt", "B/S");
        // viewContent.addChild(table);

        viewContent.addChild(new HBox());
        this.main = viewContent;

        let resultMap: any = {};
        dd_tests.SelectChange = () => {
            // table.rows.length = 0;
            if (dd_tests.SelectedItem && dd_tests.SelectedItem.Value) {
                lbl_mode.Text = dd_tests.SelectedItem.Value.simlevel;
                lbl_speed.Text = dd_tests.SelectedItem.Value.speed;
                lbl_duration.Text = dd_tests.SelectedItem.Value.timebegin + "-" + dd_tests.SelectedItem.Value.timeend;
                if (resultMap.hasOwnProperty(dd_tests.SelectedItem.Value.id)) {
                    table.rows.length = 0;
                    resultMap[dd_tests.SelectedItem.Value.id].details.forEach(item => {
                        let row = table.newRow();
                        row.cells[0].Text = item.orderid;
                        row.cells[1].Text = item.tradedate;
                        row.cells[2].Text = item.accountid;
                        row.cells[3].Text = item.innercode;
                        row.cells[4].Text = item.orderstatus;
                        row.cells[5].Text = item.ordertime;
                        row.cells[6].Text = item.orderprice / 10000;
                        row.cells[7].Text = item.ordervolume;
                        row.cells[8].Text = item.dealprice / 10000;
                        row.cells[9].Text = item.dealvolume;
                        row.cells[10].Text = item.dealbalance / 10000;
                        row.cells[11].Text = item.directive === 1 ? "B" : "S";
                    });
                }
            }
        };

        btn_query.OnClick = () => {
            table.rows.length = 0;
            this.qtp.send(8014, { nId: dd_tests.SelectedItem.Value.id }); // pnl
            this.qtp.send(8016, { nId: dd_tests.SelectedItem.Value.id }); // detail
        };

        this.qtp.addSlot({
            msgtype: 8013,
            callback: msg => {
                console.info(msg);
                // let row = table.newRow();
            }
        }, {
                msgtype: 8015,
                callback: msg => {
                    console.info(msg);
                    // let row = table.newRow();
                    // resultMap[msg.nId].pnl = msg.Accpl;
                }
            }, {
                msgtype: 8017,
                callback: msg => {
                    console.info(msg);
                    if (Array.isArray(msg.orderdetails)) {
                        // resultMap[msg.nId].details = msg.orderdetails;
                        msg.orderdetails.forEach(item => {
                            let row = table.newRow();
                            row.cells[0].Text = item.orderid;
                            row.cells[1].Text = item.tradedate;
                            row.cells[2].Text = item.accountid;
                            row.cells[3].Text = item.innercode;
                            row.cells[4].Text = item.orderstatus;
                            row.cells[5].Text = item.ordertime;
                            row.cells[6].Text = item.orderprice / 10000;
                            row.cells[7].Text = item.ordervolume;
                            row.cells[8].Text = item.dealprice / 10000;
                            row.cells[9].Text = item.dealvolume;
                            row.cells[10].Text = item.dealbalance / 10000;
                            row.cells[11].Text = item.directive === 1 ? "B" : "S";
                        });
                    }
                }
            });
    }
}