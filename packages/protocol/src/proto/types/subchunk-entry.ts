import { BinaryStream, DataType } from "@serenityjs/binarystream";
import { PacketDataTypeOptions } from "@serenityjs/raknet";

import { SubChunkPacket } from "../data";

import { SubChunkEntryWithCache } from "./subchunk-entry-with-cache";
import { SubChunkEntryWithoutCache } from "./subchunk-entry-without-cache";

export class SubChunkEntry extends DataType {
  public static read(
    stream: BinaryStream,
    options?: PacketDataTypeOptions<SubChunkPacket>
  ): Array<SubChunkEntryWithoutCache> | Array<SubChunkEntryWithCache> | null {
    if (options?.parameter) {
      return SubChunkEntryWithCache.read(stream);
    }
    if (!options?.parameter) {
      return SubChunkEntryWithoutCache.read(stream);
    }
    return null;
  }
}
