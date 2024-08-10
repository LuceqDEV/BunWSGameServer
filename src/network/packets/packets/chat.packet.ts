import { ByteBuffer } from "../../buffers/byte.buffer";
import { Packet } from "../packet";
import { Sender } from "../sender";
import { ServerHeaders } from "../headers";
import type { ConnectionModel } from "../../../models/connection.model";
import type { IPacketHandler } from "../../handler/handler.interface";

export class ChatPacket implements IPacketHandler {
  public constructor(
    private name: string = "",
    private message: string = "",
    private hour: number = 0,
    private minutes: number = 0
  ) {}

  fromPacket(packet: Packet): ChatPacket {
    const byteBuffer = new ByteBuffer(packet.content);
    const name = byteBuffer.getString();
    const message = byteBuffer.getString();
    const hour = byteBuffer.getInt8();
    const minutes = byteBuffer.getInt8();

    return new ChatPacket(name, message, hour, minutes);
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
