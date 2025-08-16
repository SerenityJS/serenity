import { Player, PlayerCommandExecutorTrait } from "../../entity";

import type { World } from "../../world";

const register = (world: World) => {
  world.commandPalette.register(
    "help",
    "Provides available commands and their descriptions.",
    ({ origin }) => {
      // Check if the origin is a player
      if (origin instanceof Player) {
        // Get the available commands from the player trait
        const trait = origin.getTrait(PlayerCommandExecutorTrait);

        // Check if the trait exists
        if (!trait) throw new Error("No command executor trait found.");

        // Get the available commands
        const commands = trait.availableCommands.map((command) => {
          return `  §u/${command.name}§7 - ${command.description}§r`;
        });
        // Return the message with the available commands
        return {
          message: `§l§7Showing Available commands:§r\n${commands.join("\n")}`
        };
      } else {
        // Get the available commands from the world command palette
        const commands = world.commandPalette.getAll().map((command) => {
          return `  §u/${command.name}§7 - ${command.description}§r`;
        });

        // Return the message with the available commands
        return {
          message: `§l§7Showing Available commands:§r\n${commands.join("\n")}`
        };
      }
    }
  );
};

export default register;
