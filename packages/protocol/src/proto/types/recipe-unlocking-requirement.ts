import { DataType } from "@serenityjs/raknet";

import { UnlockingContext } from "../../enums";

import { RecipeIngredient } from "./recipe-ingredient";

import type { BinaryStream } from "@serenityjs/binarystream";

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
		const context = stream.readByte() as UnlockingContext;

		// If the context not `None`, return a new instance with the context
		if (context !== UnlockingContext.None)
			return new RecipeUnlockingRequirement(context, null);

		// Prepare an array to store the ingredients
		const ingredients: Array<RecipeIngredient> = [];

		// Read the number of ingredients
		const count = stream.readVarInt();

		// Loop through the ingredients
		for (let index = 0; index < count; index++) {
			// Read the ingredient
			const ingredient = RecipeIngredient.read(stream);

			// Add the ingredient to the array
			ingredients.push(ingredient);
		}

		// Return a new instance with the context and ingredients
		return new this(context, ingredients);
	}

	public static write(
		stream: BinaryStream,
		value: RecipeUnlockingRequirement
	): void {
		// Write the context
		stream.writeByte(value.context);

		// If the context is `None`, write the number of ingredients and loop through them
		if (value.context === UnlockingContext.None) {
			// Get the ingredients
			const ingredients = value.ingredients as Array<RecipeIngredient>;

			// Write the number of ingredients
			stream.writeVarInt(ingredients.length);

			// Loop through the ingredients
			for (const ingredient of ingredients) {
				// Write the ingredient
				RecipeIngredient.write(stream, ingredient);
			}
		}
	}
}

export { RecipeUnlockingRequirement };
