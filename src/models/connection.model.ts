import type { ServerWebSocket } from "bun";
import { Memory } from "../server/memory";

export class ConnectionModel {
  constructor(ws: ServerWebSocket, id: number, inGame: boolean = false) {
    this.ws = ws;
    this.id = id;
    this.active = true;
    this.inGame = inGame;
  }

  public ws: ServerWebSocket;
  public id: number;
  public active: boolean;
  public inGame?: boolean;

  public copyWith(modifyObject: Partial<ConnectionModel>): ConnectionModel {
    return Object.assign(Object.create(ConnectionModel.prototype), this, modifyObject);
  }

  public isConnected(): boolean {
    const memory = Memory.get();
    const client = memory.clientConnections.get(this.id);

    return client !== undefined;
  }

  public disconnect() {
    if (this.active) {
      const memory = Memory.get();

      const connection = memory.clientConnections.get(this.id);
      if (connection) {
        memory.clientConnections.remove(this.id);
      }

      this.ws.close();
      this.active = false;
    }
  }
}
