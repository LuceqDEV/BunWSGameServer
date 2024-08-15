import type { Connection } from "../../../game/connection";
import { ServerHeaders } from "../headers/server.header";
import { Message } from "../message";
import type { Packet } from "../packet";

export class UseCharacterMessage extends Message<UseCharacterMessage> {
  constructor() {
    super(ServerHeaders.useCharacter);
  }

  public fromPacket(packet: Packet): UseCharacterMessage {
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
