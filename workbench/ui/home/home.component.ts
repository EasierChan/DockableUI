"use strict";

import { Component, OnInit, Renderer, ElementRef } from "@angular/core";
import { AdminComponent } from "./admin.component";
import { DashboardComponent } from "./dash.component";
import { RiskComponent } from "./risk.component";
import { TradeComponent } from "./trade.component";
import { SimulationComponent } from "./simulation.component";

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
    ]
})
export class HomeComponent implements OnInit {
    modules: any;
    curModule: any;
    activeTab: string;

    constructor() {
        this.modules = [
            {
                name: "history",
                tabs: ["BackTest", "Report"]
            },
            {
                name: "present",
                tabs: ["Dashboard", "Trading", "Simulation", "Risk", "Admin"]
            },
            {
                name: "future",
                tabs: ["RiskFactors"]
            }
        ];

        this.curModule = this.modules[0];
        this.activeTab = this.curModule.tabs[0];
    }

    changeModule(mod) {
        this.curModule = mod;
        this.activeTab = this.curModule.tabs[0];
    }

    ngOnInit() {
    }
}