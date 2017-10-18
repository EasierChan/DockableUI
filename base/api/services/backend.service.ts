"use strict";

declare var electron: Electron.ElectronMainAndRenderer;
import { Injectable } from "@angular/core";
import { UserProfile } from "../model/app.model";

export const os = require("@node/os");
export const path = require("@node/path");
export const fs = require("@node/fs");
export const readline = require("@node/readline");
export const Http = require("@node/http");
export const crypto = require("@node/crypto");

@Injectable()
export class AppStoreService {
    private bLoginTrade: boolean;
    private bLoginQuote: boolean;
    private userinfo: UserProfile;
    loginSuccess: Function;
    loginFailed: Function;

    constructor() {
        this.bLoginTrade = false;
        this.bLoginQuote = false;
        this.userinfo = new UserProfile();
    }

    startApp(name: string, type: string, option: any): boolean {
        return electron.ipcRenderer.sendSync("appstore://startupAnApp", name, type, option);
    }

    unloadApp(name: string): boolean {
        return electron.ipcRenderer.sendSync("appstore://unloadApp", name);
    }

    getUserProfile(): UserProfile {
        return this.userinfo;
    }

    setUserProfile(loginInfo: UserProfile) {
        this.userinfo = loginInfo;
    }

    getSetting(): any {
        return electron.ipcRenderer.sendSync("appstore://get-setting");
    }

    saveSetting(setting) {
        electron.ipcRenderer.send("appstore://save-setting", setting);
    }

    quitAll() {
        electron.ipcRenderer.send("appstore://quit-all");
    }

    onUpdateApp(update: any, context: any) {
        electron.ipcRenderer.removeAllListeners(`appstore://updateApp`);
        electron.ipcRenderer.on(`appstore://updateApp`, (event, params) => { update.call(context, params); });
    }

    isLoginTrade(): boolean {
        return this.bLoginTrade;
    }

    isLoginQuote(): boolean {
        return this.bLoginQuote;
    }

    setLoginTrade(value: boolean) {
        this.bLoginTrade = value;
        if (this.bLoginTrade)
            this.loginSuccess();
        else
            this.loginFailed();
    }

    setLoginQuote(value: boolean) {
        this.bLoginQuote = value;
    }

    static getLocalStorageItem(key: string) {
        return localStorage.getItem(key);
    }

    static setLocalStorageItem(key: string, value: any) {
        localStorage.setItem(key, value);
    }

    static removeLocalStorageItem(key: string) {
        localStorage.removeItem(key);
    }
}

@Injectable()
export class AppStateCheckerRef {
    private option: any;
    onMenuItemClick: (menuitem: any, param?: any) => void;

    constructor() {
        electron.ipcRenderer.on("app://menuitem-click", (e, item, param) => {
            if (this.onMenuItemClick) {
                this.onMenuItemClick(item, param);
            }
        });
    }

    onInit(appref: any, afterInit: (...params) => void) {
        if (appref.apptype) {
            this.option = electron.ipcRenderer.sendSync(`app://${appref.apptype}/init`);
            afterInit.call(appref, this.option);
            return;
        }

        console.error(`apptype is undefined.`);
    }

    saveAs(appref: any, name, option) {
        electron.ipcRenderer.send(`app://${appref.apptype}/init`, { type: "cfg-rename", name: name });
        electron.ipcRenderer.send(`app://${appref.apptype}/init`, { type: "cfg-add", value: option });
    }

    onResize(appref: any, resizeCB: (e?: any) => void) {
        window.onresize = (ev: UIEvent) => {
            resizeCB.call(appref, ev);
        };
    }

    onDestory(appref: any, beforeunload: (e?: any) => void) {
        window.onbeforeunload = (ev: BeforeUnloadEvent) => {
            beforeunload.call(appref, ev);
        };
    }

    addMenuItem(action: number, name: string) {
        electron.ipcRenderer.send("app://menuitem-CRUD", { action: action, name: name });
    }

    changeMenuItemState(name, state, action: number = 2) {
        electron.ipcRenderer.send("app://menuitem-CRUD", { action: action, name: name, state: state });
    }
}

@Injectable()
export class Menu {
    private _menu: any;
    /**
     * @returns an array containing the menu’s items.
     */

    constructor() {
        this._menu = new electron.remote.Menu();
    }

