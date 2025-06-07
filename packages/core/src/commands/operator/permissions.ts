import { StringEnum, PermissionsEnum, TargetEnum } from "../enums";

import type { World } from "../../world";
import type { Entity } from "../../entity";

const register = (world: World) => {
  // Register the permissions command
  world.commandPalette.register(
    "permissions",
    "Interact with the permissions of a specified player.",
    (registry) => {
      // Set the permissions of the command
      registry.permissions = ["serenity.operator"];

      // Create an overload for the command
      registry.overload(
        {
          target: TargetEnum,
          operation: PermissionsEnum,
          permission: [StringEnum, true]
        },
        (context) => {
          // Get the targets from the context
          const targets = context.target.result as Array<Entity>;

          // Filter out non-player entities
          const players = targets.filter((entity) => entity.isPlayer());

          // If no players matched the target selector, throw an error
          if (players.length === 0)
            throw new Error("No players matched the specified selector.");

          // Get the operation from the context
          const operation = context.operation.result as string;

          // Prepare the message to send to the origin
          const message = [];

          // Loop through the targets
          for (const player of players) {
            // Switch the operation
            switch (operation) {
              case "add": {
                // Get the permission from the parameters
                const permission = context.permission.result as string;

                // Check if the permission is valid
                if (!permission)
                  throw new TypeError("expected permission at add <<");

                // Check if the player already has the permission
                if (player.hasPermission(permission)) {
                  message.push(
                    `§7Player §u${player.username}§7 already has the permission §u${permission}§7.`
                  );
                } else {
                  // Add the permission to the player
                  player.addPermission(permission);
                  message.push(
                    `§7Added permission §u${permission}§7 to player §u${player.username}§7.`
                  );
                }

                break;
              }

              case "remove": {
                // Get the permission from the parameters
                const permission = context.permission.result as string;

                // Check if the permission is valid
                if (!permission)
                  throw new TypeError("expected permission at remove <<");

                // Check if the player has the permission
                if (!player.hasPermission(permission)) {
                  message.push(
                    `§7Player §u${player.username}§7 does not have the permission §u${permission}§7.`
                  );
                } else {
                  // Remove the permission from the player
                  player.removePermission(permission);
                  message.push(
                    `§7Removed permission §u${permission}§7 from player §u${player.username}§7.`
                  );
                }

                break;
              }

              case "list": {
                // Get the permissions of the player
                const permissions = player.getPermissions();

                // Check if the player has any permissions
                if (permissions.length === 0) {
                  message.push(
                    `§7Player §u${player.username}§7 has no permissions.`
                  );
                } else {
                  // Join the permissions into a string
                  const permissionsString = permissions.join("§7, §a");

                  // Push the message to the array
                  message.push(
                    `§7Player §u${player.username}§7 has the following permissions: §a${permissionsString}`
                  );
                }

                break;
              }
            }
          }

          // Send the message to the origin
          return {
            message: message.join("\n")
          };
        }
      );
    },
    () => {}
  );
};

export default register;
