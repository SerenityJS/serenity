import type { BinaryStream } from '@serenityjs/binaryutils';
import { Endianness } from '@serenityjs/binaryutils';
import { DataType } from '@serenityjs/raknet-protocol';

class ChunkCoords extends DataType {
	public x: number;
	public z: number;

	public constructor(x: number, z: number) {
		super();
		this.x = x;
		this.z = z;
	}

	public static override read(stream: BinaryStream): ChunkCoords[] {
		// Prepare an array to store the chunks.
		const chunks: ChunkCoords[] = [];

		// Read the number of chunks.
		const amount = stream.readUint32(Endianness.Little);

		// We then loop through the amount of chunks.
		// Reading the individual fields in the stream.
		for (let i = 0; i < amount; i++) {
			// Read all the fields for the chunk.
			const x = stream.readZigZag();
			const z = stream.readZigZag();

			// Push the chunk to the array.
			chunks.push(new ChunkCoords(x, z));
		}

		// Return the chunks.
		return chunks;
	}

	public static override write(stream: BinaryStream, value: ChunkCoords[]): void {
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

export { ChunkCoords };
