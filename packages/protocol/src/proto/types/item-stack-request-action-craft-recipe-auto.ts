import { DataType } from "@serenityjs/raknet";

import { RecipeIngredient } from "./recipe-ingredient";

import type { BinaryStream } from "@serenityjs/binarystream";

class ItemStackRequestActionCraftRecipeAuto extends DataType {
	/**
	 * The recipe id of the stack request craft recipe action.
	 */
	public readonly recipeId: number;

	/**
	 * The times crafted of the stack request craft recipe action.
	 */
	public readonly timesCrafted: number;

	/**
	 * The ingredients of the stack request craft recipe action.
	 */
	public readonly ingredients: Array<RecipeIngredient>;

	/**
	 * Creates a new instance of ItemStackRequestActionCraftRecipeAuto.
	 * @param recipeId - The recipe id of the stack request craft
	 * @param timesCrafted - The times crafted of the stack request craft recipe action.
	 * @param ingredients - The ingredients of the stack request craft recipe action.
	 */
	public constructor(
		recipeId: number,
		timesCrafted: number,
		ingredients: Array<RecipeIngredient>
	) {
		super();
		this.recipeId = recipeId;
		this.timesCrafted = timesCrafted;
		this.ingredients = ingredients;
	}

	public static read(
		stream: BinaryStream
	): ItemStackRequestActionCraftRecipeAuto {
		// Read the recipe id.
		const recipeId = stream.readVarInt();

		// Read the times crafted.
		const timesCrafted = stream.readUint8();

		// Read amount of ingredients.
		const ingredientsCount = stream.readVarInt();

		// Create an array to store the ingredients.
		const ingredients = [];

		// Loop through the ingredients.
		for (let index = 0; index < ingredientsCount; index++) {
			// Read the ingredient.
			ingredients[index] = RecipeIngredient.read(stream);
		}

		// Return the stack request craft recipe action.
		return new this(recipeId, timesCrafted, ingredients);
	}

	public static write(
		stream: BinaryStream,
		value: ItemStackRequestActionCraftRecipeAuto
	): void {
		// Write the recipe id.
		stream.writeVarInt(value.recipeId);

		// Write the times crafted.
		stream.writeUint8(value.timesCrafted);

		// Write the amount of ingredients.
		stream.writeVarInt(value.ingredients.length);

		// Loop through the ingredients.
		for (const ingredient of value.ingredients) {
			// Write the ingredient.
			RecipeIngredient.write(stream, ingredient);
		}
	}
}

export { ItemStackRequestActionCraftRecipeAuto };
