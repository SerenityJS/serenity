import { Endianness } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binarystream";

interface Data {
	index: number;
	value: number;
}

class PropertySyncData extends DataType {
	/**
	 * The floats of the property sync data.
	 */
	public readonly floats: Array<Data>;

	/**
	 * The ints of the property sync data.
	 */
	public readonly ints: Array<Data>;

	/**
	 * Creates a new property sync data.
	 * @param floats The floats of the property sync data.
	 * @param ints The ints of the property sync data.
	 */
	public constructor(floats: Array<Data>, ints: Array<Data>) {
		super();
		this.floats = floats;
		this.ints = ints;
	}

	public static override read(stream: BinaryStream): PropertySyncData {
		// Prepare an array to store the ints.
		const ints: Array<Data> = [];

		// Read the number of ints
		const iamount = stream.readVarInt();

		// We then loop through the amount of ints.
		// Reading the individual fields in the stream.
		for (let index = 0; index < iamount; index++) {
			// Read all the fields for the int.
			const index = stream.readVarInt();
			const value = stream.readZigZag();

			// Push the int to the array.
			ints.push({
				index,
				value
			});
		}

		// Prepare an array to store the floats.
		const floats: Array<Data> = [];

		// Read the number of floats
		const famount = stream.readVarInt();

		// We then loop through the amount of floats.
		// Reading the individual fields in the stream.
		for (let index = 0; index < famount; index++) {
			// Read all the fields for the float.
			const index = stream.readVarInt();
			const value = stream.readFloat32(Endianness.Little);

			// Push the float to the array.
			floats.push({
				index,
				value
			});
		}

		// Return the properties.
		return new PropertySyncData(floats, ints);
	}

	public static override write(
		stream: BinaryStream,
		value: PropertySyncData
	): void {
		// Write the number of ints given in the array.
		stream.writeVarInt(value.ints.length);

		// Loop through the ints.
		for (const int of value.ints) {
			// Write the fields for the int.
			stream.writeVarInt(int.index);
			stream.writeZigZag(int.value);
		}

		// Write the number of floats given in the array.
		stream.writeVarInt(value.floats.length);

		// Loop through the floats.
		for (const float of value.floats) {
			// Write the fields for the float.
			stream.writeVarInt(float.index);
			stream.writeFloat32(float.value, Endianness.Little);
		}
	}
}

export { PropertySyncData };
