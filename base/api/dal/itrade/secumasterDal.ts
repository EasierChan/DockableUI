/**
 * created 2017/04/14
 */
"use strict";

import { IPCManager } from "../ipcManager";
import { Path } from "../../common/base/paths";
import { IP20Factory } from "../../services/ip20.worker";
import { UConfig } from "../../common/base/configurator"
import * as fs from "fs";
import * as path from "path";

class SecuMaster {
    private static secuUkeyObj = new Object();
    private static innerCodeObj = new Object();
    private static pinyinObj = new Object();
    private static windObj = new Object();
    private static secumasterData: string;
    private static line_sep: string = "\n";
    private static field_sep: string = "#&#";
    private static hasQuote: boolean;
    
    /**
     * updated by cl, 2017/08/19
     * clean code and 
     */
    static init() {
        SecuMaster.hasQuote = false;
        let [addr, port] = UConfig.default.endpoints[0].quote_addr.split(":");
        SecuMaster.secumasterData = "ukeycode,jycode,inputcode,chabbr,windcode,tradingtime,presettlement" + SecuMaster.line_sep;
        let timestamp: Date = new Date();
        let stimestamp = timestamp.getFullYear() + ("0" + (timestamp.getMonth() + 1)).slice(-2) +
            ("0" + timestamp.getDate()).slice(-2) + ("0" + timestamp.getHours()).slice(-2) + ("0" + timestamp.getMinutes()).slice(-2) +
            ("0" + timestamp.getSeconds()).slice(-2) + ("0" + timestamp.getMilliseconds()).slice(-2);
        
        IP20Factory.instance.addSlot({
            appid: 142,
            packid: 27,
            callback: (msg) => {
                for (let i = 0; i < msg.content.Count; ++i) {
                    let secuData = "";
                    let inputcodeArr = msg.content.Structs[i].input_code.split(",");
                    secuData = msg.content.Structs[i].ukey + SecuMaster.field_sep + msg.content.Structs[i].jy_code + SecuMaster.field_sep + inputcodeArr[0] + SecuMaster.field_sep + 
                    msg.content.Structs[i].market_abbr + SecuMaster.field_sep +msg.content.Structs[i].wind_code + SecuMaster.field_sep + msg.content.Structs[i].trading_time + SecuMaster.field_sep + 
                    msg.content.Structs[i].pre_settlement + SecuMaster.line_sep;
                    SecuMaster.secumasterData += secuData;
                }
                if (msg.content.IsLast === "Y") {
                    console.log(SecuMaster.secumasterData);
                    SecuMaster.hasQuote = true;
                    SecuMaster.processingData();
                }
            }
        });

        IP20Factory.instance.addSlot({
            appid: 17,
            packid: 43,
            callback: (msg) => {
                 IP20Factory.instance.send(142, 26, { Seqno: 3, SecurityID: 0, TableType: 5, MarketID: 0, Date: 0, SerialID: 0, PackSize: 10, Field: "ukey,market_abbr,jy_code,wind_code,pre_settlement,trading_time,input_code" });
            }
        });

        IP20Factory.instance.connect(port, addr);

        IP20Factory.instance.onConnect = () => {
            IP20Factory.instance.send(17, 41, { "cellid": "1", "userid": "8.999", "password": "*32C5A4C0E3733FA7CC2555663E6DB6A5A6FB7F0EDECAC9704A503124C34AA88B", "termid": "12.345", "conlvl": 1, "clientesn": "", "clienttm": stimestamp });
        };

        setTimeout(SecuMaster.getSecumasterByCsv, 12000);
    }

    static getSecumasterByCsv() {
        console.log("after 12s!")
        if (!SecuMaster.hasQuote) {
            let fpath = path.join(path.dirname(process.execPath), "secumaster.csv");
            if (!fs.existsSync(fpath)) {
                fpath = path.join("/mnt/dropbox/secumaster/secumaster.csv");
            }
            SecuMaster.secumasterData = fs.readFileSync(path.join(fpath), { encoding: "utf-8" });
            console.log("has no quote!");
            SecuMaster.processingData();
        }
    }

    static processingData() {
        SecuMaster.secumasterData.split(SecuMaster.line_sep).forEach((linestr) => {
        let fields = linestr.split(SecuMaster.field_sep);
        let fieldsLen = fields.length;

        
        SecuMaster.pinyinObj[fields[2] + ","] = { InnerCode: fields[1], SecuCode: fields[2], SecuAbbr: fields[3], ukey: parseInt(fields[0]) };
        SecuMaster.secuUkeyObj[fields[0]] = SecuMaster.pinyinObj[fields[2] + ","];
        SecuMaster.innerCodeObj[fields[1]] = SecuMaster.pinyinObj[fields[2] + ","];
        SecuMaster.windObj[fields[4]] = SecuMaster.pinyinObj[fields[2] + ","];
    
        });

        SecuMaster.secumasterData = null;
        SecuMaster.secumasterData = null;
    }

    static getSecuinfoByInnerCode(innercodes: number[]) {
        let rtnObj = new Object();

        innercodes.forEach(innercode => {
            if (SecuMaster.innerCodeObj.hasOwnProperty(innercode)) {
                rtnObj[innercode] = SecuMaster.innerCodeObj[innercode];
            }
        });

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
                bPinyin = upStr.startsWith(data.toLocaleUpperCase());
            let bCode = code.startsWith(data.toLocaleUpperCase());
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
    // TODO i.e. 
    switch (param.type) {
        case 2: // ukey
            e.returnValue = SecuMaster.getSecuinfoByInnerCode(param.data);
            break;
        case 3: //
            e.returnValue = SecuMaster.getCodeList(param.data);
            break;
        case 4:
            e.returnValue = SecuMaster.getSecuinfoByWindCodes(param.data);
            break;
        case 5:
            e.returnValue = SecuMaster.getSecuinfoByUKey(param.data);
            break;
        default:
            console.error(`unknown type=>${param.type}`);
            break;
    }
});