import { DataType } from "@serenityjs/raknet";

import { ItemStackRequestSlotInfo } from "./item-stack-request-slot-info";

import type { BinaryStream } from "@serenityjs/binarystream";

class ItemStackRequestActionSwap extends DataType {
	/**
	 * The source of the item stack request action.
	 */
	public readonly source: ItemStackRequestSlotInfo;

	/**
	 * The destination of the item stack request action.
	 */
	public readonly destination: ItemStackRequestSlotInfo;

	/**
	 * Creates a new instance of ItemStackRequestActionSwap.
	 * @param source - The source of the item stack request action.
	 * @param destination - The destination of the item stack request action.
	 */
	public constructor(
		source: ItemStackRequestSlotInfo,
		destination: ItemStackRequestSlotInfo
	) {
		super();
		this.source = source;
		this.destination = destination;
	}

	public static read(stream: BinaryStream): ItemStackRequestActionSwap {
		// Read the source.
		const source = ItemStackRequestSlotInfo.read(stream);

		// Read the destination.
		const destination = ItemStackRequestSlotInfo.read(stream);

		// Return the item stack request action.
		return new this(source, destination);
	}

	public static write(
		stream: BinaryStream,
		value: ItemStackRequestActionSwap
	): void {
		// Write the source.
		ItemStackRequestSlotInfo.write(stream, value.source);

		// Write the destination.
		ItemStackRequestSlotInfo.write(stream, value.destination);
	}
}

export { ItemStackRequestActionSwap };
