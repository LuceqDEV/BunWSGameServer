import type { ServerWebSocket } from "bun";
import { Logger } from "../../shared/logger";
import { Memory } from "../../server/memory";
import { Processor } from "./processor";
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
  private _logger: Logger = Logger.get();
  private _memory: Memory = Memory.get();

  private messageMap = {
    [ClientHeaders.ping]: PingMessage,
    [ClientHeaders.signIn]: SignInMessage,
    [ClientHeaders.signUp]: SignUpMessage,
    [ClientHeaders.characters]: CharacterMessage,
    [ClientHeaders.createCharacter]: CreateCharacterMessage,
    [ClientHeaders.deleteCharacter]: DeleteCharacterMessage,
    [ClientHeaders.useCharacter]: UseCharacterMessage,
  };

  private _packetProcessor: Processor = new Processor(this.messageMap);

  public websocketOpen(ws: ServerWebSocket): void {
    const firstAvailableId: number | undefined = this._memory.clientConnections.getFirstEmptySlot();

    if (firstAvailableId == undefined) {
      this._handleFullServer(ws);

      return;
    }

    const connectionModel: Connection = new Connection(ws, firstAvailableId);
    this._memory.clientConnections.add(connectionModel);
  }

  public websocketClose(ws: ServerWebSocket, _code: number, _message: string): void {
    this._cleanupConnection(ws);
  }

  public websocketMessage(ws: ServerWebSocket, message: Buffer): void {
    const connection: Connection | undefined = this._getConnectionBySocket(ws);

    if (!connection) {
      this._logger.error(`Conexão não encontrada para o WebSocket.`);
      this._cleanupConnection(ws);
      return;
    }

    try {
      const packet = Packet.fromBuffer(message);
      this._packetProcessor.processMessage(connection, packet);
    } catch (error) {
      this._logger.error(`Erro ao processar pacote: ${error}`);
      this._cleanupConnection(ws);
    }
  }

  private _handleFullServer(ws: ServerWebSocket): void {
    try {
      const connection: Connection = new Connection(ws, -1);
      new AlertMessage("O servidor está cheio, tente novamente mais tarde...").send(connection);
    } catch (error) {
      this._logger.error("Erro ao enviar alerta para a conexão, servidor cheio.");
    }

    this._logger.info("O servidor está cheio, desconectando o cliente: " + IpConverter.getIPv4(ws.remoteAddress));
    ws.close();
  }

  private _cleanupConnection(ws: ServerWebSocket): void {
    const connection = this._getConnectionBySocket(ws);

    if (connection) {
      this._memory.clientConnections.remove(connection.id);
      this._logger.info(`Conexão removida, endereço: ${IpConverter.getIPv4(ws.remoteAddress)}`);
      connection.disconnect();
    }
  }

  private _getConnectionBySocket(ws: ServerWebSocket): Connection | undefined {
    for (const connection of this._memory.clientConnections.getFilledSlotsAsList()) {
      if (connection && connection.ws === ws) {
        return connection;
      }
    }
    return undefined;
  }
}
