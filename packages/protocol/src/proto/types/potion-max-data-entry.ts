import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binarystream";

class PotionMixDataEntry extends DataType {
	/**
	 * The input network ID.
	 */
	public readonly inputNetworkId: number;

	/**
	 * The input metadata.
	 */
	public readonly inputMetadata: number;

	/**
	 * The ingredient network ID.
	 */
	public readonly ingredientNetworkId: number;

	/**
	 * The ingredient metadata.
	 */
	public readonly ingredientMetadata: number;

	/**
	 * The output network ID.
	 */
	public readonly resultantNetworkId: number;

	/**
	 * The output metadata.
	 */
	public readonly resultantMetadata: number;

	/**
	 * Creates an instance of PotionMixDataEntry.
	 * @param inputNetworkId The input network ID.
	 * @param inputMetadata The input metadata.
	 * @param ingredientNetworkId The ingredient network ID.
	 * @param ingredientMetadata The ingredient metadata.
	 * @param resultantNetworkId The output network ID.
	 * @param resultantMetadata The output metadata.
	 */
	public constructor(
		inputNetworkId: number,
		inputMetadata: number,
		ingredientNetworkId: number,
		ingredientMetadata: number,
		resultantNetworkId: number,
		resultantMetadata: number
	) {
		super();
		this.inputNetworkId = inputNetworkId;
		this.inputMetadata = inputMetadata;
		this.ingredientNetworkId = ingredientNetworkId;
		this.ingredientMetadata = ingredientMetadata;
		this.resultantNetworkId = resultantNetworkId;
		this.resultantMetadata = resultantMetadata;
	}

	public static read(stream: BinaryStream): Array<PotionMixDataEntry> {
		// Read the number of entries
		const entries = stream.readVarInt();

		// Create an array to store the entries
		const data: Array<PotionMixDataEntry> = [];

		// Loop through the entries
		for (let index = 0; index < entries; index++) {
			// Read the input network ID
			const inputNetworkId = stream.readZigZag();

			// Read the input metadata
			const inputMetadata = stream.readZigZag();

			// Read the ingredient network ID
			const ingredientNetworkId = stream.readZigZag();

			// Read the ingredient metadata
			const ingredientMetadata = stream.readZigZag();

			// Read the output network ID
			const resultantNetworkId = stream.readZigZag();

			// Read the output metadata
			const resultantMetadata = stream.readZigZag();

			// Add the entry to the array
			data.push(
				new this(
					inputNetworkId,
					inputMetadata,
					ingredientNetworkId,
					ingredientMetadata,
					resultantNetworkId,
					resultantMetadata
				)
			);
		}

		// Return the data
		return data;
	}

	public static write(
		stream: BinaryStream,
		data: Array<PotionMixDataEntry>
	): void {
		// Write the number of entries
		stream.writeVarInt(data.length);

		// Loop through the entries
		for (const entry of data) {
			// Write the input network ID
			stream.writeZigZag(entry.inputNetworkId);

			// Write the input metadata
			stream.writeZigZag(entry.inputMetadata);

			// Write the ingredient network ID
			stream.writeZigZag(entry.ingredientNetworkId);

			// Write the ingredient metadata
			stream.writeZigZag(entry.ingredientMetadata);

			// Write the output network ID
			stream.writeZigZag(entry.resultantNetworkId);

			// Write the output metadata
			stream.writeZigZag(entry.resultantMetadata);
		}
	}
}

export { PotionMixDataEntry };
