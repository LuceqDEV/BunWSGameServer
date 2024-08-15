import type { Connection } from "../../../game/connection";
import { ByteBuffer } from "../../buffers/byte.buffer";
import { Packet } from "../packet";
import { Sender } from "../../handler/sender";
import { ServerHeaders } from "../headers/server.header";
import { Message } from "../message";

export class PingMessage extends Message<PingMessage> {
  constructor() {
    super(ServerHeaders.ping);
  }

  public fromPacket(_packet: Packet): PingMessage {
    return new PingMessage();
  }

  public toPacket(): Packet {
    const byteBuffer = new ByteBuffer();
    return new Packet(this.getPacketId(), byteBuffer.getBuffer());
  }

  protected sendPacket(connection: Connection, packet: Packet): void {
    Sender.dataTo(connection, packet);
  }

  public handle(connection: Connection, _packet: Packet): void {
    this.send(connection);
  }
}
