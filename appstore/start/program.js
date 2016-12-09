"use strict";
var platform_browser_dynamic_1 = require('@angular/platform-browser-dynamic');
var app_module_1 = require('./app.module');
var DockManager = require('../../base/third/docklayout-core');
var platform = platform_browser_dynamic_1.platformBrowserDynamic();
platform.bootstrapModule(app_module_1.AppModule).then(function () {
    DockManager.init();
});
//# sourceMappingURL=program.js.map