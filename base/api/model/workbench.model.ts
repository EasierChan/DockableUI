"use strict";

/**
 * keys in localstorage
 */
export class DataKey {
    static readonly kStrategyCfg = "chronos-StrategyConfig";
    static readonly kProducts = "chronos-Products";
    static readonly kStrategyTypes = "chronos-StrategyTypes";
    static readonly kStrategyTemplates = "chronos-StrategyTemplates";
    static readonly kUserInfo = "chronos-userinfo";
}

export class AppType {
    static readonly kStrategyApp = "DockDemo";
    static readonly kSpreadViewer = "SpreadViewer";
    static readonly kAlphaViewer = "AlphaViewer";
    static readonly kBookViewer = "BookViewer";
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
    state: number;

    constructor() {
        this.items = [];
        this.state = 0;
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
    basketID: number;
    accounts: number[];
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
    ONLINE,
    SIMULATION,
    BACKTEST
}