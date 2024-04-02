import { Endianness } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binarystream";

interface EntityPropertyData {
	index: number;
	value: number;
}

class EntityProperties extends DataType {
	public floats: Array<EntityPropertyData>;
	public ints: Array<EntityPropertyData>;

	public constructor(
		floats: Array<EntityPropertyData>,
		ints: Array<EntityPropertyData>
	) {
		super();
		this.floats = floats;
		this.ints = ints;
	}

	public static override read(stream: BinaryStream): EntityProperties {
		// Prepare an array to store the ints.
		const ints: Array<EntityPropertyData> = [];

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
		const floats: Array<EntityPropertyData> = [];

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
		return new EntityProperties(floats, ints);
	}

	public static override write(
		stream: BinaryStream,
		value: EntityProperties
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

export { EntityProperties };
