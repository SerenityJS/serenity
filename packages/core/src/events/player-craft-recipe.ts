import { Recipe } from "../item";
import { Player } from "../entity";
import { WorldEvent } from "../enums";

import { EventSignal } from "./event-signal";

class PlayerCraftRecipeSignal extends EventSignal {
  public static readonly identifier = WorldEvent.PlayerCraftRecipe;

  /**
   * The player that is crafting the recipe.
   */
  public readonly player: Player;

  /**
   * The recipe being crafted.
   */
  public recipe: Recipe;

  /**
   * The amount times the recipe is being crafted.
   */
  public amount: number;

  /**
   * Creates a new instance of the PlayerCraftRecipeSignal class.
   * @param player The player that is crafting the recipe.
   * @param recipe The recipe being crafted.
   * @param amount The amount times the recipe is being crafted.
   */
  public constructor(player: Player, recipe: Recipe, amount: number) {
    // Call the super constructor
    super(player.dimension.world);

    // Assign the properties
    this.player = player;
    this.recipe = recipe;
    this.amount = amount;
  }
}

export { PlayerCraftRecipeSignal };
