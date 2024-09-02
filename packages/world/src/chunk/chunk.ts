import {
	ChunkCoords,
	DimensionType,
	type IPosition
} from "@serenityjs/protocol";
import { BinaryStream } from "@serenityjs/binarystream";
import { BlockIdentifier, BlockPermutation } from "@serenityjs/block";

import { SubChunk } from "./sub-chunk";

/**
 * Represents a chunk within a Dimension instance. Chunks hold sub chunks, which hold block states (BlockPermutations). Chunks can be dirty, meaning they have been modified and need to be saved.
 *
 * **Example Usage**
 * ```typescript
 	import { BlockIdentifier, BlockPermutation } from "@serenityjs/block"
	import { DimensionType } from "@serenityjs/protocol"
	import { Chunk } from "@serenityjs/world"

	// Create a new chunk with the dimension type "Overworld" and the x and z coordinates of 0
	const chunk = new Chunk(DimensionType.Overworld, 0, 0) // DimensionType will determine the maximum height of the chunk

	// First we need to obtain the BlockPermutations we will use to set the blocks
	const bedrock = BlockPermutation.resolve(BlockIdentifier.Bedrock)
	const dirt = BlockPermutation.resolve(BlockIdentifier.Dirt, { dirt_type: "normal" })
	const grass = BlockPermutation.resolve(BlockIdentifier.GrassBlock)

	// We can now set a block at the x, y, and z coordinates of the chunk
	// We will create a Superflat chunk with a maximum height of 4
	for (let x = 0; x < 16; x++) {
		for (let z = 0; z < 16; z++) {
			for (let y = 0; y < 4; y++) {
				// Check if the y coordinate is 0, if so, set the block to bedrock
				if (y === 0) chunk.setPermutation(x, y, z, bedrock)

				// Check if the y coordinate is 1 and 2, if so, set the block to dirt
				else if (y === 1 || y === 2) chunk.setPermutation(x, y, z, dirt)

				// Check if the y coordinate is 3, if so, set the block to grass
				else if (y === 3) chunk.setPermutation(x, y, z, grass)
			}
		}
	}
 * ```
 */
export class Chunk {
	/**
	 * The maximum amount of sub chunks.
	 */
	public static readonly MAX_SUB_CHUNKS = 24;

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
	 * The hash key of the chunk.
	 */
	public readonly hash: bigint;

	/**
	 * The sub chunks of the chunk.
	 */
	public readonly subchunks: Array<SubChunk>;

	public cache: Buffer | null = null;

	/**
	 * If the chunk has been modified, and has not been saved.
	 */
	public dirty = false;

	/**
	 * If the chunk is ready to be sent to the client.
	 */
	public ready = true;

	/**
	 * Creates a new chunk.
	 *
	 * @param type The dimension type of the chunk.
	 * @param x The X coordinate of the chunk.
	 * @param z The Z coordinate of the chunk.
	 * @param subchunks The sub chunks of the chunk.
	 */
	public constructor(
		x: number,
		z: number,
		type: DimensionType,
		subchunks?: Array<SubChunk>
	) {
		this.x = x;
		this.z = z;
		this.type = type;
		this.hash = ChunkCoords.hash({ x, z });
		this.subchunks = subchunks ?? Array.from({ length: Chunk.MAX_SUB_CHUNKS });
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
		return BlockPermutation.permutations.get(state) as BlockPermutation;
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
		permutation: BlockPermutation,
		dirty = true
	): void {
		// Correct the Y level for the overworld.
		const yf = this.type === DimensionType.Overworld ? y + 64 : y;

		// Get the sub chunk.
		const subchunk = this.getSubChunk(yf >> 4);

		// Get the block state.
		const state = permutation.network;

		// Set the block.
		subchunk.setState(x & 0xf, yf & 0xf, z & 0xf, state, 0); // 0 = Solids, 1 = Liquids or Logged

		// Set the chunk as dirty.
		dirty === true ? (this.dirty = true) : null;

		// Set the cache as null.
		this.cache = null;
	}

	/**
	 * Get the topmost level in which a permutation is not air, at the given X and Z coordinates.
	 * @param position The position to query.
	 * @returns The topmost level in which a permutation is not air.
	 */
	public getTopmostLevel(position: IPosition): number {
		// Get the Y level.
		for (let y = position.y; y >= -64; y--) {
			// Get the permutation at the position.
			const permutation = this.getPermutation(position.x, y, position.z);

			// Check if the permutation is air or is not solid.
			if (permutation.type.identifier === BlockIdentifier.Air) continue;
			if (!permutation.type.solid) continue;

			// Return the Y level.
			return y;
		}

		// Return 0 if no block was found.
		return -64;
	}

