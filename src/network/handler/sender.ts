import { Logger } from "../../shared/logger";
import { ByteBuffer } from "../buffers/byte.buffer";
import { Packet } from "../packets/packet";
import { Memory } from "../../server/memory";
import { Connection } from "../../game/connection";

export class Sender {
  private static logger: Logger = Logger.get();
  private static memory: Memory = Memory.get();

  public static dataTo(connection: Connection, packet: Packet): void {
    try {
      const buffer: ByteBuffer = packet.toByteBuffer();

      connection.ws.send(buffer.getBuffer());
    } catch (error) {
      this.logger.error("Error sending data to the client! Error: " + error);
    }
  }

  public static dataToAll(packet: Packet): void {
    const filledSlots: (Connection | undefined)[] = this.memory.clientConnections.getFilledSlotsAsList();

    for (const connection of filledSlots) {
      if (connection?.ws) {
        try {
          this.dataTo(connection, packet);
        } catch (error) {
          this.logger.error("Error sending data to the client! Error: " + error);
        }
      }
    }
  }

  public static dataToAllExcept(exceptConnection: Connection, packet: Packet): void {
    const filledSlots: (Connection | undefined)[] = this.memory.clientConnections.getFilledSlotsAsList();

    for (const connection of filledSlots) {
      if (connection?.ws && connection !== exceptConnection) {
        try {
          this.dataTo(connection, packet);
        } catch (error) {
          this.logger.error("Error sending data to the client! Error: " + error);
        }
      }
    }
  }

  public static dataToMap(mapId: number, packet: Packet): void {
    const map = this.memory.maps.get(mapId);

    if (map) {
      map.characters.forEach((character) => {
        const connection = this.memory.clientConnections.get(character.id);

        if (connection?.ws) {
          try {
            this.dataTo(connection, packet);
          } catch (error) {
            this.logger.error(`Error sending data to the client on the map ${mapId}. Error: ${error}`);
          }
        }
      });
    } else {
      this.logger.warning(`Map with ID ${mapId} not found.`);
    }
  }

  public static dataToMapExcept(mapId: number, exceptConnection: Connection, packet: Packet): void {
    const map = this.memory.maps.get(mapId);

    if (map) {
      map.characters.forEach((character) => {
        const connection = this.memory.clientConnections.get(character.id);

        if (connection?.ws && connection !== exceptConnection) {
          try {
            this.dataTo(connection, packet);
          } catch (error) {
            this.logger.error(`Error sending data to the client on the map ${mapId}. Error: ${error}`);
          }
        }
      });
    } else {
      this.logger.warning(`Map with ID ${mapId} not found.`);
    }
  }
}
