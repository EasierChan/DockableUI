/**
 * chenlei 2017/01/11
 */

// "use strict";

// import { MongoClient, Db, Collection } from "mongodb";
// import { EventEmitter } from "events";
// import { DefaultLogger } from "../../common/base/logger";
// import { IApp, UserProfile } from "../../model/app.model";
// /**
//  * access database file.
//  * Event: 'error', 'connect', 'authorize', 'userprofile' 
//  */
// export class UserDal extends EventEmitter {
//     private static _db: Db;
//     private static _bConnected: boolean;
//     constructor(url = "mongodb://172.24.13.5:27016/itrade", bReset = false) {
//         super();
//         this.init();
//     }

//     init(url = "mongodb://172.24.13.5:27016/itrade", bReset = false): void {
//         let self = this;
//         if (bReset === false && UserDal._db && UserDal._bConnected) {
//             this.emit("connect");
//             return;
//         }
//         // Use connect method to connect to the server
//         MongoClient.connect(url, (err, db) => {
//             if (err) {
//                 DefaultLogger.error(err.message);
//                 self.emit("error", err);
//                 return;
//             }

//             UserDal._db = db;
//             // dbuser:dbpasswd
//             UserDal._db.authenticate("itrade", "itrade", (err2, res2) => {
//                 if (err2) {
//                     self.emit("error", err2);
//                     return;
//                 }
//                 self.emit("connect");
//                 UserDal._bConnected = true;
//             });
//         });
//     }

//     getUserProfile(username: string, password: string): void {
//         let self = this;
//         this.on("connect", () => {
//             const userprofiles: Collection = UserDal._db.collection("users");
//             userprofiles.find({ name: username, password: password }, null, 0, 1, 1000).next((err, result) => {
//                 if (err) {
//                     self.emit("error", err);
//                     return;
//                 }
//                 self.emit("userprofile", result);
//             });
//         });
//         this.init();
//     }
// }
