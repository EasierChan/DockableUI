"use strict";

declare var electron: Electron.ElectronMainAndRenderer;
import { Injectable } from "@angular/core";

@Injectable()
export class AppStoreService {
    constructor() { }

    startApp(name: string): boolean {
        return electron.ipcRenderer.sendSync("appstore://startupAnApp", name);
    }

    initStore(userApps: Array<string>): void {
        electron.ipcRenderer.send("appstore://initStore", userApps);
    }
} 