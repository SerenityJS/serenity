import { BinaryStream, DataType } from "@serenityjs/binarystream";
import { PacketDataTypeOptions } from "@serenityjs/raknet";

class CommandBlockActorRuntimeId extends DataType {
  public static read(
    stream: BinaryStream,
    options?: PacketDataTypeOptions<boolean>
  ): bigint | null {
    // Check if the block is not a command block
    if (options?.parameter === true) return null;

    // Read the runtime ID
    return stream.readVarLong();
  }

  public static write(
    stream: BinaryStream,
    value: bigint,
    options?: PacketDataTypeOptions<boolean>
  ): void {
    // Check if the block is not a command block
    if (options?.parameter === false) return;

    // Write the runtime ID
    stream.writeVarLong(value);
  }
}

export { CommandBlockActorRuntimeId };
