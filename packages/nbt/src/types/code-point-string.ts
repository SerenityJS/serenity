import { BinaryStream, Endianness } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";

class CodePointString extends DataType {
  public static read(
    stream: BinaryStream,
    varint: number | boolean = false
  ): string {
    // Read the length of the string.
    const length = varint
      ? stream.readVarInt()
      : stream.readShort(Endianness.Little);

    // Read the string from the stream.
    const buffer = stream.readBuffer(length);

    // Return the string from the buffer.
    return String.fromCodePoint(...buffer);
  }

  public static write(
    stream: BinaryStream,
    value: string,
    varint: number | boolean = false
  ): void {
    // Write the length of the string.
    if (varint) {
      stream.writeVarInt(value.length);
    } else {
      stream.writeShort(value.length, Endianness.Little);
    }

    // Write the string to the stream.
    stream.writeBuffer(Buffer.from(value, "utf-8"));
  }
}

export { CodePointString };
