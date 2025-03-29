import { DisconnectReason } from "@serenityjs/protocol";

import { StringEnum, TargetEnum } from "../enums";
import { Player } from "../../entity";

import type { Entity } from "../../entity";
import type { World } from "../../world";

const register = (world: World) => {
  world.commandPalette.register(
    "kick",
    "Kicks a player from the server",
    (registry) => {
      // Set the permissions of the command
      registry.permissions = ["serenity.operator"];

      // Create an overload for the command
      registry.overload(
        {
          target: TargetEnum,
          reason: [StringEnum, true]
        },
        async (context) => {
          // Get the targets from the context
          const targets = context.target.result as Array<Entity>;

          // Get the kick reason from the context
          const reason = context.reason?.result ?? "Kicked by an operator.";

          // Check if there are no targets
          if (targets.length === 0)
            throw new Error("No targets matched the selector.");

          // Loop through all the targets
          for (const target of targets) {
            // Check if the target is not a player
            if (!(target instanceof Player)) continue;

            // Kick the player
            await target.disconnect(reason, DisconnectReason.Kicked);
          }
        }
      );
    },
    () => {}
  );
};

export default register;
