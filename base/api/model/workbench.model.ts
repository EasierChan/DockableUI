"use strict";

/**
 * keys in localstorage
 */
export class DataKey {
    static readonly kStrategyCfg = "chronos-StrategyConfig";
    static readonly kProducts = "chronos-Products";
    static readonly kStrategyTypes = "chronos-StrategyTypes";
    static readonly kStrategyTemplates = "chronos-StrategyTemplates";
}

export class AppType {
    static readonly kStrategyApp = "DockDemo";
    static readonly kSpreadViewer = "SpreadViewer";
}

export class WorkspaceConfig {
    name: string;
    chname: string;
    appid: number;
    strategyType: string;
    items: StrategyInstance[];
    activeChannel: Channel;
    backtestConfig?: any;
    productID: string;

    constructor() {
        this.items = [];
    }

    static setObject(obj: any): WorkspaceConfig[] {
        let configs: WorkspaceConfig[] = [];

        obj.forEach(item => {
            let config = new WorkspaceConfig();
            for (let prop in item) {
                config[prop] = item[prop];
            }

            configs.push(config);
        });

        return configs;
    }
}

export class StrategyInstance {
    key: number;
    name: string;
    accounts: string;
    algoes: number[];
    checks: number[];
    sendChecks?: Object[];
    parameters: any[];
    comments: Object[];
    commands: Object[];
    instruments: any[];
}

class Endpoint {
    port: number;
    host: string;
}

export enum Channel {
    DEFAULT,
    SIMULATION,
    BACKTEST
}