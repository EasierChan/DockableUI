"use strict";

import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { TileArea, Tile } from "../../../base/controls/control";
import { ConfigurationBLL, WorkspaceConfig, StrategyServerContainer, StrategyInstance } from "../../bll/strategy.server";
import { Menu, AppStoreService } from "../../../base/api/services/backend.service";
import { ChangeDetectorRef } from "@angular/core";
import { TradeService, QtpService } from "../../bll/services";

declare var window: any;
let ip20strs = [];

@Component({
    moduleId: module.id,
    selector: "backtest",
    templateUrl: "backtest.component.html",
    styleUrls: ["backtest.component.css"],
    providers: [
        Menu
    ]
})
export class BacktestComponent implements OnInit {
    areas: TileArea[];
    monitorHeight: number;
    bDetails: boolean;
    contextMenu: Menu;
    private configBll = new ConfigurationBLL();
    private strategyContainer = new StrategyServerContainer();
    configs: Array<WorkspaceConfig>;
    config: WorkspaceConfig;
    curTemplate: any;
    isInit: boolean = false;
    panelTitle: string;
    strategyName: string;
    strategyCores: string[];
    ProductMsg: string[];
    bshow: boolean = false;
    bcreate: boolean = false;
    bRead: boolean = false;
    bModify: boolean = false;
    accounts: string;
    gatewayObj: Object;
    setting: any;
    clickItem: any;
    backTestArea: any;
    bChangeShow: boolean = false;
    tileArr: string[] = [];
    sendLoopConfigs: any[] = [];
    lookbackItem: any;

    constructor(private appService: AppStoreService, private qtp: QtpService, private tgw: TradeService, private ref: ChangeDetectorRef) {
        this.contextMenu = new Menu();
        this.config = new WorkspaceConfig();
        this.config.curstep = 1;
        this.setting = this.appService.getSetting();
        this.contextMenu.addItem("Start", () => {
            this.operateStrategyServer(this.config, 1);
        });
        this.contextMenu.addItem("Stop", () => {
            this.operateStrategyServer(this.config, 0);
        });
        this.contextMenu.addItem("Modify", () => {
            this.config.curstep = 1;
            this.bRead = true;
            this.bshow = true;
            this.bModify = true;
            this.onPopup(1);
        });
        this.contextMenu.addItem("Remove", () => {
            console.log(this.clickItem, this.configs);
            let len = this.configs.length;
            for (let i = 0; i < len; ++i) {
                if (this.configs[i].chinese_name === this.clickItem.title) {
                    this.configs.splice(i, 1);
                    this.configBll.updateConfig();
                    this.backTestArea.removeTile(this.clickItem.title);
                    this.strategyContainer.removeItem(this.config.name);
                    break;
                }
            }
        });
        this.contextMenu.addItem("Turn Simulation", () => {
            console.log(this.config);
            this.bChangeShow = true;
        });
    }

