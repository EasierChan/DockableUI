/**
 * app store manager the apps.
 */
"use strict";

import { ipcMain, Menu, Tray, app } from "electron";
import * as fs from "fs";
import path = require("path");
import { ContentWindow } from "./windows";
import { UWindwManager } from "./windowmgr";
import { DefaultLogger } from "../base/logger";
import { UserDal } from "../../dal/itrade/userDal";

export class AppStore {
    private static _bAuthorized: boolean;
    private static _userDal: UserDal;
    private static _tray: Electron.Tray;
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

    public static authorize(username: string, password: string): void {
        AppStore._userDal = AppStore._userDal || new UserDal();
        AppStore._userDal.on("connect", () => {
            AppStore._userDal.authorize(username, password);
        });
    }

    public static bootstrap(): void {
        let contentWindow: ContentWindow = new ContentWindow({ state: { x: 200, y: 100, width: 1000, height: 600 } });
        contentWindow.loadURL(path.join(this._appstoreHome, "..", "workbench", "index.html"));
        this._apps[this._workbench] = contentWindow;
        // contentWindow.show();

        contentWindow.win.on("close", (e) => {
            e.preventDefault();
            contentWindow.win.hide();
        });

        ipcMain.on("appstore://startupAnApp", (event, appname) => {
            event.returnValue = AppStore.startupAnApp(appname);
        });

        ipcMain.on("appstore://login", (event, loginInfo) => {
            AppStore.authorize(loginInfo.username, loginInfo.password);
            AppStore._userDal.on("authorize", (bRet) => {
                if (bRet) {
                    AppStore._userDal.getUserProfile(loginInfo.username);
                } else {
                    event.returnValue = bRet;
                }
            });

            AppStore._userDal.on("userprofile", (res) => {
                let appIds = [];
                res.apps.forEach((item) => {
                    appIds.push(item.id);
                });
                AppStore.initStore(appIds);
                event.returnValue = res.apps;
            });

            AppStore._userDal.on("error", (error) => {
                event.returnValue = false;
            });
        });
        // set tray icon
        AppStore._tray = new Tray(path.join(__dirname, "..", "..", "..", "images", "AppStore.png"));
        const contextMenu = Menu.buildFromTemplate([
            {
                label: "Show Workbench", click() {
                    contentWindow.show();
                }
            },
            {
                label: "Exit", click() {
                    contentWindow.win.removeAllListeners();
                    app.quit();
                }
            }
        ]);
        AppStore._tray.setToolTip("This is appstore's Workbench.");
        AppStore._tray.setContextMenu(contextMenu);
    }

    public static quit(): void {
        this._apps[this._workbench].close();
    }
}