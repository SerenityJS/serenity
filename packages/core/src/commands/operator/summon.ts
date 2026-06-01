import { Rotation, Vector3f } from "@serenityjs/protocol";

import { Entity } from "../../entity";
import { EntityIdentifier } from "../../enums";
import { BooleanEnum, EntityEnum, PositionEnum, StringEnum, TargetEnum } from "../enums";

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

          //  Convert the position to a vector
          const entityLocation = new Vector3f(x, y, z);

          // Spawn the entity at the specified location
          const entity = context.origin.dimension.spawnEntity(
            identifier,
            entityLocation,
            false
          );

          // Check if a name tag was provided
          if (context.nameTag.result) {
            entity.setNametag(context.nameTag.result as string);
            entity.setNametagAlwaysVisible(
              context.alwaysVisible.result ?? false
            );
          }


          // // Check if the facing argument was provided
          if (context.facing.result) {
            const entities = context.facing.result as Array<Entity>;

            // Check if there are no targets
            if (entities.length === 0)
              throw new Error("No targets matched the selector.");

            // Get the first target
            const target = entities[0];
            if (!target) throw new Error("No targets matched the selector.");

            // Calculate the rotation to face the target
            entity.setRotation(calculateRotationToFace(entityLocation, target.position));
          }

          // Spawn the entity
          entity.spawn();

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

          const entityLocation = new Vector3f(x, y, z);

          // Summon the entity at the specified location
          const entity = dimension.spawnEntity(
            identifier,
            entityLocation,
            false
          );

          // Check if a name tag was provided
          if (context.nameTag.result) {
            entity.setNametag(context.nameTag.result as string);
            entity.setNametagAlwaysVisible(
              context.alwaysVisible.result ?? false
            );
          }

          // // Check if the facing argument was provided
          if (context.facing.result) {
            const entities = context.facing.result as Array<Entity>;

            // Check if there are no targets
            if (entities.length === 0)
              throw new Error("No targets matched the selector.");

            // Get the first target
            const target = entities[0];
            if (!target) throw new Error("No targets matched the selector.");

            // Calculate the rotation to face the target
            entity.setRotation(calculateRotationToFace(entityLocation, target.position));
          }

          // Spawn the entity
          entity.spawn();

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

/**
 * Calculates the rotation to face a target
 */
function calculateRotationToFace(from: Vector3f, to: Vector3f): Rotation {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dz = to.z - from.z;

  // Calculate the horizontal distance
  const horizontalDist = Math.sqrt(dx * dx + dz * dz);

  // Calculate the yaw and pitch
  const yaw = (Math.atan2(-dx, dz) * (180 / Math.PI)) % 360;
  const pitch = Math.atan2(-dy, horizontalDist) * (180 / Math.PI);

  // Return the rotation
  return new Rotation(yaw, pitch, yaw);
}