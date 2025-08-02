import { BinaryStream, DataType } from "@serenityjs/binarystream";
import { PacketDataTypeOptions } from "@serenityjs/raknet";

class MapTextureUpdateBits extends DataType {
  public static write(
    stream: BinaryStream,
    value: number | Array<number>,
    options: PacketDataTypeOptions<number>
  ): void {
    if ((options.parameter && options.parameter & 0x2) == 0x0) return;
    if (Array.isArray(value)) {
      stream.writeVarInt(value.length);

      for (const bit of value) {
        stream.writeVarInt(bit);
      }
      return;
    }
    stream.writeZigZag(value);
  }
}

export { MapTextureUpdateBits };
