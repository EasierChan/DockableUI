import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';
import * as DockManager from 'controls/dockmanager';

const platform = platformBrowserDynamic();
platform.bootstrapModule(AppModule).then(function(){
    DockManager.init();
});