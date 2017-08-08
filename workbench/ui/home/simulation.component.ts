"use strict";

import { Component, OnInit } from "@angular/core";
import { TileArea, Tile } from "../../../base/controls/control";
import { ConfigurationBLL, WorkspaceConfig, StrategyServerContainer, Product, StrategyInstance } from "../../bll/strategy.server";
import { Menu, AppStoreService } from "../../../base/api/services/backend.service";
import { ChangeDetectorRef } from "@angular/core";
import { TradeService, QtpService } from "../../bll/services";

declare var window: any;
let ip20strs = [];
@Component({
    moduleId: module.id,
    selector: "simulation",
    templateUrl: "simulation.component.html",
    styleUrls: ["simulation.component.css"],
    providers: [
        Menu
    ]
})
export class SimulationComponent implements OnInit {
    areas: TileArea[];
    bDetails: boolean;
    contextMenu: Menu;
    private configBll = new ConfigurationBLL();
    private strategyContainer = new StrategyServerContainer();
    private product = new Product();
    configs: Array<WorkspaceConfig>;
    config: WorkspaceConfig;
    curTemplate: any;
    isInit: boolean = false;
    panelTitle: string;
    strategyName: string;
    strategyCores: string[];
    productsList: string[];
    ProductMsg: any[];
    bshow: boolean = false;
    bcreate: boolean = false;
    bRead: boolean = false;
    bSelProduct: boolean = false;
    bModify: boolean = false;
    bSelStrategy: boolean = false;
    accounts: string;
    gatewayObj: Object;
    setting: any;
    clickItem: any;
    simulationArea: TileArea;
    bChangeShow: boolean = false;
    tileArr: string[] = [];
    sendLoopConfigs: any[] = [];
    frame_host: any;
    frame_port: any;
    strategymap: any;


