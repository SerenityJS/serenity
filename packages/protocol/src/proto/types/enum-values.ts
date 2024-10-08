import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binarystream";

/**
 * Represents the enum values of a available command packet.
 */
class EnumValues extends DataType {
  public static read(stream: BinaryStream): Array<string> {
    // Prepare an array to store the enum values.
    const enumValues: Array<string> = [];

    // Read the number of enum values.
    const amount = stream.readVarInt();

    // We then loop through the amount of enum values.
    // Reading the string from the stream.
    for (let index = 0; index < amount; index++) {
      enumValues.push(stream.readVarString());
    }

    // Return the enum values.
    return enumValues;
  }

  public static write(stream: BinaryStream, enumValues: Array<string>): void {
    // Write the number of enum values.
    stream.writeVarInt(enumValues.length);

    // We then loop through the enum values.
    // Writing the string to the stream.
    for (const value of enumValues) {
      stream.writeVarString(value);
    }
  }
}

export { EnumValues };
