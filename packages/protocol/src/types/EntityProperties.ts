import type { BinaryStream } from '@serenityjs/binarystream';
import { Endianness } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';

interface EntityPropertyData {
	index: number;
	value: number;
}

interface EntityProperty {
	floats: EntityPropertyData[];
	ints: EntityPropertyData[];
}

class EntityProperties extends DataType {
	public static override read(stream: BinaryStream): EntityProperty {
		// Prepare an array to store the ints.
		const ints: EntityPropertyData[] = [];

		// Read the number of ints
		const iamount = stream.readVarInt();

		// We then loop through the amount of ints.
		// Reading the individual fields in the stream.
		for (let i = 0; i < iamount; i++) {
			// Read all the fields for the int.
			const index = stream.readVarInt();
			const value = stream.readZigZag();

			// Push the int to the array.
			ints.push({
				index,
				value,
			});
		}

		// Prepare an array to store the floats.
		const floats: EntityPropertyData[] = [];

		// Read the number of floats
		const famount = stream.readVarInt();

		// We then loop through the amount of floats.
		// Reading the individual fields in the stream.
		for (let i = 0; i < famount; i++) {
			// Read all the fields for the float.
			const index = stream.readVarInt();
			const value = stream.readFloat32(Endianness.Little);

			// Push the float to the array.
			floats.push({
				index,
				value,
			});
		}

		// Return the properties.
		return {
			floats,
			ints,
		};
	}

	public static override write(stream: BinaryStream, value: EntityProperty): void {
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

export { EntityProperties, type EntityProperty };
