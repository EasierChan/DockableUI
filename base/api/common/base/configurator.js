/**
 * chenlei 20160901
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var paths_1 = require("./paths");
var fs = require("fs");
var _ = require("lodash");
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
var UConfig = (function () {
    function UConfig() {
    }
    UConfig.init = function () {
        try {
            UConfig.default = JSON.parse(stripComments(fs.readFileSync(paths_1.Paths.configration.settings.default, "utf-8")));
            // DefaultLogger.trace(JSON.stringify(UConfig.default));
            if (paths_1.Paths.configration.settings.user !== null) {
                UConfig.user = JSON.parse(stripComments(fs.readFileSync(paths_1.Paths.configration.settings.user, "utf-8")));
                UConfig.all = _.cloneDeep(UConfig.default);
                _.assign(UConfig.all, UConfig.user);
            }
        }
        catch (err) {
            console.error("app settings load error!");
            throw Error("app settings load error!");
        }
    };
    UConfig.reload = function () {
        UConfig.init();
    };
    return UConfig;
}());
exports.UConfig = UConfig;
//# sourceMappingURL=configurator.js.map