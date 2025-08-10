import { ItemType } from "../identity";

interface CraftingRecipeIngredient {
  /**
   * The item type of the ingredient.
   */
  type?: ItemType;

  /**
   * The item tag of the ingredient.
   */
  tag?: string;

  /**
   * The alias identifier of the ingredient.
   */
  alias?: string;

  /**
   * The stack size of the ingredient.
   */
  stackSize?: number;

  /**
   * The metadata of the ingredient.
   */
  metadata?: number;
}

export type { CraftingRecipeIngredient };
