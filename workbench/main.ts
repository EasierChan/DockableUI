import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { AppModule } from "./appmodule";

// enableProdMode();
let platform = platformBrowserDynamic();

platform.bootstrapModule(AppModule);