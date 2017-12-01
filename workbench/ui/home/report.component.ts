"use strict";

import { Component, OnInit } from "@angular/core";
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
    page: number = 0;
    resTable: DataTable;
    bLoading: boolean;
    chart: ECharts;
    chartOption: any;
    retraceRatio: any;
    percentProfitable: any;
    sharpeRatio: any;
    freeriskrate = 0.3;
    selectedItem: any;
    orderdetailsTable: DataTable;
    nIds: number[];

    constructor(private mock: QtpService, private configBll: ConfigurationBLL,
        private appsrv: AppStoreService) {
    }

    ngOnInit() {
        this.nIds = [];
        this.resTable = new DataTable("table2");
        this.resTable.addColumn("选中", "名称", "回测进度", "开始时间", "结束时间", "查看");
        this.resTable.columns[0].maxWidth = 20;
        this.resTable.columns[4].maxWidth = 50;
        // this.resTable.ColumnHeader = false;
        this.configBll.getLoopbackItems().forEach(item => {
            let row = this.resTable.newRow();
            row.cells[0].Type = "checkbox";
            row.cells[0].Data = item;
            row.cells[0].Text = false;
            row.cells[1].Text = item.name + "-" + item.id;
            row.cells[2].Text = 0;
            row.cells[2].Title = "0%";
            row.cells[2].Type = "progresser";
            row.cells[2].Colors = ["red", "blue"];
            row.cells[3].Text = item.timebegin;
            row.cells[4].Text = item.timeend;
            row.cells[5].Type = "icon-button";
            row.cells[5].Title = "pencil";
            row.cells[5].Text = "查看";
            row.cells[5].Class = "primary";
            row.cells[5].Color = "red";
            row.cells[5].OnClick = () => {
                this.selectedItem = item;
                this.chartOption = this.generateOption();
                this.mock.send(8014, JSON.stringify({ nId: item.id }), ServiceType.kBackServer); // 
                this.mock.send(8016, JSON.stringify({ nId: item.id }), ServiceType.kBackServer);
                this.page = 1;
                // this.bLoading = true;
            };
            this.nIds.push(item.id);
        });

        this.orderdetailsTable = new DataTable("table2");
        this.orderdetailsTable.addColumn("订单号", "委托价", "委托量", "成交价", "成交量", "成交金额", "成交状态", "成交方向", "股票代码", "成交日期", "成交时间", "组合id");
        this.registerListener();
    }

    registerListener() {
        this.mock.addSlot(
            {
                service: ServiceType.kBackServer,
                msgtype: 8015,
                callback: msg => {
                    let obj = JSON.parse(msg.toString());
                    this.setProfitOfItem(obj.nId, obj.Accpl);
                }
            },
            {
                service: ServiceType.kBackServer,
                msgtype: 8017,
                callback: msg => {
                    let obj = JSON.parse(msg.toString());
                    this.showOrderDetail(obj.nId, obj.orderdetails);
                }
            },
            {
                service: ServiceType.kBackServer,
                msgtype: 8025,
                callback: msg => {
                    let obj = JSON.parse(msg.toString());
                    this.updateProgress(obj.data);
                }
            },
            {
                service: ServiceType.kBackServer,
                msgtype: 8027,
                callback: msg => {

                }
            }
        );
        this.mock.send(8024, JSON.stringify({ reqsn: 1, nIds: this.nIds }), ServiceType.kBackServer);
    }

    back() {
        this.page = 0;
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

    remove() {
        let IDs = [];
        let rows = this.resTable.rows;
        for (let i = 0; i < rows.length; ) {
            if (rows[i].cells[0].Text) {
                this.configBll.removeLoopbackItem(rows[i].cells[0].Data);
                IDs.push(rows[i].cells[0].Data.id);
                rows.splice(i, 1);
            } else {
                ++i;
            }
        }

        this.mock.send(8024, JSON.stringify({ reqsn: 2, nIds: IDs }), ServiceType.kBackServer);
        this.configBll.syncLoopbackItem();
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
                this.resTable.rows[rowMap[item.nId]].cells[2].Text = item.status;
            this.resTable.rows[rowMap[item.nId]].cells[2].Title = item.status + "%";
        });
    }

    showOrderDetail(id: number, orderdetails: any) {
        if (id === this.selectedItem.id && Array.isArray(orderdetails)) {
            this.orderdetailsTable.rows.length = 0;
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
                row.cells[8].Text = item.innercode;
                row.cells[9].Text = item.tradedate;
                row.cells[10].Text = item.ordertime;
                row.cells[11].Text = item.accountid;
                row.cells[7].Text = item.directive === 1 ? "B" : "S";
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

        this.chart.setOption(this.chartOption);
        this.bLoading = false;

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

        this.retraceRatio = (drawdown * 100).toFixed(2) + "%";
        this.percentProfitable = (winCount * 100 / profit.length).toFixed(2) + "%";
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
            this.sharpeRatio = value.toFixed(4);
        } else {
            this.sharpeRatio = 0;
        }
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
                    lineStyle: { color: "#F3F3F5" }
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
            }
        };
    }
}