"use strict";

import { Injectable, EventEmitter } from "@angular/core";
import { MsgType } from "../model/itrade/message.model";
import {
    ComStrategyInfo, ComRecordPos, ESSSecuCategory, ComEquitPos, ComOrderData, AlphaSignalInfo,
    ComFuturePos, ComGWNetGuiInfo, ComProfitInfo, ComOrderRecord, ComContract, TimeVal,
    ComConOrderStatus, ComConOrderErrorInfo, ComOrderErrorInfo, ComOrderStatus, ComGuiAskStrategy,
    ComAccountPos, ComStrategyCfg, ComFundPos, ComMarginPos, MarginPos, ComTotalProfitInfo,
    ComConOrder, EOrderType, ComOrder, ComOrderCancel, StatArbOrder, ComGuiAckStrategy, FpPosUpdate
} from "../model/itrade/orderstruct";
declare var electron: Electron.ElectronMainAndRenderer;

export class OrderService {
    private _messageMap: any;
    // strategyinfo
    constructor() {
        this._messageMap = new Object();
        let msgObj = new Array<Object>();
        let self = this;
        electron.ipcRenderer.on("dal://itrade/data/order-reply", (e, data) => {
            // whether function
            // console.log("print order-reply info ,type:", data);
            let msgtype = data.header.type;
            let msgsubtype = data.header.subtype;
            let msglen = data.header.msglen;
            switch (msgtype) {
                // 'StrategyInfo'
                case 2011:
                case 2033:
                    msgObj = this.readStrategyInfo(data.content, msgtype, msgsubtype, msglen);
                    break;
                // StrategyCfg
                case 2000:
                case 2002:
                case 2004:
                case 2049:
                case 2030:
                case 2029:
                case 2032:
                    msgObj = this.readStrategyCfg(data.content, msgtype, msgsubtype, msglen);
                    break;
                // GuiCmdAck
                case 2001:
                case 2003:
                case 2005:
                case 2050:
                case 2031:
                    msgObj = this.readGuiCmdAck(data.content, msgtype, msgsubtype, msglen);
                    break;
                // ComTotalProfitInfo
                case 2048:
                    msgObj = this.readComTotalProfitInfo(data.content, msgtype, msgsubtype, msglen);
                    break;
                // order
                case 2020:
                    msgObj = this.readComConOrder(data.content, msgtype, msgsubtype, msglen);
                    break;
                case 2013:
                    msgObj = this.readComAccountPos(data.content, msgtype, msgsubtype, msglen);
                    break;
                case 3502:
                case 3504:
                    msgObj = this.readComRecordPos(data.content, msgtype, msgsubtype, msglen);
                    break;
                case 2015:
                case 2017:
                    msgObj = this.readComGWNetGuiInfo(data.content, msgtype, msgsubtype, msglen);
                    break;
                case 2023:
                    msgObj = this.readComProfitInfo(data.content, msgtype, msgsubtype, msglen);
                    break;
                case 2025:
                    msgObj = this.readStatArbOrder(data.content, msgtype, msgsubtype, msglen);
                    break;
                case 2021:
                    if (msgsubtype === 0) {
                        msgObj = this.readComConOrderStatus(data.content, msgtype, msglen);
                    }
                    else if (msgsubtype === 1) {
                        msgObj = this.readComConOrderErrorInfo(data.content, msgtype, msglen);
                    }
                    break;
                // orderDone
                case 2022:
                case 3011:
                case 3510:
                    msgObj = this.readComOrderRecord(data.content, msgtype, msgsubtype, msglen);
                    break;
                case 2040:
                    msgObj = this.readLog(data.content, msgtype, msgsubtype, msglen);
                    break;
                case 5021:
                    msgObj = this.readBasketBack(data.content, msgtype, msgsubtype, msglen);
                    break;
                case 5024:
                    msgObj = this.readPortfolioSummary(data.content, msgtype, msgsubtype, msglen);
                    break;
                case 5022:
                    msgObj = this.readPortfolioMsgError(data.content, msgtype, msgsubtype, msglen);
                    break;
                default:
                    break;
            }
            if (typeof (self._messageMap[data.header.type]) === "function") {
                self._messageMap[data.header.type](msgObj);
            } else {
                console.error(data.header.type + " not regist!");
            }
        });

    }

    registerServices(): void {
        electron.ipcRenderer.send("dal://itrade/data/order", {
            type: -1,
            subtype: -1,
            buffer: 0
        });
    }

    addSlot(type: number, cb: Function) {
        this._messageMap[type] = cb;
    }

