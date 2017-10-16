"use strict";

import { Component, OnInit } from "@angular/core";
import { IP20Service } from "../../../base/api/services/ip20.service";
import { DataTable } from "../../../base/controls/control";
import { AppStoreService } from "../../../base/api/services/backend.service";

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
    isonpack: any;
    productAppID: number;

    constructor(private tgw: IP20Service, private appsrv: AppStoreService) {
    }

    ngOnInit() {
        this.productAppID = this.appsrv.getSetting().endpoints[0].tgw_apps.ids;
        this.productDetail = new Table();
        this.productDetail.rows.push(["产品名称", "1000", "总资金规模", "1000", "昨日净值", "1000", "当日净值", "1000"]);
        this.productDetail.rows.push(["平仓盈亏", "1000", "浮动盈亏", "1000", "保证金", "1000", "股票账户可用资金"]);
        this.productDetail.rows.push(["期货账户可用资金", "1000", "期货账户总权益", "1000", "股票总市值", "1000", "股指期货总合约价值"]);
        this.productDetail.rows.push(["股票及股指期货总敞口", "1000", "商品期货总合约价值", "1000", "商品期货总合约轧差", "1000", "期货账户风险度"]);

        this.futureTable = new DataTable("table2");
        this.futureTable.addColumn("代码", "名称", "持仓方向", "持仓量", "合约价值");
        this.futureTable.backgroundColor = "transparent";
        this.stockTable = new DataTable("table2");
        this.stockTable.addColumn("代码", "名称", "持仓量", "持仓金额");
        this.stockTable.backgroundColor = "transparent";

        this.isonpack = {};
        this.registerListener();
    }

    registerListener() {
        this.tgw.addSlot({
            appid: this.productAppID,
            packid: 251,
            callback: (msg) => {
                console.info(msg);
                switch (msg.content.head.actor) {
                    case "getMonitorProductsAns":
                        let productDetail = JSON.parse(msg.content.body).body[0];
                        this.productDetail.rows[0][1] = productDetail.product_name;
                        this.productDetail.rows[0][3] = productDetail.pretotalint;
                        this.productDetail.rows[0][5] = productDetail.pre_netvalue;
                        this.productDetail.rows[0][7] = productDetail.netvalue;
                        this.productDetail.rows[1][1] = productDetail.mtm_closepl;
                        this.productDetail.rows[1][3] = productDetail.mtm_posipl;
                        this.productDetail.rows[1][5] = productDetail.totalmargin;
                        this.productDetail.rows[1][7] = productDetail.stock_valid_amt;
                        this.productDetail.rows[2][1] = productDetail.future_valid_amt;
                        this.productDetail.rows[2][3] = productDetail.future_interests;
                        this.productDetail.rows[2][5] = productDetail.stocksMarketValue;
                        this.productDetail.rows[2][7] = productDetail.spifCap;
                        this.productDetail.rows[3][1] = productDetail.risk_exposure; //
                        this.productDetail.rows[3][3] = productDetail.commodityFuturesCap;
                        this.productDetail.rows[3][5] = productDetail.commodityFuturesNetting;
                        this.productDetail.rows[3][7] = productDetail.futures_risk;
                        productDetail = null;
                        break;
                    case "getProductStockHoldWeightAns":
                        if (msg.content.head.pkgCnt === msg.content.head.pkgIdx + 1) {
                            let stockArr = msg.content.head.pkgCnt === 1 ? JSON.parse(msg.content.body).body
                                : JSON.parse(this.isonpack[msg.content.head.pkgId] + msg.content.body).body;

                            stockArr.forEach(item => {
                                let row = this.stockTable.newRow();
                                row.cells[0].Text = item.marketcode;
                                row.cells[1].Text = item.chabbr;
                                row.cells[2].Text = item.total_vol;
                                row.cells[3].Text = item.total_cost;
                            });

                            stockArr = null;
                        } else {
                            this.isonpack[msg.content.head.pkgId] = this.isonpack.hasOwnProperty(msg.content.head.pkgId)
                                ? this.isonpack[msg.content.head.pkgId] + msg.content.body : msg.content.body;
                        }
                        break;
                    case "getProductFuturesHoldWeightAns":
                        if (msg.content.head.pkgCnt === msg.content.head.pkgIdx + 1) {
                            let futureArr = msg.content.head.pkgCnt === 1 ? JSON.parse(msg.content.body).body
                                : JSON.parse(this.isonpack[msg.content.head.pkgId] + msg.content.body).body;

                            futureArr.forEach(item => {
                                let row = this.futureTable.newRow();
                                row.cells[0].Text = item.marketcode;
                                row.cells[1].Text = item.chabbr;
                                row.cells[2].Text = item.direction === "B" ? "多仓" : "空仓";
                                row.cells[3].Text = item.total_vol;
                                row.cells[4].Text = item.total_cost;
                            });

                            futureArr = null;
                        } else {
                            this.isonpack[msg.content.head.pkgId] = this.isonpack.hasOwnProperty(msg.content.head.pkgId)
                                ? this.isonpack[msg.content.head.pkgId] + msg.content.body : msg.content.body;
                        }
                        break;
                }
            }
        });
    }
}

export class Table {
    rows: any[] = [];
}