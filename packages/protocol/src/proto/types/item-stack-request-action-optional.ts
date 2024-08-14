import { DataType } from "@serenityjs/raknet";
import { Endianness, type BinaryStream } from "@serenityjs/binarystream";

class ItemStackRequestActionOptional extends DataType {
	/**
	 * The recipe id of the stack request craft recipe action.
	 */
	public readonly recipeId: number;

	/**
	 * The times crafted of the stack request craft recipe action.
	 */
	public readonly filteredStringIndex: number;

	/**
	 * Creates a new instance of ItemStackRequestActionCraftRecipeAuto.
	 * @param recipeId - The recipe id of the stack request craft
	 * @param timesCrafted - The times crafted of the stack request craft recipe action.
	 */
	public constructor(recipeId: number, filteredStringIndex: number) {
		super();
		this.recipeId = recipeId;
		this.filteredStringIndex = filteredStringIndex;
	}

	public static read(stream: BinaryStream): ItemStackRequestActionOptional {
		// Read the recipe id.
		const recipeId = stream.readVarInt();

		// Read the times crafted.
		const filteredStringIndex = stream.readUint32(Endianness.Little);

		// Return the stack request craft recipe action.
		return new this(recipeId, filteredStringIndex);
	}

	public static write(
		stream: BinaryStream,
		value: ItemStackRequestActionOptional
	): void {
		// Write the recipe id.
		stream.writeVarInt(value.recipeId);

		// Write the times crafted.
		stream.writeUint32(value.filteredStringIndex, Endianness.Little);
	}
}

export { ItemStackRequestActionOptional };
