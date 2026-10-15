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
          const amount = context.amount?.result ?? 1;
          const auxiliary = context.auxiliary?.result ?? 0;

          // Loop through the targets
          for (const target of targets) {
            // Get the player's inventory
            const { container } = target.getTrait(EntityInventoryTrait);

            // Give the amount to each target, a stack at a time
            let remaining = amount;
            while (remaining > 0) {
              // Create the item stack, no larger than a full stack
              const itemStack = new ItemStack(
                itemIdentifier as ItemIdentifier,
                {
                  stackSize: remaining,
                  auxiliary,
                  world
                }
              );
              const size = Math.min(remaining, itemStack.maxStackSize);
              itemStack.setStackSize(size);

              // Add the item to the player's inventory, stopping once it is full
              if (!container.addItem(itemStack)) break;

              // The item stack was either placed in an empty slot, or merged into a stack
              // in the inventory, which takes what fits and leaves the rest in the item stack
              const added =
                itemStack.container === container
                  ? size
                  : size - itemStack.getStackSize();

              // Decrement the remaining amount by the amount added
              remaining -= added;
            }
          }

          // Send the success message
          return {
            message: `§7Successfully gave §ux${amount} ${itemIdentifier}§7 to §u${targets.length}§7 entities.`
          };
        }
      );
    },
    () => {}
  );
};

export default register;
