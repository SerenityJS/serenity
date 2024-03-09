import type { BinaryStream } from '@serenityjs/binaryutils';
import { DataType } from '@serenityjs/raknet-protocol';

class EnumConstraints extends DataType {
	public valueIndex: number;
	public enumIndex: number;
	public constaints: number[];

	public constructor(valueIndex: number, enumIndex: number, constaints: number[]) {
		super();
		this.valueIndex = valueIndex;
		this.enumIndex = enumIndex;
		this.constaints = constaints;
	}

	public static override read(stream: BinaryStream): EnumConstraints[] {
		// Prepare an array to store the enums.
		const enums: EnumConstraints[] = [];

		// Read the number of EnumConstraints
		const amount = stream.readVarInt();

		// We then loop through the amount of EnumConstraints
		// Reading the string from the stream.
		for (let i = 0; i < amount; i++) {
			// Read the fields and push it to the array.
			const valueIndex = stream.readInt32();
			const enumIndex = stream.readInt32();

			// Prepare an array to store the values.
			const constaints: number[] = [];

			// Read the number of constaints
			const constaintsAmount = stream.readVarInt();

			// We then loop through the amount of constaints
			for (let j = 0; j < constaintsAmount; j++) {
				// Read the value and push it to the array.
				constaints.push(stream.readUint8());
			}

			enums.push(new EnumConstraints(valueIndex, enumIndex, constaints));
		}

		// Return the enums
		return enums;
	}

	public static override write(stream: BinaryStream, value: EnumConstraints[]): void {
		// Write the number of enums given in the array.
		stream.writeVarInt(value.length);

		// Write all the enums to the stream.
		for (const { valueIndex, enumIndex, constaints } of value) {
			stream.writeInt32(valueIndex);
			stream.writeInt32(enumIndex);
			stream.writeVarInt(constaints.length);
			for (const constraint of constaints) stream.writeUint8(constraint);
		}
	}
}

export { EnumConstraints };
