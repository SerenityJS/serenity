import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binarystream";

class VariableStringArray extends DataType {
  public static override read(stream: BinaryStream): Array<string> {
    // Prepare an array to store the strings.
    const strings: Array<string> = [];

    // Read the number of strings
    const amount = stream.readVarInt();

    // We then loop through the amount of strings
    // Reading the string from the stream.
    for (let index = 0; index < amount; index++) {
      // Read the string and push it to the array.
      strings.push(stream.readVarString());
    }

    // Return the strings.
    return strings;
  }

  public static override write(
    stream: BinaryStream,
    value: Array<string>
  ): void {
    // Write the number of strings given in the array.
    stream.writeVarInt(value.length);

    // Write all the strings to the stream.
    for (const string of value) stream.writeVarString(string);
  }
}

export { VariableStringArray as VarStringArray };
