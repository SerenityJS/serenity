import { BinaryStream, Endianness } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";

class MapScale extends DataType {
  public static write(
    stream: BinaryStream,
    value: number,
    _: Endianness,
    parameter: number
  ): void {
    if ((parameter & (0x2 | 0x4 | 0x8)) == 0) return;

    stream.writeByte(value);
  }

  public static read(
    stream: BinaryStream,
    _: Endianness,
    parameter: number
  ): number | null {
    if ((parameter & (0x2 | 0x4 | 0x8)) == 0) return null;
    return stream.readByte();
  }

  private static checkFlag(flags: number, flag: number): boolean {
    return (flags & flag) === flag;
  }
}

export { MapScale };
