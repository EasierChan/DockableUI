"use strict";

import { Component } from "@angular/core";
import { TradeService } from "../../bll/services";
import { DataTable } from "../../../base/controls/control";

@Component({
    moduleId: module.id,
    selector: "risk",
    templateUrl: "risk.html",
    styleUrls: ["home.component.css"]
})
export class RiskComponent {
    strategyTable: DataTable;
    accountTable: DataTable;

    constructor(private trade: TradeService) {

    }

    ngOnInit() {
        this.strategyTable = new DataTable();
        this.strategyTable.addColumn("名称", "当前值", "阈值");

        this.accountTable = new DataTable();
        this.accountTable.addColumn("名称", "当前值", "阈值");

        this.registerListeners();
        this.trade.send(130, 2001, {});
    }

    registerListeners() {
        this.trade.addSlot({
            appid: 130,
            packid: 2002,
            callback: (msg) => {
                console.info(msg);
            }
        });
    }
}