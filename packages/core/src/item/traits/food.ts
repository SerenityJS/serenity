import { ItemUseMethod } from "@serenityjs/protocol";

import { Player, PlayerHungerTrait } from "../../entity";
import { ItemStackUseOptions } from "../types";
import { ItemIdentifier } from "../../enums";

import { ItemTrait } from "./trait";

class ItemFoodTrait extends ItemTrait {
  public static readonly identifier = "food";
  public static readonly tag = "minecraft:is_food";

  public onUse(
    player: Player,
    options: Partial<ItemStackUseOptions>
  ): void | ItemUseMethod {
    // Check if the item use method is not a use
    if (options.method !== ItemUseMethod.Unknown) return;

    // Get the hunger trait of the player
    const hunger = player.getTrait(PlayerHungerTrait);

    // Check if the hunger is full
    if (hunger.currentValue >= hunger.maximumValue) return;

    // Switch the item identifier
    switch (this.item.identifier) {
      // Default food item
      default: {
        hunger.saturation += 1;
        hunger.currentValue += 2;
        break;
      }

      case ItemIdentifier.Apple: {
        hunger.saturation += 2;
        hunger.currentValue += 4;
        break;
      }
    }

    // Decrease the item stack
    // return this.item.decrement();

    return ItemUseMethod.Consume;
  }
}

export { ItemFoodTrait };