    constructor(private appService: AppStoreService, private qtp: QtpService, private tgw: TradeService, private ref: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.configs = this.configBll.getAllConfigs();
        this.contextMenu = new Menu();
        this.config = new WorkspaceConfig();
        this.config.curstep = 1;
        this.productsList = [];
        this.setting = this.appService.getSetting();
        this.contextMenu.addItem("启动", () => {
            this.operateStrategyServer(this.config, 1);
        });
        this.contextMenu.addItem("停止", () => {
            this.operateStrategyServer(this.config, 0);
        });
        this.contextMenu.addItem("修改", () => {
            this.config.curstep = 1;
            this.bRead = true;
            this.bshow = true;
            this.bModify = true;
            this.onPopup(1);
        });
        this.contextMenu.addItem("删除", () => {
            if (!confirm("确定删除？")) {
                return;
            } else {
                let len = this.configs.length;
                for (let i = 0; i < len; ++i) {
                    if (this.configs[i].chinese_name === this.clickItem.title) {
                        this.configs.splice(i, 1);
                        this.configBll.updateConfig();
                        this.simulationArea.removeTile(this.clickItem.title);
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
        this.contextMenu.addItem("移动到实盘", () => {
            console.log(this.config);
            this.bChangeShow = true;
            this.tgw.send(260, 216, { body: { tblock_type: 2 } });
        });

        this.frame_host = this.setting.endpoints[0].quote_addr.split(":")[0];
        this.frame_port = this.setting.endpoints[0].quote_addr.split(":")[1];
        let self = this;
        this.bDetails = false;
        this.simulationArea = new TileArea();
        this.simulationArea.title = "仿真";

        this.strategymap = {
            PairTrade: "统计套利",
            ManualTrader: "手工交易",
            PortfolioTrader: "组合交易",
            IndexSpreader: "做市策略",
            SimpleSpreader: "配对交易",
            BasketSpreader: "期现套利",
            BlockTrader: "大宗交易"
        };


        this.simulationArea.onCreate = () => {
            this.bshow = true;
            this.config.curstep = 1;
            this.onPopup(0);
        };
        this.simulationArea.onClick = (event: MouseEvent, item: Tile) => {
            this.clickItem = item;
            let len = this.configs.length;
            for (let i = 0; i < len; ++i) {
                if (this.configs[i].chinese_name === item.title) {
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

        this.areas = [this.simulationArea];
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
                    let rtn = this.tileArr.indexOf(config.name);
                    if (config.activeChannel === "simulation" && rtn === -1) {
                        let tile = new Tile();
                        tile.title = config.chinese_name;
                        tile.iconName = "tasks";
                        this.simulationArea.addTile(tile);
                        this.tileArr.push(config.name);
                        // this.isInit = true;
                        config.stateChanged = () => {
                            tile.backgroundColor = config.state ? "#71A9D6" : "#f24959";
                        };
                        this.strategyContainer.removeItem(config.name);
                        this.strategyContainer.addItem(config);
                        this.configBll.updateConfig(config);
                    } else if (config.activeChannel === "simulation" && rtn !== -1) {
                        this.simulationArea.getTileAt(rtn).title = config.chinese_name;
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
                console.log(this.config);
                let strategy_key = 0;
                let len = msg.content.body.strategies.length;
                for (let i = 0; i < len; ++i) {
                    // console.log(msg.content.body.strategies[i].strategy.name, this.config.name, msg.content.body.strategies[i].strategy.strategy_key);
                    if (msg.content.body.strategies[i].strategy.name === this.config.name) {
                        console.log("find config.name,insert key:", this.config, strategy_key);
                        strategy_key = msg.content.body.strategies[i].strategy.strategy_key;
                        break;
                    }
                }
                this.config.strategyInstances[0].key = strategy_key + "";
                // this.configBll.updateConfig(this.config);
                this.curTemplate.body.data.Strategy[0].key = strategy_key;
                console.log(this.config, this.curTemplate.body.data);
                this.tgw.send(107, 2000, {
                    routerid: 0, templateid: this.curTemplate.id, body: {
                        name: this.config.name, config: JSON.stringify(this.curTemplate.body.data), chinese_name: "",
                        strategies: this.config.strategies
                    }
                });
            }
        });

        this.qtp.addSlot({
            msgtype: 8012,
            callback: (msg) => {
                console.info("receive 8012:", msg);
                let addr = msg.url;
                let port = msg.port;
                for (let i = 0; i < this.config.channels.gateway.length; ++i) {
                    this.config.channels.gateway[i].port = parseInt(port);
                    this.config.channels.gateway[i].addr = addr;
                }
                console.log(this.config);
            }
        });
        this.tgw.addSlot({
            appid: 260,
            packid: 216,
            callback: msg => {
                let data = JSON.parse(msg.content.body);
                console.log(data, this.config);
                if (data.msret.msgcode === "00") {
                    this.ProductMsg = data.body;
                    for (let i = 0; i < data.body.length; ++i) {
                        this.product[data.body[i].tblock_id] = data.body[i];
                    }
                    for (let o in this.product) {
                        if (o === "_productInfo")
                            continue;
                        this.productsList.push(this.product[o].tblock_full_name);
                    }
                    // console.log(this.product, data.body.length); // 还有坑，先留着
                } else {
                    alert("Get product info Failed! " + data.msret.msg);
                    return;
                }
            }
        });

        this.tgw.send(270, 194, { "head": { "realActor": "getDataTemplate" }, category: 0 }); // process templates
    }

    static reqnum = 1;
    createLoopbackTest(): void {
        let tmpobj = {
            reqsn: SimulationComponent.reqnum++,
            timebegin: parseInt("20170727"),
            timeend: parseInt("20170727"),
            speed: parseInt("1"),
            simlevel: parseInt("1"),
            period: parseInt("1"),
            unit: parseInt("1")
        };
        this.sendLoopConfigs.push(tmpobj);
        console.log("send 8010:", tmpobj);
        // this.qtp.send(8010, tmpobj);
    }

    onSelectProduct(value: string) {
        console.log(value);
        this.bSelProduct = true;
        this.accounts = "";
        let len = this.ProductMsg.length;
        let account_arr = [];
        let gateway_arr = [];
        for (let i = 0; i < len; ++i) {
            if (this.ProductMsg[i].tblock_full_name === value) {
                account_arr.push(this.ProductMsg[i].broker_customer_code);
                gateway_arr.push(this.ProductMsg[i].cfg.split("|"));
            }
        }
        account_arr = this.duplicateRemove(account_arr);
        for (let j = 0; j < account_arr.length; ++j) {
            if (j === account_arr.length - 1) {
                this.accounts += account_arr[j];
            } else {
                this.accounts += account_arr[j] + ",";
            }
        }

        let tmp_gateway_arr = [];
        for (let tmp = 0; tmp < gateway_arr.length; ++tmp) {
            for (let tip = 0; tip < gateway_arr[tmp].length; ++tip) {
                tmp_gateway_arr.push(gateway_arr[tmp][tip]);
            }
        }
        gateway_arr = this.duplicateRemove(tmp_gateway_arr);
        let combine = {};
        for (let idx = 0; idx < gateway_arr.length; ++idx) {
            let tmp = gateway_arr[idx].split(",");
            combine[tmp[2]] = { addr: tmp[0], port: parseInt(tmp[1]) };
        }
        this.gatewayObj = combine;
        console.log(this.accounts, this.gatewayObj);
    }
    finish() {
        console.log(this.config);
        // validation
        if (!this.config.name || this.config.name.length === 0 ||
            !this.config.strategyCoreName || !this.config.strategyInstances || this.config.strategyInstances.length === 0) {
            // console.log(this.config.name, this.config.name.length, this.config.strategyCoreName, this.config.strategyInstances, this.config.strategyInstances.length);
            alert("Wrong Config check items: <br>1. config name.<br>2. one strategy instance at least");
            return;
        }
        if (this.config.activeChannel === "simulation") {
            this.config.channels.gateway.forEach((gw, index) => {
                console.log("print gw:", gw);
                if (index === 0)
                    this.curTemplate.body.data.SSGW[index].ref = 0;
                this.curTemplate.body.data.SSGW[index].port = gw.port = parseInt(gw.port);
                this.curTemplate.body.data.SSGW[index].addr = gw.addr = gw.addr;
            });

            this.curTemplate.body.data.SSFeed.detailview.PriceServer.port = parseInt(this.config.channels.feedhandler.port);
            this.curTemplate.body.data.SSFeed.detailview.PriceServer.addr = this.config.channels.feedhandler.addr;
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
        console.log(this.config.channels.gateway[0].port, this.config.channels.gateway[0].addr);
        this.config.strategies = { name: this.config.name };
        if (!this.bshow) {
            console.log("in usual model send 2000");
            this.tgw.send(107, 2000, {
                routerid: 0, templateid: this.curTemplate.id, body: {
                    name: this.config.name, config: JSON.stringify(this.curTemplate.body.data), chinese_name: "",
                    strategies: this.config.strategies
                }
            });
        }
        // console.log(this.config);
        if (this.bshow) {
            console.log("send 2008 get key");
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
        this.bSelStrategy = false;
        this.closePanel();
    }
    hideChange() {
        this.bChangeShow = false;
        this.bSelProduct = false;
    }
    simulationToTruly() {
        console.log("simulationToTruly");
        if (!this.bSelProduct) {
            console.log("select change product 0");
            this.onSelectProduct(this.productsList[0]);
        }
        for (let i = 0; i < this.config.channels.gateway.length; ++i) {
            for (let obj in this.gatewayObj) {
                if (parseInt(obj) === parseInt(this.config.channels.gateway[i].key)) {
                    this.config.channels.gateway[i].addr = this.gatewayObj[obj].addr;
                    this.config.channels.gateway[i].port = this.gatewayObj[obj].port;
                    break;
                }
            }
        }
        this.config.strategyInstances[0].accounts = this.accounts;
        this.config.activeChannel = "default";
        let getTmp = this.configBll.getTemplateByName(this.config.strategyCoreName);
        this.configBll.updateConfig(this.config);
        this.simulationArea.removeTile(this.clickItem.title);
        this.strategyContainer.removeItem(this.config.name);
        this.bChangeShow = false;
        this.bSelProduct = false;
    }
    next() {
        if (this.config.curstep === 1) {
            // if (!this.config.strategyCoreName || this.config.strategyCoreName.length === 0) {
            //     alert("a strategycore needed.");
            //     return;
            // }
            if ((/^[A-Za-z0-9]+$/).test(this.config.name) || this.config.name.substr(0, 3) !== "ss-") {
                alert("please input correct format name");
                return;
            }
            if (!this.bModify) {
                console.log(".....................");
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
                let gatewayLen = this.config.channels.gateway.length;
                console.log("in simulation model,ready inset addr and port:", gatewayLen, this.config);
                for (let i = 0; i < gatewayLen; ++i) {
                    console.log("insert gateway addr & port");
                    this.config.channels.gateway[i].addr = "172.24.51.1"; // "172.24.50.10";
                    this.config.channels.gateway[i].port = 8000;
                }
                this.config.channels.feedhandler = this.curTemplate.body.data.SSFeed.detailview.PriceServer;
                this.config.channels.feedhandler.filename = "./lib/libFeedChronos.so";
                this.config.channels.feedhandler.addr = "127.0.0.1";
                this.config.channels.feedhandler.port = 9200;
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

                if (this.config.strategyCoreName === "IndexSpreader") {
                    for (let i = 0; i < this.config.strategyInstances[0].instruments.length; ++i) {
                        if (this.config.strategyInstances[0].instruments[i].name === "backInnerCode") {
                            this.config.strategyInstances[0].instruments[i].value = 2008321;
                        }
                        if (this.config.strategyInstances[0].instruments[i].name === "frontInnerCode") {
                            this.config.strategyInstances[0].instruments[i].value = 2007116;

                        }
                    }
                }

                if (this.config.strategyCoreName === "SimpleSpreader") {
                    for (let i = 0; i < this.config.strategyInstances[0].instruments.length; ++i) {
                        if (this.config.strategyInstances[0].instruments[i].name === "backInnerCode") {
                            this.config.strategyInstances[0].instruments[i].value = 2008295;
                        }
                        if (this.config.strategyInstances[0].instruments[i].name === "frontInnerCode") {
                            this.config.strategyInstances[0].instruments[i].value = 2008589;

                        }
                    }
                }

                console.log(this.config);
            }
        }
        if (this.config.curstep === 2) {
            this.config.activeChannel = "simulation";
            // this.createLoopbackTest();
        }

        ++this.config.curstep;
    }
    prev() {
        if (this.config.curstep === 2)
            this.bcreate = false;
        --this.config.curstep;
    }
    getStrategyNameByChinese(data: any) {
        for (let o in this.strategymap) {
            if (this.strategymap[o] === data)
                return o;
        }
    }
    onSelectStrategy(value: string) {
        console.log(this.config);
        this.bcreate = true;
        this.bSelStrategy = true;
        this.config.strategyCoreName = this.getStrategyNameByChinese(value);
        // delete this.curTemplate;
        // this.curTemplate = null;
        // this.curTemplate = JSON.parse(JSON.stringify(this.configBll.getTemplateByName(this.config.strategyCoreName)));

        // if (this.curTemplate === null) {
        //     alert("Error: getTemplateByName `not found ${this.config.name}`");
        //     return;
        // }
        // // choose product and account
        // this.config.channels.gateway = this.curTemplate.body.data.SSGW;
        // this.config.channels.feedhandler = this.curTemplate.body.data.SSFeed.detailview.PriceServer;
        // this.strategyName = "";

        // let newInstance: StrategyInstance = new StrategyInstance();
        // newInstance.name = this.config.name;
        // newInstance.parameters = JSON.parse(JSON.stringify(this.curTemplate.body.data.Parameter));
        // newInstance.comments = JSON.parse(JSON.stringify(this.curTemplate.body.data.Comment));
        // newInstance.commands = JSON.parse(JSON.stringify(this.curTemplate.body.data.Command));
        // newInstance.instruments = JSON.parse(JSON.stringify(this.curTemplate.body.data.Instrument));
        // this.config.strategyInstances[0] = newInstance;
        // // GET account info from product msg
        // this.config.strategyInstances[0].accounts = "666600000011";
        // console.log(this.config);
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
                host: this.frame_host,
                port: parseInt(this.frame_port)
            }
        })) {
            alert(`start ${this.config.name} app error!`);
        }
    }
    onPopup(type: number = 0) {
        // this.bPopPanel = true;
        // this.strategyCores = this.configBll.getTemplates();
        this.strategyCores = ["统计套利", "手工交易", "组合交易", "做市策略", "配对交易", "期现套利", "大宗交易"];
        if (type === 0) {
            this.config = new WorkspaceConfig();
            this.config.strategyCoreName = this.getStrategyNameByChinese(this.getStrategyNameByChinese(this.strategyCores[0]));
            // console.log(this.strategyCores);
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