    sendOrder(type: number, subtype: number, buffer: Buffer, cb?: Function) {
        electron.ipcRenderer.send("dal://itrade/data/order", {
            type: type,
            subtype: subtype,
            buffer: buffer
        });
    }
    readPortfolioMsgError(buffer: Buffer, msgtype: number, subtype: number, msglen: number) {
        let offset: number = 0;
        let unknowncount = buffer.readUInt32LE(offset); offset += 4;
        let account = buffer.readUIntLE(offset, 8); offset += 8;
        let count = buffer.readUInt32LE(offset); offset += 4;
        let ukey = buffer.readUInt32LE(offset); offset += 4;
        let logStr = buffer.slice(offset, offset += 256).toString("utf-8");
        logStr = String(logStr).slice(0, logStr.indexOf("\u0000"));
        // console.log(unknowncount, account, count, ukey, logStr);
        return [{ type: msgtype, logStr: logStr }];
    }
    readPortfolioSummary(buffer: Buffer, msgtype: number, subtype: number, msglen: number) {
        let res = [];
        let offset: number = 0;
        let unknowncount = buffer.readUInt32LE(offset); offset += 4;
        let account = buffer.readUIntLE(offset, 8); offset += 8;
        let count = buffer.readUInt32LE(offset); offset += 4;
        let ukey = buffer.readUInt32LE(offset); offset += 4;
        let indexLots = buffer.readUInt32LE(offset); offset += 4;
        let dayPnl = buffer.readIntLE(offset, 8); offset += 8;
        let onPnl = buffer.readIntLE(offset, 8); offset += 8;
        let value = buffer.readIntLE(offset, 8); offset += 8;
        // console.log(unknowncount, account, count, ukey, indexLots, dayPnl, onPnl, value);
        return [{ unknowncount: unknowncount, account: account, count: count, ukey: ukey, dayPnl: dayPnl, onPnl: onPnl, value: value }];
    }
    readBasketBack(buffer: Buffer, msgtype: number, subtype: number, msglen: number): Array<Object> {
        let res = [];
        let tableArr = [];
        let count: number = 0;
        let offset: number = 0;
        let unknowncount = buffer.readUInt32LE(offset); offset += 4;
        let account = buffer.readUIntLE(offset, 8); offset += 8;
        count = buffer.readUInt32LE(offset); offset += 4;
        if (count === 0) {
            return [{ account: account, data: tableArr }];
        } else {
            for (let i = 0; i < count; ++i) {
                let fpPosUpdate = new FpPosUpdate();
                fpPosUpdate.UKey = buffer.readUInt32LE(offset); offset += 4;
                fpPosUpdate.LastPrice = buffer.readUInt32LE(offset); offset += 4;
                fpPosUpdate.PreClose = buffer.readUInt32LE(offset); offset += 4;
                fpPosUpdate.BidSize = buffer.readUInt32LE(offset); offset += 4;
                fpPosUpdate.BidPrice = buffer.readUInt32LE(offset); offset += 4;
                fpPosUpdate.AskPrice = buffer.readUInt32LE(offset); offset += 4;
                fpPosUpdate.AskSize = buffer.readUInt32LE(offset); offset += 4;
                fpPosUpdate.InitPos = buffer.readInt32LE(offset); offset += 4;
                fpPosUpdate.TgtPos = buffer.readInt32LE(offset); offset += 4;
                fpPosUpdate.CurrPos = buffer.readInt32LE(offset); offset += 4;
                fpPosUpdate.WorkingVol = buffer.readUInt32LE(offset); offset += 4;
                fpPosUpdate.Diff = buffer.readInt32LE(offset); offset += 4;
                fpPosUpdate.Traded = buffer.readInt32LE(offset); offset += 4;
                fpPosUpdate.AvgBuyPrice = buffer.readUInt32LE(offset); offset += 4;
                fpPosUpdate.AvgSellPrice = buffer.readUInt32LE(offset); offset += 4;
                fpPosUpdate.Percentage = buffer.readUInt16LE(offset); offset += 2;
                fpPosUpdate.DayPnLCon = buffer.readIntLE(offset, 8); offset += 8;
                fpPosUpdate.ONPnLCon = buffer.readIntLE(offset, 8); offset += 8;
                fpPosUpdate.ValueCon = buffer.readIntLE(offset, 8); offset += 8;
                fpPosUpdate.PreValue = buffer.readIntLE(offset, 8); offset += 8;
                fpPosUpdate.Flag = buffer.readInt32LE(offset); offset += 4;
                if (fpPosUpdate.UKey !== 0)
                    tableArr.push(fpPosUpdate);
            }
        }
        // console.log(tableArr);
        return [{ account: account, data: tableArr, count: count }];
    }

    readGuiCmdAck(buffer: Buffer, msgtype: number, subtype: number, msglen: number): Array<Object> {
        let res = [];
        let count: number = 0;
        let offset: number = 0;
        let comGuiAckStrategy = new ComGuiAckStrategy();
        count = buffer.readUInt32LE(offset); offset += 4;
        comGuiAckStrategy.strategyid = buffer.readUInt32LE(offset); offset += 4;
        comGuiAckStrategy.key = buffer.readUInt32LE(offset); offset += 4;
        comGuiAckStrategy.value = buffer.readIntLE(offset, 8); offset += 8;
        comGuiAckStrategy.success = buffer.readUInt8(offset) === 1 ? true : false; offset += 4;
        comGuiAckStrategy.error = buffer.readUInt32LE(offset); offset += 4;
        res.push(comGuiAckStrategy);
        // console.log(comGuiAckStrategy);
        return res;

    }
    readLog(buffer: Buffer, msgtype: number, subtype: number, msglen: number): Array<Object> {
        let res = [];
        let offset: number = 0;
        let logStr = buffer.slice(offset, offset += 1024).toString("utf-8");
        logStr = String(logStr).slice(0, logStr.indexOf("\u0000"));
        res.push(logStr);
        return res;
    }

