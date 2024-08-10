import type { ConnectionModel } from "../../models/connection.model";
import { Packet } from "../packets/packet";

export interface IPacketHandler {
  fromPacket(packet: Packet): IPacketHandler;
  toPacket(): Packet;
  send(connection: ConnectionModel): void;
  handle(connection: ConnectionModel, packet: Packet): void;
}
