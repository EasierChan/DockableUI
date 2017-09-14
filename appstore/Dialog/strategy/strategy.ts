"use strict";

import { Component, OnInit, Input, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { IP20Service } from "../../../base/api/services/ip20.service";
import { AppStoreService } from "../../../base/api/services/backend.service";
import { DataTable, TabPanel, TabPage, VBox, DataTableRow } from "../../../base/controls/control";
import { WorkspaceConfig, StrategyInstance, DataKey, Channel } from "../../../base/api/model/workbench.model";

@Component({
    moduleId: module.id,
    selector: "strategy",
    templateUrl: "strategy.html",
    styleUrls: ["strategy.css"]
})
export class StrategyComponent implements OnInit, OnDestroy {
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
    strategyTemplates: any;
    paramsTable: DataTable;
    instrumentTable: DataTable;

    strategyConfigPanel: TabPanel;

    constructor(private tgw: IP20Service) {
        this.enNameLabel = "策略服务名：";
        this.chNameLabel = "中文别名：";
        this.productLabel = "产品：";
        this.strategyLabel = "策略：";
    }

    ngOnInit() {
        if (this.config.activeChannel === Channel.BACKTEST && this.config.backtestConfig === undefined) {
            this.config.backtestConfig = {
                timebegin: "2017-09-04",
                timeend: "2017-09-04",
                speed: "5",
                simlevel: "1",
                period: 30,
                unit: "0"
            };
        }

        this.enName = this.config.name;
        this.chName = this.config.chname;
        this.strategyType = this.config.strategyType;
        this.productID = this.config.productID;
        this.strategyConfigPanel = new TabPanel();
        let paramsPage = new TabPage("parameters", "参数");
        this.strategyConfigPanel.addTab(paramsPage, false);
        let instrumentPage = new TabPage("instruments", "合约");
        this.strategyConfigPanel.addTab(instrumentPage, false);
        // this.strategyConfigPanel.addTab(new TabPage("commands", "命令"), false);
        // this.strategyConfigPanel.addTab(new TabPage("comments", "Comment"), false);
        this.strategyConfigPanel.setActive("parameters");

        this.paramsTable = new DataTable("table2");
        this.paramsTable.addColumn("name", "value");
        this.instrumentTable = new DataTable("table2");
        this.instrumentTable.addColumn("name", "value");

        let vboxParams = new VBox();
        vboxParams.addChild(this.paramsTable);
        paramsPage.setContent(vboxParams);
        let vboxInstrument = new VBox();
        vboxInstrument.addChild(this.instrumentTable);
        instrumentPage.setContent(vboxInstrument);
        AppStoreService.removeLocalStorageItem(DataKey.kStrategyCfg);
        this.strategyTemplates = JSON.parse(AppStoreService.getLocalStorageItem(DataKey.kStrategyTemplates));
    }

    save() {
        if (this.strategyType === undefined) {
            alert("未选择策略");
            return;
        }

        this.config.name = this.enName;
        this.config.chname = this.chName;
        this.config.strategyType = this.strategyType;
        this.config.productID = this.productID;

        this.config.items = [new StrategyInstance()];
        if (this.paramsTable.rows.length > 0) {
            this.config.items[0].parameters = [];
            this.paramsTable.rows.forEach(row => {
                this.config.items[0].parameters.push({ name: row.cells[0].Text, value: parseInt(row.cells[1].Text) });
            });
        }

        if (this.instrumentTable.rows.length > 0) {
            this.config.items[0].instruments = [];
            this.instrumentTable.rows.forEach(row => {
                this.config.items[0].instruments.push({ name: row.cells[0].Text, value: parseInt(row.cells[1].Text) });
            });
        }

        localStorage.setItem(DataKey.kStrategyCfg, JSON.stringify(this.config));
    }

    changeStrategy(value) {
        this.paramsTable.rows.length = 0;
        let row: DataTableRow;
        let strategy = this.strategyTemplates[value]["Strategy"];
        for (let prop in strategy[strategy["Strategies"][0]].Parameter) {
            if (strategy[strategy["Strategies"][0]].Parameter[prop].show === 1) {
                row = this.paramsTable.newRow();
                row.cells[0].Data = strategy[strategy["Strategies"][0]].Parameter[prop];
                row.cells[0].Text = row.cells[0].Data.name;
                row.cells[1].Type = "textbox";
                row.cells[1].Text = row.cells[0].Data.value;
            }
        }

        for (let prop in strategy[strategy["Strategies"][0]].Instrument) {
            if (strategy[strategy["Strategies"][0]].Instrument[prop].show === 1) {
                row = this.instrumentTable.newRow();
                row.cells[0].Data = strategy[strategy["Strategies"][0]].Instrument[prop];
                row.cells[0].Text = row.cells[0].Data.name;
                row.cells[1].Type = "textbox";
                row.cells[1].Text = row.cells[0].Data.value;
            }
        }
    }

    ngOnDestroy() {
        this.strategyTemplates = null;
    }
}