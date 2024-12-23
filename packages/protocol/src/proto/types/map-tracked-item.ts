import { DataType } from "@serenityjs/raknet";
import { BinaryStream } from "@serenityjs/binarystream";

import { ItemTrackedType } from "../../enums";

import { BlockPosition } from "./block-position";

class MapTrackedItem extends DataType {
  public type: ItemTrackedType;
  public uniqueId?: bigint;
  public position?: BlockPosition;

  public constructor(
    type: number,
    uniqueId?: bigint,
    position?: BlockPosition
  ) {
    super();
    this.type = type;
    this.uniqueId = uniqueId;
    this.position = position;
  }

  public static write(stream: BinaryStream, value: MapTrackedItem): void {
    stream.writeUint8(value.type);

    if (value.type == 0) {
      stream.writeZigZong(value.uniqueId!);
    } else if (value.type == 1) {
      BlockPosition.write(stream, value.position!);
    }
  }

  public static read(stream: BinaryStream): MapTrackedItem {
    const type = stream.readUint8();
    let uniqueId: bigint | undefined;
    let position: BlockPosition | undefined;

    if (type == 0) {
      uniqueId = stream.readZigZong();
    } else if (type == 1) {
      position = BlockPosition.read(stream);
    }

    return new MapTrackedItem(type, uniqueId, position);
  }
}

export { MapTrackedItem };
