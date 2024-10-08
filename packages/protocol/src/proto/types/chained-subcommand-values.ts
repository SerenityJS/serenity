import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binarystream";

/**
 * Represents the chained subcommand values of a available command packet.
 */
class ChainedSubcommandValues extends DataType {
  public static read(stream: BinaryStream): Array<string> {
    // Prepare an array to store the chained subcommand values.
    const chainedSubcommandValues: Array<string> = [];

    // Read the number of chained subcommand values.
    const amount = stream.readVarInt();

    // We then loop through the amount of chained subcommand values.
    // Reading the string from the stream.
    for (let index = 0; index < amount; index++) {
      chainedSubcommandValues.push(stream.readVarString());
    }

    // Return the chained subcommand values.
    return chainedSubcommandValues;
  }

  public static write(
    stream: BinaryStream,
    chainedSubcommandValues: Array<string>
  ): void {
    // Write the number of chained subcommand values.
    stream.writeVarInt(chainedSubcommandValues.length);

    // We then loop through the chained subcommand values.
    // Writing the string to the stream.
    for (const value of chainedSubcommandValues) {
      stream.writeVarString(value);
    }
  }
}

export { ChainedSubcommandValues };