	/**
	 * Get the bottommost level in which a permutation is not air, at the given X and Z coordinates.
	 * @param position The position to query.
	 * @returns The bottommost level in which a permutation is not air.
	 */
	public getBottommostLevel(position: IPosition): number {
		// Get the Y level.
		for (let y = 0; y <= position.y; y++) {
			const permutation = this.getPermutation(position.x, y, position.z);
			if (permutation.type.identifier !== BlockIdentifier.Air) return y;
		}

		// Return 0 if no block was found.
		return 0;
	}

	/**
	 * Get the sub chunk at the given index.
	 * @param index The index.
	 */
	public getSubChunk(index: number): SubChunk {
		// Check if the index is below 0.
		// Then will we return the bottom sub chunk.
		if (index < 0) return this.getSubChunk(0);

		// Check if the index is above the maximum sub chunks.
		// Then will we return the top sub chunk.
		if (index >= Chunk.MAX_SUB_CHUNKS)
			return this.getSubChunk(Chunk.MAX_SUB_CHUNKS - 1);

		// Check if the sub chunk exists.
		if (!this.subchunks[index]) {
			// Create a new sub chunk.
			for (let ndex = 0; ndex <= index; ndex++) {
				// Check if the sub chunk exists.
				if (this.subchunks[ndex]) continue;

				// Create a new sub chunk.
				const subchunk = new SubChunk();
				subchunk.index = ndex - 4;

				// Set the sub chunk.
				this.subchunks[ndex] = subchunk;
			}
		}

		// Return the sub chunk.
		return this.subchunks[index] as SubChunk;
	}

	/**
	 * Get the amount of sub chunks that need to be sent.
	 */
	public getSubChunkSendCount(): number {
		// Loop through each sub chunk.
		let count = 0;
		for (let index = Chunk.MAX_SUB_CHUNKS - 1; index >= 0; index--) {
			// Get the sub chunk.
			const subchunk = this.subchunks[index];

			// Check if the sub chunk exists.
			if (!subchunk || subchunk.isEmpty()) count++;
			// Break if the sub chunk is not empty, as all sub chunks after this will not be empty.
			else break;
		}

		// Return the count.
		return Chunk.MAX_SUB_CHUNKS - count;
	}

	/**
	 * Check if the chunk is empty.
	 */
	public isEmpty(): boolean {
		// Loop through each sub chunk.
		for (const subchunk of this.subchunks) {
			// Check if the sub chunk is empty.
			if (!subchunk || !subchunk.isEmpty()) {
				// The chunk is not empty.
				return false;
			}
		}

		// The chunk is empty.
		return true;
	}

	/**
	 * Serialize the chunk into a buffer.
	 * @param chunk The chunk to serialize.
	 * @param nbt If block palette should be serialized as NBT.
	 * @returns The serialized buffer.
	 */
	public static serialize(chunk: Chunk, nbt = false): Buffer {
		// Check if the chunk has a cache.
		if (chunk.cache) return chunk.cache;

		// Create a new stream.
		const stream = new BinaryStream();

		// Serialize each sub chunk.
		for (let index = 0; index < chunk.getSubChunkSendCount(); index++) {
			// Get the sub chunk.
			const subchunk = chunk.subchunks[index];

			// Check if the sub chunk exists.
			if (subchunk) {
				// Serialize the sub chunk.
				SubChunk.serialize(subchunk, stream, nbt);
			} else {
				// Create an empty sub chunk.
				const subchunk = new SubChunk();
				subchunk.index = index;

				// Serialize an empty sub chunk.
				SubChunk.serialize(subchunk, stream, nbt);
			}
		}

		// Biomes?
		for (let index = 0; index < 24; index++) {
			stream.writeByte(0);
			stream.writeVarInt(1 << 1);
		}

		// Border blocks?
		stream.writeByte(0);

		// Set the cache of the chunk.
		chunk.cache = stream.getBuffer();

		// Return the buffer.
		return chunk.cache;
	}

	/**
	 * Deserialize a buffer into a chunk.
	 * @param type The dimension type of the chunk.
	 * @param x The X coordinate of the chunk.
	 * @param z The Z coordinate of the chunk.
	 * @param buffer The buffer to deserialize.
	 * @param nbt If block palette should be deserialized as NBT.
	 * @returns The deserialized chunk.
	 */
	public static deserialize(
		type: DimensionType,
		x: number,
		z: number,
		buffer: Buffer,
		nbt = false
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
			const header = stream.binary[stream.offset];

			if (header !== 8 && header !== 9) break;
			subchunks[index] = SubChunk.deserialize(stream, nbt);
		}

		// Biomes?
		for (let index = 0; index < 24; index++) {
			stream.readByte();
			stream.readVarInt();
		}

		// Border blocks?
		stream.readByte();

		// Create a new chunk.
		const chunk = new Chunk(x, z, type, subchunks);

		// Return the chunk.
		return chunk;
	}
}
