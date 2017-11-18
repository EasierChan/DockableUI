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
    warnTable: DataTable;
    marketTable: DataTable;
    varTable: DataTable;
    ukeyTable: DataTable;
    msg: any;
    get accountMap() {
        console.log('test get accountMap')
        let accountMap = {}
        let trade_account = this.msg.content.data.trade_account
        trade_account.forEach(item => {
            accountMap[item.group_id] = accountMap[item.group_id] || []
            accountMap[item.group_id].push(item)
        })
        return accountMap
    }
    get productMap() {
        let blockMap = {}
        let trade_block = this.msg.content.data.trade_block
        trade_block.forEach(item => {
            blockMap[item.group_id] = blockMap[item.group_id] || []
            blockMap[item.group_id].push(item)
        })
        return blockMap
    }
    get accounts() {
        return Object.keys(this.accountMap).map(key => {
            return {
                group_id: key,
                name: this.account_info.find(value => { return parseInt(value.acid) === parseInt(key) }).acname
            }
        })
    }
    get products() {
        return Object.keys(this.productMap).map(key => {
            return {
                group_id: key,
                name: this.tblock_info.find(value => { return parseInt(value.caid) === parseInt(key) }).caname
            }
        })
    }
    selectedAccount: any;
    selectedProduct: any;
    tactfulTable: DataTable;
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

        this.warnTable = new DataTable("table2")
        this.warnTable.addColumn("类型", "分类", "类目", "指标", "阈值", "当前", "状态")
        this.mockWarning()
        
        this.marketTable = new DataTable('table2')
        this.marketTable.addColumn("市场（板块）", "分类", "类目", "指标", "阈值", "当前", "状态")

        this.varTable = new DataTable('table2')
        this.varTable.addColumn("种类", "分类", "类目", "指标", "阈值", "当前", "状态")

        this.ukeyTable = new DataTable('table2')
        this.ukeyTable.addColumn("分类", "类目", "指标", "阈值", "当前", "状态")

        this.tactfulTable = new DataTable('table2')
        this.tactfulTable.addColumn( "分类", "类目", "指标", "阈值", "当前", "状态")

        this.loadExternalData();
        // this.registerListeners();
        this.msg = this.mockMsg()
        console.log(this.selectedProduct)
    }

    mockWarning() {
        let row = this.warnTable.newRow()
        row.cells[0].Text = '产品'
        row.cells[1].Text = '板块'
        row.cells[2].Text = '中小板'
        row.cells[3].Text = '1000'
        row.cells[4].Text = '1200'
        row.cells[5].Text = '1100'
        row.cells[6].Text = '预警'

        let rowS = this.warnTable.newRow()
        rowS.cells[0].Text = '账户'
        rowS.cells[1].Text = '市场'
        rowS.cells[2].Text = '深圳'
        rowS.cells[3].Text = '1000'
        rowS.cells[4].Text = '1999'
        rowS.cells[5].Text = '2000'
        rowS.cells[6].Text = '预警'
    }


    mockMsg() {
        let msg = {
            content: {
                data: {
                    trade_account: [],
                    trade_block: []
                }
            }
        }
        for(let i =0; i < 10; i++) {
            msg.content.data.trade_account.push(this.mock('account'))
            msg.content.data.trade_block.push(this.mock('product'))
        }
        return msg
    }

    mock(name) {
        let group_id
        if(name === 'account') {
            let validAcount = this.account_info.filter(item => item.acname)
            group_id = validAcount[Math.floor(validAcount.length * Math.random())].acid
        } else if(name === 'product') {
            let validProduct = this.tblock_info.filter(item => item.caname)
            group_id = validProduct[Math.floor(validProduct.length * Math.random())].caid
        }
        return {
            used_v1: 1000,
            used_v2: 1200,
            limit_v1: 900,
            limit_v2: 1200,
            catgl_v1: 0,
            catgl_v2: 0,
            ukey: 0,
            operate: Math.floor(Math.random() * 5 + 1),
            risk_id: this.risk_indexs[Math.floor(this.risk_indexs.length * Math.random())].riskid,
            risk_stat: 0,
            group_id: group_id
        }
    }

    riskSingle() {

    }

    riskCateg() {

    }

    riskUkey() {

    }

    assortRisk(risks: any[]) {
        let riskSingle = risks.filter(risk => {
            return risk.ukey === 0 && risk.catgl_v1 === 0
        })
        let riskCateg = risks.filter(risk => {
            return risk.ukey === 0 && risk.catgl_v1 !== 0
        })
        let riskUkey = risks.filter(risk => {
            return risk.ukey !== 0 && risk.catgl_v1 === 0
        })
        // console.log(this.accountMap)
        // setTimeout(() => {
        //     console.log(this.accountMap)
        // }, 1000)
    }

    changeAccount() {
        this.selectedProduct = undefined
        this.assortRisk(this.accountMap[this.selectedAccount])
    }

    changeProduct() {
        this.selectedAccount = undefined
        this.assortRisk(this.productMap[this.selectedProduct])
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