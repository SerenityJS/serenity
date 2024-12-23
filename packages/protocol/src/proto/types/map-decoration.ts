import { BinaryStream } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";

import { MapDecorationType } from "../../enums";

class MapDecoration extends DataType {
  public type: MapDecorationType;

  public rotation: number;

  public x: number;

  public y: number;

  public label: string;

  public color: number;

  public constructor(
    type: number,
    rotation: number,
    x: number,
    y: number,
    label: string,
    color: number
  ) {
    super();
    this.type = type;
    this.rotation = rotation;
    this.x = x;
    this.y = y;
    this.label = label;
    this.color = color;
  }

  public static write(stream: BinaryStream, value: MapDecoration): void {
    stream.writeByte(value.type);
    stream.writeByte(value.rotation);
    stream.writeByte(value.x);
    stream.writeByte(value.y);
    stream.writeVarString(value.label);
    stream.writeVarInt(value.color);
  }

  public static read(stream: BinaryStream): MapDecoration {
    return new MapDecoration(
      stream.readByte(), // ? Type
      stream.readByte(), // ? Rotation
      stream.readByte(), // ? X
      stream.readByte(), // ? Y
      stream.readVarString(), // ? Label
      stream.readVarInt() // ? Color
    );
  }
}

export { MapDecoration };
