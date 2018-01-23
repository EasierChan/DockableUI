"use strict";

import { Injectable } from "@angular/core";

export class DataSet {
    static modules = [
        {
            name: "资讯动态",
            icon: "home",
            // tabs: ["Dashboard", "Trading", "Simulation", "Risk", "Admin"]
            tabs: ["资讯动态"] // , "管理"
        },
        {
            name: "实盘交易",
            icon: "globe",
            tabs: ["产品", "策略", "风控"]
        },
        {
            name: "模拟交易",
            icon: "retweet",
            // tabs: ["BackTest", "Report"]
            tabs: ["仿真交易", "仿真记录查询", "回测", "回测报表"]
        },
        {
            name: "智能预测",
            icon: "road",
            // tabs: ["Profit", "RiskFactors"]
            tabs: ["AI看盘", "Alpha因子", "风险因子收益", "风险因子分析"]
        },
        {
            name: "行情分析",
            icon: "stats",
            // tabs: ["Profit", "RiskFactors"]
            tabs: ["价差分析", "篮子分析管理"]
        }
    ];

    static tabs(modName: string) {
        let mod = DataSet.modules.find(value => {
            return value.name === modName;
        });

        if (mod === undefined) {
            return null;
        }

        return mod.tabs;
    }
}

@Injectable()
export class SessionStorage {
    data: any;

    constructor() {
        this.data = {};
    }
}
