"use strict";
import { ipcRenderer } from "electron";
declare var electron: Electron.ElectronMainAndRenderer;
export class TranslateService {
    static getTranslateInfo(type: number, ...word: string[]) {
        return electron.ipcRenderer.sendSync("dal://itrade/translate/translateinfo", { type: type, data: word });
    }
}