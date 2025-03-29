import { BlockEnum, PositionEnum } from "../enums";
import { Entity } from "../../entity";
import { BlockIdentifier } from "../../enums";

import type { Vector3f } from "@serenityjs/protocol";
import type { World } from "../../world";

const register = (world: World) => {
  world.commandPalette.register(
    "fill",
    "Fill a region with a specific block",
    (registry) => {
      // Set the permissions of the command
      registry.permissions = ["serenity.operator"];

      // Create an overload for the command
      registry.overload(
        {
          from: PositionEnum,
          to: PositionEnum,
          block: BlockEnum
        },
        async (context) => {
          // Get the result of the block, position, and mode
          const result = context.block.result as string;
          const identifier = result.includes(":")
            ? result
            : `minecraft:${result}`;

          // Get the from position from the context
          const from = context.from.result?.floor() as Vector3f;

          // Get the to position from the context
          const to = context.to.result?.floor() as Vector3f;

          // Get the dimension based on the origin
          const dimension =
            context.origin instanceof Entity
              ? context.origin.dimension
              : context.origin;

          // Get the block type from the identifier
          const type = world.blockPalette.resolveType(
            identifier as BlockIdentifier
          );

          // Fill the region with the specified block
          await dimension.fill(from, to, type.getPermutation());

          const amountFilled =
            Math.abs(from.x - to.x) *
            Math.abs(from.y - to.y) *
            Math.abs(from.z - to.z);
          const blockName = type.identifier;

          return {
            message: `§7Filled §u${amountFilled} §7blocks with §u${blockName} §7from §u[${from.x}, ${from.y}, ${from.z}] §7to §u[${to.x}, ${to.y}, ${to.z}]§7.`
          };
        }
      );
    },
    () => {}
  );
};

export default register;
