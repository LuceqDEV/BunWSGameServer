import type { ServerWebSocket } from "bun";
import type { Connection } from "../game/connection";
import { MAX_MAPS, MAX_PLAYERS } from "../shared/constants";
import { Slots } from "../shared/slots";
import type { Map } from "../game/map";

export class Memory {
  private static instance: Memory;

  public clientConnections: Slots<Connection>;
  public maps: Slots<Map>;

  private constructor() {
    this.clientConnections = new Slots<Connection>(MAX_PLAYERS);
    this.maps = new Slots<Map>(MAX_MAPS);
  }

  public static get(): Memory {
    if (!Memory.instance) {
      Memory.instance = new Memory();
    }
    return Memory.instance;
  }
}
