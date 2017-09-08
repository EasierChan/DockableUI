"use strict";

import { Injectable } from "@angular/core";
import { Header } from "../../base/api/model/itrade/message.model";
import { Channel } from "../../base/api/model/workbench.model";
import { ComStrategyInfo, ComTotalProfitInfo, ComGuiAckStrategy, ComStrategyCfg } from "../../base/api/model/itrade/strategy.model";
import { ItradeService } from "../../base/api/services/itrade.service";
import { StrategyService } from "../../base/api/services/strategy.service";
import { File, Environment, path, AppStoreService } from "../../base/api/services/backend.service";
import { WorkspaceConfig, StrategyInstance, DataKey } from "../../base/api/model/workbench.model";
export { WorkspaceConfig, StrategyInstance, DataKey, AppType, Channel } from "../../base/api/model/workbench.model";

@Injectable()
export class ConfigurationBLL {
    private readonly kTemplateExt: string = ".json";

    constructor() {
        this._names = [];
        this._templates = {};
        this._basedir = path.join(Environment.appDataDir, "ChronosApps/workbench");
        this._templatepath = path.join(this._basedir, "templates.json");
        this._templates = File.parseJSON(this._templatepath) || {};
        AppStoreService.setLocalStorageItem(DataKey.kStrategyTemplates, JSON.stringify(this._templates));

        for (let prop in this._templates) {
            this._names.push({ name: prop, chname: this._templates[prop].chname ? this._templates[prop].chname : prop });
        }

        this._ssconfigpath = path.join(this._basedir, "instances.json");
        this._ss_simulation_configs = [];
        this._ss_backtest_configs = [];
        this._ss_realtrade_configs = [];
        this._ssconfigs = WorkspaceConfig.setObject(File.parseJSON(this._ssconfigpath) || []);
        this._ssconfigs.forEach(item => {
            switch (item.activeChannel) {
                case Channel.DEFAULT:
                    this._ss_realtrade_configs.push(item);
                    break;
                case Channel.SIMULATION:
                    this._ss_simulation_configs.push(item);
                    break;
                case Channel.BACKTEST:
                    this._ss_backtest_configs.push(item);
                    break;
            }
        });

        this._loopbackPath = path.join(this._basedir, "loopback.json");
        this._loopbackItems = File.parseJSON(this._loopbackPath) || [];

        this._svpath = path.join(this._basedir, "..", "spreadviewer");
        this._svconfigs = [];
        File.readdirSync(this._svpath).forEach(item => {
            if (item.length > 0 && !item.startsWith("Untitled")) {
                let idx = item.indexOf(".");
                this._svconfigs.push(item.substr(0, idx));
            }
        });
    }

    private _basedir: string;
    /**
     * store templates.
     */
    private _templates: Object;
    private _templatepath: string;

    private _ss_simulation_configs: WorkspaceConfig[];
    private _ss_backtest_configs: WorkspaceConfig[];
    private _ss_realtrade_configs: WorkspaceConfig[];
    private _ssconfigs: WorkspaceConfig[];
    private _ssconfigpath: string;

    private _loopbackItems: any[];
    private _loopbackPath: string;

    private _svconfigs: string[];
    private _svpath: string;

    private _names: any[];
    /**
     * @return a list of available strategy templates.
     */
    getTemplates(): any[] {
        return this._names;
    }

    getTemplateByName(name: string): any {
        if (this._templates.hasOwnProperty(name)) {
            return this._templates[name];
        }
        return null;
    }

    getAllConfigs(): WorkspaceConfig[] {
        return this._ssconfigs;
    }

    getSimulationConfigs(): WorkspaceConfig[] {
        return this._ss_simulation_configs;
    }

    getBackTestConfigs(): WorkspaceConfig[] {
        return this._ss_backtest_configs;
    }

    getRealTradeConfigs(): WorkspaceConfig[] {
        return this._ss_realtrade_configs;
    }

    updateConfig(config?: WorkspaceConfig) {
        if (config) {
            let i = 0;
            for (; i < this._ssconfigs.length; ++i) {
                if (config.name === this._ssconfigs[i].name && config.activeChannel === this._ssconfigs[i].activeChannel) {
                    switch (config.activeChannel) {
                        case Channel.DEFAULT:
                            this._ss_realtrade_configs[this._ss_realtrade_configs.indexOf(this._ssconfigs[i])] = config;
                            break;
                        case Channel.SIMULATION:
                            this._ss_simulation_configs[this._ss_simulation_configs.indexOf(this._ssconfigs[i])] = config;
                            break;
                        case Channel.BACKTEST:
                            this._ss_backtest_configs[this._ss_backtest_configs.indexOf(this._ssconfigs[i])] = config;
                            break;
                    }

                    this._ssconfigs[i] = config;
                    break;
                }
            }

            if (i === this._ssconfigs.length) {
                this._ssconfigs.push(config);
                switch (config.activeChannel) {
                    case Channel.DEFAULT:
                        this._ss_realtrade_configs.push(config);
                        break;
                    case Channel.SIMULATION:
                        this._ss_simulation_configs.push(config);
                        break;
                    case Channel.BACKTEST:
                        this._ss_backtest_configs.push(config);
                        break;
                }
            }
        }

        File.writeSync(this._ssconfigpath, JSON.stringify(this._ssconfigs));
    }

    removeConfig(config: WorkspaceConfig) {
        for (let i = 0; i < this._ssconfigs.length; ++i) {
            if (config.name === this._ssconfigs[i].name && config.activeChannel === this._ssconfigs[i].activeChannel) {
                this._ssconfigs.splice(i, 1);
                break;
            }
        }

        File.writeSync(this._ssconfigpath, JSON.stringify(this._ssconfigs));
    }

    updateTemplate(name: string, template: any) {
        if (!this._templates.hasOwnProperty(name)) {
            this._templates[name] = template;
            this._names.push({ name: name, chname: this._templates[name].chname ? this._templates[name].chname : name });
        } else {
            this._templates[name] = template;
        }

        File.writeSync(this._templatepath, JSON.stringify(this._templates));
        AppStoreService.setLocalStorageItem(DataKey.kStrategyTemplates, JSON.stringify(this._templates));
    }

    addLoopbackItems(item: any) {
        let value = this._loopbackItems.find(aItem => { return aItem.id === item.id; });
        if (!value) {
            this._loopbackItems.push(item);
            File.writeAsync(this._loopbackPath, JSON.stringify(this._loopbackItems));
        }
    }

    updateLoopbackItems(item: any) { // write once
        this._loopbackItems = item;
        File.writeAsync(this._loopbackPath, JSON.stringify(this._loopbackItems));
    }

    getLoopbackItems() {
        return this._loopbackItems;
    }

    getSVConfigs() {
        return this._svconfigs;
    }

    addSVConfigItem(item) {
        if (!this._svconfigs.includes(item))
            this._svconfigs.push(item);
    }

    removeSVConfigItem(config: string) {
        for (let i = 0; i < this._svconfigs.length; ++i) {
            if (this._svconfigs[i] === config) {
                this._svconfigs.splice(i, 1);
                File.unlinkSync(path.join(this._svpath, config + this.kTemplateExt));
                break;
            }
        }
    }
}