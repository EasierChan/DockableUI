"use strict";

import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { QtpService } from "../../bll/services";
import { AppStoreService, SecuMasterService } from "../../../base/api/services/backend.service";
import { ConfigurationBLL } from "../../bll/strategy.server";
import { DataTable } from "../../../base/controls/control";
import { ServiceType } from "../../../base/api/model";
import { Observable } from "rxjs/Rx";

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
    tab: Tab;
    riskData = {
        account: [],
        block: [],
        trace: []
    };
    tmpT: NodeJS.Timer;

    constructor(private trade: QtpService, private config: ConfigurationBLL, private ref: ChangeDetectorRef,
        private appSrv: AppStoreService,  private secuinfo: SecuMasterService) {

    }

    ngOnInit() {
        this.productAppID = this.appSrv.getSetting().endpoints[0].tgw_apps.ids;
        this.loadExternalData();
        this.initTab();
        this.reLoadAllTable();
        this.reLoadTable("warn");
        this.registerListeners();
        this.sendCmsRequest("getRiskCfg", { out_type: 5 }); // 获取账户风控配置
        this.sendCmsRequest("getRiskCfg", { out_type: 2 }); // 获取产品风控配置
        this.sendCmsRequest("getRiskCfg", { out_type: 3 }); // 获取策略风控配置
    }

    ngOnDestroy() {
        clearInterval(this.tmpT)
    }

    test() {
        const accounts = this.config.get("asset_account");
        const pds = this.config.getProducts();
        const riskTypes = this.config.get("risk_index");

        class Risk {
            group_id: number;
            risk_id: number;
            used_v1: number;
            constructor(group_id, risk_id, used_v1) {
                this.group_id = group_id;
                this.risk_id = risk_id;
                this.used_v1 = used_v1;
            }
        }

        let data = {
            data: {
                trade_account: [],
                trade_block: []
            }
        }

        accounts.forEach((account) => {
            riskTypes.forEach(type => {
                data.data.trade_account.push(new Risk(Number(account.acid), Number(type.riskid), Math.round(Math.random() * 1000 )));
            })
        })

        pds.forEach(pd => {
            riskTypes.forEach(type => {
                data.data.trade_block.push(new Risk(Number(pd.caid), Number(type.riskid), Math.round(Math.random() * 1000)));
            })
        })

        this.riskListener(data);

        console.log(data)
    }

    registerListeners() {
        let count = 0;
        this.trade.addSlotOfCMS("getRiskCfg", (msg) => {
            count ++;
            let data = JSON.parse(msg.toString());
            console.log(data)
            if (data.msret.msgcode !== "00") {
                alert(data.msret.msg);
                return
            }
            if(!data.body.length) return
            this.initTableModel(data.body, data.body[0].celltype);
            this.sendKcomsRequest();
            if(count === 3) this.tmpT = setInterval(() => { this.test() }, 2000);
        }, this)

        this.trade.addSlot({
            service: ServiceType.kCOMS,
            msgtype: 4010,
            callback: (msg) => {
                this.riskListener(console.log(JSON.parse(msg.toString())));
            }
        });
    }

    riskListener(data) {
        let { trade_account, trade_block } = data.data;
        this.updateData(trade_account, "5");
        this.updateData(trade_block, "2");
        this.updateData([], "3");
        this.ref.detectChanges();
    }

    sendCmsRequest(cmd: string, options) {
        this.trade.sendToCMS(cmd, JSON.stringify({data: {
            body: Object.assign({ userid: this.config.get("user").userid}, options)
        }}));
    }

    sendKcomsRequest() {
        this.trade.send(4009, "", ServiceType.kCOMS);
    }

    updateData(values, celltype) {
        let cellList = [];
        let flagId = ""
        switch(celltype) {
            case "5":
                cellList = this.riskData.account;
                flagId = "acid";
                break;
            case "2":
                cellList = this.riskData.block;
                flagId = "caid";
                break;
            case "3":
                cellList = this.riskData.trace;
                flagId = "trid";
                break;
        }
        values.forEach(value => {
            let targetCell = cellList.find(item => Number(item.info[flagId]) === value.group_id);
            let targetRecord;
            if (targetCell) targetRecord = targetCell.tableData.find(item => Number(item.riskid) === value.risk_id);
            if(targetRecord) targetRecord.used_v1 = value.used_v1.toString();
        });
        if(this.tab.selectedTab && this.tab.selectedChild) this.checkoutGroup(this.tab.selectedTab.tabId, this.tab.selectedChild.id)
    }

    syncTable(model, isForce = false) {
        console.log(model)
        const tableFieldsOrder = {
            singleTable: ["riskname", "used_v1", "limit_v1", "operate", "stat"],
            marketPlateTable: ["categroy", "riskname", "used_v1", "limit_v1", "operate", "stat"],
            varietiTable: ["categroy", "riskname", "used_v1", "limit_v1", "operate", "stat"],
            ukeyTable: ["categroy", "riskname", "used_v1", "limit_v1", "operate", "stat"]
        };
        if(isForce) this.reLoadAllTable();
        model.forEach(record => {
            let table = this[record.tableName] as DataTable;
            let targetRow = table.rows.find(row =>  row.cell("风控名称").Text === record.riskname);
            if(targetRow) {
                targetRow.cell("used_v1").Text = record.used_v1;
            } else {
                let row = table.newRow();
                row.cells.forEach((cell, index) => {
                    cell.Text = record[tableFieldsOrder[record.tableName][index]];
                })
            }
        });
        this.syncWarn();
    }

    syncWarn() {
        this.reLoadTable("warn");
        this.riskData.account.forEach(account => {
            account.tableData.forEach(tableData => {
                if(Number(tableData.used_v1) >= Number(tableData.limit_v1)) {
                    let row = this.warnTable.newRow();
                    row.cells[0].Text = tableData.celltype;
                    row.cells[1].Text = tableData.cellname;
                    row.cells[2].Text = tableData.categroyTop;
                    row.cells[3].Text = tableData.categroy;
                    row.cells[4].Text = tableData.riskname;
                    row.cells[5].Text = tableData.limit_v1;
                    row.cells[6].Text = tableData.used_v1;
                    row.cells[7].Text = tableData.stat;
                }
            })
        })

        this.riskData.block.forEach(block => {
            block.tableData.forEach(tableData => {
                if(Number(tableData.used_v1) >= Number(tableData.limit_v1)) {
                    let row = this.warnTable.newRow();
                    row.cells[0].Text = tableData.celltype;
                    row.cells[1].Text = tableData.cellname;
                    row.cells[2].Text = tableData.categroyTop;
                    row.cells[3].Text = tableData.categroy;
                    row.cells[4].Text = tableData.riskname;
                    row.cells[5].Text = tableData.limit_v1;
                    row.cells[6].Text = tableData.used_v1;
                    row.cells[7].Text = tableData.stat;
                }
            })
        })
    }

    initTableModel(data: any[], type: string) {
        let cellInfo: any[];
        let cfgData: any[];
        let flagid: string;
        let flagname: string;
        let flagMount: string;
        switch(type) {
            case "5":
                cellInfo = this.account_info;
                flagid = "acid";
                flagname = "acname";
                flagMount = "account";
                break;
            case "2":
                cellInfo = this.tblock_info;
                flagid = "caid";
                flagname = "caname";
                flagMount = "block";
                break;
            case "3":
                cellInfo = [];
                flagid = "";
                flagname = "";
                flagMount = "trace";
                break;
        }
        this.riskData[flagMount] = cellInfo.map(value => {
            let risks = data.filter(item => item.cellid === value[flagid]);
            return {
                info: value,
                tableData: risks.map(item => {
                    let { categroy, categroyTop, tableName } = this.getRiskCatg(item.catg_lv1, item.catg_lv2, item.ukcode);
                    return {
                        cellid: item.cellid,
                        celltype: item.celltype,
                        cellname: value[flagname],
                        categroyTop,
                        categroy,
                        riskid: item.riskid,
                        riskname: item.riskname,
                        limit_v1: item.value1,
                        used_v1: null,
                        stat: this.getRiskStatType(item.risk_stat),
                        operate: item.operate,
                        tableName
                    }
                })
            }
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
        this.risk_indexs = this.config.get("risk_index") || [];
        this.account_info = this.config.get("asset_account") || [];
        this.tblock_info = this.config.getProducts();
    }

    checkoutTab(tabId) {
        this.tab.selectedTab = this.tab.tabList.find(value => value.tabId === tabId);
    }

    checkoutGroup(tabId, id) {
        this.tab.selectedChild = this.tab.tabList.find(value => value.tabId === tabId).contentList.find(item => item.id === id);
        this.singleTableName = `${this.tab.selectedTab.name}风控`;
        this.reLoadAllTable();
        switch (tabId) {
            case this.tab.tabList[0].tabId:
                let account = this.riskData.account.find(item => item.info.acid === id.toString());
                account && this.syncTable(account.tableData, true);
                break;
            case this.tab.tabList[1].tabId:
                let block = this.riskData.block.find(item => item.info.caid === id.toString());
                block && this.syncTable(block.tableData, true);
                break;
            case this.tab.tabList[2].tabId:
                let trace = this.riskData.trace.find(item => item.info.trid === id.toString());
                trace && this.syncTable(trace.tableData, true);
                break;
        }
    }

    toggleWarn() {
        this.isCollapsed = !this.isCollapsed;
    }

    reLoadTable(name: "warn" | "single" | "marketPlate" | "varieti" | "ukey" | "tactful") {
        let table: DataTable = new DataTable("table2");
        switch (name) {
            case "warn":
                table.addColumn("类型", "账户/产品ID", "分类", "类目", "风控名称", "阈值", "当前", "状态");
                this.warnTable = table;
                break;
            case "single":
                table.addColumn("风控名称", "当前值", "阈值", "触发方式", "状态");
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
        if (this.isRiskWarn(riskRecord)) {
            type = "warn";
        }
        if (riskRecord.used_v1 >= riskRecord.limit_v1) {
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

    getRiskCatg(catg_lv1: string, catg_lv2: string, ukey: string) {
        let categroy: string;
        let categroyTop: string;
        let tableName: string;
        switch (catg_lv1) {
            case "0":
                categroy = null;
                categroyTop = null;
                tableName = "singleTable";
                if (Number(ukey)) {
                    categroy = Number(ukey) === 1 ? "全部" : this.secuinfo.getSecuinfoByUKey(Number(ukey))[ukey].SecuAbbr;
                    categroyTop = '标的';
                    tableName = "ukeyTable";
                }
                break;
            case "1":
                categroy = this.mapMarket(catg_lv2);
                categroyTop = "市场";
                tableName = "marketPlateTable";
                break;
            case "2":
                categroy = this.mapPlate(catg_lv2);
                categroyTop = "板块";
                tableName = "marketPlateTable";
                break;
            case "3":
                categroy = this.mapVarieti(catg_lv2);
                categroyTop = "品种";
                tableName = "varietiTable"
                break;
        }
        return { categroy, categroyTop, tableName }
    }

    mapOperate(operate: number) {
        let value: string;
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

    mapCategroy_lv1(catg_lv1: string) {
        let value: string;
        switch (catg_lv1) {
            case "0":
                value = "无";
                break;
            case "1":
                value = "市场";
                break;
            case "2":
                value = "板块";
                break;
            case "3":
                value = "品种";
                break;
        }
        return value
    }

    mapMarket(catg_lv2: string) {
        let value: string;
        switch (catg_lv2) {
            case "0":
                value = "无";
                break;
            case "1":
                value = "深圳";
                break;
            case "2":
                value = "上海";
                break;
            case "3":
                value = "all";
                break;
        }
        return value
    }

    mapPlate(catg_lv2: string) {
        let value: string;
        switch (Number(catg_lv2)) {
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

    mapVarieti(catg_lv2: string) {
        let value: string;
        switch (Number(catg_lv2)) {
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


interface Tab {
    tabList: tabItem[];
    selectedTab: tabItem;
    selectedChild?: contentItem;
}

interface tabItem {
    tabId: number;
    name: string;
    contentList: contentItem[];
}

interface contentItem {
    id: string | number;
    name: string;
}
