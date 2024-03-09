import type { BinaryStream } from '@serenityjs/binaryutils';
import { DataType } from '@serenityjs/raknet-protocol';

class PackLinks extends DataType {
	public id: string;
	public url: string;

	public constructor(id: string, url: string) {
		super();
		this.id = id;
		this.url = url;
	}

	public static override read(stream: BinaryStream): PackLinks[] {
		// Prepare an array to store the packs.
		const packs: PackLinks[] = [];

		// Read the number of packs.
		const amount = stream.readVarInt();

		// We then loop through the amount of packs.
		// Reading the individual fields in the stream.
		for (let i = 0; i < amount; i++) {
			// Read all the fields for the pack.
			const id = stream.readVarString();
			const url = stream.readVarString();

			// Push the pack to the array.
			packs.push(new PackLinks(id, url));
		}

		// Return the packs.
		return packs;
	}

	public static override write(stream: BinaryStream, value: PackLinks[]): void {
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

export { PackLinks };
