import type { Connection } from "../../../game/connection";
import { ServerHeaders } from "../headers/server.header";
import { Message } from "../message";
import type { Packet } from "../packet";

export class DeleteCharacterMessage extends Message<DeleteCharacterMessage> {
  constructor() {
    super(ServerHeaders.deleteCharacter);
  }
  public fromPacket(packet: Packet): DeleteCharacterMessage {
    throw new Error("Method not implemented.");
  }
  public toPacket(): Packet {
    throw new Error("Method not implemented.");
  }
  public handle(connection: Connection, packet: Packet): void {
    throw new Error("Method not implemented.");
  }
  protected sendPacket(connection: Connection, packet: Packet): void {
    throw new Error("Method not implemented.");
  }
}
