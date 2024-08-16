import type { Packet } from "../packets/packet";
import type { Connection } from "../../game/connection";
import type { Message } from "../packets/message";
import { Logger } from "../../shared/logger";
import { ClientHeaders } from "../packets/headers/client.header";
import { PingMessage } from "../packets/messages/ping";
import { SignInMessage } from "../packets/messages/signin";

type MessageHandler = (connection: Connection, packet: Packet) => void;

export interface MessageMap {
  [key: number]: () => Message<any>;
}

export class Processor {
  private handlers: Map<number, MessageHandler> = new Map();
  private logger: Logger = Logger.get();

  constructor() {
    this.registerHandlers();
  }

  private registerHandlers(): void {
    this.registerMessage(
      ClientHeaders.ping,
      this.createHandler(() => new PingMessage())
    );

    this.registerMessage(
      ClientHeaders.signIn,
      this.createHandler(() => new SignInMessage())
    );
  }

  private registerMessage(id: number, handler: MessageHandler): void {
    this.handlers.set(id, handler);
  }

  private createHandler(createMessage: () => Message<any>): MessageHandler {
    return (connection: Connection, packet: Packet) => {
      const messageInstance = createMessage();
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
