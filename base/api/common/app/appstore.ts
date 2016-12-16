/**
 * app store manager the apps.
 */
"use strict";

import { ipcMain } from "electron";
import * as fs from "fs";
import path = require("path");
import { ContentWindow } from "./windows";
import { UWindwManager } from "./windowmgr";
import { DefaultLogger } from "../base/logger";

export class UApplication {
    private static _appstoreHome: string = path.join(__dirname, "..", "..", "..", "..", "appstore");
    private static _apps: Object = {};
    private static readonly _workbench: string = "workbench";

    public static initStore(userApps: Array<string>): void {
        fs.readdir(this._appstoreHome, (err, files) => {
            files.forEach(curfile => {
                fs.stat(path.join(this._appstoreHome, curfile), (err, stat) => {
                    if (stat.isDirectory()) {
                        if (userApps.indexOf(curfile) >= 0 || userApps[0] === "*")
                            this._apps[curfile] = require(path.join(this._appstoreHome, curfile, "startup"));
                    }
                });
            });
        });
    }

    public static startupAnApp(name: string): boolean {
        if (this._apps.hasOwnProperty(name)) {
            this._apps[name].StartUp.instance().bootstrap();
            return true;
        } else {
            return false;
        }
    }

    public static bootstrap(): void {
        let contentWindow: ContentWindow = new ContentWindow();
        contentWindow.loadURL(path.join(this._appstoreHome, "..", "workbench", "index.html") );
        this._apps[this._workbench] = contentWindow;
        contentWindow.show();

        ipcMain.on("appstore://startupAnApp", (event, appname) => {
            event.returnValue = UApplication.startupAnApp(appname);
        });

        ipcMain.on("appstore://initStore", (event, apps) => {
            UApplication.initStore(apps);
        })
    }

    public static quit(): void {
        this._apps[this._workbench].close();
    }
}