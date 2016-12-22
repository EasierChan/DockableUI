/**
 * 
 */
"use strict";

import fs = require("fs");
import paths = require("path");

export interface TValueCallback<T> {
	(value: T): void;
}

const _typeof = {
	number: "number",
	string: "string",
	undefined: "undefined",
	object: "object",
	function: "function"
};

/**
 * @returns whether the provided parameter is a JavaScript Array or not.
 */
export function isArray(array: any): array is any[] {
	if (Array.isArray) {
		return Array.isArray(array);
	}

	if (array && typeof (array.length) === _typeof.number && array.constructor === Array) {
		return true;
	}

	return false;
}

/**
 * @returns whether the provided parameter is a JavaScript String or not.
 */
export function isString(str: any): str is string {
	if (typeof (str) === _typeof.string || str instanceof String) {
		return true;
	}

	return false;
}

/**
 * @returns whether the provided parameter is a JavaScript Array and each element in the array is a string.
 */
export function isStringArray(value: any): value is string[] {
	return isArray(value) && (<any[]>value).every(elem => isString(elem));
}

/**
 *
 * @returns whether the provided parameter is of type `object` but **not**
 *	`null`, an `array`, a `regexp`, nor a `date`.
 */
export function isObject(obj: any): boolean {
	// The method can"t do a type cast since there are type (like strings) which
	// are subclasses of any put not positvely matched by the function. Hence type
	// narrowing results in wrong results.
	return typeof obj === _typeof.object
		&& obj !== null
		&& !Array.isArray(obj)
		&& !(obj instanceof RegExp)
		&& !(obj instanceof Date);
}

/**
 * In **contrast** to just checking `typeof` this will return `false` for `NaN`.
 * @returns whether the provided parameter is a JavaScript Number or not.
 */
export function isNumber(obj: any): obj is number {
	if ((typeof (obj) === _typeof.number || obj instanceof Number) && !isNaN(obj)) {
		return true;
	}

	return false;
}

/**
 * @returns whether the provided parameter is a JavaScript Boolean or not.
 */
export function isBoolean(obj: any): obj is boolean {
	return obj === true || obj === false;
}

/**
 * @returns whether the provided parameter is undefined.
 */
export function isUndefined(obj: any): boolean {
	return typeof (obj) === _typeof.undefined;
}

/**
 * @returns whether the provided parameter is undefined or null.
 */
export function isUndefinedOrNull(obj: any): boolean {
	return isUndefined(obj) || obj === null;
}

export function mkdirp(path: string, mode: number, callback: (error: Error) => void): void {
	fs.exists(path, (exists) => {
		if (exists) {
			return isDirectory(path, (err: Error, itIs?: boolean) => {
				if (err) {
					return callback(err);
				}

				if (!itIs) {
					return callback(new Error(path + " is not a directory."));
				}

				callback(null);
			});
		}

		mkdirp(paths.dirname(path), mode, (err: Error) => {
			if (err) { callback(err); return; }

			if (mode) {
				fs.mkdir(path, mode, (error) => {
					if (error) {
						return callback(error);
					}

					fs.chmod(path, mode, callback); // we need to explicitly chmod because of https://github.com/nodejs/node/issues/1104
				});
			} else {
				fs.mkdir(path, null, callback);
			}
		});
	});
}

function isDirectory(path: string, callback: (error: Error, isDirectory?: boolean) => void): void {
	fs.stat(path, (error, stat) => {
		if (error) { return callback(error); }

		callback(null, stat.isDirectory());
	});
}