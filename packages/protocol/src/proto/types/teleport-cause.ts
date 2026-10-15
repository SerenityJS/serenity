import { BinaryStream, Endianness, DataType } from "@serenityjs/binarystream";
import { PacketDataTypeOptions } from "@serenityjs/raknet";

import { MoveMode } from "../../enums";

class TeleportCause extends DataType {
  public cause: number;
  public sourceEntityType: number;

  public constructor(cause: number, sourceEntityType: number) {
    super();
    this.cause = cause;
    this.sourceEntityType = sourceEntityType;
  }

  // NOTE: Since v2168, the teleport data is optional and preceded by a presence flag,
  // which is only set when the move mode is `MoveMode.Teleport`.

  public static override read(
    stream: BinaryStream,
    _options?: PacketDataTypeOptions<MoveMode>
  ): TeleportCause | null {
    // Check if the teleport data is present
    if (!stream.readBool()) return null;

    // Read the cause and the source entity type
    const cause = stream.readInt32(Endianness.Little);
    const sourceEntityType = stream.readInt32(Endianness.Little);

    return new TeleportCause(cause, sourceEntityType);
  }

  public static override write(
    stream: BinaryStream,
    value: TeleportCause | null,
    options: PacketDataTypeOptions<MoveMode>
  ): void {
    // The teleport data is only present when teleporting
    const present = options.parameter === MoveMode.Teleport;
    stream.writeBool(present);

    // Write the cause and the source entity type, defaulting to 0
    if (present) {
      stream.writeInt32(value?.cause ?? 0, Endianness.Little);
      stream.writeInt32(value?.sourceEntityType ?? 0, Endianness.Little);
    }
  }
}

export { TeleportCause };
