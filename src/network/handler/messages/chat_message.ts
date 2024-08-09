import type { ServerWebSocket } from "bun";
import { ByteBuffer } from "../../buffers/byte_buffer";
import { Packet } from "../../packets/packet";
import { ServerHeaders } from "../headers";
import { Sender } from "../../packets/sender";

export class ChatPacket {
    private name: string;
    private message: string;
    private hour: number;
    private minutes: number;

    constructor(name: string = '', message: string = '', hour: number = 0, minutes: number = 0) {
        this.name = name;
        this.message = message;
        this.hour = hour;
        this.minutes = minutes;
    }

    static fromPacket(packet: Packet): ChatPacket {
        const byteBuffer = new ByteBuffer();
        byteBuffer.putBytes(packet.content);

        const name = byteBuffer.getString();
        const message = byteBuffer.getString();
        const hour = byteBuffer.getInt8();
        const minutes = byteBuffer.getInt8();

        return new ChatPacket(name, message, hour, minutes);
    }

    create(): Packet {
        const byteBuffer = new ByteBuffer();
        byteBuffer.putString(this.name);
        byteBuffer.putString(this.message);
        byteBuffer.putInt8(this.hour);
        byteBuffer.putInt8(this.minutes);

        return new Packet(ServerHeaders.chat, byteBuffer.getBuffer());
    }

    send(ws: ServerWebSocket): void {
        const chatPacket = this.create();
        Sender.dataToAllExcept(ws, chatPacket);
    }

    handle(ws: ServerWebSocket, packet: Packet): void {
        const chatPacket = ChatPacket.fromPacket(packet);
        chatPacket.send(ws);
    }
}
