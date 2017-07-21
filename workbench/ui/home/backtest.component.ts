"use strict";

import { Component, OnInit } from "@angular/core";
import { TileArea, Tile } from "../../../base/controls/control";
import { ConfigurationBLL, WorkspaceConfig, StrategyServerContainer } from "../../bll/strategy.server";
import { Menu } from "../../../base/api/services/backend.service";
import { ChangeDetectorRef } from "@angular/core";
import { TradeService } from "../../bll/services";

declare var window: any;
let ip20strs = [];

@Component({
    moduleId: module.id,
    selector: "backtest",
    templateUrl: "backtest.component.html",
    providers: [
        Menu
    ]
})
export class BacktestComponent implements OnInit {
    tileArea: TileArea;
    contextMenu: Menu;
    private configBll = new ConfigurationBLL();
    private strategyContainer = new StrategyServerContainer();
    configs: Array<WorkspaceConfig>;
    config: WorkspaceConfig;
    curTemplate: any;
    bDetails: boolean;
    isModify: boolean = false;
    isInit: boolean = false;
    panelTitle: string;
    strategyCores: string[];

    constructor(private tgw: TradeService, private ref: ChangeDetectorRef) {


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
        this.contextMenu.addItem("Simulation", () => {
            this.isModify = true;
            // change to simulation
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
        this.tileArea = new TileArea();
        this.tileArea.title = "BackTest";

        for (let i = 0; i < 20; ++i) {
            let tile = new Tile();
            tile.title = "hello";
            tile.iconName = "repeat";
            tile.backgroundColor = "#aaa";
            this.tileArea.addTile(tile);
        }

        this.tileArea.onClick = (item: Tile) => {
            alert(item.title);
        };
        // (mouseup)="onClick($event, item);"
        this.tileArea.onCreate = () => {
            alert("onCreate");
        };

        this.tileArea.onSettingClick = () => {
            alert("onSetting");
        };

        if (!this.isInit)
            this.tgw.send(270, 194, { "head": { "realActor": "getDataTemplate" }, category: 0 }); // process templates
        this.tgw.addSlot({  // template
            appid: 270,
            packid: 194,
            callback: msg => {
                console.info(msg.content.body);
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
}