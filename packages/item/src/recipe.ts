import {
	InternalType,
	RecipeIngredient,
	type ShapelessRecipe
} from "@serenityjs/protocol";

import { ItemType } from "./type";

enum RecipeType {
	Shapeless,
	Shaped
}

class ItemRecipe {
	/**
	 * The running total network identifier of recipes.
	 */
	protected static NETWORK = 25_000;

	/**
	 * A collective map of recipes registered.
	 */
	public static readonly recipes = new Map<number, ItemRecipe>();

	/**
	 * The identifier of the recipe.
	 */
	public readonly identifier: string;

	/**
	 * The type of the recipe.
	 */
	public readonly type: RecipeType;

	/**
	 * The network identifier of the recipe.
	 */
	public readonly network = ItemRecipe.NETWORK++;

	/**
	 * The ingredients of the recipe.
	 */
	public readonly ingredients = new Map<number, ItemType>();

	/**
	 * The resultants of the recipe.
	 */
	public readonly resultants = new Set<ItemType>();

	/**
	 * Create a new recipe.
	 * @param identifier The identifier of the recipe.
	 * @param type The type of the recipe.
	 */
	public constructor(identifier: string, type: RecipeType) {
		this.identifier = identifier;
		this.type = type;

		// Add the recipe to the registry.
		ItemRecipe.recipes.set(this.network, this);
	}

	/**
	 * Adds a ingredient to the recipe.
	 * @param type The type of the ingredient.
	 * @param slot The slot of the ingredient.
	 * @returns The recipe.
	 */
	public addIngredient(type: ItemType, slot?: number): this {
		// Set the ingredient in the recipe.
		this.ingredients.set(slot ?? this.ingredients.size + 1, type);

		// Return the recipe.
		return this;
	}

	/**
	 * Adds a resultant to the recipe.
	 * @param type The type of the resultant.
	 */
	public addResultant(type: ItemType): this {
		// Add the resultant to the recipe.
		this.resultants.add(type);

		// Return the recipe.
		return this;
	}

	public static toShapelessRecipe(recipe: ItemRecipe): ShapelessRecipe {
		return {
			identifier: recipe.identifier,
			ingredients: [...recipe.ingredients.values()].map(
				(type) =>
					new RecipeIngredient(
						InternalType.Default,
						{
							networkId: type.network,
							metadata: 0
						},
						null,
						null,
						null,
						null,
						1
					)
			),
			resultants: [...recipe.resultants.values()].map((type) =>
				ItemType.toNetworkInstance(type)
			),
			uuid: "00000000-0000-0000-0000-000000000000",
			tag: "crafting_table",
			priority: 0,
			requirement: {
				context: 0,
				ingredients: []
			},
			recipeNetorkId: recipe.network
		};
	}
}

export { ItemRecipe };