    addItem(menuItem: MenuItem | string, click?: Function, pos?: number): void {
        if (typeof menuItem === "string")
            menuItem = MenuItem.create(menuItem, click);

        if (pos) {
            this._menu.insert(pos, menuItem);
        } else {
            this._menu.append(menuItem);
        }
    }

    get items() {
        return this._menu.items;
    }

    popup(x?: number, y?: number): void {
        this._menu.popup();
    }

    get instance() {
        return this._menu;
    }
}

@Injectable()
export class MenuItem {
    constructor() {
    }

    static create(lable: string, click?: any, type: "normal" | "separator" | "submenu" | "checkbox" | "radio" = "normal", option?: {
        visible: boolean;
        checked: boolean;
    }): any {
        if (option)
            return new electron.remote.MenuItem({ label: lable, type: type, click: click, visible: option.visible, checked: option.checked });
        else
            return new electron.remote.MenuItem({ label: lable, type: type, click: click });
    }

    static createSubmenu(label: string, submenu: Menu) {
        return new electron.remote.MenuItem({ label: label, submenu: submenu.instance });
    }
}

@Injectable()
export class SecuMasterService {
    // TODO
    getSecuinfoByCode(...code: string[]) {
        return electron.ipcRenderer.sendSync("dal://itrade/secumaster/getsecuinfo", { type: 1, data: code });
    }

    getSecuinfoByInnerCode(...innercodes: number[]) {
        return electron.ipcRenderer.sendSync("dal://itrade/secumaster/getsecuinfo", { type: 2, data: innercodes });
    }

    getCodeList(data: string) {
        return electron.ipcRenderer.sendSync("dal://itrade/secumaster/getsecuinfo", { type: 3, data: data });
    }

    getSecuinfoByWindCodes(codes: string[]): any[] {
        return electron.ipcRenderer.sendSync("dal://itrade/secumaster/getsecuinfo", { type: 4, data: codes });
    }

    getSecuinfoByUKey(...ukeys: number[]) {
        return electron.ipcRenderer.sendSync("dal://itrade/secumaster/getsecuinfo", { type: 5, data: ukeys });
    }
}

@Injectable()
export class TranslateService {
    getTranslateInfo(type: number, ...word: string[]) {
        return electron.ipcRenderer.sendSync("dal://itrade/translate/translateinfo", { type: type, data: word });
    }
}
/**
 *
 */
export class MessageBox {

    static show(type: "none" | "info" | "error" | "question" | "warning", title: string, message: string, callback?: (response: number) => void,
        buttons?: string[], defaultId?: number, cancelId?: number) {
        electron.remote.dialog.showMessageBox(electron.remote.BrowserWindow.getFocusedWindow(), {
            type: type,
            buttons: (buttons ? buttons : ["OK"]),
            title: title,
            message: message,
            defaultId: defaultId ? defaultId : null,
            cancelId: cancelId ? cancelId : null
        }, callback);
    }

    static openFileDialog(title: string, cb: (filenames: string[]) => void, filters?: { name: string, extensions: string[] }[]) {
        electron.remote.dialog.showOpenDialog(electron.remote.BrowserWindow.getFocusedWindow(), {
            title: title,
            filters: filters,
            properties: ["openFile"]
        }, cb);
    }
}

export class File {
    public static parseJSON(fpath: string): any {
        if (!fs.existsSync(fpath)) {
            return null;
        }

        let obj;
        try {
            obj = JSON.parse(fs.readFileSync(fpath, { encoding: "utf8" }));
        } catch (e) {
            console.error(`file: ${fpath} failed to parse to JSON！`);
            console.error(e);
            return null;
        }
        return obj;
    }

    public static readLineByLine(fpath: string, cb: (linestr, data?: any) => void, finish: (data?: any) => void, data?: any) {
        const rl = readline.createInterface({
            input: fs.createReadStream(fpath)
        });

        rl.on("line", line => {
            cb(line, data);
        });

        rl.on("close", () => {
            finish(data);
        });
    }

    public static readFileSync(fpath: string) {
        if (fs.existsSync(fpath)) {
            return fs.readFileSync(fpath);
        }

        return null;
    }

    public static writeSync(fpath: string, content: string | Object) {
        if (typeof (content) === "string")
            fs.writeFileSync(fpath, content, { encoding: "utf8" });
        else
            fs.writeFileSync(fpath, JSON.stringify(content), { encoding: "utf8" });
    }

