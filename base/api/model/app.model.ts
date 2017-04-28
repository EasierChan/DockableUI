"use strict";

export interface IApp {
    id: string;
    name: string;
    desc: string;
    category: string;
    version?: string;
    author?: string;
}

export interface UserProfile {
    username: string;
    password: string;
    roles: string[];
    apps: string[];
}

export abstract class Message {
    toString(): string {
        let props = Object.getOwnPropertyNames(this);
        let rets = "|";
        for (let i in props) {
            if (typeof this[props[i]] === "function" || props[i] === "len")
                continue;
            rets = rets.concat(props[i], "=", this[props[i]], "|");
        }
        return rets;
    }

    abstract fromBuffer(buffer: Buffer): void;
    abstract toBuffer(): Buffer;
}


export class WorkspaceConfig {
    name: string;
    tradingUniverse: number[];
    strategyCoreName: string;
    curstep: number;
    strategyInstances: StrategyInstance[];
    channels: string[];

    constructor() {
        this.curstep = 1;
        this.tradingUniverse = [];
        this.strategyInstances = [];
        this.channels = [];
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

    get apptype(): string {
        return "DockDemo";
    }

    // get name() {
    //     return this._name;
    // }

    // set name(value: string) {
    //     this._name = value;
    // }

    // get step() {
    //     return this._curstep;
    // }

    // set step(value: number) {
    //     this._curstep = value;
    // }

    // get selectedStrategy() {
    //     return this._strategyCoreName;
    // }

    // set selectedStrategy(value: string) {
    //     this._strategyCoreName = value;
    // }

    // get strategyInstances() {
    //     return this._strategyInstances;
    // }

    // get codes() {
    //     return this._tradingUniverse;
    // }

    // set codes(value: number[]) {
    //     this._tradingUniverse = value;
    // }
}


export class StrategyInstance {
    id: string;
    params: Object;
}

export class Channel {
    enable: boolean;
    name: string;
    type: number;
    account: number;
    addr: string;
    port: number;
}