"use strict";

declare var electron: Electron.ElectronMainAndRenderer;
import { Injectable } from "@angular/core";
import { UserProfile } from "../model/app.model";

@Injectable()
export class AppStoreService {
    constructor() { }

    startApp(name: string): boolean {
        return electron.ipcRenderer.sendSync("appstore://startupAnApp", name);
    }

    closeApp(name: string): boolean {
        return;
    }

    getUserProfile(loginInfo: UserProfile): any {
        return electron.ipcRenderer.sendSync("appstore://login", loginInfo);
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

    addItem(menuItem: MenuItem | string, click: Function, pos?: number): void {
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

    static create(lable: string, click?: any, type: "normal" | "separator" | "submenu" | "checkbox" | "radio" = "normal"): any {
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
}