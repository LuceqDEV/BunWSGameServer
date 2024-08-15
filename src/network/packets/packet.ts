import { ByteBuffer } from "../buffers/byte.buffer";

export class Packet {
  public id: number;
  public content: Buffer;

  constructor(id: number, content: Buffer) {
    this.id = id;
    this.content = content || Buffer.alloc(0);
  }

  public static fromBuffer(buffer: Buffer): Packet {
    if (buffer.length < 2) {
      throw new Error("Buffer too small to contain a valid packet.");
    }

    const byteBuffer = new ByteBuffer(buffer);
    const id = byteBuffer.getInt16();

    const contentLength = buffer.length - byteBuffer.getOffset();
    const content = contentLength > 0 ? byteBuffer.getBytes(contentLength) : Buffer.alloc(0);

    return new Packet(id, content);
  }

  public toByteBuffer(): ByteBuffer {
    const buffer = new ByteBuffer();
    buffer.putInt16(this.id);
    buffer.putBytes(this.content);
    return buffer;
  }
}
