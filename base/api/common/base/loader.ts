/**
 * date 2017/02/17 cl
 * 
 */
"use strict";
import { ULogger, DefaultLogger } from "./logger";
import { UConfig } from "./configurator";
import * from "../../dal/ipcManager";

export class ULoader {
    static init(): void {
        // init logger
        ULogger.init();
        DefaultLogger.info("Program environment initialize...");
        // init configuration
        UConfig.init();
    }
}