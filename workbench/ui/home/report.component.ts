"use strict";

import { Component, OnInit, NgZone } from "@angular/core";
import { DataTable } from "../../../base/controls/control";
import { AppStoreService } from "../../../base/api/services/backend.service";
import { QtpService } from "../../bll/services";
import { ECharts } from "echarts";
import { ConfigurationBLL } from "../../bll/strategy.server";
import { SSGW_MSG, ServiceType } from "../../../base/api/model";

@Component({
    moduleId: module.id,
    selector: "report",
    templateUrl: "report.html",
    styleUrls: ["report.css"]
})
export class ReportComponent implements OnInit {
    resTable: DataTable;
    bLoading: boolean;
    chart: ECharts;
    chartOption: any;
    retraceRatio: any;
    percentProfitable: any;
    sharpeRatio: any;
    freeriskrate = 0.3;
    get selectedItem () {
        return this._selectedItem
    };
    set selectedItem (value) {
        this._selectedItem = value;
        this.resetOrderPage();
    };
    _selectedItem: any;
    orderdetailsTable: DataTable;
    reportDetails = [];
    currentReportData: {};
    nIds: number[];
    orderPage: {
        pageSize: number,
        currentPage: number,
        maxPage: number
    };
    filter = {
        condition: "",
        result: []
    };
    constructor(private mock: QtpService, private configBll: ConfigurationBLL,
        private appsrv: AppStoreService, private zone: NgZone) {
    }

    ngOnInit() {
        this.initResTable();
        this.initOrderTable();
        this.registerListener();
    }

    initResTable() {
        this.resTable = new DataTable("table2");
        this.resTable.addColumn("名称", "回测进度", "开始时间", "结束时间", "查看", "删除", "最大回撤", "胜率", "夏普率");
        this.resTable.align = "center";
        this.resTable.columns[0].align = "left";
        this.resTable.columns[1].align = "left";
        this.resTable.cellPadding = 5;

        this.configBll.getLoopbackItems().forEach(item => this.addResTableRow(item));
    }

    initOrderTable() {
        this.orderdetailsTable = new DataTable("table2");
        this.orderdetailsTable.addColumn("订单号", "委托价", "委托量", "成交价", "成交量", "成交金额", "成交状态", "成交方向", "股票代码", "成交日期", "成交时间", "组合id");
    }

    addResTableRow(loopbackItem) {
        let row = this.resTable.newRow();
        const reportData = this.reportDetails.find(item => item.id === loopbackItem.id);

        row.cells[0].Data = loopbackItem;
        row.cells[0].Text = loopbackItem.name + "-" + loopbackItem.id;
        row.cells[1].Text = 0;
        row.cells[1].Title = "0%";
        row.cells[1].Type = "progresser";
        row.cells[1].Colors = ["#d0d0d0", "#90c007"];
        row.cells[2].Text = loopbackItem.timebegin;
        row.cells[3].Text = loopbackItem.timeend;

        row.cells[4].Type = "icon-button";
        row.cells[4].Title = "pencil";
        row.cells[4].Text = "查看";
        row.cells[4].Class = "primary";
        row.cells[4].Color = "red";
        row.cells[4].OnClick = () => this.checkoutDetail(loopbackItem);

        row.cells[5].Type = "icon-button";
        row.cells[5].Title = "trash";
        row.cells[5].Text = "删除";
        row.cells[5].Class = "primary";
        row.cells[5].Color = "red";
        row.cells[5].OnClick = () => this.removeLoopback(loopbackItem.id);

        row.cells[6].Text = reportData ? reportData.retraceRatio : "--";
        row.cells[7].Text = reportData ? reportData.percentProfitable : "--";
        row.cells[8].Text = reportData ? reportData.sharpeRatio : "--";
    }

    checkoutDetail(item) {
        this.selectedItem = item;
        this.chartOption = this.generateOption();
        this.initOrderTable();
        this.request(8014, {
            nId: item.id
        });
        this.getOrderByPage(1);
    }

    removeLoopback(loopbackId: number | number[]) {
        const ids = Array.isArray(loopbackId) ? loopbackId : [loopbackId];
        ids.forEach(id => {
            let loopbackItem = this.configBll.getLoopbackItems().find(item => item.id === id);
            loopbackItem && this.configBll.removeLoopbackItem(loopbackItem);
        });
        this.request(8024, {
            reqsn: 2,
            nIds: ids
        });
        this.configBll.syncLoopbackItem();
        this.initResTable();
    }

    request(type: number, data: Object, server = ServiceType.kBackServer) {
        this.mock.send(type, JSON.stringify(data), server);
        console.info("\n", `request ${type}:`, data);
    }

