import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binarystream";

class ItemStackRequestActionCraftCreative extends DataType {
	/**
	 * The creative index of the stack request craft.
	 */
	public readonly creativeIndex: number;

	/**
	 * The amount of the stack request craft.
	 */
	public readonly amount: number;

	/**
	 * Creates a new instance of ItemStackRequestActionCraftCreative.
	 * @param creativeIndex - The creative index of the stack request craft.
	 * @param amount - The amount of the stack request craft.
	 */
	public constructor(creativeIndex: number, amount: number) {
		super();
		this.creativeIndex = creativeIndex;
		this.amount = amount;
	}

	public static read(
		stream: BinaryStream
	): ItemStackRequestActionCraftCreative {
		// Read the creative index.
		const creativeIndex = stream.readVarInt();

		// Read the amount.
		const amount = stream.readUint8();

		// Return the stack request craft creative action.
		return new this(creativeIndex, amount);
	}

	public static write(
		stream: BinaryStream,
		value: ItemStackRequestActionCraftCreative
	): void {
		// Write the creative index.
		stream.writeVarInt(value.creativeIndex);

		// Write the amount.
		stream.writeUint8(value.amount);
	}
}

export { ItemStackRequestActionCraftCreative };
