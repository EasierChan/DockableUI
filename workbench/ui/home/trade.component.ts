"use strict";

import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { TileArea, Tile, DataTable, DataTableColumn } from "../../../base/controls/control";
import { IP20Service } from "../../../base/api/services/ip20.service";
import { ConfigurationBLL, WorkspaceConfig, StrategyServerContainer } from "../../bll/strategy.server";
import { Menu } from "../../../base/api/services/backend.service";
import { ChangeDetectorRef } from "@angular/core";

declare var window: any;
let ip20strs = [];
@Component({
    moduleId: module.id,
    selector: "trade",
    templateUrl: "trade.component.html",
    styleUrls: ["trade.component.css"],
    providers: [
        Menu
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
    configs: Array<WorkspaceConfig>;
    config: WorkspaceConfig;
    curTemplate: any;
    isModify: boolean = false;
    isInit: boolean = false;
    panelTitle: string;
    strategyCores: string[];

    constructor(private tgw: IP20Service, private ref: ChangeDetectorRef) {
        this.contextMenu = new Menu();
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
            this.configs.forEach((config, index) => {
                if (config.name === this.config.name) {
                    this.configs.splice(index, 1);
                    this.configBll.updateConfig();
                    this.strategyContainer.removeItem(this.config.name);
                    this.ref.detectChanges();
                }
            });
        });

    }

    ngOnInit() {
        let self = this;
        this.bDetails = false;
        let productArea = new TileArea();
        productArea.title = "Products";

        for (let i = 0; i < 10; ++i) {
            let tile = new Tile();
            tile.title = "hello";
            tile.iconName = "adjust";
            productArea.addTile(tile);
        }

        let strategyArea = new TileArea();
        strategyArea.title = "Strategies";


        let analyticArea = new TileArea();
        analyticArea.title = "Analytic";

        for (let i = 0; i < 10; ++i) {
            let tile = new Tile();
            tile.title = "hello";
            tile.iconName = "repeat";
            analyticArea.addTile(tile);
        }

        this.areas = [productArea, strategyArea, analyticArea];
        this.resTable = new DataTable("table2");
        this.resTable.addColumn2(new DataTableColumn("UKey", false, true));
        this.resTable.addColumn2(new DataTableColumn("Symbol", false, true));
        this.resTable.addColumn2(new DataTableColumn("ChineseName", false, true));
        this.resTable.addColumn2(new DataTableColumn("ReleaseData", false, true));
        this.resTable.addColumn2(new DataTableColumn("OutDate", false, true));
        if (!this.isInit)
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
                        console.log("***", templatelist);
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
                    console.log("+++", templatelist);
                    templatelist.body.forEach(template => {
                        this.configBll.updateTemplate(template.templatename, { id: template.id, body: JSON.parse(template.templatetext) });
                    });

                    self.configs = self.configBll.getAllConfigs();
                    self.configs.forEach(config => {
                        self.config = config;
                        self.config.state = 0;
                        self.curTemplate = JSON.parse(JSON.stringify(self.configBll.getTemplateByName(self.config.strategyCoreName)));
                        console.log("...", self.curTemplate);
                        self.finish();
                    });
                }
                // console.log(self.config, self.configs);
            }
        });
        this.tgw.addSlot({
            appid: 107,
            packid: 2001,
            callback: msg => {
                console.info(msg.content.body);
                let config = this.configs.find(item => { return item.name === msg.content.body.name; });
                if (config) {
                    config.name = msg.content.body.name;
                    config.host = msg.content.body.address;
                    this.configBll.updateConfig(config);
                    this.strategyContainer.removeItem(config.name);
                    this.strategyContainer.addItem(config);
                    // this.tgw.send(107, 2002, { routerid: 0, strategyserver: { name: config.name, action: 1 } });
                    // if()
                    console.log(config);
                    if (config.activeChannel === "default") {
                        let tile = new Tile();
                        tile.title = config.name;
                        tile.backgroundColor = "#ff3a66";  // 1c57ff
                        tile.iconName = "adjust";
                        strategyArea.addTile(tile);
                        this.isInit = true;
                    }
                }
            }
        });

    }

    onClick(e: MouseEvent, item: WorkspaceConfig) {
        console.log(".......+++++++++++++++");
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
            this.showError("Wrong Config", "check items: <br>1. config name.<br>2. one strategy instance at least.", "alert");
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
            obj.cfg = obj.field = obj.name = obj.log = item.name;
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
            this.curTemplate.body.data["PairTrades"][item.name] = {
                Command: item.commands,
                Comment: item.comments,
                Instrument: item.instruments,
                Parameter: item.parameters
            };

            if (item.sendChecks) {
                this.curTemplate.body.data["PairTrades"][item.name]["SendCheck"] = item.sendChecks;
            }
        });

        if (hasError) {
            this.showError("Wrong Config", "check items: <br>1. config name.<br>2. one strategy instance at least.<br>3. account must not be empty.", "alert");
            return;
        }
        this.configBll.updateConfig(this.config);
        this.tgw.send(107, 2000, {
            routerid: 0, templateid: this.curTemplate.id, body: {
                name: this.config.name, config: JSON.stringify(this.curTemplate.body.data), chinese_name: this.config.chinese_name,
                strategies: this.config.strategies
            }
        });
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
        // window.hideMetroDialog("#config");
    }

    operateStrategyServer(config: WorkspaceConfig, action: number) {
        console.info(config, action);
        this.tgw.send(107, 2002, { routerid: 0, strategyserver: { name: config.name, action: action } });
    }

    /**
 * @param type 0 is new config, 1 is modify config.
 */
    onPopup(type: number = 0) {
        // this.bPopPanel = true;
        this.strategyCores = this.configBll.getTemplates();
        if (type === 0) {
            this.config = new WorkspaceConfig();
            this.panelTitle = "New Config";
            this.isModify = false;
        } else {
            this.config.curstep = 1;
            this.panelTitle = this.config.name;
            this.curTemplate = null;
            this.curTemplate = JSON.parse(JSON.stringify(this.configBll.getTemplateByName(this.config.strategyCoreName)));
        }

        if (!this.config.loopbackConfig.option) {
            let idate = new Date().format("yyyy-mm-dd");
            this.config.loopbackConfig.option = {
                timebegin: idate,
                timeend: idate,
                speed: "1",
                simlevel: "1",
                period: "1",
                unit: "1"
            };
        }
        // this.ref.detectChanges();
        window.showMetroDialog("#config");
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