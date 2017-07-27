"use strict";

import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { TileArea, Tile, DataTable, DataTableColumn } from "../../../base/controls/control";
import { ConfigurationBLL, WorkspaceConfig, StrategyServerContainer, Product, StrategyInstance } from "../../bll/strategy.server";
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
    private configBll = new ConfigurationBLL();
    private strategyContainer = new StrategyServerContainer();
    private product = new Product();
    configs: Array<WorkspaceConfig>;
    config: WorkspaceConfig;
    curTemplate: any;
    isModify: boolean = false;
    isInit: boolean = false;
    panelTitle: string;
    strategyName: string;
    strategyCores: string[];
    productsList: string[];
    ProductMsg: string[];
    bshow: boolean = false;
    bcreate: boolean = false;
    accounts: string;
    gatewayObj: Object;
    setting: any;
    clickItem: any;
    strategyArea: any;

    constructor(private appService: AppStoreService, private tgw: TradeService, private ref: ChangeDetectorRef) {
        this.contextMenu = new Menu();
        this.config = new WorkspaceConfig();
        this.config.curstep = 1;
        this.productsList = [];
        this.setting = this.appService.getSetting();
        this.contextMenu.addItem("Start", () => {
            this.operateStrategyServer(this.config, 1);
        });
        this.contextMenu.addItem("Stop", () => {
            this.operateStrategyServer(this.config, 0);
        });
        this.contextMenu.addItem("Modify", () => {
            this.isModify = true;
            this.onPopup(1);
        });
        this.contextMenu.addItem("Remove", () => {
            let len = this.configs.length;
            for (let i = 0; i < len; ++i) {
                if (this.configs[i].name === this.clickItem.title) {
                    this.configs.splice(i, 1);
                    this.configBll.updateConfig();
                    this.strategyArea.removeTile(this.clickItem.title);
                    this.strategyContainer.removeItem(this.config.name);
                }
            }
        });
    }

    ngOnInit() {
        let self = this;
        this.bDetails = false;
        let productArea = new TileArea();
        productArea.title = "Products";

        productArea.onCreate = () => {
            alert("****");
        };
        this.strategyArea = new TileArea();
        this.strategyArea.title = "Strategies";
        this.strategyArea.onCreate = () => {
            this.bshow = true;
            this.config.curstep = 1;
            this.onPopup(0);
        };
        this.strategyArea.onClick = (event: MouseEvent, item: Tile) => {
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

        let analyticArea = new TileArea();
        analyticArea.title = "Analytic";
        analyticArea.onCreate = () => {
            alert("----");
        };

        for (let i = 0; i < 1; ++i) {
            let tile = new Tile();
            tile.title = "hello";
            tile.iconName = "repeat";
            analyticArea.addTile(tile);
        }

        this.areas = [productArea, this.strategyArea, analyticArea];
        this.resTable = new DataTable("table2");
        this.resTable.addColumn2(new DataTableColumn("UKey", false, true));
        this.resTable.addColumn2(new DataTableColumn("Symbol", false, true));
        this.resTable.addColumn2(new DataTableColumn("ChineseName", false, true));
        this.resTable.addColumn2(new DataTableColumn("ReleaseData", false, true));
        this.resTable.addColumn2(new DataTableColumn("OutDate", false, true));
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
                    this.configBll.updateConfig(config);
                    if (config.activeChannel === "default") {
                        let tile = new Tile();
                        tile.title = config.name;
                        tile.iconName = "adjust";
                        this.strategyArea.addTile(tile);
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
                        tile.backgroundColor = "#ff3a66";  // 1c57ff
                        tile.iconName = "adjust";
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
                        name: this.config.name, config: JSON.stringify(this.curTemplate.body.data), chinese_name: this.config.chinese_name,
                        strategies: this.config.strategies
                    }
                });
            }
        });
    }

    onClick(e: MouseEvent, item: WorkspaceConfig) {
        this.config = item;
        if (e.button === 2) { // right click
            // TODO Show Menu
            this.contextMenu.popup();
        } else {
            // set up program;
            // this.onStartApp();
            // this.bDetails = false;
            // window.hideMetroCharm("#detailCharm");
        }
    }

    finish() {
        // validation
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
        this.bcreate = false;
        this.closePanel();
    }

    showError(caption: string, content: string, type: string): void {
        window.$.Notify({
            caption: caption,
            content: content,
            type: type
        });
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

    next() {
        if (this.config.curstep === 1) {
            // add instance
            if (!this.config.strategyCoreName || this.config.strategyCoreName.length === 0) {
                alert("a strategycore needed.");
                return;
            }
            if ((/^[A-Za-z0-9]+$/).test(this.config.name) || this.config.name.substr(0, 3) !== "ss-") {
                alert("please input correct format name");
                return;
            }
            if (this.config.strategyInstances.length === 1) {
                this.config.strategyInstances.splice(0, this.config.strategyInstances.length);
            }
            if (!this.bcreate) {
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
                this.onSelectProduct(this.productsList[0]);
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
                this.strategyName = "";
                this.bcreate = true;
            }
            let newInstance: StrategyInstance = new StrategyInstance();
            newInstance.name = this.config.name;
            newInstance.parameters = JSON.parse(JSON.stringify(this.curTemplate.body.data.Parameter));
            newInstance.comments = JSON.parse(JSON.stringify(this.curTemplate.body.data.Comment));
            newInstance.commands = JSON.parse(JSON.stringify(this.curTemplate.body.data.Command));
            newInstance.instruments = JSON.parse(JSON.stringify(this.curTemplate.body.data.Instrument));
            this.config.strategyInstances.push(newInstance);
            // GET account info from product msg
            this.config.strategyInstances[0].accounts = this.accounts;
        }
        if (this.config.curstep === 2) {
            this.config.activeChannel = "default";
        }
        ++this.config.curstep;
    }

    prev() {
        --this.config.curstep;
    }
    operateStrategyServer(config: WorkspaceConfig, action: number) {
        console.info(config, action);
        this.tgw.send(107, 2002, { routerid: 0, strategyserver: { name: config.name, action: action } });
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

    onSelectStrategy(value: string) {
        this.bcreate = true;
        this.config.strategyCoreName = value;
        delete this.curTemplate;
        this.curTemplate = null;
        this.curTemplate = JSON.parse(JSON.stringify(this.configBll.getTemplateByName(this.config.strategyCoreName)));

        if (this.curTemplate === null) {
            this.showError("Error: getTemplateByName", `not found ${this.config.name}`, "alert");
            return;
        }
        // choose product and account
        this.config.channels.gateway = this.curTemplate.body.data.SSGW;
        this.config.channels.feedhandler = this.curTemplate.body.data.SSFeed.detailview.PriceServer;
        this.strategyName = "";
    }
    onSelectProduct(value: string) {
        console.log(value);
        // choose product and parse account and channal
        // console.log(this.product, this.ProductMsg);
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
    /**
 * @param type 0 is new config, 1 is modify config.
 */
    onPopup(type: number = 0) {
        // this.bPopPanel = true;
        this.strategyCores = this.configBll.getTemplates();
        if (type === 0) {
            this.config = new WorkspaceConfig();
            this.isModify = false;
            this.config.strategyCoreName = this.strategyCores[0];
            console.log(this.strategyCores);
        } else {
            // this.curTemplate = null;
            // this.curTemplate = JSON.parse(JSON.stringify(this.configBll.getTemplateByName(this.config.strategyCoreName)));
        }
    }

    hide() {
        this.bshow = false;
        this.config.curstep = 1;
    }
    toggleMonitor() {
        if (this.bDetails) {
            this.monitorHeight = 30;
        } else {
            this.monitorHeight = 300;
        }

        this.bDetails = !this.bDetails;
    }
}