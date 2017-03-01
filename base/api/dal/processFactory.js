"use strict";
var child_process_1 = require("child_process");
var Process = (function () {
    function Process() {
    }
    Process.start = function (modulePath) {
        return child_process_1.fork(modulePath, null, {});
    };
    return Process;
}());
exports.Process = Process;
//# sourceMappingURL=processFactory.js.map