/**
 * created 2017/04/14
 */
"use strict";

import { IPCManager } from "../ipcManager";
import { Path } from "../../common/base/paths";
const fs = require("fs");
const path = require("path");

class SecuMaster {
    private static secuCodeObj = new Object();
    private static secuUkeyObj = new Object();
    private static pinyinObj = new Object();

    static init() {
        // TODO load secuinfo, future info
        let data1 = new Date();
        let str = path.join(path.dirname(process.execPath), "secumain.csv");
        if (!fs.existsSync(str)) {
            str = path.join(__dirname, "../../../../secumain.csv");
        }

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
            let arrLen = arr.length;
            if (arrLen === 4) {
                SecuMaster.pinyinObj[arr[2] + ","] = { InnerCode: arr[1], SecuCode: arr[2], SecuAbbr: arr[3], ukey: arr[0] };
            } else if (arrLen === 5) {
                SecuMaster.pinyinObj[arr[2] + "," + arr[3]] = { InnerCode: arr[1], SecuCode: arr[3], SecuAbbr: arr[4], ukey: arr[0] };
            }
        });
        let data2 = new Date();
        // console.log("******************", data2.getTime() - data1.getTime());
        let portStr = path.join(path.dirname(process.execPath), "port.csv");
        if (!fs.existsSync(portStr)) {
            portStr = path.join(__dirname, "../../../../port.csv");
        }

        let portContent: String = new String();
        try {
            portContent = fs.readFileSync(path.join(portStr), { encoding: "utf-8" });
        }
        catch (e) {
            console.info(e);
            // alert("can not open secumain.csv");
        }
        let portlines = portContent.split("\n");
        portlines.forEach(function (linestr) {
            let arr = linestr.split(",");
            let arrLen = arr.length;
            if (arrLen === 4) {
                SecuMaster.secuCodeObj[arr[2]] = { InnerCode: arr[1], SecuCode: arr[2], SecuAbbr: arr[3], ukey: arr[0] };
                SecuMaster.secuUkeyObj[arr[1]] = { InnerCode: arr[1], SecuCode: arr[2], SecuAbbr: arr[3], ukey: arr[0] };
            } else if (arrLen === 5) {
                SecuMaster.secuCodeObj[arr[3]] = { InnerCode: arr[1], SecuCode: arr[3], SecuAbbr: arr[4], ukey: arr[0] };
                SecuMaster.secuUkeyObj[arr[1]] = { InnerCode: arr[1], SecuCode: arr[3], SecuAbbr: arr[4], ukey: arr[0] };
            }
        });
        let data3 = new Date();
        // console.log("******************", data3.getTime() - data2.getTime());
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

    static getCodeList(data: string) {
        let tip = 0;
        let rtnArr = [];
        for (let o in SecuMaster.pinyinObj) {
            let pinyin = o.split(",")[0];
            let len = pinyin.length;
            let upStr: string = "";
            for (let i = 0; i < len; ++i) {
                let bcheck = (/^[A-Z]+$/).test(pinyin.charAt(i));
                if (!bcheck) {
                    upStr += pinyin.charAt(i).toLocaleUpperCase();
                }
                else {
                    upStr += pinyin.charAt(i);
                }
            }
            let code = o.split(",")[1];
            let bPinyin = false;
            if (!pinyin)
                bPinyin = false;
            else
                bPinyin = upStr.startsWith(data);
            let bCode = code.startsWith(data);
            if (bPinyin || bCode) {
                tip += 1;
                rtnArr.push({ code: SecuMaster.pinyinObj[o].InnerCode, symbolCode: SecuMaster.pinyinObj[o].SecuCode, SecuAbbr: SecuMaster.pinyinObj[o].SecuAbbr, ukey: SecuMaster.pinyinObj[o].ukey });
                if (tip === 10)
                    return rtnArr;
            }
        }
        return rtnArr;
    }
}

SecuMaster.init();

IPCManager.register("dal://itrade/secumaster/getsecuinfo", (e, param) => {
    // TODO i.e. SecuMaster.getSecuinfoByCode
    switch (param.type) {
        case 1: // code
            e.returnValue = SecuMaster.getSecuinfoByCode(param.data);
            break;
        case 2: // ukey
            e.returnValue = SecuMaster.getSecuinfoByUKey(param.data);
            break;
        case 3: //
            e.returnValue = SecuMaster.getCodeList(param.data);
            break;
        default:
            console.error(`unknown type=>${param.type}`);
            break;
    }
});