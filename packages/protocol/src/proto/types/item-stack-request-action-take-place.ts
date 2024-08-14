import { DataType } from "@serenityjs/raknet";

import { ItemStackRequestSlotInfo } from "./item-stack-request-slot-info";

import type { BinaryStream } from "@serenityjs/binarystream";

class ItemStackActionTakePlace extends DataType {
	/**
	 * The amount of the item stack request action.
	 */
	public readonly amount: number;

	/**
	 * The source of the item stack request action.
	 */
	public readonly source: ItemStackRequestSlotInfo;

	/**
	 * The destination of the item stack request action.
	 */
	public readonly destination: ItemStackRequestSlotInfo;

	/**
	 * Creates a new instance of ItemStackRequestAction.
	 * @param amount - The amount of the item stack request action.
	 * @param source - The source of the item stack request action.
	 * @param destination - The destination of the item stack request action.
	 */
	public constructor(
		amount: number,
		source: ItemStackRequestSlotInfo,
		destination: ItemStackRequestSlotInfo
	) {
		super();
		this.amount = amount;
		this.source = source;
		this.destination = destination;
	}

	public static read(stream: BinaryStream): ItemStackActionTakePlace {
		// Read the amount.
		const amount = stream.readUint8();

		// Read the source.
		const source = ItemStackRequestSlotInfo.read(stream);

		// Read the destination.
		const destination = ItemStackRequestSlotInfo.read(stream);

		// Return the item stack request action.
		return new this(amount, source, destination);
	}

	public static write(
		stream: BinaryStream,
		value: ItemStackActionTakePlace
	): void {
		// Write the amount.
		stream.writeUint8(value.amount);

		// Write the source.
		ItemStackRequestSlotInfo.write(stream, value.source);

		// Write the destination.
		ItemStackRequestSlotInfo.write(stream, value.destination);
	}
}

export { ItemStackActionTakePlace };
