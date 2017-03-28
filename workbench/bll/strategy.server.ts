"use strict";

import { WorkspaceConfig, Channel, StrategyInstance } from "../../base/api/model/app.model";
import { Header } from "../../base/api/model/itrade/message.model";
import { ComStrategyInfo } from "../../base/api/model/itrade/strategy.model";
import { ItradeService } from "../../base/api/services/itrade.service";
const os = require("@node/os");
const path = require("@node/path");
const fs = require("@node/fs");

export class ConfigurationBLL {
    private readonly kTemplateExt: string = ".json";

    constructor() {
        this._names = [];
        this._templates = {};
        this._basedir = path.join(os.homedir(), ".itradeui");
        this._templatedir = path.join(this._basedir, "templates");
        fs.readdir(this._templatedir, (err, files) => {
            files.forEach(name => {
                fs.readFile(path.join(this._templatedir, name), (e, data) => {
                    this._names.push(path.basename(name, this.kTemplateExt));
                    this._templates[this._names[this._names.length - 1]] = JSON.parse(data);
                    console.info(this._templates);
                });
            });
        });

        fs.readFile(path.join(this._basedir, "configs", "ss-instances.json"), (e, data) => {
            this._configs = WorkspaceConfig.setObject(JSON.parse(data));
        });
    }

    private _basedir: string;
    private _templatedir: string;
    /**
     * store templates.
     */
    private _templates: Object;

    private _configs: WorkspaceConfig[];

    private _names: string[];
    /**
     * @return a list of available strategy templates.
     */
    getTemplates(): string[] {
        return this._names;
    }

    getTemplateByName(name: string): any {
        console.info(this._templates[name]);
        return this._templates[name];
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
}

export class StrategyBLL {
    private itrade: ItradeService = new ItradeService();
    static sessionId = 1;
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

    addItem(configs: WorkspaceConfig[]): void {
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