    closeReport () {
        this.selectedItem = null;
        this.chartOption = null;
        this.initResTable();
    }

    registerListener() {
        this.mock.addSlot(
            {
                service: ServiceType.kBackServer,
                msgtype: 8015,
                callback: msg => {
                    let res = JSON.parse(msg.toString());
                    console.info("\n", `response 8015:`, res);
                    this.zone.run(() => {
                        this.setProfitOfItem(res.nId, res.Accpl);
                    })
                }
            },
            {
                service: ServiceType.kBackServer,
                msgtype: 8017,
                callback: msg => {
                    let res = JSON.parse(msg.toString());
                    console.info("\n", `response 8017:`, res);
                    this.zone.run(() => {
                        this.showOrderDetail(res);
                    })
                }
            },
            {
                service: ServiceType.kBackServer,
                msgtype: 8025,
                callback: msg => {
                    let res = JSON.parse(msg.toString());
                    console.info("\n", `response 8025:`, res);
                    this.zone.run(() => {
                        this.updateProgress(res.data);
                    })
                }
            },
            {
                service: ServiceType.kBackServer,
                msgtype: 8027,
                callback: msg => {
                    let res = JSON.parse(msg.toString());
                    console.info("\n", `response 8027:`, res);
                }
            }
        );


        this.request(8024, {
            reqsn: 1,
            nIds: this.configBll.getLoopbackItems().map(item => item.id)
        });
    }

    filterBacktest(condition) {
        console.log(NgZone.isInAngularZone())
        this.resTable.rows.forEach(row => {
            if(condition) {
                row.hidden = !row.cells[0].Data.name.includes(condition);
            } else row.hidden = false;
        })
    }

    flipPreviousOrder() {
        if(this.orderPage.currentPage !== 1) {
            this.orderPage.currentPage --;
            this.getOrderByPage(this.orderPage.currentPage);
        }
    }

    getOrderByPage(page: number) {
        this.request(8016, {
            nId: this.selectedItem.id,
            pageNum: page,
            pageSize: this.orderPage.pageSize
        })
    }

    flipNextOrder() {
        if(this.orderPage.currentPage !== this.orderPage.maxPage) {
            this.orderPage.currentPage ++;
            this.getOrderByPage(this.orderPage.currentPage);
        }
    }

    resetOrderPage() {
        this.orderPage = {
            pageSize: 40,
            currentPage: 1,
            maxPage: 1
        };
    }


    selectAll() {
        this.resTable.rows.forEach(row => {
            row.cells[0].Text = true;
        });
    }

    unseletAll() {
        this.resTable.rows.forEach(row => {
            row.cells[0].Text = false;
        });
    }

    search(value) {
        this.resTable.rows.forEach(row => {
            row.hidden = !(row.cells[1].Text as String).includes(value);
        });
    }

    chartInit(chart) {
        // console.info(chart);
        this.chart = chart;
    }

    updateProgress(resArr: any[]) {
        let rowMap = {};
        this.resTable.rows.forEach((row, index) => {
            rowMap[row.cells[0].Data.id] = index;
        });

        resArr.forEach(item => {
            if (rowMap.hasOwnProperty(item.nId))
                this.resTable.rows[rowMap[item.nId]].cells[1].Text = item.status;
            this.resTable.rows[rowMap[item.nId]].cells[1].Title = item.status + "%";
        });
    }

    showOrderDetail(data) {
        if(data && data.nId === this.selectedItem.id && Array.isArray(data.orderdetails)) {
            let { nId, orderdetails, total } = data;
            this.orderPage.maxPage = Math.floor( total / this.orderPage.pageSize ) + 1;
            orderdetails.forEach((item, index) => {
                let row = this.orderdetailsTable.newRow();
                // row.cells[0].Text = (parseInt(this.txt_pageidx.Text) - 1) * parseInt(this.txt_pagesize.Text) + index + 1;
                row.cells[0].Text = item.orderid;
                row.cells[1].Text = item.orderprice / 10000;
                row.cells[2].Text = item.ordervolume;
                row.cells[3].Text = item.dealprice / 10000;
                row.cells[4].Text = item.dealvolume;
                row.cells[5].Text = item.dealbalance / 10000;
                row.cells[6].Text = item.orderstatus;
                row.cells[7].Text = item.directive === 1 ? "B" : "S";
                row.cells[8].Text = item.innercode;
                row.cells[9].Text = item.tradedate;
                row.cells[10].Text = item.ordertime;
                row.cells[11].Text = item.accountid;
            });
        }
    }

