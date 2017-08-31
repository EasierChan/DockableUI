"use strict";

import { Component, OnInit } from "@angular/core";
import { IP20Service } from "../../../base/api/services/ip20.service";
import { DataTable } from "../../../base/controls/control";

@Component({
    moduleId: module.id,
    selector: "strategy",
    templateUrl: "strategy.html",
    styleUrls: ["strategy.css"]
})
export class StrategyComponent implements OnInit {
    constructor(private tgw: IP20Service) {
    }

    ngOnInit() {
    }
}