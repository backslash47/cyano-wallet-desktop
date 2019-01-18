import { IpcTunnel, TunnelOptions } from './ipcTunnel';

export type MethodType = (...params: any[]) => any;

interface MethodCallType {
  method: string;
  params: any[];
}

export class Rpc {
  private tunnel: IpcTunnel;
  private methods: Map<string, MethodType>;

  constructor(options: TunnelOptions) {
    options.messageHandler = this.messageHandler.bind(this);

    this.tunnel = new IpcTunnel(options);
    this.methods = new Map();
  }

  call<RESULT = any>(method: string, ...params: any[]) {
    const msg = {
      method,
      params,
    };

    return this.tunnel.send(msg) as Promise<RESULT>;
  }

  register(name: string, method: MethodType) {
    this.methods.set(name, method);
  }

  private messageHandler(msg: MethodCallType) {
    const method = this.methods.get(msg.method);

    if (method === undefined) {
      throw new Error('Unregistered method call: ' + msg.method);
    }

    return method.call(null, ...msg.params);
  }
}
