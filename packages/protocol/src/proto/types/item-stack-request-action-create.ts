import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binarystream";

class ItemStackRequestActionCreate extends DataType {
	/**
	 * The slot of the stack request create action.
	 */
	public readonly slot: number;

	/**
	 * Creates a new instance of ItemStackRequestActionCreate.
	 * @param slot - The slot of the stack request create action.
	 */
	public constructor(slot: number) {
		super();
		this.slot = slot;
	}

	public static read(stream: BinaryStream): ItemStackRequestActionCreate {
		// Read the slot.
		const slot = stream.readUint8();

		// Return the stack request create action.
		return new this(slot);
	}

	public static write(
		stream: BinaryStream,
		value: ItemStackRequestActionCreate
	): void {
		// Write the slot.
		stream.writeUint8(value.slot);
	}
}

export { ItemStackRequestActionCreate };
