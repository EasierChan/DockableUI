"use strict";

import { app, BrowserWindow } from "electron";
import { ULoader } from "./base/api/common/base/loader";

ULoader.init();
import { AppStore } from "./base/api/common/app/appstore";

let tray = null;
app.on("ready", () => {
    console.info(`node: ${process.version}`);
    console.info(`chrome: ${process.versions.chrome}`);
    console.info(`electron: ${process.versions.electron}`);
    console.info(`locale: ${app.getLocale()}`);
    AppStore.bootstrap();
});