import { CommandPermissionLevel, type Vector3f } from "@serenityjs/protocol";

import { BlockEnum, PositionEnum } from "../enums";
import { Entity } from "../../entity";
import { BlockIdentifier } from "../../enums";

import type { World } from "../../world";

const register = (world: World) => {
  // Register the setblock command
  world.commands.register(
    "setblock",
    "Sets a block at the specified location",
    (registry) => {
      // Set the command to be an operator command
      registry.permissionLevel = CommandPermissionLevel.Operator;

      // Create an overload for the command
      registry.overload(
        {
          position: PositionEnum,
          block: BlockEnum
        },
        (context) => {
          // Get the result of the block, position, and mode
          const result = context.block.result as string;
          const identifier = result.includes(":")
            ? result
            : `minecraft:${result}`;

          // Get the position from the context
          const position = context.position.result?.floor() as Vector3f;

          // Get the dimension based on the origin
          const dimension =
            context.origin instanceof Entity
              ? context.origin.dimension
              : context.origin;

          // Get the block at the specified location
          const block = dimension.getBlock(position);

          // Get the block type from the identifier
          const type = world.blockPalette.resolveType(
            identifier as BlockIdentifier
          );

          // Set the block at the specified location
          block.type = type;

          // Return the message
          return {
            message: `§aSuccessfully set block at §2${position.x}§a, §2${position.y}§a, §2${position.z}§a to §2${type.identifier}§a.§r`
          };
        }
      );
    },
    () => {}
  );
};

export default register;
