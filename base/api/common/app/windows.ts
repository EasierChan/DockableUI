/**
 * 
 */
import { DefaultLogger } from "../base/logger";
import { UWindow, IWindowCreationOptions, WindowStyle } from "../base/window";
import { Menu } from "electron";

export interface Bound {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface MenuPath {
    level1: number;
    level2?: number;
    // level3?: number;
}

// MenuWindow 
export class MenuWindow extends UWindow {
    private _defaultTemplate: Array<Object>;

    constructor(config?: IWindowCreationOptions) {
        if (config) {
            config.state.wStyle = WindowStyle.System;
            config.menuTemplate = [
                {
                    label: "文件",
                    submenu: [
                        {
                            label: "退出",
                            click: (e) => {
                                this.close();
                            }
                        }
                    ]
                },
                {
                    label: "查看"
                },
                {
                    label: "窗口"
                },
                {
                    label: "帮助"
                }
            ];
        }
        // 修改最小高度
        UWindow.MIN_HEIGHT = 30;
        super(config);
        this._defaultTemplate = config.menuTemplate;
        this.build();
    }

    public insertMenu(pos: MenuPath, name: string, clickCallback: () => void): void {
        if (pos.level1 >= this._defaultTemplate.length || pos.level1 < 0) {
            DefaultLogger.error("菜单设置不合法！");
            return;
        }

        let menuItem = {
            label: name,
            click: clickCallback
        };

        if (!this._defaultTemplate[pos.level1].hasOwnProperty("submenu"))
            this._defaultTemplate[pos.level1]["submenu"] = [];

        if (pos.level2 == null) {
            this._defaultTemplate[pos.level1]["submenu"].push(menuItem);
            this.setMenu(this._defaultTemplate);
            return;
        }

        if (pos.level2 < 0 || pos.level2 >= this._defaultTemplate[pos.level1]["submenu"].length) {
            DefaultLogger.error("菜单设置不合法！");
            return;
        }

        if (pos.level2 && !this._defaultTemplate[pos.level2].hasOwnProperty("submenu"))
            this._defaultTemplate[pos.level1]["submenu"][pos.level2]["submenu"] = [];

        this._defaultTemplate[pos.level1]["submenu"][pos.level2]["submenu"].push(menuItem);
        this.setMenu(this._defaultTemplate);
    }
}

export class MultiWindow extends UWindow {
    _windows: UWindow[] = [];
    constructor(config?: IWindowCreationOptions) {
        super(config);
    }

    show(): void {
        let newWin = new UWindow(this.options);
        this._windows.push(newWin);
        newWin.show();
        newWin = null;
    }

    close(): void {
        this._windows.forEach((child) => {
            child.close();
        });
        super.close();
    }
}

export class ContentWindow extends UWindow {
    constructor(config?: IWindowCreationOptions) {
        super(config);
    }
}

export class ModalWindow extends UWindow {
    constructor(config: IWindowCreationOptions, owner: any) {
        super(config, owner, true);
    }
}

export class SingletonWindow extends UWindow {
    constructor(config?: IWindowCreationOptions) {
        super(config);
        this.win.on("close", (e) => {
            e.preventDefault();
            this.win.hide();
        });
    }

    show(): UWindow {
        this.win.show();
        return this;
    }

    // close(): void {
    //     this.win.hide();
    // }
}

