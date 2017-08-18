/**
 * App startup entry
 */
"use strict";

import { IApplication, MenuWindow, ContentWindow, UWindwManager, Bound, Path, IPCManager } from "../../base/api/backend";
const path = require("path");
const fs = require("fs");
import { ipcMain } from "electron";

export class StartUp implements IApplication {
    _windowMgr: UWindwManager;
    _mainWindow: ContentWindow;
    _bound: Bound;
    _name: string;
    _config: any;
    _appdir: string;
    _cfgFile: string;
    static instanceMap: any = {};
    _option: any;
    static readonly apptype = "spreadviewer";

    constructor() {
        this._windowMgr = new UWindwManager();
        this._config = { name: "", state: { x: 0, y: 0, width: 1200, height: 800 } };
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
        this._appdir = path.join(Path.baseDir, StartUp.apptype);
        if (!fs.existsSync(this._appdir))
            fs.mkdirSync(this._appdir);

        this._cfgFile = path.join(this._appdir, this._name + ".json");
        if (!fs.existsSync(this._cfgFile)) {
            fs.writeFileSync(this._cfgFile, JSON.stringify(this._config), { encoding: "utf8" });
        }

        this._config = JSON.parse(fs.readFileSync(this._cfgFile, "utf8"));
    }

    saveConfig() {
        fs.writeFileSync(this._cfgFile, JSON.stringify(this._config, null, 2));
    }

    addCfg(name, value) {
        this._config[name] = value;
        this.saveConfig();
    }

    static instance(): StartUp {
        return new StartUp();
    }
}

IPCManager.register(`app://${StartUp.apptype}/init`, (e, param) => {
    if (StartUp.instanceMap.hasOwnProperty(e.sender.id)) {
        if (param) {
            switch (param.type) {
                case "cfg-add":
                    StartUp.instanceMap[e.sender.id].addCfg(param.data.name, param.data.value);
                    break;
                default:
                    console.error(`unknown param name ${param.name}`);
                    break;
            }
        } else {
            e.returnValue = StartUp.instanceMap[e.sender.id]._option;
        }
        return;
    }

    console.error(`unknown sender id ${e.sender.id}`);
    e.returnValue = {};
});