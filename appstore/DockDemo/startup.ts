/**
 * App startup entry
 */
"use strict";

import { IApplication, MenuWindow, ContentWindow, UWindwManager, Bound, Path } from "../../base/api/backend";
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
    sep1: any;
    sep2: any;
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
                { label: "New SpreadView", click: this.itemClick },
                { type: "separator" },
                { role: "close" }
            ]
        }));

        this.orderstatusItem = new MenuItem({ label: "OrderStatus", type: "checkbox", click: this.itemClick });
        this.doneorderItem = new MenuItem({ label: "DoneOrders", type: "checkbox", click: this.itemClick });
        this.logItem = new MenuItem({ label: "Log", type: "checkbox", click: this.itemClick });
        this.profixItem = new MenuItem({ label: "Profit", type: "checkbox", click: this.itemClick });
        this.positionItem = new MenuItem({ label: "Position", type: "checkbox", click: this.itemClick });
        this.accountItem = new MenuItem({ label: "Account", type: "checkbox", click: this.itemClick });
        this.statarbItem = new MenuItem({ label: "StatArb", type: "checkbox", click: this.itemClick });
        this.sep1 = new MenuItem({ type: "separator" });
        this.sep2 = new MenuItem({ type: "separator" });
        this.subWindMenu = new Menu();
        this.subWindMenu.append(this.orderstatusItem); this.itemsMap[0] = this.orderstatusItem;
        this.subWindMenu.append(this.doneorderItem); this.itemsMap[1] = this.doneorderItem;
        this.subWindMenu.append(this.logItem); this.itemsMap[2] = this.logItem;
        this.subWindMenu.append(this.profixItem); this.itemsMap[3] = this.profixItem;
        this.subWindMenu.append(this.positionItem); this.itemsMap[4] = this.positionItem;
        this.subWindMenu.append(this.accountItem); this.itemsMap[5] = this.accountItem;
        this.subWindMenu.append(this.statarbItem); this.itemsMap[6] = this.statarbItem;
        this.subWindMenu.append(this.sep1);
        this.subWindMenu.append(this.sep2);
        this._menuTemplate.append(new MenuItem({ label: "Window", submenu: this.subWindMenu }));
        this._menuTemplate.append(new MenuItem({
            label: "Help",
            submenu: [
                { label: "Toggle Developer Tools", click: (item, owner) => { owner.webContents.openDevTools(); } },
                { label: "Reload", click: (item, owner) => { owner.reload(); } },
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
            };

            this._option = option;
            StartUp.instanceMap[this._mainWindow.win.webContents.id] = this;

            this._mainWindow.loadURL(`${__dirname}/index.html`);
            this._mainWindow.win.setTitle(name);
            this._mainWindow.setMenu(this._menuTemplate);
            this._windowMgr.addContentWindow(this._mainWindow);
        }
        this._mainWindow.show();
    }
    /**
     * @desc quit
     * @param none
     */
    quit(): void {
        this._windowMgr.closeAll();
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
        this._appdir = path.join(Path.baseDir, this._name);
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

    static instance(): StartUp {
        return new StartUp();
    }
}

interface DockDemoConfig {
    name: string;
    state: Bound;
    layout?: Object;
}

ipcMain.on(`app://get-init-param`, (e, param) => {
    if (StartUp.instanceMap.hasOwnProperty(e.sender.id))
        e.returnValue = StartUp.instanceMap[e.sender.id]._option;
    else
        e.returnValue = {};
});

ipcMain.on(`app://menuitem-CRUD`, (e, param) => {
    if (!StartUp.instanceMap.hasOwnProperty(e.sender.id))
        return;

    let inst = StartUp.instanceMap[e.sender.id];

    switch (param.action) {
        case 0: // add bookview item.
            inst.subWindMenu.insert(8, new MenuItem({ label: param.name }));
            break;
        case 1: // add spreadview item.
            inst.subWindMenu.append(new MenuItem({ label: param.name }));
            break;
        case 2: // change item's state.
            inst.itemsMap[param.index].checked = param.state;
            break;
        default:
            console.info(`undefine action: ${param.action}`);
            break;
    }
});