import { StringEnum, TargetEnum, WorldEnum } from "../enums";

import type { World } from "../../world";
import type { Entity } from "../../entity";

const register = (world: World) => {
  world.commandPalette.register(
    "world",
    "Change the current world of an entity",
    (registry) => {
      // Set the permissions of the command
      registry.permissions = ["serenity.operator"];

      registry.overload(
        {
          target: TargetEnum,
          world: WorldEnum,
          dimension: [StringEnum, true]
        },
        (context) => {
          // Get the serenity instance from the context
          const serenity = context.origin.world.serenity;

          // Get the targets from the context
          const targets = context.target.result as Array<Entity>;

          // Check if there are any targets
          if (targets.length === 0)
            throw new Error("No targets matched the selector.");

          // Get the world from the context
          const world = serenity.getWorld(context.world.result as string);

          // Check if the world exists
          if (!world) throw new Error("World does not exist.");

          // Get the dimension from the context
          const dimension = context.dimension.result
            ? world.getDimension(context.dimension.result as string)
            : world.getDimension();

          // Check if the dimension exists
          if (!dimension)
            throw new Error("Dimension does not exist in specified world.");

          // Prepare the return message
          const message = [];

          // Loop through all the targets
          for (const target of targets) {
            // Get the spawn position of the dimension
            const position = dimension.spawnPosition.clone();

            // Center the position on the target
            position.x += 0.5;
            position.z += 0.5;

            // Change the world of the target
            target.teleport(position, dimension);

            // Append the message
            message.push(
              `§7Successfully changed the world of §u${target.isPlayer() ? target.username : target.uniqueId}§7 to §u${world.properties.identifier}§7 in dimension §u${dimension.properties.identifier}§7.§r`
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
