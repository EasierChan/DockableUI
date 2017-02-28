"use strict";

import { app } from "electron";
import { ULoader } from "./base/api/common/base/loader";

ULoader.init();
import { AppStore } from "./base/api/common/app/appstore";

let tray = null;
app.on("ready", () => {
    console.info(`node: ${process.version}`);
    console.info(`chrome: ${process.versions.chrome}`);
    console.info(`electron: ${process.versions.electron}`);
    AppStore.bootstrap();
});