/**
 * chenlei 2017/04/27
 */
"use strict";

import { TcpClient } from "../browser/tcpclient";
import { Parser } from "../browser/parser";
import { Pool } from "../browser/pool";
import { Header, QTPMessage, QtpMessageOption, FGS_MSG, OptionType, ServiceType } from "../model/qtp/message.model";
import { Injectable } from "@angular/core";

const logger = console;

class QTPParser extends Parser {
    private _curHeader: Header = null;
    constructor(_oPool: Pool<Buffer>) {
        super(_oPool);
    }

    processRead(): void {
        while (this.processMsgHeader() && this.processMsg()) {
            this._curHeader = null;

            if (this._oPool.length === 0)
                break;

            logger.info(`pool length: ${this._oPool.length}`);
        }
    }
    /**
     * process message head.
     */
    processMsgHeader(): boolean {
        if (this._oPool.length === 0)
            return false;

        if (this._curHeader !== null) {
            logger.warn(`curHeader: ${JSON.stringify(this._curHeader)}, poolLen=${this._oPool.length}`);
            return true;
        }

        let ret = false;
        let bufCount = 0;
        let buflen = 0;
        let restLen = 0;
        let peekBuf = null;

        for (; bufCount < this._oPool.length; ++bufCount) {
            peekBuf = this._oPool.peek(bufCount + 1);
            buflen += peekBuf[bufCount].byteLength;
            if (buflen >= Header.len) {
                this._curHeader = new Header();
                this._curHeader.fromBuffer(bufCount >= 1 ? Buffer.concat(peekBuf, buflen) : peekBuf[0], 0);
                ret = true;
                break;
            }
        }

        restLen = null;
        buflen = null;
        bufCount = null;
        return ret;
    }
    /**
     * process msg body
     */
    processMsg(): boolean {
        let ret = false;
        let bufCount = 0;
        let buflen = 0;
        let restLen = 0;
        let peekBuf = null;

        for (; bufCount < this._oPool.length; ++bufCount) {
            peekBuf = this._oPool.peek(bufCount + 1);
            buflen += peekBuf[bufCount].byteLength;

            if (buflen >= this._curHeader.datalen + Header.len) {
                let tempBuffer = Buffer.concat(this._oPool.remove(bufCount + 1), buflen);
                console.info(`processMsg: service=${this._curHeader.service}, msgtype=${this._curHeader.msgtype}, msglen=${this._curHeader.datalen}`);
                try {
                    this.emit(this._curHeader.service.toString(), this._curHeader, tempBuffer);
                } catch (err) {
                    console.error(err);
                } finally {
                    restLen = buflen - Header.len - this._curHeader.datalen - this._curHeader.optslen;
                    if (restLen > 0) {
                        let restBuf = Buffer.alloc(restLen);
                        tempBuffer.copy(restBuf, 0, buflen - restLen);
                        this._oPool.prepend(restBuf);
                        restBuf = null;
                        logger.warn(`restLen=${restLen}, tempBuffer=${tempBuffer.length}`);
                    }

                    this._curHeader = null;
                    tempBuffer = null;
                    ret = true;
                    break;
                }

            }
        }

        restLen = null;
        buflen = null;
        bufCount = null;
        return ret;
    }
}

class QTPMessageParser extends QTPParser {
    private _intervalRead: NodeJS.Timer;
    constructor(private _client: TcpClient) {
        super(_client.bufferQueue);
        this.init();
    }

    init(): void {
        this._intervalRead = setInterval(() => {
            this.processRead();
        }, 500);
    }

    processQtpMsg(args: any[]): void {
        let [header, all] = args;
        let msg: QTPMessage = new QTPMessage();
        msg.header = header;
        msg.fromBuffer(all, Header.len);
        this._client.emit("data", msg);
    }

    dispose(): void {
        if (this._intervalRead || this._intervalRead !== null) {
            clearInterval(this._intervalRead);
        }
        super.dispose();
    }
}

class QTPClient extends TcpClient {
    private _intervalHeart: NodeJS.Timer;
    private _parsers: QTPMessageParser[] = [];
    constructor() {
        super();
    }

    addParser(parser: any): void {
        this._parsers.push(parser);
    }

    sendMessage(msg: QTPMessage): void {
        this.send(msg.toBuffer());
    }

    sendHeartBeat(appid: number, interval = 10): void {
        let header: Header = new Header();
        header.msgtype = 255;
        header.optslen = 0;
        header.datalen = 0;
        this._intervalHeart = setInterval(() => {
            this.send(header.toBuffer());
        }, interval * 1000);
    }

    dispose(): void {
        if (this._intervalHeart !== null) {
            clearInterval(this._intervalHeart);
            this._intervalHeart = null;
        }
        this._parsers.forEach(parser => {
            parser.dispose();
        });
        super.dispose();
    }
}

@Injectable()
export class QtpService {
    private _client: QTPClient;
    private _messageMap: Object;
    private _topicMap: Object;
    private _cmsMap: Object;
    private _timer: any;
    private _port: number;
    private _host: string;
    private _parser: QTPMessageParser;

