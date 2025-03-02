import { ActorDamageCause, Gamemode } from "@serenityjs/protocol";

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

          // Loop through all the targets
          for (const target of targets) {
            if (
              target instanceof Player &&
              IGNORED_GAMEMODES.has(target.gamemode)
            ) {
              // Append the message
              message.push(
                `§cPlayer §4${target.username}§c is in a gamemode that cannot be killed.§r`
              );

              // Skip the player
              continue;
            }

            // Kill the entity
            target.kill(undefined, ActorDamageCause.None);

            // Append the message
            message.push(
              `§aKilled §2${target.isPlayer() ? target.username : target.uniqueId}§a.`
            );
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
