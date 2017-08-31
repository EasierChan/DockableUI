"use strict";

import { Component, OnInit, Input } from "@angular/core";
import { IP20Service } from "../../../base/api/services/ip20.service";
import { DataTable } from "../../../base/controls/control";
import { WorkspaceConfig } from "../../../base/api/model/workbench.model";

@Component({
    moduleId: module.id,
    selector: "strategy",
    templateUrl: "strategy.html",
    styleUrls: ["strategy.css"]
})
export class StrategyComponent implements OnInit {
    @Input("config") config: WorkspaceConfig;
    @Input("products") products: any[];
    @Input("strategies") strategies: any[];

    enNameLable: string;
    enName: string;
    chNameLable: string;
    chName: string;
    strategyLabel: string;
    strategyType: string;
    productLabel: string;
    productID: string;

    constructor(private tgw: IP20Service) {
        this.enNameLable = "策略服务名:";
        this.chNameLable = "中文别名:";
        this.productLabel = "产品:";
        this.strategyLabel = "策略:";
    }

    ngOnInit() {
        if (this.config === undefined)
            this.config = new WorkspaceConfig();

    }

    selectStrategyChange() {
        console.info(this.strategyType);
    }

    selectProductChange() {
        console.info(this.productID);
    }
}