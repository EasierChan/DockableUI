"use strict";

import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { TileArea, Tile } from "../../../base/controls/control";
import { ConfigurationBLL, WorkspaceConfig, DataKey, AppType, Channel } from "../../bll/strategy.server";
import { Menu, AppStoreService } from "../../../base/api/services/backend.service";

@Component({
    moduleId: module.id,
    selector: "analysis",
    templateUrl: "analysis.html",
    styleUrls: ["analysis.css"]
})
export class AnalysisComponent implements OnInit {
    areas: TileArea[];
    analyticMenu: Menu;
    analyticArea: TileArea;
    analyticConfigs: string[];
    selectedSpreadItem: any;

    alphaMenu: Menu;
    alphaArea: TileArea;
    alphaConfigs: string[];
    selectedAlphaItem: any;

    bookMenu: Menu;
    bookArea: TileArea;
    bookConfigs: string[];
    selectedBookItem: any;

    setting: any;
    quoteEndpoint: any;

    constructor(private appsrv: AppStoreService, private configBll: ConfigurationBLL, private ref: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.setting = this.appsrv.getSetting();
        this.areas = [];
        this.initializeAnalytics();
        this.initializeAlpha();
        this.initializeBook();

        this.quoteEndpoint = this.setting.endpoints[0].quote_addr.split(":");
        this.appsrv.onUpdateApp(this.updateApp, this);
    }

    initializeAnalytics() {
        // analyticMenu
        this.analyticMenu = new Menu();
        this.analyticMenu.addItem("删除", () => {
            if (!confirm("确定删除？"))
                return;

            this.configBll.removeSVConfigItem(this.selectedSpreadItem.title);
            this.analyticArea.removeTile(this.selectedSpreadItem.title);
        });
        // endMenu

        this.analyticArea = new TileArea();
        this.analyticArea.title = "分析";
        this.analyticConfigs = this.configBll.getSVConfigs();

        this.analyticConfigs.forEach(item => {
            let tile = new Tile();
            tile.title = item;
            tile.iconName = "object-align-bottom";
            this.analyticArea.addTile(tile);
        });

        this.analyticArea.onCreate = () => {
            this.appsrv.startApp("Untitled", AppType.kSpreadViewer, {
                port: parseInt(this.quoteEndpoint[1]),
                host: this.quoteEndpoint[0],
                lang: this.setting.language
            });
        };

        this.analyticArea.onClick = (event: MouseEvent, item: Tile) => {
            this.selectedSpreadItem = item;

            if (event.button === 0) {
                if (!this.appsrv.startApp(item.title, AppType.kSpreadViewer, {
                    port: parseInt(this.quoteEndpoint[1]),
                    host: this.quoteEndpoint[0],
                    lang: this.setting.language
                })) {
                    alert("Error `Start ${name} app error!`");
                }

                return;
            }

            if (event.button === 2)
                this.analyticMenu.popup();
        };

        this.areas.push(this.analyticArea);
    }

    initializeAlpha() {
        // analyticMenu
        this.alphaMenu = new Menu();
        this.alphaMenu.addItem("删除", () => {
            if (!confirm("确定删除？"))
                return;

            this.configBll.removeABConfigItem(this.selectedAlphaItem.title);
            this.alphaArea.removeTile(this.selectedAlphaItem.title);
        });
        // endMenu

        this.alphaArea = new TileArea();
        this.alphaArea.title = "Alpha&基差";
        this.alphaConfigs = this.configBll.getABConfigs();

        this.alphaConfigs.forEach(item => {
            let tile = new Tile();
            tile.title = item;
            tile.iconName = "object-align-bottom";
            this.alphaArea.addTile(tile);
        });

        this.alphaArea.onCreate = () => {
            // alert("当前未开放权限！");
            // return;
            this.appsrv.startApp("Untitled", AppType.kAlphaViewer, {
                port: parseInt(this.quoteEndpoint[1]),
                host: this.quoteEndpoint[0],
                lang: this.setting.language
            });
        };

        this.alphaArea.onClick = (event: MouseEvent, item: Tile) => {
            this.selectedAlphaItem = item;

            if (event.button === 0) {
                if (!this.appsrv.startApp(item.title, AppType.kAlphaViewer, {
                    port: parseInt(this.quoteEndpoint[1]),
                    host: this.quoteEndpoint[0],
                    lang: this.setting.language
                })) {
                    alert("Error `Start ${name} app error!`");
                }

                return;
            }

            if (event.button === 2)
                this.alphaMenu.popup();
        };

        this.areas.push(this.alphaArea);
    }

