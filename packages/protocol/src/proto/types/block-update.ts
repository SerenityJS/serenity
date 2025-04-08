import { BinaryStream, Endianness } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";

import { BlockPosition } from "./block-position";

export class BlockUpdate extends DataType {
  public position!: BlockPosition;
  public runtimeId!: number;
  public flags!: number;
  public uniqueId!: bigint;
  public type!: number;

  public constructor(
    position: BlockPosition,
    runtimeId: number,
    flags: number,
    uniqueId: bigint,
    type: number
  ) {
    super();
    this.position = position;
    this.runtimeId = runtimeId;
    this.flags = flags;
    this.uniqueId = uniqueId;
    this.type = type;
  }

  public static override write(
    stream: BinaryStream,
    value: BlockUpdate,
    _: Endianness
  ): void {
    BlockPosition.write(stream, value.position);
    stream.writeVarInt(value.runtimeId);
    stream.writeVarInt(value.flags);
    stream.writeZigZong(value.uniqueId);
    stream.writeVarInt(value.type);
  }

  public static read(stream: BinaryStream): BlockUpdate {
    const block = new BlockUpdate(
      BlockPosition.read(stream),
      stream.readVarInt(),
      stream.readVarInt(),
      stream.readZigZong(),
      stream.readVarInt()
    );
    return block;
  }
}