    ngOnInit() {
        let self = this;
        this.bDetails = false;
        this.backTestArea = new TileArea();
        this.backTestArea.title = "BackTest";

        this.backTestArea.onCreate = () => {
            this.bshow = true;
            this.config.curstep = 1;
            this.onPopup(0);
        };
        this.backTestArea.onClick = (event: MouseEvent, item: Tile) => {
            this.clickItem = item;
            let len = this.configs.length;
            for (let i = 0; i < len; ++i) {
                if (this.configs[i].name === item.title) {
                    this.config = this.configs[i];
                    break;
                }
            }
            if (event.button === 0) {  // left click
                this.onStartApp();
            } else if (event.button === 2) { // right click
                this.contextMenu.popup();
            }
        };

        this.areas = [this.backTestArea];
        this.tgw.send(270, 194, { "head": { "realActor": "getDataTemplate" }, category: 0 }); // process templates
        this.tgw.addSlot({  // template
            appid: 270,
            packid: 194,
            callback: msg => {
                // console.info(msg);
                if (msg.content.head.pkgCnt > 1) {
                    if (ip20strs[msg.content.head.pkgId] === undefined)
                        ip20strs[msg.content.head.pkgId] = "";
                    if (msg.content.head.pkgIdx === msg.content.head.pkgCnt - 1) {
                        let templatelist = JSON.parse(ip20strs[msg.content.head.pkgId].concat(msg.content.body));
                        templatelist.body.forEach(template => {
                            this.configBll.updateTemplate(template.templatename, { id: template.id, body: JSON.parse(template.templatetext) });
                        });
                        self.configs = self.configBll.getAllConfigs();
                        self.configs.forEach(config => {
                            self.config = config;
                            self.config.state = 0;
                            self.curTemplate = JSON.parse(JSON.stringify(self.configBll.getTemplateByName(self.config.strategyCoreName)));
                            self.finish();
                        });
                        delete ip20strs[msg.content.head.pkgId];
                    } else {
                        ip20strs[msg.content.head.pkgId] = ip20strs[msg.content.head.pkgId].concat(msg.content.body);
                    }
                } else {
                    let templatelist = JSON.parse(ip20strs[msg.content.head.pkgId].concat(msg.content.body));
                    templatelist.body.forEach(template => {
                        this.configBll.updateTemplate(template.templatename, { id: template.id, body: JSON.parse(template.templatetext) });
                    });

                    self.configs = self.configBll.getAllConfigs();
                    self.configs.forEach(config => {
                        self.config = config;
                        self.config.state = 0;
                        self.curTemplate = JSON.parse(JSON.stringify(self.configBll.getTemplateByName(self.config.strategyCoreName)));
                        self.finish();
                    });
                }
                //  console.log(self.config, self.configs);
            }
        });
        this.tgw.addSlot({
            appid: 107,
            packid: 2001,
            callback: msg => {
                console.info(msg.content.body, this.config);
                let config = this.configs.find(item => { return item.name === msg.content.body.name; });
                if (config) {
                    config.name = msg.content.body.name;
                    config.host = msg.content.body.address;
                    this.configBll.updateConfig(config);
                    let rtn = this.tileArr.indexOf(config.name);
                    if (config.activeChannel === "lookback" && rtn === -1) {
                        let tile = new Tile();
                        tile.title = config.chinese_name;
                        tile.iconName = "adjust";
                        this.backTestArea.addTile(tile);
                        this.tileArr.push(config.name);
                        // this.isInit = true;
                        config.stateChanged = () => {
                            tile.backgroundColor = config.state ? "#E9B837" : "#f24959";
                        };
                        this.strategyContainer.removeItem(config.name);
                        this.strategyContainer.addItem(config);
                    }
                }
                // console.log(this.configs);
            }
        });

        this.tgw.addSlot({
            appid: 107,
            packid: 2003,
            callback: msg => {
                console.log(2003, msg);
                this.config.port = msg.content.strategyserver.port;
                this.configBll.updateConfig(this.config);
                this.strategyContainer.removeItem(this.config.name);
                this.strategyContainer.addItem(this.config);
            }
        });
        this.tgw.addSlot({
            appid: 107,
            packid: 2009,
            callback: msg => {
                let strategy_key = 0;
                let len = msg.content.body.strategies.length;
                for (let i = 0; i < len; ++i) {
                    // console.log(msg.content.body.strategies[i].strategy.name, this.config.name, msg.content.body.strategies[i].strategy.strategy_key);
                    if (msg.content.body.strategies[i].strategy.name === this.config.name) {
                        strategy_key = msg.content.body.strategies[i].strategy.strategy_key;
                        break;
                    }
                }
                this.config.strategyInstances[0].key = strategy_key + "";
                this.configBll.updateConfig(this.config);
                this.curTemplate.body.data.Strategy[0].key = strategy_key;
                console.log(this.config, this.curTemplate.body.data);
                this.tgw.send(107, 2000, {
                    routerid: 0, templateid: this.curTemplate.id, body: {
                        name: this.config.name, config: JSON.stringify(this.curTemplate.body.data), chinese_name: this.config.chinese_name,
                        strategies: this.config.strategies
                    }
                });
            }
        });
        this.qtp.addSlot({
            msgtype: 8012,
            callback: (msg) => {
                console.info("receive 8012:", msg);
                this.config.loopbackConfig.result = msg;
                let item = this.sendLoopConfigs.find((item, idx) => {
                    return item.reqsn === msg.reqsn;
                });
                if (item) {
                    item.id = msg.nId;
                    item.name = this.config.chinese_name;
                    let today = new Date();
                    item.date = today.getFullYear() + ("0" + (today.getMonth() + 1)).slice(-2) +
                        ("0" + today.getDate()).slice(-2);
                    this.lookbackItem = item;

                    this.configBll.addLoopbackItems(this.lookbackItem);
                } else {
                    console.error(`unvalid message. ${msg}`);
                }
            }
        });
    }

