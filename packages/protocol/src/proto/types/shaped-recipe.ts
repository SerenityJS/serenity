import { DataType } from "@serenityjs/raknet";

import { RecipeIngredient } from "./recipe-ingredient";
import { NetworkItemInstanceDescriptor } from "./network-item-instance-descriptor";
import { RecipeUnlockingRequirement } from "./recipe-unlocking-requirement";

import type { BinaryStream } from "@serenityjs/binarystream";

class ShapedRecipe extends DataType {
	/**
	 * The identifier of the recipe.
	 */
	public readonly identifier: string;

	/**
	 * The width of the recipe.
	 */
	public readonly width: number;

	/**
	 * The height of the recipe.
	 */
	public readonly height: number;

	/**
	 * The ingredients required to craft the recipe.
	 * `width` * `height` array
	 */
	public readonly ingredients: Array<RecipeIngredient>;

	/**
	 * The resultants of the recipe
	 */
	public readonly resultants: Array<NetworkItemInstanceDescriptor>;

	/**
	 * The UUID of the recipe.
	 */
	public readonly uuid: string;

	/**
	 * The tag of the recipe.
	 */
	public readonly tag: string;

	/**
	 * The priority of the recipe
	 */
	public readonly priority: number;

	/**
	 * Whether the recipe is symmetrical
	 */
	public readonly symmetrical: boolean;

	/**
	 * The requirement to unlock the recipe
	 */
	public readonly requirement: RecipeUnlockingRequirement;

	/**
	 * The network ID of the recipe
	 */
	public readonly recipeNetorkId: number;

	/**
	 * @param identifier The identifier of the recipe
	 * @param width The width of the recipe
	 * @param height The height of the recipe
	 * @param ingredients The ingredients required to craft the recipe
	 * @param resultants The resultants of the recipe
	 * @param uuid The UUID of the recipe
	 * @param tag The tag of the recipe
	 * @param priority The priority of the recipe
	 * @param symmetrical Whether the recipe is symmetrical
	 * @param requirement The requirement to unlock the recipe
	 * @param recipeNetorkId The network ID of the recipe
	 */
	public constructor(
		identifier: string,
		width: number,
		height: number,
		ingredients: Array<RecipeIngredient>,
		resultants: Array<NetworkItemInstanceDescriptor>,
		uuid: string,
		tag: string,
		priority: number,
		symmetrical: boolean,
		requirement: RecipeUnlockingRequirement,
		recipeNetorkId: number
	) {
		super();
		this.identifier = identifier;
		this.width = width;
		this.height = height;
		this.ingredients = ingredients;
		this.resultants = resultants;
		this.uuid = uuid;
		this.tag = tag;
		this.priority = priority;
		this.symmetrical = symmetrical;
		this.requirement = requirement;
		this.recipeNetorkId = recipeNetorkId;
	}

	public static read(stream: BinaryStream): ShapedRecipe {
		// Read the identifier
		const identifier = stream.readVarString();

		// Read the width
		const width = stream.readZigZag();

		// Read the height
		const height = stream.readZigZag();

		// Prepare an array to store the ingredients
		const ingredients: Array<RecipeIngredient> = [];

		// Loop through the ingredients
		for (let index = 0; index < width * height; index++) {
			// Read the ingredient
			const ingredient = RecipeIngredient.read(stream);

			// Add the ingredient to the array
			ingredients.push(ingredient);
		}

		// Prepare an array to store the resultants
		const resultants: Array<NetworkItemInstanceDescriptor> = [];

		// Read the number of resultants
		const resultantsCount = stream.readVarInt();

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

		// Read the symmetrical
		const symmetrical = stream.readBool();

		// Read the requirement
		const requirement = RecipeUnlockingRequirement.read(stream);

		// Read the recipe network ID
		const recipeNetorkId = stream.readVarInt();

		// Return a new instance
		return new this(
			identifier,
			width,
			height,
			ingredients,
			resultants,
			uuid,
			tag,
			priority,
			symmetrical,
			requirement,
			recipeNetorkId
		);
	}

	public static write(stream: BinaryStream, value: ShapedRecipe): void {
		// Write the identifier
		stream.writeVarString(value.identifier);

		// Write the width
		stream.writeZigZag(value.width);

		// Write the height
		stream.writeZigZag(value.height);

		// Loop through the ingredients
		for (const ingredient of value.ingredients) {
			// Write the ingredient
			RecipeIngredient.write(stream, ingredient);
		}

		// Write the number of resultants
		stream.writeVarInt(value.resultants.length);

		// Loop through the resultants
		for (const resultant of value.resultants) {
			// Write the resultant
			NetworkItemInstanceDescriptor.write(stream, resultant);
		}

		// Write the UUID
		stream.writeUuid(value.uuid);

		// Write the tag
		stream.writeVarString(value.tag);

		// Write the priority
		stream.writeZigZag(value.priority);

		// Write the symmetrical
		stream.writeBool(value.symmetrical);

		// Write the requirement
		RecipeUnlockingRequirement.write(stream, value.requirement);

		// Write the recipe network ID
		stream.writeVarInt(value.recipeNetorkId);
	}
}

export { ShapedRecipe };
