import { ArrayBufferSink } from "bun";

export class ByteBuffer {
    private _sink: ArrayBufferSink = new ArrayBufferSink();
    private _buffer: Uint8Array = new Uint8Array();

    constructor() {
        this._sink.start({ stream: true, asUint8Array: true });
    }

    public putBytes(bytes: Uint8Array): void {
        this._sink.write(bytes);
    }

    public putInt8(value: number): void {
        if (value < -128 || value > 127) {
            throw new RangeError("Value out of range for Int8");
        }
        const buffer = new Uint8Array(1);
        buffer[0] = value;
        this._sink.write(buffer);
    }

    public putInt16(value: number): void {
        if (value < -32768 || value > 32767) {
            throw new RangeError("Value out of range for Int16");
        }
        const buffer = new DataView(new ArrayBuffer(2));
        buffer.setInt16(0, value, true);
        this._sink.write(new Uint8Array(buffer.buffer));
    }

    public putInt32(value: number): void {
        if (value < -2147483648 || value > 2147483647) {
            throw new RangeError("Value out of range for Int32");
        }
        const buffer = new DataView(new ArrayBuffer(4));
        buffer.setInt32(0, value, true);
        this._sink.write(new Uint8Array(buffer.buffer));
    }

    public putString(value: string): void {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(value);
        this.putInt32(encoded.length);
        this.putBytes(encoded);
    }

    public flush(): void {
        this._buffer = new Uint8Array(this._sink.flush() as ArrayBuffer);
    }

    private _readBuffer(size: number): Uint8Array {
        if (size > this._buffer.length) {
            throw new RangeError("Requested size exceeds buffer length");
        }
        const buffer = this._buffer.slice(0, size);
        this._buffer = this._buffer.slice(size);
        return buffer;
    }

    public getBytes(): Uint8Array {
        this.flush();
        return this._buffer;
    }

    public getInt8(): number {
        const buffer: Uint8Array = this._readBuffer(1);
        const view = new DataView(buffer.buffer);
        return view.getInt8(0);
    }

    public getInt16(): number {
        const buffer = this._readBuffer(2);
        const view = new DataView(buffer.buffer);
        return view.getInt16(0, true);
    }

    public getInt32(): number {
        const buffer = this._readBuffer(4);
        const view = new DataView(buffer.buffer);
        return view.getInt32(0, true);
    }

    public getString(): string {
        const length = this.getInt32();
        const buffer = this._readBuffer(length);
        const decoder = new TextDecoder();
        return decoder.decode(buffer);
    }
}
