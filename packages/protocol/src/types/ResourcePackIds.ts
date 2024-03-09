import type { BinaryStream } from '@serenityjs/binaryutils';
import { Endianness } from '@serenityjs/binaryutils';
import { DataType } from '@serenityjs/raknet-protocol';

class ResourcePackIds extends DataType {
	public static override read(stream: BinaryStream): string[] {
		// Prepare an array to store the packs.
		const packs: string[] = [];

		// Read the number of packs.
		const amount = stream.readInt16(Endianness.Little);

		// We then loop through the amount of packs.
		// Reading the individual fields in the stream.
		for (let i = 0; i < amount; i++) {
			// Read the pack id.
			const id = stream.readVarString();

			// Push the pack to the array.
			packs.push(id);
		}

		// Return the packs.
		return packs;
	}

	public static override write(stream: BinaryStream, value: string[]): void {
		// Write the number of packs given in the array.
		stream.writeInt16(value.length, Endianness.Little);

		// Loop through the packs.
		for (const pack of value) {
			// Write the pack id.
			stream.writeVarString(pack);
		}
	}
}

export { ResourcePackIds };
