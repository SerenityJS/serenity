import { ChunkCoords, DimensionType } from "@serenityjs/protocol";
import { BinaryStream } from "@serenityjs/binarystream";
import { BlockIdentifier, BlockPermutation } from "@serenityjs/block";

import { SubChunk } from "./sub-chunk";

/**
 * Represents a chunk within a dimension.
 */
export class Chunk {
	/**
	 * The maximum amount of sub chunks.
	 */
	public static readonly MAX_SUB_CHUNKS = 20;

	/**
	 * The dimension type of the chunk.
	 */
	public readonly type: DimensionType;

	/**
	 * The X coordinate of the chunk.
	 */
	public readonly x: number;

	/**
	 * The Z coordinate of the chunk.
	 */
	public readonly z: number;

	/**
	 * The sub chunks of the chunk.
	 */
	public readonly subchunks: Array<SubChunk>;

	/**
	 * Creates a new chunk.
	 *
	 * @param type The dimension type of the chunk.
	 * @param x The X coordinate of the chunk.
	 * @param z The Z coordinate of the chunk.
	 * @param subchunks The sub chunks of the chunk.
	 */
	public constructor(
		type: DimensionType,
		x: number,
		z: number,
		subchunks?: Array<SubChunk>
	) {
		this.type = type;
		this.x = x;
		this.z = z;
		this.subchunks =
			subchunks ??
			Array.from({ length: Chunk.MAX_SUB_CHUNKS }, () => new SubChunk());
	}

	/**
	 * Get the permutation at the given X, Y and Z coordinates.
	 * @param x The X coordinate.
	 * @param y The Y coordinate.
	 * @param z The Z coordinate.
	 */
	public getPermutation(x: number, y: number, z: number): BlockPermutation {
		// Correct the Y level for the overworld.
		const yf = this.type === DimensionType.Overworld ? y + 64 : y;

		// Get the sub chunk.
		const subchunk = this.getSubChunk(yf >> 4);

		// Get the block state.
		const state = subchunk.getState(x & 0xf, yf & 0xf, z & 0xf, 0); // 0 = Solids, 1 = Liquids or Logged

		// Return the permutation.
		return [...BlockPermutation.permutations.values()].find(
			(x) => x.network === state
		) as BlockPermutation;
	}

	/**
	 * Get the Y coordinate of the top block at the given X and Z coordinates that is not air.
	 * @param x The X coordinate.
	 * @param z The Z coordinate.
	 * @param y The Y coordinate. (Optional)
	 */
	public getTopLevel(x: number, z: number, yl = 255): number {
		// Get the Y level.
		for (let y = yl; y >= 0; y--) {
			const permutation = this.getPermutation(x, y, z);
			if (permutation.type.identifier !== BlockIdentifier.Air) return y;
		}

		return -1;
	}

	/**
	 * Set the permutation at the given X, Y and Z coordinates.
	 * @param x The X coordinate.
	 * @param y The Y coordinate.
	 * @param z The Z coordinate.
	 * @param permutation The permutation.
	 */
	public setPermutation(
		x: number,
		y: number,
		z: number,
		permutation: BlockPermutation
	): void {
		// Correct the Y level for the overworld.
		const yf = this.type === DimensionType.Overworld ? y + 64 : y;

		// Get the sub chunk.
		const subchunk = this.getSubChunk(yf >> 4);

		// Get the block state.
		const state = permutation.network;

		// Set the block.
		subchunk.setState(x & 0xf, yf & 0xf, z & 0xf, state, 0); // 0 = Solids, 1 = Liquids or Logged
	}

	// TODO: Move to ChunkCoords type
	/**
	 * Get the hash of the given X and Z coordinates.
	 * @param x The X coordinate.
	 * @param z The Z coordinate.
	 */
	public static getHash(x: number, z: number): bigint {
		return ((BigInt(x) & 0xff_ff_ff_ffn) << 32n) | (BigInt(z) & 0xff_ff_ff_ffn);
	}

	// TODO: Move to ChunkCoords type
	/**
	 * Get the chunk coordinates from the given hash.
	 * @param hash The hash.
	 */
	public static fromHash(hash: bigint): ChunkCoords {
		return new ChunkCoords(Number(hash >> 32n), Number(hash & 0xff_ff_ff_ffn));
	}

	/**
	 * Serialize the chunk.
	 */
	public getHash(): bigint {
		return Chunk.getHash(this.x, this.z);
	}

	/**
	 * Get the sub chunk at the given index.
	 * @param index The index.
	 */
	public getSubChunk(index: number): SubChunk {
		// Check if the sub chunk exists.
		if (!this.subchunks[index]) {
			// Create a new sub chunk.
			for (let index_ = 0; index_ <= index; index_++) {
				if (!this.subchunks[index_]) {
					this.subchunks[index_] = new SubChunk();
				}
			}
		}

		// Return the sub chunk.
		return this.subchunks[index] as SubChunk;
	}

	public getSubChunkSendCount(): number {
		// Loop through each sub chunk.
		let count = 0;
		for (let index = Chunk.MAX_SUB_CHUNKS - 1; index >= 0; index--) {
			// Check if the sub chunk is empty.
			if ((this.subchunks[index] as SubChunk).isEmpty()) {
				count++;
			} else break;
		}

		return Chunk.MAX_SUB_CHUNKS - count;
	}

	public static serialize(chunk: Chunk): Buffer {
		// Create a new stream.
		const stream = new BinaryStream();

		// Serialize each sub chunk.
		for (let index = 0; index < chunk.getSubChunkSendCount(); ++index) {
			SubChunk.serialize(chunk.subchunks[index] as SubChunk, stream);
		}

		// Biomes?
		for (let index = 0; index < 24; index++) {
			stream.writeByte(0);
			stream.writeVarInt(1 << 1);
		}

		// Border blocks?
		stream.writeByte(0);

		// Return the buffer.
		return stream.getBuffer();
	}

	public static deserialize(
		type: DimensionType,
		x: number,
		z: number,
		buffer: Buffer
	): Chunk {
		// Create a new stream.
		const stream = new BinaryStream(buffer);

		// Deserialize each sub chunk.
		const subchunks: Array<SubChunk> = Array.from(
			{ length: Chunk.MAX_SUB_CHUNKS },
			() => new SubChunk()
		);

		// Loop through each sub chunk.
		for (let index = 0; index < Chunk.MAX_SUB_CHUNKS; ++index) {
			if (stream.binary[stream.offset] !== 8) break;
			subchunks[index] = SubChunk.deserialize(stream);
		}

		// Return the chunk.
		return new Chunk(type, x, z, subchunks);
	}
}
