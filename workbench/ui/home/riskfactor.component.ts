"use strict";

import { Component } from "@angular/core";
import { File } from "../../../base/api/services/backend.service"; // File operator
import { TradeService } from "../../bll/services";

@Component({
    moduleId: module.id,
    selector: "riskfactor",
    templateUrl: "riskfactor.component.html",
    styleUrls: ["home.component.css", "riskfactor.component.css"]
})
export class RiskFactorComponent {
    styleObj: any;
    dataSource: any;

    constructor(private tradePoint: TradeService) {
        this.loadData();
    }

    ngOnInit() {
        // receive holdlist
        // this.tradePoint.addSlot({
        // 
        // });
        // request holdlist
        // this.tradePoint.send();
    }

    loadData() {
        // to read a file line by line.
        // File.readLineByLine("", (linestr) => {

        // });
    }
}