import { BinaryStream, Endianness } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";

import { BlockUpdate } from "./block-update";

export class SubchunkBlocks extends DataType {
  public blocks: Array<BlockUpdate> = [];

  public constructor(blocks: Array<BlockUpdate>) {
    super();
    this.blocks = blocks;
  }

  public static override write(
    stream: BinaryStream,
    value: SubchunkBlocks,
    _: Endianness
  ): void {
    stream.writeVarInt(value.blocks.length);
    for (const block of value.blocks) {
      BlockUpdate.write(stream, block, _);
    }
  }

  public static read(stream: BinaryStream): SubchunkBlocks {
    const blocks: Array<BlockUpdate> = [];
    const length = stream.readVarInt();
    for (let i = 0; i < length; i++) {
      const block = BlockUpdate.read(stream);
      blocks.push(block);
    }
    const subchunk = new SubchunkBlocks(blocks);
    return subchunk;
  }
}
