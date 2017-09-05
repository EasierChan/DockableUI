"use strict";

import { Component, OnInit, Input } from "@angular/core";
import { IP20Service } from "../../../base/api/services/ip20.service";
import { DataTable, TabPanel, TabPage } from "../../../base/controls/control";
import { WorkspaceConfig, StrategyInstance, DataKey, Channel } from "../../../base/api/model/workbench.model";

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

    enNameLabel: string;
    enName: string;
    chNameLabel: string;
    chName: string;
    strategyLabel: string;
    strategyType: string;
    productLabel: string;
    productID: string;

    strategyConfigPanel: TabPanel;

    constructor(private tgw: IP20Service) {
        this.enNameLabel = "策略服务名：";
        this.chNameLabel = "中文别名：";
        this.productLabel = "产品：";
        this.strategyLabel = "策略：";
    }

    ngOnInit() {
        if (this.config.activeChannel === Channel.BACKTEST) {
            this.config.backtestConfig = {
                timebegin: "2017-09-04",
                timeend: "2017-09-04",
                speed: 5,
                simlevel: 1,
                period: 30,
                unit: 0
            };
        }

        this.enName = this.config.name;
        this.chName = this.config.chname;
        this.strategyType = this.config.strategyType;
        this.productID = this.config.productID;
        this.strategyConfigPanel = new TabPanel();
        this.strategyConfigPanel.addTab(new TabPage("parameters", "参数"), false);
        this.strategyConfigPanel.addTab(new TabPage("instruments", "合约"), false);
        this.strategyConfigPanel.addTab(new TabPage("commands", "命令"), false);
        this.strategyConfigPanel.addTab(new TabPage("comments", "Comment"), false);
        this.strategyConfigPanel.setActive("parameters");
        localStorage.removeItem(DataKey.kStrategyCfg);
    }

    save() {
        this.config.name = this.enName;
        this.config.chname = this.chName;
        this.config.strategyType = this.strategyType;
        this.config.productID = this.productID;

        let instance = new StrategyInstance();
        instance.parameters = [];
        this.config.items.push(instance);
        localStorage.setItem(DataKey.kStrategyCfg, JSON.stringify(this.config));
    }
}