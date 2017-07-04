/**
 * createWorker
 */
"use strict";

const fork = require("@node/child_process").fork;

class UWorker {
    child: any;
    onData: Function;

    constructor(private pscript: string, logdir: string) {
        this.child = fork(this.pscript, [logdir]);
        this.child.on("message", (m, sock) => {
            if (this.onData) {
                this.onData(m);
            }
        });
    }

    send(msg: any) {
        this.child.send(msg);
    }


    dispose() {
        this.child.kill();
    }
}

export class WorkerFactory {
    // static createIP20Worker() {
    //     return new UWorker(`${__dirname}/ip20.worker.js`, "");
    // }

    // static createQTPWorker() {
    //     try {
    //         return new UWorker(`${__dirname}/qtp.worker.js`, "");
    //     } catch (err) {
    //         console.info(err);
    //     }
    // }

    static createWorker(url: string, logdir: string) {
        if (!url.endsWith(".js"))
            url += ".js";
        return new UWorker(url, logdir);
    }
}