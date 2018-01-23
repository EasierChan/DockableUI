/**
 * deal with group Market data.
 */


class DatabaseManager {
    db: IDBDatabase;

    constructor() {
    }

    removeDB(name: string): void {
        indexedDB.deleteDatabase(name);
    }

    openDB(name: string, version: number, tables: Table[]): Promise<any> {
        return new Promise<any>((resolve, reject) => {

            let request = indexedDB.open(name, version);

            request.onsuccess = (ev: any) => {
                this.db = request.result;
                console.info("database init Done.");
                resolve();
            };

            request.onupgradeneeded = (ev_upgrade: any) => {
                this.db = request.result;
                console.info(`database upgrade Done.`);
                tables.forEach(table => {
                    let store: IDBObjectStore;

                    if (table.key)
                        store = this.db.createObjectStore(table.name, { keyPath: table.key });
                    else
                        store = this.db.createObjectStore(table.name, { autoIncrement: true });

                    if (table.indexers) {
                        table.indexers.forEach(indexer => {
                            store.createIndex(indexer.name, indexer.keyPath, { unique: indexer.unique });
                        });
                    }
                });
            };

            request.onerror = (ev: any) => {
                console.error("database open error: " + ev.currentTarget.errorCode);
                reject(ev.currentTarget.errorCode);
            };
        });
    }


    insert(rows: any[], tableName: string) {
        let trans = this.db.transaction(tableName, "readwrite");
        let store = trans.objectStore(tableName);
        let request;

        rows.forEach(item => {
            request = store.put(item);
            request.onerror = (event) => {
                console.error(item);
            };
            request.onsuccess = (event) => {
                // console.info(event);
            };
        });


        trans.oncomplete = (ev) => {
            console.info("finish=>" + Date.now());
        };

        trans.onabort = (ev) => {
            console.error(ev);
        };
    }

    selectByKey(tableName: string, value: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let trans = this.db.transaction(tableName, "readonly");
            let store = trans.objectStore(tableName);
            let request = store.get(value);

            request.onsuccess = (ev: any) => {
                resolve(ev.target.result);
            };

            request.onerror = (event) => {
                reject(event.error);
            };
        });
    }

    selectByIndexer(tableName: string, indexer: Indexer, value: any | any[]): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let trans = this.db.transaction(tableName, "readonly");
            let store = trans.objectStore(tableName);
            let index = store.index(indexer.name);
            let request = index.openCursor(value);
            let tempArr = [];

            request.onsuccess = (ev: any) => {
                let cursor: IDBCursorWithValue = ev.target.result;

                if (cursor) {
                    tempArr.push(cursor.value);
                    cursor.continue();
                }
            };

            request.transaction.oncomplete = (ev: any) => {
                resolve(tempArr);
                tempArr = null;
            };

            request.onerror = (event) => {
                reject(event.error);
            };
        });
    }

    delete(tableName: string, indexer: Indexer, value): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let trans = this.db.transaction(tableName, "readwrite");
            let store = trans.objectStore(tableName);
            let index = store.index(indexer.name);
            let request = index.openKeyCursor(IDBKeyRange.upperBound(value));

            request.onsuccess = (ev: any) => {
                let cursor: IDBCursor = ev.target.result;
                console.info(cursor);
                if (cursor) {
                    store.delete(cursor.primaryKey);
                    cursor.continue();
                }
            };

            request.transaction.oncomplete = () => {
                resolve();
            };

            request.onerror = (event) => {
                reject(event.error);
            };
        });
    }
}

class Table {
    name: string;
    key: string;
    indexers?: Indexer[];
}

class Indexer {
    name: string;
    keyPath: string | string[];
    unique?: boolean;
}


