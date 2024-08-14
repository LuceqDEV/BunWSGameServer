import type { Packet } from "../packets/packet";
import type { Connection } from "../../game/connection";

type Proccessor = (connection: Connection, packet: Packet) => void;

export class Processor {
  private handlers: Map<number, Proccessor> = new Map();

  public registerMessage(id: number, proccessor: Proccessor): void {
    this.handlers.set(id, proccessor);
  }

  public processMessage(connection: Connection, packet: Packet): void {
    const handler = this.handlers.get(packet.id);

    if (handler) {
      handler(connection, packet);
    } else {
      console.warn(`No handler found for packet ID: ${packet.id}`);
    }
  }
}
