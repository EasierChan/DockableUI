/**
 * App startup entry
 */
"use strict";

import { IApplication, MenuWindow, ContentWindow, UWindwManager, Bound, Path, IPCManager } from "../../base/api/backend";
const path = require("path");
import * as fs from "fs";
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
    static readonly apptype = "alphaviewer";
    static untitleID = 1;

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
            if (name === "Untitled") {
                name = [name, StartUp.untitleID].join("-");
                ++StartUp.untitleID;
            }

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

            this._option = this._config.option ? Object.assign(this._config.option, option) : option;

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

    saveAs(newName) {
        if (newName !== this._name) {
            let newPath = path.join(this._appdir, newName + ".json");
            fs.renameSync(this._cfgFile, newPath);
            this._cfgFile = newPath;
            ipcMain.emit("appstore://updateApp", { type: "alphaviewer", oldName: this._name, newName: newName });
            this._name = newName;
        }
    }

    addCfgItem(value) {
        this._config["option"] = value;
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
                case "cfg-rename":
                    StartUp.instanceMap[e.sender.id].saveAs(param.name);
                    break;
                case "cfg-add":
                    StartUp.instanceMap[e.sender.id].addCfgItem(param.value);
                    break;
                default:
                    console.error(`unknown param name ${param.name}`);
                    break;
            }
        } else {
            if (StartUp.instanceMap[e.sender.id]._option)
                e.returnValue = StartUp.instanceMap[e.sender.id]._option;
            else
                e.returnValue = null;
        }
        return;
    }

    console.error(`unknown sender id ${e.sender.id}`);
    e.returnValue = {};
});