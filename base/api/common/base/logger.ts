/**
 * EasierChan 2016-08-31
 */
'use strict';

import { Paths } from './paths';
var log4js = require('log4js');

export var DefaultLogger: any;
export class ULogger {
    static init(): void {
        log4js.configure({
            appenders: [
                { type: 'console', maxLogSize:20480 },
                { type: 'file',
                 filename: Paths.configration.logDir + '/alert.log',
                  pattern: "-yyyy-MM-dd",
                   category: 'alert', maxLogSize:20480 }
            ]
        });
        DefaultLogger = ULogger.console();
    }

    static console(): any {
        return log4js.getLogger();
    }

    static alert(): any {
        return log4js.getLogger('alert');
    }
}