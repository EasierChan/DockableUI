/**
 * 
 */
"use strict";
import {ULogger, DefaultLogger} from "./logger";
import {UConfig} from "./configurator";

export class ULoader {
    static init(): void {
        // init logger
        ULogger.init();
        DefaultLogger.info("Program environment initialize...");
        // init configuration
        UConfig.init();
    }
}