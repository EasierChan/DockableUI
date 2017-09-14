"use strict";

import { Component, OnInit } from "@angular/core";
import { DataTable } from "../../../base/controls/control";
import { TradeService } from "../../bll/services";
import { ECharts } from "echarts";
import { ConfigurationBLL } from "../../bll/strategy.server";


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
    _unit: any;
    _period: any;
    Sel_arr = [];
    private allItem: any[];
    constructor(private mock: TradeService, private configBll: ConfigurationBLL) {
    }

    ngOnInit() {
        this.resTable = new DataTable("table2");
        this.resTable.addColumn("选中", "名称", "开始时间", "结束时间", "查看");
        this.resTable.columns[0].maxWidth = 20;
        this.resTable.columns[4].maxWidth = 50;
        this.Sel_arr = [];
        this.allItem = this.configBll.getLoopbackItems();
        let len = this.allItem.length;
        for (let i = 0; i < len; ++i) {
            let row = this.resTable.newRow();
            row.cells[0].Type = "checkbox";
            row.cells[0].Data = { nId: this.allItem[i].id, unit: this.allItem[i].unit, period: this.allItem[i].period };
            row.cells[0].Text = false;
            row.cells[1].Text = this.allItem[i].name + "-" + this.allItem[i].id;
            row.cells[2].Text = this.parseDate(this.allItem[i].timebegin + "");
            row.cells[3].Text = this.parseDate(this.allItem[i].timeend + "");
            row.cells[4].Type = "button";
            row.cells[4].Text = "查看";
            row.cells[4].OnClick = () => {
                this._unit = this.allItem[i].unit;
                this._period = this.allItem[i].period;
                this.chartOption = this.generateOption();
                this.mock.send(200, 8014, { nId: this.resTable.rows[i].cells[0].Data.nId });
                this.page = 1;
                this.bLoading = true;
            };
        }
        this.resTable.onCellClick = (cellItem, cellIndex, rowIndex) => {
            // console.log(cellItem, cellIndex, rowIndex);
            if (cellIndex !== 0)
                return;
            let tmpNid = cellItem.Data.nId;
            let rtn = this.findReportIndex(tmpNid);
            if (cellItem.Text) {
                if (rtn === -1) {
                    this.Sel_arr.push({ nid: tmpNid, idx: rowIndex });
                }
            } else {
                if (rtn !== -1) {
                    this.Sel_arr.splice(rtn, 1);
                }
            }
            console.log(this.Sel_arr);
        };
        this.registerListener();
    }

    findReportIndex(nid: number) {
        let arrLen = this.Sel_arr.length;
        for (let i = 0; i < arrLen; ++i) {
            if (this.Sel_arr[i].nid === nid) {
                return this.Sel_arr[i].idx;
            }
        }
        return -1;
    }

    parseDate(data: string) {
        let day = data.substr(6, 2);
        let month = data.substr(4, 2);
        let year = data.substr(0, 4);
        return (parseInt(month) + "/" + parseInt(day) + "/" + year);
    }

    registerListener() {
        this.mock.addSlot(
            {
                appid: 200,
                packid: 8015,
                callback: msg => {
                    console.info(msg);
                    this.setProfitOfItem(msg.content.nId, msg.content.Accpl);
                }
            }
        );
    }

    back() {
        this.page = 0;
    }

    chooseAll() {
        let len = this.resTable.rows.length;
        this.Sel_arr.splice(0, this.Sel_arr.length);
        for (let i = 0; i < len; ++i) {
            this.resTable.rows[i].cells[0].Text = true;
            this.Sel_arr.push({ nid: this.resTable.rows[i].cells[0].Data.nId, idx: i });
        }
        console.log(this.Sel_arr);
    }
    unChoose() {
        let len = this.resTable.rows.length;
        for (let i = 0; i < len; ++i) {
            this.resTable.rows[i].cells[0].Text = false;
        }
        this.Sel_arr.splice(0, this.Sel_arr.length);
        console.log(this.Sel_arr);
    }
    search() {

    }
    remove() {
        console.log(this.allItem, this.Sel_arr);
        if (this.Sel_arr.length === 0)
            return;
        let tableLen = this.resTable.rows.length;
        for (let i = 0; i < tableLen; ++i) {
            let nid = this.resTable.rows[i].cells[0].Data.nId;
            for (let j = 0; j < this.Sel_arr.length; ++j) {
                if (nid === this.Sel_arr[j].nid) {
                    this.resTable.rows.splice(i, 1);
                    tableLen--;
                }
            }
        }
        let itemLen = this.allItem.length;
        for (let i = 0; i < itemLen; ++i) {
            let nid = this.allItem[i].id;
            let selArrLen = this.Sel_arr.length;
            for (let j = 0; j < this.Sel_arr.length; ++j) {
                if (nid === this.Sel_arr[j].nid) {
                    this.allItem.splice(i, 1);
                    itemLen--;
                }
            }
        }
        this.configBll.updateLoopbackItems(this.allItem);
        this.Sel_arr = [];
        console.log(this.allItem, this.Sel_arr);
    }

    chartInit(chart) {
        // console.info(chart);
        this.chart = chart;
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
                time = (item.time / 10).toFixed(0);
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

                if (item.aeupl + item.apopl > 0) {
                    ++winCount;
                }

                if (idx === 0) {
                    firstValue = item.cost + item.amt - item.aeupl - item.apopl;
                    total_ratios.push((item.cost + item.amt) / firstValue);
                    sumratio += total_ratios[idx];
                    return;
                }

                total_ratios.push((item.cost + item.amt) / firstValue);
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
            if (this._unit === 0)
                multiper = 365 * 24 * 60 / parseInt(this._period);
            else
                multiper = 365 / parseInt(this._period);
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