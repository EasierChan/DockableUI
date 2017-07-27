"use strict";

import { Component, OnInit } from "@angular/core";
import { TileArea, Tile } from "../../../base/controls/control";
import { ConfigurationBLL, WorkspaceConfig, StrategyServerContainer } from "../../bll/strategy.server";
import { Menu } from "../../../base/api/services/backend.service";
import { ChangeDetectorRef } from "@angular/core";
import { TradeService } from "../../bll/services";

declare var window: any;
let ip20strs = [];

@Component({
    moduleId: module.id,
    selector: "backtest",
    templateUrl: "backtest.component.html",
    providers: [
        Menu
    ]
})
export class BacktestComponent implements OnInit {
    tileArea: TileArea;
    contextMenu: Menu;
    private configBll = new ConfigurationBLL();
    private strategyContainer = new StrategyServerContainer();
    configs: Array<WorkspaceConfig>;
    config: WorkspaceConfig;
    curTemplate: any;
    bDetails: boolean;
    isModify: boolean = false;
    isInit: boolean = false;
    panelTitle: string;
    strategyCores: string[];

    constructor(private tgw: TradeService, private ref: ChangeDetectorRef) {

    }

    ngOnInit() {
    }


}