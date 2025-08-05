import { BinaryStream, DataType } from "@serenityjs/binarystream";
import { PacketDataTypeOptions } from "@serenityjs/raknet";
import { SubChunkPacket } from "../data";
import { SubChunkEntryWithoutCache } from "./subchunk-entry-without-cache";

export class SubChunkEntry extends DataType {
  public static read(
    stream: BinaryStream,
    options?: PacketDataTypeOptions<SubChunkPacket>
  ): Array<SubChunkEntryWithoutCache> | null {
    if (options?.parameter) {
      return null; // TODO! Cache Enabled SubChunks
    }
    if (!options?.parameter) {
      return SubChunkEntryWithoutCache.read(stream);
    }
    return null;
  }

}
