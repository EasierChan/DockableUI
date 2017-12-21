"use strict";

import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { ConfigurationBLL, WorkspaceConfig, DataKey, AppType, Channel } from "../../bll/strategy.server";
import { Menu, MenuItem, AppStoreService, SecuMasterService } from "../../../base/api/services/backend.service";
import { SSGW_MSG, ServiceType } from "../../../base/api/model";
import { QtpService } from "../../bll/services";
import { DataTable } from "../../../base/controls/control";
import { DatePipe } from "@angular/common";
import * as Fs from "fs"
const fs = require("@node/fs");
declare const electron: Electron.ElectronMainAndRenderer;


@Component({
    moduleId: module.id,
    selector: "sim-query",
    templateUrl: "simquery.html",
    styleUrls: ["home.component.css", "simquery.css"],
    providers: [DatePipe],
})
export class SimQueryComponent implements OnInit {
    products: any[] = [];
    strategys: any[] = [];
    cmsRequestFn = {
        SN: 100
    };
    selectedCaid: string | number;
    selectedTrid: string | number;
    startDate: string;
    endDate: string;
    isDownedAll = false;
    orderTable: DataTable;
    pagination = {
        maxPage: 1,
        currentPage: 1,
        pageSize: 40
    };
    
    constructor(private trade: QtpService, private appsrv: AppStoreService,
        private datePipe: DatePipe, private config: ConfigurationBLL, private secuInfo: SecuMasterService) {

    }

    ngOnInit() {
        this.products = this.config.getProducts();
        this.strategys = [{
            trid: "",
            trname: "全部"
        }];
        this.selectedCaid = this.products.length ? this.products[0].caid : null;
        this.startDate = this.datePipe.transform(new Date().setDate(1), "yyyy-MM-dd");
        this.endDate = this.datePipe.transform(Date.now(), "yyyy-MM-dd");
        // this.dev();
        this.caChangeListener(this.selectedCaid);
        this.initTable();
    }

    dev() {
        this.selectedCaid = "30301";
    }

    initTable() {
        this.orderTable = new DataTable("table2");
        this.orderTable.align = "center";
        this.orderTable.addColumn(...this.getOrderRow());
    }

    caChangeListener(value) {
        if(value) {
            this.selectedCaid = value;
            this.request("getCombStrategy", {caid: value}).then(data => {
                this.strategys = [{
                    trid: "",
                    trname: "全部"
                }]
                if(data && data.length) {
                    this.strategys = this.strategys.concat(data as any[]);
                }
                this.selectedTrid = this.strategys[0].trid;
                this.checkoutForm(1);
            })
        }
    }

    trChangeListener(value) {
        this.selectedTrid = value;
        this.checkoutForm(1);
    }

    startChangeListener(value) {
        this.startDate = value;
        this.checkoutForm(1);
    }

    endChangeListener(value) {
        this.endDate = value;
        this.checkoutForm(1);
    }

    downLoad() {
        let path: string;
        this.chosedPath()
            .then((chosedPath) => {
                path = chosedPath;
                let header = this.orderTable.columns.map(item => item.Name);
                if(this.isDownedAll) {
                    return this.getOrders()
                        .then(data => {
                            let csvData = (data.data as any[]).map(row => this.getOrderRow(row).join(",")).join("\n\r");
                            csvData = header.join(",") + "\n\r" + csvData;
                            return csvData
                        })
                } else {
                    let data = this.orderTable.rows.map(item => item.cells.map(cell => cell.Text) )
                    data.unshift(header);
                    let csvData = data.map(row => row.join(",")).join("\n\r");
                    return Promise.resolve(csvData);
                }
                
            })
            .then((csvData) => {
                fs.writeFile(path, csvData, () => console.info(`success saved file in ${path}`));
            })
            .catch(err => console.info(err))

    }

