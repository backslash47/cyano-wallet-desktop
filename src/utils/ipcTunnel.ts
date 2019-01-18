import { v4 as uuid } from 'uuid';
import { Deferred } from './deffered';

interface Sender {
  send(channel: string, ...args: any[]): void;
}

interface Receiver {
  on(event: string, listener: Function): this;
}

interface Request {
  id: string;

  payload: any;
}

interface Response {
  id: string;
  response: any;
}

type MessageHandler = (payload: any) => any;

export interface TunnelOptions {
  receiver: Receiver;
  sender: Sender;
  messageHandler?: MessageHandler;
  logMessages?: boolean;
}

export class IpcTunnel {
  sender: Sender;

  callbacks: Map<string, Deferred<any>>;

  messageHandler?: MessageHandler;
  logMessages?: boolean;

  constructor(options: TunnelOptions) {
    this.sender = options.sender;
    this.messageHandler = options.messageHandler;
    this.logMessages = options.logMessages;

    this.callbacks = new Map();

    options.receiver.on('cmd', this.onRequest.bind(this));
    options.receiver.on('res', this.onResponse.bind(this));
  }

  send(payload: any) {
    const id = uuid();

    const callback = new Deferred<any>();
    this.callbacks.set(id, callback);

    const request = { id, payload } as Request;

    if (this.logMessages) {
      // tslint:disable-next-line:max-line-length
      // tslint:disable-next-line:no-console
      console.warn(`Tunnel: Sending`, JSON.stringify(request, null, '  '));
    }

    this.sender.send('cmd', request);

    return callback.promise;
  }

  private async onRequest(event: any, request: Request) {
    const { id, payload } = request;

    if (this.messageHandler === undefined) {
      throw new Error('MessageHandler was not specified.');
    }

    if (this.logMessages) {
      // tslint:disable-next-line:max-line-length
      // tslint:disable-next-line:no-console
      console.warn(`Tunnel: Receiving`, JSON.stringify(request, null, '  '));
    }

    const response = await Promise.resolve(this.messageHandler(payload));

    this.sender.send('res', { id, response } as Response);
  }

  private onResponse(event: any, payload: Response) {
    const { id, response } = payload;

    const callback = this.callbacks.get(id);

    if (callback !== undefined) {
      this.callbacks.delete(id);

      callback.resolve(response);
    } else {
      console.warn(`Tunnel: Unknown response received`, JSON.stringify(response, null, '  '));
    }
  }
}
