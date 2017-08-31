"use strict";

import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { TileArea, Tile } from "../../../base/controls/control";
import { ConfigurationBLL, WorkspaceConfig, StrategyContainer, StrategyInstance } from "../../bll/strategy.server";
import { Menu, AppStoreService } from "../../../base/api/services/backend.service";
import { ChangeDetectorRef } from "@angular/core";
import { TradeService } from "../../bll/services";

declare var window: any;
let ip20strs = [];

@Component({
    moduleId: module.id,
    selector: "backtest",
    templateUrl: "backtest.component.html",
    styleUrls: ["backtest.component.css"],
    providers: [
        Menu,
        ConfigurationBLL
    ]
})
export class BacktestComponent implements OnInit {
    areas: TileArea[];
    monitorHeight: number;
    bDetails: boolean;
    contextMenu: Menu;
    // private configBll = new ConfigurationBLL();
    private strategyContainer = new StrategyContainer();
    configs: Array<WorkspaceConfig>;
    config: WorkspaceConfig;
    curTemplate: any;
    isInit: boolean = false;
    panelTitle: string;
    strategyName: string;
    strategyCores: string[];
    ProductMsg: any[];
    bshow: boolean = false;
    bcreate: boolean = false;
    bModify: boolean = false;
    bSelStrategy: boolean = false;
    bcreateSuss: boolean = false;
    accounts: string;
    gatewayObj: Object;
    setting: any;
    clickItem: any;
    backTestArea: any;
    bChangeShow: boolean = false;
    tileArr: string[] = [];
    sendLoopConfigs: any[] = [];
    lookbackItem: any;
    strategymap: any;
    selectStrategyName: any;

    constructor(private appService: AppStoreService, private tgw: TradeService, private configBll: ConfigurationBLL) {
    }

