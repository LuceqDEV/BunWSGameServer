import type { Connection } from "../game/connection";
import { Packet } from "../network/packets/packet";

export interface MessageInterface {
  fromPacket(packet: Packet): MessageInterface;
  toPacket(): Packet;
  send(connection: Connection): void;
  handle(connection: Connection, packet: Packet): void;
}