(function () {
    "use strict";
    const DB_NAME = "chronos-tickData";
    const DB_VERSION = 2;
    let localDB = new DatabaseManager();
    let table = new Table();
    table.name = "tick";
    table.indexers = [{
        name: "ukeytime",
        keyPath: ["k", "t"],
        unique: false
    }, {
        name: "ukey",
        keyPath: "k",
        unique: false
    }, {
        name: "time",
        keyPath: "t",
        unique: false
    }];

    // 
    let util = {
        EPS: 0.01,
        isEqual: (a: number, b: number): boolean => {
            return (Math.abs(a - b) < util.EPS);
        },

        isLager: (a: number, b: number): boolean => {
            return !((a - b) < util.EPS);
        }
    };

    let groups: any[];
    onmessage = (ev: MessageEvent) => {
        switch (ev.data.type) {
            case "init-db":
                localDB.removeDB(DB_NAME);
                localDB.openDB(DB_NAME, DB_VERSION, [table]);
                break;
            case "init":
                groups = [];
                ev.data.groups.forEach(group => {
                    let newItem = {
                        key: group.ukey,
                        ukeys: [],
                        lastIdx: {},
                        items: {},
                        lastestIdx: 0,
                        min: Infinity,
                        max: -Infinity,
                        askPrice1: 0,
                        bidPrice1: 0,
                        last: 0
                    };

                    for (let prop in group.items) {
                        newItem.ukeys.push(group.items[prop].ukey);
                        newItem.items[group.items[prop].ukey] = { count: parseInt(group.items[prop].count), replace_amount: parseInt(group.items[prop].replace_amount) };

                        newItem.bidPrice1 += newItem.items[group.items[prop].ukey].replace_amount;
                        newItem.askPrice1 += newItem.items[group.items[prop].ukey].replace_amount;
                        newItem.last += newItem.items[group.items[prop].ukey].replace_amount;
                    };

                    groups.push(newItem);
                });
                // console.info(groups);
                break;
            case "add-md":
                let ukey = ev.data.value.ukey;
                // localDB.insert([{
                //     ap: ev.data.value.ask_price,
                //     bp: ev.data.value.bid_price,
                //     t: ev.data.value.time,
                //     p: ev.data.value.last,
                //     k: ukey
                // }], table.name);

                for (let i = 0; i < groups.length; ++i) {
                    if (groups[i].ukeys.includes(ukey)) {
                        if (Math.max(ev.data.value.ask_price[0], ev.data.value.bid_price[0], ev.data.value.last) < 0.01) {
                            postMessage({
                                type: "log-error", value: JSON.stringify(ev.data.value)
                            });

                            ev.data.value.ask_price[0]
                                = ev.data.value.bid_price[0]
                                = ev.data.value.last
                                = groups[i].items[ukey].replace_amount / groups[i].items[ukey].count;
                        }

                        groups[i].items[ukey][ev.data.value.time] = {
                            askPrice1: util.isEqual(ev.data.value.ask_price[0], 0)
                                ? (util.isLager(ev.data.value.bid_price[0], 0) ? ev.data.value.bid_price[0] : ev.data.value.last)
                                : ev.data.value.ask_price[0],
                            bidPrice1: util.isEqual(ev.data.value.bid_price[0], 0)
                                ? (util.isLager(ev.data.value.ask_price[0], 0) ? ev.data.value.ask_price[0] : ev.data.value.last)
                                : ev.data.value.bid_price[0],
                            last: ev.data.value.last
                        };

                        if (groups[i].lastIdx.hasOwnProperty(ukey)) {
                            groups[i].askPrice1 += groups[i].items[ukey].count * (groups[i].items[ukey][ev.data.value.time].askPrice1 - groups[i].items[ukey][groups[i].lastIdx[ukey]].askPrice1);
                            groups[i].bidPrice1 += groups[i].items[ukey].count * (groups[i].items[ukey][ev.data.value.time].bidPrice1 - groups[i].items[ukey][groups[i].lastIdx[ukey]].bidPrice1);
                            groups[i].last += groups[i].items[ukey].count * (groups[i].items[ukey][ev.data.value.time].last - groups[i].items[ukey][groups[i].lastIdx[ukey]].last);
                        } else {
                            groups[i].askPrice1 += groups[i].items[ukey].count * groups[i].items[ukey][ev.data.value.time].askPrice1 - groups[i].items[ukey].replace_amount;
                            groups[i].bidPrice1 += groups[i].items[ukey].count * groups[i].items[ukey][ev.data.value.time].bidPrice1 - groups[i].items[ukey].replace_amount;
                            groups[i].last += groups[i].items[ukey].count * groups[i].items[ukey][ev.data.value.time].last - groups[i].items[ukey].replace_amount;
                        }

                        groups[i].lastIdx[ukey] = ev.data.value.time;

                        postMessage({
                            type: "group-md", value: {
                                ukey: groups[i].key, time: ev.data.value.time,
                                ask_price: [groups[i].askPrice1], bid_price: [groups[i].bidPrice1], last: groups[i].last
                            }
                        });
                        break;
                    }
                }
                break;
            case "add-md-list":
                console.info("item begin=>", Date.now());
                // ev.data.value.forEach(item => {
                localDB.insert(ev.data.value, table.name);
                // });
                break;
            case "get-md":
                localDB.selectByIndexer(table.name, table.indexers[2], IDBKeyRange.upperBound(""));
                break;
            default:
                break;
        }
    };
})();
