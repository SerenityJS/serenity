import { Endianness, DataType, BinaryStream } from "@serenityjs/binarystream";

import { CommandPermissionLevel } from "../../enums";

interface CommandsOverload {
  chaining: boolean;
  parameters: Array<OverloadParameter>;
}

interface OverloadParameter {
  symbol: number;
  name: string;
  optional: boolean;
  options: number;
}

/**
 * Represents the commands of a available command packet.
 */
class Commands extends DataType {
  /**
   * The name of the command.
   */
  public readonly name: string;

  /**
   * The description of the command.
   */
  public readonly description: string;

  /**
   * The flags of the command. Setting this value to 1 will make the command blue.
   */
  public readonly flags: number;

  /**
   * The permission level of the command.
   */
  public readonly permissionLevel: CommandPermissionLevel;

  /**
   * The alias of the command.
   */
  public readonly alias: number;

  /**
   * The subcommands of the command.
   */
  public readonly subcommands: Array<number>;

  /**
   * The overloads of the command.
   */
  public readonly overloads: Array<CommandsOverload>;

  public constructor(
    name: string,
    description: string,
    flags: number,
    permissionLevel: CommandPermissionLevel,
    alias: number,
    subcommands: Array<number>,
    overloads: Array<CommandsOverload>
  ) {
    super();
    this.name = name;
    this.description = description;
    this.flags = flags;
    this.permissionLevel = permissionLevel;
    this.alias = alias;
    this.subcommands = subcommands;
    this.overloads = overloads;
  }

  public static override read(stream: BinaryStream): Array<Commands> {
    // Prepare an array to store the commands.
    const commands: Array<Commands> = [];

    // Read the number of commands.
    const amount = stream.readVarInt();

    // We then loop through the amount of commands.
    // Reading the string from the stream.
    for (let index = 0; index < amount; index++) {
      // Read the fields and push it to the array.
      const name = stream.readVarString();
      const description = stream.readVarString();
      const flags = stream.readUint16(Endianness.Little);
      const permissionLevel = stream.readVarString() as CommandPermissionLevel;
      const alias = stream.readInt32(Endianness.Little);

      // Prepare an array to store the subcommands.
      const subcommands: Array<number> = [];

      // Read the number of subcommands.
      const subcommandsAmount = stream.readVarInt();

      // We then loop through the amount of subcommands.
      for (let index = 0; index < subcommandsAmount; index++) {
        // Read the subcommand and push it to the array.
        subcommands.push(stream.readUint16(Endianness.Little));
      }

      // Prepare an array to store the overloads.
      const overloads: Array<CommandsOverload> = [];

      // Read the number of overloads.
      const overloadsAmount = stream.readVarInt();

      // We then loop through the amount of overloads.
      for (let index = 0; index < overloadsAmount; index++) {
        // Read the chaining and parameters.
        const chaining = stream.readBool();
        const parameters: Array<OverloadParameter> = [];

        // Read the number of parameters.
        const parametersAmount = stream.readVarInt();

        // We then loop through the amount of parameters.
        for (let k = 0; k < parametersAmount; k++) {
          // Read the parameter and push it to the array.
          const name = stream.readVarString();
          const symbol = stream.readUint32(Endianness.Little);
          const optional = stream.readBool();
          const options = stream.readUint8();

          parameters.push({ symbol, name, optional, options });
        }

        overloads.push({ chaining, parameters });
      }

      commands.push(
        new Commands(
          name,
          description,
          flags,
          permissionLevel,
          alias,
          subcommands,
          overloads
        )
      );
    }

    // Return the commands.
    return commands;
  }

  public static override write(
    stream: BinaryStream,
    value: Array<Commands>
  ): void {
    // Write the number of commands given in the array.
    stream.writeVarInt(value.length);

    // Write all the commands to the stream.
    for (const {
      name,
      description,
      flags,
      permissionLevel,
      alias,
      subcommands,
      overloads
    } of value) {
      stream.writeVarString(name);
      stream.writeVarString(description);
      stream.writeUint16(flags, Endianness.Little);
      stream.writeVarString(permissionLevel);
      stream.writeInt32(alias, Endianness.Little);

      stream.writeVarInt(subcommands.length);
      for (const subcommand of subcommands) {
        stream.writeUint16(subcommand, Endianness.Little);
      }

      stream.writeVarInt(overloads.length);
      for (const { chaining, parameters } of overloads) {
        stream.writeBool(chaining);

        stream.writeVarInt(parameters.length);
        for (const { name, symbol, optional, options } of parameters) {
          stream.writeVarString(name);
          stream.writeUint32(symbol, Endianness.Little);
          stream.writeBool(optional);
          stream.writeUint8(options);
        }
      }
    }
  }
}

export { Commands };
