"use strict";

import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { TileArea, Tile, DataTable, DataTableColumn } from "../../../base/controls/control";
import { ConfigurationBLL, WorkspaceConfig, StrategyServerContainer, Product, StrategyInstance, SpreadViewConfig } from "../../bll/strategy.server";
import { Menu, AppStoreService } from "../../../base/api/services/backend.service";
import { ChangeDetectorRef } from "@angular/core";
import { TradeService } from "../../bll/services";

declare var window: any;
let ip20strs = [];
@Component({
    moduleId: module.id,
    selector: "trade",
    templateUrl: "trade.component.html",
    styleUrls: ["trade.component.css"],
    providers: [
        Menu,
        AppStoreService
    ]
})
export class TradeComponent implements OnInit {
    areas: TileArea[];
    resTable: DataTable;
    monitorHeight: number;
    bDetails: boolean;
    contextMenu: Menu;
    svMenu: Menu;
    private configBll = new ConfigurationBLL();
    private strategyContainer = new StrategyServerContainer();
    newInstance = new StrategyInstance();
    private product = new Product();
    configs: Array<WorkspaceConfig>;
    config: WorkspaceConfig;
    curTemplate: any;
    isInit: boolean = false;
    panelTitle: string;
    strategyName: string;
    strategyCores: string[];
    productsList: string[];
    tileArr: string[] = [];
    analyticArr: string[] = [];
    ProductMsg: any[];
    svconfigs: SpreadViewConfig[];
    svconfig: SpreadViewConfig;
    bshow: boolean = false;
    bcreate: boolean = false;
    bRead: boolean = false;
    bModify: boolean = false;
    bSelStrategy: boolean = false;
    bSpread: boolean = false;
    bSelProduct: boolean = false;
    bNameRead: boolean = false;
    accounts: string = "";
    gatewayObj: Object;
    setting: any;
    clickItem: any;
    strategyArea: TileArea;
    analyticArea: TileArea;
    frame_host: any;
    strategymap: any;
    frame_port: any;
    svClickItem: any;


