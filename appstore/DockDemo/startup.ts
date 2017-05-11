/**
 * App startup entry
 */
"use strict";

import { IApplication, MenuWindow, ContentWindow, UWindwManager, Bound, Path } from "../../base/api/backend";
const path = require("path");
const fs = require("fs");
declare let window: any;
const electron = require("electron");
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
    static instanceMap: Object = {};

    constructor() {
        this._windowMgr = new UWindwManager();
        this._config = { name: "", state: { x: 0, y: 0, width: 1200, height: 800 } };
        this._menuTemplate = [
            {
                label: "File",
                submenu: [
                    { label: "New BookView", click: this.itemClick },
                    { label: "New SpreadView", click: this.itemClick },
                    { type: "separator" },
                    { role: "close" }
                ]
            },
            {
                label: "Window",
                submenu: [
                    { label: "OrderStatus", type: "checkbox", click: this.itemClick },
                    { label: "DoneOrders", type: "checkbox", click: this.itemClick },
                    { label: "Log", type: "checkbox", click: this.itemClick },
                    { label: "Profit", type: "checkbox", click: this.itemClick },
                    { label: "Position", type: "checkbox", click: this.itemClick },
                    { label: "Account", type: "checkbox", click: this.itemClick },
                    { label: "StatArb", type: "checkbox", click: this.itemClick }
                ]
            },
            {
                label: "Help",
                submenu: [
                    { label: "Toggle Developer Tools", role: "toggledevtools", click(item, owner) { owner.webContents.openDevTools(); } },
                    { label: "Reload", role: "reload", click(item, owner) { owner.reload(); } },
                    { type: "separator" },
                    { role: "about" }
                ]
            }
        ];
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

    itemClick(menuItem, owner, event) {
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

electron.ipcMain.on(`app://get-init-param`, (e, param) => {
    if (StartUp.instanceMap.hasOwnProperty(e.sender.id))
        e.returnValue = StartUp.instanceMap[e.sender.id]._option;
    else
        e.returnValue = {};
});