    constructor() {
        this._messageMap = {};
        this._topicMap = {};
        this._cmsMap = {};
        this._client = new QTPClient();
        this._client.useSelfBuffer = true;
        this._parser = new QTPMessageParser(this._client);
        this._client.addParser(this._parser);
        let self = this;

        this._client.on("data", msgarr => {
            let msg = msgarr[0] as QTPMessage;

            if (msg.header.service === ServiceType.kFGS && msg.header.msgtype === FGS_MSG.kPublish) {
                console.info(`topic: ${msg.header.topic}`);

                for (let i = 0; i < msg.options.length; ++i) {
                    if (msg.options[i].id === OptionType.kSubscribeKey) {
                        let key = msg.options[i].value.readIntLE(0, 8);
                        if (self._topicMap[msg.header.topic].context)
                            self._topicMap[msg.header.topic].callback.call(self._topicMap[msg.header.topic].context, key, msg.body);
                        else
                            self._topicMap[msg.header.topic].callback(key, msg.body);

                        break;
                    }
                }

                return;
            }

            if (self._messageMap.hasOwnProperty(msg.header.service) && self._messageMap[msg.header.service].hasOwnProperty(msg.header.msgtype)) {
                if (self._messageMap[msg.header.service][msg.header.msgtype].context)
                    self._messageMap[msg.header.service][msg.header.msgtype].callback.call(self._messageMap[msg.header.service][msg.header.msgtype].context, msg.body, msg.options);
                else
                    self._messageMap[msg.header.service][msg.header.msgtype].callback(msg.body, msg.options);
            }
            else
                console.warn(`unknown message appid = ${msg.header.service}`);
        });
        this._client.on("close", () => {
            console.info("remote closed");

            if (this._timer) {
                clearTimeout(this._timer);
                this._timer = null;
            }

            this._timer = setTimeout(() => {
                this._client.connect(this._port, this._host);
            }, 10000);

            if (this.onClose)
                this.onClose();
        });

        this._client.on("connect", () => {
            if (this._timer) {
                clearTimeout(this._timer);
                this._timer = null;
            }

            if (this.onConnect)
                this.onConnect();
        });
    };

    connect(port, host = "127.0.0.1") {
        this._port = port;
        this._host = host;

        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }
        this._client.connect(port, host);
    }

    send(msgtype: number, body: string | Buffer, service?: number, topic?: number) {
        let msg = new QTPMessage();
        msg.header.msgtype = msgtype;

        if (service) msg.header.service = service;

        if (topic) msg.header.topic = topic;

        msg.body = body;
        this._client.sendMessage(msg);
    }

    sendWithOption(msgtype: number, options: QtpMessageOption[], body: string | Buffer, service?: number, topic?: number) {
        let msg = new QTPMessage();
        msg.header.msgtype = msgtype;
        options.forEach(option => {
            msg.addOption(option);
        });

        if (service) msg.header.service = service;

        if (topic) msg.header.topic = topic;

        msg.body = body;
        this._client.sendMessage(msg);
    }

    subscribe(topic: number, keys: number[]): void {
        let msg = new QTPMessage();
        msg.header.msgtype = FGS_MSG.kSubscribe;
        msg.header.topic = topic;

        let optCount = new QtpMessageOption();
        optCount.id = OptionType.kItemCnt;
        optCount.value = Buffer.alloc(4, 0);
        optCount.value.writeUInt32LE(keys.length, 0);
        msg.addOption(optCount);

        let optSize = new QtpMessageOption();
        optSize.id = OptionType.kItemSize;
        optSize.value = Buffer.alloc(4, 0);
        optSize.value.writeUInt32LE(8, 0);
        msg.addOption(optSize);

        msg.body = Buffer.alloc(keys.length * 8);
        let offset = 0;
        keys.forEach(key => {
            (msg.body as Buffer).writeIntLE(key, offset, 8);
            offset += 8;
        });

        this._client.sendMessage(msg);
    }

    onTopic(topic, callback: Function, context?: any) {
        this._topicMap[topic] = { callback: callback, context: context };
    }
    /**
     *
     */
    addSlot(...slots: Slot[]) {
        slots.forEach(slot => {
            if (!this._messageMap.hasOwnProperty(slot.service)) {
                this._messageMap[slot.service] = new Object();
                this._parser.registerMsgFunction(slot.service, this._parser, this._parser.processQtpMsg);
            }

            this._messageMap[slot.service][slot.msgtype] = {
                callback: slot.callback,
                context: slot.context
            };
        });
    }

    sendToCMS(recActor: string, body: string | Buffer) {
        let recOpt: QtpMessageOption = new QtpMessageOption();
        recOpt.id = 12;
        recOpt.value = Buffer.from(recActor);

        let reqOpt: QtpMessageOption = new QtpMessageOption();
        reqOpt.id = 14;
        reqOpt.value = Buffer.alloc(4, 0);
        reqOpt.value.writeInt32LE(1, 0);

        let sendOpt: QtpMessageOption = new QtpMessageOption();
        sendOpt.id = 13;
        sendOpt.value = Buffer.from(recActor);

        this.sendWithOption(12, [recOpt, reqOpt, sendOpt], body, ServiceType.kCMS);
    }

    addSlotOfCMS(name: string, cb: Function, context: any) {
        this._cmsMap[name] = { callback: cb, context: context };

        this.addSlot({
            service: ServiceType.kCMS,
            msgtype: 12,
            callback: (body, options: QtpMessageOption[]) => {
                for (let i = 0; i < options.length; ++i) {
                    if (options[i].id === 12) {
                        this._cmsMap[options[i].value.toString()].callback.call(context, body);
                        break;
                    }
                }

            }
        });
    }

    onConnect: Function;
    onClose: Function;
}

export interface Slot {
    service: number;
    msgtype: number;
    callback: Function;
    context?: any;
}
