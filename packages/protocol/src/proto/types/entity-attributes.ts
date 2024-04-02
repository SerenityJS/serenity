import { Endianness } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binarystream";

class EntityAttributes extends DataType {
	/**
	 * The name of the attribute.
	 */
	public name: string;

	/**
	 * The minimum value of the attribute.
	 */
	public min: number;

	/**
	 * The current value of the attribute.
	 */
	public value: number;

	/**
	 * The maximum value of the attribute.
	 */
	public max: number;

	/**
	 * Construct an instance of the class.
	 *
	 * @param name - The name of the attribute.
	 * @param min - The minimum value of the attribute.
	 * @param value - The current value of the attribute.
	 * @param max - The maximum value of the attribute.
	 */
	public constructor(name: string, min: number, value: number, max: number) {
		super();
		this.name = name;
		this.min = min;
		this.value = value;
		this.max = max;
	}

	/**
	 * Read the attributes from the stream.
	 *
	 * @param stream - The stream to read the attributes from.
	 * @returns An array of attributes.
	 */
	public static override read(stream: BinaryStream): Array<EntityAttributes> {
		// Prepare an array to store the attributes.
		const attributes: Array<EntityAttributes> = [];

		// Read the number of attributes.
		const amount = stream.readVarInt();

		// We then loop through the amount of layers.
		// Reading the individual fields in the stream.
		for (let index = 0; index < amount; index++) {
			// Read all the fields for the layer.
			const name = stream.readVarString();
			const min = stream.readFloat32(Endianness.Little);
			const value = stream.readFloat32(Endianness.Little);
			const max = stream.readFloat32(Endianness.Little);

			// Push the attribute to the array.
			attributes.push(new EntityAttributes(name, min, value, max));
		}

		// Return the attributes.
		return attributes;
	}

	/**
	 * Write the attributes to the stream.
	 *
	 * @param stream - The stream to write the attributes to.
	 * @param value - The attributes to write.
	 */
	public static override write(
		stream: BinaryStream,
		value: Array<EntityAttributes>
	): void {
		// Write the amount of attributes.
		stream.writeVarInt(value.length);

		// Loop through the attributes.
		for (const attribute of value) {
			// Write the individual fields.
			stream.writeVarString(attribute.name);
			stream.writeFloat32(attribute.min, Endianness.Little);
			stream.writeFloat32(attribute.value, Endianness.Little);
			stream.writeFloat32(attribute.max, Endianness.Little);
		}
	}
}

export { EntityAttributes };
