/**
 * created 2017/04/14
 */
"use strict";

import { IPCManager } from "../ipcManager";

const fs = require("fs");
const path = require("path");

class SecuMaster {
    private static secuCodeObj = new Object();
    private static secuUkeyObj = new Object();
    static init() {
        // TODO load secuinfo, future info
        console.log("load secumain.csv file......");
        let str = "/home/xinkui/secumain0417.csv";
        let content: String = new String();
        try {
            content = fs.readFileSync(path.join(str), { encoding: "utf-8" });
        }
        catch (e) {
            console.info(e);
            // alert("can not open secumain.csv");
        }
        let lines = content.split("\n");
        lines.forEach(function (linestr) {
            let arr = linestr.split(",");
            SecuMaster.secuCodeObj[arr[4]] = { InnerCode: arr[0], SecuCode: arr[4], SecuAbbr: arr[3] };
            SecuMaster.secuUkeyObj[arr[0]] = { InnerCode: arr[0], SecuCode: arr[4], SecuAbbr: arr[3] };
        });
    }

    static getSecuinfoByCode(code: string[]) {
        let codeLen = code.length;
        let rtnObj = new Object();
        for (let i = 0; i < codeLen; ++i) {
            for (let o in SecuMaster.secuCodeObj) {
                if (o === code[i]) {
                    rtnObj[o] = SecuMaster.secuCodeObj[o];
                }
            }
        }
        return rtnObj;
    }

    static getSecuinfoByUKey(ukey: number[]) {
        let ukeyLen = ukey.length;
        let rtnObj = new Object();
        for (let i = 0; i < ukeyLen; ++i) {
            for (let o in SecuMaster.secuUkeyObj) {
                if (o === (ukey[i] + "")) {
                    rtnObj[o] = SecuMaster.secuUkeyObj[o];
                }
            }
        }
        return rtnObj;
    }
}

SecuMaster.init();

IPCManager.register("dal://itrade/secumaster/getsecuinfo", (e, param) => {
    // TODO i.e. SecuMaster.getSecuinfoByCode
    let type = param.type;   // 1,code   2,ukey
    let rtnObj = new Object();
    if (type === 1) {
        rtnObj = SecuMaster.getSecuinfoByCode(param.data);
    } else if (type === 2) {
        rtnObj = SecuMaster.getSecuinfoByUKey(param.data);
    }
    e.returnValue = rtnObj;
});