    readStatArbOrder(buffer: Buffer, msgtype: number, subtype: number, msglen: number): Array<Object> {
        let count: number = 0;
        let offset: number = 0;
        count = buffer.readUInt32LE(offset); offset += 4;
        let res = [];
        for (let i = 0; i < count; ++i) {
            let statArbOrder = new StatArbOrder();
            statArbOrder.strategyid = buffer.readUInt32LE(offset); offset += 4;
            statArbOrder.code = buffer.readUInt32LE(offset); offset += 4;
            statArbOrder.pricerate = buffer.readInt32LE(offset); offset += 8;
            statArbOrder.position = buffer.readIntLE(offset, 8); offset += 8;
            statArbOrder.quantity = buffer.readIntLE(offset, 8); offset += 8;
            statArbOrder.amount = buffer.readIntLE(offset, 8); offset += 8;
            statArbOrder.diffQty = buffer.readIntLE(offset, 8); offset += 8;
            res.push(statArbOrder);
        }
        return [{ subtype: subtype, content: res }];
    }
    readComConOrder(buffer: Buffer, msgtype: number, subtype: number, msglen: number): Array<Object> {
        let count: number = 0;
        let offset: number = 0;
        count = buffer.readUInt32LE(offset); offset += 4;
        let getOrderType: number = 0;
        let res = [];
        for (let i = 0; i < count; ++i) {
            let comConOrder = new ComConOrder();
            comConOrder.ordertype = buffer.readUInt8(offset); offset += 8;
            getOrderType = comConOrder.ordertype;
            comConOrder.con = new ComContract();
            comConOrder.con.contractid = buffer.readUInt32LE(offset); offset += 8;
            comConOrder.con.account = buffer.readUIntLE(offset, 8); offset += 8;
            comConOrder.con.orderaccount = buffer.slice(offset, offset + 20).toString("utf-8"); offset += 20;
            comConOrder.con.tradeunit = buffer.slice(offset, offset + 10).toString("utf-8"); offset += 10;
            comConOrder.con.tradeproto = buffer.slice(offset, offset + 10).toString("utf-8"); offset += 10;
            comConOrder.datetime = new TimeVal();
            comConOrder.datetime.tv_sec = buffer.readUIntLE(offset, 8); offset += 8;
            comConOrder.datetime.tv_usec = buffer.readUIntLE(offset, 8); offset += 8;
            if (comConOrder.ordertype === EOrderType.ORDER_TYPE_ORDER) {
                let orderdata = comConOrder.data = new ComOrder();
                orderdata.strategyid = buffer.readUInt32LE(offset); offset += 4;
                orderdata.algorid = buffer.readUInt32LE(offset); offset += 4;
                orderdata.orderid = buffer.readUInt32LE(offset); offset += 4;
                orderdata.algorindex = buffer.readUInt32LE(offset); offset += 4;
                orderdata.innercode = buffer.readUInt32LE(offset); offset += 4;
                orderdata.price = buffer.readUInt32LE(offset); offset += 4;
                orderdata.quantity = buffer.readUInt32LE(offset); offset += 4;
                orderdata.action = buffer.readUInt8(offset); offset += 1;
                orderdata.property = buffer.readUInt8(offset); offset += 1;
                orderdata.currency = buffer.readUInt8(offset); offset += 1;
                orderdata.covered = buffer.readUInt8(offset); offset += 1;
                orderdata.signal = [];
                for (let j = 0; j < 4; ++j) {
                    orderdata.signal[j] = new AlphaSignalInfo();
                    orderdata.signal[j].id = buffer.readUInt32LE(offset); offset += 8;
                    orderdata.signal[j].value = buffer.readUIntLE(offset, 8); offset += 8;
                }
            } else if (comConOrder.ordertype === EOrderType.ORDER_TYPE_CANCEL) {
                let canceldata = comConOrder.data = new ComOrderCancel();
                canceldata.strategyid = buffer.readUInt32LE(offset); offset += 4;
                canceldata.algorid = buffer.readUInt32LE(offset); offset += 4;
                canceldata.orderid = buffer.readUInt32LE(offset); offset += 4;
                canceldata.algorindex = buffer.readUInt32LE(offset); offset += 4;
                canceldata.innercode = buffer.readUInt32LE(offset); offset += 4;
                canceldata.price = buffer.readUInt32LE(offset); offset += 4;
                canceldata.quantity = buffer.readUInt32LE(offset); offset += 4;
                canceldata.action = buffer.readUInt8(offset); offset += 4;
                offset += 64;
            }
            res.push({ ordertype: getOrderType, content: comConOrder });
        }
        return res;
    }
    readComTotalProfitInfo(buffer: Buffer, msgtype: number, subtype: number, msglen: number): Array<Object> {
        let count: number = 0;
        let offset: number = 0;
        count = buffer.readUInt32LE(offset); offset += 4;
        let res = [];
        for (let i = 0; i < count; ++i) {
            let comTotalProfitInfo = new ComTotalProfitInfo();
            comTotalProfitInfo.strategyid = buffer.readUInt32LE(offset); offset += 8;
            comTotalProfitInfo.account = buffer.readUIntLE(offset, 8); offset += 8;
            comTotalProfitInfo.totalpositionpnl = buffer.readIntLE(offset, 8); offset += 8;
            comTotalProfitInfo.totaltodaypositionpnl = buffer.readIntLE(offset, 8); offset += 8;
            comTotalProfitInfo.totallastpositionpnl = buffer.readIntLE(offset, 8); offset += 8;
            comTotalProfitInfo.totaltradingpnl = buffer.readIntLE(offset, 8); offset += 8;
            comTotalProfitInfo.totallasttradingfee = buffer.readIntLE(offset, 8); offset += 8;
            comTotalProfitInfo.totaltradingfee = buffer.readIntLE(offset, 8); offset += 8;
            comTotalProfitInfo.totalintradaytradingfee = buffer.readIntLE(offset, 8); offset += 8;
            comTotalProfitInfo.totalpnl = buffer.readIntLE(offset, 8); offset += 8;
            comTotalProfitInfo.totalposition = buffer.readIntLE(offset, 8); offset += 8;
            comTotalProfitInfo.totaltodayposition = buffer.readIntLE(offset, 8); offset += 8;
            comTotalProfitInfo.totalLastposition = buffer.readIntLE(offset, 8); offset += 8;
            res.push(comTotalProfitInfo);
        }
        return [{ subtype: subtype, content: res }];
    }
    readStrategyInfo(buffer: Buffer, msgtype: number, subtype: number, msglen: number): Array<Object> {
        let count: number = 0;
        let offset: number = 0;
        count = buffer.readUInt32LE(offset); offset += 4;
        let getParabuffer = new Buffer(4 + 4);
        let res = [];
        for (let i = 0; i < count; ++i) {
            let strategyInfo = new ComStrategyInfo();
            strategyInfo.key = buffer.readUInt32LE(offset); offset += 4;
            strategyInfo.name = buffer.slice(offset, offset += 50).toString("utf-8");
            strategyInfo.status = buffer.readUInt8(offset); offset += 2;
            strategyInfo.category = buffer.readUInt32LE(offset); offset += 4;
            strategyInfo.parent = buffer.readUInt32LE(offset); offset += 4;
            strategyInfo.maxorderid = buffer.readUInt32LE(offset); offset += 4;
            strategyInfo.minorderid = buffer.readUInt32LE(offset); offset += 4;
            strategyInfo.orderidstep = buffer.readUInt32LE(offset); offset += 4;
            strategyInfo.currorderid = buffer.readUInt32LE(offset); offset += 4;
            strategyInfo.ismanualtrader = buffer.readUInt8(offset) === 1 ? true : false;
            if (msgtype === 2011) {
                // send  2028 & get strategy parameter
                let comGuiAskStrateg = new ComGuiAskStrategy();
                comGuiAskStrateg.strategyid = strategyInfo.key;
                let getParaOffset: number = 0;
                getParabuffer.writeInt32LE(1, getParaOffset); getParaOffset += 4;
                getParabuffer.writeInt32LE(strategyInfo.key, getParaOffset); getParaOffset += 4;
                this.sendOrder(2012, 0, getParabuffer, (data) => {
                    console.log("receive...2012...msg:", data);
                });
                this.sendOrder(2028, 0, getParabuffer, (data) => {
                    console.log("receive ...2028...msg:", data);
                });

            }
            res.push(strategyInfo);
            // console.log("strategyInfo:", strategyInfo);

        }
        return res;

    }
    readComRecordPos(buffer: Buffer, msgtype: number, subtype: number, msglen: number): Array<Object> {
        let count: number = 0;
        let offset: number = 0;
        count = buffer.readUInt32LE(offset); offset += 4;
        let res = [];
        // console.log("print readComRecordPos info-count :", count, buffer);
        for (let i = 0; i < count; ++i) {
            let comRecordPos = new ComRecordPos();
            comRecordPos.poolindex = buffer.readUInt32LE(offset); offset += 4;
            comRecordPos.poolpri = buffer.readUInt32LE(offset); offset += 4;
            comRecordPos.secucategory = buffer.readUInt8(offset); offset += 4;
            comRecordPos.strategyid = buffer.readUInt32LE(offset); offset += 4;
            comRecordPos.initpos = buffer.readUIntLE(offset, 8); offset += 8;
            if (ESSSecuCategory.SS_SECU_CATEGORY_EQUIT === comRecordPos.secucategory) {
                comRecordPos.record = new ComEquitPos();
                comRecordPos.record.date = buffer.readUInt32LE(offset); offset += 8;
                comRecordPos.record.account = buffer.readUIntLE(offset, 8); offset += 8;
                comRecordPos.record.code = buffer.readUInt32LE(offset); offset += 8;
                comRecordPos.record.TotalVol = buffer.readUIntLE(offset, 8); offset += 8;
                comRecordPos.record.AvlVol = buffer.readUIntLE(offset, 8); offset += 8;
                comRecordPos.record.WorkingVol = buffer.readUIntLE(offset, 8); offset += 8;
                comRecordPos.record.TotalCost = buffer.readUIntLE(offset, 8); offset += 8;
                comRecordPos.record.AvlCreRedempVol = buffer.readUIntLE(offset, 8); offset += 8;
                comRecordPos.record.CovedFrzVol = buffer.readUIntLE(offset, 8); offset += 8;
                comRecordPos.record.type = buffer.readUInt32LE(offset); offset += 16;
            } else if (ESSSecuCategory.SS_SECU_CATEGORY_FUTURE === comRecordPos.secucategory) {
                comRecordPos.record = new ComFuturePos();
                comRecordPos.record.date = buffer.readUInt32LE(offset); offset += 8;
                comRecordPos.record.account = buffer.readUIntLE(offset, 8); offset += 8;
                comRecordPos.record.code = buffer.readUInt32LE(offset); offset += 8;
                comRecordPos.record.TotalVol = buffer.readUIntLE(offset, 8); offset += 8;
                comRecordPos.record.AvlVol = buffer.readUIntLE(offset, 8); offset += 8;
                comRecordPos.record.WorkingVol = buffer.readUIntLE(offset, 8); offset += 8;
                comRecordPos.record.TotalCost = buffer.readUIntLE(offset, 8); offset += 8;
                comRecordPos.record.MarginAveragePrice = buffer.readUIntLE(offset, 8); offset += 8;
                comRecordPos.record.AveragePrice = buffer.readUIntLE(offset, 8); offset += 8;
                comRecordPos.record.type = buffer.readUInt32LE(offset); offset += 8;
                comRecordPos.record.TodayOpen = buffer.readUIntLE(offset, 8); offset += 8;
            }
            res.push(comRecordPos);
            //  console.log("print readComRecordPos info---- :", comRecordPos, offset);
        }
        return res;
    }

