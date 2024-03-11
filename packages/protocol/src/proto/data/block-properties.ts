import { DataType } from "@serenityjs/raknet";
import { LightNBT, NBTValue } from "@serenityjs/nbt";

import type { BinaryStream } from "@serenityjs/binaryutils";

class BlockProperties extends DataType {
	public name: string;
	public nbt: NBTValue;

	public constructor(name: string, nbt: NBTValue) {
		super();
		this.name = name;
		this.nbt = nbt;
	}

	public static override read(stream: BinaryStream): Array<BlockProperties> {
		// Prepare an array to store the properties.
		const properties: Array<BlockProperties> = [];

		// Read the number of properties.
		const amount = stream.readVarInt();

		// We then loop through the amount of properties.
		// Reading the individual fields in the stream.
		for (let index = 0; index < amount; index++) {
			// Read all the fields for the rule.
			const name = stream.readVarString();

			// Read the nbt for the property.
			const nbt = LightNBT.ReadRootTag(stream);

			// Push the rule to the array.
			properties.push(new BlockProperties(name, nbt));
		}

		// Return the properties.
		return properties;
	}

	public static override write(
		stream: BinaryStream,
		value: Array<BlockProperties>
	): void {
		// Write the number of properties given in the array.
		stream.writeVarInt(value.length);

		// Loop through the properties.
		for (const property of value) {
			// Write the fields for the property.
			stream.writeVarString(property.name);

			// Write the nbt for the property.
			LightNBT.WriteRootTag(stream, property.nbt);
		}
	}
}

export { BlockProperties };
