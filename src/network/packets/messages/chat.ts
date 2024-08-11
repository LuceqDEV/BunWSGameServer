import { ByteBuffer } from "../../buffers/byte.buffer";
import { Packet } from "../packet";
import { Sender } from "../../handler/sender";
import type { ConnectionModel } from "../../../models/connection.model";
import type { MessageInterface } from "../../../interfaces/message.interface";
import { ServerHeaders } from "../headers/server.header";

export class ChatMessage implements MessageInterface {
  public constructor(
    private name: string = "",
    private message: string = "",
    private hour: number = 0,
    private minutes: number = 0
  ) {}

  fromPacket(packet: Packet): ChatMessage {
    const byteBuffer = new ByteBuffer(packet.content);
    const name = byteBuffer.getString();
    const message = byteBuffer.getString();
    const hour = byteBuffer.getInt8();
    const minutes = byteBuffer.getInt8();

    return new ChatMessage(name, message, hour, minutes);
  }

  toPacket(): Packet {
    const byteBuffer = new ByteBuffer();
    byteBuffer.putString(this.name);
    byteBuffer.putString(this.message);
    byteBuffer.putInt8(this.hour);
    byteBuffer.putInt8(this.minutes);

    return new Packet(ServerHeaders.chat, byteBuffer.getBuffer());
  }

  send(connection: ConnectionModel): void {
    const chatPacket = this.toPacket();
    Sender.dataToAllExcept(connection, chatPacket);
  }

  handle(connection: ConnectionModel, packet: Packet): void {
    const chatPacket = this.fromPacket(packet);
    chatPacket.send(connection);
  }
}
