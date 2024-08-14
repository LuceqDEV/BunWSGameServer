import { ByteBuffer } from "../../buffers/byte.buffer";
import { Packet } from "../packet";
import { Sender } from "../../handler/sender";
import type { Connection } from "../../../game/connection";
import type { MessageInterface } from "../../../interfaces/message.interface";
import { ServerHeaders } from "../headers/server.header";

export class AlertMessage implements MessageInterface {
  public constructor(private message: string) {}

  fromPacket(packet: Packet): AlertMessage {
    const byteBuffer = new ByteBuffer(packet.content);
    const message: string = byteBuffer.getString();

    return new AlertMessage(message);
  }

  toPacket(): Packet {
    const byteBuffer = new ByteBuffer();
    byteBuffer.putString(this.message);

    return new Packet(ServerHeaders.alert, byteBuffer.getBuffer());
  }

  send(connection: Connection): void {
    Sender.dataToAllExcept(connection, this.toPacket());
  }

  handle(connection: Connection, packet: Packet): void {
    const alertPacket = this.fromPacket(packet);
    alertPacket.send(connection);
  }
}
