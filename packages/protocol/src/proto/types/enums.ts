import {
	Uint16,
	Uint32,
	Uint8,
	type BinaryStream,
	type Endianness
} from "@serenityjs/binaryutils";
import { DataType } from "@serenityjs/raknet";

class Enums extends DataType {
	public name: string;
	public values: Array<number>;

	public constructor(name: string, values: Array<number>) {
		super();
		this.name = name;
		this.values = values;
	}

	public static override read(
		stream: BinaryStream,
		endian: Endianness,
		enumValues: Array<string>
	): Array<Enums> {
		// Prepare an array to store the enums.
		const enums: Array<Enums> = [];

		// Read the number of enums
		const amount = stream.readVarInt();

		// We then loop through the amount of enums
		// Reading the string from the stream.
		for (let index = 0; index < amount; index++) {
			// Read the fields and push it to the array.
			const name = stream.readVarString();

			// Prepare an array to store the values.
			const values: Array<number> = [];

			// Read the number of values
			const valuesAmount = stream.readVarInt();

			// We then loop through the amount of values
			for (let index = 0; index < valuesAmount; index++) {
				switch (enumValues.length) {
					case 0xff: {
						values.push(stream.readUint8());
						break;
					}
					case 0xff_ff: {
						values.push(stream.readUint16(endian));
						break;
					}
					case 0xff_ff_ff: {
						values.push(stream.readUint32(endian));
						break;
					}
				}
			}

			enums.push(new Enums(name, values));
		}

		// Return the enums.
		return enums;
	}

	public static override write(
		stream: BinaryStream,
		value: Array<Enums>,
		endian: Endianness,
		enumValues: Array<string>
	): void {
		// Write the number of enums given in the array.
		stream.writeVarInt(value.length);

		// Write all the enums to the stream.
		for (const { name, values } of value) {
			stream.writeVarString(name);
			stream.writeVarInt(values.length);
			for (const value of values) {
				// length < 0xff ? 0 : length < 0xffff ? 1 : 2
				const method =
					enumValues.length < 0xff
						? Uint8
						: enumValues.length < 0xff_ff
							? Uint16
							: Uint32;

				method.write(stream, value, endian);
			}
		}
	}
}

export { Enums };
