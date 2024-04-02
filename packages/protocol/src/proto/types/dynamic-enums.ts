import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binarystream";

class DynamicEnums extends DataType {
	public name: string;
	public values: Array<string>;

	public constructor(name: string, values: Array<string>) {
		super();
		this.name = name;
		this.values = values;
	}

	public static override read(stream: BinaryStream): Array<DynamicEnums> {
		// Prepare an array to store the enums.
		const enums: Array<DynamicEnums> = [];

		// Read the number of DynamicEnums
		const amount = stream.readVarInt();

		// We then loop through the amount of DynamicEnums
		// Reading the string from the stream.
		for (let index = 0; index < amount; index++) {
			// Read the fields and push it to the array.
			const name = stream.readVarString();

			// Prepare an array to store the values.
			const values: Array<string> = [];

			// Read the number of values
			const valuesAmount = stream.readVarInt();

			// We then loop through the amount of values
			for (let index = 0; index < valuesAmount; index++) {
				// Read the value and push it to the array.
				values.push(stream.readVarString());
			}

			enums.push(new DynamicEnums(name, values));
		}

		// Return the enums
		return enums;
	}

	public static override write(
		stream: BinaryStream,
		value: Array<DynamicEnums>
	): void {
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
