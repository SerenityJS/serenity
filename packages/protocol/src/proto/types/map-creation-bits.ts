import { BinaryStream, Endianness } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";

class MapCreationBits extends DataType {
  public static write(
    stream: BinaryStream,
    value: Array<bigint>,
    _: Endianness,
    parameter: number
  ): void {
    if ((parameter & 0x8) == 0x0) return;
    stream.writeVarInt(value.length);

    for (const bit of value) {
      stream.writeZigZong(bit);
    }
  }

  public static read(
    stream: BinaryStream,
    _: Endianness,
    parameter: number
  ): Array<bigint> | null {
    if ((parameter & 0x8) == 0x0) return null;
    const amount = stream.readVarInt();
    const bits: Array<bigint> = [];

    for (let index = 0; index < amount; index++) {
      bits.push(stream.readZigZong());
    }

    return bits;
  }
}

export { MapCreationBits };
