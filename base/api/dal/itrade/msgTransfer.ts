"use strict";
import { MsgType } from "../../model/itrade/message.model";

export class MessageTranfer {
    /**
     * type in message body
     */
    static GetMsg(buffer: Buffer): IMessage {
        let msg = null;
        if (buffer) {
            let type = buffer.readInt32LE(0);
            msg = MessageMapper.instance.getMsg(type);
        }
        return msg;
    }
}

export class MessageMapper {
    private static _instance: MessageMapper;
    private _mapperMsg: Object;

    static get instance(): MessageMapper {
        if (!MessageMapper._instance) {
            MessageMapper._instance = new MessageMapper();
        }
        return MessageMapper._instance;
    }

    constructor() {
    }

    getMsg(type: number): IMessage {
        return null;
    }
}

export class IMessage {

}