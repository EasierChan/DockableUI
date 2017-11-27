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
    singleTable: DataTable;
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
    riskData: any;

    constructor(private trade: TradeService, private config: ConfigurationBLL, private appSrv: AppStoreService) {

    }

    ngOnInit() {
        this.productAppID = this.appSrv.getSetting().endpoints[0].tgw_apps.ids;
        this.loadExternalData();
        this.initTab();
        this.reLoadAllTable();
        this.registerListeners();
    }

    registerListeners() {
        this.trade.addSlot({
            appid: 130,
            packid: 2002,
            callback: (msg) => {
                console.info(msg);
                this.riskData = msg.content.data;
            }
        });
        this.trade.send(130, 2001, {});
    }

    initTab() {
        this.tab = {
            tabList: [
                {
                    tabId: 0,
                    name: "帐号",
                    contentList: this.account_info.map(value => {
                        return {
                            name: value.acname,
                            groupId: value.acid
                        }
                    })
                },
                {
                    tabId: 1,
                    name: "产品",
                    contentList: this.tblock_info.map(value => {
                        return {
                            name: value.caname,
                            groupId: value.caid
                        }
                    })
                }
            ],
            selectedTab: null
        };
        this.tab.selectedTab = this.tab.tabList[0];
    }

    reLoadAllTable() {
        this.reLoadTable("warn");
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

    parseRiskRecord(riskRecord:any) {
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
        let isDanger = riskRecord.used_v1 >= riskRecord.limit_v2; // 
        let dangerType = "normal";
        if (isDanger) dangerType = "warn";
        if (riskRecord.used_v1 >= riskRecord.limit_v1) dangerType = "danger";
        let groupType = this.getRiskRecordByGroupId(riskRecord.group_id).type;
        let groupTypeMap = {
            account: "帐号",
            product: "产品"
        };
        return {
            groupType: groupTypeMap[groupType],
            used_v1: riskRecord.used_v1,
            limit_v1: riskRecord.limit_v1,
            operate: this.mapOperate(riskRecord.operate),
            status: riskRecord.risk_stat === 1 ? "启用" : "禁用",
            riskName: this.risk_indexs.find(value => { return parseInt(value.riskid) === parseInt(riskRecord.risk_id) }).riskname,
            ukey: riskRecord.ukey,
            name: this.tab.selectedChild.name,
            categroy: categroy,
            categropTop: categroyTop,
            isDanger,
            dangerType
        }
    }

    addARiskRecord(riskRecord:any) {
        let cellData = this.parseRiskRecord(riskRecord);
        if(cellData.isDanger) { // 预警信息
            let row = this.warnTable.newRow();
            row.cells[0].Text = cellData.groupType;
            row.cells[1].Text = cellData.categropTop;
            row.cells[2].Text = cellData.categroy;
            row.cells[3].Text = "指标";
            row.cells[4].Text = cellData.limit_v1;
            row.cells[5].Text = cellData.used_v1;
            row.cells[6].Text = cellData.dangerType;
        }
        if (riskRecord.ukey === 0 && riskRecord.catg_lv1 === 0) {
            let row = this.singleTable.newRow()
            row.cells[0].Text = cellData.name;
            row.cells[1].Text = cellData.riskName;
            row.cells[2].Text = cellData.used_v1;
            row.cells[3].Text = cellData.limit_v1;
            row.cells[4].Text = cellData.operate;
            row.cells[5].Text = cellData.status;
        } else if(riskRecord.ukey === 0 && (riskRecord.catg_lv1 === 1 || riskRecord.catg_lv1 === 2)) {
            let row = this.marketPlateTable.newRow();
            row.cells[0].Text = cellData.categroy;
            row.cells[1].Text = cellData.riskName;
            row.cells[2].Text = cellData.used_v1;
            row.cells[3].Text = cellData.limit_v1;
            row.cells[4].Text = cellData.operate;
            row.cells[5].Text = cellData.status;
        } else if(riskRecord.ukey === 0 && riskRecord.catg_lv1 === 3) {
            let row = this.varietiTable.newRow();
            row.cells[0].Text = cellData.categroy;
            row.cells[1].Text = cellData.riskName;
            row.cells[2].Text = cellData.used_v1;
            row.cells[3].Text = cellData.limit_v1;
            row.cells[4].Text = cellData.operate;
            row.cells[5].Text = cellData.status;
        } else if(riskRecord.ukey !== 0 && riskRecord.catg_lv1 === 0) {
            let row = this.ukeyTable.newRow();
            row.cells[0].Text = cellData.ukey;
            row.cells[1].Text = cellData.riskName;
            row.cells[2].Text = cellData.used_v1;
            row.cells[3].Text = cellData.limit_v1;
            row.cells[4].Text = cellData.operate;
            row.cells[5].Text = cellData.status;
        }
    }

    reLoadTable(name:string) {
        let table: DataTable = new DataTable("table2");
        switch(name) {
            case "warn":
                table.addColumn("类型", "分类", "类目", "指标", "阈值", "当前", "状态");
                this.warnTable = table;
                break;
            case "single":
                table.addColumn(this.tab.selectedTab.name + "ID", "风控名称", "当前值", "阈值", "触发方式", "状态");
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
                table.addColumn("ukey", "风控名称", "当前值", "阈值", "触发方式", "状态");
                this.ukeyTable = table;
                break;
            case "tactful":
                table.addColumn("策略", "指标", "阈值", "当前", "状态");
                this.tactfulTable = table;
                break;
        }
    }

    getRiskRecordByGroupId(groupId) {
        let riskList = this.riskData.trade_account.filter(value => value.group_id === groupId);
        let type:string;
        if(riskList.length) {
            type = "account";
        } else {
            riskList = this.riskData.trade_block.filter(value => value.group_id === groupId);
            type = "product";
        }
        return {
            riskList,
            type
        }
    }

    checkoutGroup(groupId) {
        this.tab.selectedChild = this.tab.selectedTab.contentList.find(value => value.groupId === groupId);
        this.reLoadAllTable();
        this.getRiskRecordByGroupId(parseInt(groupId)).riskList.forEach(item => this.addARiskRecord(item));
    
    }

    checkoutTab(tabId) {
        this.tab.selectedTab = this.tab.tabList.find(value => value.tabId === tabId);
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