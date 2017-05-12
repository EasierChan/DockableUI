"use strict";

declare var electron: Electron.ElectronMainAndRenderer;
import { Injectable } from "@angular/core";
import { UserProfile } from "../model/app.model";

export const os = require("@node/os");
export const path = require("@node/path");
export const fs = require("@node/fs");
export const readline = require("@node/readline");

@Injectable()
export class AppStoreService {
    constructor() { }

    startApp(name: string, type: string, option: any): boolean {
        return electron.ipcRenderer.sendSync("appstore://startupAnApp", name, type, option);
    }

    closeApp(name: string): boolean {
        return electron.ipcRenderer.sendSync("appstore://hideApp", name);
    }

    getUserProfile(loginInfo: UserProfile): any {
        return electron.ipcRenderer.sendSync("appstore://login", loginInfo);
    }
}

@Injectable()
export class AppStateCheckerRef {
    private option: any;
    onMenuItemClick: (menuitem: any, param?: any) => void;

    constructor() {
        this.option = electron.ipcRenderer.sendSync(`app://get-init-param`);
        electron.ipcRenderer.on("app://menuitem-click", (e, item, param) => {
            if (this.onMenuItemClick) {
                this.onMenuItemClick(item, param);
            }
        });
    }

    onInit(appref: any, afterInit: (...params) => void) {
        afterInit.call(appref, this.option);
    }

    addMenuItem(action: number, name: string) {
        electron.ipcRenderer.send("app://menuitem-CRUD", { action: action, name: name });
    }

    changeItemState(name, itemIndex, state, action: number = 2) {
        electron.ipcRenderer.send("app://menuitem-CRUD", { action: action, index: itemIndex, state: state });
    }
}

@Injectable()
export class Menu {
    private _menu: any;
    /**
     * @returns an array containing the menu’s items.
     */

    constructor() {
        this._menu = new electron.remote.Menu();
    }

    addItem(menuItem: MenuItem | string, click?: Function, pos?: number): void {
        if (typeof menuItem === "string")
            menuItem = MenuItem.create(menuItem, click);

        if (pos) {
            this._menu.insert(pos, menuItem);
        } else {
            this._menu.append(menuItem);
        }
    }

    get items() {
        return this._menu.items;
    }

    popup(x?: number, y?: number): void {
        this._menu.popup();
    }
}

@Injectable()
export class MenuItem {
    constructor() {
    }

    static create(lable: string, click?: any, type: "normal" | "separator" | "submenu" | "checkbox" | "radio" = "normal", option?: {
        visible: boolean;
        checked: boolean;
    }): any {
        if (option)
            return new electron.remote.MenuItem({ label: lable, type: type, click: click, visible: option.visible, checked: option.checked });
        else
            return new electron.remote.MenuItem({ label: lable, type: type, click: click });
    }
}

/**
 *
 */
export class MessageBox {

    static show(type: "none" | "info" | "error" | "question" | "warning", title: string, message: string, callback?: (response: number) => void,
        buttons?: string[], defaultId?: number, cancelId?: number) {
        electron.remote.dialog.showMessageBox(electron.remote.BrowserWindow.getFocusedWindow(), {
            type: type,
            buttons: (buttons ? buttons : ["OK"]),
            title: title,
            message: message,
            defaultId: defaultId ? defaultId : null,
            cancelId: cancelId ? cancelId : null
        }, callback);
    }

    static openFileDialog(title: string, cb: (filenames: string[]) => void, filters?: { name: string, extensions: string[] }[]) {
        electron.remote.dialog.showOpenDialog(electron.remote.BrowserWindow.getFocusedWindow(), {
            title: title,
            filters: filters,
            properties: ["openFile"]
        }, cb);
    }
}

export class File {
    public static parseJSON(fpath: string): Object {
        if (!fs.existsSync(fpath)) {
            return null;
        }

        let obj;
        try {
            obj = JSON.parse(fs.readFileSync(fpath, { encoding: "utf8" }));
        } catch (e) {
            console.error(`file: ${fpath} failed to parse to JSON！`);
            console.error(e);
            return null;
        }
        return obj;
    }

    public static readLineByLine(fpath: string, cb: (linestr) => void) {
        const rl = readline.createInterface({
            input: fs.createReadStream(fpath)
        });

        rl.on("line", line => {
            cb(line);
        });
    }

    public static writeSync(fpath: string, content: string | Object) {
        if (typeof (content) === "string")
            fs.writeFileSync(fpath, content, { encoding: "utf8" });
        else
            fs.writeFileSync(fpath, JSON.stringify(content), { encoding: "utf8" });
    }

    public static writeAsync(fpath: string, content: string | Object) {
        if (typeof (content) === "string")
            fs.writeFile(fpath, content, { encoding: "utf8" });
        else
            fs.writeFile(fpath, JSON.stringify(content), { encoding: "utf8" });
    }
}

export class Environment {
    public static appDataDir: string = electron.remote.app.getPath("appData");
}

export class Sound {
    static readonly exec = require("@node/child_process").exec;
    /**
     * @param type 0 good, 1 bad;
     */
    static play(type: number) {
        switch (type) {
            case 0:
                Sound.playWav(path.join(__dirname, "/../../sound/good.wav"));
            case 1:
                Sound.playWav(path.join(__dirname, "/../../sound/bad.wav"));
                break;
            default:
                console.error(`unvalid type => ${type}`);
        }
    }

    static playWav(fpath: string) {
        Sound.exec("aplay " + fpath, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            console.info(`stdout: ${stdout}`);
            console.info(`stdout: ${stderr}`);
        });
    }
}