    readComGWNetGuiInfo(buffer: Buffer, msgtype: number, subtype: number, msglen: number): Array<Object> {
        let count: number = 0;
        let offset: number = 0;
        let res = [];
        count = buffer.readUInt32LE(offset); offset += 4;
        for (let i = 0; i < count; ++i) {
            let comStrategyInfo = new ComGWNetGuiInfo();
            comStrategyInfo.key = buffer.readUInt32LE(offset); offset += 4;
            let tempname = buffer.slice(offset, offset += 50).toString("utf-8");
            comStrategyInfo.name = String(tempname).slice(0, tempname.indexOf("\u0000"));
            comStrategyInfo.connected = buffer.readUInt8(offset) === 0 ? false : true;
            // console.log("comStrategyInfo:", comStrategyInfo);
            res.push(comStrategyInfo);
        }
        return res;
    }
    readComProfitInfo(buffer: Buffer, msgtype: number, subtype: number, msglen: number): Array<Object> {
        let count: number = 0;
        let offset: number = 0;
        let res = [];
        count = buffer.readUInt32LE(offset); offset += 4;
        // console.log("profit buffer :", buffer);
        for (let i = 0; i < count; ++i) {
            let comProfitInfo = new ComProfitInfo();
            comProfitInfo.strategyid = buffer.readUInt32LE(offset); offset += 8;
            comProfitInfo.account = buffer.readUIntLE(offset, 8); offset += 8;
            comProfitInfo.totalpositionpnl = buffer.readIntLE(offset, 8); offset += 8;
            comProfitInfo.totaltodaypositionpnl = buffer.readIntLE(offset, 8); offset += 8;
            comProfitInfo.totallastpositionpnl = buffer.readIntLE(offset, 8); offset += 8;
            comProfitInfo.totaltradingpnl = buffer.readIntLE(offset, 8); offset += 8;
            comProfitInfo.totallasttradingfee = buffer.readIntLE(offset, 8); offset += 8;
            comProfitInfo.totaltradingfee = buffer.readIntLE(offset, 8); offset += 8;
            comProfitInfo.totalintradaytradingfee = buffer.readIntLE(offset, 8); offset += 8;
            comProfitInfo.totalpnl = buffer.readUIntLE(offset, 8); offset += 8;
            comProfitInfo.totalposition = buffer.readIntLE(offset, 8); offset += 8;
            comProfitInfo.totaltodayposition = buffer.readIntLE(offset, 8); offset += 8;
            comProfitInfo.totalLastposition = buffer.readIntLE(offset, 8); offset += 8;

            comProfitInfo.innercode = buffer.readUInt32LE(offset); offset += 8;
            comProfitInfo.avgpriceforbuy = buffer.readIntLE(offset, 8); offset += 8;
            comProfitInfo.avgpriceforsell = buffer.readIntLE(offset, 8); offset += 8;
            comProfitInfo.positionpnl = buffer.readIntLE(offset, 8); offset += 8;
            comProfitInfo.tradingpnl = buffer.readIntLE(offset, 8); offset += 8;
            comProfitInfo.iopv = buffer.readIntLE(offset, 8); offset += 8;
            comProfitInfo.lasttradingfee = buffer.readIntLE(offset, 8); offset += 8;
            comProfitInfo.tradingfee = buffer.readIntLE(offset, 8); offset += 8;
            comProfitInfo.lastpositionpnl = buffer.readIntLE(offset, 8); offset += 8;
            comProfitInfo.todaypositionpnl = buffer.readIntLE(offset, 8); offset += 8;
            comProfitInfo.pnl = buffer.readIntLE(offset, 8); offset += 8;
            comProfitInfo.lastposition = buffer.readIntLE(offset, 8); offset += 8;
            comProfitInfo.todayposition = buffer.readIntLE(offset, 8); offset += 8;
            comProfitInfo.lastclose = buffer.readIntLE(offset, 8); offset += 8;
            comProfitInfo.marketprice = buffer.readIntLE(offset, 8); offset += 8;
            comProfitInfo.intradaytradingfee = buffer.readIntLE(offset, 8); offset += 8;
            res.push(comProfitInfo);
            // console.log("comProfitInfo:", comProfitInfo);
        }
        return res;
    }

