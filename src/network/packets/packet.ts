import { ByteBuffer } from "../buffers/byte_buffer";

export class Packet {
    public id: number;
    public content: Buffer;
    constructor(id: number, content: Buffer) {
        this.id = id;
        this.content = content;
    }

    public static fromByteBuffer(buffer: ByteBuffer): Packet {
        console.log(buffer.getBuffer())
        // Obtém o tamanho do conteúdo do pacote (4 bytes)
        const size = buffer.getInt32();

        // Obtém o ID do pacote (2 bytes)
        const id = buffer.getInt16();

        // Obtém o conteúdo do pacote (tamanho especificado)
        const offset = buffer.getOffset();
        const content = Buffer.alloc(size);
        buffer.getBuffer().copy(content, 0, offset, offset + size);
        buffer.setOffset(offset + size);

        // Retorna o pacote
        return new Packet(id, content);
    }

    public toByteBuffer(): ByteBuffer {
        const buffer = new ByteBuffer();

        // Adiciona o tamanho do conteúdo do pacote (4 bytes)
        buffer.putInt32(this.content.length);

        // Adiciona o ID do pacote (2 bytes)
        buffer.putInt16(this.id);

        // Adiciona o conteúdo do pacote
        buffer.putBytes(this.content);

        return buffer;
    }
}
