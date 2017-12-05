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
    warnTable: DataTable;
    isCollapsed: boolean;
    singleTable: DataTable;
    singleTableName: string = "账户";
    marketPlateTable: DataTable;
    varietiTable: DataTable;
    ukeyTable: DataTable;
    tactfulTable: DataTable;
    risk_indexs: any[];
    account_info: any[];
    tblock_info: any[];
    productAppID: number;
    tab: {
        tabList: {
            tabId: number;
            name: string;
            contentList: any[];
        }[];
        selectedTab: {
            name: string;
            contentList: any[];
        };
        selectedChild?: any;
    };
    riskData: {
        trade_account: any[];
        trade_block: any[];
    } = {
        trade_account: [],
        trade_block: []
    }

    constructor(private trade: TradeService, private config: ConfigurationBLL, private appSrv: AppStoreService) {

    }

    ngOnInit() {
        this.productAppID = this.appSrv.getSetting().endpoints[0].tgw_apps.ids;
        this.loadExternalData();
        this.initTab();
        this.reLoadAllTable();
        this.reLoadTable("warn");
        this.registerListeners();
    }

    registerListeners() {
        this.trade.addSlot({
            appid: 130,
            packid: 2002,
            callback: (msg) => {
                console.info(msg);
                this.riskData.trade_account = this.riskData.trade_account.concat(msg.content.data.trade_account);
                this.riskData.trade_block = this.riskData.trade_block.concat(msg.content.data.trade_block);
                this.updateWarnTable(this.riskData);
            }
        });
        this.trade.send(130, 2001, {});
    }

    updateWarnTable(msg) {
        msg.trade_account.filter(this.isRiskWarn)
            .forEach(item => {
                let row = this.warnTable.newRow();
                let { categroy, categroyTop } = this.getRiskCatg(item);
                row.cells[0].Text = "账户";
                row.cells[1].Text = this.account_info.find(value => Number(value.acid) === item.group_id).acname,
                row.cells[2].Text = categroyTop;
                row.cells[3].Text = categroy;
                row.cells[4].Text = this.getRiskById(item.risk_id).riskname;
                row.cells[5].Text = item.limit_v1;
                row.cells[6].Text = item.used_v1;
                row.cells[7].Text = this.getWarnLevel(item);
            })

        msg.trade_block.filter(this.isRiskWarn)
            .forEach(item => {
                let row = this.warnTable.newRow();
                let { categroy, categroyTop } = this.getRiskCatg(item);
                row.cells[0].Text = "产品";
                row.cells[1].Text = this.tblock_info.find(value => Number(value.caid) === item.group_id).caname,
                row.cells[2].Text = categroyTop;
                row.cells[3].Text = categroy;
                row.cells[4].Text = this.getRiskById(item.risk_id).riskname;
                row.cells[5].Text = item.limit_v1;
                row.cells[6].Text = item.used_v1;
                row.cells[7].Text = this.getWarnLevel(item);
            })
    }
    
    initTab() {
        this.tab = {
            tabList: [],
            selectedTab: null
        };
        this.addTabItem("账户", this.account_info.map(value => {
            return {
                name: value.acname,
                id: value.acid
            }
        }));
        this.addTabItem("产品", this.tblock_info.map(value => {
            return {
                name: value.caname,
                id: value.caid
            }
        }));
        this.addTabItem("策略", [])
        this.checkoutTab(this.tab.tabList[0].tabId);
    }

    addTabItem(name: string, contentList: any[]) {
        this.tab.tabList.push({
            tabId: this.tab.tabList.length,
            name,
            contentList
        })
    }

    reLoadAllTable() {
        this.reLoadTable("single");
        this.reLoadTable("marketPlate");
        this.reLoadTable("varieti");
        this.reLoadTable("ukey");
        this.reLoadTable("tactful");
    }

    loadExternalData() {
        this.risk_indexs = this.config.get("risk_index");
        this.account_info = this.config.get("asset_account");
        this.tblock_info = this.config.getProducts();
    }

    updateTable(risks, name) {
        risks.filter(value => value.ukey === 0 && value.catg_lv1 === 0)
            .forEach(item => {
                let row = this.singleTable.newRow();
                row.cells[0].Text = name;
                row.cells[1].Text = this.getRiskById(item.risk_id).riskname;
                row.cells[2].Text = item.used_v1;
                row.cells[3].Text = item.limit_v1;
                row.cells[4].Text = this.mapOperate(item.operate);
                row.cells[5].Text = this.getRiskStatType(item.risk_stat);
            })

        risks.filter(value => { value.ukey === 0 && (value.catg_lv1 === 1 || value.catg_lv1 === 2) })
            .forEach(item => {
                let row = this.marketPlateTable.newRow();
                row.cells[0].Text = this.getRiskCatg(item).categroy;
                row.cells[1].Text = this.getRiskById(item.risk_id).riskname;
                row.cells[2].Text = item.used_v1;
                row.cells[3].Text = item.limit_v1;
                row.cells[4].Text = this.mapOperate(item.operate);
                row.cells[5].Text = this.getRiskStatType(item.risk_stat);
            })

        risks.filter(value => value.ukey === 0 && value.catg_lv1 === 3)
            .forEach(item => {
                let row = this.varietiTable.newRow();
                row.cells[0].Text = this.getRiskCatg(item).categroy;
                row.cells[1].Text = this.getRiskById(item.risk_id).riskname;
                row.cells[2].Text = item.used_v1;
                row.cells[3].Text = item.limit_v1;
                row.cells[4].Text = this.mapOperate(item.operate);
                row.cells[5].Text = this.getRiskStatType(item.risk_stat);
            })

        risks.filter(value => value.ukey !== 0 && value.catg_lv1 === 0)
            .forEach(item => {
                let row = this.ukeyTable.newRow();
                row.cells[0].Text = item.ukey;
                row.cells[1].Text = this.getRiskById(item.risk_id).riskname;
                row.cells[2].Text = item.used_v1;
                row.cells[3].Text = item.limit_v1;
                row.cells[4].Text = this.mapOperate(item.operate);
                row.cells[5].Text = this.getRiskStatType(item.risk_stat);
            })
    }

    checkoutTab(tabId) {
        this.tab.selectedTab = this.tab.tabList.find(value => value.tabId === tabId);
    }

    checkoutGroup(tabId, id) {
        this.tab.selectedChild = this.tab.tabList.find(value => value.tabId === tabId).contentList.find(item => item.id === id);
        this.singleTableName = `${this.tab.selectedTab.name}风控`;
        this.reLoadAllTable();
        switch(tabId) {
            case this.tab.tabList[0].tabId:
                this.updateTable(this.riskData.trade_account.filter(item => item.group_id === Number(this.tab.selectedChild.id)), this.tab.selectedChild.name);
                break;
            case this.tab.tabList[1].tabId:
                this.updateTable(this.riskData.trade_block.filter(item => item.group_id === Number(this.tab.selectedChild.id)), this.tab.selectedChild.name);
                break;
        }
    }

    toggleWarn() {
        this.isCollapsed = !this.isCollapsed;
    }

    reLoadTable(name:string) {
        let table: DataTable = new DataTable("table2");
        switch(name) {
            case "warn":
                table.addColumn("类型", "账户/产品ID", "分类", "类目", "风控名称", "阈值", "当前", "状态");
                this.warnTable = table;
                break;
            case "single":
                table.addColumn("账户/产品ID", "风控名称", "当前值", "阈值", "触发方式", "状态");
                this.singleTable = table;
                break;
            case "marketPlate":
                table.addColumn("市场（板块）", "风控名称", "当前值", "阈值", "触发方式", "状态");
                this.marketPlateTable = table;
                break;
            case "varieti":
                table.addColumn("品种", "风控名称", "当前值", "阈值", "触发方式", "状态");
                this.varietiTable = table;
                break;
            case "ukey":
                table.addColumn("UKEY", "风控名称", "当前值", "阈值", "触发方式", "状态");
                this.ukeyTable = table;
                break;
            case "tactful":
                table.addColumn("策略", "指标", "阈值", "当前", "状态");
                this.tactfulTable = table;
                break;
        }
    }

    getWarnLevel(riskRecord) {
        let type = "normal";
        if(this.isRiskWarn(riskRecord)) {
            type = "warn";
        }
        if(riskRecord.used_v1 >= riskRecord.limit_v1) {
            type = "danger";
        }
        return type
    }

    getRiskStatType(riskStat) {
        return riskStat === 1 ? "启用" : "禁用"
    }

    getRiskById(riskId) {
        return this.risk_indexs.find(item => { return parseInt(item.riskid) === riskId })
    }

    isRiskWarn(riskRecord) {
        return riskRecord.used_v1 >= riskRecord.limit_v2
    }

    getRiskCatg(riskRecord) {
        let categroy: string;
        let categroyTop: string;
        switch(riskRecord.catg_lv1) {
            case 0:
                categroy = null;
                categroyTop = null;
                break;
            case 1:
                categroy = this.mapMarket(riskRecord.catg_lv2);
                categroyTop = "市场";
                break;
            case 2:
                categroy = this.mapPlate(riskRecord.catg_lv2);
                categroyTop = "板块";
                break;
            case 3:
                categroy = this.mapVarieti(riskRecord.catg_lv2);
                categroyTop = "品种";
                break;
        }
        if (riskRecord.ukey) {
            categroy = riskRecord.ukey;
            categroyTop = '标的';
        }
        return { categroy, categroyTop }
    }

    mapOperate(operate:number) {
        let value:string;
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

    mapCategroy_lv1(catg_lv1: number) {
        let value: string;
        switch (catg_lv1) {
            case 0:
                value = "无";
                break;
            case 1:
                value = "市场";
                break;
            case 2:
                value = "板块";
                break;
            case 3:
                value = "品种";
                break;
        }
        return value        
    }

    mapMarket(catg_lv2: number) {
        let value: string;
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
        let value: string;
        switch (catg_lv2) {
            case 0:
                value = "无";
                break;
            case 1:
                value = "主板";
                break;
            case 2:
                value = "中小板";
                break;
            case 3:
                value = "创业板";
                break;
            case 4:
                value = "三板";
                break;
            case 5:
                value = "all";
                break;
        }
        return value
    }

    mapVarieti(catg_lv2: number) {
        let value: string;
        switch (catg_lv2) {
            case 0:
                value = "无";
                break;
            case 1:
                value = "股票";
                break;
            case 2:
                value = "债券";
                break;
            case 3:
                value = "基金";
                break;
            case 4:
                value = "现货";
                break;
            case 5:
                value = "货币市场工具 包括货币基金,回购,票据,短期债等等";
                break;
            case 6:
                value = "指数";
                break;
            case 7:
                value = "期货";
                break;
            case 8:
                value = "权证";
                break;
            case 9:
                value = "个股期权";
                break;
            case 10:
                value = "all";
                break;
        }
        return value        
    }
}


// export interface Msg {
//     trade_account: {
//         group_id: number;
//     }[];
//     trade_block: {
//         group_id: number;
//     }[];
// }