import { BinaryStream, DataType } from "@serenityjs/binarystream";

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
    stream.writeUint8(value.type);
    stream.writeUint8(value.rotation);
    stream.writeUint8(value.x);
    stream.writeUint8(value.y);
    stream.writeVarString(value.label);
    stream.writeVarInt(value.color);
  }

  public static read(stream: BinaryStream): MapDecoration {
    return new MapDecoration(
      stream.readUint8(), // ? Type
      stream.readUint8(), // ? Rotation
      stream.readUint8(), // ? X
      stream.readUint8(), // ? Y
      stream.readVarString(), // ? Label
      stream.readVarInt() // ? Color
    );
  }
}

export { MapDecoration };
