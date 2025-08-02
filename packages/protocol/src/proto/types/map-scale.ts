import { BinaryStream, DataType } from "@serenityjs/binarystream";
import { PacketDataTypeOptions } from "@serenityjs/raknet";

class MapScale extends DataType {
  public static write(
    stream: BinaryStream,
    value: number,
    options?: PacketDataTypeOptions<number>
  ): void {
    if ((options?.parameter && options.parameter & (0x2 | 0x4 | 0x8)) == 0)
      return;

    stream.writeUint8(value);
  }

  public static read(
    stream: BinaryStream,
    options?: PacketDataTypeOptions<number>
  ): number | null {
    if ((options?.parameter && options.parameter & (0x2 | 0x4 | 0x8)) == 0)
      return null;
    return stream.readUint8();
  }

  private static checkFlag(flags: number, flag: number): boolean {
    return (flags & flag) === flag;
  }
}

export { MapScale };
