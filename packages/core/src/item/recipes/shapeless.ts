import {
  InternalType,
  NetworkItemInstanceDescriptor,
  RecipeIngredient,
  RecipeUnlockingRequirement,
  ShapelessRecipe,
  UnlockingContext
} from "@serenityjs/protocol";
import { SHAPELESS_RECIPES } from "@serenityjs/data";
import { BinaryStream } from "@serenityjs/binarystream";

import { ItemType } from "../identity";
import { ItemStack } from "../stack";
import { CraftingRecipeIngredient } from "../types";

import { Recipe } from "./recipe";

class ShapelessCraftingRecipe extends Recipe {
  static {
    // Iterate over all the shapeless recipes.
    for (const recipe of SHAPELESS_RECIPES) {
      // Create a new ShapedCraftingRecipe instance for each recipe.
      const instance = new this(recipe.identifier, [recipe.tag]);

      // Iterate of the ingredients of the recipe.
      for (const ingredient of recipe.ingredients) {
        if (ingredient.type) {
          // Get the ItemType from the ingredient.
          const type = ItemType.get(ingredient.type);
          const metadata = ingredient.metadata ?? 32767; // Default metadata value

          // Check if the type is valid.
          if (!type) continue;

          // Add the ingredient to the instance.
          instance.addIngredient({ type, metadata });
        } else if (ingredient.tag) {
          // Get the tag from the ingredient.
          const tag = ingredient.tag as string;

          // Add the ingredient to the instance.
          instance.addIngredient({ tag });
        }
      }

      // Set the pattern of the recipe.
      instance.priority = recipe.priority ?? 0;

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
   * The ingredients required to craft the recipe.
   */
  public readonly ingredients: Array<CraftingRecipeIngredient> = [];

  /**
   * The priority of the recipe.
   */
  public priority = 0;

  /**
   * Create a new shapeless crafting recipe.
   * @param identifier The identifier of the recipe.
   * @param tags The crafting tags of the recipe.
   */
  public constructor(identifier: string, tags?: Array<string>) {
    super(identifier);

    // Set the tags if provided.
    if (tags) this.tags.push(...tags);
  }

  /**
   * Add an ingredient to the recipe.
   * @param ingredient The ingredient to add, can be a CraftingRecipeIngredient or an ItemType.
   */
  public addIngredient(
    ...ingredient: Array<CraftingRecipeIngredient | ItemType>
  ): this {
    // Iterate over the ingredients and add them to the ingredients array.
    for (const item of ingredient) {
      // Check if the item is a ItemType.
      if (item instanceof ItemType) {
        // If the item is an ItemType, add it as a CraftingRecipeIngredient.
        this.ingredients.push({ type: item });
      } else {
        // Otherwise, add it directly as a CraftingRecipeIngredient.
        this.ingredients.push(item);
      }
    }

    // Return the instance for chaining.
    return this;
  }

  public static toNetwork(
    recipe: ShapelessCraftingRecipe
  ): Array<ShapelessRecipe> {
    // Prepare an array to hold the ingredients.
    const ingredients: Array<RecipeIngredient> = [];

    // Iterate over the ingredients and convert them to RecipeIngredient instances.
    for (const ingredient of recipe.ingredients) {
      // Check if the ingredient has a type.
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
        const recipeIngredient = new RecipeIngredient(InternalType.ItemTag, 0, {
          tag
        });

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
      }
    }

    // Convert the resultant to a network stack.
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
    const recipes: Array<ShapelessRecipe> = [];

    // Iterate over the tags of the recipe.
    for (const tag of recipe.tags) {
      // Create a new ShapelessRecipe instance.
      const entry = new ShapelessRecipe(
        recipe.identifier,
        ingredients,
        resultants,
        recipe.uuid,
        tag,
        recipe.priority,
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

export { ShapelessCraftingRecipe };
