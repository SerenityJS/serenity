import { DataType } from "@serenityjs/raknet";

import { ItemStackRequestSlotInfo } from "./item-stack-request-slot-info";

import type { BinaryStream } from "@serenityjs/binarystream";

class ItemStackRequestActionDrop extends DataType {
	/**
	 * The amount of the item stack request action.
	 */
	public readonly amount: number;

	/**
	 * The source of the item stack request action.
	 */
	public readonly source: ItemStackRequestSlotInfo;

	/**
	 * Whether the item stack was dropped randomly.
	 */
	public readonly randomly: boolean;

	/**
	 * Creates a new instance of ItemStackRequestActionDrop.
	 * @param amount - The amount of the item stack request action.
	 * @param source - The source of the item stack request action.
	 * @param randomly - Whether the item stack was dropped randomly.
	 */
	public constructor(
		amount: number,
		source: ItemStackRequestSlotInfo,
		randomly: boolean
	) {
		super();
		this.amount = amount;
		this.source = source;
		this.randomly = randomly;
	}

	public static read(stream: BinaryStream): ItemStackRequestActionDrop {
		// Read the amount.
		const amount = stream.readUint8();

		// Read the source.
		const source = ItemStackRequestSlotInfo.read(stream);

		// Read the randomly.
		const randomly = stream.readBool();

		// Return the item stack request action.
		return new this(amount, source, randomly);
	}

	public static write(
		stream: BinaryStream,
		value: ItemStackRequestActionDrop
	): void {
		// Write the amount.
		stream.writeUint8(value.amount);

		// Write the source.
		ItemStackRequestSlotInfo.write(stream, value.source);

		// Write the randomly.
		stream.writeBool(value.randomly);
	}
}

export { ItemStackRequestActionDrop };
