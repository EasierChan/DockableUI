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
export class AppComponent implements OnInit {
    private readonly apptype = "spreadviewer";
    main: HBox;
    constructor() { }

    ngOnInit() {
        this.main = new HBox();
        this.main.left = 0;
        let actionBar = new ActionBar();
        actionBar.addItem({
            iconName: "home",
            tooltip: "Home",
            title: "Home",
            active: true
        });

        actionBar.addItem({
            iconName: "search",
            tooltip: "Search",
            title: "Search",
            active: false
        });

        actionBar.addItem({
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