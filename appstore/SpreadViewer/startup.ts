/**
 * App startup entry
 */
"use strict";

import { IApplication, MenuWindow, ContentWindow, UWindwManager, UConfig } from "../../base/api/backend";
import * as path from "path";
import * as fs from "fs";
import { ipcMain, dialog } from "electron";

export class StartUp implements IApplication {
    _windowMgr: UWindwManager;

    constructor() {
        this._windowMgr = new UWindwManager();
    }
    /**
     * bootstrap
     */
    bootstrap(): any {
        let bHasConfig = false;
        let svcpath = null;
        process.argv.forEach((arg) => {
            if (arg.startsWith("--svc=")) {
                bHasConfig = true;
                svcpath = arg.substr(6);
            }
        });

        if (!bHasConfig) {
            dialog.showMessageBox({
                title: "Startup Error",
                type: "error",
                message: "spreadviewer config need to be specified.",
                detail: "--svc=filepath",
                buttons:["Got it"]
            });
            return;
        }

        ipcMain.on("svc://get-config", (e, arg) => {
            let obj = path.isAbsolute(svcpath) ? JSON.parse(fs.readFileSync(svcpath, { encoding: "utf-8" }))
                : JSON.parse(fs.readFileSync(path.join(process.cwd(), svcpath), { encoding: "utf-8" }));
        });
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
