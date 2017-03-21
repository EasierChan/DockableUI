"use strict";

import { WorkspaceConfig, Channel, StrategyInstance } from "../../base/api/model/app.model";
const os = require("@node/os");
const path = require("@node/path");
const fs = require("@node/fs");

export class StrateServerBLL {
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