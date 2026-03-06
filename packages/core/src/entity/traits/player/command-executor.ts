import {
  AvailableCommandsPacket,
  CommandPermissionLevel
} from "@serenityjs/protocol";

import { EntityIdentifier } from "../../../enums";
import { Command, type CustomEnum, SoftEnum } from "../../../commands";

import { PlayerTrait } from "./trait";

class PlayerCommandExecutorTrait extends PlayerTrait {
  public static readonly identifier = "command-executor";

  public static readonly types = [EntityIdentifier.Player];

  /**
   * The available commands that the player can execute.
   */
  public get availableCommands(): Array<Command> {
    // Get the world and serenity instance
    const world = this.player.world;
    const serenity = world.serenity;

    // Filter out all commands that the player does not have permission to execute
    const availableCommands = world.commandPalette
      .getAll()
      .filter((command) => {
        // Iterate over all groups and check if the player has the permission
        for (const group of serenity.permissions.groups) {
          // Iterate over all permissions in the group
          for (const [permission, commands] of group.permissions) {
            // Get the identifier of the permission
            const identifier = `${group.identifier}.${permission}`;

            // Check if the player has the permission and if the command is in the list of commands
            if (
              this.player.permissions.has(identifier) &&
              commands.includes(command.name)
            ) {
              // Return true, as the player has a permission that allows them to execute the command
              return true;
            }
          }
        }

        // Iterate over all permissions required by the command
        // And check if the player has the permission
        for (const permission of command.registry.permissions)
          if (!this.player.permissions.has(permission)) return false;

        // Return true, as the player has all the permissions required by the command
        return true;
      });

    // Return the available commands
    return availableCommands;
  }

  public onSpawn(): void {
    // Send the available commands to the player
    return this.sendAvailableCommands();
  }

  /**
   * Check if the player has permission to execute a command.
   * @param name The name of the command.
   * @returns True if the player has permission to execute the command.
   */
  public hasCommand(name: string | Command): boolean {
    // Check if the name is a string
    if (typeof name === "string") {
      // Find the command by the name
      const command = [...this.availableCommands].find(
        (command) => command.name === name
      );

      // Return true if the command is found
      return command !== undefined;
    }

    // Check if the command is in the available commands set
    return this.availableCommands.includes(name);
  }

  /**
   * Send the available commands to the player.
   */
  public sendAvailableCommands(): void {
    // Create a new AvailableCommandsPacket instance
    const packet = new AvailableCommandsPacket();

    // Holds all custom enums that are used in the commands
    packet.dynamicEnums = [];

    // Holds all enum values (for hard enums)
    packet.enumValues = [];

    // Holds all hard enums
    packet.enums = [];

    // Map to track enum value indices
    const enumValueMap = new Map<string, number>();

    // Track which commands have alias enums
    const commandAliasEnumMap = new Map<string, number>();

    // First pass: Create alias enums for commands that have aliases
    for (const command of this.availableCommands) {
      if (command.aliases.length > 0) {
        const aliasIndices: Array<number> = [];

        // Add each alias to enumValues and track its index
        for (const alias of command.aliases) {
          if (!enumValueMap.has(alias)) {
            const index = packet.enumValues.length;
            packet.enumValues.push(alias);
            enumValueMap.set(alias, index);
          }
          aliasIndices.push(enumValueMap.get(alias)!);
        }

        // Create the enum with the indices
        const aliasEnumIndex = packet.enums.length;
        packet.enums.push({
          name: `${command.name}Aliases`,
          values: aliasIndices
        });
        commandAliasEnumMap.set(command.name, aliasEnumIndex);
      }
    }

    // Map the commands to the packet property
    packet.commands = [...this.availableCommands].map((command) => {
      const overloads = [];

      // Handle subcommands first
      if (command.registry.subcommands.size > 0) {
        // Get unique subcommand names (not aliases)
        const uniqueSubcommands = new Map<string, typeof command.registry.subcommands extends Map<string, infer V> ? V : never>();
        for (const [key, subcommand] of command.registry.subcommands) {
          if (subcommand.name === key) {
            uniqueSubcommands.set(key, subcommand);
          }
        }

        // Create overloads for each subcommand
        for (const [subcommandName, subcommand] of uniqueSubcommands) {
          // Create a unique enum for THIS specific subcommand including all its aliases
          const subcommandValues = [subcommandName, ...subcommand.aliases];
          const subcommandEnumIndex = packet.dynamicEnums.push({
            name: subcommandName,
            values: subcommandValues
          }) - 1;

          // If the subcommand has overloads, create combined overloads
          if (subcommand.registry.overloads.size > 0) {
            for (const [subOverload] of subcommand.registry.overloads) {
              const parameters = [
                // First parameter is the subcommand enum (with the subcommand name and aliases)
                {
                  symbol: (0x4_10 << 16) | subcommandEnumIndex,
                  name: subcommandName,
                  optional: false,
                  options: 0
                },
                // Then add the subcommand's parameters
                ...Object.entries(subOverload).map(([name, value]) => {
                  const enm = Array.isArray(value) ? value[0] : value;
                  const symbol =
                    enm.type === SoftEnum.type
                      ? (enm as typeof CustomEnum).options.length > 0
                        ? (0x4_10 << 16) |
                        (packet.dynamicEnums.push({
                          name: enm.name,
                          values: (enm as typeof CustomEnum).options
                        }) -
                          1)
                        : enm.symbol
                      : enm.symbol;

                  const optional = Array.isArray(value) ? value[1] : false;
                  name = optional ? name + "?" : name;

                  return {
                    symbol,
                    name,
                    optional,
                    options: 0
                  };
                })
              ];

              overloads.push({
                chaining: false,
                parameters
              });
            }
          } else {
            // Subcommand has no parameters, just the subcommand name
            overloads.push({
              chaining: false,
              parameters: [
                {
                  symbol: (0x4_10 << 16) | subcommandEnumIndex,
                  name: subcommandName,
                  optional: false,
                  options: 0
                }
              ]
            });
          }
        }
      }

      // Add regular overloads (if any)
      for (const [overload] of command.registry.overloads) {
        const parameters = Object.entries(overload).map(([name, value]) => {
          const enm = Array.isArray(value) ? value[0] : value;
          const symbol =
            enm.type === SoftEnum.type
              ? (enm as typeof CustomEnum).options.length > 0
                ? (0x4_10 << 16) |
                (packet.dynamicEnums.push({
                  name: enm.name,
                  values: (enm as typeof CustomEnum).options
                }) -
                  1)
                : enm.symbol
              : enm.symbol;

          const optional = Array.isArray(value) ? value[1] : false;
          name = optional ? name + "?" : name;

          return {
            symbol,
            name,
            optional,
            options: 0
          };
        });

        overloads.push({
          chaining: false,
          parameters
        });
      }

      // Get the alias enum index if this command has aliases
      const aliasEnumIndex = commandAliasEnumMap.get(command.name) ?? -1;

      // Map the command to the packet command
      return {
        name: command.name,
        description: command.description,
        permissionLevel: CommandPermissionLevel.Any,
        subcommands: [],
        flags: command.registry.debug ? 1 : 0,
        alias: aliasEnumIndex,
        overloads
      };
    });

    // Assign the remaining properties to the packet
    packet.chainedSubcommandValues = [];
    packet.subcommands = [];
    packet.enumConstraints = [];
    packet.postFixes = [];

    // Send the packet to the player
    this.player.send(packet);
  }
}

export { PlayerCommandExecutorTrait };
