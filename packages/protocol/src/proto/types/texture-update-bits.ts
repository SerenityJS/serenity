import { BinaryStream, Endianness } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";

class MapTextureUpdateBits extends DataType {
  public static write(
    stream: BinaryStream,
    value: number | Array<number>,
    _: Endianness,
    parameter: number
  ): void {
    if ((parameter & 0x2) == 0x0) return;
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
