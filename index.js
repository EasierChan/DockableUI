"use strict";
var electron_1 = require('electron');
electron_1.app.on('ready', function () {
    var win = new electron_1.BrowserWindow({
        autoHideMenuBar: true
    });
    win.loadURL(__dirname + '/index.html');
    win.show();
});
electron_1.app.on('window-all-closed', function () {
    electron_1.app.quit();
});
//# sourceMappingURL=index.js.map