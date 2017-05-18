"use strict";
import { IPCManager } from "../ipcManager";
import { Path } from "../../common/base/paths";
const fs = require("fs");
const path = require("path");

class Translate {
    private static chineseObj = new Object();
    private static englighObj = new Object();
    static init() {
        // load translate file
        let str = path.join(Path.baseDir, "hanization.csv");
        fs.readFile(path.join(str), { encoding: "utf-8" }, (err, data) => {
            if (err) {
                console.info(err);
                return;
            }
            let lines = data.split("\n");
            lines.forEach(function (linesstr) {
                let arr = linesstr.split(",");
                Translate.chineseObj[arr[0]] = { chinese: arr[1] };
                Translate.englighObj[arr[0]] = { english: arr[0] };
            });
        });
    }

    static getChineseFields(word: string[]) {
        let len = word.length;
        let rtnArr: string[] = [];
        for (let i = 0; i < len; ++i) {
            let bFlag: boolean = true;
            for (let o in this.chineseObj) {
                if (o === word[i] && len !== 1) {
                    bFlag = false;
                    rtnArr.push(this.chineseObj[o].chinese);
                } else if (o === word[i] && len === 1) {
                    bFlag = false;
                    return this.chineseObj[o].chinese;
                }
            }
            if (bFlag) {
                if (len === 1) {
                    return word[0];
                } else {
                    rtnArr.push(word[i]);
                }
            }
        }
        if (rtnArr.length === 0)
            return word;
        return rtnArr;
    }

    static getEnglishFields(word: string[]): any {
        if (word.length === 1)
            return word[0];
        return word;
    }
    // ... get other language fields
}

Translate.init();

IPCManager.register("dal://itrade/translate/translateinfo", (e, param) => {
    let type = param.type;
    let rtnObj: any;
    if (type === 0) {
        rtnObj = Translate.getEnglishFields(param.data);
    } else if (type === 1) {
        rtnObj = Translate.getChineseFields(param.data);
    }
    e.returnValue = rtnObj;
});