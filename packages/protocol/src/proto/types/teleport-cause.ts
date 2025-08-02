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

  public static override read(
    stream: BinaryStream,
    options: PacketDataTypeOptions<MoveMode>
  ): TeleportCause | null {
    if (options.parameter === MoveMode.Teleport) {
      const cause = stream.readInt32(Endianness.Little);
      const sourceEntityType = stream.readInt32(Endianness.Little);

      return new TeleportCause(cause, sourceEntityType);
    } else {
      return null;
    }
  }

  public static override write(
    stream: BinaryStream,
    value: TeleportCause,
    options: PacketDataTypeOptions<MoveMode>
  ): void {
    if (options.parameter === MoveMode.Teleport) {
      stream.writeInt32(value.cause, Endianness.Little);
      stream.writeInt32(value.sourceEntityType, Endianness.Little);
    }
  }
}

export { TeleportCause };
