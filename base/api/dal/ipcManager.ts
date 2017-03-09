/**
 * date: 2017/03/09, created by cl
 * desc: manage the ipc channels
 * 
 */
import { ipcMain } from "electron";
import * as fs from "fs";
import * as path from "path";

export class IPCManager {
    private static _channelsMap: Object = new Object();

    static start() {
        fs.readdirSync(`${__dirname}/itrade`).forEach(modelName => {
            if (modelName.endsWith("Dal.js")) {
                require(`${__dirname}/itrade/${modelName}`);
            }
        });
    }

    static register(channel: string, cb: Electron.IpcMainEventListener) {
        if (!(IPCManager._channelsMap.hasOwnProperty(channel) && IPCManager._channelsMap[channel] === cb)) {
            IPCManager._channelsMap[channel] = cb;
            ipcMain.on(channel, cb);
            // console.info(`add channel ${channel}`);
        }
    }

    static list(): string[] {
        return ipcMain.eventNames() as string[];
    }

    static destroy() {
        ipcMain.removeAllListeners();
    }
}

