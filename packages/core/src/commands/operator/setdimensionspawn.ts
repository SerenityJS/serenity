import { PositionEnum } from "../enums";
import { Entity } from "../../entity";

import type { World } from "../../world";
import type { Vector3f } from "@serenityjs/protocol";

const register = (world: World) => {
  // Register the setdimensionspawn command
  world.commandPalette.register(
    "setdimensionspawn",
    "Set the spawn point for the current dimension.",
    (registry) => {
      // Set the permissions of the command
      registry.permissions = ["serenity.operator"];

      // Create an overload for the command
      registry.overload(
        {
          position: PositionEnum
        },
        (context) => {
          // Get the position from the context
          const position = context.position.result as Vector3f;

          // Check if the origin is an entity
          if (context.origin instanceof Entity) {
            // Set the spawn point for the entity's dimension
            context.origin.dimension.spawnPosition = position;
          } else {
            // Set the spawn point for the dimension
            context.origin.spawnPosition = position;
          }

          // Return the message
          return {
            message: `§7Set the spawn point for the dimension to §u${position.x}§7, §u${position.y}§7, §u${position.z}§7.§r`
          };
        }
      );
    },
    () => {}
  );
};

export default register;
