import type { BinaryStream } from '@serenityjs/binarystream';
import { Endianness } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';

interface ChunkCoord {
	x: number;
	z: number;
}

class ChunkCoords extends DataType {
	public static override read(stream: BinaryStream): ChunkCoord[] {
		// Prepare an array to store the chunks.
		const chunks: ChunkCoord[] = [];

		// Read the number of chunks.
		const amount = stream.readUint32(Endianness.Little);

		// We then loop through the amount of chunks.
		// Reading the individual fields in the stream.
		for (let i = 0; i < amount; i++) {
			// Read all the fields for the chunk.
			const x = stream.readZigZag();
			const z = stream.readZigZag();

			// Push the chunk to the array.
		}

		// Return the chunks.
		return chunks;
	}

	public static override write(stream: BinaryStream, value: ChunkCoord[]): void {
		// Write the number of chunks given in the array.
		stream.writeUint32(value.length, Endianness.Little);

		// Loop through the chunks.
		for (const chunk of value) {
			// Write the fields for the chunk.
			stream.writeZigZag(chunk.x);
			stream.writeZigZag(chunk.z);
		}
	}
}

export { ChunkCoords, type ChunkCoord };
