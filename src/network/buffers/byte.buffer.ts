export class ByteBuffer {
  private buffer: Buffer;
  private offset: number;

  constructor(initialBuffer: Buffer = Buffer.alloc(0)) {
    this.buffer = initialBuffer;
    this.offset = 0;
  }

  public putBytes(bytes: Buffer): void {
    const newSize = this.buffer.length + bytes.length;
    const newBuffer = Buffer.alloc(newSize);
    this.buffer.copy(newBuffer);
    bytes.copy(newBuffer, this.buffer.length);
    this.buffer = newBuffer;
  }

  public putInt8(value: number): void {
    const buffer = Buffer.alloc(1);
    buffer.writeInt8(value, 0);
    this.putBytes(buffer);
  }

  public putInt16(value: number): void {
    const buffer = Buffer.alloc(2);
    buffer.writeInt16LE(value, 0);
    this.putBytes(buffer);
  }

  public putInt32(value: number): void {
    const buffer = Buffer.alloc(4);
    buffer.writeInt32LE(value, 0);
    this.putBytes(buffer);
  }

  public putString(value: string): void {
    const encoded = Buffer.from(value, "utf8");
    this.putInt32(encoded.length);
    this.putBytes(encoded);
  }

  public getInt8(): number {
    const value = this.buffer.readInt8(this.offset);
    this.offset += 1;
    return value;
  }

  public getInt16(): number {
    const value = this.buffer.readInt16LE(this.offset);
    this.offset += 2;
    return value;
  }

  public getInt32(): number {
    const value = this.buffer.readInt32LE(this.offset);
    this.offset += 4;
    return value;
  }

  public getString(): string {
    const length = this.getInt32();
    const value = this.buffer.subarray(this.offset, this.offset + length);
    this.offset += length;
    return value.toString("utf8");
  }

  public getBytes(length: number): Buffer {
    const value = this.buffer.subarray(this.offset, this.offset + length);
    this.offset += length;
    return value;
  }

  public getBuffer(): Buffer {
    return this.buffer;
  }

  public getOffset(): number {
    return this.offset;
  }

  public setOffset(offset: number): void {
    this.offset = offset;
  }
}
