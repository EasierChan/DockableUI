/**
 * created by 2017/04/14
 */
"use strict";

import { ipcRenderer } from "electron";
declare var electron: Electron.ElectronMainAndRenderer;
export class SecuMasterService {
    // TODO
    static getSecuinfoByCode(...code: string[]) {
        return electron.ipcRenderer.sendSync("dal://itrade/secumaster/getsecuinfo", { type: 1, data: code });
    }

    static getSecuinfoByUKey(...ukey: number[]) {
        return electron.ipcRenderer.sendSync("dal://itrade/secumaster/getsecuinfo", { type: 2, data: ukey });
    }

    static getCodeList(data: string) {
        return electron.ipcRenderer.sendSync("dal://itrade/secumaster/getsecuinfo", { type: 3, data: data });
    }
}