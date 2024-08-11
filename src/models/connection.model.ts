import type { ServerWebSocket } from "bun";
import { Memory } from "../server/memory";
import type { CharacterModel } from "./character.model";

export class ConnectionModel {
  constructor(ws: ServerWebSocket, id: number, logged: boolean = false) {
    this.ws = ws;
    this.id = id;
    this.active = true;
    this.logged = logged;
  }

  public ws: ServerWebSocket;
  public id: number;
  public active: boolean;
  public logged?: boolean;
  public characters?: CharacterModel[];
  public characterInUse?: CharacterModel;

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
