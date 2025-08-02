import { BinaryStream, DataType } from "@serenityjs/binarystream";

class ByteArray extends DataType {
  public static read(stream: BinaryStream): Buffer {
    // Read the length of the byte array.
    const length = stream.readVarInt();

    // Read the byte array from the stream.
    return stream.read(length);
  }

  public static write(stream: BinaryStream, value: Buffer): void {
    // Write the length of the byte array.
    stream.writeVarInt(value.byteLength);

    // Write the byte array to the stream.
    stream.write(value);
  }
}

export { ByteArray };
