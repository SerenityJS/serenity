import { type BinaryStream, DataType } from "@serenityjs/binarystream";

import { CommandPermissionLevel } from "../../enums";

/**
 * A command permission level written as its index, as the abilities of players are.
 * The available commands write the level's name instead, which is what the enum holds.
 */
class CommandPermission extends DataType {
  /**
   * The command permission levels, in the order of their indexes.
   */
  private static readonly levels = Object.values(CommandPermissionLevel);

  public static read(stream: BinaryStream): CommandPermissionLevel {
    // Read the index of the command permission level
    const index = stream.readUint8();

    // Get the command permission level of the index
    const level = this.levels[index];
    if (!level) throw new Error(`Unknown command permission level: ${index}`);

    // Return the command permission level
    return level;
  }

  public static write(
    stream: BinaryStream,
    value: CommandPermissionLevel
  ): void {
    // Get the index of the command permission level
    const index = this.levels.indexOf(value);
    if (index === -1)
      throw new Error(`Unknown command permission level: ${value}`);

    // Write the index of the command permission level
    stream.writeUint8(index);
  }
}

export { CommandPermission };
