"use strict";

import { Component, OnInit } from "@angular/core";
import { IP20Service } from "../../../base/api/services/ip20.service";

@Component({
    moduleId: module.id,
    selector: "product",
    templateUrl: "product.html",
    styleUrls: ["product.css"]
})
export class ProductComponent implements OnInit {
    productDetail: Table;

    constructor(private tgw: IP20Service) {
    }

    ngOnInit() {
        this.productDetail = new Table();
        this.productDetail.rows[0] = [];
        this.productDetail.rows.push("名称", "总资金规模", "昨日净值", "当日净值");
        this.productDetail.rows.push("平仓盈亏", "浮动盈亏", "保证金", "股票账户可用资金");
        this.productDetail.rows.push("期货账户可用资金", "期货账户总权益", "股票总市值", "股指期货总合约价值");
        this.productDetail.rows.push("总敞口", "总资金规模", "昨日净值", "当日净值");

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