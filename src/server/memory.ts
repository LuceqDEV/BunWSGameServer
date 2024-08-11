import type { ServerWebSocket } from "bun";
import type { ConnectionModel } from "../models/connection.model";
import { MaxMaps, MaxPlayers } from "../shared/constants";
import { Slots } from "../shared/slots";
import type { MapModel } from "../models/map.model";

export class Memory {
  private static _instance: Memory;

  public clientConnections: Slots<ConnectionModel>;
  public maps: Slots<MapModel>;

  private constructor() {
    this.clientConnections = new Slots<ConnectionModel>(MaxPlayers);
    this.maps = new Slots<MapModel>(MaxMaps);
  }

  public static get(): Memory {
    if (!Memory._instance) {
      Memory._instance = new Memory();
    }
    return Memory._instance;
  }

  public getConnectionBySocket(ws: ServerWebSocket): ConnectionModel | undefined {
    for (const connection of this.clientConnections.getFilledSlotsAsList()) {
      if (connection && connection.ws === ws) {
        return connection;
      }
    }
    return undefined;
  }
}
