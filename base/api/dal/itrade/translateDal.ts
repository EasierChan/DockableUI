"use strict";
import { IPCManager } from "../ipcManager";
import { Path } from "../../common/base/paths";
import { UConfig } from "../../common/base/configurator";
import * as fs from "fs";
import * as path from "path";

class Resource {
    private static strings = new Object();

    static init() {
        // load translate file
        let str = path.join(path.dirname(process.execPath), "hanization.csv");
        if (!fs.existsSync(str)) {
            str = path.join(__dirname, "../../../../hanization.csv");
        }

        fs.readFile(path.join(str), { encoding: "utf-8" }, (err, data) => {
            if (err) {
                console.info(err);
                return;
            }

            let lines = data.split("\n");
            lines.forEach(function (linesstr) {
                let arr = linesstr.split(",");
                Resource.strings[arr[0]] = { chinese: arr[1] };
            });
        });
    }

    static get(word: string) {
        if (Resource.strings.hasOwnProperty(word)) {
            return UConfig.default.language === "zh-cn" ? Resource.strings[word].chinese : word;
        }

        return word;
    }
}

Resource.init();

IPCManager.register("dal://itrade/translate/translateinfo", (e, param) => {
    e.returnValue = Resource.get(param.data);
});