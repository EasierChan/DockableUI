"use strict";

import { fs, path } from "../../../base/api/services/backend.service";


export class LoadSecuMain {
    private static secuMainObj = new Object();
    private static symbolObj = new Object();
    constructor() {
        let str = "/home/xinkui/itrade-ui/secumaincopy.csv";
        let content: String = new String();
        try {
            content = fs.readFileSync(path.join(str), { encoding: "utf-8" });
        }
        catch (e) {
            alert("can not open secumain.csv");
        }
        let lines = content.split("\n");
        lines.forEach(function (linestr) {
            let arr = linestr.split(",");
            LoadSecuMain.secuMainObj[arr[4]] = { InnerCode: arr[0], SecuCode: arr[4], SecuAbbr: arr[3] };
            LoadSecuMain.symbolObj[arr[0]] = { InnerCode: arr[0], SecuCode: arr[4], SecuAbbr: arr[3] };
        });
    }
    getUkeyAndSymbol(data: any) {
        data = data + "";
        for (let o in LoadSecuMain.secuMainObj) {
            if (o === data) {
                return LoadSecuMain.secuMainObj[o];
            }
        }
        return {};
    }
    getSymbolAndName(data: any) {
        data = data + "";
        for (let o in LoadSecuMain.symbolObj) {
            //  console.log(o, data);
            if (o === data) {
                return LoadSecuMain.symbolObj[o];
            }
        }
        return {};
    }

};



