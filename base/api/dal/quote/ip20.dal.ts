"use strict";

import { IP20Service } from "../../services/ip20.worker";
import * as WebSocket from "ws";
import * as _ from "lodash";

export class QuoteDal {
    quotePoint = new IP20Service();
    quoteHeart = null;
    topicMap = {};
    wsServer: WebSocket.Server;
    clients: any[];
    kwlist: number[];

    constructor() {
        this.clients = [];
        this.kwlist = [];
        this.registerListeners();
    }

    start(port, host) {
        this.wsServer = new WebSocket.Server({ port: 10068 });
        this.wsServer.on("connection", (client: any, req) => {
            this.clients.push(client);

            client.on("message", (ukeyList) => {
                client.ukeys = _.union(client.ukes || [], ukeyList);
                this.kwlist = _.union(this.kwlist, ukeyList);
                this.quotePoint.send(17, 101, { topic: 3112, kwlist: this.kwlist });
            });
        });

        this.quotePoint.connect(port, host);
    }

    registerListeners() {
        this.quotePoint.onConnect = () => {
            loginTGW(this.quotePoint);
        };

        this.quotePoint.onClose = () => {
            this.quotePoint = null;
            if (this.quoteHeart !== null) {
                clearInterval(this.quoteHeart);
                this.quoteHeart = null;
            }
        };

        this.quotePoint.addSlot(
            {
                appid: 17,
                packid: 43,
                callback: (msg) => {
                    if (this.quoteHeart !== null) {
                        clearInterval(this.quoteHeart);
                        this.quoteHeart = null;
                    }

                    this.quoteHeart = setInterval(() => {
                        this.quotePoint.send(17, 0, {});
                    }, 60000);
                }
            },
            {
                appid: 17,
                packid: 120,
                callback: (msg) => {
                    // logger.info(`tgw ans=>${msg}`);
                }
            }, {
                appid: 17,
                packid: 110,
                callback: (msg) => {
                    this.publish(msg.content.ukey, msg.content);
                }
            }
        );
    }

    publish(ukey: number, content: any) {
        this.clients.forEach(client => {
            if (client.ukeys && client.ukeys.includes(ukey)) client.send(content);
        });
    }
}

function loginTGW(ip20: IP20Service) {
    let timestamp: Date = new Date();
    let stimestamp = timestamp.getFullYear() + ("0" + (timestamp.getMonth() + 1)).slice(-2) +
        ("0" + timestamp.getDate()).slice(-2) + ("0" + timestamp.getHours()).slice(-2) + ("0" + timestamp.getMinutes()).slice(-2) +
        ("0" + timestamp.getSeconds()).slice(-2) + ("0" + timestamp.getMilliseconds()).slice(-2);

    ip20.send(17, 41, { "cellid": "1", "userid": "8.999", "password": "*32C5A4C0E3733FA7CC2555663E6DB6A5A6FB7F0EDECAC9704A503124C34AA88B", "termid": "12.345", "conlvl": 1, "clientesn": "", "clienttm": stimestamp });
}

let dal = new QuoteDal();
let [host, port] = process.argv[2].split(":");
dal.start(parseInt(port), host);