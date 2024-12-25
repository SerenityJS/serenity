import { BinaryStream } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";

import { Color } from "./color";

class MapPixel extends DataType {
  public x: number;
  public y: number;
  public color: Color;

  public constructor(x: number, y: number, color: Color) {
    super();
    this.x = x;
    this.y = y;
    this.color = color;
  }

  public static write(stream: BinaryStream, value: Array<MapPixel>): void {
    stream.writeVarInt(value.length);

    for (const pixel of value) {
      stream.writeInt32(pixel.color.toInt());
      stream.writeUint16(pixel.x + pixel.y * 128);
    }
  }

  public static read(stream: BinaryStream): Array<MapPixel> | null {
    const size = stream.readVarInt();
    const result: Array<MapPixel> = [];

    for (let i = 0; i < size; i++) {
      const color = stream.readInt32();
      const index = stream.readUint16();

      const x = index % 128;
      const y = index / 128;
      result.push(new MapPixel(x, y, Color.fromInt(color)));
    }
    return result;
  }
}

export { MapPixel };
