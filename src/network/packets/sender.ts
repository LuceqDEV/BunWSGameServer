import { Logger } from "../../shared/logger";
import { ByteBuffer } from "../buffers/byte.buffer";
import { Packet } from "../packets/packet";
import { Memory } from "../../server/memory";
import { ConnectionModel } from "../../models/connection.model";

export class Sender {
  private static _logger: Logger = Logger.get();
  private static _memory: Memory = Memory.get();

  public static dataTo(connection: ConnectionModel, packet: Packet): void {
    try {
      const buffer: ByteBuffer = packet.toByteBuffer();

      connection.ws.send(buffer.getBuffer());
    } catch (error) {
      this._logger.error("Erro ao enviar dados para o cliente! Erro: " + error);
    }
  }

  public static dataToAll(packet: Packet): void {
    const filledSlots: (ConnectionModel | undefined)[] = this._memory.clientConnections.getFilledSlotsAsList();

    for (const connection of filledSlots) {
      if (connection?.ws) {
        try {
          this.dataTo(connection, packet);
        } catch (error) {
          this._logger.error("Erro ao enviar dados para o cliente! Erro: " + error);
        }
      }
    }
  }

  public static dataToAllExcept(exceptConnection: ConnectionModel, packet: Packet): void {
    const filledSlots: (ConnectionModel | undefined)[] = this._memory.clientConnections.getFilledSlotsAsList();

    for (const connection of filledSlots) {
      if (connection?.ws && connection !== exceptConnection) {
        try {
          this.dataTo(connection, packet);
        } catch (error) {
          this._logger.error("Erro ao enviar dados para o cliente! Erro: " + error);
        }
      }
    }
  }
}
