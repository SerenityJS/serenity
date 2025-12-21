import { BlockEnum, JsonObjectEnum, PositionEnum } from "../enums";
import { Entity } from "../../entity";
import { BlockIdentifier } from "../../enums";
import { BlockState } from "../../block";

import type { Vector3f } from "@serenityjs/protocol";
import type { World } from "../../world";

const register = (world: World) => {
  // Register the setblock command
  world.commandPalette.register(
    "setblock",
    "Sets a block at the specified location",
    (registry) => {
      // Set the permissions of the command
      registry.permissions = ["serenity.operator"];

      // Create an overload for the command
      registry.overload(
        {
          position: PositionEnum,
          block: BlockEnum,
          state: [JsonObjectEnum, true]
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

          // Get the state from the context
          const state = (context.state.result ?? {}) as BlockState;

          // Get the permutation of the block
          const permutation = type.getPermutation(state);

          // Set the block at the specified location
          block.setPermutation(permutation);

          // Return the message
          return {
            message: `§7Successfully set block at §u${position.x}§7, §u${position.y}§7, §u${position.z}§7 to §u${type.identifier}§7.§r`
          };
        }
      );
    },
    () => {}
  );
};

export default register;
