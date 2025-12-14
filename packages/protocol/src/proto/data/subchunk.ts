import { Bool, ZigZag } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { DimensionType, Packet } from "../../enums";
import { SubChunkRequestEntry, SubChunkPosition } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.SubChunk)
export class SubChunkPacket extends DataPacket {
  @Serialize(Bool) public cacheEnabled!: boolean;

  @Serialize(ZigZag) public dimension!: DimensionType;

  @Serialize(SubChunkPosition) public position!: SubChunkPosition;

  @Serialize(SubChunkRequestEntry, { parameter: "cacheEnabled" })
  public results!: Array<SubChunkRequestEntry>;
}
