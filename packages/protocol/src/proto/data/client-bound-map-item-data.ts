import { Proto, Serialize } from "@serenityjs/raknet";
import { Bool, Uint8, VarInt, ZigZong } from "@serenityjs/binarystream";

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

  @Serialize(Uint8)
  public dimension!: number;

  @Serialize(Bool)
  public isLocked!: boolean;

  @Serialize(BlockPosition)
  public origin!: BlockPosition;

  @Serialize(MapCreationBits, { parameter: "flags" })
  public mapIncludedIn!: Array<bigint> | null;

  @Serialize(MapScale, { parameter: "flags" })
  public scale!: number | null;

  @Serialize(MapTrackedItems, { parameter: "flags" })
  public trackedActors!: Array<MapTrackedItem> | null;

  @Serialize(MapDecorationBits, { parameter: "flags" })
  public decorations!: Array<MapDecoration> | null;

  @Serialize(MapTextureUpdateBits, { parameter: "flags" })
  public width!: number | null;

  @Serialize(MapTextureUpdateBits, { parameter: "flags" })
  public height!: number | null;

  @Serialize(MapTextureUpdateBits, { parameter: "flags" })
  public xCoordinate!: number | null;

  @Serialize(MapTextureUpdateBits, { parameter: "flags" })
  public yCoordinate!: number | null;

  @Serialize(MapTextureUpdateBits, { parameter: "flags" })
  public pixels!: Array<number> | null;
}

export { ClientBoundMapItemDataPacket };
