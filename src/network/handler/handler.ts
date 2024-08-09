import type { ServerWebSocket } from "bun";
import { Logger } from "../../shared/logger";
import { Memory } from "../../server/memory";
import { ConnectionModel } from "../../models/connection.model";
import { IpConverter } from "../../shared/ipconverter";
import { Processor } from "../packets/processor";
import { ByteBuffer } from "../buffers/byte_buffer";
import { Packet } from "../packets/packet";
import { ClientHeaders, ServerHeaders } from "./headers";
import { PingPacket } from "./messages/ping_message";
import { ChatPacket } from "./messages/chat_message";

export class Handler {
    private _logger: Logger;
    private _memory: Memory;
    private _packetProcessor: Processor;

    constructor() {
        this._logger = Logger.get();
        this._memory = Memory.get();
        this._packetProcessor = new Processor();

        this._packetProcessor.registerHandler(ClientHeaders.ping, (ws, packet) => new PingPacket().handle(ws, packet));
        this._packetProcessor.registerHandler(ClientHeaders.chat, (ws, packet) => {
            const chatPacket = ChatPacket.fromPacket(packet);
            chatPacket.handle(ws, packet);
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
            const byteBuffer = new ByteBuffer();
            byteBuffer.putBytes(message);

            const packet = Packet.fromByteBuffer(byteBuffer);
            this._packetProcessor.handlePacket(ws, packet);

        } catch (error) {
            this._logger.error(`Erro ao processar mensagem WebSocket: ${error}`);
        }
    }

    private _handleFullServer(ws: ServerWebSocket): void {
        this._logger.info('O servidor está cheio, desconectando o cliente: ' + IpConverter.getIPv4(IpConverter.getIPv4(ws.remoteAddress)));
        this._logger.info('Conn finalizada, conn: ' + IpConverter.getIPv4(ws.remoteAddress));

        ws.close()
    }

    private _cleanupConnection(ws: ServerWebSocket): void {
        const filledSlots: (ConnectionModel | undefined)[] = this._memory.clientConnections.getFilledSlotsAsList();

        for (const connection of filledSlots) {
            if (connection && connection.ws === ws) {
                const slotIndex: Iterable<number> = this._memory.clientConnections.find(connection);

                for (const index of slotIndex) {
                    this._memory.clientConnections.remove(index);
                    this._logger.info(`Conexão removida do slot: ${index}, endereço: ${IpConverter.getIPv4(ws.remoteAddress)}`);
                }

                connection.disconnect();
                break;
            }
        }
    }
}