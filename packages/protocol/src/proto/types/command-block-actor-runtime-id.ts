import { BinaryStream } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";

class CommandBlockActorRuntimeId extends DataType {
  public static read(
    stream: BinaryStream,
    _: 0,
    isBlock: boolean
  ): bigint | null {
    // Check if the block is not a command block
    if (isBlock === true) return null;

    // Read the runtime ID
    return stream.readVarLong();
  }

  public static write(
    stream: BinaryStream,
    value: bigint,
    _: 0,
    isBlock: boolean
  ): void {
    // Check if the block is not a command block
    if (isBlock === false) return;

    // Write the runtime ID
    stream.writeVarLong(value);
  }
}

export { CommandBlockActorRuntimeId };
