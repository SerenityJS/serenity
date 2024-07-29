import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binarystream";

class ContainerMixDataEntry extends DataType {
	/**
	 * The input network ID.
	 */
	public readonly inputNetworkId: number;

	/**
	 * The ingredient network ID.
	 */
	public readonly reactantNetworkId: number;

	/**
	 * The output network ID.
	 */
	public readonly resultantNetworkId: number;

	/**
	 * Creates an instance of ContainerMixDataEntry.
	 * @param inputNetworkId The input network ID.
	 * @param reactantNetworkId The ingredient network ID.
	 * @param resultantNetworkId The output network ID.
	 */
	public constructor(
		inputNetworkId: number,
		reactantNetworkId: number,
		resultantNetworkId: number
	) {
		super();
		this.inputNetworkId = inputNetworkId;
		this.reactantNetworkId = reactantNetworkId;
		this.resultantNetworkId = resultantNetworkId;
	}

	public static read(stream: BinaryStream): Array<ContainerMixDataEntry> {
		// Prepare an array to store the entries.
		const entries = new Array<ContainerMixDataEntry>();

		// Read the count of entries.
		const count = stream.readVarInt();

		// Loop through the entries.
		for (let index = 0; index < count; index++) {
			// Read the input network ID.
			const inputNetworkId = stream.readZigZag();

			// Read the ingredient network ID.
			const reactantNetworkId = stream.readZigZag();

			// Read the output network ID.
			const resultantNetworkId = stream.readZigZag();

			const entry = new this(
				inputNetworkId,
				reactantNetworkId,
				resultantNetworkId
			);

			entries.push(entry);
		}

		// Return the entries.
		return entries;
	}

	public static write(
		stream: BinaryStream,
		entries: Array<ContainerMixDataEntry>
	): void {
		// Write the count of entries.
		stream.writeVarInt(entries.length);

		// Loop through the entries.
		for (const entry of entries) {
			// Write the input network ID.
			stream.writeZigZag(entry.inputNetworkId);

			// Write the ingredient network ID.
			stream.writeZigZag(entry.reactantNetworkId);

			// Write the output network ID.
			stream.writeZigZag(entry.resultantNetworkId);
		}
	}
}

export { ContainerMixDataEntry };
