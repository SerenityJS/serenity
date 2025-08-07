import { Bool, ZigZag } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { DimensionType, Packet } from "../../enums";
import { SubChunkEntry, SubChunkEntryWithoutCache, Vector3i } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.SubChunk)
export class SubChunkPacket extends DataPacket {
  @Serialize(Bool) public cacheEnabled!: boolean;
  @Serialize(ZigZag) public dimension!: DimensionType;
  @Serialize(Vector3i) public origin!: Vector3i;
  @Serialize(SubChunkEntry) public entries!: Array<SubChunkEntryWithoutCache>;
}
