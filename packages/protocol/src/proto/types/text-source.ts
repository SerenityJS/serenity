import { DataType } from "@serenityjs/raknet";

import { TextPacketType } from "../../enums";

import type { BinaryStream, Endianness } from "@serenityjs/binarystream";

class TextSource extends DataType {
  public static override read(
    stream: BinaryStream,
    _: Endianness,
    type: TextPacketType
  ): string | null {
    // Check if the type is Chat, Whisper or Announcement.
    return type === TextPacketType.Chat ||
      type === TextPacketType.Whisper ||
      type === TextPacketType.Announcement
      ? stream.readVarString()
      : null;
  }

  public static override write(
    stream: BinaryStream,
    value: string,
    _: Endianness,
    type: TextPacketType
  ): void {
    // Check if the type is Chat, Whisper or Announcement.
    if (
      type === TextPacketType.Chat ||
      type === TextPacketType.Whisper ||
      type === TextPacketType.Announcement
    ) {
      // Write the string to the stream.
      stream.writeVarString(value);
    }
  }
}

export { TextSource };
