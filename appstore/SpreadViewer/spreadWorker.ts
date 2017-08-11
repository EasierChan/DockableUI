/**
 * deal with spread calculator
 */
(function() {
    "use strict";

    const DB_NAME = "chronos-tickData";
    let DB_VERSION = 1;
    let DB_STORE_NAME = "tickData";
    let ukeys = [];
    let offset: number[];
    let firstItemTime: number = null;
    let caches = {};
    let limitMax = 10;

    onmessage = (ev: MessageEvent) => {
        let db: IDBDatabase;
        let request: IDBOpenDBRequest;
        let get_request: IDBRequest;
        let transaction: IDBTransaction;
        let store: IDBObjectStore;
        let data: number[];

        switch (ev.data.type) {
            case "init":
                ukeys = ev.data.legs;
                ukeys.forEach(ukey => {
                    caches[ukey] = { last: null, values: [] };
                });
                indexedDB.deleteDatabase(DB_NAME);
                request = indexedDB.open(DB_NAME, DB_VERSION) as IDBOpenDBRequest;
                request.onsuccess = (ev: any) => {
                    db = ev.currentTarget.result;
                    console.info(`tickData DB Init Done.`);
                };

                request.onupgradeneeded = (event: any) => {
                    if (db) db = null;
                    db = event.currentTarget.result;
                    ev.data.legs.forEach(leg => {
                        store = db.createObjectStore(leg, { keyPath: "time" });
                        console.info(`createObjectStore ${leg}`);
                    });

                    console.info(`tickData DB upgrade Done.`);
                };

                request.onerror = (ev: any) => {
                    console.error("Database open error: " + ev.currentTarget.errorCode);
                };

                offset = ev.data.offset;
                break;
            case "get":
                if (caches[ukeys[0]].last === null || caches[ukeys[1]].last === null)
                    return;

                data = [];
                data.length = 4;
                if (ev.data.time <= caches[ukeys[0]].last && ev.data.time <= caches[ukeys[1]].last) {
                    data[2] = caches[ukeys[0]].values[0];
                    data[3] = caches[ukeys[1]].values[0];
                    calc(data, 2);
                } else if (ev.data.time > caches[ukeys[0]].last && ev.data.time > caches[ukeys[1]].last) {
                    if ((caches[ukeys[0]].last - ev.data.time > limitMax) || (caches[ukeys[1]].last - ev.data.time) > limitMax)
                        return;

                    data[2] = caches[ukeys[0]].values[0];
                    data[3] = caches[ukeys[1]].values[0];
                    calc(data, 0);
                } else if (ev.data.time > caches[ukeys[0]].last) {
                    if (caches[ukeys[0]].last - ev.data.time > limitMax)
                        return;

                    data[2] = caches[ukeys[0]].values[0];
                    data[3] = caches[ukeys[1]].values[0];
                    calc(data, 1);
                } else {
                    if (caches[ukeys[1]].last - ev.data.time > limitMax)
                        return;

                    data[2] = caches[ukeys[0]].values[0];
                    data[3] = caches[ukeys[1]].values[0];
                    calc(data, 1);
                }
                // get from IDB
                // indexedDB.open(DB_NAME, DB_VERSION).onsuccess = (event: any) => {
                //     data = [];
                //     data.length = 4;
                //     transaction = event.currentTarget.result.transaction(ukeys, "readonly");
                //     get_request = transaction.objectStore(ukeys[0]).get(ev.data.time);

                //     get_request.onerror = (ev_err) => {
                //         console.info("Database get error: ");
                //     };

                //     get_request.onsuccess = (ev_suc: any) => {
                //         data[2] = ev_suc.target.result;

                //         if (data[2] && data[3]) {
                //             calc(data, ev.origin);
                //         }
                //     };

                //     get_request = transaction.objectStore(ukeys[1]).get(ev.data.time);

                //     get_request.onerror = (ev_err) => {
                //         console.info("Database get error: ");
                //     };

                //     get_request.onsuccess = (ev_suc: any) => {
                //         data[3] = ev_suc.target.result;

                //         if (data[2] && data[3]) {
                //             calc(data, ev.origin);
                //         }
                //     };
                // };
                break;
            case "add":
                if (caches[ev.data.ukey].values.length > 20)
                    caches[ev.data.ukey].values.pop();

                caches[ev.data.ukey].last = ev.data.value.time;
                caches[ev.data.ukey].values.unshift(ev.data.value);

                if (firstItemTime === null)
                    firstItemTime = ev.data.value.time;

                indexedDB.open(DB_NAME, DB_VERSION).onsuccess = (event: any) => {
                    if ((event.currentTarget.result as IDBDatabase).objectStoreNames.contains(ev.data.ukey)) {
                        transaction = event.currentTarget.result.transaction(ev.data.ukey, "readwrite");
                        store = transaction.objectStore(ev.data.ukey);
                        store.add(ev.data.value).onsuccess = (ev_store) => {
                            console.info("Insert successfullly.");
                        };
                    } else {
                        indexedDB.open(DB_NAME, ++DB_VERSION).onupgradeneeded = (ev_upgrade: any) => {
                            db = ev_upgrade.currentTarget.result;
                            store = ev_upgrade.currentTarget.result.createObjectStore(ev.data.ukey, { keyPath: "time" });
                            console.info(`createObjectStore ${ev.data.ukey}`);
                            store.transaction.oncomplete = (ev_store) => {
                                let tmp = db.transaction(ev.data.ukey, "readwrite").objectStore(ev.data.ukey);
                                tmp.add(ev.data.value).onsuccess = (ev_tmp) => {
                                    console.info("Insert successfullly.");
                                };
                            };
                            console.info(`tickData DB upgrade Done.`);
                        };
                    }
                };
                break;
            case "del":
                indexedDB.open(DB_NAME, DB_VERSION).onsuccess = (event: any) => {
                    transaction = event.currentTarget.result.transaction(ev.data.ukey, "readwrite");
                    store = transaction.objectStore(ev.data.ukey);
                    store.delete(ev.data.time).onsuccess = (ev_store) => {
                        console.info("Insert successfullly.");
                    };
                };
                break;
        }
    };

    function calc(data, type) {
        console.info(type);
        let index = data[3].time - firstItemTime + offset[0];
        let time = data[3].time;
        data[0] = (data[3].ask_price[0] - data[2].bid_price[0]) / 10000; // tslint:disable-line
        data[1] = (data[3].bid_price[0] - data[2].ask_price[0]) / 10000; // tslint:disable-line
        data[2] = data[2].last / 10000; // tslint:disable-line
        data[3] = data[3].last / 10000; // tslint:disable-line
        postMessage({ index: index, time: time, value: data, type: type });

        // switch (type) {
        //     case 0:

        //         break;
        //     case 1:

        //         break;
        //     case 2:
        //         break;
        //     default:
        //         break;
        // }
    }
})();
