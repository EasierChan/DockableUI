"use strict";

import { Component, OnInit } from "@angular/core";
import { TradeService } from "../../bll/services";
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

    constructor(private trade: TradeService) {

    }

    ngOnInit() {
        this.strategyTable = new DataTable("table2");
        this.strategyTable.addColumn("产品ID", "风控名称", "当前值", "阈值", "触发方式", "状态");

        this.accountTable = new DataTable("table2");
        this.accountTable.addColumn("账户ID", "风控名称", "UKEY", "当前值", "阈值", "触发方式", "状态");

        this.loadExternalData();
        this.registerListeners();
        this.trade.send(130, 2001, {});
    }

    registerListeners() {
        this.trade.addSlot({
            appid: 130,
            packid: 2002,
            callback: (msg) => {
                console.info(msg);
                msg.content.data.trade_account.forEach(item => {
                    let row = this.accountTable.newRow();
                    row.cells[0].Text = this.account_info.find(value => { return value.account_id === item.group_id; }).broker_customer_code;
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
                            row.cells[5].Text = "小于";
                            break;
                        case 5:
                            row.cells[5].Text = "小于等于";
                            break;
                    }

                    row.cells[6].Text = item.risk_stat === 1 ? "启用" : "禁用";
                });

            }
        });
    }

    loadExternalData() {
        this.risk_indexs = [
            {
                "riskid": 1,
                "riskname": "交易所股票持仓总金额限制"
            },
            {
                "riskid": 2,
                "riskname": "单只权益类证券持仓占总股票股本比例"
            },
            {
                "riskid": 3,
                "riskname": "单只证券买入成本占账户净资本比例"
            },
            {
                "riskid": 4,
                "riskname": "当日单只股票挂买金额限制"
            },
            {
                "riskid": 7,
                "riskname": "当日单次下单最大股数限制"
            },
            {
                "riskid": 8,
                "riskname": "当日最大仓位限制"
            },
            {
                "riskid": 9,
                "riskname": "当日最大挂买委托单数限制"
            },
            {
                "riskid": 10,
                "riskname": "当日最大挂买委托股数限制"
            },
            {
                "riskid": 11,
                "riskname": "当日最大挂卖委托单数限制"
            },
            {
                "riskid": 12,
                "riskname": "当日最大挂卖委托股数限制"
            },
            {
                "riskid": 13,
                "riskname": "当日最大撤单总笔数限制"
            },
            {
                "riskid": 14,
                "riskname": "当日最大买入股数限制"
            },
            {
                "riskid": 15,
                "riskname": "当日最大卖出股数限制"
            },
            {
                "riskid": 16,
                "riskname": "当日最大未响应委托单数限制"
            },
            {
                "riskid": 17,
                "riskname": "单日最大买待总金额"
            },
            {
                "riskid": 18,
                "riskname": "总敞口"
            },
            {
                "riskid": 19,
                "riskname": "敞口净值比"
            },
            {
                "riskid": 20,
                "riskname": "单位净值"
            },
            {
                "riskid": 21,
                "riskname": "单个股票净值比例"
            },
            {
                "riskid": 22,
                "riskname": "单个股票流通比"
            },
            {
                "riskid": 23,
                "riskname": "单只股票占总股本比例"
            },
            {
                "riskid": 24,
                "riskname": "单个股票在板块的净值比例"
            },
            {
                "riskid": 25,
                "riskname": "板块总市值占总净值比例"
            },
            {
                "riskid": 26,
                "riskname": "股票总市值占总净值比例"
            },
            {
                "riskid": 27,
                "riskname": "期货总合约价值（非轧差）\/净值"
            },
            {
                "riskid": 28,
                "riskname": "股票基金市值\/净值"
            },
            {
                "riskid": 29,
                "riskname": "股票基金和股指期货总市值（轧差）\/净值"
            },
            {
                "riskid": 30,
                "riskname": "商品期货合约价值（轧差）\/净值"
            },
            {
                "riskid": 31,
                "riskname": "商品期货合约价值（非轧差）\/净值"
            },
            {
                "riskid": 32,
                "riskname": "债券和空头国债期货合约价值（轧差）\/净值"
            },
            {
                "riskid": 33,
                "riskname": "期货风险率"
            },
            {
                "riskid": 34,
                "riskname": "单个品种的保证金\/净值"
            }
        ];

        this.account_info = [
            {
                "account_id": 2,
                "broker_customer_code": "10007177"
            },
            {
                "account_id": 10,
                "broker_customer_code": "8009164291"
            },
            {
                "account_id": 11,
                "broker_customer_code": "120301232"
            },
            {
                "account_id": 14,
                "broker_customer_code": "275508085"
            },
            {
                "account_id": 17,
                "broker_customer_code": "809086000022"
            },
            {
                "account_id": 18,
                "broker_customer_code": "69300012"
            },
            {
                "account_id": 23,
                "broker_customer_code": "275508109"
            },
            {
                "account_id": 201,
                "broker_customer_code": "16039"
            }
        ];
    }
}