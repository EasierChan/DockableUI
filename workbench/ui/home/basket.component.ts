/**
 * created by 2017/12/07
 */
"use strict";

import { Component, OnInit } from "@angular/core";
import { VBoxDirective } from "../../../base/controls/user.component";
import { DataTable } from "../../../base/controls/control";
import { ConfigurationBLL } from "../../bll/strategy.server";
import { File, AppStoreService } from "../../../base/api/services/backend.service";
import { QtpService } from "../../bll/services";
import { SSGW_MSG, ServiceType, BasketPCF } from "../../../base/api/model";

@Component({
    moduleId: module.id,
    selector: "basket-admin",
    templateUrl: "basket.html",
    styleUrls: ["basket.css"]
})
export class BasketComponent implements OnInit {
    basketsTable: DataTable;
    items: any[];

    constructor(private appsrv: AppStoreService, private tradeEndPoint: QtpService, private configBll: ConfigurationBLL) {
    }

    ngOnInit() {
        this.basketsTable = new DataTable("table2");
        this.basketsTable.addColumn("名称", "价格");
        this.items = [];

        this.registerListeners();
        // File.readPCF("/mnt/dropbox/basket/basket_example.bkt").then((value: BasketPCF) => {
        //     console.info(value.params);
        // });
    }

    registerListeners() {
        this.tradeEndPoint.addSlotOfCMS("getBasketInfo", (data) => {
            let obj = JSON.parse(data.toString());
            this.basketsTable.rows.length = 0;
            obj.body.forEach(item => {
                let row = this.basketsTable.newRow();
                row.cells[0].Data = item.basketid;
                row.cells[0].Text = item.basket_name;
                row.cells[0].Text = "0.0000";
            });
        }, this);

        this.tradeEndPoint.addSlotOfCMS("getBasketTradingDay", (data) => {
            let obj = JSON.parse(data.toString());
            obj.body.forEach(item => {
                this.items.push({ title: item.trday, id: item.basketid });
            });
        }, this);

        this.tradeEndPoint.sendToCMS("getBasketInfo", JSON.stringify({ data: { body: {} } }));

        this.basketsTable.onRowDBClick = (row) => {
            this.tradeEndPoint.sendToCMS("getBasketTradingDay", JSON.stringify({ data: { body: { basketid: row.cells[0].Data } } }));
        };
    }
}
