import { IntegerEnum } from "@serenityjs/command";
import { CommandPermissionLevel } from "@serenityjs/protocol";

import { ItemEnum, TargetEnum } from "../enums";

import type { Entity } from "../../entity";
import type { World } from "../../world";
import { EntityIdentifier, EntityType } from "@serenityjs/entity";
import { MCIdentifier } from "../../utils/identifier";

const register = (world: World) => {
  // Register the clear command
  world.commands.register(
    "clear",
    "Clears items from player inventory.",
    (registry) => {
      // Set the command to be an operator command
      registry.permissionLevel = CommandPermissionLevel.Operator;

      // Create an overload for the command
      registry.overload(
        {
          player: TargetEnum,
          itemName: [ItemEnum, true],
          data: [IntegerEnum, true],
          amount: [IntegerEnum, true],
        },
        (context) => {
          // Get the targets from the context
          const targets = context.player.result as Array<Entity>;

          // Get the result of the item, amount, and metadata
          const itemResult = context.itemName?.result as string | undefined;
          const itemIdentifier = itemResult
            ? `${itemResult.includes(":") ? "" : "minecraft:"}${itemResult}`
            : undefined;
          const itemMetadata = context.data?.result ?? 0;
          const itemAmount = context.amount?.result;
          let itemCount = 0;

          // Create an array to hold the log messages
          const logs: Array<string> = [];

          if (targets.length === 0) {
            return { message: "No targets matched selector" };
          }

          for (const target of targets) {
            if (!target.hasComponent("minecraft:inventory")) continue;
            const { container } = target.getComponent("minecraft:inventory");

            if (!itemResult) {
              container.clear();
              continue;
            }

            for (const [slot, itemStack] of Object.entries(container.storage)) {
              if (
                !itemStack ||
                (itemStack.type.identifier !== itemIdentifier &&
                  itemStack.metadata !== itemMetadata)
              ) {
                continue;
              }

              const stackAmount = itemStack.amount;
              const remaining = stackAmount - (itemAmount ?? 1);

              if (remaining < 0) {
                container.clearSlot(Number.parseInt(slot));
                itemCount += stackAmount;
              } else {
                itemStack.setAmount(Math.max(remaining, 0));
                itemCount += Math.min(itemAmount ?? 1, stackAmount);
              }

              if (itemCount >= (itemAmount ?? 1)) break;
            }
            if (itemCount === 0)
              logs.push(
                `§cCould not clear the inventory of ${target.getNametag() ?? MCIdentifier.format(target.type.identifier)}, no items to remove§r`
              );
            else
              logs.push(
                `§fCleared the inventory of ${target.getNametag() ?? MCIdentifier.format(target.type.identifier)}, removing ${itemCount} items§r`
              );
          }
          return {
            message: logs.join("\n"),
          };
        }
      );
    },
    () => {}
  );
};

export default register;
