"use strict";

import { WorkspaceConfig, Channel, StrategyInstance } from "../../base/api/model/app.model";
import { Header } from "../../base/api/model/itrade/message.model";
import { ComStrategyInfo } from "../../base/api/model/itrade/strategy.model";
import { ItradeService } from "../../base/api/services/itrade.service";
import { File, Environment, path } from "../../base/api/services/backend.service";

export class ConfigurationBLL {
    private readonly kTemplateExt: string = ".json";

    constructor() {
        this._names = [];
        this._templates = {};
        this._basedir = path.join(Environment.appDataDir, "workbench");
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

    updateConfig(config: WorkspaceConfig) {
        this._configs.push(config);
        File.writeAsync(this._configpath, JSON.stringify(this._configs, null, 2));
    }

    updateTemplate(name: string, template: any) {
        this._templates[name] = template;
        File.writeAsync(this._templatepath, JSON.stringify(this._templates, null, 2));
    }
}

export class StrategyBLL {
    private itrade: ItradeService = new ItradeService();
    static sessionId = 101;
    constructor() {
        this.itrade.sessionID = StrategyBLL.sessionId;
        StrategyBLL.sessionId += 1;
    }

    get sessionid(): number {
        return this.itrade.sessionID;
    }

    start(): void {
        this.itrade.addSlot(0, () => {
            let offset = 0;
            let body = Buffer.alloc(4 + 6 * Header.len);
            body.writeUInt32LE(6, offset); offset += 4;
            let header = new Header();
            header.type = 2048;
            header.subtype = 1;
            header.msglen = 0;
            offset += header.toBuffer().copy(body, offset);
            header.type = 2001;
            header.subtype = 0;
            offset += header.toBuffer().copy(body, offset);
            header.type = 2032;
            header.subtype = 0;
            offset += header.toBuffer().copy(body, offset);
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
        }, this);
        this.itrade.connect(9080, "172.24.51.4");
    }

    addSlot(type: number, callback: Function, context?: any): void {
        return this.itrade.addSlot(type, callback, context);
    }
}

export interface StrategyServerItem {
    name: string;
    config: WorkspaceConfig;
    conn: StrategyBLL;
}

export class StrategyServerContainer {
    private _items: StrategyServerItem[] = [];

    addItem(...configs: WorkspaceConfig[]): void {
        configs.forEach(config => {
            let bll = new StrategyBLL();
            bll.addSlot(2011, this.handleStrategyInfo, this);
            this._items.push({ name: config.name, config: config, conn: bll });
            bll.start();
        });
    }

    addItems(configs: WorkspaceConfig[]): void {
        configs.forEach(config => {
            let bll = new StrategyBLL();
            bll.addSlot(2011, this.handleStrategyInfo, this);
            this._items.push({ name: config.name, config: config, conn: bll });
            bll.start();
        });
    }

    handleStrategyInfo(msg: ComStrategyInfo, sessionid: number): void {
        this._items.forEach(item => {
            if (item.conn.sessionid === sessionid) {
                console.info(msg);
            }
        });
    }
}