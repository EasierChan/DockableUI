"use strict";

import { app, BrowserWindow } from "electron";
import path = require("path");
import { ULoader } from "./base/api/common/base/loader";

let mainWin = null;
const shouldQuit = app.makeSingleInstance((args, pwd) => {
    if (mainWin)
        mainWin.show();
});

if (shouldQuit) {
    app.quit();
}

ULoader.init(__dirname, path.join(__dirname, "default-setting.json"));
import { AppStore } from "./base/api/common/app/appstore";

let tray = null;

app.on("ready", () => {
    console.info(`node: ${process.version}`);
    console.info(`chrome: ${process.versions.chrome}`);
    console.info(`electron: ${process.versions.electron}`);
    console.info(`locale: ${app.getLocale()}`);
    mainWin = AppStore.bootstrap();
});