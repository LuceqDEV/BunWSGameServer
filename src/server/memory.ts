import type { ServerWebSocket } from "bun";
import type { Connection } from "../game/connection";
import { MaxMaps, MaxPlayers } from "../shared/constants";
import { Slots } from "../shared/slots";
import type { Map } from "../game/map";

export class Memory {
  private static _instance: Memory;

  public clientConnections: Slots<Connection>;
  public maps: Slots<Map>;

  private constructor() {
    this.clientConnections = new Slots<Connection>(MaxPlayers);
    this.maps = new Slots<Map>(MaxMaps);
  }

  public static get(): Memory {
    if (!Memory._instance) {
      Memory._instance = new Memory();
    }
    return Memory._instance;
  }

  public getConnectionBySocket(ws: ServerWebSocket): Connection | undefined {
    for (const connection of this.clientConnections.getFilledSlotsAsList()) {
      if (connection && connection.ws === ws) {
        return connection;
      }
    }
    return undefined;
  }
}