    chosedPath(): Promise<string> {
        return new Promise((resolve, reject) => {
            electron.remote.dialog.showSaveDialog({
                title: "另存为",
                defaultPath: "@/order.csv",
                buttonLabel: "",
                filters: []
            }, (path)=> {
                if(path) resolve(path)
                else reject("取消保存")
            })
        })
    }

    previousPage() {
        if(this.pagination.currentPage !== 1) {
            this.pagination.currentPage --;
            this.checkoutForm(this.pagination.currentPage);
        }
    }

    nextPage() {
        if(this.pagination.currentPage !== this.pagination.maxPage) {
            this.pagination.currentPage ++;
            this.checkoutForm(this.pagination.currentPage);
        }
    }

    checkoutForm(page: number) {
        this.pagination.currentPage = page;
        this.initTable();
        this.getOrders(page || 1).then(data => {
            this.pagination.maxPage = Math.floor(data.totalCount / this.pagination.pageSize) + 1;
            this.loadTable(data.data);
        }).catch(err => console.info(err))
    }

    getOrders(page: number = 0) {
        let {selectedCaid: caid, selectedTrid: trid, startDate, endDate} = this;
        if(caid && startDate && endDate) {
            startDate = startDate.replace(/-/g, "");
            endDate = endDate.replace(/-/g, "");
            let options = {
                pageCount: this.pagination.pageSize,
                caid,
                trid,
                startDate,
                endDate,
                page
            };
            if(!trid) delete options.trid;
            if(!page) { // 默认为0，获取所有
                delete options.page;
                delete options.pageCount;
            }
            return this.request("getTaorder", options);
        } else return Promise.reject("查询条件缺失")
    }

    loadTable(orderList: any[]) {
        orderList.forEach(order => {
            let row = this.orderTable.newRow();
            this.getOrderRow(order).forEach((value, index) => {
                row.cells[index].Text = value
            })
        })
    }

    request(cmd: string, options): Promise<any> {
        let reqsn = this.cmsRequestFn.SN || 100;
        return new Promise((resolve, reject) => {
            this.addListener(cmd, reqsn, resolve)
            this.trade.sendToCMS(cmd, JSON.stringify({
                data: {
                    head: {reqsn, userid: this.config.get("user").userid},
                    body: options
                }
            }));
            this.cmsRequestFn.SN = reqsn + 1;
        })
    }

    addListener(cmd: string, reqsn: number, resolve) {
        if(!this.cmsRequestFn[cmd] || !this.cmsRequestFn[cmd].length) {
            this.cmsRequestFn[cmd] = [];
            this.trade.addSlotOfCMS(cmd, (msg) => {
                this.cmsRequestFn[cmd].forEach((fn) => {
                    fn && fn(msg)
                })
            }, this);
        }
        let fn = (msg) => {
            let { head, body, msret } = JSON.parse(msg.toString());
            let msgcode = head.msgcode || msret.msgcode;
            if(msgcode !== "00") {
                alert(head.msret.msg)
            }
            if(head && head.reqsn === reqsn) {
                fn = null;
                resolve(body)
            }
        }
        this.cmsRequestFn[cmd].push(fn);
    }

    convertOrder(order) {
        order.caid = this.config.getProducts().find(item => item.caid === order.caid).caname;
        order.acid = this.config.get("asset_account").find(item => item.acid === order.acid).acname;
        order.trid = this.strategys.find(item => item.trid === order.trid).trname;
        order.directive = this.mapDirective(order.directive);
        order.offset_flag = this.mapOffset(order.offset_flag);
        order.execution = this.mapExecution(order.execution);
        order.orderstat = this.mapOrderStat(order.orderstat);
        order.addordertype = this.mapOrderType(order.addordertype);
        order.ukcode = this.secuInfo.getSecuinfoByUKey(order.ukcode)[order.ukcode].SecuAbbr;
    }

    mapDirective(type) {
        return ["普通买", "普通卖", "融资买入", "融券卖出（预约券）", "融券卖出（市场券）", "买券还券", "买券还券（预约券）", "买券还券（市场券）", "现券还券", "买券还券（预约券）", "现券还券（市场券）", "现金还款", "卖券还券", "担保品划转", "申购", "赎回"][Number(type) - 1]
    }

