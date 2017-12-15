/**
 * date 2017/6/21
 * desc
 */
"use strict";

import path = require("path");

export class Sound {
    static readonly exec = require("child_process").exec;
    static readonly kInterval: number = 2000;
    static lastTime: number = 0;
    /**
     * @param type 0 good, 1 bad;
     */
    static play(type: number) {
        if (Date.now() - Sound.lastTime < Sound.kInterval) {
            return;
        }

        Sound.lastTime = Date.now();

        switch (type) {
            case 0:
                Sound.playWav(path.join(path.dirname(process.execPath), "sound/good.wav"));
                break;
            case 1:
                Sound.playWav(path.join(path.dirname(process.execPath), "sound/bad.wav"));
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