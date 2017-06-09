import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { enableProdMode } from "@angular/core";
import { AppModule } from "./app.module";
enableProdMode();
// const DockManager = require("../../base/script/docklayout-core");

const platform = platformBrowserDynamic();
platform.bootstrapModule(AppModule).then(function(){
    // DockManager.init();
});