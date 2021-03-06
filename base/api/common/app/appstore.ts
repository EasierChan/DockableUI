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
import { IPCManager } from "../../dal/ipcManager";

export class AppStore {
    private static _bAuthorized: boolean = false;
    private static _env: any;
    private static _userDal: UserDal;
    private static _tray: Electron.Tray;
    private static _appstoreHome: string = path.join(__dirname, "..", "..", "..", "..", "appstore");
    private static _apps: Object = {};
    private static _instances: Object = {};
    private static _appInfo: any;
    private static readonly _workbench: string = "workbench";

    public static initStore(userApps: Array<string>): void {
        fs.readdir(AppStore._appstoreHome, (err, files) => {
            if (err) {
                DefaultLogger.info(err);
                return;
            }
            files.forEach(curfile => {
                if (fs.statSync(path.join(AppStore._appstoreHome, curfile)).isDirectory()) {
                    if (userApps.indexOf(curfile) >= 0 || userApps[0] === "*")
                        AppStore._apps[curfile] = require(path.join(AppStore._appstoreHome, curfile, "startup"));
                }
            });
            ipcMain.emit("appstore://ready");
        });
    }

    public static startupAnApp(name: string, type: string): boolean {
        if (AppStore._instances.hasOwnProperty(name)) {
            AppStore._instances[name].bootstrap(name);
            return true;
        } else if (AppStore._apps.hasOwnProperty(type)) {
            AppStore._instances[name] = AppStore._apps[type].StartUp.instance();
            AppStore._instances[name].bootstrap();
            return true;
        }

        DefaultLogger.error(`unknown appname: ${name}, apptype: ${type}`);
        return false;
    }

    public static bootstrap(): void {
        AppStore.parseCommandArgs();
        let contentWindow: ContentWindow = new ContentWindow({ state: { x: 0, y: 0, width: 1000, height: 800 } });
        contentWindow.loadURL(path.join(AppStore._appstoreHome, "..", "workbench", "index.html"));
        AppStore._instances[AppStore._workbench] = contentWindow;

        contentWindow.win.on("close", (e) => {
            e.preventDefault();
            contentWindow.win.hide();
        });

        IPCManager.register("appstore://startupAnApp", (event, appname, apptype) => {
            event.returnValue = AppStore.startupAnApp(appname, apptype);
        });

        IPCManager.register("appstore://login", (event, loginInfo) => {
            // begin test
            let apps = [
                {
                    id: "DockDemo",
                    name: "DockDemo",
                    desc: "TradeMonitor",
                    category: "Transanctional"
                }
            ];
            let appIds = [];
            apps.forEach((item) => {
                appIds.push(item.id);
            });
            AppStore.initStore(appIds);
            AppStore._appInfo = apps;
            event.returnValue = apps;
            return;
            // end test
            // if (AppStore._appInfo) {
            //     event.returnValue = AppStore._appInfo;
            //     return;
            // }

            // AppStore._userDal = AppStore._userDal || new UserDal();
            // AppStore._userDal.on("error", (error) => {
            //     if (event !== null)
            //         event.returnValue = false;
            //     AppStore._bAuthorized = false;
            // });

            // AppStore._userDal.getUserProfile(loginInfo.username, loginInfo.password);

            // AppStore._userDal.on("userprofile", (res) => {
            //     let appIds = [];
            //     res.apps.forEach((item) => {
            //         appIds.push(item.id);
            //     });
            //     AppStore.initStore(appIds);
            //     AppStore._appInfo = res.apps;
            //     if (event !== null)
            //         event.returnValue = AppStore._appInfo;
            // });
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
        // work with args
        if (AppStore._env.hideStore !== true) {
            contentWindow.show();
        }
        if (AppStore._env.startapps && AppStore._env.startapps.length > 0
            && AppStore._env.username && AppStore._env.password) {
            ipcMain.emit("appstore://login", null, { username: AppStore._env.username, password: AppStore._env.password });
            IPCManager.register("appstore://ready", () => {
                AppStore._env.startapps.forEach(app => {
                    AppStore.startupAnApp(app, "");
                });
            });
        }
    }

    public static quit(): void {
        AppStore._instances[AppStore._workbench].close();
    }

    public static parseCommandArgs(): void {
        AppStore._env = AppStore._env || new Object();
        process.argv.forEach(arg => {
            if (arg === "--hide-store") {
                AppStore._env.hideStore = true;
            } else if (arg.startsWith("--startapps=")) {
                AppStore._env.startapps = arg.substr(12).split(",");
            } else if (arg.startsWith("--username=")) {
                AppStore._env.username = arg.substr(11);
            } else if (arg.startsWith("--password=")) {
                AppStore._env.password = arg.substr(11);
            }
        });
    }
}