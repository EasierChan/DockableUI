/**
 * EasierChan 2016-08-31
 */
"use strict";

import { Path } from "./paths";
let log4js = require("log4js");

export let DefaultLogger: any;
export class ULogger {
    static init(name = "log", logdir = "."): void {
        log4js.configure({
            appenders: [
                { type: "console", maxLogSize: 20480000 },
                {
                    type: "file",
                    filename: `${logdir}/${name}`,
                    pattern: "-yyyy-MM-dd",
                    category: "alert", maxLogSize: 20480000
                }
            ]
        });
        DefaultLogger = ULogger.console();
    }

    static console(): any {
        return log4js.getLogger();
    }

    static file(): any {
        return log4js.getLogger("alert");
    }
}