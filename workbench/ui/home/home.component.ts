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
    inputs: ["styleObj", "dataSource"],
    viewProviders: [
        AdminComponent,
        DashboardComponent,
        RiskComponent,
        TradeComponent,
        SimulationComponent
    ]
})
export class HomeComponent implements OnInit {
    styleObj: any;
    dataSource: any;
    activeTab = "Dashboard";

    constructor(private ele: ElementRef, private render: Renderer) {

    }

    ngOnInit() {
    }
}