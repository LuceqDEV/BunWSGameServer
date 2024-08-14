import type { Server, ServerWebSocket } from "bun";
import { ServerPort } from "../shared/constants";
import { Logger } from "../shared/logger";
import { IpConverter } from "../shared/ipconverter";
import { Handler } from "../network/handler/handler";

export class Setup {
  private _logger: Logger;
  private _handler: Handler;

  private _websocketHandlers: {
    open: (ws: ServerWebSocket) => void;
    close: (ws: ServerWebSocket, code: number, message: string) => void;
    message: (ws: ServerWebSocket, message: Buffer) => void;
  };

  constructor() {
    this._logger = Logger.get();
    this._handler = new Handler();
    this._fetchHandler = this._fetchHandler.bind(this);

    this._websocketHandlers = {
      open: this._websocketOpen.bind(this),
      close: this._websocketClose.bind(this),
      message: this._websocketMessage.bind(this),
    };
  }

  public async start(): Promise<void> {
    try {
      Bun.serve({
        port: ServerPort,
        fetch: this._fetchHandler,
        websocket: this._websocketHandlers,
      });

      this._logger.info("Servidor iniciado com sucesso");
      this._logger.info("Servidor ouvindo em: " + ServerPort);

      await this._loadMemory();

      this._logger.info("Aguardando conexões...");
    } catch (error) {
      this._logger.error("Falha ao iniciar o servidor: " + error);
    }
  }

  private async _fetchHandler(req: Request, server: Server): Promise<Response> {
    if (req.headers.get("upgrade") === "websocket") {
      const success: boolean = server.upgrade(req);

      if (!success) {
        return new Response("Upgrade to WebSocket failed", { status: 400 });
      }
    }

    return new Response("Hello, world!", { status: 200 });
  }

  private _websocketOpen(ws: ServerWebSocket): void {
    this._logger.info("Nova conexão de: " + IpConverter.getIPv4(ws.remoteAddress));
    this._handler.websocketOpen(ws);
  }

  private _websocketClose(ws: ServerWebSocket, code: number, message: string): void {
    this._logger.info("Connexão finalizada, conexão: " + IpConverter.getIPv4(ws.remoteAddress));
    this._handler.websocketClose(ws, code, message);
  }

  private _websocketMessage(ws: ServerWebSocket, message: Buffer): void {
    this._handler.websocketMessage(ws, message);
  }

  private async _loadMemory(): Promise<void> {}
}