    readComOrderRecord(buffer: Buffer, msgtype: number, subtype: number, msglen: number): Array<Object> {
        let count: number = 0;
        let offset: number = 0;
        count = buffer.readUInt32LE(offset); offset += 4;
        let res = [];
        for (let i = 0; i < count; ++i) {
            let comOrderRecord = new ComOrderRecord();
            comOrderRecord.poolindex = buffer.readUInt32LE(offset); offset += 4;
            comOrderRecord.poolpri = buffer.readUInt32LE(offset); offset += 4;
            comOrderRecord.datatype = buffer.readUInt8(offset); offset += 4;
            comOrderRecord.secucategory = buffer.readUInt32LE(offset); offset += 4;
            comOrderRecord.donetype = buffer.readUInt8(offset); offset += 1;
            comOrderRecord.cancel = buffer.readUInt8(offset) === 1 ? true : false; offset += 7;
            comOrderRecord.con = new ComContract();
            comOrderRecord.con.contractid = buffer.readUInt32LE(offset); offset += 8;
            comOrderRecord.con.account = buffer.readUIntLE(offset, 8); offset += 8;
            comOrderRecord.con.orderaccount = buffer.slice(offset, offset += 20).toString("utf-8");
            comOrderRecord.con.tradeunit = buffer.slice(offset, offset += 10).toString("utf-8");
            comOrderRecord.con.tradeproto = buffer.slice(offset, offset += 10).toString("utf-8");
            comOrderRecord.od = new ComOrderData();
            comOrderRecord.od.strategyid = buffer.readUInt32LE(offset); offset += 4;
            comOrderRecord.od.algorid = buffer.readUInt32LE(offset); offset += 4;
            comOrderRecord.od.orderid = buffer.readUInt32LE(offset); offset += 4;
            comOrderRecord.od.algorindex = buffer.readUInt32LE(offset); offset += 4;
            comOrderRecord.od.innercode = buffer.readUInt32LE(offset); offset += 4;
            comOrderRecord.od.oprice = buffer.readUInt32LE(offset); offset += 4;
            comOrderRecord.od.ovolume = buffer.readUInt32LE(offset); offset += 4;

            comOrderRecord.od.action = buffer.readUInt8(offset); offset += 1;
            comOrderRecord.od.property = buffer.readUInt8(offset); offset += 1;
            comOrderRecord.od.currency = buffer.readUInt8(offset); offset += 1;
            comOrderRecord.od.covered = buffer.readUInt8(offset); offset += 1;

            comOrderRecord.od.iprice = buffer.readUInt32LE(offset); offset += 4;
            comOrderRecord.od.ivolume = buffer.readUInt32LE(offset); offset += 4;
            comOrderRecord.od.status = buffer.readUInt8(offset); offset += 8;
            comOrderRecord.od.odatetime = new TimeVal();
            comOrderRecord.od.idatetime = new TimeVal();
            comOrderRecord.od.odatetime.tv_sec = buffer.readUIntLE(offset, 8); offset += 8;
            comOrderRecord.od.odatetime.tv_usec = buffer.readUIntLE(offset, 8); offset += 8;
            comOrderRecord.od.idatetime.tv_sec = buffer.readUIntLE(offset, 8); offset += 8;
            comOrderRecord.od.idatetime.tv_usec = buffer.readUIntLE(offset, 8); offset += 8;
            comOrderRecord.od.signal = [];
            for (let j = 0; j < 4; ++j) {
                comOrderRecord.od.signal[j] = new AlphaSignalInfo();
                comOrderRecord.od.signal[j].id = buffer.readUInt32LE(offset); offset += 8;
                comOrderRecord.od.signal[j].value = buffer.readUIntLE(offset, 8); offset += 8;
            }
            res.push(comOrderRecord);
            // console.log("comOrderRecord....:", comOrderRecord);
        }
        return res;
    }
    readComConOrderStatus(buffer: Buffer, msgtype: number, msglen: number): Array<Object> {
        let count: number = 0;
        let offset: number = 0;
        let res = [];
        count = buffer.readUInt32LE(offset); offset += 4;
        for (let i = 0; i < count; ++i) {
            let comConOrderStatus = new ComConOrderStatus();
            comConOrderStatus.valid = buffer.readUInt8(offset); offset += 8;
            comConOrderStatus.con = new ComContract();
            comConOrderStatus.con.contractid = buffer.readUInt32LE(offset); offset += 8;
            comConOrderStatus.con.account = buffer.readUIntLE(offset, 8); offset += 8;
            comConOrderStatus.con.orderaccount = buffer.slice(offset, offset += 20).toString("utf-8");
            comConOrderStatus.con.tradeunit = buffer.slice(offset, offset += 10).toString("utf-8");
            comConOrderStatus.con.tradeproto = buffer.slice(offset, offset += 10).toString("utf-8");
            comConOrderStatus.os = new ComOrderStatus();
            comConOrderStatus.os.strategyid = buffer.readUInt32LE(offset); offset += 4;
            comConOrderStatus.os.algorid = buffer.readUInt32LE(offset); offset += 4;
            comConOrderStatus.os.orderid = buffer.readUInt32LE(offset); offset += 4;
            comConOrderStatus.os.algorindex = buffer.readUInt32LE(offset); offset += 4;
            comConOrderStatus.os.innercode = buffer.readUInt32LE(offset); offset += 4;
            comConOrderStatus.os.action = buffer.readUInt8(offset); offset += 4;
            comConOrderStatus.os.price = buffer.readUInt32LE(offset); offset += 4;
            comConOrderStatus.os.quantity = buffer.readUInt32LE(offset); offset += 4;
            comConOrderStatus.os.datetime = new TimeVal();
            comConOrderStatus.os.datetime.tv_sec = buffer.readIntLE(offset, 8); offset += 8;
            comConOrderStatus.os.datetime.tv_usec = buffer.readUIntLE(offset, 8); offset += 8;
            comConOrderStatus.os.ordertype = buffer.readUInt8(offset); offset += 1;
            comConOrderStatus.os.tradetype = buffer.readUInt8(offset); offset += 1;
            comConOrderStatus.os.status = buffer.readUInt8(offset); offset += 1;
            res.push(comConOrderStatus);
            // console.log("comConOrderStatus:", comConOrderStatus);
        }
        return [{ subytpe: 0, content: res }];
    }
    readComConOrderErrorInfo(buffer: Buffer, msgtype: number, msglen: number): Array<Object> {
        let count: number = 0;
        let offset: number = 0;
        let res = [];
        let rtnStr: String = "";
        count = buffer.readUInt32LE(offset); offset += 4;
        for (let i = 0; i < count; ++i) {
            let comConOrderErrorInfo = new ComConOrderErrorInfo();
            comConOrderErrorInfo.con = new ComContract();
            comConOrderErrorInfo.con.contractid = buffer.readUInt32LE(offset); offset += 8;
            comConOrderErrorInfo.con.account = buffer.readUIntLE(offset, 8); offset += 8;
            comConOrderErrorInfo.con.orderaccount = buffer.slice(offset, offset += 20).toString("utf-8");
            comConOrderErrorInfo.con.tradeunit = buffer.slice(offset, offset += 10).toString("utf-8");
            comConOrderErrorInfo.con.tradeproto = buffer.slice(offset, offset += 10).toString("utf-8");
            comConOrderErrorInfo.os = new ComOrderErrorInfo();
            comConOrderErrorInfo.os.strategyid = buffer.readUInt32LE(offset); offset += 4;
            comConOrderErrorInfo.os.algorid = buffer.readUInt32LE(offset); offset += 4;
            comConOrderErrorInfo.os.orderid = buffer.readUInt32LE(offset); offset += 4;
            comConOrderErrorInfo.os.algorindex = buffer.readUInt32LE(offset); offset += 4;
            comConOrderErrorInfo.os.innercode = buffer.readUInt32LE(offset); offset += 4;
            comConOrderErrorInfo.os.action = buffer.readUInt8(offset); offset += 4;
            comConOrderErrorInfo.os.errorid = buffer.readInt32LE(offset); offset += 4;
            let logStr = buffer.slice(offset, offset += 1024).toString("utf-8");
            comConOrderErrorInfo.os.errormsg = String(logStr).slice(0, logStr.indexOf("\u0000"));
            rtnStr = "errorid:" + comConOrderErrorInfo.os.errorid + ";errorMsg:" + comConOrderErrorInfo.os.errormsg;
            offset += 4;
            comConOrderErrorInfo.os.datetime = new TimeVal();
            comConOrderErrorInfo.os.datetime.tv_sec = buffer.readUIntLE(offset, 8); offset += 8;
            comConOrderErrorInfo.os.datetime.tv_usec = buffer.readUIntLE(offset, 8); offset += 8;
            res.push(comConOrderErrorInfo);
            // console.log("comConOrderErrorInfo:", comConOrderErrorInfo);
        }
        return [{ type: 2021, subytpe: 1, logStr: rtnStr }];
    }

