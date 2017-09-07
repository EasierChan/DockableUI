/**
 * created 2017/04/14
 */
"use strict";

import { IPCManager } from "../ipcManager";
import { Path } from "../../common/base/paths";
import * as fs from "fs";
import * as path from "path";

class SecuMaster {
    private static secuCodeObj = new Object();
    private static secuUkeyObj = new Object();
    private static pinyinObj = new Object();
    private static windObj = new Object();

    /**
     * updated by cl, 2017/08/19
     * clean code and 
     */
    static init() {
        let fpath = path.join(path.dirname(process.execPath), "secumain.csv");
        if (!fs.existsSync(fpath)) {
            fpath = path.join(__dirname, "../../../../secumain.csv");
        }

        try {
            let content = fs.readFileSync(path.join(fpath), { encoding: "utf-8" });

            content.split("\n").forEach((linestr) => {
                let arr = linestr.split(",");
                let arrLen = arr.length;

                if (arrLen === 5) {
                    SecuMaster.pinyinObj[arr[2] + ","] = { InnerCode: arr[1], SecuCode: arr[2], SecuAbbr: arr[3], ukey: parseInt(arr[0]) };
                    if (arr[4].length > 0)
                        SecuMaster.windObj[arr[4]] = SecuMaster.pinyinObj[arr[2] + ","];
                } else if (arrLen === 6) {
                    SecuMaster.pinyinObj[arr[2] + "," + arr[3]] = { InnerCode: arr[1], SecuCode: arr[3], SecuAbbr: arr[4], ukey: parseInt(arr[0]) };
                    if (arr[5].length > 0)
                        SecuMaster.windObj[arr[5]] = SecuMaster.pinyinObj[arr[2] + "," + arr[3]];
                }
            });

            content = null;
        } catch (e) {
            console.info(e);
        }

        let portStr = path.join(path.dirname(process.execPath), "port.csv");
        if (!fs.existsSync(portStr)) {
            portStr = path.join(__dirname, "../../../../port.csv");
        }

        try {
            let portContent = fs.readFileSync(path.join(portStr), { encoding: "utf-8" });
            portContent.split("\n").forEach(function (linestr) {
                let arr = linestr.split(",");
                let arrLen = arr.length;
                if (arrLen === 4) {
                    SecuMaster.secuCodeObj[arr[2]] = { InnerCode: arr[1], SecuCode: arr[2], SecuAbbr: arr[3], ukey: parseInt(arr[0]) };
                    SecuMaster.secuUkeyObj[arr[1]] = { InnerCode: arr[1], SecuCode: arr[2], SecuAbbr: arr[3], ukey: parseInt(arr[0]) };
                } else if (arrLen === 5) {
                    SecuMaster.secuCodeObj[arr[3]] = { InnerCode: arr[1], SecuCode: arr[3], SecuAbbr: arr[4], ukey: parseInt(arr[0]) };
                    SecuMaster.secuUkeyObj[arr[1]] = { InnerCode: arr[1], SecuCode: arr[3], SecuAbbr: arr[4], ukey: parseInt(arr[0]) };
                }
            });

            portContent = null;
        } catch (e) {
            console.info(e);
        }
    }

    static getSecuinfoByCode(code: string[]) {
        let rtnObj = new Object();
        let codeLen = code.length;
        for (let i = 0; i < codeLen; ++i) {
            let codestr = code[i];
            let codeLen = codestr.length;
            let UpcodeStr = "";
            for (let j = 0; j < codeLen; ++j) {
                let bCheck = (/^[A-Z]+$/).test(codestr.charAt(j));
                if (!bCheck) {
                    UpcodeStr += codestr.charAt(j).toLocaleUpperCase();
                }
                else {
                    UpcodeStr += codestr.charAt(j);
                }
            }
            for (let o in SecuMaster.secuCodeObj) {
                let oLen = o.length;
                let upoStr: string = "";
                for (let j = 0; j < oLen; ++j) {
                    let bCheck = (/^[A-Z]+$/).test(o.charAt(j));
                    if (!bCheck) {
                        upoStr += o.charAt(j).toLocaleUpperCase();
                    }
                    else {
                        upoStr += o.charAt(j);
                    }
                }
                if (upoStr === UpcodeStr) {
                    rtnObj[code[i]] = SecuMaster.secuCodeObj[o];
                }
            }
        }
        return rtnObj;
    }

    static getSecuinfoByUKey(ukeys: number[]) {
        let rtnObj = new Object();

        ukeys.forEach(ukey => {
            if (SecuMaster.secuUkeyObj.hasOwnProperty(ukey)) {
                rtnObj[ukey] = SecuMaster.secuUkeyObj[ukey];
            }
        });

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
                rtnArr.push({ code: SecuMaster.pinyinObj[o].InnerCode, symbolCode: SecuMaster.pinyinObj[o].SecuCode, SecuAbbr: SecuMaster.pinyinObj[o].SecuAbbr, ukey: parseInt(SecuMaster.pinyinObj[o].ukey) });
                if (tip === 10)
                    return rtnArr;
            }
        }
        return rtnArr;
    }

    /**
     * add by cl, date 2017/08/19
     */
    static getSecuinfoByWindCodes(codes: string[]) {
        let resArr = [];
        codes.forEach(code => {
            if (SecuMaster.windObj.hasOwnProperty(code)) {
                SecuMaster.windObj[code].windCode = code;
                resArr.push(SecuMaster.windObj[code]);
            }
        });

        return resArr;
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
        case 4:
            e.returnValue = SecuMaster.getSecuinfoByWindCodes(param.data);
            break;
        default:
            console.error(`unknown type=>${param.type}`);
            break;
    }
});