    setProfitOfItem(id: number, profit: any) {
        let self = this;
        let total_ratios = [];
        let bottoms = [];
        let tops = [];
        let winCount = 0, sumratio = 0;

        this.chartOption.xAxis.data = (function () {
            let res = [];
            let time: string = null;
            profit.forEach((item, idx) => {
                time = (item.time).toFixed(0);
                time = [time.slice(-6, -4), time.slice(-4, -2), time.slice(-2)].join(":");
                res.push(item.date + " " + time);
            });
            return res;
        })();

        this.chartOption.series.data = (function () {
            total_ratios = [];
            let tmp = null;
            let firstValue = 0;
            let lastIdx;
            profit.forEach((item, idx) => {

                if (idx > 0 && item.marketvalue > profit[idx - 1].marketvalue) {
                    ++winCount;
                }

                if (idx === 0) {
                    firstValue = item.beginmarketvalue;
                    total_ratios.push(item.marketvalue / firstValue);
                    sumratio += total_ratios[idx];
                    return;
                }

                total_ratios.push(item.marketvalue / firstValue);
                sumratio += total_ratios[idx];

                if (total_ratios[idx] >= total_ratios[idx - 1]) {
                    if (idx === 1) {
                        tops.push(idx);
                    } else {
                        lastIdx = tops.pop();
                        if (typeof lastIdx === undefined || idx === lastIdx + 1)
                            tops.push(idx);
                        else
                            tops.push(lastIdx, idx);
                    }
                } else {
                    if (idx === 1) {
                        tops.push(0);
                        bottoms.push(idx);
                    } else {
                        lastIdx = bottoms.pop();
                        if (typeof lastIdx === undefined || idx === lastIdx + 1)
                            bottoms.push(idx);
                        else
                            bottoms.push(lastIdx, idx);
                    }
                }
            });
            return total_ratios;
        })();

        this.chart.resize();
        this.chart.setOption(this.chartOption);
        this.bLoading = false;

        let reportData = {
            id: id,
            retraceRatio: "",
            percentProfitable: "",
            sharpeRatio: ""
        };
        let maxRetraceRatio = 0;
        let drawdown = 0;
        if (tops.length > 0 && bottoms.length > 0) {
            tops.forEach((itop, itopIdx) => {
                bottoms.filter(idx => { return idx > itop && (idx < tops[itopIdx + 1] || tops.length === itopIdx + 1); }).forEach(ibot => {
                    maxRetraceRatio = total_ratios[itop] - total_ratios[ibot] > maxRetraceRatio ? total_ratios[itop] - total_ratios[ibot] : maxRetraceRatio;
                    drawdown = maxRetraceRatio / total_ratios[itop];
                });
            });
        }

        reportData.retraceRatio = (drawdown * 100).toFixed(2) + "%";
        reportData.percentProfitable = (winCount * 100 / profit.length).toFixed(2) + "%";
        let avgratio = sumratio / profit.length;
        let variance = 0;
        total_ratios.forEach(ratio => {
            variance += Math.pow(ratio - avgratio, 2);
        });

        // console.info(total_ratios, variance);
        if (variance !== 0) {
            let value = null;
            let multiper;
            if (this.selectedItem.unit === 0)
                multiper = 365 * 24 * 60 / parseInt(this.selectedItem.period);
            else
                multiper = 365 / parseInt(this.selectedItem.period);
            value = ((total_ratios.pop() - 1) * multiper / profit.length - this.freeriskrate) / (Math.sqrt(variance) * multiper);
            // console.info(value, variance);
            reportData.sharpeRatio = value.toFixed(4);
        } else {
            reportData.sharpeRatio = "0";
        }
        this.currentReportData = reportData;
        let findedReport = this.reportDetails.find(item => item.id === reportData.id);
        if(findedReport) {
            Object.assign(findedReport, reportData);
        } else this.reportDetails.push(reportData);
    }

    generateOption() {
        return {
            title: {
                show: false,
            },
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "cross",
                    label: { show: true, backgroundColor: "rgba(0,0,0,1)" }
                }
            },
            legend: {
                data: ["净值"],
                textStyle: { color: "#F3F3F5" }
            },
            xAxis: {
                data: [],
                axisLabel: {
                    textStyle: { color: "#F3F3F5" }
                },
                axisLine: {
                    lineStyle: {
                         color: "#F3F3F5"
                     }
                }
            },
            yAxis: {
                name: "净值",
                axisLabel: {
                    show: true,
                    textStyle: { color: "#F3F3F5" }
                },
                axisLine: {
                    lineStyle: { color: "#F3F3F5" }
                },
                splitLine: { show: false },
                scale: true,
                boundaryGap: [0.2, 0.2]
            },
            series: {
                name: "净值",
                type: "line",
                data: [],
                showSymbol: false
            },
            backgroundColor: "rgba(1, 3, 12, .37)"
        };
    }
}