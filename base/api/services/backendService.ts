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
    private _items: MenuItem[];
    constructor() {
        this._menu = new electron.remote.Menu();
    }

    addItem(menuItem: MenuItem, pos?: number): void {
        if (pos) {
            this._menu.insert(pos, menuItem);
        } else {
            this._menu.append(menuItem);
        }
    }

    popup(x?: number, y?: number): void {
        this._menu.popup();
    }
}

@Injectable()
export class MenuItem {
    private _submenu: Menu;
    constructor() {
    }

    set submenu(value: Menu) {
        this._submenu = value;
    }
}