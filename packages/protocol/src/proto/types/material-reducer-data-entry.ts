import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binarystream";

class MaterialReducerDataEntry extends DataType {
	/**
	 * The input network ID.
	 */
	public readonly inputNetworkId: number;

	/**
	 * The network ID of the resultant.
	 */
	public readonly resultantNetworkId: number;

	/**
	 * The stack size of the resultant.
	 */
	public readonly resultantStackSize: number;

	public constructor(
		inputNetworkId: number,
		resultantNetworkId: number,
		resultantStackSize: number
	) {
		super();
		this.inputNetworkId = inputNetworkId;
		this.resultantNetworkId = resultantNetworkId;
		this.resultantStackSize = resultantStackSize;
	}

	public static read(stream: BinaryStream): Array<MaterialReducerDataEntry> {
		// Prepare an array to store the entries.
		const entries = new Array<MaterialReducerDataEntry>();

		// Read the count of entries.
		const count = stream.readVarInt();

		// Loop through the entries.
		for (let index = 0; index < count; index++) {
			// Read the input network ID.
			const inputNetworkId = stream.readZigZag();

			// Read the count of resultants.
			const resultantNetworkId = stream.readZigZag();
			const resultantStackSize = stream.readZigZag();

			// Create an instance of the entry.
			const entry = new this(
				inputNetworkId,
				resultantNetworkId,
				resultantStackSize
			);

			// Add the entry to the array.
			entries.push(entry);
		}

		// Return the entries.
		return entries;
	}

	public static write(
		stream: BinaryStream,
		entries: Array<MaterialReducerDataEntry>
	): void {
		// Write the count of entries.
		stream.writeVarInt(entries.length);

		// Loop through the entries.
		for (const entry of entries) {
			// Write the input network ID.
			stream.writeZigZag(entry.inputNetworkId);

			// Write the network ID of the resultant.
			stream.writeZigZag(entry.resultantNetworkId);

			// Write the stack size of the resultant.
			stream.writeZigZag(entry.resultantStackSize);
		}
	}
}

export { MaterialReducerDataEntry };
