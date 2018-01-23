/**
 * App startup entry
 */
"use strict";

import { IApplication, MenuWindow, ModalWindow, UWindwManager, Bound, Path, IPCManager } from "../../base/api/backend";
const path = require("path");
const fs = require("fs");
declare let window: any;
import { ipcMain } from "electron";

export class StartUp implements IApplication {
    _mainWindow: ModalWindow;
    _bound: Bound;
    _name: string;
    _config: DockDemoConfig;
    _appdir: string;
    _cfgFile: string;
    static instanceMap: any = {};
    _option: any;
    _owner: any;

    constructor(owner: any) {
        this._owner = owner;
        this._config = { name: "", state: { x: 0, y: 0, width: 1200, height: 800 } };
    }

    onClose: Function;
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
            this._mainWindow = new ModalWindow({ state: this._config.state }, this._owner.win);
            this._mainWindow.onclosing = bound => {
                self._config.state = bound;
                self.saveConfig();
                if (self.onClose) {
                    self.onClose(self._name);
                }

                StartUp.instanceMap[this._mainWindow.win.webContents.id] = null;
            };

            this._option = option;

            this._mainWindow.loadURL(path.join(__dirname, "index.html"));
            this._mainWindow.win.setTitle(name);
            this._mainWindow.setMenuBarVisibility(true);
            StartUp.instanceMap[this._mainWindow.win.webContents.id] = this;
        }
        this._mainWindow.show();
    }
    /**
     * @desc quit
     * @param none
     */
    quit(): void {
        this._mainWindow.close();
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


    static instance(parent): StartUp {
        return new StartUp(parent);
    }
}

interface DockDemoConfig {
    name: string;
    state: Bound;
    layout?: Object;
}

IPCManager.register(`app://dialog/init`, (e, param) => {
    if (StartUp.instanceMap.hasOwnProperty(e.sender.id)) {
        e.returnValue = StartUp.instanceMap[e.sender.id]._option;
        return;
    }

    console.error(`unknown sender id ${e.sender.id}`);
    e.returnValue = {};
});