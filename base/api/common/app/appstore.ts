/**
 * app store manager the apps.
 */
'use strict';

import fs = require('fs');
import { ContentWindow } from './windows';
import { UWindwManager } from './windowmgr';
import '../../dal/itrade/priceDal';

export class UApplication {
    private static _appstoreHome: string = __dirname + '/../../../../appstore/';
    private static _windows: Object = {};
    private static readonly _workbench: string = "workbench";

    public static initStore(userApps: Array<string>): void {
        fs.readdir(this._appstoreHome, (err, files) => {
            files.forEach(curfile => {
                fs.stat(this._appstoreHome + curfile, (err, stat) => {
                    if (stat.isDirectory() && fs.existsSync(this._appstoreHome + curfile + '/index.html')) {
                        if (userApps.indexOf(curfile) >= 0 || userApps[0] == '*')
                            this._windows[curfile] = new ContentWindow();
                    }
                });
            });
        });
    }

    public static startupAnApp(name: string) {
        if (this._windows.hasOwnProperty(name)) {
            this._windows[name].loadURL(this._appstoreHome + name + '/index.html');
            this._windows[name].show();
        }
    }

    public static bootstrap(): void {
        let contentWindow: ContentWindow = new ContentWindow();
        contentWindow.loadURL(this._appstoreHome + '../workbench' + '/index.html');
        this._windows[this._workbench] = contentWindow;
        contentWindow.show();
    }

    public static quit(): void {
        this._windows[this._workbench].close();
    }
}