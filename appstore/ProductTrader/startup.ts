/**
 * App startup entry
 */
"use strict";

import { IApplication, MenuWindow, ContentWindow, UWindwManager, Bound, Path, IPCManager } from "../../base/api/backend";
const path = require("path");
const fs = require("fs");
declare let window: any;
import { ipcMain, MenuItem, Menu } from "electron";

export class StartUp implements IApplication {
    _windowMgr: UWindwManager;
    _mainWindow: ContentWindow;
    _bound: Bound;
    _name: string;
    _config: ProductTraderConfig;
    _appdir: string;
    _cfgFile: string;
    static instanceMap: any = {};
    _option: any;
    _menuTemplate: any;
    subWindMenu: any;

    constructor() {
        this._windowMgr = new UWindwManager();
        this._config = { name: "", state: { x: 0, y: 0, width: 1200, height: 800 } };
        this._menuTemplate = new Menu();
        this._menuTemplate.append(new MenuItem({
            label: "File",
            submenu: [
                { role: "close" }
            ]
        }));
        this._menuTemplate.append(new MenuItem({ label: "Window"}));
        this._menuTemplate.append(new MenuItem({
            label: "Help",
            submenu: [
                { label: "Toggle Developer Tools", click: (item, owner) => { owner.webContents.openDevTools(); } },
                { label: "Reload", click: (item, owner) =>  this.productReload(owner) },
                { label: "Reset Layout", click: (item, owner) => this.removeLayout(owner) },
                { type: "separator" },
                { role: "about" }
            ]
        }));
    }
    /**
     * bootstrap
     */
    bootstrap(name = "Untitled", option?: any): any {
        let self = this;
        if (!this._mainWindow || !this._mainWindow.win) {
            this._name = name;
            this._config.name = name;
            this.loadConfig();
            this._mainWindow = null;
            this._mainWindow = new ContentWindow({ state: this._config.state });
            this._mainWindow.onclosing = bound => {
                self._config.state = bound;
                self.saveConfig();
                delete StartUp.instanceMap[this._mainWindow.win.webContents.id];
            };

            this._option = option;
            this._option.layout = this.loadLayout();
            this._mainWindow.loadURL(path.join(__dirname, "index.html"));
            this._mainWindow.win.setTitle(name);
            this._mainWindow.setMenu(this._menuTemplate);
            this._mainWindow.setMenuBarVisibility(true);
            StartUp.instanceMap[this._mainWindow.win.webContents.id] = this;
            this._windowMgr.addContentWindow(this._mainWindow);
        }
        this._mainWindow.show();
    }
    /**
     * @desc quit
     * @param none
     */
    quit(): void {
        if (this._mainWindow)
            this._mainWindow.close();
        // this._windowMgr.closeAll();
    }
    /**
     * restart
     */
    restart(): void {
        this.quit();
        this.bootstrap(this._name);
    }

    hide() {
        if (this._mainWindow)
            this._mainWindow.win.hide();
    }

    loadConfig() {
        if (!fs.existsSync(path.join(Path.baseDir, "ProductTrader")))
            fs.mkdirSync(path.join(Path.baseDir, "ProductTrader"));

        this._appdir = path.join(Path.baseDir, "ProductTrader", this._name);
        if (!fs.existsSync(this._appdir))
            fs.mkdirSync(this._appdir);

        this._cfgFile = path.join(this._appdir, "default.json");
        if (!fs.existsSync(this._cfgFile)) {
            fs.writeFileSync(this._cfgFile, JSON.stringify(this._config), { encoding: "utf8" });
        }

        this._config = JSON.parse(fs.readFileSync(this._cfgFile, "utf8"));
    }

    saveConfig() {
        fs.writeFileSync(this._cfgFile, JSON.stringify(this._config, null, 2));
    }


    static instance(): StartUp {
        return new StartUp();
    }
    removeLayout(owner) {
        this._option.layout = this.defaultLayout;
        owner.reload();
    }
    productReload(owner) {
        // this._option.layout = this.defaultLayout;
        owner.reload();
    }
    loadLayout() {
        let flayout = path.join(this._appdir, "layout.json");
        if (!fs.existsSync(flayout)) {
            return this.defaultLayout;
        }

        return JSON.parse(fs.readFileSync(flayout, "utf8"));
    }

    get defaultLayout() {
        let [width, height] = [this._mainWindow.getBounds().width - 10, this._mainWindow.getBounds().height];

        let res = {
            type: "v",
            width: width,
            children: [{
                type: "h",
                height: Math.round(height * 0.2),
                modules: [
                    "fundAccountId"
                ]
            }, {
                type: "h",
                height: Math.round(height * 0.3),
                modules: [
                    "productPositionId",
                    "productNetId",
                    "orderStatId",
                    "finishOrderId",
                    "profitAndLossId",
                    "tradeAccountId"
                ]
            }, {
                type: "h",
                height: height - Math.round(height * 0.2) - Math.round(height * 0.3) - 10,
                children: [{
                    type: "v",
                    width: Math.round(width * 0.3),
                    modules: [
                        "MarketId"
                    ]
                }, {
                    type: "v",
                    width: width - Math.round(width * 0.3) - 5,
                    modules: [
                        "LogId"
                    ]
                }]
            }]
        };

        switch (this._option.sstype) {
            case "portfoliotrader":
                // portfolio
                (res as any).children[2].children[1].modules.push("Portfolio");
                break;
            case "pairtrader":
                // pairtrade
                (res as any).children[2].children[1].modules.push("StatArb");
                break;
            case "baskettrader":
                (res as any).children[2].children[1].modules.push("TWAPPortfolio");
            default:
                break;
        }

        return res;
    }

}

interface ProductTraderConfig {
    name: string;
    state: Bound;
    layout?: Object;
}

IPCManager.register(`app://product-trader/init`, (e, param) => {
    if (StartUp.instanceMap.hasOwnProperty(e.sender.id)) {
        e.returnValue = StartUp.instanceMap[e.sender.id]._option;
        return;
    }

    console.error(`unknown sender id ${e.sender.id}`);
    e.returnValue = {};
});