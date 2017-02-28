import { IResolver } from "../common/base/resolver";
import { TcpClient } from "../common/base/client";
import { DefaultLogger } from "../common/base/logger";

/**
 * QtpMessageClient
 */
export class SimpleClient extends TcpClient {
    public constructor(resolver: IResolver) {
        super(resolver);
    }

    send(data: any): void {
        DefaultLogger.debug(data);
        // TODO custom protocol to encode data.
        let header = Buffer.alloc(12, 0);
        header.writeUInt16LE(data.msgtype, 2);
        let total = header;
        if (data) {
            let content = Buffer.from(JSON.stringify(data));
            header.writeUInt32LE(content.length, 8);
            total = Buffer.concat([header, content], header.length + content.length);
            // 释放资源
            content = null;
        }
        // send the encoded data.
        super.send(total);
        total = null;
        header = null;
    }

    onReceived(data: any): void {
        // TODO deal the json Object Data.
        DefaultLogger.info(data);
    }
}