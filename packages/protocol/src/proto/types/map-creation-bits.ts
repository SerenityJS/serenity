import { BinaryStream, DataType } from "@serenityjs/binarystream";
import { PacketDataTypeOptions } from "@serenityjs/raknet";

class MapCreationBits extends DataType {
  public static write(
    stream: BinaryStream,
    value: Array<bigint>,
    options?: PacketDataTypeOptions<number>
  ): void {
    if ((options?.parameter && options.parameter & 0x8) == 0x0) return;
    stream.writeVarInt(value.length);

    for (const bit of value) {
      stream.writeZigZong(bit);
    }
  }

  public static read(
    stream: BinaryStream,
    options?: PacketDataTypeOptions<number>
  ): Array<bigint> | null {
    if ((options?.parameter && options.parameter & 0x8) == 0x0) return null;
    const amount = stream.readVarInt();
    const bits: Array<bigint> = [];

    for (let index = 0; index < amount; index++) {
      bits.push(stream.readZigZong());
    }

    return bits;
  }
}

export { MapCreationBits };
