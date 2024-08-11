import type { ConnectionModel } from "../models/connection.model";
import { Packet } from "../network/packets/packet";

export interface MessageInterface {
  fromPacket(packet: Packet): MessageInterface;
  toPacket(): Packet;
  send(connection: ConnectionModel): void;
  handle(connection: ConnectionModel, packet: Packet): void;
}
