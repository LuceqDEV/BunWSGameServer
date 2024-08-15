import type { Connection } from "../../game/connection";
import type { Packet } from "./packet";

export abstract class Message<T extends Message<T>> {
  constructor(private readonly packetId: number) {}

  public abstract fromPacket(packet: Packet): T;
  public abstract toPacket(): Packet;

  public send(connection: Connection): void {
    const packet = this.toPacket();
    this.sendPacket(connection, packet);
  }

  public abstract handle(connection: Connection, packet: Packet): void;

  protected abstract sendPacket(connection: Connection, packet: Packet): void;

  protected getPacketId(): number {
    return this.packetId;
  }

  public static create(): Message<any> {
    throw new Error("Method not implemented.");
  }
}
