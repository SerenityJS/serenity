import { Gamemode } from "@serenityjs/protocol";

import { TargetEnum } from "../enums";
import { Player } from "../../entity";

import type { World } from "../../world";
import type { Entity } from "../../entity";

/**
 * When executing /kill on a player, if the player
 * has one of these gamemodes, the player will be ignored.
 */
const IGNORED_GAMEMODES = new Set([
  Gamemode.Creative,
  Gamemode.CreativeSpectator,
  Gamemode.Spectator
]);

const register = (world: World) => {
  // Register the kill command
  world.commandPalette.register(
    "kill",
    "Kills entities (players, mobs, etc.).",
    (registry) => {
      // Set the permissions of the command
      registry.permissions = ["serenity.operator"];

      // Create an overload for the command
      registry.overload(
        {
          target: TargetEnum
        },
        (context) => {
          // Validate the target
          context.target.validate(true);

          // Get the targets from the context
          const targets = context.target.result as Array<Entity>;

          // Check if there are no targets
          if (targets.length === 0)
            throw new Error("No targets matched the selector.");

          // Prepare the return message
          const message = [];

          let killCount = 0;

          // Loop through all the targets
          for (const target of targets) {
            if (
              target instanceof Player &&
              IGNORED_GAMEMODES.has(target.getGamemode())
            ) {
              // Append the message
              message.push(
                `§7Player §c${target.username}§7 is in a gamemode that cannot be killed.§r`
              );

              // Skip the player
              continue;
            }

            // Kill the entity
            target.kill();

            // Increment the kill count
            killCount++;
          }

          if (killCount > 0) {
            // Push the amount of entities that were killed.
            message.push(
              `§7Successfully killed §u${killCount}§7 entit${killCount > 1 ? "ies" : "y"}.§r`
            );
          } else {
            // Push that no entities were found.
            message.push(`§7No targets matched the selector.`);
          }

          // Return the message
          return { message: message.join("\n") };
        }
      );
    },
    () => {}
  );
};

export default register;
