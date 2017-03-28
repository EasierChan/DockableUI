"use strict";

import { Message } from "./message.model";

export enum EOrderAction {
    ORDER_ACTION_BUY,
    ORDER_ACTION_SELL,
    ORDER_ACTION_CREATE,
    ORDER_ACTION_REDEMPTION,
    ORDER_ACTION_REPO,
    ORDER_ACTION_REVERSE_REPO,
    ORDER_ACTION_EXECUTION,
    ORDER_ACTION_LOCK,
    ORDER_ACTION_UNLOCK,
    ORDER_ACTION_TRANSFER_AGREEMENT,
    ORDER_ACTION_MARKET_MAKING_TRANSFER,
    ORDER_ACTION_SUBSCRIPTION,
    ORDER_ACTION_NONE = 255
};

export enum EOrderProperty {
    ORDER_PROPERTY_UNKNOW,
    ORDER_PROPERTY_XJ,
    ORDER_PROPERTY_SJ,
    ORDER_PROPERTY_AGREEMENT,
    ORDER_PROPERTY_AGREEMENT_BOTH,
    ORDER_PROPERTY_DEFINED
};

export enum EOrderCoveredFlag {
    ORDER_COVERED_FLAG_NULL,
    ORDER_COVERED_FLAG_UNCOVER,
    ORDER_COVERED_FLAG_COVER,
};

export enum EOrderCurrency {
    ORDER_CURRENCY_UNKNOW,
    ORDER_CURRENCY_RMB,
    ORDER_CURRENCY_HK,
    ORDER_CURRENCY_DOLLAR
};

export enum EOrderStatus {
    ORDER_STATUS_INVALID,                         // 0:invalid status 无效
    ORDER_STATUS_INIT,                            // 1:init status 未报
    ORDER_STATUS_WAIT_SEND,                       // 2:待报
    ORDER_STATUS_SEND,                            // 3:已报
    ORDER_STATUS_SEND_WAIT_CANCEL,                // 4:已报待撤
    ORDER_STATUS_PART_WAIT_CANCEL,                // 5:部成待撤
    ORDER_STATUS_PART_CANCELED,                   // 6:部撤             end status
    ORDER_STATUS_CANCELED,                        // 7:已撤             end status
    ORDER_STATUS_PART_DEALED,                     // 8:部成
    ORDER_STATUS_DEALED,                          // 9:已成             end status
    ORDER_STATUS_DISCARDED                        // 10:废单            end status
};

export enum EOrderStatusGW {
    ORDER_STATUS_GW_SEND_PICK,                    // 报盘取出
    ORDER_STATUS_GW_SEND_CONFIRM,                 // 报盘确认
    ORDER_STATUS_GW_CANCEL,                       // 撤单
    ORDER_STATUS_GW_INNER_CANCEL,                 // 内部撤单
    ORDER_STATUS_GW_ALL_DEALED,                   // 全部成交
    ORDER_STATUS_GW_PART_DEALED,                  // 部分成交
    ORDER_STATUS_GW_CANCEL_DEALED,                // 撤单成交
    ORDER_STATUS_GW_MATCH_DENLED                  // 撮合被拒
};

export enum EOrderType {
    ORDER_TYPE_ORDER,
    ORDER_TYPE_CANCEL,
    ORDER_TYPE_UNKNOWN = 255
};

export enum SECU_MARKET {
    SM_EMPTY = 0,
    SM_SHFE = 10,
    SM_DCE = 13,
    SM_CZCE = 15,
    SM_CFFEX = 20,
    SM_NEEQ = 81,
    SM_SH = 83,
    SM_SZ = 90,
    SM_HKFE = 255,
};

export enum EStrategyStatus {
    STRATEGY_STATUS_INIT,
    STRATEGY_STATUS_CREATE,
    STRATEGY_STATUS_RUN,
    STRATEGY_STATUS_PAUSE,
    STRATEGY_STATUS_STOP,
    STRATEGY_STATUS_WATCH,
    STRATEGY_STATUS_ERROR
};

export enum ESSSecuMarket {
    SS_SECU_MARKET_UNKNOW,
    SS_SECU_MARKET_EQUIT,
    SS_SECU_MARKET_FUTURE
};

