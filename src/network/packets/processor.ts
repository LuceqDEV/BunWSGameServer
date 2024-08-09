import type { ServerWebSocket } from "bun";
import type { Packet } from "./packet";

type Handler = (ws: ServerWebSocket, packet: Packet) => void;

export class Processor {
    private handlers: Map<number, Handler> = new Map();

    public registerHandler(packetId: number, handler: Handler): void {
        this.handlers.set(packetId, handler);
    }

    public handlePacket(ws: ServerWebSocket, packet: Packet): void {
        const handler = this.handlers.get(packet.id);

        if (handler) {
            handler(ws, packet);
        } else {
            console.warn(`No handler found for packet ID: ${packet.id}`);
        }
    }
}
