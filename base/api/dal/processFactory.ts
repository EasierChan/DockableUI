import { fork, ChildProcess } from "child_process";

export class Process {
    static start(modulePath): ChildProcess {
        return fork(modulePath, null, {
        });
    }
}