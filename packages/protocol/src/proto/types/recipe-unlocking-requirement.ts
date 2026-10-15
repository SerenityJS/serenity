import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { UnlockingContext } from "../../enums";

import { RecipeIngredient } from "./recipe-ingredient";

class RecipeUnlockingRequirement extends DataType {
  /**
   * The context in which the recipe is unlocked.
   */
  public readonly context: UnlockingContext;

  /**
   * The ingredients required to unlock the recipe.
   * Only used in the `UnlockingContext.None` context.
   */
  public readonly ingredients: Array<RecipeIngredient> | null;

  /**
   * @param context The context in which the recipe is unlocked.
   * @param ingredients The ingredients required to unlock the recipe.
   * Only used in the `UnlockingContext.None` context.
   */
  public constructor(
    context: UnlockingContext,
    ingredients: Array<RecipeIngredient> | null
  ) {
    super();
    this.context = context;
    this.ingredients = ingredients;
  }

  public static read(stream: BinaryStream): RecipeUnlockingRequirement {
    // Read the context
    const context = stream.readZigZag() as UnlockingContext;

    // Check if the ingredients are present, they are only present in the `None` context
    if (!stream.readBool())
      return new RecipeUnlockingRequirement(context, null);

    // Prepare an array to store the ingredients
    const ingredients: Array<RecipeIngredient> = [];

    // Read the number of ingredients
    const count = stream.readVarInt();

    // Loop through the number of ingredients
    for (let index = 0; index < count; index++) {
      // Read the ingredient
      ingredients.push(RecipeIngredient.read(stream));
    }

    // Return a new instance with the context and ingredients
    return new this(context, ingredients);
  }

  public static write(
    stream: BinaryStream,
    value: RecipeUnlockingRequirement
  ): void {
    // Write the context
    stream.writeZigZag(value.context);

    // The ingredients are only present in the `None` context
    const present = value.context === UnlockingContext.None;
    stream.writeBool(present);

    // If the ingredients are present, write the number of ingredients and loop through them
    if (present) {
      // Get the ingredients
      const ingredients = value.ingredients ?? [];

      // Write the number of ingredients
      stream.writeVarInt(ingredients.length);

      // Loop through the ingredients
      for (const ingredient of ingredients) {
        // Write the ingredient
        RecipeIngredient.write(stream, ingredient);
      }
    }
  }

  /**
   * Reads an optional unlocking requirement, which is preceded by a presence flag.
   * @param stream The stream to read from.
   * @returns The unlocking requirement, or null if it is not present.
   */
  public static readOptional(
    stream: BinaryStream
  ): RecipeUnlockingRequirement | null {
    return stream.readBool() ? RecipeUnlockingRequirement.read(stream) : null;
  }

  /**
   * Writes an optional unlocking requirement, preceded by a presence flag.
   * @param stream The stream to write to.
   * @param value The unlocking requirement, or null if it is not present.
   */
  public static writeOptional(
    stream: BinaryStream,
    value: RecipeUnlockingRequirement | null
  ): void {
    stream.writeBool(value !== null);
    if (value !== null) RecipeUnlockingRequirement.write(stream, value);
  }
}

export { RecipeUnlockingRequirement };
