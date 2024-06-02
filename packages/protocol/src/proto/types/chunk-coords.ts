import { Endianness } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binarystream";

class ChunkCoords extends DataType {
	public x: number;
	public z: number;

	public constructor(x: number, z: number) {
		super();
		this.x = x;
		this.z = z;
	}

	public static override read(stream: BinaryStream): Array<ChunkCoords> {
		// Prepare an array to store the chunks.
		const chunks: Array<ChunkCoords> = [];

		// Read the number of chunks.
		const amount = stream.readUint32(Endianness.Little);

		// We then loop through the amount of chunks.
		// Reading the individual fields in the stream.
		for (let index = 0; index < amount; index++) {
			// Read all the fields for the chunk.
			const x = stream.readZigZag();
			const z = stream.readZigZag();

			// Push the chunk to the array.
			chunks.push(new ChunkCoords(x, z));
		}

		// Return the chunks.
		return chunks;
	}

	public static override write(
		stream: BinaryStream,
		value: Array<ChunkCoords>
	): void {
		// Write the number of chunks given in the array.
		stream.writeUint32(value.length, Endianness.Little);

		// Loop through the chunks.
		for (const chunk of value) {
			// Write the fields for the chunk.
			stream.writeZigZag(chunk.x);
			stream.writeZigZag(chunk.z);
		}
	}

	/**
	 * Convert the chunk coordinates to a hash.
	 * @param coords The chunk coordinates.
	 * @returns The hash of the chunk coordinates.
	 */
	public static hash(coords: ChunkCoords): bigint {
		const x = BigInt(coords.x);
		const z = BigInt(coords.z);

		const hash = (x << 32n) | (z & 0xff_ff_ff_ffn);

		return hash;
	}

	/**
	 * Convert the hash to chunk coordinates.
	 * @param hash The hash.
	 * @returns The chunk coordinates.
	 */
	public static unhash(hash: bigint): ChunkCoords {
		// Extract the x coordinate by shifting right by 32 bits
		const x = Number(hash >> 32n);

		// Extract the z coordinate by masking with 0xFFFFFFFF
		const bigZ = hash & 0xff_ff_ff_ffn;

		// Convert BigInt coordinates back to regular numbers
		const z = Number(bigZ >= 0x80_00_00_00n ? bigZ - 0x1_00_00_00_00n : bigZ);

		// Return the ChunkCoords object
		return new ChunkCoords(x, z);
	}
}

export { ChunkCoords };
