import type { Packet } from "../packets/packet";
import type { ConnectionModel } from "../../models/connection.model";

type Proccessor = (connection: ConnectionModel, packet: Packet) => void;

export class Processor {
  private handlers: Map<number, Proccessor> = new Map();

  public registerPacket(id: number, proccessor: Proccessor): void {
    this.handlers.set(id, proccessor);
  }

  public processPacket(connection: ConnectionModel, packet: Packet): void {
    const handler = this.handlers.get(packet.id);

    if (handler) {
      handler(connection, packet);
    } else {
      console.warn(`No handler found for packet ID: ${packet.id}`);
    }
  }
}
