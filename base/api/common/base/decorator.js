/**
 * chenlei 2016/0909
 */
"use strict";
exports.sealed = function (constructor) {
    Object.seal(constructor);
    Object.seal(constructor.prototype);
};
//# sourceMappingURL=decorator.js.map