    ngOnInit() {
        this.contextMenu = new Menu();
        this.config = new WorkspaceConfig();
        this.config.curstep = 1;
        this.setting = this.appService.getSetting();
        this.contextMenu.addItem("启动", () => {
            this.strategyContainer.removeItem(this.config.name);
            this.strategyContainer.addItem(this.config);
            this.operateStrategyServer(this.config, 1);
        });
        this.contextMenu.addItem("停止", () => {
            this.strategyContainer.removeItem(this.config.name);
            this.operateStrategyServer(this.config, 0);
        });
        this.contextMenu.addItem("修改", () => {
            this.config.curstep = 1;
            this.bshow = true;
            this.bModify = true;
            this.onPopup(1);
        });
        this.contextMenu.addItem("删除", () => {
            if (!confirm("确定删除？")) {
                return;
            } else {
                console.log(this.clickItem, this.configs);
                let len = this.configs.length;
                for (let i = 0; i < len; ++i) {
                    if (this.configs[i].chname === this.clickItem.title) {
                        this.configs.splice(i, 1);
                        this.configBll.updateConfig();
                        this.backTestArea.removeTile(this.clickItem.title);
                        this.strategyContainer.removeItem(this.config.name);
                        let tileIdx = this.tileArr.indexOf(this.config.name);
                        if (tileIdx !== -1) {
                            this.tileArr.splice(tileIdx, 1);
                        }
                        break;
                    }
                }
            }
        });

        this.contextMenu.addItem("移动到仿真", () => {
            console.log(this.config);
            this.bChangeShow = true;
        });

        this.bDetails = false;
        this.backTestArea = new TileArea();
        this.backTestArea.title = "回测";

        this.strategymap = {
            PairTrade: "统计套利",
            ManualTrader: "手工交易",
            PortfolioTrader: "组合交易",
            IndexSpreader: "做市策略",
            SimpleSpreader: "配对交易",
            BasketSpreader: "期现套利",
            BlockTrader: "大宗交易"
        };

        this.backTestArea.onCreate = () => {
            this.bcreateSuss = true;
            this.bshow = true;
            this.config.curstep = 1;
            this.onPopup(0);
        };

        this.backTestArea.onClick = (event: MouseEvent, item: Tile) => {
            this.clickItem = item;
            let len = this.configs.length;
            for (let i = 0; i < len; ++i) {
                if (this.configs[i].chname === item.title) {
                    this.config = this.configs[i];
                    break;
                }
            }
            if (event.button === 0) {  // left click
                this.onStartApp();
            } else if (event.button === 2) { // right click
                this.contextMenu.popup();
            }
            console.log(this.config, this.clickItem);
        };

        this.areas = [this.backTestArea];

        this.tgw.addSlot({
            appid: 107,
            packid: 2001,
            callback: msg => {
                console.info(msg.content.body, this.config);
                let config = this.configs.find(item => { return item.name === msg.content.body.name; });
                if (this.bcreateSuss) {
                    config.name = msg.content.body.name;
                    config.host = msg.content.body.address;
                    let rtn = this.tileArr.indexOf(config.name);
                    if (config.activeChannel === "lookback" && rtn === -1) {
                        let tile = new Tile();
                        tile.title = config.chname;
                        tile.iconName = "retweet";
                        this.backTestArea.addTile(tile);
                        this.tileArr.push(config.name);
                        // this.isInit = true;
                        this.strategyContainer.removeItem(config.name);
                        this.strategyContainer.addItem(config);
                        this.configBll.updateConfig(config);
                    } else if (config.activeChannel === "lookback" && rtn !== -1) {
                        this.backTestArea.getTileAt(rtn).title = config.chname;
                    }
                }
                this.bcreateSuss = false;
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
                        name: this.config.name, config: JSON.stringify(this.curTemplate.body.data), chinese_name: "",
                        strategies: { name: this.config.name }
                    }
                });
            }
        });

        this.tgw.addSlot({
            appid: 200,
            packid: 8012,
            callback: (msg) => {
                console.info("receive 8012:", msg);
                this.config.loopbackConfig.result = msg.content;
                let item = this.sendLoopConfigs.find((item, idx) => {
                    return item.reqsn === msg.content.reqsn;
                });
                this.config.channels.feedhandler.addr = msg.content.hqurl;
                this.config.channels.feedhandler.port = msg.content.hqport;
                for (let i = 0; i < this.config.channels.gateway.length; ++i) {
                    this.config.channels.gateway[i].addr = msg.content.url;
                    this.config.channels.gateway[i].port = msg.content.port;
                }

                if (item) {
                    item.id = msg.content.nId;
                    item.name = this.config.chname;
                    let today = new Date();
                    item.date = today.getFullYear() + ("0" + (today.getMonth() + 1)).slice(-2) +
                        ("0" + today.getDate()).slice(-2);
                    this.lookbackItem = item;

                    this.configBll.addLoopbackItems(this.lookbackItem);
                } else {
                    console.error(`unvalid message. ${msg.content}`);
                }
            }
        });

        this.configs = this.configBll.getAllConfigs();
        this.configs.forEach(config => {
            if (config.activeChannel === "lookback") {
                this.config = config;
                this.config.state = 0;
                this.curTemplate = JSON.parse(JSON.stringify(this.configBll.getTemplateByName(this.config.strategyCoreName)));
                if (this.curTemplate === null) {
                    return;
                }

                let rtn = this.tileArr.indexOf(config.name);
                if (config.activeChannel === "lookback" && rtn === -1) {
                    let tile = new Tile();
                    tile.title = config.chname;
                    tile.iconName = "retweet";
                    this.backTestArea.addTile(tile);
                    this.tileArr.push(config.name);

                    this.configBll.updateConfig(config);
                } else if (config.activeChannel === "loopback" && rtn !== -1) {
                    this.backTestArea.getTileAt(rtn).title = config.chname;
                }

                this.finish();
            }
        });

    }

    finish() {
        console.log(this.config);
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
        // this.configBll.updateConfig(this.config);
        this.config.strategies = { name: this.config.name };
        if (!this.bshow) {
            this.tgw.send(107, 2000, {
                routerid: 0, templateid: this.curTemplate.id, body: {
                    name: this.config.name, config: JSON.stringify(this.curTemplate.body.data), chinese_name: "",
                    strategies: { name: this.config.name }
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
        this.bModify = false;
        this.bSelStrategy = false;
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

        this.tgw.send(200, 8010, tmpobj);
    }

    next() {
        if (this.config.curstep === 1) {
            if ((/^[A-Za-z0-9]+$/).test(this.config.name) || this.config.name.substr(0, 3) !== "ss-") {
                alert("please input correct format name");
                return;
            }
            if (!this.bModify) {
                // get template
                if (!this.bSelStrategy)
                    this.config.strategyCoreName = this.getStrategyNameByChinese(this.strategyCores[0]);
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
                newInstance.sendChecks = JSON.parse(JSON.stringify(this.curTemplate.body.data.SendCheck));
                newInstance.algoes = [100, 101, 102, 103, 104];
                this.config.strategyInstances[0] = newInstance;
                // GET account info from product msg
                this.config.strategyInstances[0].accounts = "666600000011";

            }
        }
        if (this.config.curstep === 2) {
            this.config.activeChannel = "lookback";
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

    hideChange() {
        this.bChangeShow = false;
    }

    onSelectStrategy(value: string) {
        this.bcreate = true;
        this.bSelStrategy = true;
        this.config.strategyCoreName = this.getStrategyNameByChinese(value);
    }

    lookbackTosimulation() {
        let getTmp = this.configBll.getTemplateByName(this.config.strategyCoreName);
        this.config.channels.feedhandler.filename = getTmp.body.data.SSFeed.detailview.PriceServer.filename;
        // temporary setting
        for (let i = 0; i < this.config.channels.gateway.length; ++i) {
            this.config.channels.gateway[i].addr = "172.24.50.10";
            this.config.channels.gateway[i].port = 8000;
        }

        this.config.channels.feedhandler.filename = "./lib/libFeedChronos.so";
        this.config.activeChannel = "simulation";
        this.backTestArea.removeTile(this.clickItem.title);
        this.strategyContainer.removeItem(this.config.name);
        let tmpPort = this.config.channels.feedhandler.port;
        this.config.channels.feedhandler.port = parseInt(tmpPort);
        this.configBll.updateConfig(this.config);
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
                port: 0,
                host: ""
            }
        })) {
            alert(`start ${this.config.name} app error!`);
        }
    }

    onPopup(type: number = 0) {
        this.strategyCores = ["统计套利", "手工交易", "组合交易", "做市策略", "配对交易", "期现套利", "大宗交易"];
        if (type === 0) {
            this.config = new WorkspaceConfig();
            this.config.strategyCoreName = this.getStrategyNameByChinese(this.getStrategyNameByChinese(this.strategyCores[0]));
        } else {
            this.config.curstep = 1;
            this.curTemplate = null;
            this.curTemplate = this.configBll.getTemplateByName(this.config.strategyCoreName);
        }
        if (!this.config.loopbackConfig.option) {
            let year = new Date().getFullYear();
            let month = ("0" + (new Date().getMonth() + 1)).slice(-2);
            let day = ("0" + new Date().getDate()).slice(-2);
            let idate = year + "-" + month + "-" + day;
            this.config.loopbackConfig.option = {
                timebegin: idate,
                timeend: idate,
                speed: "3",
                simlevel: "2",
                period: "30",
                unit: "0"
            };
        }
    }

    getStrategyNameByChinese(data: any) {
        for (let o in this.strategymap) {
            if (this.strategymap[o] === data)
                return o;
        }
    }

    operateStrategyServer(config: WorkspaceConfig, action: number) {
        console.info(config, action);
        this.tgw.send(107, 2002, { routerid: 0, strategyserver: { name: config.name, action: action } });
    }

    hide() {
        this.bshow = false;
        this.bModify = false;
        this.config.curstep = 1;
    }
}
