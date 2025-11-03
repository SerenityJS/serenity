import { IntegerEnum, ItemEnum, TargetEnum } from "../enums";
import { EntityInventoryTrait, type Entity } from "../../entity";
import { ItemStack } from "../../item";
import { ItemIdentifier } from "../../enums";

import type { World } from "../../world";

const register = (world: World) => {
  // Register the setblock command
  world.commandPalette.register(
    "give",
    "Gives an item to a player",
    (registry) => {
      // Set the permissions of the command
      registry.permissions = ["serenity.operator"];

      // Create an overload for the command
      registry.overload(
        {
          target: TargetEnum,
          item: ItemEnum,
          amount: [IntegerEnum, true],
          auxiliary: [IntegerEnum, true]
        },
        (context) => {
          // Get the targets from the context
          const targets = context.target.result as Array<Entity>;

          // Get the result of the item, amount, and auxiliary
          const itemResult = context.item.result as string;
          const itemIdentifier = itemResult.includes(":")
            ? itemResult
            : `minecraft:${itemResult}`;
          const stackSize = context.amount?.result ?? 1;
          const auxiliary = context.auxiliary?.result ?? 0;

          // Loop through the targets
          for (const target of targets) {
            // Create the item stack
            const itemStack = new ItemStack(itemIdentifier as ItemIdentifier, {
              stackSize,
              auxiliary,
              world
            });

            // Get the player's inventory
            const { container } = target.getTrait(EntityInventoryTrait);

            // Add the item to the player's inventory
            container.addItem(itemStack);
          }

          // Send the success message
          return {
            message: `§7Successfully gave §ux${stackSize} ${itemIdentifier}§7 to §u${targets.length}§7 entities.`
          };
        }
      );
    },
    () => {}
  );
};

export default register;
