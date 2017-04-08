/**
 * chenlei 20160901 
 */
"use strict";

import { Path } from "./paths";
import fs = require("fs");
import path = require("path");
import _ = require("lodash");

interface UAppSetting {
	front_addr: string;
	front_port: number;
	heartbeat: number;
	recvwnd_size: number;
}

function stripComments(content) {
	let regexp = /("(?:[^\\\"]*(?:\\.)?)*")|('(?:[^\\\']*(?:\\.)?)*')|(\/\*(?:\r?\n|.)*?\*\/)|(\/{2,}.*?(?:(?:\r?\n)|$))/g;
	let result = content.replace(regexp, function (match, m1, m2, m3, m4) {
		// Only one of m1, m2, m3, m4 matches
		if (m3) {
			// A block comment. Replace with nothing
			return "";
		}
		else if (m4) {
			// A line comment. If it ends in \r?\n then keep it.
			let length_1 = m4.length;
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
	private static default: Object;
	// private static user: Object;
	// static all: UAppSetting;

	static init(name: string): void {
		try {
			let appdir = path.join(Path.baseDir, name);
			if (!fs.existsSync(appdir))
				fs.mkdirSync(appdir);

			if (!fs.existsSync(path.join(appdir, "default.json")))
				fs.writeFileSync(path.join(appdir, "default.json"), "", { encoding: "utf-8" });

			UConfig.default = JSON.parse(stripComments(fs.readFileSync(path.join(appdir, "default.json"), "utf-8")));
			// // DefaultLogger.trace(JSON.stringify(UConfig.default));
			// if (Paths.configration.settings.user !== null) {
			// 	UConfig.user = JSON.parse(stripComments(fs.readFileSync(Paths.configration.settings.user, "utf-8")));
			// 	UConfig.all = _.cloneDeep(UConfig.default);
			// 	_.assign(UConfig.all, UConfig.user);
			// }
		} catch (err) {
			throw Error("app settings load error!");
		}
	}

	static reload(name: string): void {
		UConfig.init(name);
	}
}