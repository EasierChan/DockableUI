/**
 * App startup entry
 */
"use strict";

import { IApplication, MenuWindow, MultiWindow, UWindwManager, SingletonWindow, DefaultLogger } from "../../base/api/backend";
const path = require("path");

export class StartUp implements IApplication {
    _windowMgr: UWindwManager;
    static _instance: StartUp;

    constructor() {
        this._windowMgr = new UWindwManager();
    }
    /**
     * bootstrap
     */
    bootstrap(): any {
        let menuWindow: MenuWindow = new MenuWindow({ state: { x: 500, y: 0, width: 300, height: 60 } });
        menuWindow.ready().then(function () {
            DefaultLogger.info("when MenuWindow ready say: hello");
        });
        menuWindow.win.on("closed", () => {
            this.quit();
        });
        menuWindow.loadURL(path.join(__dirname, "menu.html"));
        this._windowMgr.addMenuWindow(menuWindow);

        let singleton: SingletonWindow = new SingletonWindow();
        singleton.loadURL(path.join(__dirname, "singleton.html"));
        this._windowMgr.addWindowToMenu(singleton, "SingletonWindow", { level1: 2 });

        let multiple: MultiWindow = new MultiWindow();
        multiple.loadURL(path.join(__dirname, "singleton.html"));
        this._windowMgr.addWindowToMenu(multiple, "MultipleWin", { level1: 2 });

        menuWindow.show();
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
        this.bootstrap();
    }

    static instance(): StartUp {
        if (!StartUp._instance) {
            return new StartUp();
        }
    }
}