import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { AppModule } from "./ui/app.module";

// enableProdMode();
let platform = platformBrowserDynamic();

platform.bootstrapModule(AppModule);