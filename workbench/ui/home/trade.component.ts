"use strict";

import { Component } from "@angular/core";

@Component({
    moduleId: module.id,
    selector: "trade",
    templateUrl: "trade.component.html",
    styleUrls: ["trade.component.css"]
})
export class TradeComponent {
    styleObj: any;
    dataSource: any;
    activeTab = "Dashboard";

    constructor() {

    }

    ngOnInit() {
    }
}