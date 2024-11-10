import { DataType } from "@serenityjs/raknet";
import { BinaryStream } from "@serenityjs/binarystream";

import { BlockPosition } from "./block-position";

class CommandBlockSettings extends DataType {
  /**
   * The position of the command block.
   */
  public readonly position: BlockPosition;

  /**
   * The command mode of the command block.
   */
  public readonly commandMode: number;

  /**
   * Whether the command block is in redstone mode.
   */
  public readonly redstoneMode: boolean;

  /**
   * Whether the command block is in conditional mode.
   */
  public readonly conditionalMode: boolean;

  /**
   * Create a new command block settings data type.
   * @param position The position of the command block.
   * @param commandMode The command mode of the command block.
   * @param redstoneMode Whether the command block is in redstone mode.
   * @param conditionalMode Whether the command block is in conditional mode.
   */
  public constructor(
    position: BlockPosition,
    commandMode: number,
    redstoneMode: boolean,
    conditionalMode: boolean
  ) {
    super();
    this.position = position;
    this.commandMode = commandMode;
    this.redstoneMode = redstoneMode;
    this.conditionalMode = conditionalMode;
  }

  public static read(
    stream: BinaryStream,
    _: 0,
    isBlock: boolean
  ): CommandBlockSettings | null {
    // Check if the block is not a command block
    if (isBlock === false) return null;

    // Read the position
    const position = BlockPosition.read(stream);

    // Read the command mode
    const commandMode = stream.readVarInt();

    // Read the redstone mode
    const redstoneMode = stream.readBool();

    // Read the conditional mode
    const conditionalMode = stream.readBool();

    // Return the command block settings
    return new this(position, commandMode, redstoneMode, conditionalMode);
  }

  public static write(
    stream: BinaryStream,
    value: CommandBlockSettings,
    _: 0,
    isBlock: boolean
  ): void {
    // Check if the block is not a command block
    if (isBlock === false) return;

    // Write the position
    BlockPosition.write(stream, value.position);

    // Write the command mode
    stream.writeVarInt(value.commandMode);

    // Write the redstone mode
    stream.writeBool(value.redstoneMode);

    // Write the conditional mode
    stream.writeBool(value.conditionalMode);
  }
}

export { CommandBlockSettings };
