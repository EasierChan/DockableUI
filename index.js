"use strict";
var electron_1 = require("electron");
var loader_1 = require("./base/api/common/base/loader");
loader_1.ULoader.init();
var appstore_1 = require("./base/api/common/app/appstore");
electron_1.app.on("ready", function () {
    appstore_1.UApplication.bootstrap();
});
//# sourceMappingURL=index.js.map