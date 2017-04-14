/**
 * created 2017/04/14
 */
"use strict";

import { IPCManager } from "../ipcManager";

class SecuMaster {
    static init() {
        // TODO load secuinfo, future info
    }

    static getSecuinfoByCode(...code: string[]) {

    }

    static getSecuinfoByUKey(...ukey: number[]) {

    }
}

SecuMaster.init();

IPCManager.register("dal://itrade/secumaster/getsecuinfo", (e, param) => {
    // TODO i.e. SecuMaster.getSecuInfoByCode
    e.returnValue = {};
});