    public static writeAsync(fpath: string, content: string | Object) {
        if (typeof (content) === "string")
            fs.writeFile(fpath, content, { encoding: "utf8" }, (err) => { });
        else
            fs.writeFile(fpath, JSON.stringify(content), { encoding: "utf8" }, (err) => { });
    }

    public static appendAsync(fpath: string, content: string) {
        fs.open(fpath, "a+", (err, fd) => {
            if (err) {
                console.error(err);
                return;
            }

            if (typeof (content) === "string")
                fs.write(fd, content);
            else
                fs.write(fd, JSON.stringify(content));
        });
    }

    public static readdir(fpath: string, callback: (filenames) => void) {
        fs.readdir(fpath, "utf-8", callback);
    }

    public static readdirSync(fpath: string) {
        if (!fs.existsSync(fpath)) {
            return [];
        }

        return fs.readdirSync(fpath, "utf-8");
    }

    public static unlinkSync(fpath: string) {
        if (fs.existsSync(fpath))
            fs.unlinkSync(fpath);
    }
}

export class Environment {
    public static appDataDir: string = electron.remote.app.getPath("appData");

    public static getDataPath(appname: string): string {
        return path.join(Environment.appDataDir, `ChronosApps-TGW/${appname}`);
    }
}

export class Sound {
    static readonly exec = require("@node/child_process").exec;
    /**
     * @param type 0 good, 1 bad;
     */
    static play(type: number) {
        switch (type) {
            case 0:
                Sound.playWav(path.join(__dirname, "/../../sound/good.wav"));
                break;
            case 1:
                Sound.playWav(path.join(__dirname, "/../../sound/bad.wav"));
                break;
            default:
                console.error(`unvalid type => ${type}`);
                break;
        }
    }

    static playWav(fpath: string) {
        Sound.exec("aplay " + fpath, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            console.info(`stdout: ${stdout}`);
        });
    }
}

export class ChildProcess {
    static readonly exec = require("@node/child_process").exec;
    static openUrl(uri: string) {
        if (os.platform() === "linux")
            ChildProcess.exec(`firefox ${uri}`);
        else
            ChildProcess.exec(`cmd /c "C:\\\\Program Files\\\\Internet Explorer\\\\iexplore.exe" ${uri}`); // tslint:disable-line
    }
}

const { tgwapi } = require("../../script/tgwpass");
@Injectable()
export class CryptoService {
    constructor() {
    }

    generateMD5(value: string): string {
        const hash = crypto.createHash("md5");
        hash.update(value);
        return hash.digest("hex");
    }

    getTGWPass(value: string): string {
        return tgwapi.pass(value);
    }
}

export class ULogger {
    static stream = null;
    static info = ULogger.log;
    static error = ULogger.log;
    static warn = ULogger.log;
    static formatStr;

    static init(name = "log", logdir = "."): void {
        let date = new Date();
        ULogger.stream = fs.createWriteStream(path.join(Environment.getDataPath("workbench"), [name, date.format("MM-dd")].join("-")), {
            flags: "a"
        });

        ULogger.formatStr = "yyyy-MM-dd HHmmss.SSS";
    }

    static log(msg: string) {
        let date = new Date();
        if (ULogger.stream)
            ULogger.stream.write(`[${date.format(ULogger.formatStr)}] ${msg}\n`, "utf8");
        else
            console.log(msg);
    }
}

Date.prototype.format = function (format: string): string {
    return format.replace(/(yyyy)|(MM)|(dd)|(HH)|(mm)|(ss)|(SSS)/g, (matchStr) => {
        switch (matchStr) {
            case "yyyy":
                return this.getFullYear().toString();
            case "MM":
                let month = this.getMonth() + 1;
                return month.toString().lpad(2, 0);
            case "dd":
                return this.getDate().toString();
            case "HH":
                return this.getHours().toString();
            case "mm":
                return this.getMinutes().toString();
            case "ss":
                return this.getSeconds().toString().lpad(2, 0);
            case "SSS":
                return this.getMilliseconds().toString().lpad(3, 0);
        }
    });
};

String.prototype.lpad = function (this: String, length: number, value: string): string {
    let primitive = this.valueOf();

    while (primitive.length < length) {
        primitive = value + primitive;
    }

    return primitive;
};