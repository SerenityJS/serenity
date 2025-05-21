import { IntegerEnum, ItemEnum, TargetEnum } from "../enums";
import { EntityInventoryTrait, type Entity } from "../../entity";

import type { World } from "../../world";

const register = (world: World) => {
  // Register the clear command
  world.commandPalette.register(
    "clear",
    "Clears items from player inventory.",
    (registry) => {
      // Set the permissions of the command
      registry.permissions = ["serenity.operator"];

      // Create an overload for the command
      registry.overload(
        {
          target: TargetEnum,
          itemName: [ItemEnum, true],
          data: [IntegerEnum, true],
          maxCount: [IntegerEnum, true]
        },
        (context) => {
          // Get the targets from the context
          const targets = context.target.result as Array<Entity>;

          // Get the result of the item, amount, and metadata
          const itemResult = context.itemName?.result as string | undefined;
          const itemIdentifier = itemResult
            ? `${itemResult.includes(":") ? "" : "minecraft:"}${itemResult}`
            : undefined;
          const itemMetadata = context.data?.result;
          const maxAmount = context.maxCount?.result;

          // Check if the amount is greater than 0
          if (maxAmount && maxAmount <= 0) {
            return { message: "Amount must be greater than 0" };
          }

          // Check if there are no targets
          if (targets.length === 0) {
            return { message: "No targets matched selector" };
          }

          // The total removed item count
          let totalRemovedItemCount = 0;

          for (const target of targets) {
            // Check if the target has an inventory
            if (!target.hasTrait(EntityInventoryTrait)) continue;
            const { container } = target.getTrait(EntityInventoryTrait);

            // If there is no specified item, clear the entire inventory
            if (!itemResult) {
              totalRemovedItemCount += Object.entries(container.storage)
                .map((i) => i[1]?.amount ?? 0)
                .reduce((a, b) => a + b, 0);
              container.clear();
              continue;
            }

            // The removed item count per target
            let removedItemCount = 0;

            for (const [slot, itemStack] of Object.entries(container.storage)) {
              // Check if the item stack is valid
              if (
                // Check For Null
                !itemStack ||
                // Check For Incorrect Identifier
                itemStack.type.identifier !== itemIdentifier ||
                // Check For Metadata
                (itemMetadata && itemStack.metadata !== itemMetadata)
              ) {
                continue;
              }

              // If there is a max amount, check if the item stack is greater than the max amount
              // If there is no max amount, clear the item stack
              if (maxAmount) {
                const stackAmount = itemStack.amount;
                const remaining = stackAmount - (maxAmount - removedItemCount);

                if (remaining <= 0) {
                  container.clearSlot(Number.parseInt(slot));
                  removedItemCount += stackAmount;
                } else {
                  itemStack.setAmount(Math.max(remaining, 0));
                  removedItemCount += Math.min(maxAmount, stackAmount);
                }
                // Stop if the removed item count is greater than or equal to the max amount
                if (removedItemCount >= maxAmount) {
                  totalRemovedItemCount += removedItemCount;
                  break;
                }
              } else {
                container.clearSlot(Number.parseInt(slot));
                removedItemCount += itemStack.amount;
              }
              totalRemovedItemCount += removedItemCount;
            }
          }

          return {
            message: `Cleared the inventory of ${targets.length} entities, removed ${totalRemovedItemCount} items`
          };
        }
      );
    },
    () => { }
  );
};

export default register;
