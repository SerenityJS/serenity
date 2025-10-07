import { ItemUseMethod } from "@serenityjs/protocol";

import { Player, PlayerHungerTrait } from "../../entity";
import { ItemStackUseOptions } from "../types";
import { ItemTypeFoodComponent } from "../identity";
import { ItemStack } from "../stack";

import { ItemStackTrait } from "./trait";

class ItemStackFoodTrait extends ItemStackTrait {
  public static readonly identifier = "food";
  public static readonly component = ItemTypeFoodComponent;

  /**
   * Whether the item can always be eaten, regardless of the player's hunger level.
   */
  public canAlwaysEat: boolean = false;

  /**
   * The nutrition value of the food item.
   * This value can be negative, which would result in hunger loss.
   */
  public nutrition: number = 1;

  /**
   * The saturation modifier of the food item.
   * This value must be greater than 0.
   */
  public saturationModifier: number = 1;

  /**
   * The effects that are applied when the food is consumed.
   */
  public effects: { id: number, chance: number, duration: number, amplifier: number }[] = [];

  /**
   * Creates a new instance of the item food trait.
   * @param item The item stack that this trait will be attached to.
   */
  public constructor(item: ItemStack) {
    super(item);

    // Check if the base item type has a food component
    if (item.type.components.hasFood()) {
      // Get the food component from the item type
      const component = item.type.components.getFood();

      // Set the properties from the food component
      this.canAlwaysEat = component.getCanAlwaysEat();
      this.nutrition = component.getNutrition();
      this.saturationModifier = component.getSaturationModifier();
      this.effects = component.getEffects();
    }
  }

  public onUse(
    player: Player,
    options: Partial<ItemStackUseOptions>
  ): void | ItemUseMethod {
    // Check if the item use method is not an eat method
    if (options.method !== ItemUseMethod.Eat) return;

    // Get the hunger trait of the player
    const hunger = player.getTrait(PlayerHungerTrait);

    // Check if the hunger is full or if the item cannot be consumed
    if (hunger.currentValue >= hunger.maximumValue && !this.canAlwaysEat) return;

    // Increase the player's hunger and saturation
    hunger.currentValue += this.nutrition;
    hunger.saturation += this.nutrition * this.saturationModifier * 2;

    // Apply effect(s) if defined
    for (const effect of this.effects) {
      // Check if the effect should be applied
      if (Math.random() <= effect.chance) {
        // Apply the effect to the player
        player.addEffect(effect.id, effect.duration, { amplifier: effect.amplifier });
      }
    }

    // Decrease the item stack
    this.item.decrementStack();

    // Return the consume item use method
    return ItemUseMethod.Consume;
  }
}

export { ItemStackFoodTrait };
