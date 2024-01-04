import type { BinaryStream } from '@serenityjs/binarystream';
import { Endianness } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';

interface PackLink {
	id: string;
	url: string;
}

class PackLinks extends DataType {
	public static override read(stream: BinaryStream): PackLink[] {
		// Prepare an array to store the packs.
		const packs: PackLink[] = [];

		// Read the number of packs.
		const amount = stream.readVarInt();

		// We then loop through the amount of packs.
		// Reading the individual fields in the stream.
		for (let i = 0; i < amount; i++) {
			// Read all the fields for the pack.
			const id = stream.readVarString();
			const url = stream.readVarString();

			// Push the pack to the array.
			packs.push({
				id,
				url,
			});
		}

		// Return the packs.
		return packs;
	}

	public static override write(stream: BinaryStream, value: PackLink[]): void {
		// Write the number of packs given in the array.
		stream.writeVarInt(value.length);

		// Loop through the packs.
		for (const pack of value) {
			// Write the fields for the pack.
			stream.writeVarString(pack.id);
			stream.writeVarString(pack.url);
		}
	}
}

export { PackLinks, type PackLink };
