/**
 * app store manager the apps.
 */
"use strict";

import { ipcMain, Menu, Tray, app, dialog } from "electron";
import * as fs from "fs";
import path = require("path");
import { ContentWindow, Bound } from "./windows";
import { UWindwManager } from "./windowmgr";
import { DefaultLogger } from "../base/logger";
import { UserDal } from "../../dal/itrade/userDal";
import { IPCManager } from "../../dal/ipcManager";
import { Path } from "../base/paths";
import { UConfig } from "../base/configurator";

export class AppStore {
    private static _bAuthorized: boolean = false;
    private static _cfgFile: string;
    private static _config: AppStoreConfig;
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

    public static startupAnApp(name: string, type: string, option: any): boolean {
        if (AppStore._instances.hasOwnProperty(name)) {
            AppStore._instances[name].bootstrap(name, option);
            return true;
        } else if (AppStore._apps.hasOwnProperty(type)) {
            AppStore._instances[name] = AppStore._apps[type].StartUp.instance();
            AppStore._instances[name].bootstrap(name, option);
            return true;
        }

        DefaultLogger.error(`unknown appname: ${name}, apptype: ${type}`);
        return false;
    }

    public static bootstrap(): any {
        AppStore.parseCommandArgs();
        AppStore.loadConfig();
        let contentWindow: ContentWindow = new ContentWindow({ state: AppStore._config.state });
        // contentWindow.setMenu(null);
        contentWindow.loadURL(path.join(AppStore._appstoreHome, "..", "workbench", "index.html"));
        AppStore._instances[AppStore._workbench] = contentWindow;

        contentWindow.win.on("close", (e) => {
            e.preventDefault();
            dialog.showMessageBox(contentWindow.win, {
                type: "info",
                title: "Warning",
                buttons: ["Minimize", "Exit"],
                message: "Minimize Workbench or Exit Whole Application!"
            }, (response: number) => {
                if (response === 0) {
                    contentWindow.win.minimize();
                } else {
                    contentWindow.win.hide();
                    setTimeout(() => {
                        contentWindow.win.removeAllListeners();
                        AppStore._config.state = contentWindow.getBounds();
                        AppStore.saveConfig();
                        app.quit();
                    }, 500);
                }
            });
        });

        IPCManager.register("appstore://quit-all", (event) => {
            contentWindow.close();
        });

        IPCManager.register("appstore://get-setting", (event) => {
            event.returnValue = UConfig.default;
        });

        IPCManager.register("appstore://save-setting", (event, arg) => {
            UConfig.default = arg;
            UConfig.saveChanges();
        });

        IPCManager.register("appstore://startupAnApp", (event, appname, apptype, option) => {
            event.returnValue = AppStore.startupAnApp(appname, apptype, option);
        });

        IPCManager.register("appstore://unloadApp", (event, appname) => {
            AppStore._instances[appname].quit();
            delete AppStore._instances[appname];
            let appdir = path.join(Path.baseDir, appname);
            fs.exists(appdir, (bexists) => {
                if (bexists) {
                    fs.readdir(appdir, (err, files) => {
                        files.forEach(fpath => {
                            fs.unlink(path.join(appdir, fpath));
                        });
                        fs.rmdir(appdir);
                    });
                }
            });
        });

        IPCManager.register("appstore://login", (event, loginInfo) => {
            // begin test
            let apps = [
                {
                    id: "DockDemo",
                    name: "DockDemo",
                    desc: "TradeMonitor",
                    category: "Transanctional"
                },
                {
                    id: "SpreadViewer",
                    name: "hello spread",
                    desc: "TradeMonitor",
                    category: "Transanctional"
                },
                {
                    id: "LoopbackTestReport",
                    name: "hello spread",
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
        let bLang = UConfig.default.language === "zh-cn" ? true : false;
        const contextMenu = Menu.buildFromTemplate([
            {
                label: "Show Workbench", click() {
                    contentWindow.show();
                }
            }, {
                type: "separator"
            }, {
                label: "中文",
                type: "radio",
                checked: bLang,
                click() {
                    UConfig.default.language = "zh-cn";
                    UConfig.saveChanges();
                }
            }, {
                label: "English",
                type: "radio",
                checked: !bLang,
                click() {
                    UConfig.default.language = "en-us";
                    UConfig.saveChanges();
                }
            }, {
                type: "separator"
            }, {
                label: "Exit", click() {
                    contentWindow.win.removeAllListeners();
                    AppStore._config.state = contentWindow.getBounds();
                    AppStore.saveConfig();
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
                    AppStore.startupAnApp(app, "", null);
                });
            });
        }

        return contentWindow;
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

    static loadConfig() {
        let appdir = path.join(Path.baseDir, AppStore._workbench);
        if (!fs.existsSync(appdir))
            fs.mkdirSync(appdir);

        AppStore._cfgFile = path.join(appdir, "default.json");
        AppStore._config = { name: AppStore._workbench, state: { x: 0, y: 0, width: 1000, height: 800 } };
        if (!fs.existsSync(AppStore._cfgFile)) {
            fs.writeFileSync(AppStore._cfgFile, JSON.stringify(AppStore._config), { encoding: "utf8" });
        }

        AppStore._config = JSON.parse(fs.readFileSync(AppStore._cfgFile, "utf8"));
    }

    static saveConfig() {
        // console.info(AppStore._config);
        fs.writeFileSync(AppStore._cfgFile, JSON.stringify(AppStore._config, null, 2));
    }
}


interface AppStoreConfig {
    name: string;
    state: Bound;
    layout?: Object;
    data?: Object;
}
