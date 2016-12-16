"use strict";

import { app } from "electron";
import { ULoader } from "./base/api/common/base/loader";

ULoader.init();
import { UApplication } from "./base/api/common/app/appstore";

app.on("ready", () => {
    UApplication.bootstrap();
});