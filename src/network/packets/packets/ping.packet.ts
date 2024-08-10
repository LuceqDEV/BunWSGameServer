import { ByteBuffer } from "../../buffers/byte.buffer";
import { Packet } from "../packet";
import { Sender } from "../sender";
import { ServerHeaders } from "../headers";
import type { ConnectionModel } from "../../../models/connection.model";
import type { IPacketHandler } from "../../handler/handler.interface";

export class PingPacket implements IPacketHandler {
  public constructor() {}

  fromPacket(packet: Packet): PingPacket {
    return new PingPacket();
  }

  toPacket(): Packet {
    const byteBuffer = new ByteBuffer();
    return new Packet(ServerHeaders.ping, byteBuffer.getBuffer());
  }

  send(connection: ConnectionModel): void {
    const pingPacket = this.toPacket();
    Sender.dataTo(connection, pingPacket);
  }

  handle(connection: ConnectionModel, packet: Packet): void {
    this.send(connection);
  }
}
