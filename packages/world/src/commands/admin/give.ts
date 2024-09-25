import { IntegerEnum } from "@serenityjs/command";
import { CommandPermissionLevel } from "@serenityjs/protocol";

import { ItemEnum, TargetEnum } from "../enums";

import type { Entity } from "../../entity";
import type { ItemIdentifier } from "@serenityjs/item";
import type { World } from "../../world";
import { MCIdentifier } from "../../utils/identifier";
import { Player } from "../../player";

const register = (world: World) => {
  // Register the setblock command
  world.commands.register(
    "give",
    "Gives an item to a player.",
    (registry) => {
      // Set the command to be an operator command
      registry.permissionLevel = CommandPermissionLevel.Operator;

      // Create an overload for the command
      registry.overload(
        {
          player: TargetEnum,
          itemName: ItemEnum,
          amount: [IntegerEnum, true],
          data: [IntegerEnum, true],
        },
        (context) => {
          // Get the targets from the context
          const targets = context.player.result as Array<Entity>;

          // Get the result of the item, amount, and metadata
          const itemResult = context.itemName.result as string;
          const itemIdentifier = itemResult.includes(":")
            ? itemResult
            : `minecraft:${itemResult}`;
          const amount = context.amount?.result ?? 1;
          const metadata = context.data?.result ?? 0;

          // Loop through the targets
          for (const target of targets) {
            // Check if the target is an entity
            if (!target.isPlayer()) continue;

            // Get the dimension of the target
            const dimension = target.dimension;

            // Create the item stack
            const itemStack = dimension.createItemStack(
              itemIdentifier as ItemIdentifier,
              amount,
              metadata
            );

            // Get the player's inventory
            const { container } = target.getComponent("minecraft:inventory");

            // Add the item to the player's inventory
            container.addItem(itemStack);
          }

          // Send the success message
          return {
            message: `§fGave ${MCIdentifier.format(itemIdentifier)} * ${amount} to ${targets.length === 1 ? (targets[0] as Player).username : `${targets.length} targets`}`,
          };
        }
      );
    },
    () => {}
  );
};

export default register;
