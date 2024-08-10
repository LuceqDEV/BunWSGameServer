import type { ServerWebSocket } from "bun";
import type { Packet } from "./packet";
import type { ConnectionModel } from "../../models/connection.model";

type Proccessor = (connection: ConnectionModel, packet: Packet) => void;

export class Processor {
  private handlers: Map<number, Proccessor> = new Map();

  public registerHandler(packetId: number, handler: Proccessor): void {
    this.handlers.set(packetId, handler);
  }

  public handlePacket(connection: ConnectionModel, packet: Packet): void {
    const handler = this.handlers.get(packet.id);

    if (handler) {
      handler(connection, packet);
    } else {
      console.warn(`No handler found for packet ID: ${packet.id}`);
    }
  }
}
