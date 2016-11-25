import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';
import DockManager = require('controls/dockmanager');

const platform = platformBrowserDynamic();
platform.bootstrapModule(AppModule).then(function(){
    DockManager.init();
});