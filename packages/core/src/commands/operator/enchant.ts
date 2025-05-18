import { Enchantment } from "@serenityjs/protocol";

import { EnchantmentsEnum, IntegerEnum, TargetEnum } from "../enums";
import { EntityInventoryTrait } from "../../entity";
import { ItemEnchantableTrait } from "../../item";

import type { World } from "../../world";

const register = (world: World) => {
  // Register the about command
  world.commandPalette.register(
    "enchant",
    "Add an enchantment to a target.",
    (registry) => {
      // Set the permissions of the command
      registry.permissions = ["serenity.operator"];

      // Prepare a min & max constants for the level
      const LEVEL_MINIMUM = -32767;
      const LEVEL_MAXIMUM = 32767;

      // Create an overload for the command
      registry.overload(
        {
          target: TargetEnum,
          enchantment: EnchantmentsEnum,
          level: IntegerEnum
        },
        (context) => {
          // Get the target from the context
          const target = context.target.result;

          // Check if the target is empty
          if (!target || target.length <= 0)
            throw new Error("No targets matched specified selector.");

          // Get the enchantment from the context
          const enchantment = context.enchantment.result;

          // Check if the enchantment is empty
          if (!enchantment)
            throw new Error("No enchantment matched specified selector.");

          // Get the level from the context
          const level = context.level.result;

          // Validate the level
          if (level === null || level < LEVEL_MINIMUM || level > LEVEL_MAXIMUM)
            throw new Error(
              `Level must be between ${LEVEL_MINIMUM} and ${LEVEL_MAXIMUM}.`
            );

          // Prepare the message array
          const message: Array<string> = [];

          // Iterate over the targets
          for (const entity of target) {
            // Determine the id of the entity
            const id = entity.isPlayer()
              ? entity.username
              : `${entity.identifier} §7(§8${JSON.stringify(entity.position.floor())}§7)§r`;

            // Check if the entity has an inventory trait
            if (!entity.hasTrait(EntityInventoryTrait)) {
              // Push the message to the message array
              message.push(
                `§7Failed to enchant entity §c${id}§7, entity does not have an inventory trait.`
              );

              // Continue to the next entity
              continue;
            } else {
              // Get the inventory trait of the entity
              const inventory = entity.getTrait(EntityInventoryTrait);

              // Get the held item of the entity
              const heldItem = inventory.getHeldItem();

              // Check if the held item is null
              if (!heldItem) {
                // Push the message to the message array
                message.push(
                  `§7Failed to enchant entity §c${id}§7, entity does not have an item in hand.`
                );

                // Continue to the next entity
                continue;
              }

              // Get the enchantable trait of the held item
              const enchantable = heldItem.hasTrait(ItemEnchantableTrait)
                ? heldItem.getTrait(ItemEnchantableTrait)
                : heldItem.addTrait(ItemEnchantableTrait);

              // Set the enchantment on the held item
              enchantable.setEnchantment(enchantment, level);

              // Push the message to the message array
              message.push(
                `§7Enchanted item in hand of entity §u${id}§7: [§f${Enchantment[enchantment]} ${level}§7]§r`
              );
            }
          }

          // Return the message
          return {
            message: message.join("\n")
          };
        }
      );
    },
    () => {}
  );
};

export default register;
