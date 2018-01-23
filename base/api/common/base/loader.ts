/**
 * date 2017/02/17 cl
 * 
 */
"use strict";
import { ULogger, DefaultLogger } from "./logger";
import { UConfig } from "./configurator";
import { IPCManager } from "../../dal/ipcManager";
import fs = require("fs");
import path = require("path");

export class ULoader {
    static init(rootDir: string, default_cfg_file: string = ""): void {
        // init configuration
        UConfig.init("", default_cfg_file);
        // init base info
        // let fpath = path.join(process.execPath, "hanization.csv");
        // if (!fs.existsSync(fpath)) {
        //     fs.writeFileSync(fpath, fs.readFileSync(path.join(rootDir, "hanization.csv"), "utf-8"), { encoding: "utf-8" });
        // }

        // fpath = path.join(process.execPath, "secumain.csv");
        // if (!fs.existsSync(fpath)) {
        //     fs.writeFileSync(fpath, fs.readFileSync(path.join(rootDir, "secumain.csv"), "utf-8"), { encoding: "utf-8" });
        // }

        // fpath = path.join(process.execPath, "port.csv");
        // if (!fs.existsSync(fpath)) {
        //     fs.writeFileSync(fpath, fs.readFileSync(path.join(rootDir, "port.csv"), "utf-8"), { encoding: "utf-8" });
        // }

        // init logger
        ULogger.init();
        DefaultLogger.info("Program environment initialize...");
        // init IPCManager
        IPCManager.start();
    }
}