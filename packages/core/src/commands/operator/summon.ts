import { Vector3f } from "@serenityjs/protocol";

import { BooleanEnum, EntityEnum, PositionEnum, StringEnum } from "../enums";
import { Entity } from "../../entity";
import { EntityIdentifier } from "../../enums";

import type { World } from "../../world";

const register = (world: World) => {
  // Register the setblock command
  world.commandPalette.register(
    "summon",
    "Summons an entity at a specified location",
    (registry) => {
      // Set the permissions of the command
      registry.permissions = ["serenity.operator"];

      // Create an overload for the command
      registry.overload(
        {
          entity: EntityEnum,
          nameTag: [StringEnum, true],
          alwaysVisible: [BooleanEnum, true]
        },
        (context) => {
          // Check if the origin is a dimension, if so, throw an error
          if (!(context.origin instanceof Entity))
            throw new Error(
              "You can't use this command in this context, try adding a position argument."
            );

          // Get the result of the entity
          const identifier = (context.entity.result as string).includes(":")
            ? (context.entity.result as EntityIdentifier)
            : (`minecraft:${context.entity.result}` as EntityIdentifier);

          // Get the position of the entity
          const { x, y, z } = context.origin.position.floor();

          // Spawn the entity at the specified location
          const entity = context.origin.dimension.spawnEntity(
            identifier,
            new Vector3f(x, y, z)
          );

          // Check if a name tag was provided
          if (context.nameTag.result) {
            entity.setNametag(context.nameTag.result as string);
            entity.setNametagAlwaysVisible(
              context.alwaysVisible.result ?? false
            );
          }

          // Send the success message
          return {
            message: `Successfully summoned entity at ${x}, ${y}, ${z}!`
          };
        }
      );

      // Create an overload for the command
      registry.overload(
        {
          entity: EntityEnum,
          position: PositionEnum,
          nameTag: [StringEnum, true],
          alwaysVisible: [BooleanEnum, true]
        },
        (context) => {
          // Get the result of the entity and position
          const identifier = (context.entity.result as string).includes(":")
            ? (context.entity.result as EntityIdentifier)
            : (`minecraft:${context.entity.result}` as EntityIdentifier);
          const { x, y, z } = context.position.result as Vector3f;

          // Get the dimension based on the origin
          const dimension =
            context.origin instanceof Entity
              ? context.origin.dimension
              : context.origin;

          // Summon the entity at the specified location
          const entity = dimension.spawnEntity(
            identifier,
            new Vector3f(x, y, z)
          );

          // Check if a name tag was provided
          if (context.nameTag.result) {
            entity.setNametag(context.nameTag.result as string);
            entity.setNametagAlwaysVisible(
              context.alwaysVisible.result ?? false
            );
          }
        }
      );
    },
    () => {}
  );
};

export default register;
