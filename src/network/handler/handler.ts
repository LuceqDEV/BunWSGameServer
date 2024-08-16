import type { ServerWebSocket } from "bun";
import { Logger } from "../../shared/logger";
import { Memory } from "../../server/memory";
import { Processor, type MessageMap } from "./processor";
import { Connection } from "../../game/connection";
import { Packet } from "../packets/packet";
import { IpConverter } from "../../shared/ipconverter";
import { AlertMessage } from "../packets/messages/alert";
import { ClientHeaders } from "../packets/headers/client.header";
import { PingMessage } from "../packets/messages/ping";
import { SignInMessage } from "../packets/messages/signin";
import { SignUpMessage } from "../packets/messages/signup";
import { CharacterMessage } from "../packets/messages/characters";
import { CreateCharacterMessage } from "../packets/messages/create_character";
import { DeleteCharacterMessage } from "../packets/messages/delete_character";
import { UseCharacterMessage } from "../packets/messages/use_character";

export class Handler {
  private logger: Logger = Logger.get();
  private memory: Memory = Memory.get();

  private packetProcessor: Processor = new Processor();

  public websocketOpen(ws: ServerWebSocket): void {
    const firstAvailableId: number | undefined = this.memory.clientConnections.getFirstEmptySlot();

    if (firstAvailableId == undefined) {
      this.handleFullServer(ws);

      return;
    }

    const connectionModel: Connection = new Connection(ws, firstAvailableId);
    this.memory.clientConnections.add(connectionModel);
  }

  public websocketClose(ws: ServerWebSocket, _code: number, _message: string): void {
    this.cleanupConnection(ws);
  }

  public websocketMessage(ws: ServerWebSocket, message: Buffer): void {
    const connection: Connection | undefined = this.getConnectionBySocket(ws);

    if (!connection) {
      this.logger.error(`Conexão não encontrada para o WebSocket.`);
      this.cleanupConnection(ws);
      return;
    }

    try {
      const packet = Packet.fromBuffer(message);
      this.packetProcessor.processMessage(connection, packet);
    } catch (error) {
      this.logger.error(`Erro ao processar pacote: ${error}`);
      this.cleanupConnection(ws);
    }
  }

  private handleFullServer(ws: ServerWebSocket): void {
    try {
      const connection: Connection = new Connection(ws, -1);
      new AlertMessage("O servidor está cheio, tente novamente mais tarde...").send(connection);
    } catch (error) {
      this.logger.error("Erro ao enviar alerta para a conexão, servidor cheio.");
    }

    this.logger.info("O servidor está cheio, desconectando o cliente: " + IpConverter.getIPv4(ws.remoteAddress));
    ws.close();
  }

  private cleanupConnection(ws: ServerWebSocket): void {
    const connection = this.getConnectionBySocket(ws);

    if (connection) {
      this.memory.clientConnections.remove(connection.id);
      this.logger.info(`Conexão removida, endereço: ${IpConverter.getIPv4(ws.remoteAddress)}`);
      connection.disconnect();
    }
  }

  private getConnectionBySocket(ws: ServerWebSocket): Connection | undefined {
    for (const connection of this.memory.clientConnections.getFilledSlotsAsList()) {
      if (connection && connection.ws === ws) {
        return connection;
      }
    }
    return undefined;
  }
}
