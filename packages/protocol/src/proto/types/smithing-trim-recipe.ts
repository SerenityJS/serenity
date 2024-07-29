import { DataType } from "@serenityjs/raknet";

import { RecipeIngredient } from "./recipe-ingredient";

import type { BinaryStream } from "@serenityjs/binarystream";

class SmithingTrimRecipe extends DataType {
	/**
	 * The identifier of the recipe
	 */
	public readonly identifier: string;

	/**
	 * The template ingredient
	 */
	public readonly templateIngredient: RecipeIngredient;

	/**
	 * The base ingredient
	 */
	public readonly baseIngredient: RecipeIngredient;

	/**
	 * The additional ingredient
	 */
	public readonly additionalIngredient: RecipeIngredient;

	/**
	 * The tag of the recipe
	 */
	public readonly tag: string;

	/**
	 * The network ID of the recipe
	 */
	public readonly recipeNetworkId: number;

	/**
	 * @param identifier The identifier of the recipe
	 * @param templateIngredient The template ingredient
	 * @param baseIngredient The base ingredient
	 * @param additionalIngredient The additional ingredient
	 * @param tag The tag of the recipe
	 * @param recipeNetworkId The network ID of the recipe
	 */
	public constructor(
		identifier: string,
		templateIngredient: RecipeIngredient,
		baseIngredient: RecipeIngredient,
		additionalIngredient: RecipeIngredient,
		tag: string,
		recipeNetworkId: number
	) {
		super();
		this.identifier = identifier;
		this.templateIngredient = templateIngredient;
		this.baseIngredient = baseIngredient;
		this.additionalIngredient = additionalIngredient;
		this.tag = tag;
		this.recipeNetworkId = recipeNetworkId;
	}

	public static read(stream: BinaryStream): SmithingTrimRecipe {
		// Read the identifier of the recipe
		const identifier = stream.readVarString();

		// Read the template ingredient
		const templateIngredient = RecipeIngredient.read(stream);

		// Read the base ingredient
		const baseIngredient = RecipeIngredient.read(stream);

		// Read the additional ingredient
		const additionalIngredient = RecipeIngredient.read(stream);

		// Read the tag of the recipe
		const tag = stream.readVarString();

		// Read the network ID of the recipe
		const recipeNetworkId = stream.readVarInt();

		// Return the recipe
		return new this(
			identifier,
			templateIngredient,
			baseIngredient,
			additionalIngredient,
			tag,
			recipeNetworkId
		);
	}

	public static write(stream: BinaryStream, value: SmithingTrimRecipe): void {
		// Write the identifier of the recipe
		stream.writeVarString(value.identifier);

		// Write the template ingredient
		RecipeIngredient.write(stream, value.templateIngredient);

		// Write the base ingredient
		RecipeIngredient.write(stream, value.baseIngredient);

		// Write the additional ingredient
		RecipeIngredient.write(stream, value.additionalIngredient);

		// Write the tag of the recipe
		stream.writeVarString(value.tag);

		// Write the network ID of the recipe
		stream.writeVarInt(value.recipeNetworkId);
	}
}

export { SmithingTrimRecipe };
