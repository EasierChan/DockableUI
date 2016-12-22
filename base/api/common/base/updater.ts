/**
 * autoupdater
 */

import path = require("path");
import os = require("os");
import fs = require("fs");
import { mkdirp } from "./common";

interface IUpdate {
    url: string;
    name: string;
    releaseNote?: string;
    version: string;
    productVersion: string;
    hash: string;
}

export class UAutoUpdaterImpl {
    private url: string;
    private currentRequest: Promise<void>;

    setFeedURL(url: string): void {
        this.url = url;
    }

    get cachePath(): Promise<string> {
        const result = path.join(os.tmpdir(), "universalui-update");
        return new Promise<string>((c, e) => mkdirp(result, null, err => err ? e(err) : c(result)));
    }

    checkForUpdates(): void {
        if (!this.url) {
            throw new Error("No feed url set");
        }


    }
}