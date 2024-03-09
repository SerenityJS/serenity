import type { BinaryStream } from '@serenityjs/binaryutils';
import { Endianness } from '@serenityjs/binaryutils';
import { DataType } from '@serenityjs/raknet-protocol';

class DynamicEnums extends DataType {
	public name: string;
	public values: string[];

	public constructor(name: string, values: string[]) {
		super();
		this.name = name;
		this.values = values;
	}

	public static override read(stream: BinaryStream): DynamicEnums[] {
		// Prepare an array to store the enums.
		const enums: DynamicEnums[] = [];

		// Read the number of DynamicEnums
		const amount = stream.readVarInt();

		// We then loop through the amount of DynamicEnums
		// Reading the string from the stream.
		for (let i = 0; i < amount; i++) {
			// Read the fields and push it to the array.
			const name = stream.readVarString();

			// Prepare an array to store the values.
			const values: string[] = [];

			// Read the number of values
			const valuesAmount = stream.readVarInt();

			// We then loop through the amount of values
			for (let j = 0; j < valuesAmount; j++) {
				// Read the value and push it to the array.
				values.push(stream.readVarString());
			}

			enums.push(new DynamicEnums(name, values));
		}

		// Return the enums
		return enums;
	}

	public static override write(stream: BinaryStream, value: DynamicEnums[]): void {
		// Write the number of enums given in the array.
		stream.writeVarInt(value.length);

		// Write all the enums to the stream.
		for (const { name, values } of value) {
			stream.writeVarString(name);
			stream.writeVarInt(values.length);
			for (const string of values) stream.writeVarString(string);
		}
	}
}

export { DynamicEnums };
