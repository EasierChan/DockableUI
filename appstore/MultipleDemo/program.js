"use strict";
var platform_browser_dynamic_1 = require("@angular/platform-browser-dynamic");
var SingletonWindow_module_1 = require("./SingletonWindow.module");
var DockManager = require("../../base/script/docklayout-core");
var platform = platform_browser_dynamic_1.platformBrowserDynamic();
platform.bootstrapModule(SingletonWindow_module_1.AppModule).then(function () {
    DockManager.init();
});
//# sourceMappingURL=program.js.map