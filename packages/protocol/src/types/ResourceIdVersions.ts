import type { BinaryStream } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';

interface ResourceIdVersion {
	name: string;
	uuid: string;
	version: string;
}

class ResourceIdVersions extends DataType {
	public static override read(stream: BinaryStream): ResourceIdVersion[] {
		// Prepare an array to store the packs.
		const packs: ResourceIdVersion[] = [];

		// Read the number of packs.
		const amount = stream.readVarInt();

		// We then loop through the amount of packs.
		// Reading the individual fields in the stream.
		for (let i = 0; i < amount; i++) {
			// Read all the fields for the pack.
			const uuid = stream.readVarString();
			const version = stream.readVarString();
			const name = stream.readVarString();

			// Push the pack to the array.
			packs.push({
				name,
				uuid,
				version,
			});
		}

		// Return the packs.
		return packs;
	}

	public static override write(stream: BinaryStream, value: ResourceIdVersion[]): void {
		// Write the number of packs given in the array.
		stream.writeVarInt(value.length);

		// Loop through the packs.
		for (const pack of value) {
			// Write the fields for the pack.
			stream.writeVarString(pack.uuid);
			stream.writeVarString(pack.version);
			stream.writeVarString(pack.name);
		}
	}
}

export { ResourceIdVersions, type ResourceIdVersion };
