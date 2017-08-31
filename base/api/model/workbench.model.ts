"use strict";

export class WorkspaceConfig {
    name: string;
    strategyCoreName: string;
    port: number;
    host: string;
    strategyInstances: StrategyInstance[];
    channels: { gateway: any, feedhandler: any };
    apptype: string = "DockDemo";
    activeChannel: string = "default";
    loopbackConfig?: any = {};
    chname: string = "";
    productId: number;

    constructor() {
        this.strategyInstances = [];
        this.channels = { gateway: null, feedhandler: null };
        this.port = 0;
        this.host = "127.0.0.1";
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
    key: string;
    name: string;
    accounts: string;
    algoes: number[] = [];
    checks: number[] = [];
    sendChecks?: Object[];
    parameters: Object[];
    comments: Object[];
    commands: Object[];
    instruments: Object[];
}