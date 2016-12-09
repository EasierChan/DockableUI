/**
 *
 */
'use strict';
var logger_1 = require('./logger');
var configurator_1 = require('./configurator');
var ULoader = (function () {
    function ULoader() {
    }
    ULoader.init = function () {
        // init logger
        logger_1.ULogger.init();
        logger_1.DefaultLogger.info('Program environment initialize...');
        // init configuration
        configurator_1.UConfig.init();
    };
    return ULoader;
}());
exports.ULoader = ULoader;
//# sourceMappingURL=loader.js.map