export enum ESSSecuCategory {
    SS_SECU_CATEGORY_UNKNOW,
    SS_SECU_CATEGORY_EQUIT,
    SS_SECU_CATEGORY_FUTURE
};

export enum EOrderAlgorid {
    ORDER_ALGORID_ALL = 0,
    ORDER_ALGORID_REST = 5000,
    ORDER_ALGORID_HEDGE
};

export enum EOrderAlgorIndex {
    ORDER_ALGORINDEX_ALL = 0
};

export enum EOrderPriceType {
    ORDER_STATUS_TYPE_UNKNOWN,
    ORDER_STATUS_TYPE_ACTIVE,
    ORDER_STATUS_TYPE_PASSIVE
};

export enum EOrderTradeType {
    ORDER_TRADE_TYPE_UNKNOWN,
    ORDER_TRADE_TYPE_OPEN,
    ORDER_TRADE_TYPE_CLOSE,
    ORDER_TRADE_TYPE_CLOSE_TODAY,
    ORDER_TRADE_TYPE_CLOSE_YESTERDAY
};

export enum StrategyCfgType {
    STRATEGY_CFG_TYPE_INSTRUMENT,
    STRATEGY_CFG_TYPE_COMMENT,
    STRATEGY_CFG_TYPE_PARAMETER,
    STRATEGY_CFG_TYPE_COMMAND
};

export enum EObjectInfoType {
    STRATEGY_CFG_TYPE_NONE,
    OBJECT_INFO_TYPE_VALUE,
    STRATEGY_CFG_TYPE_OBJECT
};

export enum EValueType {
    VALUE_TYPE_NONE,
    VALUE_TYPE_CHAR,
    VALUE_TYPE_CHARPTR,
    VALUE_TYPE_BYTE,
    VALUE_TYPE_BYTEPTR,
    VALUE_TYPE_SHORT,
    VALUE_TYPE_SHORTPTR,
    VALUE_TYPE_USHORT,
    VALUE_TYPE_USHORTPTR,
    VALUE_TYPE_INT,
    VALUE_TYPE_INTPTR,
    VALUE_TYPE_UINT,
    VALUE_TYPE_UINTPTR,
    VALUE_TYPE_LONG,
    VALUE_TYPE_LONGPTR,
    VALUE_TYPE_ULONG,
    VALUE_TYPE_ULONGPTR,
    VALUE_TYPE_INT64,
    VALUE_TYPE_INT64PTR,
    VALUE_TYPE_UINT64,
    VALUE_TYPE_UINT64PTR,
    VALUE_TYPE_FLOAT,
    VALUE_TYPE_FLOATPTR,
    VALUE_TYPE_DOUBLE,
    VALUE_TYPE_DOUBLEPTR,
    VALUE_TYPE_STRING,
    VALUE_TYPE_STRINGPTR
};

export class StatArbOrder {
    strategyid: number;   // UINT 4
    code: number; // UINT 4
    pricerate: number;  // INT 4
    position: number; // INT64 8
    quantity: number; // INT64 8
    amount: number; // INT64 8
    diffQty: number; // INT64 8
}

export class ComPoolIndex {
    poolindex: number;  // 4
    poolpri: number;  // 4
};

export class ComContract {
    contractid: number; // 4
    account: number; // 8
    orderaccount: string; // 20
    tradeunit: string; // 10
    tradeproto: string; // 10
};

export class AlphaSignalInfo {
    id: number; // 4
    value: number; // 8
};

export class ComOrder {
    strategyid: number; // 4
    algorid: number;  // 4
    orderid: number;  // 4
    algorindex: number; // 4
    innercode: number; // 4
    price: number; // 4
    quantity: number; // 4
    action: number;              // EOrderAction 1
    property: number;            // EOrderProperty 1
    currency: number;            // EOrderCurrency 1
    covered: number;             // EOrderCoveredFlag 1
    signal: AlphaSignalInfo[]; // 4
};

export class ComOrderCancel {
    strategyid: number; // 4
    algorid: number; // 4
    orderid: number; // 4
    algorindex: number; // 4
    innercode: number; // 4
    price: number; // 4
    quantity: number;  // 4
    action: number;     // EOrderAction 1
};

// //ASK  2020

export class TimeVal {
    tv_sec: number;
    tv_usec: number;
};

