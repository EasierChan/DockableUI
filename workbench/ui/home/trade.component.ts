"use strict";

import { Component } from "@angular/core";
// import { IP20Service } from "../../../base/api/services/ip20.service";
import { ConfigurationBLL, StrategyServerContainer, WorkspaceConfig, Channel, StrategyInstance, SpreadViewConfig } from "../../bll/strategy.server";

@Component({
    moduleId: module.id,
    selector: "trade",
    templateUrl: "trade.component.html",
    styleUrls: ["trade.component.css"],
    providers: []
})
export class TradeComponent {
    styleObj: any;
    dataSource: any;
    activeTab = "Dashboard";
    selectedServer: any;
    private configBLL = new ConfigurationBLL();
    private strategyContainer = new StrategyServerContainer();
    constructor() {
        console.log("in trading page");
        // load product,strategy and analytical
        this.loginTGW();

    }

    ngOnInit() {
    }
    loginTGW(): void {
        // get template back
        //  create back test channal
    }
}