/**
 * base Resolver, you should create a subclass extended it.
 */

export interface IResolver {
    onConnected(arg: any): void;
    onError(err: any): void;
    onData(data: any): void;
    onEnd(arg: any): void;
    onClose(arg: any): void;
}