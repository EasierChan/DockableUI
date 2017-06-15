"use strict";

import { QTPFactory } from "../../base/api/services/qtp.worker";
import { DefaultLogger } from "../../base/api/common/base/logger";
const logger = console;

let resultMap = {};
process.on("message", (m: Pack, sock) => {

    switch (m.command) {
        case "start":
            QTPFactory.instance.addSlot(
                {
                    msgtype: 8013,
                    callback: msg => {
                        console.info(msg);
                        // let row = table.newRow();
                    },
                    context: this
                },
                {
                    msgtype: 8015,
                    callback: msg => {
                        process.send({ event: "data", content: { type: 8015, data: msg } });
                    },
                    context: this
                },
                {
                    msgtype: 8017,
                    callback: msg => {
                        if (msg.packidx === 1) {
                            resultMap[msg.nId] = {};
                            resultMap[msg.nId].details = msg.orderdetails;
                        }
                        else
                            resultMap[msg.nId].details = resultMap[msg.nId].details.concat(msg.orderdetails);
                    },
                    context: this
                }
            );
            QTPFactory.instance.connect(m.params.port, m.params.host);
            break;
        case "stop":
            break;
        case "send":
            logger.info(m.params);
            QTPFactory.instance.send(m.params.type, m.params.data); // pnl
            break;
        case "query":
            if (resultMap.hasOwnProperty(m.params.id)) {
                process.send({ event: "data", content: { type: 8017, nId: m.params.id, data: resultMap[m.params.id].details.slice(m.params.begin, m.params.end) } });
            }
            break;
        default:
            logger.info(`unvalid command => ${m.command}`);
            break;
    }
});

interface Pack {
    command: string;
    params: any;
}