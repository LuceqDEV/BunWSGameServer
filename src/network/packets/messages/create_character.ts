import type { Connection } from "../../../game/connection";
import { ServerHeaders } from "../headers/server.header";
import { Message } from "../message";
import type { Packet } from "../packet";

export class CreateCharacterMessage extends Message<CreateCharacterMessage> {
  constructor() {
    super(ServerHeaders.createCharacter);
  }

  public fromPacket(packet: Packet): CreateCharacterMessage {
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
