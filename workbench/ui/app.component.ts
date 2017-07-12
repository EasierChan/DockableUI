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

import {
    CustomControl
} from "./app.controls";

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
    templateUrl: "app.component.html",
    styleUrls: ["app.component.css"]
})
export class AppComponent implements OnInit {
    actionBar: ActionBar;
    curPage: string;

    ngOnInit() {
        this.actionBar = new ActionBar();
        this.actionBar.addItem({
            iconName: "home",
            tooltip: "Home",
            title: "Home",
            active: true,
        });

        this.actionBar.addItem({
            iconName: "search",
            tooltip: "Security Master",
            title: "Security Master",
            active: false
        });

        this.actionBar.addItem({
            iconName: "time",
            tooltip: "History",
            title: "History",
            active: false
        });

        this.actionBar.onClick = (item) => {
            console.info(item.title);
            switch (item.title) {
                case "Security Master":
                    this.curPage = "security";
                    break;
                case "Home":
                default:
                    this.curPage = "home";
                    break;
            }
        };
    }

}