    initializeBook() {
        // bookMenu
        // this.bookMenu = new Menu();
        // this.bookMenu.addItem("删除", () => {
        //     if (!confirm("确定删除？"))
        //         return;

        //     this.configBll.removeBVConfigItem(this.selectedBookItem.title);
        //     this.bookArea.removeTile(this.selectedBookItem.title);
        // });
        // endMenu

        this.bookArea = new TileArea();
        this.bookArea.title = "集中行情";
        // this.bookConfigs = this.configBll.getBVConfigs();

        // this.bookConfigs.forEach(item => {
            let tile = new Tile();
            tile.title = "BookViewer";
            tile.iconName = "object-align-bottom";
            this.bookArea.addTile(tile);
        // });

        // this.bookArea.onCreate = () => {
        //     // alert("当前未开放权限！");
        //     // return;
        //     this.appsrv.startApp("Untitled", AppType.kBookViewer, {
        //         port: parseInt(this.quoteEndpoint[1]),
        //         host: this.quoteEndpoint[0],
        //         lang: this.setting.language
        //     });
        // };

        this.bookArea.onClick = (event: MouseEvent, item: Tile) => {
            this.selectedBookItem = item;

            if (event.button === 0) {
                if (!this.appsrv.startApp(item.title, AppType.kBookViewer, {
                    port: parseInt(this.quoteEndpoint[1]),
                    host: this.quoteEndpoint[0],
                    lang: this.setting.language
                })) {
                    alert("Error `Start ${name} app error!`");
                }

                return;
            }

            if (event.button === 2)
                this.bookMenu.popup();
        };

        this.areas.push(this.bookArea);
    }

    // update app info
    updateApp(params) {
        switch (params.type) {
            case "rename":
                let idx = this.analyticConfigs.indexOf(params.oldName);

                if (idx < 0) {
                    this.analyticConfigs.push(params.newName);
                    let tile = new Tile();
                    tile.title = params.newName;
                    tile.iconName = "object-align-bottom";
                    this.analyticArea.addTile(tile);
                } else {
                    this.analyticConfigs[idx] = params.newName;
                    this.analyticArea.getTileAt(idx).title = params.newName;
                }

                this.ref.detectChanges();
                break;
            case "alphaviewer":
                idx = this.alphaConfigs.indexOf(params.oldName);

                if (idx < 0) {
                    this.alphaConfigs.push(params.newName);
                    let tile = new Tile();
                    tile.title = params.newName;
                    tile.iconName = "object-align-bottom";
                    this.alphaArea.addTile(tile);
                } else {
                    this.alphaConfigs[idx] = params.newName;
                    this.alphaArea.getTileAt(idx).title = params.newName;
                }

                this.ref.detectChanges();
                break;
            case "bookviewer":
                idx = this.bookConfigs.indexOf(params.oldName);

                if (idx < 0) {
                    this.bookConfigs.push(params.newName);
                    let tile = new Tile();
                    tile.title = params.newName;
                    tile.iconName = "object-align-bottom";
                    this.bookArea.addTile(tile);
                } else {
                    this.bookConfigs[idx] = params.newName;
                    this.bookArea.getTileAt(idx).title = params.newName;
                }

                this.ref.detectChanges();
                break;
        }
    }
}