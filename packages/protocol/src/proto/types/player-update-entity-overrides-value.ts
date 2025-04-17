import { BinaryStream, Endianness } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";

import { PlayerUpdateEntityOverridesType } from "../../enums";

class PlayerUpdateEntityOverridesValue extends DataType {
  public static read(
    stream: BinaryStream,
    _: 0,
    updateType: PlayerUpdateEntityOverridesType
  ): number | null {
    // Check if the update type is a int override
    if (updateType === PlayerUpdateEntityOverridesType.SetIntOverride) {
      return stream.readInt32(Endianness.Little);
    }

    // Check if the update type is a float override
    if (updateType === PlayerUpdateEntityOverridesType.SetFloatOverride) {
      return stream.readFloat32(Endianness.Little);
    }

    // Return null if the update type is not a int or float override
    return null;
  }

  public static write(
    stream: BinaryStream,
    value: number | null,
    _: 0,
    updateType: PlayerUpdateEntityOverridesType
  ): void {
    // Check if the update type is a int override
    if (updateType === PlayerUpdateEntityOverridesType.SetIntOverride) {
      stream.writeInt32(value as number, Endianness.Little);
    }

    // Check if the update type is a float override
    if (updateType === PlayerUpdateEntityOverridesType.SetFloatOverride) {
      stream.writeFloat32(value as number, Endianness.Little);
    }
  }
}

export { PlayerUpdateEntityOverridesValue };
