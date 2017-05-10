"use strict";

import { Header } from "../../base/api/model/itrade/message.model";
import { ComStrategyInfo, ComTotalProfitInfo, ComGuiAckStrategy, ComStrategyCfg } from "../../base/api/model/itrade/strategy.model";
import { ItradeService } from "../../base/api/services/itrade.service";
import { File, Environment, path } from "../../base/api/services/backend.service";

export class ConfigurationBLL {
    private readonly kTemplateExt: string = ".json";

    constructor() {
        this._names = [];
        this._templates = {};
        this._basedir = path.join(Environment.appDataDir, "ChronosApps/workbench");
        this._templatepath = path.join(this._basedir, "templates.json");
        this._templates = File.parseJSON(this._templatepath) || {};

        for (let prop in this._templates) {
            this._names.push(prop);
        }

        this._configpath = path.join(this._basedir, "instances.json");
        this._configs = WorkspaceConfig.setObject(File.parseJSON(this._configpath) || []);
    }

    private _basedir: string;
    /**
     * store templates.
     */
    private _templates: Object;
    private _templatepath: string;

    private _configs: WorkspaceConfig[];
    private _configpath: string;

    private _names: string[];
    /**
     * @return a list of available strategy templates.
     */
    getTemplates(): string[] {
        return this._names;
    }

    getTemplateByName(name: string): any {
        if (this._templates.hasOwnProperty(name)) {
            return this._templates[name];
        }

        return null;
    }

    getConfigByName(name: string): WorkspaceConfig {
        this._configs.forEach(item => {
            if (item.name === name) {
                return item;
            }
        });
        return null;
    }

    getAllConfigs(): WorkspaceConfig[] {
        return this._configs;
    }

    updateConfig(config?: WorkspaceConfig) {
        if (config) {
            let i = 0;
            for (; i < this._configs.length; ++i) {
                if (config.name === this._configs[i].name)
                    break;
            }
            if (i === this._configs.length) {
                this._configs.push(config);
            }
        }
        File.writeAsync(this._configpath, JSON.stringify(this._configs));
    }

    updateTemplate(name: string, template: any) {
        this._templates[name] = template;
        File.writeAsync(this._templatepath, JSON.stringify(this._templates));
    }
}

export class StrategyBLL {
    static sessionId = 101;
    private itrade: ItradeService = new ItradeService();
    strategies: StrategyItem[] = [];
    connState: string;
    onConnect: Function;

    constructor() {
        this.itrade.sessionID = StrategyBLL.sessionId;
        StrategyBLL.sessionId += 1;
        this.connState = "INIT";
    }

    get sessionid(): number {
        return this.itrade.sessionID;
    }

    start(port: number, host: string): void {
        this.itrade.addSlot(0, () => {
            let offset = 0;
            let body = Buffer.alloc(4 + 5 * Header.len);
            body.writeUInt32LE(5, offset); offset += 4;
            let header = new Header();
            header.type = 2048;
            header.subtype = 1;
            header.msglen = 0;
            offset += header.toBuffer().copy(body, offset);
            header.type = 2001;
            header.subtype = 0;
            offset += header.toBuffer().copy(body, offset);
            // header.type = 2032;
            // header.subtype = 0;
            // offset += header.toBuffer().copy(body, offset);
            header.type = 2033;
            header.subtype = 0;
            offset += header.toBuffer().copy(body, offset);
            header.type = 2011;
            header.subtype = 0;
            offset += header.toBuffer().copy(body, offset);
            header.type = 2029;
            header.subtype = 0;
            offset += header.toBuffer().copy(body, offset);

            this.itrade.send(2998, 0, body);
            this.itrade.send(2010, 0, null);
            header = null;
            body = null;
            offset = null;
            this.connState = "CONNECTED";
            this.onConnect();
        }, this);
        this.itrade.addSlot(2001, this.handleStartCommand, this);
        this.itrade.addSlot(2005, this.handlePauseCommand, this);
        this.itrade.addSlot(2003, this.handleStopCommand, this);
        this.itrade.addSlot(2050, this.handleWatchCommand, this);
        this.itrade.addSlot(2011, this.handleStrategyInfo, this);
        this.itrade.addSlot(2033, this.handleStrategyInfo, this);
        this.itrade.addSlot(2048, this.handleStrategyProfitInfo, this);
        this.itrade.connect(port, host);
    }

    stop() {
        this.itrade.stop();
    }

    addSlot(type: number, callback: Function, context?: any): void {
        return this.itrade.addSlot(type, callback, context);
    }

