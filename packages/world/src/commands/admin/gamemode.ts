import { Gamemode, CommandPermissionLevel } from "@serenityjs/protocol";

import { GamemodeEnum, TargetEnum } from "../enums";
import { Player } from "../../player";

import type { World } from "../../world";
import { Entity } from "../../entity";

const register = (world: World) => {
  // Register the about command
  world.commands.register(
    "gamemode",
    "Sets a player's gamemode.",
    (registry) => {
      // Set the command to be an operator command
      registry.permissionLevel = CommandPermissionLevel.Operator;

      // Create an overload for the command
      registry.overload(
        {
          gameMode: GamemodeEnum,
          player: [TargetEnum, true],
        },
        (context) => {
          // Get the targets from the context
          const targets = context.player.validate()
            ? context.player.result
            : [context.origin instanceof Player ? context.origin : null];

          // Check if there are no targets
          if (!targets || targets.length === 0)
            throw new Error("No targets matched the selector.");

          // Get the gamemode from the context
          const gamemode = context.gameMode.result as string;
          let mode = gamemode.toLowerCase();

          // Create an array to hold the log messages
          const logs: Array<string> = [];

          // Loop through all the targets
          for (const target of targets) {
            // Check if the target is not a player
            if (!target || !(target instanceof Player)) continue;

            switch (gamemode) {
              case "s":
              case "survival": {
                target.setGamemode(Gamemode.Survival);
                mode = "survival";
                break;
              }

              case "c":
              case "creative": {
                target.setGamemode(Gamemode.Creative);
                mode = "creative";
                break;
              }

              case "a":
              case "adventure": {
                target.setGamemode(Gamemode.Adventure);
                mode = "adventure";
                break;
              }

              case "sp":
              case "spectator": {
                target.setGamemode(Gamemode.Spectator);
                mode = "spectator";
                break;
              }

              default: {
                throw new TypeError("Gamemode '" + gamemode + "' is invalid");
              }
            }

            // Add the log message
            if (
              context.origin instanceof Player &&
              target.username == context.origin.username
            )
              logs.push(`§fSet own gamemode to ${mode}`);
            else logs.push(`§fSet ${target.username}'s gamemode to ${mode}`);
          }

          // Return the success message
          return { message: logs.join("\n") };
        }
      );
    },
    () => {}
  );
};

export default register;
