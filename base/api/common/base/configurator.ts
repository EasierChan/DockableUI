/**
 * chenlei 20160901 
 */
"use strict";

import {Paths} from "./paths";
import fs = require("fs");
import _ = require("lodash");
import {DefaultLogger} from "./logger";

interface UAppSetting {
    front_addr  :   string;
    front_port  :   number;
    heartbeat   :   number;
    recvwnd_size:   number;
}

function stripComments(content) {
	var regexp = /("(?:[^\\\"]*(?:\\.)?)*")|('(?:[^\\\']*(?:\\.)?)*')|(\/\*(?:\r?\n|.)*?\*\/)|(\/{2,}.*?(?:(?:\r?\n)|$))/g;
	var result = content.replace(regexp, function (match, m1, m2, m3, m4) {
		// Only one of m1, m2, m3, m4 matches
		if (m3) {
			// A block comment. Replace with nothing
			return "";
		}
		else if (m4) {
			// A line comment. If it ends in \r?\n then keep it.
			var length_1 = m4.length;
			if (length_1 > 2 && m4[length_1 - 1] === "\n") {
				return m4[length_1 - 2] === "\r" ? "\r\n" : "\n";
			}
			else {
				return "";
			}
		}
		else {
			// We match a string
			return match;
		}
	});
	return result;
}

export class UConfig {
    static default: UAppSetting;
    static user: UAppSetting;

    static init(): void {
        try {
            UConfig.default = JSON.parse(stripComments(fs.readFileSync(Paths.configration.settings.default, "utf-8")));
            // DefaultLogger.trace(JSON.stringify(UConfig.default));
            if (Paths.configration.settings.user !== null) {
                UConfig.user = _.cloneDeep(UConfig.default);
                _.assign(UConfig.user, JSON.parse(stripComments(fs.readFileSync(Paths.configration.settings.user, "utf-8"))));
            }
        } catch(err){
            DefaultLogger.error("app settings load error!");
            throw Error("app settings load error!");
        }
    }

    static reload(): void {
        UConfig.init();
    }
}