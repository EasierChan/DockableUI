/**
 * App startup entry
 */
"use strict";

import { IApplication, MenuWindow, ContentWindow, UWindwManager, Bound } from "../../base/api/backend";
const path = require("path");

export class StartUp implements IApplication {
    _windowMgr: UWindwManager;
    _mainWindow: ContentWindow;
    _bound: Bound;
    _name: string;
    static _instance: StartUp;

    constructor() {
        this._windowMgr = new UWindwManager();
    }
    /**
     * bootstrap
     */
    bootstrap(name = "DockDemo"): any {
        let self = this;
        if (!this._mainWindow || !this._mainWindow.win) {
            this._name = name;
            this._mainWindow = null;
            this._mainWindow = new ContentWindow({ state: { x: 0, y: 0, width: 1200, height: 800 } });
            // this._mainWindow.onclosing = bound => {
            //     self.emit("close", bound);
            // };
            this._mainWindow.loadURL(path.join(__dirname, "index.html"));
            this._mainWindow.setMenuBarVisibility(true);
            this._windowMgr.addContentWindow(this._mainWindow);
        }
        this._mainWindow.show();
    }
    /**
     * quit
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

    static instance(): StartUp {
        return new StartUp();
    }
}
