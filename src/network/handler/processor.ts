import type { Packet } from "../packets/packet";
import type { Connection } from "../../game/connection";
import type { Message } from "../packets/message";
import { Logger } from "../../shared/logger";

type MessageHandler = (connection: Connection, packet: Packet) => void;

interface MessageMap {
  [key: number]: new () => Message<any>;
}

export class Processor {
  private handlers: Map<number, MessageHandler> = new Map();
  private logger: Logger = Logger.get();

  constructor(messageMap: MessageMap) {
    for (const [header, messages] of Object.entries(messageMap)) {
      this.registerMessage(Number(header), this.createHandler(messages));
    }
  }

  private registerMessage(id: number, handler: MessageHandler): void {
    this.handlers.set(id, handler);
  }

  private createHandler(MessageClass: new () => Message<any>): MessageHandler {
    return (connection: Connection, packet: Packet) => {
      const messageInstance = new MessageClass();
      messageInstance.handle(connection, packet);
    };
  }

  public processMessage(connection: Connection, packet: Packet): void {
    const handler = this.handlers.get(packet.id);

    if (!handler) {
      this.logger.error(`No handler found for packet ID: ${packet.id}`);
      return;
    }

    try {
      handler(connection, packet);
    } catch (error) {
      this.processingError(error, packet.id);
      return;
    }
  }

  private processingError(error: any, packetId: number): void {
    this.logger.error(`Error while processing packet ID ${packetId}: ` + error);
  }
}
