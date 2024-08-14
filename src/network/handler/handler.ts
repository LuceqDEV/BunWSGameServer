import type { ServerWebSocket } from "bun";
import { Logger } from "../../shared/logger";
import { Memory } from "../../server/memory";
import { Processor } from "./processor";
import { ClientHeaders } from "../packets/headers/client.header";
import { PingMessage } from "../packets/messages/ping";
import { ChatMessage } from "../packets/messages/chat";
import { Connection } from "../../game/connection";
import { ByteBuffer } from "../buffers/byte.buffer";
import { Packet } from "../packets/packet";
import { IpConverter } from "../../shared/ipconverter";
import { AlertMessage } from "../packets/messages/alert";
import { SigInMessage } from "../packets/messages/signin";

export class Handler {
  private _logger: Logger = Logger.get();
  private _memory: Memory = Memory.get();
  private _packetProcessor: Processor = new Processor();

  constructor() {
    this._packetProcessor.registerMessage(ClientHeaders.ping, (connection, packet) => {
      return new PingMessage().handle(connection, packet);
    });

    this._packetProcessor.registerMessage(ClientHeaders.chat, (connection, packet) => {
      return new ChatMessage().handle(connection, packet);
    });

    this._packetProcessor.registerMessage(ClientHeaders.signIn, (connection, packet) => {
      return new SigInMessage().handle(connection, packet);
    });
  }

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
    try {
      const connection = this._memory.getConnectionBySocket(ws);

      if (connection) {
        const byteBuffer = new ByteBuffer(message);
        const packet = Packet.fromByteBuffer(byteBuffer);
        this._packetProcessor.processMessage(connection, packet);
      } else {
        this._logger.error(`Conexão não encontrada para o WebSocket.`);
        this._cleanupConnection(ws);
      }
    } catch (error) {
      this._logger.error(`Erro ao processar mensagem WebSocket: ${error}`);
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
    const connection = this._memory.getConnectionBySocket(ws);

    if (connection) {
      this._memory.clientConnections.remove(connection.id);
      this._logger.info(`Conexão removida, endereço: ${IpConverter.getIPv4(ws.remoteAddress)}`);
      connection.disconnect();
    }
  }
}
