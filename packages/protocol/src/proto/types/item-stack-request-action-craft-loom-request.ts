import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binarystream";

class ItemStackRequestActionCraftLoomRequest extends DataType {
	/**
	 * The pattern of the stack request craft loom action.
	 */
	public readonly pattern: string;

	/**
	 * Creates a new instance of ItemStackRequestActionCraftLoomRequest.
	 * @param pattern - The pattern of the stack request craft
	 */
	public constructor(pattern: string) {
		super();
		this.pattern = pattern;
	}

	public static read(
		stream: BinaryStream
	): ItemStackRequestActionCraftLoomRequest {
		// Read the pattern.
		const pattern = stream.readVarString();

		// Return the stack request craft loom action.
		return new this(pattern);
	}

	public static write(
		stream: BinaryStream,
		value: ItemStackRequestActionCraftLoomRequest
	): void {
		// Write the pattern.
		stream.writeVarString(value.pattern);
	}
}

export { ItemStackRequestActionCraftLoomRequest };