    handleStrategyInfo(msg: ComStrategyInfo, sessionid: number): void {
        console.info(msg);
        let i = 0;
        for (; i < this.strategies.length; ++i) {
            if (this.strategies[i].id === msg.key) {
                this.strategies[i].status = msg.status === 0 ? "INIT" :
                    msg.status === 1 ? "CREAT" :
                        msg.status === 2 ? "RUN" :
                            msg.status === 3 ? "PAUSE" :
                                msg.status === 4 ? "STOP" :
                                    msg.status === 5 ? "WATCH" : "ERROR";
                break;
            }
        }

        if (i === this.strategies.length) {
            this.strategies.push({
                id: msg.key,
                name: msg.name,
                status: msg.status === 0 ? "INIT" :
                    msg.status === 1 ? "CREAT" :
                        msg.status === 2 ? "RUN" :
                            msg.status === 3 ? "PAUSE" :
                                msg.status === 4 ? "STOP" :
                                    msg.status === 5 ? "WATCH" : "ERROR"
            });
        }
    }

    handleStrategyProfitInfo(msg: ComTotalProfitInfo, sessionId: number): void {
        this.strategies.forEach(item => {
            if (item.id === msg.strategyid) {
                item.totalpnl = msg.totalpnl / 10000;
                item.totalposition = msg.totalposition / 10000;
            }
        });
    }

    handleStartCommand(msg: ComGuiAckStrategy, sessionId: number) {
        this.strategies.forEach(item => {
            if (item.id === msg.strategyid) {
                item.status = "RUN";
            }
        });
    }

    handlePauseCommand(msg: ComGuiAckStrategy, sessionId: number) {
        this.strategies.forEach(item => {
            if (item.id === msg.strategyid) {
                item.status = "PAUSE";
            }
        });
    }

    handleStopCommand(msg: ComGuiAckStrategy, sessionId: number) {
        this.strategies.forEach(item => {
            if (item.id === msg.strategyid) {
                item.status = "STOP";
            }
        });
    }

    handleWatchCommand(msg: ComGuiAckStrategy, sessionId: number) {
        this.strategies.forEach(item => {
            if (item.id === msg.strategyid) {
                item.status = "WATCH";
            }
        });
    }

    changeStatus(strategyid: number, status: number) {
        let buf = Buffer.alloc(4 + ComStrategyCfg.len, 0);
        buf.writeUInt32LE(4, 1);
        let cfg = new ComStrategyCfg();
        cfg.strategyid = strategyid;
        cfg.toBuffer().copy(buf, 4, 0);
        switch (status) {
            case 2:
                this.itrade.send(2000, 0, buf);
                break;
            case 3:
                this.itrade.send(2004, 0, buf);
                break;
            case 4:
                this.itrade.send(2002, 0, buf);
                break;
            case 5:
                this.itrade.send(2049, 0, buf);
                break;
        }
    }
}

interface StrategyItem {
    id: number;
    name: string;
    status: string;
    totalpnl?: number; // 8
    totalposition?: number; // 8
}

export interface StrategyServerItem {
    name: string;
    conn: StrategyBLL;
}

export class StrategyServerContainer {
    items: StrategyServerItem[] = [];

    addItem(...configs: WorkspaceConfig[]): void {
        configs.forEach(config => {
            let bll = new StrategyBLL();
            this.items.push({ name: config.name, conn: bll });
            bll.onConnect = () => {
                config.state = 1;
            };
            bll.addSlot(-1, () => {
                config.state = 0;
                bll.connState = "INIT";
                bll.strategies.length = 0;
            });
            bll.start(config.port, config.host);
        });
    }

    addItems(configs: WorkspaceConfig[]): void {
        configs.forEach(config => {
            let bll = new StrategyBLL();
            this.items.push({ name: config.name, conn: bll });
            bll.start(config.port, config.host);
        });
    }

    removeItem(configName: string): void {
        let i = this.items.length - 1;
        for (; i >= 0; --i) {
            if (this.items[i].name === configName) {
                this.items[i].conn.stop();
                this.items.splice(i, 1);
                break;
            }
        }
    }
}

export class WorkspaceConfig {
    name: string;
    tradingUniverse: number[];
    strategyCoreName: string;
    curstep: number;
    strategyInstances: StrategyInstance[];
    channels: { gateway: any, feedhandler: any };
    apptype: string = "DockDemo";
    private _port: string;
    host: string;
    activeChannel = "default";
    state: number = 0;
    loopbackConfig?: any = {};

    constructor() {
        this.curstep = 1;
        this.tradingUniverse = [];
        this.strategyInstances = [];
        this.channels = { gateway: null, feedhandler: null };
        this._port = "9000";
        this.host = "172.24.51.4";
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

    get port(): number {
        return parseInt(this._port);
    }

    set port(value: number) {
        this._port = value.toString();
    }
}


export class StrategyInstance {
    key: string;
    name: string;
    accounts: number[] = [];
    algoes: number[] = [];
    checks: number[] = [];
    sendChecks?: Object[];
    parameters: Object[];
    comments: Object[];
    commands: Object[];
    instruments: Object[];
}

export class Channel {
    enable: boolean;
    name: string;
    type: number;
    account: number;
    addr: string;
    port: number;
}