import type { ServerWebSocket } from "bun";
import type { IMessage } from "../message";
import { Packet } from "../../packets/packet";
import { ServerHeaders } from "../headers";
import { Sender } from "../../packets/sender";

export class PingPacket implements IMessage {
    create(): Packet {
        return new Packet(ServerHeaders.ping, Buffer.alloc(0));
    }
    send(ws: ServerWebSocket): void {
        const pingPacket = this.create();

        Sender.dataTo(ws, pingPacket);
    }
    handle(ws: ServerWebSocket, packet: Packet): void {
        this.send(ws);
    }
}
