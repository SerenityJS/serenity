import { DataType } from "@serenityjs/raknet";

import { NetworkItemInstanceDescriptor } from "./network-item-instance-descriptor";

import type { BinaryStream } from "@serenityjs/binarystream";

class ItemStackRequestActionResultsDeprecated extends DataType {
	/**
	 * The resultants of the item stack request action results deprecated.
	 */
	public readonly resultants: Array<NetworkItemInstanceDescriptor>;

	/**
	 * The amount of the item stack request action results deprecated.
	 */
	public readonly amount: number;

	/**
	 * Creates a new instance of ItemStackRequestActionResultsDeprecated.
	 * @param resultants - The resultants of the item stack request action results deprecated.
	 * @param amount - The amount of the item stack request action results deprecated.
	 */
	public constructor(
		resultants: Array<NetworkItemInstanceDescriptor>,
		amount: number
	) {
		super();
		this.resultants = resultants;
		this.amount = amount;
	}

	public static read(
		stream: BinaryStream
	): ItemStackRequestActionResultsDeprecated {
		// Read amount of resultants.
		const resultantsCount = stream.readVarInt();

		// Create an array to store the resultants.
		const resultants = [];

		// Loop through the resultants.
		for (let index = 0; index < resultantsCount; index++) {
			// Read the resultant.
			resultants[index] = NetworkItemInstanceDescriptor.read(stream);
		}

		// Read the amount.
		const amount = stream.readUint8();

		// Return the item stack request action results deprecated.
		return new this(resultants, amount);
	}

	public static write(
		stream: BinaryStream,
		value: ItemStackRequestActionResultsDeprecated
	): void {
		// Write amount of resultants.
		stream.writeVarInt(value.resultants.length);

		// Loop through the resultants.
		for (const resultant of value.resultants) {
			// Write the resultant.
			NetworkItemInstanceDescriptor.write(stream, resultant);
		}

		// Write the amount.
		stream.writeUint8(value.amount);
	}
}

export { ItemStackRequestActionResultsDeprecated };
