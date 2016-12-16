/**
 * manager the windows
 */
import { UWindow, IWindowCreationOptions, WindowStyle } from "../base/window";
import { MenuWindow, MenuPath } from "./windows";

interface Bounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class UWindwManager {
    private _windows: Array<UWindow> = [];
    private _menuWindow: MenuWindow = null;

    constructor() {
    }
    /**
     * add menu window
     */
    addMenuWindow(menuWindow: MenuWindow): void {
        if (!this._menuWindow) {
            this._menuWindow = menuWindow;
            this._menuWindow.onClosed = () => {
                this.closeAll();
            }
            this._windows.push(this._menuWindow);
        }
    }
    /**
     * add content window
     */
    addContentWindow(contentWindow: UWindow) {
        this._windows.push(contentWindow);
    }
    /**
     * @description 添加菜单
     * @param window an instance of UWindow.
     * @param presentName item"s presentation on MenuWindow, it supports 
     * @param fatherPath presentItem attached to.
     */
    addWindowToMenu(window: UWindow, presentItem: string, fatherPath: MenuPath): void {
        this._menuWindow.insertMenu(fatherPath, presentItem, () => {
            window.show();
        });
        this._windows.push(window);
    }
    /**
     * @description 广播消息
     */
    broadcastMessage(message: Object): void {

    }
    /**
     * @description 发消息至某个窗口
     */
    sendMessage(windowItem: Object, message: Object): void {

    }
    /**
     * @description 关闭所有窗口
     */
    closeAll(): void {
        this._windows.forEach(function (window) {
            window.close();
        })
    }
}

