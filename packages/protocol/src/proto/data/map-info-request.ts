import { ZigZong } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";
import { MapPixel } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.MapInfoRequest)
class MapInfoRequestPacket extends DataPacket {
  @Serialize(ZigZong)
  public mapId!: bigint;

  @Serialize(MapPixel)
  public mapPixels!: Array<MapPixel>;
}

export { MapInfoRequestPacket };
