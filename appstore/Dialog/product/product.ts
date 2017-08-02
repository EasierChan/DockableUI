"use strict";

import { Component, OnInit } from "@angular/core";
import { IP20Service } from "../../../base/api/services/ip20.service";
import { DataTable } from "../../../base/controls/control";

@Component({
    moduleId: module.id,
    selector: "product",
    templateUrl: "product.html",
    styleUrls: ["product.css"]
})
export class ProductComponent implements OnInit {
    productDetail: Table;
    futureTable: DataTable;
    stockTable: DataTable;

    constructor(private tgw: IP20Service) {
    }

    ngOnInit() {
        this.productDetail = new Table();
        this.productDetail.rows.push(["名称", "1000", "总资金规模", "1000", "昨日净值", "1000", "当日净值", "1000"]);
        this.productDetail.rows.push(["平仓盈亏", "1000", "浮动盈亏", "1000", "保证金", "1000", "股票账户可用资金"]);
        this.productDetail.rows.push(["期货账户可用资金", "1000", "期货账户总权益", "1000", "股票总市值", "1000", "股指期货总合约价值"]);
        this.productDetail.rows.push(["股票及股指期货总敞口", "1000", "商品期货总合约价值", "1000", "商品期货总合约轧差", "1000", "期货账户风险度"]);

        this.futureTable = new DataTable("table2");
        this.futureTable.addColumn("代码", "名称", "持仓量", "持仓金额");
        this.futureTable.backgroundColor = "transparent";
        this.stockTable = new DataTable("table2");
        this.stockTable.addColumn("代码", "名称", "持仓量", "持仓金额");
        this.stockTable.backgroundColor = "transparent";
        this.registerListener();
    }

    registerListener() {
        this.tgw.addSlot({
            appid: 260,
            packid: 232,
            callback: (msg) => {
                console.info(msg);
            }
        });
    }
}

export class Table {
    rows: any[] = [];
}