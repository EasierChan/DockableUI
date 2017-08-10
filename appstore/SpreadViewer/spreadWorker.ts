/**
 * deal with spread calculator
 */
"use strict";

let database = "marketdata";

onmessage = (ev: MessageEvent) => {
    let request = indexedDB.open(database);
    request.onsuccess = (ev: Event) => {
        // let db = ev.target.result;
    };

    console.info(ev.data);
};
