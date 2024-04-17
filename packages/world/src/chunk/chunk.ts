import { ChunkCoords } from "@serenityjs/protocol";
import { BinaryStream } from "@serenityjs/binarystream";
import { BlockPermutation } from "@serenityjs/block";

import { SubChunk } from "./sub-chunk";

/**
 * Represents a chunk within a dimension.
 */
export class Chunk {
	public static readonly MAX_SUB_CHUNKS = 20;

	public readonly x: number;
	public readonly z: number;

	public readonly hashes: boolean;

	public readonly subchunks: Array<SubChunk>;

	public constructor(
		x: number,
		z: number,
		hashes: boolean,
		subchunks?: Array<SubChunk>
	) {
		this.x = x;
		this.z = z;
		this.hashes = hashes;
		this.subchunks =
			subchunks ??
			Array.from(
				{ length: Chunk.MAX_SUB_CHUNKS },
				() => new SubChunk(this.hashes)
			);
	}

	public getPermutation(x: number, y: number, z: number): BlockPermutation {
		const yl = y + 64;
		// Get the sub chunk.
		const subchunk = this.getSubChunk(yl >> 4);

		// Get the block state.
		const state = subchunk.getState(x & 0xf, yl & 0xf, z & 0xf, 0); // 0 = Solids, 1 = Liquids or Logged

		// Return the permutation.
		return [...BlockPermutation.permutations.values()].find(
			(x) => x.network === state
		) as BlockPermutation;
	}

	public setPermutation(
		x: number,
		y: number,
		z: number,
		permutation: BlockPermutation
	): void {
		const yl = y + 64;
		// Get the sub chunk.
		const subchunk = this.getSubChunk(yl >> 4);

		// Get the block state.
		const state = permutation.network;

		// Set the block.
		subchunk.setState(x & 0xf, yl & 0xf, z & 0xf, state, 0); // 0 = Solids, 1 = Liquids or Logged
	}

	public static getHash(x: number, z: number): bigint {
		return ((BigInt(x) & 0xff_ff_ff_ffn) << 32n) | (BigInt(z) & 0xff_ff_ff_ffn);
	}

	public static fromHash(hash: bigint): ChunkCoords {
		return new ChunkCoords(Number(hash >> 32n), Number(hash & 0xff_ff_ff_ffn));
	}

	public getHash(): bigint {
		return Chunk.getHash(this.x, this.z);
	}

	public getSubChunk(index: number): SubChunk {
		// Check if the sub chunk exists.
		if (!this.subchunks[index]) {
			// Create a new sub chunk.
			for (let index_ = 0; index_ <= index; index_++) {
				if (!this.subchunks[index_]) {
					this.subchunks[index_] = new SubChunk(this.hashes);
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
		x: number,
		z: number,
		hashes: boolean,
		buffer: Buffer
	): Chunk {
		// Create a new stream.
		const stream = new BinaryStream(buffer);

		// Deserialize each sub chunk.
		const subchunks: Array<SubChunk> = Array.from(
			{ length: Chunk.MAX_SUB_CHUNKS },
			() => new SubChunk(hashes)
		);

		// Loop through each sub chunk.
		for (let index = 0; index < Chunk.MAX_SUB_CHUNKS; ++index) {
			if (stream.binary[stream.offset] !== 8) break;
			subchunks[index] = SubChunk.deserialize(hashes, stream);
		}

		// Return the chunk.
		return new Chunk(x, z, hashes, subchunks);
	}
}
