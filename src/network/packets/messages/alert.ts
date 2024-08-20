import { ByteBuffer } from "../../buffers/byte.buffer";
import { Packet } from "../packet";
import { Sender } from "../../handler/sender";
import type { Connection } from "../../../game/connection";
import { ServerHeaders } from "../headers/server.header";
import { Message } from "../message";

export class AlertMessage extends Message<AlertMessage> {
  private message: string;
  private disconnect: boolean;

  constructor(message: string, disconnect: boolean = false) {
    super(ServerHeaders.Alert);
    this.message = message;
    this.disconnect = disconnect;
  }

  public fromPacket(packet: Packet): AlertMessage {
    const byteBuffer = new ByteBuffer(packet.content);
    const message = byteBuffer.getString();
    const disconnect = byteBuffer.getInt8();
    return new AlertMessage(message, disconnect === 1);
  }

  public toPacket(): Packet {
    const byteBuffer = new ByteBuffer();
    byteBuffer.putString(this.message);
    byteBuffer.putInt8(this.disconnect ? 1 : 0);
    return new Packet(this.getPacketId(), byteBuffer.getBuffer());
  }

  protected sendPacket(connection: Connection, packet: Packet): void {
    Sender.dataTo(connection, packet);
  }

  public handle(_connection: Connection, _packet: Packet): void {}
}
