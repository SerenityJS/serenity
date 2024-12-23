import { Proto, Serialize } from "@serenityjs/raknet";
import {
  Bool,
  Byte,
  Endianness,
  VarInt,
  ZigZong
} from "@serenityjs/binarystream";

import { Packet } from "../../enums";
import {
  BlockPosition,
  MapCreationBits,
  MapDecoration,
  MapDecorationBits,
  MapScale,
  MapTextureUpdateBits,
  MapTrackedItems
} from "../types";
import { MapTrackedItem } from "../types/map-tracked-item";

import { DataPacket } from "./data-packet";

@Proto(Packet.ClientBoundMapItemData)
class ClientBoundMapItemDataPacket extends DataPacket {
  @Serialize(ZigZong)
  public mapId!: bigint;

  @Serialize(VarInt)
  public flags!: number;

  @Serialize(Byte)
  public dimension!: number;

  @Serialize(Bool)
  public isLocked!: boolean;

  @Serialize(BlockPosition)
  public origin!: BlockPosition;

  @Serialize(MapCreationBits, Endianness.Little, "flags")
  public mapIncludedIn!: Array<bigint> | null;

  @Serialize(MapScale, Endianness.Little, "flags")
  public scale!: number | null;

  @Serialize(MapTrackedItems, Endianness.Little, "flags")
  public trackedActors!: Array<MapTrackedItem> | null;

  @Serialize(MapDecorationBits, Endianness.Little, "flags")
  public decorations!: Array<MapDecoration> | null;

  @Serialize(MapTextureUpdateBits, Endianness.Little, "flags")
  public width!: number | null;

  @Serialize(MapTextureUpdateBits, Endianness.Little, "flags")
  public height!: number | null;

  @Serialize(MapTextureUpdateBits, Endianness.Little, "flags")
  public xCoordinate!: number | null;

  @Serialize(MapTextureUpdateBits, Endianness.Little, "flags")
  public yCoordinate!: number | null;

  @Serialize(MapTextureUpdateBits, Endianness.Little, "flags")
  public pixels!: Array<number> | null;
}

export { ClientBoundMapItemDataPacket };