    constructor(private appService: AppStoreService, private tgw: TradeService, private ref: ChangeDetectorRef) {
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
            this.bshow = true;
            this.bRead = true;
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
                        this.strategyArea.removeTile(this.clickItem.title);
                        this.strategyContainer.removeItem(this.config.name);
                        break;
                    }
                }
            }
        });

        this.svMenu = new Menu();
        this.svMenu.addItem("修改", () => {
            console.log(this.svconfig);
            this.onModifySpreadViewer();
        });
        this.svMenu.addItem("删除", () => {
            if (!confirm("确定删除？")) {
                return;
            } else {
                let len = this.svconfigs.length;
                for (let i = 0; i < len; ++i) {
                    if (this.svconfigs[i].name === this.svClickItem.title) {
                        // this.svconfigs.splice(i, 1);
                        this.configBll.removeSVConfigItem(this.svconfig);
                        console.log(this.svconfigs);
                        this.analyticArea.removeTile(this.svClickItem.title);
                        break;
                    }
                }
            }
            this.configBll.removeSVConfigItem(this.svconfig);
        });
    }

    ngOnInit() {
        let setting = this.appService.getSetting();
        this.frame_host = setting.endpoints[0].quote_addr.split(":")[0];
        this.frame_port = setting.endpoints[0].quote_addr.split(":")[1];

        this.strategymap = {
            PairTrade: "统计套利",
            ManualTrader: "手工交易",
            PortfolioTrader: "组合交易",
            IndexSpreader: "做市策略",
            SimpleSpreader: "配对交易",
            BasketSpreader: "期现套利",
            BlockTrader: "大宗交易"
        };

        let self = this;
        this.bDetails = false;
        let productArea = new TileArea();
        productArea.title = "产品";
        productArea.onClick = (event: MouseEvent, item: Tile) => {
            this.appService.startApp("产品信息", "Dialog", {
                dlg_name: "product",
                productID: item.data
            });
        };

        this.strategyArea = new TileArea();
        this.strategyArea.title = "策略";
        this.strategyArea.onCreate = () => {
            this.bshow = true;
            this.config.curstep = 1;
            this.onPopup(0);
        };
        this.strategyArea.onClick = (event: MouseEvent, item: Tile) => {
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

        this.analyticArea = new TileArea();
        this.analyticArea.title = "分析";
        this.analyticArea.onCreate = () => {
            this.svconfig = new SpreadViewConfig();
            this.bSpread = true;
        };
        this.analyticArea.onClick = (event: MouseEvent, item: Tile) => {
            this.svClickItem = item;
            let len = this.svconfigs.length;
            for (let i = 0; i < len; ++i) {
                if (this.svconfigs[i].name === item.title) {
                    this.svconfig = this.svconfigs[i];
                    break;
                }
            }
            if (event.button === 0) {
                if (!this.appService.startApp(this.svconfig.name, this.svconfig.apptype, {
                    port: parseInt(this.frame_port),
                    host: this.frame_host,
                    lang: this.setting.language,
                    details: this.svconfig,
                })) {
                    alert("Error `Start ${name} app error!`");
                }
            } else if (event.button === 2) {
                console.log(this.svconfig, "item:", item);
                this.svMenu.popup();
            }
        };

        this.areas = [productArea, this.strategyArea, this.analyticArea];
        this.resTable = new DataTable("table2");
        this.resTable.addColumn2(new DataTableColumn("策略ID", false, true));
        this.resTable.addColumn2(new DataTableColumn("策略名", false, true));
        this.resTable.addColumn2(new DataTableColumn("状态", false, true));
        this.resTable.addColumn2(new DataTableColumn("启动", false, true));
        this.resTable.addColumn2(new DataTableColumn("暂停", false, true));
        this.resTable.addColumn2(new DataTableColumn("停止", false, true));
        this.resTable.addColumn2(new DataTableColumn("监听", false, true));
        this.resTable.addColumn2(new DataTableColumn("总盈亏", false, true));
        this.resTable.addColumn2(new DataTableColumn("总仓位", false, true));
        // if (!this.isInit)
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
                    let rtn = this.tileArr.indexOf(config.name);
                    if (config.activeChannel === "default" && rtn === -1) {
                        let tile = new Tile();
                        tile.title = config.chinese_name;
                        tile.iconName = "tasks";
                        this.strategyArea.addTile(tile);
                        this.tileArr.push(config.name);
                        // this.isInit = true;
                        config.stateChanged = () => {
                            tile.backgroundColor = config.state ? "#1d9661" : null;
                        };
                        this.strategyContainer.removeItem(config.name);
                        this.strategyContainer.addItem(config);
                        this.configBll.updateConfig(config);
                    } else if (config.activeChannel === "default" && rtn !== -1) {
                        this.strategyArea.getTileAt(rtn).title = config.chinese_name;
                    }
                }
                // console.log(this.configs);
            }
        });

        this.tgw.send(260, 216, { body: { tblock_type: 2 } });
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
                        let tile = new Tile();
                        tile.title = this.product[o].tblock_full_name;
                        tile.iconName = "folder-close";
                        tile.data = this.product[o].tblock_id;
                        productArea.addTile(tile);
                    }
                    // console.log(this.product, data.body.length); // 还有坑，先留着
                } else {
                    alert("Get product info Failed! " + data.msret.msg);
                }
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
                        strategies: this.config.strategies
                    }
                });
            }
        });
        this.svconfigs = this.configBll.getSVConfigs();
        console.log(this.svconfigs);
        let svLen = this.svconfigs.length;
        for (let i = 0; i < svLen; ++i) {
            let tile = new Tile();
            tile.title = this.svconfigs[i].name;
            this.analyticArr.push(this.svconfigs[i].name);
            tile.iconName = "object-align-bottom";
            this.analyticArea.addTile(tile);
        }
    }

    finish() {
        if (!this.config.name || this.config.name.length === 0 ||
            !this.config.strategyCoreName || !this.config.strategyInstances || this.config.strategyInstances.length === 0) {
            // console.log(this.config.name, this.config.name.length, this.config.strategyCoreName, this.config.strategyInstances, this.config.strategyInstances.length);
            alert("Wrong Config check items: <br>1. config name.<br>2. one strategy instance at least");
            return;
        }
        // create and modify con`fig.
        if (this.config.activeChannel === "default") {
            this.config.channels.gateway.forEach((gw, index) => {
                if (index === 0)
                    this.curTemplate.body.data.SSGW[index].ref = 0;
                this.curTemplate.body.data.SSGW[index].port = gw.port = parseInt(gw.port);
                this.curTemplate.body.data.SSGW[index].addr = gw.addr = gw.addr;
            });

            this.curTemplate.body.data.SSFeed.detailview.PriceServer.port = parseInt(this.config.channels.feedhandler.port);
            this.curTemplate.body.data.SSFeed.detailview.PriceServer.addr = this.config.channels.feedhandler.addr;
        }
        // console.info(this.curTemplate, this.config);

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
                    name: this.config.name, config: JSON.stringify(this.curTemplate.body.data), chinese_name: "",
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
        this.bcreate = false;
        this.bRead = false;
        this.bModify = false;
        this.closePanel();
    }

    onModifySpreadViewer() {
        this.bSpread = true;
        this.bNameRead = true;
    }

    closePanel(e?: any) {
        if (this.bshow) {
            this.config.curstep = 1;
            this.bshow = false;
        }
    }
    onCloseSVConfig() {
        console.log(this.svconfig, this.svconfigs);
        if (!this.svconfig.code1 || !this.svconfig.code2 || !this.svconfig.name) {
            alert("必要参数缺失！");
            return;
        }
        let rtn = this.analyticArr.indexOf(this.svconfig.name);
        if (rtn !== -1 && !this.bNameRead) {
            alert("已存在同名价差分析");
            return;
        }
        if (!this.bNameRead) {
            let tile = new Tile();
            tile.title = this.svconfig.name;
            tile.iconName = "object-align-bottom";
            this.analyticArea.addTile(tile);
        }
        console.log(this.svconfigs);
        this.configBll.addSVConfigItem(this.svconfig);
        this.bSpread = false;
        this.bNameRead = false;
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

    next() {
        if (this.config.curstep === 1) {
            // add instance
            // if (!this.config.strategyCoreName || this.config.strategyCoreName.length === 0) {
            //     alert("a strategycore needed.");
            //     return;
            // }
            if ((/^[A-Za-z0-9]+$/).test(this.config.name) || this.config.name.substr(0, 3) !== "ss-") {
                alert("please input correct format name");
                return;
            }
            if (!this.bModify) {
                // get template
                if (!this.bSelStrategy)
                    this.config.strategyCoreName = this.getStrategyNameByChinese(this.strategyCores[0]);
                if (!this.bSelProduct)
                    this.onSelectProduct(this.productsList[0]);
                delete this.curTemplate;
                this.curTemplate = null;
                this.curTemplate = JSON.parse(JSON.stringify(this.configBll.getTemplateByName(this.config.strategyCoreName)));

                if (this.curTemplate === null) {
                    alert("Error: getTemplateByName `not found ${this.config.name}`");
                    return;
                    // get gateway
                }
                // choose product and account
                this.config.channels.gateway = this.curTemplate.body.data.SSGW;
                for (let i = 0; i < this.config.channels.gateway.length; ++i) {
                    for (let obj in this.gatewayObj) {
                        if (parseInt(obj) === parseInt(this.config.channels.gateway[i].key)) {
                            this.config.channels.gateway[i].addr = this.gatewayObj[obj].addr;
                            this.config.channels.gateway[i].port = this.gatewayObj[obj].port;
                            break;
                        }
                    }
                }
                this.config.channels.feedhandler = this.curTemplate.body.data.SSFeed.detailview.PriceServer;
                this.config.channels.feedhandler.filename = "./lib/libFeedChronos.so";
                this.config.channels.feedhandler.addr = "127.0.0.1";
                this.config.channels.feedhandler.port = 9200;
                this.strategyName = "";
                this.bcreate = true;

                this.newInstance.name = this.config.name;
                this.newInstance.parameters = JSON.parse(JSON.stringify(this.curTemplate.body.data.Parameter));
                this.newInstance.comments = JSON.parse(JSON.stringify(this.curTemplate.body.data.Comment));
                this.newInstance.commands = JSON.parse(JSON.stringify(this.curTemplate.body.data.Command));
                this.newInstance.instruments = JSON.parse(JSON.stringify(this.curTemplate.body.data.Instrument));
                this.newInstance.sendChecks = JSON.parse(JSON.stringify(this.curTemplate.body.data.SendCheck));
                this.newInstance.algoes = [100, 101, 102, 103, 104];
                this.config.strategyInstances[0] = this.newInstance;
                // GET account info from product msg
                this.config.strategyInstances[0].accounts = this.accounts;

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
                            this.config.strategyInstances[0].instruments[i].value = 2007116;

                        }
                    }
                }
            }
            console.log(this.config);
            this.bSelProduct = false;
        }
        if (this.config.curstep === 2) {
            this.config.activeChannel = "default";
        }
        if (this.config.curstep === 3) {
            console.log(this.config);
        }
        ++this.config.curstep;
    }

    prev() {
        if (this.config.curstep === 2)
            this.bcreate = false;
        --this.config.curstep;
    }
    operateStrategyServer(config: WorkspaceConfig, action: number) {
        console.info(config, action);
        this.tgw.send(107, 2002, { routerid: 0, strategyserver: { name: config.name, action: action } });
    }

    isEmpty(data: any) {
        for (let o in data) {
            return false;
        }
        return true;
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

    onSelectStrategy(value: string) {
        console.log(this.config);
        this.bcreate = true;
        this.bSelStrategy = true;
        this.config.strategyCoreName = this.getStrategyNameByChinese(value);
        // delete this.curTemplate;
        // this.curTemplate = null;
        // this.curTemplate = JSON.parse(JSON.stringify(this.configBll.getTemplateByName(this.config.strategyCoreName)));

        // if (this.curTemplate === null) {
        //     this.showError("Error: getTemplateByName", `not found ${this.config.name}`, "alert");
        //     return;
        // }
        // // choose product and account
        // this.config.channels.gateway = this.curTemplate.body.data.SSGW;
        // this.config.channels.feedhandler = this.curTemplate.body.data.SSFeed.detailview.PriceServer;
        // this.strategyName = "";
        // this.newInstance.name = this.config.name;
        // this.newInstance.parameters = JSON.parse(JSON.stringify(this.curTemplate.body.data.Parameter));
        // this.newInstance.comments = JSON.parse(JSON.stringify(this.curTemplate.body.data.Comment));
        // this.newInstance.commands = JSON.parse(JSON.stringify(this.curTemplate.body.data.Command));
        // this.newInstance.instruments = JSON.parse(JSON.stringify(this.curTemplate.body.data.Instrument));
        // if (this.accounts === "")
        //     this.onSelectProduct(this.productsList[0]);
        // else
        //     this.config.strategyInstances[0] = this.newInstance;
        // this.config.strategyInstances[0].accounts = this.accounts;
        // let bEmpty = this.isEmpty(this.gatewayObj);
        // if (!bEmpty) {
        //     for (let i = 0; i < this.config.channels.gateway.length; ++i) {
        //         for (let obj in this.gatewayObj) {
        //             if (parseInt(obj) === parseInt(this.config.channels.gateway[i].key)) {
        //                 this.config.channels.gateway[i].addr = this.gatewayObj[obj].addr;
        //                 this.config.channels.gateway[i].port = this.gatewayObj[obj].port;
        //                 break;
        //             }
        //         }
        //     }
        // }
        // console.log(this.config, this.accounts, this.gatewayObj);
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
                this.config.productName = this.ProductMsg[i].tblock_full_name;
                this.config.ProductId = this.ProductMsg[i].tblock_id;
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
        // if (this.config.strategyInstances.length !== 0) {
        //     this.config.strategyInstances[0].accounts = this.accounts;
        // }
        // if (this.config.channels.gateway) {
        //     for (let i = 0; i < this.config.channels.gateway.length; ++i) {
        //         for (let obj in this.gatewayObj) {
        //             if (parseInt(obj) === parseInt(this.config.channels.gateway[i].key)) {
        //                 this.config.channels.gateway[i].addr = this.gatewayObj[obj].addr;
        //                 this.config.channels.gateway[i].port = this.gatewayObj[obj].port;
        //                 break;
        //             }
        //         }
        //     }
        // }
        console.log("account:", this.accounts, "gateway:", this.gatewayObj, "config:", this.config);
    }
    /**
 * @param type 0 is new config, 1 is modify config.
 */
    onPopup(type: number = 0) {
        // this.bPopPanel = true;
        // this.strategyCores = this.configBll.getTemplates();
        this.strategyCores = ["统计套利", "手工交易", "组合交易", "做市策略", "配对交易", "期现套利", "大宗交易"];
        if (type === 0) {
            this.config = new WorkspaceConfig();
            this.config.strategyCoreName = this.getStrategyNameByChinese(this.getStrategyNameByChinese(this.strategyCores[0]));
        } else {
            this.config.curstep = 1;
            this.curTemplate = null;
            this.curTemplate = this.configBll.getTemplateByName(this.config.strategyCoreName);
            console.log("this.config.strategyCoreName:", this.config.strategyCoreName, "template:", this.curTemplate);
        }
    }

    getStrategyNameByChinese(data: any) {
        for (let o in this.strategymap) {
            if (this.strategymap[o] === data)
                return o;
        }
    }
    hide() {
        this.bshow = false;
        this.bRead = false;
        this.bModify = false;
        this.config.curstep = 1;
    }
    toggleMonitor() {
        console.log(this.strategyContainer.items);
        if (this.bDetails) {
            this.monitorHeight = 30;
        } else {
            this.monitorHeight = 300;
        }
        this.bDetails = !this.bDetails;

        for (let i = 0; i < this.strategyContainer.items.length; ++i) {
            let row = this.resTable.newRow();
            let strategyid = this.strategyContainer.items[i].conn.strategies[0].id;
            row.cells[0].Text = strategyid;
            row.cells[1].Text = this.strategyContainer.items[i].conn.strategies[0].name;
            row.cells[2].Text = this.strategyContainer.items[i].conn.strategies[0].status;
            row.cells[3].Type = "button";
            row.cells[3].Text = "start";
            row.cells[3].OnClick = () => {
                this.strategyContainer.items[i].conn.changeStatus(strategyid, 2);
            };
            row.cells[3].Disable = (this.strategyContainer.items[i].conn.strategies[0].status === "RUN" || this.strategyContainer.items[i].conn.strategies[0].status === "STOP") ? true : false;
            row.cells[4].Type = "button";
            row.cells[4].Text = "pause";
            row.cells[4].OnClick = () => {
                this.strategyContainer.items[i].conn.changeStatus(strategyid, 3);
            };
            row.cells[4].Disable = (this.strategyContainer.items[i].conn.strategies[0].status === "PAUSE" || this.strategyContainer.items[i].conn.strategies[0].status === "STOP") ? true : false;
            row.cells[5].Type = "button";
            row.cells[5].Text = "stop";
            row.cells[5].OnClick = () => {
                this.strategyContainer.items[i].conn.changeStatus(strategyid, 4);
            };
            row.cells[5].Disable = (this.strategyContainer.items[i].conn.strategies[0].status === "STOP") ? true : false;
            row.cells[6].Type = "button";
            row.cells[6].Text = "watch";
            row.cells[6].OnClick = () => {
                this.strategyContainer.items[i].conn.changeStatus(strategyid, 5);
            };
            row.cells[6].Disable = (this.strategyContainer.items[i].conn.strategies[0].status === "WATCH") ? true : false;
            row.cells[7].Text = this.strategyContainer.items[i].conn.strategies[0].totalpnl;
            row.cells[8].Text = this.strategyContainer.items[i].conn.strategies[0].totalposition;
        }
    }
}