import { Rotation, Vector3f } from "@serenityjs/protocol";

import { BooleanEnum, EntityEnum, PositionEnum, StringEnum, TargetEnum } from "../enums";
import { Entity, EntityMovementTrait } from "../../entity";
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
          facing: [TargetEnum, true],
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
            new Vector3f(x, y, z),
            false
          );

          // Check if a name tag was provided
          if (context.nameTag.result) {
            entity.setNametag(context.nameTag.result as string);
            entity.setNametagAlwaysVisible(
              context.alwaysVisible.result ?? false
            );
          }

          // Spawn the entity
          const spawnedEntity = entity.spawn();

          // Wait 2 seconds before setting the rotation to allow the entity to spawn
          setTimeout(() => {
            if (context.facing.result) {
              // Get the target entity
              const entities = context.facing.result as Array<Entity>;

              // Check if there are any targets
              if (entities.length === 0)
                throw new Error("No targets matched the selector.");

              // Get the first target
              const target = entities[0];

              if (!target) throw new Error("No targets matched the selector.");

              // Get the movement trait
              const movementTrait = spawnedEntity.getTrait(EntityMovementTrait);

              // Set the rotation to look at the target
              movementTrait.lookAt(target.position);
            }
          }, 2000);

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
          facing: [TargetEnum, true],
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
            new Vector3f(x, y, z),
            false
          );

          // Check if a name tag was provided
          if (context.nameTag.result) {
            entity.setNametag(context.nameTag.result as string);
            entity.setNametagAlwaysVisible(
              context.alwaysVisible.result ?? false
            );
          }

          // Spawn the entity
          const spawnedEntity = entity.spawn();

          // Wait 2 seconds before setting the rotation to allow the entity to spawn
          setTimeout(() => {
            if (context.facing.result) {
              // Get the target entity
              const entities = context.facing.result as Array<Entity>;

              // Check if there are any targets
              if (entities.length === 0)
                throw new Error("No targets matched the selector.");

              // Get the first target
              const target = entities[0];

              if (!target) throw new Error("No targets matched the selector.");

              // Get the movement trait
              const movementTrait = spawnedEntity.getTrait(EntityMovementTrait);

              // Set the rotation to look at the target
              movementTrait.lookAt(target.position);
            }
          }, 2000);

          return {
            message: `Successfully summoned entity at ${x}, ${y}, ${z}!`
          };
        }
      );
    },
    () => { }
  );
};

export default register;
