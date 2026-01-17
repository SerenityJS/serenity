import { IntegerEnum, ItemEnum, TargetEnum } from "../enums";
import { Entity, EntityInventoryTrait } from "../../entity";

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
          target: [TargetEnum, true],
          item: [ItemEnum, true],
          auxiliary: [IntegerEnum, true],
          amount: [IntegerEnum, true]
        },
        (context) => {
          // Get the targets from the context
          const targets = context.target.result ?? [];

          // Get the result of the item, amount, and auxiliary
          const itemResult = context.item?.result as string | undefined;
          const itemIdentifier = itemResult
            ? `${itemResult.includes(":") ? "" : "minecraft:"}${itemResult}`
            : undefined;
          const itemauxiliary = context.auxiliary?.result ?? 0;
          const itemAmount = context.amount?.result;
          let itemCount = 0;

          // Check if no targets were specified and the origin is an entity
          if (targets.length === 0 && context.origin instanceof Entity) {
            // Push the origin to the targets array
            targets.push(context.origin);
          } else if (targets.length === 0) {
            // Throw an error if no valid targets were specified
            throw new Error("No valid targets specified.");
          }

          for (const target of targets) {
            if (!target.hasTrait(EntityInventoryTrait)) continue;
            const { container } = target.getTrait(EntityInventoryTrait);

            if (!itemResult) {
              container.clear();
              continue;
            }

            for (const [slot, itemStack] of Object.entries(container.storage)) {
              if (
                !itemStack ||
                (itemStack.type.identifier !== itemIdentifier &&
                  itemStack.getAuxiliaryValue() !== itemauxiliary)
              ) {
                continue;
              }

              const stackAmount = itemStack.getStackSize();
              const remaining = stackAmount - (itemAmount ?? 1);

              if (remaining < 0) {
                container.clearSlot(Number.parseInt(slot));
                itemCount += stackAmount;
              } else {
                itemStack.setStackSize(Math.max(remaining, 0));
                itemCount += Math.min(itemAmount ?? 1, stackAmount);
              }

              if (itemCount >= (itemAmount ?? 1)) break;
            }
          }

          return {
            message: `Cleared the inventory of ${targets.length} entities`
          };
        }
      );
    },
    () => {}
  );
};

export default register;