    readComAccountPos(buffer: Buffer, msgtype: number, msgsubtype: number, msglen: number): Array<Object> {
        let count: number = 0;
        let offset: number = 0;
        let res = [];
        count = buffer.readUInt32LE(offset); offset += 4;
        for (let i = 0; i < count; ++i) {
            let comAccountPos = new ComAccountPos();
            comAccountPos.market = buffer.readUInt32LE(offset); offset += 4;
            comAccountPos.secucategory = buffer.readUInt8(offset); offset += 4;
            comAccountPos.strategyid = buffer.readUInt32LE(offset); offset += 8;
            if (ESSSecuCategory.SS_SECU_CATEGORY_EQUIT === comAccountPos.secucategory) {
                comAccountPos.record = new ComFundPos();
                comAccountPos.record.date = buffer.readUInt32LE(offset); offset += 8;
                comAccountPos.record.account = buffer.readUIntLE(offset, 8); offset += 8;
                comAccountPos.record.c = buffer.slice(offset, offset + 1).toString("utf-8"); offset += 8;
                comAccountPos.record.TotalAmount = buffer.readUIntLE(offset, 8); offset += 8;
                comAccountPos.record.AvlAmount = buffer.readUIntLE(offset, 8); offset += 8;
                comAccountPos.record.FrzAmount = buffer.readUIntLE(offset, 8); offset += 8;
                offset += 80;
            } else if (ESSSecuCategory.SS_SECU_CATEGORY_FUTURE === comAccountPos.secucategory) {
                let margin = new ComMarginPos();
                margin.date = buffer.readUInt32LE(offset); offset += 8;
                margin.account = buffer.readUIntLE(offset, 8); offset += 8;
                margin.c = buffer.slice(offset, offset + 1).toString("utf-8"); offset += 8;
                margin.TotalAmount = buffer.readUIntLE(offset, 8); offset += 8;
                margin.AvlAmount = buffer.readUIntLE(offset, 8); offset += 8;
                margin.FrzAmount = buffer.readUIntLE(offset, 8); offset += 8;

                margin.BuyFrzAmt = buffer.readUIntLE(offset, 8); offset += 8;
                margin.SellFrzAmt = buffer.readUIntLE(offset, 8); offset += 8;
                margin.BuyMargin = buffer.readUIntLE(offset, 8); offset += 8;
                margin.SellFrzAmt = buffer.readUIntLE(offset, 8); offset += 8;
                margin.TotalMargin = buffer.readUIntLE(offset, 8); offset += 8;
                margin.Fee = buffer.readUIntLE(offset, 8); offset += 8;
                margin.PositionPL = buffer.readUIntLE(offset, 8); offset += 8;
                margin.ClosePL = buffer.readUIntLE(offset, 8); offset += 8;
                margin.PreFee = buffer.readUIntLE(offset, 8); offset += 8;
                margin.PreFundVal = buffer.readUIntLE(offset, 8); offset += 8;
                comAccountPos.record = margin;
            }
            res.push(comAccountPos);
            // console.log("comAccountPos:", comAccountPos);
        }
        return res;
    }
    readStrategyCfg(buffer: Buffer, msgtype: number, msgsubtype: number, msglen: number): Array<Object> {
        let count: number = 0;
        let offset: number = 0;
        let res = [];
        count = buffer.readUInt32LE(offset); offset += 4;
        for (let i = 0; i < count; ++i) {
            let comStrategyCfg = new ComStrategyCfg();
            comStrategyCfg.strategyid = buffer.readUInt32LE(offset); offset += 4;
            comStrategyCfg.key = buffer.readUInt32LE(offset); offset += 4;
            let str_end = buffer.indexOf(0, offset);
            comStrategyCfg.name = buffer.slice(offset, str_end).toString("utf-8");
            offset += 56;
            comStrategyCfg.value = buffer.readIntLE(offset, 8); offset += 8;
            comStrategyCfg.decimal = buffer.readUInt8(offset); offset += 1;
            comStrategyCfg.type = buffer.readUInt8(offset); offset += 1;
            comStrategyCfg.level = buffer.readUInt8(offset); offset += 1;
            comStrategyCfg.save = buffer.readUInt8(offset); offset += 1;
            comStrategyCfg.modify = buffer.readUInt8(offset); offset += 1;
            comStrategyCfg.dirty = buffer.readUInt8(offset); offset += 1;
            offset += 2;
            // console.log("comStrategyCfg:",comStrategyCfg);
            res.push(comStrategyCfg);
        }
        return res;
    }
}