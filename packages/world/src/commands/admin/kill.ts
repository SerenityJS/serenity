import { CommandPermissionLevel, Gamemode } from "@serenityjs/protocol";

import { TargetEnum } from "../enums";
import { Player } from "../../player";

import type { World } from "../../world";
import type { Entity } from "../../entity";
import { MCIdentifier } from "../../utils/identifier";

/**
 * When executing /kill on a player, if the player
 * has one of these gamemodes, the player will be ignored.
 */
const IGNORED_GAMEMODES = new Set([
  Gamemode.Creative,
  Gamemode.CreativeSpectator,
  Gamemode.Spectator,
]);

const register = (world: World) => {
  // Register the kill command
  world.commands.register(
    "kill",
    "Kills entities (players, mobs, etc.).",
    (registry) => {
      // Set the command to be an operator command
      registry.permissionLevel = CommandPermissionLevel.Operator;

      // Create an overload for the command
      registry.overload(
        {
          target: TargetEnum,
        },
        (context) => {
          // Validate the target
          context.target.validate(true);

          // Get the targets from the context
          const targets = context.target.result as Array<Entity>;

          // Check if there are no targets
          if (targets.length === 0)
            throw new Error("No targets matched the selector.");

          // Create an array to hold the log messages
          const logs: Array<string> = [];

          // Loop through all the targets
          for (const target of targets) {
            if (
              target instanceof Player &&
              IGNORED_GAMEMODES.has(target.gamemode)
            )
              continue;
            target.kill();
          }
          return {
            message: `§fKilled ${targets.map((x) => x.getNametag() ?? MCIdentifier.format(x.type.identifier)).join(", ")}`,
          };
        }
      );
    },
    () => {}
  );
};

export default register;
