import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binarystream";

class ItemStackRequestActionCraftRecipe extends DataType {
	/**
	 * The recipe id of the stack request craft recipe action.
	 */
	public readonly recipeId: number;

	/**
	 * The amount of the stack request craft recipe action.
	 */
	public readonly amount: number;

	/**
	 * Creates a new instance of ItemStackRequestActionCraftRecipe.
	 * @param recipeId - The recipe id of the stack request craft
	 * @param amount - The amount of the stack request craft recipe action.
	 */
	public constructor(recipeId: number, amount: number) {
		super();
		this.recipeId = recipeId;
		this.amount = amount;
	}

	public static read(stream: BinaryStream): ItemStackRequestActionCraftRecipe {
		// Read the recipe id.
		const recipeId = stream.readVarInt();

		// Read the amount.
		const amount = stream.readUint8();

		// Return the stack request craft recipe action.
		return new this(recipeId, amount);
	}

	public static write(
		stream: BinaryStream,
		value: ItemStackRequestActionCraftRecipe
	): void {
		// Write the recipe id.
		stream.writeVarInt(value.recipeId);

		// Write the amount.
		stream.writeUint8(value.amount);
	}
}

export { ItemStackRequestActionCraftRecipe };
