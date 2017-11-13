/**
 * deal with group Market data.
 */
(function () {
    "use strict";
    const DB_NAME = "chronos-tickData";
    const DB_VERSION = 1;
    const DB_STORE_NAME = "tickData";

    let groups: any[];
    onmessage = (ev: MessageEvent) => {
        switch (ev.data.type) {
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
                            askPrice1: ev.data.value.ask_price[0] < 0.01
                                ? (ev.data.value.bid_price[0] > 0 ? ev.data.value.bid_price[0] : ev.data.value.last)
                                : ev.data.value.ask_price[0],
                            bidPrice1: ev.data.value.bid_price[0] < 0.01
                                ? (ev.data.value.ask_price[0] > 0 ? ev.data.value.ask_price[0] : ev.data.value.last)
                                : ev.data.value.bid_price[0],
                            last: ev.data.value.last
                        };

                        if (groups[i].lastIdx.hasOwnProperty(ukey)) {
                            groups[i].askPrice1 += groups[i].items[ukey].count * (ev.data.value.ask_price[0] - groups[i].items[ukey][groups[i].lastIdx[ukey]].askPrice1);
                            groups[i].bidPrice1 += groups[i].items[ukey].count * (ev.data.value.bid_price[0] - groups[i].items[ukey][groups[i].lastIdx[ukey]].bidPrice1);
                            groups[i].last += groups[i].items[ukey].count * (ev.data.value.last - groups[i].items[ukey][groups[i].lastIdx[ukey]].last);
                        } else {
                            groups[i].askPrice1 += groups[i].items[ukey].count * ev.data.value.ask_price[0] - groups[i].items[ukey].replace_amount;
                            groups[i].bidPrice1 += groups[i].items[ukey].count * ev.data.value.bid_price[0] - groups[i].items[ukey].replace_amount;
                            groups[i].last += groups[i].items[ukey].count * ev.data.value.last - groups[i].items[ukey].replace_amount;
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
            default:
                break;
        }
    };

    class AxisPoint {
        time: number;
        index: number;
        duration: number;
    }

    class DatabaseManager {

        db: IDBDatabase;
        request: IDBOpenDBRequest;
        get_request: IDBRequest;
        transaction: IDBTransaction;
        store: IDBObjectStore;

        removeDB(name: string): void {
            indexedDB.deleteDatabase(name);
        }

        openDB(name: string, version?: number): void {
            let request = indexedDB.open(name, version);
            request.onsuccess = (ev: any) => {
                this.db = ev.currentTarget.result;
                console.info(`${name} database init Done.`);
            };

            request.onupgradeneeded = (ev: any) => {
                if (this.db) this.db = null;
                this.db = ev.currentTarget.result;
                ev.data.legs.forEach(leg => {
                    this.store = this.db.createObjectStore(leg, { keyPath: "time" });
                    console.info(`createObjectStore ${leg}`);
                });

                console.info(`${name} database upgrade Done.`);
            };

            request.onerror = (ev: any) => {
                console.error("${name} database open error: " + ev.currentTarget.errorCode);
            };
        }
    }
})();