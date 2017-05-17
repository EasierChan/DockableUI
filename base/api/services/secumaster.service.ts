/**
 * created by 2017/04/14
 */
"use strict";

import { ipcRenderer } from "electron";
declare var electron: Electron.ElectronMainAndRenderer;
export class SecuMasterService {
    // TODO
    static getSecuinfoByCode(type: number, ...code: string[]) {
        return electron.ipcRenderer.sendSync("dal://itrade/secumaster/getsecuinfo", { type: type, data: code });
    }

    static getSecuinfoByUKey(type: number, ...ukey: number[]) {
        return electron.ipcRenderer.sendSync("dal://itrade/secumaster/getsecuinfo", { type: type, data: ukey });
    }

    static getCodeList(data: string) {
        return electron.ipcRenderer.sendSync("dal://itrade/secumaster/getcodelist", data);
    }
    static init(cb: Function) {
        electron.ipcRenderer.on("dal://itrade/secumaster/reccodelist", (event, arg) => {
            cb(arg);
        });
    }

}