/**
 * App startup entry
 */
"use strict";

import { IApplication, MenuWindow, ContentWindow, UWindwManager } from "../../base/api/backend";
const path = require("path");

export class StartUp implements IApplication {
    _windowMgr: UWindwManager;

    constructor() {
        this._windowMgr = new UWindwManager();
    }
    /**
     * bootstrap
     */
    bootstrap(): any {
        // let menuWindow: MenuWindow = new MenuWindow({ state: { width: 300, height: 60 } });
        // menuWindow.ready().then(function () {
        //     console.log("when MenuWindow ready say: hello");
        // });
        // menuWindow.loadURL(__dirname + "/appstore/start/sample.html");
        // this._windowMgr.addMenuWindow(menuWindow);
        let contentWindow: ContentWindow = new ContentWindow();
        contentWindow.loadURL(path.join(__dirname, "index.html"));
        this._windowMgr.addContentWindow(contentWindow);
        contentWindow.show();
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
        return new StartUp();
    }
}