    mapOffset(type) {
        return ["0", "开仓", "平仓", "平今", "平昨"][Number(type)]
    }

    mapExecution(type) {
        return Number(type) === 0 ? "限价" : ""
    }

    mapOrderStat(type) {
        return {
            "-1": "待审批",
            "0": "未报",
            "1": "待报",
            "2": "已报",
            "3": "待撤",
            "4": "部分待撤",
            "5": "部分成撤",
            "6": "已撤",
            "7": "部分成交",
            "8": "全部成交",
            "9": "费单",
            "40": "风控阻塞"
        }[Number(type)]
    }

    mapOrderType(type) {
        return {
            "0": "普通订单",
            "1": "正常订单",
            "2": "强平补内",
            "3": "强平补外",
            "4": "移仓订单"
        }[Number(type)]
    }

    getOrderRow(order = null) {
        if(order) this.convertOrder(order)
        let fields = [
            {
                field: "交易日期",
                key: "trday"
            }, {
                field: "终端ID",
                key: "termid"
            }, {
                field: "tgw地址",
                key: "tgwpath"
            }, {
                field: "资产单元",
                key: "caid"
            }, {
                field: "交易单元",
                key: "trid"
            }, {
                field: "策略ID",
                key: "stgid"
            }, {
                field: "交易员",
                key: "traderid"
            }, {
                field: "资金账户",
                key: "acid"
            }, {
                field: "交易账户",
                key: "tracid"
            }, {
                field: "经纪商",
                key: "bid"
            }, {
                field: "通道",
                key: "chid"
            }, {
                field: "终端的订单号",
                key: "termorderid"
            }, {
                field: "OMS订单ID",
                key: "sysorderid"
            }, {
                field: "分组订单号",
                key: "groupid"
            }, {
                field: "券商订单号",
                key: "borderid"
            }, {
                field: "委托时间",
                key: "ordertm"
            }, {
                field: "UKEY",
                key: "ukcode"
            }, {
                field: "期货/期权对应的合约编码",
                key: "contractid"
            }, {
                field: "市场",
                key: "marketid"
            }, {
                field: "交易所证券code",
                key: "marketcode"
            }, {
                field: "证券名称",
                key: "cname"
            }, {
                field: "唯一的指令",
                key: "cmdid"
            }, {
                field: "委托指令",
                key: "directive"
            }, {
                field: "side",
                key: "side"
            }, {
                field: "开平仓",
                key: "offset_flag"
            }, {
                field: "执行类型",
                key: "execution"
            }, {
                field: "报价货币币种",
                key: "currencyid"
            }, {
                field: "委托价格",
                key: "orderprice"
            }, {
                field: "委托数量",
                key: "ordervol"
            }, {
                field: "撤单数量",
                key: "cancelvol"
            }, {
                field: "成交数量",
                key: "tradevol"
            }, {
                field: "成交金额",
                key: "tradeamt"
            }, {
                field: "已确认的挂单数量",
                key: "confirmvol"
            }, {
                field: "废单数量",
                key: "badvol"
            }, {
                field: "账户订单费用",
                key: "tractfee"
            }, {
                field: "单元订单费用",
                key: "trdfee"
            }, {
                field: "最后更新成交信息时间",
                key: "newtm"
            }, {
                field: "撤单时间",
                key: "cancelordertm"
            }, {
                field: "撤单标志",
                key: "cancelorderflag"
            }, {
                field: "批人",
                key: "approver"
            }, {
                field: "订单状态",
                key: "orderstat"
            }, {
                field: "订单类型",
                key: "addordertype"
            }, {
                field: "订单返回信息",
                key: "msg"
            }
        ];
        if(order) {
            return fields.map(item => order[item.key] )
        } else return fields.map(item => item.field )
    }
}

