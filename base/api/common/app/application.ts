/**
 * an app 
 */

import { MenuWindow, ContentWindow } from "./windows";
import { UWindwManager } from "./windowmgr";

export class UApplication {
    _windowMgr: UWindwManager = new UWindwManager();


    public bootstrap(): void {
        let menuWindow: MenuWindow = new MenuWindow({ state: { width: 300, height: 60 } });
        menuWindow.ready().then(function () {
            console.log("when MenuWindow ready say: hello");
        });
        menuWindow.loadURL(__dirname + "/appstore/start/sample.html");
        this._windowMgr.addMenuWindow(menuWindow);

        // let contentWindow: ContentWindow = new ContentWindow();
        // contentWindow.loadURL("sample.html");
        // UWindwManager.addWindowToMenu(contentWindow, "test", { level1: 2 });

        menuWindow.show();
    }


    public quit(): void {
        this._windowMgr.closeAll();
    }
}