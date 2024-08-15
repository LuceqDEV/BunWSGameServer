import { ByteBuffer } from "../../buffers/byte.buffer";
import { Packet } from "../packet";
import { Sender } from "../../handler/sender";
import type { Connection } from "../../../game/connection";
import { ServerHeaders } from "../headers/server.header";
import { Message } from "../message";

export class AlertMessage extends Message<AlertMessage> {
  private message: string;

  constructor(message: string) {
    super(ServerHeaders.alert);
    this.message = message;
  }

  public fromPacket(packet: Packet): AlertMessage {
    const byteBuffer = new ByteBuffer(packet.content);
    const message = byteBuffer.getString();
    return new AlertMessage(message);
  }

  public toPacket(): Packet {
    const byteBuffer = new ByteBuffer();
    byteBuffer.putString(this.message);
    return new Packet(this.getPacketId(), byteBuffer.getBuffer());
  }

  protected sendPacket(connection: Connection, packet: Packet): void {
    Sender.dataTo(connection, packet);
  }

  public handle(_connection: Connection, _packet: Packet): void {}
}