export class ComConOrder {
    ordertype: EOrderType;        // EOrderType 1
    con: ComContract;
    datetime: TimeVal;
    data: ComOrder | ComOrderCancel;
};

export class ComAlgoOrder extends ComConOrder {
    starttime: number; // 8
    endtime: number; // 8
};


export class ComOrderStatus {
    strategyid: number; // 4
    algorid: number; // 4
    orderid: number; // 4
    algorindex: number; // 4
    innercode: number; // 4
    action: number; // EOrderAction 1
    price: number; // 4
    quantity: number; // 4
    datetime: TimeVal;
    ordertype: number;        // EOrderPriceType 1
    tradetype: number;         // EOrderTradeType 1
    // status: EOrderStatusGW | EOrderStatus;
    status: EOrderStatus;
};

// //ACK  2021 0
export class ComConOrderStatus {
    valid: number;  // 1
    con: ComContract;
    os: ComOrderStatus;
};

export class ComOrderErrorInfo {
    strategyid: number;  // 4
    algorid: number;  // 4
    orderid: number;  // 4
    algorindex: number;  // 4
    innercode: number;  // 4
    action: number; // EOrderAction 1
    errorid: number;  // 4
    errormsg: string; // 1024
    datetime: TimeVal;
};

// //ACK  2021 1
export class ComConOrderErrorInfo {
    con: ComContract;
    os: ComOrderErrorInfo;
};

export class ComOrderData {
    strategyid: number;  // 4
    algorid: number;  // 4
    orderid: number;  // 4
    algorindex: number;  // 4
    innercode: number;  // 4
    oprice: number;  // 4
    ovolume: number;  // 4
    action: number;          // EOrderAction 1
    property: number;        // EOrderProperty 1
    currency: number;        // EOrderCurrency 1
    covered: number;         // EOrderCoveredFlag 1
    iprice: number;  // 4
    ivolume: number;  // 4
    status: EOrderStatus;
    odatetime: TimeVal;
    idatetime: TimeVal;
    signal: AlphaSignalInfo[]; // 4
};

// //ACK  2022
export class ComOrderRecord extends ComPoolIndex {
    datatype: number;        // EOrderDataType
    secucategory: number;    // SECU_CATEGORY 4
    donetype: EOrderPriceType;
    cancel: boolean;
    con: ComContract;
    od: ComOrderData;
};

export class SecurityPosBase {
    date: number; // 4
    account: number; // 8
    code: number; // 4
    TotalVol: number; // 8
    AvlVol: number; // 8
    WorkingVol: number; // 8
    TotalCost: number; // 8
};

export class StockPos extends SecurityPosBase {
    AvlCreRedempVol: number; // 8
    CovedFrzVol: number; // 8
};


export class ComEquitPos extends StockPos {
    type: number;  // 4
};

export class FuturePos extends SecurityPosBase {
    MarginAveragePrice: number; // 8
    AveragePrice: number; // 8
    type: number; // 4
    TodayOpen: number; // 8
};

export class ComFuturePos extends FuturePos {
};

// //ACK  3502 3504
export class ComRecordPos extends ComPoolIndex {
    secucategory: number;  // 1
    strategyid: number;  // 4
    initpos: number; // 8
    record: ComEquitPos | ComFuturePos;
};

export interface ComConOrderStatusPos {
    status: ComConOrderStatus;
    record: ComEquitPos | ComFuturePos;
};

export class FundPos {
    date: number; // 4
    account: number; // 8
    c: string;  // 1
    TotalAmount: number; // 8
    AvlAmount: number; // 8
    FrzAmount: number; // 8
};

export class ComFundPos extends FundPos {
};

export class MarginPos {
    date: number; // 4
    account: number; // 8
    c: string;  // 1
    TotalAmount: number; // 8
    AvlAmount: number; // 8
    FrzAmount: number; // 8

    BuyFrzAmt: number; // 8
    SellFrzAmt: number; // 8
    BuyMargin: number; // 8
    SellMargin: number; // 8
    TotalMargin: number; // 8
    Fee: number; // 8
    PositionPL: number; // 8
    ClosePL: number; // 8
    PreFee: number; // 8
    PreFundVal: number; //  8     上日结存
};

