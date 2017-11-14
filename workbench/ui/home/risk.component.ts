"use strict";

import { Component, OnInit } from "@angular/core";
import { TradeService } from "../../bll/services";
import { AppStoreService } from "../../../base/api/services/backend.service";
import { ConfigurationBLL } from "../../bll/strategy.server";
import { DataTable } from "../../../base/controls/control";

@Component({
    moduleId: module.id,
    selector: "risk",
    templateUrl: "risk.html",
    styleUrls: ["home.component.css", "risk.css"]
})
export class RiskComponent implements OnInit {
    strategyTable: DataTable;
    accountTable: DataTable;
    risk_indexs: any[];
    account_info: any[];
    tblock_info: any[];
    productAppID: number;

    constructor(private trade: TradeService, private config: ConfigurationBLL,
        private appSrv: AppStoreService) {

    }

    ngOnInit() {
        this.productAppID = this.appSrv.getSetting().endpoints[0].tgw_apps.ids;
        this.strategyTable = new DataTable("table2");
        this.strategyTable.addColumn("产品ID", "风控名称", "当前值", "阈值", "触发方式", "状态");

        this.accountTable = new DataTable("table2");
        this.accountTable.addColumn("账户ID", "风控名称", "UKEY", "当前值", "阈值", "触发方式", "状态");

        this.loadExternalData();
        this.registerListeners();
    }

    registerListeners() {
        this.trade.addSlot({
            appid: 130,
            packid: 2002,
            callback: (msg) => {
                console.info(msg);
                msg.content.data.trade_account.forEach(item => {
                    let account = this.account_info.find(value => { return parseInt(value.acid) === item.group_id; });
                    if (account !== undefined && item.ukey !== 0) {
                        let row = this.accountTable.newRow();
                        row.cells[0].Text = account.acname;
                        row.cells[1].Text = this.risk_indexs.find(value => { return value.riskid === item.risk_id; }).riskname;
                        row.cells[2].Text = item.ukey;
                        row.cells[3].Text = item.used_v1;
                        row.cells[4].Text = item.limit_v1;
                        switch (item.operate) {
                            case 1:
                                row.cells[5].Text = "大于";
                                break;
                            case 2:
                                row.cells[5].Text = "大于等于";
                                break;
                            case 3:
                                row.cells[5].Text = "等于";
                                break;
                            case 4:
                                row.cells[5].Text = "小于等于";
                                break;
                            case 5:
                                row.cells[5].Text = "小于";
                                break;
                        }

                        row.cells[6].Text = item.risk_stat === 1 ? "启用" : "禁用";
                    }
                });

                msg.content.data.trade_block.forEach(item => {
                    let ca = this.tblock_info.find(value => { return parseInt(value.caid) === item.group_id; }) ;
                    let risk = this.risk_indexs.find(value => { return parseInt(value.riskid) === item.risk_id; });
                    if (ca !== undefined) {
                        let row = this.strategyTable.newRow();
                        row.cells[0].Text = ca.caname;
                        row.cells[1].Text = risk.riskname;
                        row.cells[2].Text = item.used_v1;
                        row.cells[3].Text = item.limit_v1;
                        switch (item.operate) {
                            case 1:
                                row.cells[4].Text = "大于";
                                break;
                            case 2:
                                row.cells[4].Text = "大于等于";
                                break;
                            case 3:
                                row.cells[4].Text = "等于";
                                break;
                            case 4:
                                row.cells[4].Text = "小于等于";
                                break;
                            case 5:
                                row.cells[4].Text = "小于";
                                break;
                        }

                        row.cells[5].Text = item.risk_stat === 1 ? "启用" : "禁用";
                    }
                });
            }
        });

        this.trade.send(130, 2001, {});
    }

    loadExternalData() {
        this.risk_indexs = this.config.get("risk_index");
        this.account_info = this.config.get("asset_account");
        this.tblock_info = this.config.getProducts();
    }
}