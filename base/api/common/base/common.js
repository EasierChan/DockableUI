/**
 *
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var paths = require("path");
var _typeof = {
    number: "number",
    string: "string",
    undefined: "undefined",
    object: "object",
    function: "function"
};
/**
 * @returns whether the provided parameter is a JavaScript Array or not.
 */
function isArray(array) {
    if (Array.isArray) {
        return Array.isArray(array);
    }
    if (array && typeof (array.length) === _typeof.number && array.constructor === Array) {
        return true;
    }
    return false;
}
exports.isArray = isArray;
/**
 * @returns whether the provided parameter is a JavaScript String or not.
 */
function isString(str) {
    if (typeof (str) === _typeof.string || str instanceof String) {
        return true;
    }
    return false;
}
exports.isString = isString;
/**
 * @returns whether the provided parameter is a JavaScript Array and each element in the array is a string.
 */
function isStringArray(value) {
    return isArray(value) && value.every(function (elem) { return isString(elem); });
}
exports.isStringArray = isStringArray;
/**
 *
 * @returns whether the provided parameter is of type `object` but **not**
 *	`null`, an `array`, a `regexp`, nor a `date`.
 */
function isObject(obj) {
    // The method can"t do a type cast since there are type (like strings) which
    // are subclasses of any put not positvely matched by the function. Hence type
    // narrowing results in wrong results.
    return typeof obj === _typeof.object
        && obj !== null
        && !Array.isArray(obj)
        && !(obj instanceof RegExp)
        && !(obj instanceof Date);
}
exports.isObject = isObject;
/**
 * In **contrast** to just checking `typeof` this will return `false` for `NaN`.
 * @returns whether the provided parameter is a JavaScript Number or not.
 */
function isNumber(obj) {
    if ((typeof (obj) === _typeof.number || obj instanceof Number) && !isNaN(obj)) {
        return true;
    }
    return false;
}
exports.isNumber = isNumber;
/**
 * @returns whether the provided parameter is a JavaScript Boolean or not.
 */
function isBoolean(obj) {
    return obj === true || obj === false;
}
exports.isBoolean = isBoolean;
/**
 * @returns whether the provided parameter is undefined.
 */
function isUndefined(obj) {
    return typeof (obj) === _typeof.undefined;
}
exports.isUndefined = isUndefined;
/**
 * @returns whether the provided parameter is undefined or null.
 */
function isUndefinedOrNull(obj) {
    return isUndefined(obj) || obj === null;
}
exports.isUndefinedOrNull = isUndefinedOrNull;
function mkdirp(path, mode, callback) {
    fs.exists(path, function (exists) {
        if (exists) {
            return isDirectory(path, function (err, itIs) {
                if (err) {
                    return callback(err);
                }
                if (!itIs) {
                    return callback(new Error(path + " is not a directory."));
                }
                callback(null);
            });
        }
        mkdirp(paths.dirname(path), mode, function (err) {
            if (err) {
                callback(err);
                return;
            }
            if (mode) {
                fs.mkdir(path, mode, function (error) {
                    if (error) {
                        return callback(error);
                    }
                    fs.chmod(path, mode, callback); // we need to explicitly chmod because of https://github.com/nodejs/node/issues/1104
                });
            }
            else {
                fs.mkdir(path, null, callback);
            }
        });
    });
}
exports.mkdirp = mkdirp;
function isDirectory(path, callback) {
    fs.stat(path, function (error, stat) {
        if (error) {
            return callback(error);
        }
        callback(null, stat.isDirectory());
    });
}
//# sourceMappingURL=common.js.map