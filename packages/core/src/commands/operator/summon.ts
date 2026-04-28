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

          if (context.facing.result) {
            const entities = context.facing.result as Array<Entity>;

            if (entities.length === 0)
              throw new Error("No targets matched the selector.");

            const target = entities[0];
            if (!target) throw new Error("No targets matched the selector.");

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

          if (context.facing.result) {
            const entities = context.facing.result as Array<Entity>;

            if (entities.length === 0)
              throw new Error("No targets matched the selector.");

            const target = entities[0];
            if (!target) throw new Error("No targets matched the selector.");

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
 * Computes a Rotation (yaw/pitch) for an entity at `from` to face toward `to`.
 */
function calculateRotationToFace(from: Vector3f, to: Vector3f): Rotation {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dz = to.z - from.z;

  const horizontalDist = Math.sqrt(dx * dx + dz * dz);

  const yaw = (Math.atan2(-dx, dz) * (180 / Math.PI)) % 360;
  const pitch = Math.atan2(-dy, horizontalDist) * (180 / Math.PI);

  return new Rotation(yaw, pitch, yaw);
}