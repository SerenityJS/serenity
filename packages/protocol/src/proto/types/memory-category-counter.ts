import { BinaryStream, DataType, Endianness } from "@serenityjs/binarystream";

class MemoryCategoryCounter extends DataType {
  public category: number;
  public bytes: bigint;

  public constructor(category: number, bytes: bigint) {
    super();
    this.category = category;
    this.bytes = bytes;
  }

  public static read(stream: BinaryStream): MemoryCategoryCounter {
    return new this(
      stream.readUint8(),
      stream.readUint64(Endianness.Little)
    );
  }

  public static write(stream: BinaryStream, value: MemoryCategoryCounter): void {
    stream.writeUint8(value.category);
    stream.writeUint64(value.bytes, Endianness.Little);
  }
}

export { MemoryCategoryCounter };
