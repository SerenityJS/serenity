import {
  AvailableCommandsPacket,
  CommandPermissionLevel,
} from "@serenityjs/protocol";
import { EntityIdentifier } from "../../../enums";
import { Command, CustomEnum, SoftEnum } from "../../../commands";
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
    const availableCommands = world.commandPalette.getAll().filter((command) => {
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
    packet.enumValues = [];
    packet.enums = [];

    // Map the commands to the packet property
    packet.commands = [...this.availableCommands].map((command) => {
      // Map the command to the packet command
      return {
        name: command.name,
        description: command.description,
        permissionLevel: CommandPermissionLevel.Normal,
        subcommands: [],
        flags: command.registry.debug ? 1 : 0,
        alias: -1,
        overloads: [...command.registry.overloads.keys()].map((overload) => {
          // Iterate through the keys of the overload and extract the parameters.
          const parameters = Object.entries(overload).map(([name, value]) => {
            // Get the parameter constructor by checking if the value is an array.
            const enm = Array.isArray(value) ? value[0] : value;
            let symbol!: number;

            // Handle custom enums (now strict enums)
            if (enm.prototype instanceof CustomEnum || enm === CustomEnum) {
              const options = (enm as typeof CustomEnum).options;

              if (options) {
                // Create symbol for next enum in the array.
                const EnumType = 0x300000;

                const enumIndex = packet.enums.length;

                // Combined base symbol and next index.
                symbol = EnumType | enumIndex;

                // Handle enum values.
                const values: number[] = [];
                for (const option of options) {
                  values.push(packet.enumValues.length);
                  packet.enumValues.push(option);
                }

                // Create enum object.
                packet.enums.push({
                  name: enm.identifier ?? enm.name,
                  values: values,
                });
              }
            } else {
              // Handle soft enums (dynamic enums)
              symbol =
                enm.type === SoftEnum.type
                  ? (enm as typeof SoftEnum).options.length > 0
                    ? (0x4_10 << 16) |
                    (packet.dynamicEnums.push({
                      name: enm.name,
                      values: (enm as typeof SoftEnum).options,
                    }) -
                      1)
                    : enm.symbol
                  : enm.symbol;
            }

            // Check if the parameter is optional.
            const optional = Array.isArray(value) ? value[1] : false;

            // Add the question mark to the name if the parameter is optional.
            name = optional ? name + "?" : name;

            return {
              symbol,
              name,
              optional,
              options: 0,
            };
          });

          return {
            chaining: false,
            parameters,
          };
        }),
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