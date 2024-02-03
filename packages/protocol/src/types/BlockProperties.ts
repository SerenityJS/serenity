import type { BinaryStream } from '@serenityjs/binarystream';
import { LightNBT } from '@serenityjs/nbt';
import { DataType } from '@serenityjs/raknet-protocol';

interface BlockProperty {
	name: string;
	nbt: any;
}

class BlockProperties extends DataType {
	public static override read(stream: BinaryStream): BlockProperty[] {
		// Prepare an array to store the properties.
		const properties: BlockProperty[] = [];

		// Read the number of properties.
		const amount = stream.readVarInt();

		// We then loop through the amount of properties.
		// Reading the individual fields in the stream.
		for (let i = 0; i < amount; i++) {
			// Read all the fields for the rule.
			const name = stream.readVarString();

			// Read the nbt for the property.
			const nbt = LightNBT.ReadRootTag(stream);

			// Push the rule to the array.
			properties.push({
				name,
				nbt,
			});
		}

		// Return the properties.
		return properties;
	}

	public static override write(stream: BinaryStream, value: BlockProperty[]): void {
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

export { BlockProperties, type BlockProperty };
