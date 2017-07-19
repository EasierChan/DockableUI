"use strict";

import { Component, OnInit } from "@angular/core";
import { AppStoreService } from "../../../base/api/services/backend.service";
import { DataTable } from "../../../base/controls/control";

@Component({
    moduleId: module.id,
    selector: "support",
    templateUrl: "support.html",
    styleUrls: ["../home/home.component.css", "./setting.css"]
})
export class SupportComponent implements OnInit {
    name: string = "支持";
    supportTable: DataTable;
    brokerTable: DataTable;

    constructor(private appServ: AppStoreService) {
    }

    ngOnInit() {
        this.createSupportTable();
        this.createBrokerTable();
    }

    createSupportTable() {
        this.supportTable = new DataTable();
        this.supportTable.RowIndex = false;
        this.supportTable.addColumn("名称", "支持");
        let row = this.supportTable.newRow();
        row.cells[0].Text = "上交所";
        row.cells[1].Text = "是";

        row = this.supportTable.newRow();
        row.cells[0].Text = "深交所";
        row.cells[1].Text = "是";

        row = this.supportTable.newRow();
        row.cells[0].Text = "大商所";
        row.cells[1].Text = "是";

        row = this.supportTable.newRow();
        row.cells[0].Text = "郑商所";
        row.cells[1].Text = "是";

        row = this.supportTable.newRow();
        row.cells[0].Text = "中金所";
        row.cells[1].Text = "是";

        row = this.supportTable.newRow();
        row.cells[0].Text = "上期所";
        row.cells[1].Text = "是";

        row = this.supportTable.newRow();
        row.cells[0].Text = "上金所";
        row.cells[1].Text = "是";

        row = this.supportTable.newRow();
        row.cells[0].Text = "新交所";
        row.cells[1].Text = "是";
    }

    createBrokerTable() {
        this.brokerTable = new DataTable();
        this.brokerTable.addColumn("名称", "股票支持", "期货交易");
        let row = this.brokerTable.newRow();
        row.cells[0].Text = "中信证券";
        row.cells[1].Text = "是";
        row.cells[2].Text = "否";

        row = this.brokerTable.newRow();
        row.cells[0].Text = "信达证券";
        row.cells[1].Text = "是";
        row.cells[2].Text = "否";

        row = this.brokerTable.newRow();
        row.cells[0].Text = "平安证券";
        row.cells[1].Text = "是";
        row.cells[2].Text = "否";

        row = this.brokerTable.newRow();
        row.cells[0].Text = "国信证券";
        row.cells[1].Text = "是";
        row.cells[2].Text = "否";

        row = this.brokerTable.newRow();
        row.cells[0].Text = "招商证券";
        row.cells[1].Text = "是";
        row.cells[2].Text = "否";

        row = this.brokerTable.newRow();
        row.cells[0].Text = "长城证券";
        row.cells[1].Text = "是";
        row.cells[2].Text = "否";

        row = this.brokerTable.newRow();
        row.cells[0].Text = "安信证券";
        row.cells[1].Text = "是";
        row.cells[2].Text = "否";

        row = this.brokerTable.newRow();
        row.cells[0].Text = "国泰君安证券";
        row.cells[1].Text = "是";
        row.cells[2].Text = "否";

        row = this.brokerTable.newRow();
        row.cells[0].Text = "世纪证券";
        row.cells[1].Text = "是";
        row.cells[2].Text = "否";

        row = this.brokerTable.newRow();
        row.cells[0].Text = "横华证券";
        row.cells[1].Text = "是";
        row.cells[2].Text = "否";

        row = this.brokerTable.newRow();
        row.cells[0].Text = "国融证券";
        row.cells[1].Text = "是";
        row.cells[2].Text = "否";

        row = this.brokerTable.newRow();
        row.cells[0].Text = "国都证券";
        row.cells[1].Text = "是";
        row.cells[2].Text = "否";

        row = this.brokerTable.newRow();
        row.cells[0].Text = "广发证券";
        row.cells[1].Text = "是";
        row.cells[2].Text = "否";

        row = this.brokerTable.newRow();
        row.cells[0].Text = "广州证券";
        row.cells[1].Text = "是";
        row.cells[2].Text = "否";

        row = this.brokerTable.newRow();
        row.cells[0].Text = "财通证券";
        row.cells[1].Text = "是";
        row.cells[2].Text = "否";

        row = this.brokerTable.newRow();
        row.cells[0].Text = "中泰证券";
        row.cells[1].Text = "是";
        row.cells[2].Text = "否";

        row = this.brokerTable.newRow();
        row.cells[0].Text = "中信建投";
        row.cells[1].Text = "是";
        row.cells[2].Text = "否";

        row = this.brokerTable.newRow();
        row.cells[0].Text = "南华期货";
        row.cells[1].Text = "否";
        row.cells[2].Text = "是";

        row = this.brokerTable.newRow();
        row.cells[0].Text = "中信期货";
        row.cells[1].Text = "否";
        row.cells[2].Text = "是";

        row = this.brokerTable.newRow();
        row.cells[0].Text = "信达期货";
        row.cells[1].Text = "否";
        row.cells[2].Text = "是";

        row = this.brokerTable.newRow();
        row.cells[0].Text = "东证期货";
        row.cells[1].Text = "否";
        row.cells[2].Text = "是";

        row = this.brokerTable.newRow();
        row.cells[0].Text = "兴证期货";
        row.cells[1].Text = "否";
        row.cells[2].Text = "是";
    }
}