import type { Packet } from "../packets/packet";
import type { Connection } from "../../game/connection";
import type { Message } from "../packets/message";
import { Logger } from "../../shared/logger";

type MessageHandler = (connection: Connection, packet: Packet) => void;

interface MessageMap {
  [key: number]: new () => Message<any>;
}

export class Processor {
  private _handlers: Map<number, MessageHandler> = new Map();
  private _logger: Logger = Logger.get();

  constructor(messageMap: MessageMap) {
    for (const [header, messages] of Object.entries(messageMap)) {
      this._registerMessage(Number(header), this._createHandler(messages));
    }
  }

  private _registerMessage(id: number, handler: MessageHandler): void {
    this._handlers.set(id, handler);
  }

  private _createHandler(MessageClass: new () => Message<any>): MessageHandler {
    return (connection: Connection, packet: Packet) => {
      const messageInstance = new MessageClass();
      messageInstance.handle(connection, packet);
    };
  }

  public processMessage(connection: Connection, packet: Packet): void {
    const handler = this._handlers.get(packet.id);

    if (!handler) {
      this._logger.error(`No handler found for packet ID: ${packet.id}`);
      return;
    }

    try {
      handler(connection, packet);
    } catch (error) {
      this._processingError(error, packet.id);
      return;
    }
  }

  private _processingError(error: any, packetId: number): void {
    this._logger.error(`Error while processing packet ID ${packetId}: ` + error);
  }
}
