import { Endianness, DataType, BinaryStream } from "@serenityjs/binarystream";
import { PacketDataTypeOptions } from "@serenityjs/raknet";

import { AnimateId } from "../../enums";

class AnimateAction extends DataType {
  public static read(
    stream: BinaryStream,
    options?: PacketDataTypeOptions
  ): number | null {
    // Check if the id is RowRight or RowLeft.
    if (
      options?.parameter === AnimateId.RowRight ||
      options?.parameter === AnimateId.RowLeft
    ) {
      // Read the boat rowing time
      return stream.readFloat32(Endianness.Little);
    }

    // Return null if the id is not RowRight or RowLeft.
    return null;
  }

  public static write(stream: BinaryStream, value: number | null): void {
    // Check if the value is not null.
    if (value !== null) {
      // Write the boat rowing time.
      stream.writeFloat32(value, Endianness.Little);
    }
  }
}

export { AnimateAction };
