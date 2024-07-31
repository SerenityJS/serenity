import { DataType } from "@serenityjs/raknet";

import { RecipeIngredient } from "./recipe-ingredient";
import { NetworkItemInstanceDescriptor } from "./network-item-instance-descriptor";
import { RecipeUnlockingRequirement } from "./recipe-unlocking-requirement";

import type { BinaryStream } from "@serenityjs/binarystream";

class ShapelessRecipe extends DataType {
	/**
	 * The identifier of the recipe.
	 */
	public readonly identifier: string;

	/**
	 * The ingredients required to craft the recipe.
	 */
	public readonly ingredients: Array<RecipeIngredient>;

	/**
	 * The resultants of the recipe.
	 */
	public readonly resultants: Array<NetworkItemInstanceDescriptor>;

	/**
	 * The UUID of the recipe.
	 * why Mojank why...
	 */
	public readonly uuid: string;

	/**
	 * The tag of the recipe.
	 */
	public readonly tag: string;

	/**
	 * The priority of the recipe.
	 */
	public readonly priority: number;

	/**
	 * The requirement to unlock the recipe.
	 */
	public readonly requirement: RecipeUnlockingRequirement;

	/**
	 * The network ID of the recipe
	 */
	public readonly recipeNetorkId: number;

	/**
	 * @param identifier The identifier of the recipe.
	 * @param ingredients The ingredients required to craft the recipe.
	 * @param resultants The resultants of the recipe.
	 * @param uuid The UUID of the recipe.
	 * @param tag The tag of the recipe.
	 * @param priority The priority of the recipe.
	 * @param requirement The requirement to unlock the recipe.
	 * @param recipeNetorkId The network ID of the recipe
	 */
	public constructor(
		identifier: string,
		ingredients: Array<RecipeIngredient>,
		resultants: Array<NetworkItemInstanceDescriptor>,
		uuid: string,
		tag: string,
		priority: number,
		requirement: RecipeUnlockingRequirement,
		recipeNetorkId: number
	) {
		super();
		this.identifier = identifier;
		this.ingredients = ingredients;
		this.resultants = resultants;
		this.uuid = uuid;
		this.tag = tag;
		this.priority = priority;
		this.requirement = requirement;
		this.recipeNetorkId = recipeNetorkId;
	}

	public static read(stream: BinaryStream): ShapelessRecipe {
		// Read the identifier
		const identifier = stream.readVarString();

		// Read the number of ingredients
		const ingredientsCount = stream.readVarInt();
		const ingredients: Array<RecipeIngredient> = [];

		// Loop through the ingredients
		for (let index = 0; index < ingredientsCount; index++) {
			// Read the ingredient
			const ingredient = RecipeIngredient.read(stream);

			// Add the ingredient to the array
			ingredients.push(ingredient);
		}

		// Read the number of resultants
		const resultantsCount = stream.readVarInt();
		const resultants: Array<NetworkItemInstanceDescriptor> = [];

		// Loop through the resultants
		for (let index = 0; index < resultantsCount; index++) {
			// Read the resultant
			const resultant = NetworkItemInstanceDescriptor.read(stream);

			// Add the resultant to the array
			resultants.push(resultant);
		}

		// Read the UUID
		const uuid = stream.readUuid();

		// Read the tag
		const tag = stream.readVarString();

		// Read the priority
		const priority = stream.readZigZag();

		// Read the requirement
		const requirement = RecipeUnlockingRequirement.read(stream);

		// Read the recipe network ID
		const recipeNetorkId = stream.readVarInt();

		// Return a new instance with the identifier, ingredients, resultants, UUID, tag, priority, and requirement
		return new this(
			identifier,
			ingredients,
			resultants,
			uuid,
			tag,
			priority,
			requirement,
			recipeNetorkId
		);
	}

	public static write(stream: BinaryStream, value: ShapelessRecipe): void {
		// Write the identifier
		stream.writeVarString(value.identifier);

		// Get the ingredients
		const ingredients = value.ingredients as Array<RecipeIngredient>;

		// Write the number of ingredients
		stream.writeVarInt(ingredients.length);

		// Loop through the ingredients
		for (const ingredient of ingredients) {
			// Write the ingredient
			RecipeIngredient.write(stream, ingredient);
		}

		// Get the resultants
		const resultants = value.resultants as Array<NetworkItemInstanceDescriptor>;

		// Write the number of resultants
		stream.writeVarInt(resultants.length);

		// Loop through the resultants
		for (const resultant of resultants) {
			// Write the resultant
			NetworkItemInstanceDescriptor.write(stream, resultant);
		}

		// Write the UUID
		stream.writeUuid(value.uuid);

		// Write the tag
		stream.writeVarString(value.tag);

		// Write the priority
		stream.writeZigZag(value.priority);

		// Write the requirement
		RecipeUnlockingRequirement.write(stream, value.requirement);

		// Write the recipe network ID
		stream.writeVarInt(value.recipeNetorkId);
	}
}

export { ShapelessRecipe };
