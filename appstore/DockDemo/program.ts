import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app.module";

const DockManager = require("../../base/script/docklayout-core");

const platform = platformBrowserDynamic();
platform.bootstrapModule(AppModule).then(function(){
    DockManager.init();
});