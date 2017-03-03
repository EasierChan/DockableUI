"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var platform_browser_dynamic_1 = require("@angular/platform-browser-dynamic");
var app_module_1 = require("./app.module");
// enableProdMode();
var DockManager = require("../../base/script/docklayout-core");
var platform = platform_browser_dynamic_1.platformBrowserDynamic();
platform.bootstrapModule(app_module_1.AppModule).then(function () {
    DockManager.init();
});
//# sourceMappingURL=program.js.map