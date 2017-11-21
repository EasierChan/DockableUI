"use strict";

import { Component, OnInit, DoCheck, Input } from "@angular/core";
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
export class RiskComponent implements OnInit, DoCheck {
    strategyTable: DataTable;
    accountTable: DataTable;
    warnTable: DataTable;
    marketPlateTable: DataTable;
    varietiTable: DataTable;
    ukeyTable: DataTable;
    accountMap: any;
    productMap: any;
    accounts: any[];
    products: any[];
    selectedAccount: any;
    selectedProduct: any;
    selectedGroupInfo: any;
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
        this.accountTable.addColumn("账户ID", "风控名称", "当前值", "阈值", "触发方式", "状态");

        this.warnTable = new DataTable("table2")
        this.warnTable.addColumn("类型", "分类", "类目", "指标", "阈值", "当前", "状态")
        this.mockWarning()
        
        this.marketPlateTable = new DataTable('table2')
        this.marketPlateTable.addColumn("市场（板块）", "风控名称", "当前值", "阈值", "触发方式", "状态")

        this.varietiTable = new DataTable('table2')
        this.varietiTable.addColumn("品种", "风控名称", "当前值", "阈值", "触发方式", "状态")

        this.ukeyTable = new DataTable('table2')
        this.ukeyTable.addColumn("ukey", "风控名称", "当前值", "阈值", "触发方式", "状态")

        this.tactfulTable = new DataTable('table2')
        this.tactfulTable.addColumn( "分类", "类目", "指标", "阈值", "当前", "状态")