    finish() {
        // validation
        if (!this.config.name || this.config.name.length === 0 ||
            !this.config.strategyCoreName || !this.config.strategyInstances || this.config.strategyInstances.length === 0) {
            // console.log(this.config.name, this.config.name.length, this.config.strategyCoreName, this.config.strategyInstances, this.config.strategyInstances.length);
            alert("Wrong Config check items: <br>1. config name.<br>2. one strategy instance at least");
            return;
        }
        if (this.config.activeChannel === "lookback") {
            this.curTemplate.body.data.SSGW[0].ref = 0;
            this.curTemplate.body.data.SSGW.forEach((gw, index) => {
                gw.port = parseInt(this.config.loopbackConfig.result.port);
                gw.addr = this.config.loopbackConfig.result.url;
                if (index > 0) {
                    gw.ref = this.curTemplate.body.data.SSGW[0].key;
                }
            });
            this.curTemplate.body.data.SSFeed.detailview.PriceServer.port = parseInt(this.config.loopbackConfig.result.hqport);
            this.curTemplate.body.data.SSFeed.detailview.PriceServer.addr = this.config.loopbackConfig.result.hqurl;
            this.curTemplate.body.data.SSFeed.detailview.PriceServer.filename = "./lib/libFeedChronos.so";
        }
        this.curTemplate.body.data["SSNet"]["TSServer.port"] = this.config.port;
        this.curTemplate.body.data["globals"]["ss_instance_name"] = this.config.name;
        let sobj = Object.assign({}, this.curTemplate.body.data["Strategy"][0]);
        this.curTemplate.body.data["Strategy"].length = 0;
        this.curTemplate.body.data["PairTrades"] = {};
        let hasError = false;

        this.config.strategyInstances.forEach(item => {
            if (!item.accounts || item.accounts.length < 1) {
                hasError = true;
                return;
            }
            let obj = JSON.parse(JSON.stringify(sobj));
            obj.account = [];
            item.accounts.split(",").forEach(iact => {
                obj.account.push(parseInt(iact));
            });
            obj.algoes = item.algoes;
            obj.checks = item.checks;
            // obj.cfg = obj.field = obj.name = obj.log = item.name;
            obj.cfg = obj.field = obj.name = obj.log = this.config.name;
            obj.key = parseInt(item.key);
            obj.status = 2; // RUN;
            // obj.maxorderid = 0;
            // obj.minorderid
            // obj.orderstep
            item.parameters.forEach((iparam: any) => {
                iparam.value = parseFloat(iparam.value);
            });
            item.comments.forEach((icomment: any) => {
                if (icomment.value === "false" || icomment.value === "true") { // hack for specified requirement from backend
                    ;
                } else {
                    icomment.value = parseFloat(icomment.value);
                }
            });
            item.instruments.forEach((instrument: any) => {
                instrument.value = parseFloat(instrument.value);
            });
            this.curTemplate.body.data["Strategy"].push(obj);
            this.curTemplate.body.data["PairTrades"][item.name] = { // item.name
                Command: item.commands,
                Comment: item.comments,
                Instrument: item.instruments,
                Parameter: item.parameters
            };

            if (item.sendChecks) {
                this.curTemplate.body.data["PairTrades"][item.name]["SendCheck"] = item.sendChecks; // item.name
            }
        });

        if (hasError) {
            alert("Wrong Config check items: <br>1. config name.<br>2. one strategy instance at least.<br>3. account must not be empty.");
            return;
        }
        this.configBll.updateConfig(this.config);
        this.config.strategies = { name: this.config.name };
        if (!this.bshow) {
            this.tgw.send(107, 2000, {
                routerid: 0, templateid: this.curTemplate.id, body: {
                    name: this.config.name, config: JSON.stringify(this.curTemplate.body.data), chinese_name: this.config.chinese_name,
                    strategies: this.config.strategies
                }
            });
        }
        // console.log(this.config);
        if (this.bshow) {
            this.tgw.send(107, 2008, {
                routerid: 0, body: {
                    name: this.config.name,
                    strategies: [{ strategy: { name: this.config.name } }]
                }
            });
        }
        console.log(this.config);
        this.bcreate = false;
        this.bRead = false;
        this.bModify = false;
        this.closePanel();
    }
    static reqnum = 1;
    createLoopbackTest(): void {
        let tmpobj = {
            reqsn: BacktestComponent.reqnum++,
            timebegin: parseInt(this.config.loopbackConfig.option.timebegin.split("-").join("")),
            timeend: parseInt(this.config.loopbackConfig.option.timeend.split("-").join("")),
            speed: parseInt(this.config.loopbackConfig.option.speed),
            simlevel: parseInt(this.config.loopbackConfig.option.simlevel),
            period: parseInt(this.config.loopbackConfig.option.period),
            unit: parseInt(this.config.loopbackConfig.option.unit)
        };
        this.sendLoopConfigs.push(tmpobj);
        console.log("send 8010:", tmpobj);
        this.qtp.send(8010, tmpobj);
    }

