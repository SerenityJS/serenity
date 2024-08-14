import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binarystream";

class ItemStackRequestActionCraftGrindstoneRequest extends DataType {
	/**
	 * The recipe id of the stack request craft grindstone action.
	 */
	public readonly recipeId: number;

	/**
	 * The cost of the stack request craft grindstone action.
	 */
	public readonly cost: number;

	/**
	 * The amount of the stack request craft grindstone action.
	 */
	public readonly amount: number;

	/**
	 * Creates a new instance of ItemStackRequestActionCraftGrindstoneRequest.
	 * @param recipeId - The recipe id of the stack request craft
	 * @param cost - The cost of the stack request craft grindstone action.
	 * @param amount - The amount of the stack request craft grindstone action.
	 */
	public constructor(recipeId: number, cost: number, amount: number) {
		super();
		this.recipeId = recipeId;
		this.cost = cost;
		this.amount = amount;
	}

	public static read(
		stream: BinaryStream
	): ItemStackRequestActionCraftGrindstoneRequest {
		// Read the recipe id.
		const recipeId = stream.readVarInt();

		// Read the cost.
		const cost = stream.readVarInt();

		// Read the amount.
		const amount = stream.readUint8();

		// Return the stack request craft grindstone action.
		return new this(recipeId, cost, amount);
	}

	public static write(
		stream: BinaryStream,
		value: ItemStackRequestActionCraftGrindstoneRequest
	): void {
		// Write the recipe id.
		stream.writeVarInt(value.recipeId);

		// Write the cost.
		stream.writeVarInt(value.cost);

		// Write the amount.
		stream.writeUint8(value.amount);
	}
}

export { ItemStackRequestActionCraftGrindstoneRequest };
