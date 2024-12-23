import { BinaryStream, Endianness } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";

import { MapTrackedItem } from "./map-tracked-item";

import { MapDecoration } from ".";

class MapDecorationBits extends DataType {
  public static write(
    stream: BinaryStream,
    value: Array<MapDecoration>,
    _: Endianness,
    parameter: number
  ): void {
    if ((parameter & 0x4) == 0x0) return;
    stream.writeVarInt(value.length);

    for (const item of value) {
      MapDecoration.write(stream, item as MapDecoration);
    }
  }

  public static read(
    stream: BinaryStream,
    _: Endianness,
    parameter: number
  ): Array<MapTrackedItem> | Array<MapDecoration> | null {
    if ((parameter & 0x4) == 0x0) return null;
    const count = stream.readVarInt();
    const result: Array<MapDecoration> = [];

    for (let i = 0; i < count; i++) {
      result.push(MapDecoration.read(stream));
    }
    return result;
  }
}

class MapTrackedItems extends DataType {
  public static write(
    stream: BinaryStream,
    value: Array<MapTrackedItem>,
    _: Endianness,
    parameter: number
  ): void {
    if ((parameter & 0x4) == 0x0) return;
    stream.writeVarInt(value.length);

    for (const item of value) {
      MapTrackedItem.write(stream, item);
    }
  }

  public static read(
    stream: BinaryStream,
    _: Endianness,
    parameter: number
  ): Array<MapTrackedItem> | null {
    if ((parameter & 0x4) == 0x0) return null;
    const count = stream.readVarInt();

    const result: Array<MapTrackedItem> = [];

    for (let i = 0; i < count; i++) {
      result.push(MapTrackedItem.read(stream));
    }

    return result;
  }
}

export { MapDecorationBits, MapTrackedItems };
