/**
 * created by 2017/04/14
 */
"use strict";

import { ipcRenderer } from "electron";

export class SecuMasterService {
    // TODO
    static getSecuinfoByCode(...code: string[]) {
        return ipcRenderer.sendSync("dal://itrade/secumaster/getsecuinfo", {});
    }

    static getSecuinfoByUKey(...ukey: number[]) {
        return ipcRenderer.sendSync("dal://itrade/secumaster/getsecuinfo", {});
    }
}