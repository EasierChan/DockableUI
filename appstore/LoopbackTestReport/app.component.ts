/**
 * created by cl, 2017/05/09
 * update: [date]
 * desc:
 */

import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import {
    VBox, HBox, DateTimeBox, Button
} from "../../base/controls/control";
import { PriceService } from "../../base/api/services/priceService";
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
        PriceService,
        AppStateCheckerRef
    ]
})
export class AppComponent implements OnInit {
    main: any;
    option: any;

    constructor(private state: AppStateCheckerRef) {
        this.state.onInit(this, this.onReady);
    }

    onReady(option: any) {
        this.option = option;
    }

    ngOnInit() {
        let viewContent = new VBox();
        let svHeaderRow1 = new HBox();
        let txt_start = new DateTimeBox();
        txt_start.Text = "";
        txt_start.Title = "BeginDate:";
        txt_start.Left = 100;
        txt_start.Width = 80;
        svHeaderRow1.addChild(txt_start);
        let txt_end = new DateTimeBox();
        txt_end.Text = "";
        txt_end.Title = "Begin:";
        txt_end.Left = 10;
        txt_end.Width = 80;
        svHeaderRow1.addChild(txt_end);
        let btn_query = new Button();
        btn_query.Class = "primary";
        btn_query.Text = "Search";
        btn_query.Left = 10;
        btn_query.Disable = true;
        svHeaderRow1.addChild(btn_query);

        let svHeaderRow2 = new HBox();

        this.main = viewContent;
    }
}