import { DataType } from "@serenityjs/raknet";

import { ItemStackRequestSlotInfo } from "./item-stack-request-slot-info";

import type { BinaryStream } from "@serenityjs/binarystream";

class ItemStackRequestActionDestroyConsume extends DataType {
	/**
	 * The amount of the item stack request action.
	 */
	public readonly amount: number;

	/**
	 * The source of the item stack request action.
	 */
	public readonly source: ItemStackRequestSlotInfo;

	/**
	 * Creates a new instance of ItemStackRequestActionDestroyConsume.
	 * @param amount - The amount of the item stack request action.
	 * @param source - The source of the item stack request action.
	 */
	public constructor(amount: number, source: ItemStackRequestSlotInfo) {
		super();
		this.amount = amount;
		this.source = source;
	}

	public static read(
		stream: BinaryStream
	): ItemStackRequestActionDestroyConsume {
		// Read the amount.
		const amount = stream.readUint8();

		// Read the source.
		const source = ItemStackRequestSlotInfo.read(stream);

		// Return the item stack request action.
		return new this(amount, source);
	}

	public static write(
		stream: BinaryStream,
		value: ItemStackRequestActionDestroyConsume
	): void {
		// Write the amount.
		stream.writeUint8(value.amount);

		// Write the source.
		ItemStackRequestSlotInfo.write(stream, value.source);
	}
}

export { ItemStackRequestActionDestroyConsume };
