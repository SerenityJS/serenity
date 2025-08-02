import { BinaryStream, Endianness, DataType } from "@serenityjs/binarystream";
import { PacketDataTypeOptions } from "@serenityjs/raknet";

import { PlayerUpdateEntityOverridesType } from "../../enums";

class PlayerUpdateEntityOverridesValue extends DataType {
  public static read(
    stream: BinaryStream,
    options: PacketDataTypeOptions<PlayerUpdateEntityOverridesType>
  ): number | null {
    // Check if the update type is a int override
    if (options.parameter === PlayerUpdateEntityOverridesType.SetIntOverride)
      return stream.readInt32(Endianness.Little);

    // Check if the update type is a float override
    if (options.parameter === PlayerUpdateEntityOverridesType.SetFloatOverride)
      return stream.readFloat32(Endianness.Little);

    // Return null if the update type is not a int or float override
    return null;
  }

  public static write(
    stream: BinaryStream,
    value: number | null,
    options: PacketDataTypeOptions<PlayerUpdateEntityOverridesType>
  ): void {
    // Check if the update type is a int override
    if (options.parameter === PlayerUpdateEntityOverridesType.SetIntOverride)
      stream.writeInt32(value as number, Endianness.Little);

    // Check if the update type is a float override
    if (options.parameter === PlayerUpdateEntityOverridesType.SetFloatOverride)
      stream.writeFloat32(value as number, Endianness.Little);
  }
}

export { PlayerUpdateEntityOverridesValue };
