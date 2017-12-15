"use strict";

import { Component, OnInit, Input, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { AppStoreService, SecuMasterService, TranslateService } from "../../../base/api/services/backend.service";
import { DataTable, TabPanel, TabPage, VBox, DataTableRow } from "../../../base/controls/control";
import { WorkspaceConfig, StrategyInstance, DataKey, Channel } from "../../../base/api/model/workbench.model";

@Component({
    moduleId: module.id,
    selector: "strategy",
    templateUrl: "strategy.html",
    styleUrls: ["strategy.css"],
    providers: [
        SecuMasterService
    ]
})
export class StrategyComponent implements OnInit, OnDestroy {
    @Input("config") config: WorkspaceConfig;
    @Input("products") products: any[];
    @Input("strategies") strategies: any[];
    @Input("forbidNames") forbidNames: string[];

    enNameLabel: string;
    enName: string;
    isCreate: boolean;
    chNameLabel: string;
    chName: string;
    strategyLabel: string;
    strategyType: string;
    productLabel: string;
    productID: string;
    basketLabel: string;
    basketID: string;
    baskets: any[];
    strategyTemplates: Object;
    paramsTable: DataTable;
    instrumentTable: DataTable;

    strategyConfigPanel: TabPanel;

    constructor(
        private secuinfo: SecuMasterService,
        private langSrv: TranslateService) {
        this.enNameLabel = "策略服务名：";
        this.chNameLabel = "名称：";
        this.productLabel = "产品：";
        this.strategyLabel = "策略：";
        this.basketLabel = "篮子：";
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
        this.isCreate = true;
        this.chName = this.config.chname;
        this.strategyType = this.config.strategyType;
        this.productID = this.config.productID;
        this.basketID = this.config.items.length > 0 ? this.config.items[0].basketID.toString() : undefined;
        let userid = JSON.parse(AppStoreService.getLocalStorageItem(DataKey.kUserInfo)).user_id;
        this.baskets = JSON.parse(AppStoreService.getLocalStorageItem(`${userid}-basket`));

        this.strategyConfigPanel = new TabPanel();
        let paramsPage = new TabPage("parameters", "参数");
        this.strategyConfigPanel.addTab(paramsPage, false);
        let instrumentPage = new TabPage("instruments", "合约");
        this.strategyConfigPanel.addTab(instrumentPage, false);
        // this.strategyConfigPanel.addTab(new TabPage("commands", "命令"), false);
        // this.strategyConfigPanel.addTab(new TabPage("comments", "Comment"), false);
        this.strategyConfigPanel.setActive("parameters");

        this.paramsTable = new DataTable("table2");
        this.paramsTable.addColumn(this.langSrv.get("name"), this.langSrv.get("value"));
        this.instrumentTable = new DataTable("table2");
        this.instrumentTable.addColumn(this.langSrv.get("name"), this.langSrv.get("value"));

        let vboxParams = new VBox();
        vboxParams.addChild(this.paramsTable);
        paramsPage.setContent(vboxParams);
        let vboxInstrument = new VBox();
        vboxInstrument.addChild(this.instrumentTable);
        instrumentPage.setContent(vboxInstrument);
        AppStoreService.removeLocalStorageItem(DataKey.kStrategyCfg);
        this.strategyTemplates = JSON.parse(AppStoreService.getLocalStorageItem(DataKey.kStrategyTemplates));
        if (this.strategyType !== undefined) {
            this.isCreate = false;
            let strategy = this.strategyTemplates[this.strategyType]["Strategy"];

            for (let prop in strategy[strategy["Strategies"][0]].Parameter) {
                if (strategy[strategy["Strategies"][0]].Parameter[prop].show === 1) {
                    let row: DataTableRow = this.paramsTable.newRow();
                    row.cells[0].Data = { obj: strategy[strategy["Strategies"][0]].Parameter[prop], prop: prop };
                    row.cells[0].Text = this.langSrv.get(prop);
                    row.cells[1].Type = "textbox";
                    let param = this.config.items[0].parameters.find(item => { return item.name === prop; });
                    row.cells[1].Text = (parseFloat(param ? param.value : row.cells[0].Data.obj.value) / Math.pow(10, row.cells[0].Data.obj.decimal)).toFixed(row.cells[0].Data.obj.decimal);
                }
            }

            for (let prop in strategy[strategy["Strategies"][0]].Instrument) {
                if (strategy[strategy["Strategies"][0]].Instrument[prop].show === 1) {
                    let row: DataTableRow = this.instrumentTable.newRow();
                    row.cells[0].Data = { obj: strategy[strategy["Strategies"][0]].Instrument[prop], prop: prop };
                    row.cells[0].Text = this.langSrv.get(prop);
                    row.cells[1].Type = "u-codes";

                    let instru = this.config.items[0].instruments.find(item => { return item.name === prop; });
                    let value = instru ? instru.value : row.cells[0].Data.obj.value;

                    let codeinfo: any = this.secuinfo.getSecuinfoByInnerCode(value);
                    row.cells[1].Text = { symbolCode: codeinfo.hasOwnProperty(value) ? codeinfo[value].SecuCode : value };
                    row.cells[1].Data = value;
                    row.cells[1].OnClick = (data) => {
                        if (data.row !== undefined)
                            row.cells[1].Data = parseInt(data.item.code);
                    };
                }
            }
        }
    }

    save() {
        if (this.strategyType === undefined) {
            alert("未选择策略！");
            return;
        }

        if (this.chName === undefined || this.chName.trim().length < 1) {
            alert("名称不能为空！");
            return;
        }

        if (this.isCreate && this.forbidNames && this.forbidNames.indexOf(this.chName) >= 0) {
            alert("名称已存在！");
            return;
        }

        this.config.name = this.enName;
        this.config.chname = this.chName;
        this.config.strategyType = this.strategyType;
        this.config.productID = this.productID;

        if (this.isCreate)
            this.config.items = [new StrategyInstance()];

        this.config.items[0].basketID = parseInt(this.basketID);
        this.config.items[0].parameters = [];
        this.config.items[0].instruments = [];
        if (this.paramsTable.rows.length > 0) {
            this.paramsTable.rows.forEach(row => {
                this.config.items[0].parameters.push({ name: row.cells[0].Data.prop, value: parseFloat(row.cells[1].Text) * Math.pow(10, row.cells[0].Data.obj.decimal) });
            });
        }

        if (this.instrumentTable.rows.length > 0) {
            this.instrumentTable.rows.forEach(row => {
                this.config.items[0].instruments.push({ name: row.cells[0].Data.prop, value: parseInt(row.cells[1].Data) });
            });
        }

        AppStoreService.setLocalStorageItem(DataKey.kStrategyCfg, JSON.stringify(this.config));
        window.close();
    }

    changeStrategy(value) {
        this.paramsTable.rows.length = 0;
        this.instrumentTable.rows.length = 0;
        let strategy = this.strategyTemplates[value]["Strategy"];
        for (let prop in strategy[strategy["Strategies"][0]].Parameter) {
            if (strategy[strategy["Strategies"][0]].Parameter[prop].show === 1) {
                let row: DataTableRow = this.paramsTable.newRow();
                row.cells[0].Data = { obj: strategy[strategy["Strategies"][0]].Parameter[prop], prop: prop };
                row.cells[0].Text = this.langSrv.get(prop);
                row.cells[1].Type = "textbox";
                row.cells[1].Text = (row.cells[0].Data.obj.value / Math.pow(10, row.cells[0].Data.obj.decimal)).toFixed(row.cells[0].Data.obj.decimal);
            }
        }

        for (let prop in strategy[strategy["Strategies"][0]].Instrument) {
            if (strategy[strategy["Strategies"][0]].Instrument[prop].show === 1) {
                let row: DataTableRow = this.instrumentTable.newRow();
                row.cells[0].Data = { obj: strategy[strategy["Strategies"][0]].Instrument[prop], prop: prop };
                row.cells[0].Text = this.langSrv.get(prop);
                row.cells[1].Type = "u-codes";
                let codeinfo: any = this.secuinfo.getSecuinfoByInnerCode(row.cells[0].Data.obj.value);
                row.cells[1].Text = { symbolCode: codeinfo.hasOwnProperty(row.cells[0].Data.obj.value) ? codeinfo[row.cells[0].Data.obj.value].SecuCode : row.cells[0].Data.obj.value };
                row.cells[1].Data = row.cells[0].Data.obj.value;
                row.cells[1].OnClick = (data) => {
                    if (data.row !== undefined)
                        row.cells[1].Data = parseInt(data.item.code);
                };
            }
        }
    }

    ngOnDestroy() {
        this.strategyTemplates = null;
    }
}