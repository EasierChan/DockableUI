"use strict";

import { Injectable } from "@angular/core";

export class DataSet {
    static modules = [
        {
            name: "主页",
            icon: "home",
            // tabs: ["Dashboard", "Trading", "Simulation", "Risk", "Admin"]
            tabs: ["首页", "实盘交易", "仿真交易", "风控"] // , "管理"
        },
        {
            name: "回测平台",
            icon: "repeat",
            // tabs: ["BackTest", "Report"]
            tabs: ["回测", "回测报表"]
        },
        {
            name: "趋势分析",
            icon: "send",
            // tabs: ["Profit", "RiskFactors"]
            tabs: ["风险因子收益", "风险因子分析"]
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
