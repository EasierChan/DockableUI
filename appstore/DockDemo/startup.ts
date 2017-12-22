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
    _config: DockDemoConfig;
    _appdir: string;
    _cfgFile: string;
    _menuTemplate: any;
    _option;

    orderstatusItem: any;
    doneorderItem: any;
    logItem: any;
    profixItem: any;
    positionItem: any;
    accountItem: any;
    statarbItem: any;
    portfolioItem: any;
    strategyItem: any;
    sep1: any;
    bookViewItem: any;
    // sep2: any;
    // spreadViewItem: any;
    subWindMenu: any;
    itemsMap: any = {};
    static instanceMap: Object = {};

    constructor() {
        this._windowMgr = new UWindwManager();
        this._config = { name: "", state: { x: 0, y: 0, width: 1200, height: 800 } };
        this._menuTemplate = new Menu();
        this._menuTemplate.append(new MenuItem({
            label: "File",
            submenu: [
                { label: "New BookView", click: this.itemClick },
                // { label: "New SpreadView", click: this.itemClick },
                { type: "separator" },
                { role: "close" }
            ]
        }));

        this.orderstatusItem = new MenuItem({ label: "OrderStatus", type: "checkbox", click: this.itemClick });
        this.itemsMap["OrderStatus"] = this.orderstatusItem;
        this.doneorderItem = new MenuItem({ label: "DoneOrders", type: "checkbox", click: this.itemClick });
        this.itemsMap["DoneOrders"] = this.doneorderItem;
        this.logItem = new MenuItem({ label: "Log", type: "checkbox", click: this.itemClick });
        this.itemsMap["Log"] = this.logItem;
        this.profixItem = new MenuItem({ label: "Profit", type: "checkbox", click: this.itemClick });
        this.itemsMap["Profit"] = this.profixItem;
        this.positionItem = new MenuItem({ label: "Position", type: "checkbox", click: this.itemClick });
        this.itemsMap["Position"] = this.positionItem;
        this.accountItem = new MenuItem({ label: "Account", type: "checkbox", click: this.itemClick });
        this.itemsMap["Account"] = this.accountItem;
        this.statarbItem = new MenuItem({ label: "StatArb", type: "checkbox", click: this.itemClick });
        this.itemsMap["StatArb"] = this.statarbItem;
        this.portfolioItem = new MenuItem({ label: "Portfolio", type: "checkbox", click: this.itemClick });
        this.itemsMap["Portfolio"] = this.portfolioItem;
        this.strategyItem = new MenuItem({ label: "Strategy", type: "checkbox", click: this.itemClick });
        this.itemsMap["Strategy"] = this.strategyItem;
        this.sep1 = new MenuItem({ type: "separator" });
        this.bookViewItem = new MenuItem({ label: "BookView", type: "checkbox", click: this.itemClick });
        this.itemsMap["BookView"] = this.bookViewItem;
        // this.sep2 = new MenuItem({ type: "separator" });
        // this.spreadViewItem = new MenuItem({ label: "SpreadView", type: "checkbox", click: this.itemClick });
        // this.itemsMap["SpreadView"] = this.spreadViewItem;
        this.subWindMenu = new Menu();
        this.subWindMenu.append(this.orderstatusItem);
        this.subWindMenu.append(this.doneorderItem);
        this.subWindMenu.append(this.logItem);
        this.subWindMenu.append(this.profixItem);
        this.subWindMenu.append(this.positionItem);
        this.subWindMenu.append(this.accountItem);
        this.subWindMenu.append(this.statarbItem);
        this.subWindMenu.append(this.portfolioItem);
        this.subWindMenu.append(this.strategyItem);
        this.subWindMenu.append(this.sep1);
        this.subWindMenu.append(this.bookViewItem);
        // this.subWindMenu.append(this.sep2);
        // this.subWindMenu.append(this.spreadViewItem);
        this._menuTemplate.append(new MenuItem({ label: "Window", submenu: this.subWindMenu }));
        this._menuTemplate.append(new MenuItem({
            label: "Help",
            submenu: [
                { label: "Toggle Developer Tools", click: (item, owner) => { owner.webContents.openDevTools(); } },
                { label: "Reload", click: (item, owner) => { owner.reload(); } },
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

            this._option = option ? option : {};
            this._option.layout = this.loadLayout();
            this._option.config = this.loadModulesConfig();
            this._mainWindow.loadURL(`${__dirname}/index.html`);
            this._mainWindow.win.setTitle(this._option.title);
            this._mainWindow.setMenu(this._menuTemplate);
            StartUp.instanceMap[this._mainWindow.win.webContents.id] = this;
            // this._windowMgr.addContentWindow(this._mainWindow);
        }
        this._mainWindow.show();
    }
    /**
     * @desc quit
     * @param none
     */
    quit(): void {
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
        if (!fs.existsSync(path.join(Path.baseDir, "StrategyTrader")))
            fs.mkdirSync(path.join(Path.baseDir, "StrategyTrader"));

        this._appdir = path.join(Path.baseDir, "StrategyTrader", this._name);
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

    itemClick(menuItem, owner) {
        owner.webContents.send("app://menuitem-click", menuItem);
    }

    removeLayout(owner) {
        this._option.layout = this.defaultLayout;
        owner.reload();
    }

    loadLayout() {
        let flayout = path.join(this._appdir, "layout.json");
        if (!fs.existsSync(flayout)) {
            return this.defaultLayout;
        }

        return JSON.parse(fs.readFileSync(flayout));
    }

    get defaultLayout() {
        let [width, height] = [this._mainWindow.getBounds().width - 10, this._mainWindow.getBounds().height - 26];

        let res = {
            type: "v",
            width: width,
            children: [{
                type: "h",
                height: Math.floor(height * 0.2),
                modules: [
                    "Strategy"
                ]
            }, {
                type: "h",
                height: Math.floor(height * 0.3),
                modules: [
                    "Position",
                    "Account",
                    "OrderStatus",
                    "DoneOrders",
                    "Profit"
                ]
            }, {
                type: "h",
                height: height - Math.floor(height * 0.2) - Math.floor(height * 0.3) - 10,
                children: [{
                    type: "v",
                    width: Math.floor(width * 0.3),
                    modules: [
                        "BookView"
                    ]
                }, {
                    type: "v",
                    width: width - Math.floor(width * 0.3) - 5,
                    modules: [
                        "Log"
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
            default:
                break;
        }

        return res;
    }

    loadModulesConfig() {
        let config = path.join(this._appdir, "config.json");
        if (!fs.existsSync(config)) {
            return {};
        }

        return JSON.parse(fs.readFileSync(config));
    }

    static instance(): StartUp {
        return new StartUp();
    }
}

interface DockDemoConfig {
    name: string;
    state: Bound;
    layout?: Object;
}

ipcMain.on(`app://menuitem-CRUD`, (e, param) => {
    if (!StartUp.instanceMap.hasOwnProperty(e.sender.id))
        return;

    let inst = StartUp.instanceMap[e.sender.id];

    switch (param.action) {
        case 0: // add bookview item.
            inst.subWindMenu.insert(11, new MenuItem({ label: param.name, type: "checkbox", checked: true, click: this.itemClick }));
            break;
        case 1: // add spreadview item.
            inst.subWindMenu.append(new MenuItem({ label: param.name, type: "checkbox", checked: true, click: this.itemClick }));
            break;
        case 2: // change item's state.
            if (inst.itemsMap.hasOwnProperty(param.name)) {
                inst.itemsMap[param.name].checked = param.state;
            }
            break;
        default:
            console.info(`undefine action: ${param.action}`);
            break;
    }
});

IPCManager.register(`app://trade/init`, (e, param) => {
    if (StartUp.instanceMap.hasOwnProperty(e.sender.id)) {
        e.returnValue = StartUp.instanceMap[e.sender.id]._option;
        return;
    }

    console.error(`unknown sender id ${e.sender.id}`);
    e.returnValue = {};
});