import type { Server, ServerWebSocket } from "bun";
import { SERVER_PORT } from "../shared/constants";
import { Logger } from "../shared/logger";
import { IpConverter } from "../shared/ipconverter";
import { Handler } from "../network/handler/handler";

export class Setup {
  private logger: Logger;
  private handler: Handler;

  constructor() {
    this.logger = Logger.get();
    this.handler = new Handler();
    this.fetchHandler = this.fetchHandler.bind(this);

    this.websocketHandlers = {
      open: this.websocketOpen.bind(this),
      close: this.websocketClose.bind(this),
      message: this.websocketMessage.bind(this),
    };
  }

  private websocketHandlers: {
    open: (ws: ServerWebSocket) => void;
    close: (ws: ServerWebSocket, code: number, message: string) => void;
    message: (ws: ServerWebSocket, message: Buffer) => void;
  };

  public async start(): Promise<void> {
    try {
      Bun.serve({
        port: SERVER_PORT,
        fetch: this.fetchHandler,
        websocket: this.websocketHandlers,
      });

      this.logger.info("Server started successfully");
      this.logger.info("Server listening on: " + SERVER_PORT);

      this.logger.info("Initializing server memory...");
      await this.loadMemory();

      this.logger.info("Waiting for connections...");
    } catch (error) {
      this.logger.error("Failed to start the server: " + error);
    }
  }

  private async fetchHandler(req: Request, server: Server): Promise<Response> {
    if (req.headers.get("upgrade")?.toLowerCase() === "websocket") {
      const success: boolean = server.upgrade(req);

      if (!success) {
        return new Response("Upgrade to WebSocket failed", { status: 400 });
      }
    }

    return new Response("Hello, world!", { status: 200 });
  }

  private websocketOpen(ws: ServerWebSocket): void {
    this.logger.info("New connection from: " + IpConverter.getIPv4(ws.remoteAddress));
    this.handler.websocketOpen(ws);
  }

  private websocketClose(ws: ServerWebSocket, code: number, message: string): void {
    this.logger.info("Connection closed, address: " + IpConverter.getIPv4(ws.remoteAddress));
    this.handler.websocketClose(ws, code, message);
  }

  private websocketMessage(ws: ServerWebSocket, message: Buffer): void {
    this.handler.websocketMessage(ws, message);
  }

  private async loadMemory(): Promise<void> {}
}
