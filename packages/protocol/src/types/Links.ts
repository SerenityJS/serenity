import type { BinaryStream } from '@serenityjs/binarystream';
import { Endianness } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';

interface Link {
	immediate: boolean;
	riddenEntityId: bigint;
	riderEntityId: bigint;
	riderInitiated: boolean;
	type: number;
}

class Links extends DataType {
	public static override read(stream: BinaryStream): Link[] {
		// Prepare an array to store the links.
		const links: Link[] = [];

		// Read the number of links
		const amount = stream.readVarInt();

		// We then loop through the amount of links.
		// Reading the individual fields in the stream.
		for (let i = 0; i < amount; i++) {
			// Read all the fields for the link.
			const riddenEntityId = stream.readZigZong();
			const riderEntityId = stream.readZigZong();
			const type = stream.readUint8();
			const immediate = stream.readBool();
			const riderInitiated = stream.readBool();

			// Push the link to the array.
			links.push({
				immediate,
				riddenEntityId,
				riderEntityId,
				riderInitiated,
				type,
			});
		}

		// Return the links.
		return links;
	}

	public static override write(stream: BinaryStream, value: Link[]): void {
		// Write the number of links given in the array.
		stream.writeVarInt(value.length);

		// Loop through the links.
		for (const link of value) {
			// Write the fields for the link.
			stream.writeZigZong(link.riddenEntityId);
			stream.writeZigZong(link.riderEntityId);
			stream.writeUint8(link.type);
			stream.writeBool(link.immediate);
			stream.writeBool(link.riderInitiated);
		}
	}
}

export { Links, type Link };
