import type { ServerWebSocket } from "bun";
import { Logger } from "../../shared/logger";
import { Memory } from "../../server/memory";
import { ConnectionModel } from "../../models/connection.model";
import { IpConverter } from "../../shared/ipconverter";
import { Processor } from "../packets/processor";
import { ByteBuffer } from "../buffers/byte.buffer";
import { Packet } from "../packets/packet";
import { ClientHeaders, ServerHeaders } from "../packets/headers";
import { PingPacket } from "../packets/packets/ping.packet";
import { ChatPacket } from "../packets/packets/chat.packet";

export class Handler {
  private _logger: Logger = Logger.get();
  private _memory: Memory = Memory.get();
  private _packetProcessor: Processor = new Processor();

  constructor() {
    this._initializePacketHandlers();
  }

  private _initializePacketHandlers(): void {
    this._packetProcessor.registerHandler(ClientHeaders.ping, (connection, packet) => {
      return new PingPacket().handle(connection, packet);
    });

    this._packetProcessor.registerHandler(ClientHeaders.chat, (connection, packet) => {
      return new ChatPacket().handle(connection, packet);
    });
  }

  public websocketOpen(ws: ServerWebSocket): void {
    const firstAvailableId: number | undefined = this._memory.clientConnections.getFirstEmptySlot();

    if (firstAvailableId == undefined) {
      this._handleFullServer(ws);

      return;
    }

    const connectionModel: ConnectionModel = new ConnectionModel(ws, firstAvailableId);
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
        this._packetProcessor.handlePacket(connection, packet);
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
    this._logger.info(
      "O servidor está cheio, desconectando o cliente: " + IpConverter.getIPv4(IpConverter.getIPv4(ws.remoteAddress))
    );
    this._logger.info("Conn finalizada, conn: " + IpConverter.getIPv4(ws.remoteAddress));

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
