"use strict";
var electron_1 = require("electron");
var loader_1 = require("./base/api/common/base/loader");
loader_1.ULoader.init();
var appstore_1 = require("./base/api/common/app/appstore");
var tray = null;
electron_1.app.on("ready", function () {
    console.info("node: " + process.version);
    console.info("chrome: " + process.versions.chrome);
    console.info("electron: " + process.versions.electron);
    appstore_1.AppStore.bootstrap();
});
//# sourceMappingURL=index.js.map