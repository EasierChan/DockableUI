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
    stgList: {
        chname: string;
        stgid: string | number;
    }[] = [];
    cmsRequestFn = {
        SN: 100
    };
    selectedStgid: string | number;
    selectedCaid: string | number;
    selectedTrid: string | number;
    startDate: string;
    endDate: string;
    isDownedAll = false;
    orderTable: DataTable;
    holdTable: DataTable;
    pagination = {
        maxPage: 1,
        currentPage: 1,
        pageSize: 40
    };
    cache: any = {};
    
    constructor(private trade: QtpService, private appsrv: AppStoreService,
        private datePipe: DatePipe, private config: ConfigurationBLL, private secuInfo: SecuMasterService) {

    }

    ngOnInit() {
        this.config.getSimulationConfigs().forEach(simConfig => {
            simConfig.items.forEach(item => {
                this.stgList.push({
                    chname: `${simConfig.chname}${item.key}`,
                    stgid: item.key
                })
            })
        });
        this.selectedStgid = this.stgList[0].stgid;
        this.endDate = this.datePipe.transform(new Date().getTime(), "yyyy-MM-dd");
        this.startDate = this.datePipe.transform(new Date().getTime() - 1 * 30 * 24 * 60 * 60 * 1000, "yyyy-MM-dd");

        this.initTable("order");
        this.initTable("hold");
    }

    search(isReset: boolean = false) {
        // valid stgid 0(21), 141(2), 188(4), 193(3541)
        if(isReset) this.reset();
        this.getOrder().then(data => {
            console.log(data);
            this.initTable("order");
            data.data.forEach(order => {
                let row = this.orderTable.newRow();                
                this.getOrderRow(order).forEach((value, index) => {
                    row.cells[index].Text = value
                })
            });
            this.pagination.maxPage = Math.floor(Number(data.totalCount) / this.pagination.pageSize) + 1;
        });

        this.request("getTradeUnitHoldPosition", {
            stgid: this.selectedStgid
        }).then(data => {
            console.log(data);
            this.initTable("hold");
            data.forEach(item => {
                let row = this.holdTable.newRow();
                this.getHoldRow(item).forEach((value, index) => {
                    row.cells[index].Text = value
                })
            })
        });
    }

    reset() {
        this.selectedStgid = this.cache.stgid || this.selectedStgid;
        this.startDate = this.cache.startDate || this.startDate;
        this.endDate = this.cache.endDate || this.endDate;
        this.pagination.currentPage = 1;

        this.cache.stgid = null;
        this.cache.startDate = null;
        this.cache.endDate = null;
    }

    getOrder(page = this.pagination.currentPage, stgid = this.selectedStgid, pageCount = this.pagination.pageSize,
        startDate = this.startDate.replace(/-/g, ""), endDate = this.endDate.replace(/-/g, "")) {
        let options = {
            stgid,
            startDate,
            endDate,
            page,
            pageCount
        };
        if(page === 0) {
            delete options.page;
            delete options.pageCount; 
        }
        console.log(options);
        return this.request("getTaorder", options)
    }

    initTable(name: "order" | "hold") {
        let newTable = new DataTable("table2");
        switch(name) {
            case "order":
                this.orderTable = newTable;
                this.orderTable.align = "center";
                this.orderTable.addColumn(...this.getOrderRow());
                break;
            case "hold":
                this.holdTable = newTable;
                this.holdTable.align = "center";
                this.holdTable.addColumn(...this.getHoldRow());
                break;
        }
    }

    resetStg(stgid) {
        this.cache.stgid = stgid;
    }

    resetStart(date) {
        this.cache.startDate = date;
    }

    resetEnd(date) {
        this.cache.endDate = date;
    }

    downLoad() {
        let path: string;
        this.chosedPath()
            .then((chosedPath) => {
                path = chosedPath;
                let header = this.orderTable.columns.map(item => item.Name);
                if(this.isDownedAll) {
                    return this.getOrder(0)
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
            this.search();
        }
    }

    nextPage() {
        if(this.pagination.currentPage !== this.pagination.maxPage) {
            this.pagination.currentPage ++;
            this.search();
        }
    }

    request(cmd: string, options): Promise<any> {
        let reqsn = this.cmsRequestFn.SN || 100;
        return new Promise((resolve, reject) => {
            this.addListener(cmd, reqsn, resolve)
            this.trade.sendToCMS(cmd, JSON.stringify({
                data: {
                    head: {reqsn, userid: this.config.get("user").userid},
                    body: options,
                    userid: this.config.get("user").userid
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
        // order.trid = this.strategys.find(item => item.trid === order.trid).trname;
        // console.log(this.strategys)
        // console.log(order)
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
        order && this.convertOrder(order);
        const fields = [
            {
                field: "订单ID(OMS)",
                key: "sysorderid"
            },
            {
                field: "UKEY",
                key: "ukcode"
            }, 
            {
                field: "交易所证券code",
                key: "marketcode"
            }, 
            {
                field: "证券名称",
                key: "cname"
            }, 
            {
                field: "策略ID",
                key: "stgid"
            }, 
            // {
            //     field: "组合ID",
            //     key: ""
            // }, 
            {
                field: "委托价格",
                key: "orderprice"
            }, 
            {
                field: "委托数量",
                key: "ordervol"
            }, 
            {
                field: "委托时间",
                key: "ordertm"
            }, 
            {
                field: "买/卖", // "成交金额"
                key: "tradeamt"
            }, 
            {
                field: "订单状态",
                key: "orderstat"
            }
        ];
        if(order) {
            return fields.map(item => order[item.key] )
        } else return fields.map(item => item.field )
    }

    getHoldRow(hold=null) {
        const fields = [
            {
                field: "交易日期",
                key: "trday"
            },
            {
                field: "交易单元ID",
                key: "trid"
            }, 
            {
                field: "资金账户",
                key: "acid"
            }, 
            {
                field: "交易账户",
                key: "tracid"
            }, 
            {
                field: "UKEY",
                key: "ukcode"
            }, 
            {
                field: "持仓类型",
                key: "satype"
            }, 
            {
                field: "市场Id",
                key: "marketid"
            }, 
            {
                field: "交易所证券code",
                key: "marketcode"
            }, 
            {
                field: "仓位方向",
                key: "direction"
            }, 
            {
                field: "总计数量",
                key: "totalvol"
            }, {
                field: "可用数量",
                key: "validvol"
            }, {
                field: "盯市成本",
                key: "mtmcost"
            }
        ];
        if(hold) {
            return fields.map(item => hold[item.key] )
        } else return fields.map(item => item.field )
    }

    // getOrderRow0(order = null) {
    //     if(order) this.convertOrder(order)
    //     let fields = [
    //         {
    //             field: "交易日期",
    //             key: "trday"
    //         }, {
    //             field: "终端ID",
    //             key: "termid"
    //         }, {
    //             field: "tgw地址",
    //             key: "tgwpath"
    //         }, {
    //             field: "资产单元",
    //             key: "caid"
    //         }, {
    //             field: "交易单元",
    //             key: "trid"
    //         }, {
    //             field: "策略ID",
    //             key: "stgid"
    //         }, {
    //             field: "交易员",
    //             key: "traderid"
    //         }, {
    //             field: "资金账户",
    //             key: "acid"
    //         }, {
    //             field: "交易账户",
    //             key: "tracid"
    //         }, {
    //             field: "经纪商",
    //             key: "bid"
    //         }, {
    //             field: "通道",
    //             key: "chid"
    //         }, {
    //             field: "终端的订单号",
    //             key: "termorderid"
    //         }, {
    //             field: "OMS订单ID",
    //             key: "sysorderid"
    //         }, {
    //             field: "分组订单号",
    //             key: "groupid"
    //         }, {
    //             field: "券商订单号",
    //             key: "borderid"
    //         }, {
    //             field: "委托时间",
    //             key: "ordertm"
    //         }, {
    //             field: "UKEY",
    //             key: "ukcode"
    //         }, {
    //             field: "期货/期权对应的合约编码",
    //             key: "contractid"
    //         }, {
    //             field: "市场",
    //             key: "marketid"
    //         }, {
    //             field: "交易所证券code",
    //             key: "marketcode"
    //         }, {
    //             field: "证券名称",
    //             key: "cname"
    //         }, {
    //             field: "唯一的指令",
    //             key: "cmdid"
    //         }, {
    //             field: "委托指令",
    //             key: "directive"
    //         }, {
    //             field: "side",
    //             key: "side"
    //         }, {
    //             field: "开平仓",
    //             key: "offset_flag"
    //         }, {
    //             field: "执行类型",
    //             key: "execution"
    //         }, {
    //             field: "报价货币币种",
    //             key: "currencyid"
    //         }, {
    //             field: "委托价格",
    //             key: "orderprice"
    //         }, {
    //             field: "委托数量",
    //             key: "ordervol"
    //         }, {
    //             field: "撤单数量",
    //             key: "cancelvol"
    //         }, {
    //             field: "成交数量",
    //             key: "tradevol"
    //         }, {
    //             field: "成交金额",
    //             key: "tradeamt"
    //         }, {
    //             field: "已确认的挂单数量",
    //             key: "confirmvol"
    //         }, {
    //             field: "废单数量",
    //             key: "badvol"
    //         }, {
    //             field: "账户订单费用",
    //             key: "tractfee"
    //         }, {
    //             field: "单元订单费用",
    //             key: "trdfee"
    //         }, {
    //             field: "最后更新成交信息时间",
    //             key: "newtm"
    //         }, {
    //             field: "撤单时间",
    //             key: "cancelordertm"
    //         }, {
    //             field: "撤单标志",
    //             key: "cancelorderflag"
    //         }, {
    //             field: "批人",
    //             key: "approver"
    //         }, {
    //             field: "订单状态",
    //             key: "orderstat"
    //         }, {
    //             field: "订单类型",
    //             key: "addordertype"
    //         }, {
    //             field: "订单返回信息",
    //             key: "msg"
    //         }
    //     ];
    //     if(order) {
    //         return fields.map(item => order[item.key] )
    //     } else return fields.map(item => item.field )
    // }
}