"use strict";

export class DataSet {
    static modules = [
        {
            name: "history",
            tabs: ["BackTest", "Report"]
        },
        {
            name: "present",
            tabs: ["Dashboard", "Trading", "Simulation", "Risk", "Admin"]
        },
        {
            name: "future",
            tabs: ["RiskFactors"]
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