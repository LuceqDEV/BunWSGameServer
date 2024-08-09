import type { ServerWebSocket } from "bun";
import { Packet } from "../packets/packet";

export interface IMessage {
    create(): Packet;
    send(ws: ServerWebSocket): void;
    handle(ws: ServerWebSocket, packet: Packet): void;
}
