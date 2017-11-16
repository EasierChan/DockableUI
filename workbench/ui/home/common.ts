"use strict";

import { Injectable } from "@angular/core";

export class DataSet {
    static modules = [
        {
            name: "主页",
            icon: "home",
            // tabs: ["Dashboard", "Trading", "Simulation", "Risk", "Admin"]
            tabs: ["首页"] // , "管理"
        },
        {
            name: "实盘信息",
            icon: "globe",
            tabs: ["实盘交易", "风控"]
        },
        {
            name: "模拟交易",
            icon: "retweet",
            // tabs: ["BackTest", "Report"]
            tabs: ["仿真交易", "回测", "回测报表"]
        },
        {
            name: "未来预测",
            icon: "road",
            // tabs: ["Profit", "RiskFactors"]
            tabs: ["风险因子收益", "风险因子分析", "Alpha因子"]
        },
        {
            name: "分析",
            icon: "stats",
            // tabs: ["Profit", "RiskFactors"]
            tabs: ["分析"]
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
