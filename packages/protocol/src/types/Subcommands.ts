import type { BinaryStream } from '@serenityjs/binaryutils';
import { Endianness } from '@serenityjs/binaryutils';
import { DataType } from '@serenityjs/raknet-protocol';

interface SubcommandValue {
	index: number;
	value: number;
}

class Subcommands extends DataType {
	public name: string;
	public values: SubcommandValue[];

	public constructor(name: string, values: SubcommandValue[]) {
		super();
		this.name = name;
		this.values = values;
	}

	public static override read(stream: BinaryStream): Subcommands[] {
		// Prepare an array to store the Subcommands.
		const subcommands: Subcommands[] = [];

		// Read the number of Subcommands
		const amount = stream.readVarInt();

		// We then loop through the amount of Subcommands
		// Reading the string from the stream.
		for (let i = 0; i < amount; i++) {
			// Read the fields and push it to the array.
			const name = stream.readVarString();

			// Prepare an array to store the values.
			const values: SubcommandValue[] = [];

			// Read the number of values
			const valuesAmount = stream.readVarInt();

			// We then loop through the amount of values
			for (let j = 0; j < valuesAmount; j++) {
				// Read the value and push it to the array.
				const index = stream.readUint16(Endianness.Little);
				const value = stream.readUint16(Endianness.Little);

				values.push({ index, value });
			}

			subcommands.push(new Subcommands(name, values));
		}

		// Return the Subcommands.
		return subcommands;
	}

	public static override write(stream: BinaryStream, value: Subcommands[]): void {
		// Write the number of Subcommands given in the array.
		stream.writeVarInt(value.length);

		// Write all the Subcommands to the stream.
		for (const { name, values } of value) {
			stream.writeVarString(name);
			stream.writeVarInt(values.length);
			for (const { index, value } of values) {
				stream.writeUint16(index, Endianness.Little);
				stream.writeUint16(value, Endianness.Little);
			}
		}
	}
}

export { Subcommands };
