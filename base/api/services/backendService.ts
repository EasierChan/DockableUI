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