        this.loadExternalData();
        this.registerListeners();
    }

    convertData(msg) {
        this.selectedAccount = 0
        this.selectedProduct = 0
        this.accountMap = this.sortOutGroup(msg.content.data.trade_account)
        this.productMap = this.sortOutGroup(msg.content.data.trade_block)
        this.accounts = Object.keys(this.accountMap).map(key => {
            return {
                group_id: key,
                name: this.account_info.find(value => { return parseInt(value.acid) === parseInt(key) }).acname
            }
        })
        this.products = Object.keys(this.productMap).map(key => {
            return {
                group_id: key,
                name: this.tblock_info.find(value => { return parseInt(value.caid) === parseInt(key) }).caname
            }
        })
    }

    sortOutGroup(riskList) {
        let riskMap = {}
        riskList.forEach(item => {
            riskMap[item.group_id] = riskMap[item.group_id] || []
            riskMap[item.group_id].push(item)
        })
        return riskMap
    }
    
    ngDoCheck() {
        // console.log('ngDoCheck')
    }

    ngOnChanges(changeRecord) {
        // console.log('ngChanges')
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
            catg_lv1: 0,
            catg_lv2: 0,
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

    mapOperate(operate:number) {
        let value:string
        switch (operate) {
            case 1:
                value = "大于";
                break;
            case 2:
                value = "大于等于";
                break;
            case 3:
                value = "等于";
                break;
            case 4:
                value = "小于等于";
                break;
            case 5:
                value = "小于";
                break;
        }
        return value
    }

    mapMarket(catg_lv2: number) {
        let value: string
        switch (catg_lv2) {
            case 0:
                value = "无";
                break;
            case 1:
                value = "深圳";
                break;
            case 2:
                value = "上海";
                break;
            case 3:
                value = "all";
                break;
        }
        return value
    }

    mapPlate(catg_lv2: number) {
        let value: string
        switch (catg_lv2) {
            case 0:
                value = '无'
                break;
            case 1:
                value = '主板'
                break;
            case 2:
                value = '中小板'
                break;
            case 3:
                value = '创业板'
                break;
            case 4:
                value = '三板'
                break;
            case 5:
                value = 'all'
                break;
        }
        return value
    }

    mapVarieti(catg_lv2: number) {
        let value: string
        switch (catg_lv2) {
            case 0:
                value = '无'
                break;
            case 1:
                value = '股票'
                break;
            case 2:
                value = '债券'
                break;
            case 3:
                value = '基金'
                break;
            case 4:
                value = '现货'
                break;
            case 5:
                value = '货币市场工具 包括货币基金,回购,票据,短期债等等'
                break;
            case 6:
                value = '指数'
                break;
            case 7:
                value = '期货'
                break;
            case 8:
                value = '权证'
                break;
            case 9:
                value = '个股期权'
                break;
            case 10:
                value = 'all'
                break;
        }
        return value        
    }

    createSingleTable(riskRecord: any[]) {
        riskRecord.forEach(item => {
            let row, name
            if(this.selectedAccount) {
                row = this.accountTable.newRow()
                name = this.selectedGroupInfo.acname
            } else if(this.selectedProduct) {
                row = this.strategyTable.newRow()
                name = this.selectedGroupInfo.caname
            }
            row.cells[0].Text = name
            row.cells[1].Text = this.risk_indexs.find(value => { return parseInt(value.riskid) === parseInt(item.risk_id) }).riskname;
            row.cells[2].Text = item.used_v1
            row.cells[3].Text = item.limit_v1;
            row.cells[4].Text = this.mapOperate(item.operate)
            row.cells[5].Text = item.risk_stat === 1 ? "启用" : "禁用";
        })
    }

    createMarketPlateTable(riskRecord: any[]) {
        riskRecord.forEach(item => {
            let row = this.marketPlateTable.newRow()
            row.cells[0].Text = item.catg_lv1 === 1 ? this.mapMarket(item.catg_lv2) : this.mapPlate(item.catg_lv2)
            row.cells[1].Text = this.selectedAccount ? this.selectedGroupInfo.acname : this.selectedGroupInfo.caname
            row.cells[2].Text = item.used_v1
            row.cells[3].Text = item.limit_v1
            row.cells[4].Text = this.mapOperate(item.operate)
            row.cells[5].Text = item.risk_stat === 1 ? "启用" : "禁用";
        })
    }

    createVarietiTable(riskRecord: any[]) {
        riskRecord.forEach(item => {
            let row = this.varietiTable.newRow()
            row.cells[0].Text = this.mapVarieti(item.catg_lv2)
            row.cells[1].Text = this.selectedAccount ? this.selectedGroupInfo.acname : this.selectedGroupInfo.caname
            row.cells[2].Text = item.used_v1
            row.cells[3].Text = item.limit_v1
            row.cells[4].Text = this.mapOperate(item.operate)
            row.cells[5].Text = item.risk_stat === 1 ? "启用" : "禁用";
        })
    }

    createUkeyTable(riskRecord: any[]) {
        riskRecord.forEach(item => {
            let row = this.ukeyTable.newRow()
            row.cells[0].Text = item.ukey
            row.cells[1].Text = this.selectedAccount ? this.selectedGroupInfo.acname : this.selectedGroupInfo.caname
            row.cells[2].Text = item.used_v1
            row.cells[3].Text = item.limit_v1
            row.cells[4].Text = this.mapOperate(item.operate)
            row.cells[5].Text = item.risk_stat === 1 ? "启用" : "禁用";
        })
    }

    assortRisk(riskRecord: any[]) {
        this.createSingleTable(riskRecord.filter(item => item.ukey === 0 && item.catg_lv1 === 0))
        
        this.createMarketPlateTable(riskRecord.filter(item => item.ukey === 0 && (item.catg_lv1 === 1 || item.catg_lv1 === 2)))

        this.createVarietiTable(riskRecord.filter(item => item.ukey === 0 && item.catg_lv1 === 3))

        this.createUkeyTable(riskRecord.filter(item => item.ukey !== 0 && item.catg_lv1 === 0))
    }

    changeAccount(value) {
        let group_id = parseInt(value)
        this.selectedAccount = group_id
        if(group_id) {
            this.selectedProduct = 0
            this.selectedGroupInfo = this.account_info.find(value => { return parseInt(value.acid) === group_id })
            this.accountTable = new DataTable("table2");
            this.accountTable.addColumn("账户ID", "风控名称", "当前值", "阈值", "触发方式", "状态");
            this.assortRisk(this.accountMap[group_id])
        }
    }

    changeProduct(value) {
        let group_id = parseInt(value)
        this.selectedProduct = group_id
        if(group_id) {
            this.selectedAccount = 0
            this.selectedGroupInfo = this.tblock_info.find(value => { return parseInt(value.caid) === group_id })
            this.strategyTable =  new DataTable("table2");
            this.strategyTable.addColumn("产品ID", "风控名称", "当前值", "阈值", "触发方式", "状态");
            this.assortRisk(this.productMap[group_id])
        }
    }

    registerListeners() {
        let flag = 0
        setTimeout(() => {
            if(!flag) {
                this.convertData(this.mockMsg())
            }
        }, 1500)
        this.trade.addSlot({
            appid: 130,
            packid: 2002,
            callback: (msg) => {
                console.info(msg);
                flag =1
                this.convertData(msg)
                // msg.content.data.trade_account.forEach(item => {
                //     let account = this.account_info.find(value => { return parseInt(value.acid) === item.group_id; });
                //     if (account !== undefined && item.ukey !== 0) {
                //         let row = this.accountTable.newRow();
                //         row.cells[0].Text = account.acname;
                //         row.cells[1].Text = this.risk_indexs.find(value => { return value.riskid === item.risk_id; }).riskname;
                //         row.cells[2].Text = item.ukey;
                //         row.cells[3].Text = item.used_v1;
                //         row.cells[4].Text = item.limit_v1;
                //         switch (item.operate) {
                //             case 1:
                //                 row.cells[5].Text = "大于";
                //                 break;
                //             case 2:
                //                 row.cells[5].Text = "大于等于";
                //                 break;
                //             case 3:
                //                 row.cells[5].Text = "等于";
                //                 break;
                //             case 4:
                //                 row.cells[5].Text = "小于等于";
                //                 break;
                //             case 5:
                //                 row.cells[5].Text = "小于";
                //                 break;
                //         }

                //         row.cells[6].Text = item.risk_stat === 1 ? "启用" : "禁用";
                //     }
                // });

                // msg.content.data.trade_block.forEach(item => {
                //     let ca = this.tblock_info.find(value => { return parseInt(value.caid) === item.group_id; }) ;
                //     let risk = this.risk_indexs.find(value => { return parseInt(value.riskid) === item.risk_id; });
                //     if (ca !== undefined) {
                //         let row = this.strategyTable.newRow();
                //         row.cells[0].Text = ca.caname;
                //         row.cells[1].Text = risk.riskname;
                //         row.cells[2].Text = item.used_v1;
                //         row.cells[3].Text = item.limit_v1;
                //         switch (item.operate) {
                //             case 1:
                //                 row.cells[4].Text = "大于";
                //                 break;
                //             case 2:
                //                 row.cells[4].Text = "大于等于";
                //                 break;
                //             case 3:
                //                 row.cells[4].Text = "等于";
                //                 break;
                //             case 4:
                //                 row.cells[4].Text = "小于等于";
                //                 break;
                //             case 5:
                //                 row.cells[4].Text = "小于";
                //                 break;
                //         }

                //         row.cells[5].Text = item.risk_stat === 1 ? "启用" : "禁用";
                //     }
                // });
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