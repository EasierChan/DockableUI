/**
 * deal with group Market data.
 */
(function () {
    "use strict";

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
                        bidPrice1: 0
                    };

                    for (let prop in group.items) {
                        newItem.ukeys.push(group.items[prop].ukey);
                        newItem.items[group.items[prop].ukey] = { count: parseInt(group.items[prop].count) };
                    };

                    groups.push(newItem);
                });

                // console.info(groups);
                break;
            case "add-md":
                for (let i = 0; i < groups.length; ++i) {
                    if (groups[i].ukeys.includes(ev.data.value.ukey)) {
                        groups[i].items[ev.data.value.ukey][ev.data.value.time] = {
                            askPrice1: ev.data.value.ask_price[0],
                            bidPrice1: ev.data.value.bid_price[0],
                            last: ev.data.value.last
                        };

                        groups[i].lastIdx[ev.data.value.ukey] = ev.data.value.time;

                        if (Object.getOwnPropertyNames(groups[i].lastIdx).length === groups[i].ukeys.length) {
                            // post this group's md
                            let bidPrice1 = 0;
                            let askPrice1 = 0;
                            let last = 0;
                            groups[i].min = groups[i].max;
                            groups[i].ukeys.forEach(ukey => {
                                if (groups[i].lastIdx[ukey] < groups[i].min)
                                    groups[i].min = groups[i].lastIdx[ukey];
                                if (groups[i].lastIdx[ukey] > groups[i].max)
                                    groups[i].max = groups[i].lastIdx[ukey];

                                bidPrice1 += groups[i].items[ukey].count * groups[i].items[ukey][groups[i].lastIdx[ukey]].bidPrice1;
                                askPrice1 += groups[i].items[ukey].count * groups[i].items[ukey][groups[i].lastIdx[ukey]].askPrice1;
                                last += groups[i].items[ukey].count * groups[i].items[ukey][groups[i].lastIdx[ukey]].last;
                            });

                            if (groups[i].lastestIdx === 0) {
                                groups[i].lastestIdx = groups[i].max;

                                postMessage({
                                    type: "group-md", value: {
                                        ukey: groups[i].key, time: groups[i].lastestIdx,
                                        ask_price: [askPrice1], bid_price: [bidPrice1], last: last
                                    }
                                });
                            } else if (groups[i].min > groups[i].lastestIdx) {
                                groups[i].lastestIdx = groups[i].min;

                                postMessage({
                                    type: "group-md", value: {
                                        ukey: groups[i].key, time: groups[i].min,
                                        ask_price: [askPrice1], bid_price: [bidPrice1], last: last
                                    }
                                });
                            }
                        } else {
                            groups[i].ukeys.forEach(ukey => {
                                if (!groups[i].lastIdx.hasOwnProperty(ukey)) {
                                    console.warn(`lost ${ukey} Market data.`);
                                }
                            });
                        }
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
})();