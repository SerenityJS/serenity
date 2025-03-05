import { PositionEnum, TargetEnum } from "../enums";

import type { World } from "../../world";
import type { Vector3f } from "@serenityjs/protocol";
import type { Entity } from "../../entity";

const register = (world: World) => {
  // Register the setblock command
  world.commandPalette.register(
    "spawnpoint",
    "Set the spawn point for a player",
    (registry) => {
      // Set the permissions of the command
      registry.permissions = ["serenity.operator"];

      // Create an overload for the command
      registry.overload(
        {
          target: TargetEnum,
          position: PositionEnum
        },
        (context) => {
          // Get the targets from the context
          const targets = context.target.result as Array<Entity>;
          const players = targets.filter((target) => target.isPlayer());

          // Check if there are any players
          if (players.length === 0)
            throw new Error("No players matched the selector.");

          // Get the position from the context
          const position = context.position.result as Vector3f;

          // Prepare the message array
          const message: Array<string> = [];

          // Loop through all the players
          for (const player of players) {
            // Set the spawn point for the player
            player.setSpawnPoint(position);

            // Push the message to the message array
            message.push(
              `§7Successfully set the spawn point for §u${player.username}§7 to §7(§u${position.x.toFixed(2)}§7, §u${position.y.toFixed(2)}§7, §u${position.x.toFixed(2)}§7)§r`
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
