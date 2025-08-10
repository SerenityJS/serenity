import {
  InternalType,
  NetworkItemInstanceDescriptor,
  RecipeIngredient,
  RecipeUnlockingRequirement,
  ShapedRecipe,
  UnlockingContext
} from "@serenityjs/protocol";
import { SHAPED_RECIPES } from "@serenityjs/data";
import { BinaryStream } from "@serenityjs/binarystream";

import { ItemType } from "../identity";
import { CraftingRecipeIngredient } from "../types";
import { ItemStack } from "../stack";

import { Recipe } from "./recipe";

class ShapedCraftingRecipe extends Recipe {
  static {
    // Iterate over all the shaped recipes.
    for (const recipe of SHAPED_RECIPES) {
      // Create a new ShapedCraftingRecipe instance for each recipe.
      const instance = new this(recipe.identifier, [recipe.tag]);

      // Iterate of the keys of the recipe.
      for (const [key, ingredient] of Object.entries(recipe.key)) {
        if (ingredient.type) {
          // Get the ItemType from the ingredient.
          const type = ItemType.get(ingredient.type);
          const metadata = ingredient.metadata ?? 32767; // Default metadata value

          // Check if the type is valid.
          if (!type) continue;

          // Add the key to the instance.
          instance.addKey(key, { type, metadata });
        } else if (ingredient.tag) {
          // Get the tag from the ingredient.
          const tag = ingredient.tag as string;

          // Add the key to the instance.
          instance.addKey(key, { tag });
        } else if (ingredient.alias) {
          // Get the alias from the ingredient.
          const alias = ingredient.alias as string;

          // Add the key to the instance.
          instance.addKey(key, { alias });
        }
      }

      // Set the pattern of the recipe.
      instance.pattern = recipe.pattern as [string, string, string];
      instance.priority = recipe.priority ?? 0;
      instance.symmetrical = recipe.symmetrical ?? true;

      // Add the resultants to the instance.
      for (const resultant of recipe.resultants) {
        // Check if the resultant is an ItemType.
        if (resultant.type) {
          // Create a buffer from the instance string.
          const buffer = Buffer.from(resultant.instance, "base64");

          // Create a BinaryStream from the buffer.
          const stream = new BinaryStream(buffer);

          // Read the NetworkItemInstanceDescriptor from the stream.
          const descriptor = NetworkItemInstanceDescriptor.read(stream);

          // Convert the descriptor to an ItemStack.
          const stack = ItemStack.fromNetworkInstance(descriptor);

          // If the stack is valid, add it as a resultant.
          if (stack) instance.addResultant(stack);
        }
      }

      // Add the instance to the recipes map.
      this.recipes.set(recipe.identifier, instance);
    }
  }

  /**
   * The ingredients keys and their corresponding CraftingRecipeIngredient.
   */
  public readonly keys: Record<string, CraftingRecipeIngredient> = {};

  /**
   * The pattern of the recipe, represented as an array of strings.
   * Each string represents a row in the crafting grid, with a maximum of three characters per row.
   */
  public pattern: [string, string, string] = ["", "", ""];

  /**
   * The priority of the recipe.
   */
  public priority = 0;

  /**
   * Whether the recipe is symmetrical or not.
   */
  public symmetrical = true;

  public constructor(identifier: string, tags?: Array<string>) {
    super(identifier);

    // Set the tags if provided.
    if (tags) this.tags.push(...tags);
  }

  public addKey(
    key: string,
    ingredient: CraftingRecipeIngredient | ItemType
  ): this {
    // Validate the key is a single character.
    if (key.length !== 1) {
      throw new Error(`Key must be a single character, got: ${key}`);
    }

    // Check if the ingredient is an ItemType.
    if (ingredient instanceof ItemType) {
      // If it is, convert it to a CraftingRecipeIngredient.
      this.keys[key.toUpperCase()] = { type: ingredient };
    } else {
      // Otherwise, add it directly.
      this.keys[key.toUpperCase()] = ingredient;
    }

    // Return the instance for chaining.
    return this;
  }

  public static toNetwork(recipe: ShapedCraftingRecipe): Array<ShapedRecipe> {
    // Prepare the width and height of the recipe.
    let width = 0;
    let height = 0;

    // Prepare an array to hold the ingredients.
    const ingredients: Array<RecipeIngredient> = [];

    // Iterate over the pattern of the recipe.
    for (const row of recipe.pattern) {
      // Determine the height of the recipe.
      if (row.length > 0) height++;
      width = Math.max(width, row.length);

      // Iterate over each character in the row.
      for (const char of row) {
        // Get the ingredient from the keys using the character.
        const ingredient = recipe.keys[char.toUpperCase()];

        // Check if the ingredient exists.
        if (ingredient?.type) {
          // Get the network ID, stack size, and metadata from the ingredient.
          const networkId = ingredient.type.network;
          const stackSize = ingredient.stackSize ?? 1;
          const metadata = ingredient.metadata ?? 32767; // Default metadata value

          // Create a new RecipeIngredient instance.
          const recipeIngredient = new RecipeIngredient(
            InternalType.Default,
            stackSize,
            { networkId, metadata }
          );

          // Add the ingredient to the ingredients array.
          ingredients.push(recipeIngredient);
        } else if (ingredient?.tag) {
          // Get the tag from the ingredient.
          const tag = ingredient.tag;

          // If the ingredient is a tag, create a RecipeIngredient for it.
          const recipeIngredient = new RecipeIngredient(
            InternalType.ItemTag,
            0,
            { tag }
          );

          // Add the ingredient to the ingredients array.
          ingredients.push(recipeIngredient);
        } else if (ingredient?.alias) {
          // Get the name of the identifier.
          const name = ingredient.alias;

          // If the ingredient is a complex alias, create a RecipeIngredient for it.
          const recipeIngredient = new RecipeIngredient(
            InternalType.ComplexAlias,
            0,
            { name }
          );

          // Add the ingredient to the ingredients array.
          ingredients.push(recipeIngredient);
        } else {
          // Create an empty RecipeIngredient for missing keys.
          ingredients.push(new RecipeIngredient(InternalType.Invalid, 0, null));
        }
      }
    }

    // Convert the resultants to network stacks.
    const resultants: Array<NetworkItemInstanceDescriptor> = [];

    // Iterate over the resultants and convert them to NetworkItemInstanceDescriptor instances.
    for (const item of recipe.resultants) {
      // Check if the item is an ItemType.
      if (item instanceof ItemType) {
        // Convert the ItemType to a NetworkItemInstanceDescriptor.
        const descriptor = ItemType.toNetworkStack(item);

        // Add the descriptor to the resultants array.
        resultants.push(descriptor);
      } else {
        // Otherwise, assume it's an ItemStack and convert it to a NetworkItemInstanceDescriptor.
        const descriptor = ItemStack.toNetworkStack(item);

        // Add the descriptor to the resultants array.
        resultants.push(descriptor);
      }
    }

    // Prepare an array to hold the recipes.
    const recipes: Array<ShapedRecipe> = [];

    // Iterate over the tags of the recipe.
    for (const tag of recipe.tags) {
      // Create a new ShapedRecipe instance.
      const entry = new ShapedRecipe(
        recipe.identifier,
        width,
        height,
        ingredients,
        resultants,
        recipe.uuid,
        tag,
        recipe.priority,
        recipe.symmetrical,
        new RecipeUnlockingRequirement(UnlockingContext.None, []),
        recipe.recipeNetworkId
      );

      // Add the entry to the recipes array.
      recipes.push(entry);
    }

    // Return the recipes array.
    return recipes;
  }
}

export { ShapedCraftingRecipe };
