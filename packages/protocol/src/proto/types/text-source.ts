import { BinaryStream, DataType } from "@serenityjs/binarystream";
import { PacketDataTypeOptions } from "@serenityjs/raknet";

import { TextPacketType } from "../../enums";

class TextSource extends DataType {
  public static override read(
    stream: BinaryStream,
    options: PacketDataTypeOptions<TextPacketType>
  ): string | null {
    // Check if the type is Chat, Whisper or Announcement.
    return options.parameter === TextPacketType.Chat ||
      options.parameter === TextPacketType.Whisper ||
      options.parameter === TextPacketType.Announcement
      ? stream.readVarString()
      : null;
  }

  public static override write(
    stream: BinaryStream,
    value: string,
    options: PacketDataTypeOptions<TextPacketType>
  ): void {
    // Check if the type is Chat, Whisper or Announcement.
    if (
      options.parameter === TextPacketType.Chat ||
      options.parameter === TextPacketType.Whisper ||
      options.parameter === TextPacketType.Announcement
    ) {
      // Write the string to the stream.
      stream.writeVarString(value);
    }
  }
}

export { TextSource };
