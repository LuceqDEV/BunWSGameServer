import { ByteBuffer } from "../buffers/byte.buffer";

export class Packet {
  public id: number;
  public content: Buffer;

  constructor(id: number, content: Buffer) {
    this.id = id;
    this.content = content;
  }

  public static fromByteBuffer(buffer: ByteBuffer): Packet {
    const id = buffer.getInt16();
    const content = buffer.getBytes(buffer.getBuffer().length - buffer.getOffset());
    return new Packet(id, content);
  }

  public toByteBuffer(): ByteBuffer {
    const buffer = new ByteBuffer();
    buffer.putInt16(this.id);
    buffer.putBytes(this.content);
    return buffer;
  }
}
