"use strict";

import { Component, OnInit, Renderer, ElementRef } from "@angular/core";
import { AdminComponent } from "./admin.component";
import { DashboardComponent } from "./dash.component";
import { RiskComponent } from "./risk.component";
import { TradeComponent } from "./trade.component";
import { SimulationComponent } from "./simulation.component";
import { ReportComponent } from "./report.component";
import { DataSet } from "./common";

@Component({
    moduleId: module.id,
    selector: "home",
    templateUrl: "home.component.html",
    styleUrls: ["home.component.css"],
    viewProviders: [
        AdminComponent,
        DashboardComponent,
        RiskComponent,
        TradeComponent,
        SimulationComponent,
        ReportComponent
    ],
    inputs: ["currentMod", "activeTab"]
})
export class HomeComponent implements OnInit {
    currentMod: string; // input module name
    activeTab: string;
    disabled_tabs: string[];

    constructor() {
    }

    ngOnInit() {
        this.disabled_tabs = ["实盘交易"]; // , "风控"
    }

    onTabClick(tab: string) {
        if (this.disabled_tabs.indexOf(tab) >= 0) {
            alert("当前未开放权限！");
            return;
        }

        this.activeTab = tab;
    }

    get curModule() {
        let curModule = DataSet.modules.find((mod) => {
            return mod.name === this.currentMod;
        });

        if (curModule === undefined) {
            console.error(`Unsupport module: ${this.currentMod}.`);
            console.info(`Supported modules list below: `);
            DataSet.modules.forEach(mod => {
                console.info(`${mod.name}`);
            });
            // set a valid mod name;
            return DataSet.modules[1];
        }

        return curModule;
    }
}