"use strict";

import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { TileArea, Tile, DataTable, DataTableColumn } from "../../../base/controls/control";
import { IP20Service } from "../../../base/api/services/ip20.service";

@Component({
    moduleId: module.id,
    selector: "trade",
    templateUrl: "trade.component.html",
    styleUrls: ["trade.component.css"],
    providers: []
})
export class TradeComponent implements OnInit {
    areas: TileArea[];
    resTable: DataTable;
    monitorHeight: number;
    bDetails: boolean;

    constructor(private tgw: IP20Service) {
    }

    ngOnInit() {
        this.bDetails = false;
        let productArea = new TileArea();
        productArea.title = "Products";

        for (let i = 0; i < 10; ++i) {
            let tile = new Tile();
            tile.title = "hello";
            tile.iconName = "adjust";
            productArea.addTile(tile);
        }

        let strategyArea = new TileArea();
        strategyArea.title = "Strategies";

        for (let i = 0; i < 10; ++i) {
            let tile = new Tile();
            tile.title = "hello";
            tile.iconName = "adjust";
            strategyArea.addTile(tile);
        }

        let analyticArea = new TileArea();
        analyticArea.title = "Analytic";

        for (let i = 0; i < 10; ++i) {
            let tile = new Tile();
            tile.title = "hello";
            tile.iconName = "repeat";
            analyticArea.addTile(tile);
        }

        this.areas = [productArea, strategyArea, analyticArea];
        this.resTable = new DataTable("table2");
        this.resTable.addColumn2(new DataTableColumn("UKey", false, true));
        this.resTable.addColumn2(new DataTableColumn("Symbol", false, true));
        this.resTable.addColumn2(new DataTableColumn("ChineseName", false, true));
        this.resTable.addColumn2(new DataTableColumn("ReleaseData", false, true));
        this.resTable.addColumn2(new DataTableColumn("OutDate", false, true));

        this.tgw.addSlot({
            appid: 270,
            packid: 194,
            callback: msg => {
                console.info(msg);
            }
        });
        this.tgw.send(270, 194, { "head": { "realActor": "getDataTemplate" }, category: 0 }); // process templates
    }

    toggleMonitor() {
        if (this.bDetails) {
            this.monitorHeight = 30;
        } else {
            this.monitorHeight = 300;
        }

        this.bDetails = !this.bDetails;
    }
    loginTGW(): void {
        // get template back
        //  create back test channal
    }
}