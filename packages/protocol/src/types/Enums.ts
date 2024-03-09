import { Uint16, Uint32, Uint8, type BinaryStream, type Endianness } from '@serenityjs/binaryutils';
import { DataType } from '@serenityjs/raknet-protocol';

class Enums extends DataType {
	public name: string;
	public values: number[];

	public constructor(name: string, values: number[]) {
		super();
		this.name = name;
		this.values = values;
	}

	public static override read(stream: BinaryStream, endian: Endianness, enumValues: string[]): Enums[] {
		// Prepare an array to store the enums.
		const enums: Enums[] = [];

		// Read the number of enums
		const amount = stream.readVarInt();

		// We then loop through the amount of enums
		// Reading the string from the stream.
		for (let i = 0; i < amount; i++) {
			// Read the fields and push it to the array.
			const name = stream.readVarString();

			// Prepare an array to store the values.
			const values: number[] = [];

			// Read the number of values
			const valuesAmount = stream.readVarInt();

			// We then loop through the amount of values
			for (let j = 0; j < valuesAmount; j++) {
				switch (enumValues.length) {
					case 0xff:
						values.push(stream.readUint8());
						break;
					case 0xffff:
						values.push(stream.readUint16(endian));
						break;
					case 0xffffff:
						values.push(stream.readUint32(endian));
						break;
				}
			}

			enums.push(new Enums(name, values));
		}

		// Return the enums.
		return enums;
	}

	public static override write(stream: BinaryStream, value: Enums[], endian: Endianness, enumValues: string[]): void {
		// Write the number of enums given in the array.
		stream.writeVarInt(value.length);

		// Write all the enums to the stream.
		for (const { name, values } of value) {
			stream.writeVarString(name);
			stream.writeVarInt(values.length);
			for (const value of values) {
				// length < 0xff ? 0 : length < 0xffff ? 1 : 2
				const method = enumValues.length < 0xff ? Uint8 : enumValues.length < 0xffff ? Uint16 : Uint32;

				method.write(stream, value, endian);
			}
		}
	}
}

export { Enums };
