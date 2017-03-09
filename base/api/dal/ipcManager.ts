/**
 * date: 2017/03/09, created by cl
 * desc: manage the ipc channels
 * 
 */
import { ipcMain } from "electron";

export class IPCManager {
    private static _channelsMap: Object = new Object();

    static start() {
        Object.entries(IPCManager._channelsMap).forEach(pair => {
            ipcMain.on(pair[0], pair[1]);
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

