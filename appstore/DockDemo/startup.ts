/**
 * App startup entry
 */
"use strict";

import { IApplication, MenuWindow, ContentWindow, UWindwManager, Bound, Path } from "../../base/api/backend";
const path = require("path");
const fs = require("fs");

export class StartUp implements IApplication {
    _windowMgr: UWindwManager;
    _mainWindow: ContentWindow;
    _bound: Bound;
    _name: string;
    _config: DockDemoConfig;
    _appdir: string;
    _cfgFile: string;
    static _instance: StartUp;

    constructor() {
        this._windowMgr = new UWindwManager();
        this._config = { name: "", state: { x: 0, y: 0, width: 1200, height: 800 } };
    }
    /**
     * bootstrap
     */
    bootstrap(name = "DockDemo"): any {
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
            this._mainWindow.loadURL(path.join(__dirname, "index.html"));
            this._mainWindow.setMenuBarVisibility(true);
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

        Object.assign(this._config, JSON.parse(fs.readFileSync(this._cfgFile, "utf8")));
    }

    saveConfig() {
        fs.writeFile(this._cfgFile, JSON.stringify(this._config, null, 2));
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