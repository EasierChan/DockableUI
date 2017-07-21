"use strict";

import { Component, OnInit, Renderer, ElementRef } from "@angular/core";
import { AdminComponent } from "./admin.component";
import { DashboardComponent } from "./dash.component";
import { RiskComponent } from "./risk.component";
import { TradeComponent } from "./trade.component";
import { SimulationComponent } from "./simulation.component";
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
        SimulationComponent
    ],
    inputs: ["currentMod", "activeTab"]
})
export class HomeComponent implements OnInit {
    currentMod: string; // input module name
    activeTab: string;

    constructor() {
    }

    ngOnInit() {

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