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
        this._basedir = path.join(Environment.getDataPath("workbench"));
        this._templatepath = path.join(this._basedir, "templates.json");
        // this._templates = File.parseJSON(this._templatepath) || {};

        // for (let prop in this._templates) {
        //     this._names.push({ name: prop, chname: this._templates[prop].chname ? this._templates[prop].chname : prop });
        // }

        this._ssconfigpath = path.join(this._basedir, "instances.json");
        this._ss_simulation_configs = [];
        this._ss_backtest_configs = [];
        this._ss_realtrade_configs = [];
        this.servers = [];
        // this.initSSConfigs(WorkspaceConfig.setObject(File.parseJSON(this._ssconfigpath) || []));

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

        this._abpath = path.join(this._basedir, "..", "alphaviewer");
        this._abconfigs = [];
        File.readdirSync(this._abpath).forEach(item => {
            if (item.length > 0 && !item.startsWith("Untitled")) {
                let idx = item.indexOf(".");
                this._abconfigs.push(item.substr(0, idx));
            }
        });

        this._bvpath = path.join(this._basedir, "..", "bookviewer");
        this._bvconfigs = [];
        File.readdirSync(this._bvpath).forEach(item => {
            if (item.length > 0 && !item.startsWith("Untitled")) {
                let idx = item.indexOf(".");
                this._bvconfigs.push(item.substr(0, idx));
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

    private _abconfigs: string[];
    private _abpath: string;

    private _bvconfigs: string[];
    private _bvpath: string;


    private _names: any[];
    private _products: any[];

    servers: number[];
    onCreated: Function;
    onUpdated: Function;
    onStateChanged: Function;
    tempConfig: WorkspaceConfig;
    timeout: any;


    initSSConfigs(configs: WorkspaceConfig[]) {
        this._ssconfigs = configs;
        this._ss_realtrade_configs.length = 0;
        this._ss_backtest_configs.length = 0;
        this._ss_simulation_configs.length = 0;

        this._ssconfigs.forEach(item => {
            switch (item.activeChannel) {
                case Channel.ONLINE:
                    this._ss_realtrade_configs.push(item);
                    break;
                case Channel.SIMULATION:
                    this._ss_simulation_configs.push(item);
                    break;
                case Channel.BACKTEST:
                    this._ss_backtest_configs.push(item);
                    break;
            }

            item.state = 0;
            this.servers.push(item.appid);
        });
    }
    /**
     * @return a list of available strategy templates.
     */
    getTemplates(): any[] {
        return this._names;
    }

    getTemplateByName(name: string): any {
        if (this._templates.hasOwnProperty(name)) {
            return JSON.parse(JSON.stringify(this._templates[name]));
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
            let info = "";
            let i = 0;
            for (; i < this._ssconfigs.length; ++i) {
                if (config.appid === this._ssconfigs[i].appid && config.activeChannel === this._ssconfigs[i].activeChannel) {
                    let oldName = this._ssconfigs[i].chname;

                    switch (config.activeChannel) {
                        case Channel.ONLINE:
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
                    if (this.onUpdated)
                        this.onUpdated(oldName, config);

                    info = "修改成功";
                    break;
                }
            }

            if (i === this._ssconfigs.length) {
                this._ssconfigs.push(config);
                switch (config.activeChannel) {
                    case Channel.ONLINE:
                        this._ss_realtrade_configs.push(config);
                        break;
                    case Channel.SIMULATION:
                        this._ss_simulation_configs.push(config);
                        break;
                    case Channel.BACKTEST:
                        this._ss_backtest_configs.push(config);
                        break;
                }

                if (this.onCreated)
                    this.onCreated(config);

                info = "创建成功";
            }

            if (this.timeout) {
                clearTimeout(this.timeout);
            }

            alert(info);
        }

        // File.writeSync(this._ssconfigpath, JSON.stringify(this._ssconfigs));
    }

    removeConfig(config: WorkspaceConfig) {
        for (let i = 0; i < this._ssconfigs.length; ++i) {
            if (config.appid === this._ssconfigs[i].appid && config.activeChannel === this._ssconfigs[i].activeChannel) {
                this._ssconfigs.splice(i, 1);

                switch (config.activeChannel) {
                    case Channel.ONLINE:
                        this._ss_realtrade_configs.splice(this._ss_realtrade_configs.indexOf(config), 1);
                        break;
                    case Channel.SIMULATION:
                        this._ss_simulation_configs.splice(this._ss_simulation_configs.indexOf(config), 1);
                        break;
                    case Channel.BACKTEST:
                        this._ss_backtest_configs.splice(this._ss_backtest_configs.indexOf(config), 1);
                        break;
                }

                let idx = this.servers.indexOf(config.items[0].key);
                if (idx >= 0) {
                    this.servers.splice(idx, 1);
                }

                // File.writeSync(this._ssconfigpath, JSON.stringify(this._ssconfigs));
                break;
            }
        }
    }

    moveConfig(config: WorkspaceConfig, channel: Channel) {
        if (config.activeChannel === channel)
            return;

        switch (config.activeChannel) {
            case Channel.ONLINE:
                this._ss_realtrade_configs.splice(this._ss_realtrade_configs.indexOf(config), 1);
                break;
            case Channel.SIMULATION:
                this._ss_simulation_configs.splice(this._ss_simulation_configs.indexOf(config), 1);
                break;
            case Channel.BACKTEST:
                this._ss_backtest_configs.splice(this._ss_backtest_configs.indexOf(config), 1);
                break;
        }

        config.activeChannel = channel;
        config.backtestConfig = null;
        switch (config.activeChannel) {
            case Channel.ONLINE:
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

    genInstance(config: WorkspaceConfig): Object {
        let instance = this.getTemplateByName(config.strategyType);
        instance["ss_instance_name"] = config.name;
        instance["SSData"]["backup"]["path"] += "/" + config.name;
        instance["SSInfo"]["name"] = config.name;
        instance["SSLog"]["file"] = instance["SSLog"]["file"].replace(/\$ss_instance_name/g, config.name);
        let parameters = instance["Strategy"][instance["Strategy"]["Strategies"][0]]["Parameter"];
        let instruments = instance["Strategy"][instance["Strategy"]["Strategies"][0]]["Instrument"];
        config.items[0].parameters.forEach(param => {
            if (parameters.hasOwnProperty(param.name)) {
                let target = parameters[param.name];
                target.value = param.value * Math.pow(10, target.decimal);
            }
        });

        config.items[0].instruments.forEach(instrument => {
            if (instruments.hasOwnProperty(instrument.name)) {
                instruments[instrument.name].value = instrument.value;
            }
        });

        switch (config.activeChannel) {
            case Channel.BACKTEST:
                instance["SSGW"]["Gateway"].addr = config.backtestConfig.tradePoint.host;
                instance["SSGW"]["Gateway"].port = config.backtestConfig.tradePoint.port;
                instance["SSFeed"]["PS"].addr = config.backtestConfig.quotePoint.host;
                instance["SSFeed"]["PS"].port = config.backtestConfig.quotePoint.port;
                break;
            case Channel.SIMULATION:
                break;
            case Channel.ONLINE:
                let product = this._products.find(item => { return item.tblock_id === config.productID; });

                if (product) {
                    instance["SSGW"]["Gateway"].addr = product.cfg.split("|")[0].split(",")[0];
                    instance["SSGW"]["Gateway"].port = product.cfg.split("|")[0].split(",")[1];
                    instance["Strategy"][instance["Strategy"]["Strategies"][0]]["account"] = product.broker_customer_code.split(",").map(item => { return parseInt(item); });
                } else {
                    console.error(`product error`);
                }
                break;
        }

        return instance;
    }

    updateTemplate(name: string, template: any) {
        if (!this._templates.hasOwnProperty(name)) {
            this._templates[name] = template;
            this._names.push({ name: name, chname: this.getTemplateChineseName(name) });
        } else {
            this._templates[name] = template;
        }

        File.writeSync(this._templatepath, JSON.stringify(this._templates));
        AppStoreService.setLocalStorageItem(DataKey.kStrategyTemplates, JSON.stringify(this._templates));
    }

    getTemplateChineseName(name: string): string {
        let nameMap: Object = {
            "pairtrader": "统计套利",
            "simplespreadtrader": "跨期套利",
            "manualtrader": "手工交易",
            "portfoliotrader": "篮子交易",
            "indexspreadtrader": "做市交易",
            "basketspreadtrader": "期现套利",
        };

        if (nameMap.hasOwnProperty(name))
            return nameMap[name];

        return name;
    }

    addLoopbackItems(item: any) {
        let value = this._loopbackItems.find(aItem => { return aItem.id === item.id; });
        if (!value) {
            this._loopbackItems.push(item);
        }
        File.writeAsync(this._loopbackPath, JSON.stringify(this._loopbackItems));
    }

    removeLoopbackItem(item: any) { // write once
        let idx = this._loopbackItems.findIndex(item => { return item.id === item.id; });
        if (idx >= 0) {
            this._loopbackItems.splice(idx, 1);
        }
    }

    syncLoopbackItem() {
        File.writeAsync(this._loopbackPath, JSON.stringify(this._loopbackItems));
    }

    getLoopbackItems() {
        return this._loopbackItems;
    }

    getSVConfigs() {
        return this._svconfigs;
    }

    getABConfigs() {
        return this._abconfigs;
    }

    getBVConfigs() {
        return this._bvconfigs;
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

    removeABConfigItem(config: string) {
        for (let i = 0; i < this._abconfigs.length; ++i) {
            if (this._abconfigs[i] === config) {
                this._abconfigs.splice(i, 1);
                File.unlinkSync(path.join(this._abpath, config + this.kTemplateExt));
                break;
            }
        }
    }

    removeBVConfigItem(config: string) {
        for (let i = 0; i < this._bvconfigs.length; ++i) {
            if (this._bvconfigs[i] === config) {
                this._bvconfigs.splice(i, 1);
                File.unlinkSync(path.join(this._bvpath, config + this.kTemplateExt));
                break;
            }
        }
    }

    setProducts(products: any[]) {
        this._products = products;
    }

    getProducts(): any[] {
        return this._products || [];
    }

    wait(fail_msg: string, timeout_val: number = 5000) {
        this.timeout = setTimeout(() => {
            alert(fail_msg);
        }, timeout_val);
    }

    private _emitter: Object = {};
    emit(name, value) {
        if (this._emitter.hasOwnProperty(name) && this._emitter[name] instanceof Function) {
            (this._emitter[name])(value);
        }
    }

    on(name, cb: (data) => void) {
        this._emitter[name] = cb;
    }

    private _data: any = {};

    set(key, value) {
        this._data[key] = value;
    }

    get(key) {
        return this._data[key];
    }
}