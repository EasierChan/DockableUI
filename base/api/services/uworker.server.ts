/**
 * do sth in a single process.
 */
"use strict";

const fork = require("@node/child_process").fork;

export class UWorker {
    private child;
    onData: Function;

    constructor(private pscript: string) {
        this.child = fork(this.pscript);
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
        this.child.disconnect();
    }
}