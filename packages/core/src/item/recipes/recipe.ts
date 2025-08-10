import { randomUUID } from "node:crypto";

import { ItemStack } from "../stack";
import { ItemType } from "../identity";

class Recipe {
  public static recipeNetworkId = 0;

  public static recipes = new Map<string, Recipe>();

  public readonly identifier: string;

  public readonly uuid: string;

  public readonly recipeNetworkId = ++Recipe.recipeNetworkId;

  public readonly tags: Array<string> = [];

  /**
   * The resulting items of the recipe.
   */
  public readonly resultants: Array<ItemStack | ItemType> = [];

  public constructor(identifier: string) {
    this.identifier = identifier;
    this.uuid = randomUUID();
  }

  /**
   * Add a resultant item to the recipe.
   * @param item The item to add, can be an ItemStack or an ItemType.
   */
  public addResultant(...item: Array<ItemStack | ItemType>): this {
    // Add the items to the resultants array.
    this.resultants.push(...item);

    // Return the instance for chaining.
    return this;
  }
}

export { Recipe };