export class ComMarginPos extends MarginPos {
};

// //ACK  3502 3504
export class ComAccountPos {
    market: number;  // 4
    secucategory: number;  // 1
    strategyid: number; // 4
    record: ComFundPos | ComMarginPos;
};


// //ASK  2047  ACK 2048
export class ComTotalProfitInfo {
    strategyid: number;  // 4
    account: number; // 8
    totalpositionpnl: number; // 8
    totaltodaypositionpnl: number; // 8
    totallastpositionpnl: number; // 8
    totaltradingpnl: number; // 8
    totallasttradingfee: number; // 8
    totaltradingfee: number; // 8
    totalintradaytradingfee: number; // 8
    totalpnl: number; // 8
    totalposition: number; // 8
    totaltodayposition: number; // 8
    totalLastposition: number; // 8
};

// //ACK  2023
export class ComProfitInfo extends ComTotalProfitInfo {
    innercode: number;  // 4
    avgpriceforbuy: number; // 8
    avgpriceforsell: number; // 8
    positionpnl: number; // 8
    tradingpnl: number; // 8
    iopv: number; // 8
    lasttradingfee: number; // 8
    tradingfee: number; // 8
    lastpositionpnl: number; // 8
    todaypositionpnl: number; // 8
    pnl: number; // 8
    lastposition: number; // 8
    todayposition: number; // 8
    lastclose: number; // 8
    marketprice: number; // 8
    intradaytradingfee: number; // 8
};


// //ACK  2011
export class ComStrategyInfo {
    key: number = 0;  // 4
    name: string = "";  // 50
    status: number = 0;  // 1
    category: number = 0; // 4
    parent: number = 0;  // 4
    maxorderid: number = 0; // 4
    minorderid: number = 0; // 4
    orderidstep: number = 0; // 4
    currorderid: number = 0; // 4
    ismanualtrader: boolean = true;   // 1
};


// //ACK  2015
export class ComGWNetGuiInfo {
    key: number; // 4
    name: string; // 50
    connected: boolean;
};


// //ACK  2013
export interface ComAccountStrategyInfo extends FundPos {
    strategyid: number; // 4
};


// //ASK  2012
export class ComGuiAskStrategy {
    strategyid: number; // 4
};


// //AcK
export interface ComGuiAckStrategy {
    strategyid: number; // 4
    key: number; // 4
    value: number; // 8
    success: boolean;
    error: number; // 4
};


export interface QPVolume {
    volume: number; // 4
    cancel: number; // 4
    action: number; // 1
};


// #define QP_VOLUME_SIZE 1
// //ACK 2026
export interface ComQPNetInfo {
    innercode: number; // 4
    price: number; // 4
    quantity: number; // 4
    cancel: number; // 4
    front: number; // 4
    back: number; // 4
    total: number; // 4
    type: number; // 1
    action: number; // 1
    bvolume: QPVolume[]; // 1
    svolume: QPVolume[]; // 1
};


// //ASK 2028 ACK 2029
export class ComStrategyCfg {
    strategyid: number; // 4
    key: number;  // 4
    name: string; // 50
    value: number; // 8
    decimal: number; // 1
    type: number; // 1
    level: number; // 1
    save: number; // 1
    modify: number; // 1
    dirty: number; // 1
};

// //ASK 4001 ACK 4002
export interface ComAlgoInfo {
    id: number; // 4
    name: string;  // 50
};

// #define ASK_OBJECT_INFO_DEFAULT_ID 0
export interface AskGetObjectInfo {
    id: number; // 4
};

export interface AckGetObjectInfo {
    ownerid: number; // 4
    objid: number; // 4
    ownername: string; // 1024
    objname: string; // 1024
    valuetype: number; // 1
    objtype: number; // 1
    value: string; // 1024
    valuelen: number; // 4
};

export interface AskSetObjectInfo {
    ownerid: number; // 4
    objid: number; // 4
    value: string; // 1024
    valuelen: number; // 4
};

export interface AckSetObjectInfo {
    ownerid: number; // 4
    objid: number; // 4
    result: boolean;
};

export interface ErrorObjectInfo {
    ownerid: number; // 4
    objid: number; // 4
    errid: number; // 4
    errmsg: string; // 1024
};