    hideChange() {
        this.bChangeShow = false;
    }
    next() {
        if (this.config.curstep === 1) {
            if (!this.config.strategyCoreName || this.config.strategyCoreName.length === 0) {
                alert("a strategycore needed.");
                return;
            }
            if ((/^[A-Za-z0-9]+$/).test(this.config.name) || this.config.name.substr(0, 3) !== "ss-") {
                alert("please input correct format name");
                return;
            }
            if (!this.bcreate && !this.bModify) {
                // get template
                this.config.strategyCoreName = this.strategyCores[0];
                delete this.curTemplate;
                this.curTemplate = null;
                this.curTemplate = JSON.parse(JSON.stringify(this.configBll.getTemplateByName(this.config.strategyCoreName)));

                if (this.curTemplate === null) {
                    alert("Error: getTemplateByName `not found ${this.config.name}`");
                    return;
                    // get gateway
                }
                this.config.channels.gateway = this.curTemplate.body.data.SSGW;
                this.config.channels.feedhandler = this.curTemplate.body.data.SSFeed.detailview.PriceServer;
                this.strategyName = "";
                this.bcreate = true;
                let newInstance: StrategyInstance = new StrategyInstance();
                newInstance.name = this.config.name;
                newInstance.parameters = JSON.parse(JSON.stringify(this.curTemplate.body.data.Parameter));
                newInstance.comments = JSON.parse(JSON.stringify(this.curTemplate.body.data.Comment));
                newInstance.commands = JSON.parse(JSON.stringify(this.curTemplate.body.data.Command));
                newInstance.instruments = JSON.parse(JSON.stringify(this.curTemplate.body.data.Instrument));
                this.config.strategyInstances[0] = newInstance;
                // GET account info from product msg
                this.config.strategyInstances[0].accounts = "666600000011";
            }
            console.log(this.config);
        }
        if (this.config.curstep === 2) {
            this.config.activeChannel = "lookback";
            console.log(this.config);
        }
        if (this.config.curstep === 3) {
            this.createLoopbackTest();
        }
        ++this.config.curstep;
    }
    prev() {
        if (this.config.curstep === 2)
            this.bcreate = false;
        --this.config.curstep;
    }
    onSelectStrategy(value: string) {
        this.bcreate = true;
        this.config.strategyCoreName = value;
        delete this.curTemplate;
        this.curTemplate = null;
        this.curTemplate = JSON.parse(JSON.stringify(this.configBll.getTemplateByName(this.config.strategyCoreName)));

        if (this.curTemplate === null) {
            alert("Error: getTemplateByName `not found ${this.config.name}`");
            return;
        }
        // choose product and account
        this.config.channels.gateway = this.curTemplate.body.data.SSGW;
        this.config.channels.feedhandler = this.curTemplate.body.data.SSFeed.detailview.PriceServer;
        this.strategyName = "";
        let newInstance: StrategyInstance = new StrategyInstance();
        newInstance.name = this.config.name;
        newInstance.parameters = JSON.parse(JSON.stringify(this.curTemplate.body.data.Parameter));
        newInstance.comments = JSON.parse(JSON.stringify(this.curTemplate.body.data.Comment));
        newInstance.commands = JSON.parse(JSON.stringify(this.curTemplate.body.data.Command));
        newInstance.instruments = JSON.parse(JSON.stringify(this.curTemplate.body.data.Instrument));
        console.log(newInstance);
        this.config.strategyInstances[0] = newInstance;
        // GET account info from product msg
        this.config.strategyInstances[0].accounts = "666600000011";
        console.log(this.config);
    }
    lookbackTosimulation() {
        let getTmp = this.configBll.getTemplateByName(this.config.strategyCoreName);
        console.log(getTmp, this.config);
        this.config.channels.feedhandler.filename = getTmp.body.data.SSFeed.detailview.PriceServer.filename;
        this.config.activeChannel = "simulation";
        this.configBll.updateConfig(this.config);
        this.backTestArea.removeTile(this.clickItem.title);
        this.strategyContainer.removeItem(this.config.name);
        this.bChangeShow = false;
    }
    closePanel(e?: any) {
        if (this.bshow) {
            this.config.curstep = 1;
            this.bshow = false;
        }
    }
    duplicateRemove(data: any) {
        let temp = {};
        let arr = [];
        for (let i = 0; i < data.length; ++i) {
            if (!temp[data[i]]) {
                temp[data[i]] = true;
                arr.push(data[i]);
            }
        }
        return arr;
    }
    onStartApp() {
        if (!this.appService.startApp(this.config.name, this.config.apptype, {
            port: this.config.port,
            host: this.config.host,
            name: this.config.name,
            lang: this.setting.language,
            feedhandler: {
                port: this.config.channels.feedhandler.port,
                host: this.config.channels.feedhandler.addr
            }
        })) {
            alert(`start ${this.config.name} app error!`);
        }
    }
    onPopup(type: number = 0) {
        // this.bPopPanel = true;
        this.strategyCores = this.configBll.getTemplates();
        if (type === 0) {
            this.config = new WorkspaceConfig();
            this.config.strategyCoreName = this.strategyCores[0];
            console.log(this.strategyCores);
        } else {
            this.config.curstep = 1;
            this.curTemplate = null;
            this.curTemplate = this.configBll.getConfigByName(this.config.strategyCoreName);
        }
        if (!this.config.loopbackConfig.option) {
            let year = new Date().getFullYear();
            let month = ("0" + (new Date().getMonth() + 1)).slice(-2);
            let day = ("0" + new Date().getDate()).slice(-2);
            let idate = year + "-" + month + "-" + day;
            console.log("idate:", idate);
            this.config.loopbackConfig.option = {
                timebegin: idate,
                timeend: idate,
                speed: "1",
                simlevel: "1",
                period: "1",
                unit: "1"
            };
        }
    }
    operateStrategyServer(config: WorkspaceConfig, action: number) {
        console.info(config, action);
        this.tgw.send(107, 2002, { routerid: 0, strategyserver: { name: config.name, action: action } });
    }
    hide() {
        this.bshow = false;
        this.bRead = false;
        this.bModify = false;
        this.config.curstep = 1;
    }

}
