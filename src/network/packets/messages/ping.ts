import { ByteBuffer } from "../../buffers/byte.buffer";
import { Packet } from "../packet";
import { Sender } from "../../handler/sender";
import type { ConnectionModel } from "../../../models/connection.model";
import type { MessageInterface } from "../../../interfaces/message.interface";
import { ServerHeaders } from "../headers/server.header";

export class PingMessage implements MessageInterface {
  public constructor() {}

  fromPacket(packet: Packet): PingMessage {
    return new PingMessage();
  }

  toPacket(): Packet {
    const byteBuffer = new ByteBuffer();
    return new Packet(ServerHeaders.ping, byteBuffer.getBuffer());
  }

  send(connection: ConnectionModel): void {
    const pingPacket = this.toPacket();
    console.log("enviando o ping");
    Sender.dataTo(connection, pingPacket);
  }

  handle(connection: ConnectionModel, packet: Packet): void {
    console.log("processando ping");
    this.send(connection);
  }
}
