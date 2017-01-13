/**
 * chenlei 2017/01/11
 */

"use strict";

import { MongoClient, Db, Collection } from "mongodb";
import { EventEmitter } from "events";
import { DefaultLogger } from "../../common/base/logger";
import { IApp, UserProfile } from "../../model/app.model";
/**
 * access database file.
 * Event: 'error', 'connect', 'authorize', 'userprofile' 
 */
export class UserDal extends EventEmitter {
    private static _db: Db;
    constructor(url = "mongodb://172.24.13.5:27016/itrade", bReset = false) {
        super();
    }

    init(url = "mongodb://172.24.13.5:27016/itrade", bReset = false): void {
        let self = this;
        if (bReset === false && UserDal._db)
            return;
        // Use connect method to connect to the server
        MongoClient.connect(url, (err, db) => {
            if (err) {
                DefaultLogger.error(err);
                self.emit("error", err);
                return;
            }

            UserDal._db = db;
            // dbuser:dbpasswd
            UserDal._db.authenticate("itrade", "itrade", (err2, res2) => {
                if (err2) {
                    self.emit("error", err2);
                    return;
                }
                self.emit("connect");
            });
        });
    }

    authorize(username: string, password: string): void {
        if (UserDal._db === null) {
            this.emit("error", "need a db instance.");
            return;
        }

        let self = this;
        const userprofiles: Collection = UserDal._db.collection("users");
        userprofiles.count({ name: username, password: password }, (err, nRet) => {
            if (err) {
                DefaultLogger.error(err);
                self.emit("error", err);
                return;
            }

            if (nRet > 0)
                self.emit("authorize", true);
            else
                self.emit("authorize", false);
        });
    }

    getUserProfile(username: string): void {
        let self = this;
        const userprofiles: Collection = UserDal._db.collection("users");
        userprofiles.find({ name: username }, null, 0, 1, 1000).next((err, result) => {
            if (err) {
                self.emit("error", err);
                return;
            }
            self.emit("userprofile", result);
        });
    }
}
