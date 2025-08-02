import { BinaryStream, DataType } from "@serenityjs/binarystream";
import { PacketDataTypeOptions } from "@serenityjs/raknet";

import { TextPacketType } from "../../enums";

class TextParameters extends DataType {
  public static read(
    stream: BinaryStream,
    options: PacketDataTypeOptions<TextPacketType>
  ): Array<string> | null {
    // Check if the type is Raw, Whisper or Announcement.
    if (
      options.parameter === TextPacketType.Translation ||
      options.parameter === TextPacketType.Popup ||
      options.parameter === TextPacketType.JukeboxPopup
    ) {
      // Prepare an array to store the parameters.
      const parameters: Array<string> = [];

      // Read the number of parameters.
      const amount = stream.readVarInt();

      // Loop through the amount of parameters.
      for (let index = 0; index < amount; index++) {
        // Read the parameter from the stream.
        parameters.push(stream.readVarString());
      }

      // Return the parameters.
      return parameters;
    } else {
      // Return null.
      return null;
    }
  }

  public static write(
    stream: BinaryStream,
    value: Array<string>,
    options: PacketDataTypeOptions<TextPacketType>
  ): void {
    // Check if the type is Raw, Whisper or Announcement.
    if (
      options.parameter === TextPacketType.Translation ||
      options.parameter === TextPacketType.Popup ||
      options.parameter === TextPacketType.JukeboxPopup
    ) {
      // Write the number of parameters.
      stream.writeVarInt(value.length);

      // Loop through the parameters.
      for (const parameter of value) {
        // Write the parameter to the stream.
        stream.writeVarString(parameter);
      }
    }
  }
}

export { TextParameters };
