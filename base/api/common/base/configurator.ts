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
	static default: any;
	static appdir: string;
	// private static user: Object;
	// static all: UAppSetting;

	static init(name: string, default_cfg_file: string = ""): void {
		// try {
		UConfig.appdir = path.join(Path.baseDir, name);
		if (!fs.existsSync(UConfig.appdir))
			fs.mkdirSync(UConfig.appdir);

		UConfig.default = JSON.parse(fs.existsSync(default_cfg_file) ? fs.readFileSync(default_cfg_file, "utf-8") : default_cfg_file);
		if (!fs.existsSync(path.join(UConfig.appdir, "default-setting.json"))) {
			fs.writeFileSync(path.join(UConfig.appdir, "default-setting.json"), UConfig.default, { encoding: "utf-8" });
		} else {
			let obj = JSON.parse(stripComments(fs.readFileSync(path.join(UConfig.appdir, "default-setting.json"), "utf-8")));
			UConfig.default = Object.assign(obj, UConfig.default);
		}

		// // DefaultLogger.trace(JSON.stringify(UConfig.default));
		// if (Paths.configration.settings.user !== null) {
		// 	UConfig.user = JSON.parse(stripComments(fs.readFileSync(Paths.configration.settings.user, "utf-8")));
		// 	UConfig.all = _.cloneDeep(UConfig.default);
		// 	_.assign(UConfig.all, UConfig.user);
		// }
		// } catch (err) {
		// 	throw Error("app settings load error!");
		// }
	}

	static saveChanges() {
		fs.writeFile(path.join(UConfig.appdir, "default-setting.json"), JSON.stringify(UConfig.default, null, 2), (err) => {
			if (err) console.error(err.message);
		});
	}

	static reload(name: string): void {
		UConfig.init(name);
	}
}