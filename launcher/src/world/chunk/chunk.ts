import { ChunkCoords } from "@serenityjs/protocol";
import { BinaryStream } from "@serenityjs/binaryutils";

import { SubChunk } from "./sub-chunk";

import type { Buffer } from "node:buffer";
import type { BlockPermutation } from "./block";

export class Chunk {
	public static readonly MAX_SUB_CHUNKS = 20;

	protected readonly subchunks: Array<SubChunk>;

	public readonly x: number;
	public readonly z: number;

	public constructor(x: number, z: number, subchunks?: Array<SubChunk>) {
		this.x = x;
		this.z = z;
		this.subchunks =
			subchunks ??
			Array.from({ length: Chunk.MAX_SUB_CHUNKS }, () => new SubChunk());
	}

	public getPermutation(x: number, y: number, z: number): BlockPermutation {
		const yl = y + 64;
		// Get the sub chunk.
		const subchunk = this.getSubChunk(yl >> 4);

		// Get the block.
		return subchunk.getPermutation(x & 0xf, yl & 0xf, z & 0xf, 0); // 0 = Solids, 1 = Liquids or Logged
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

		// Set the block.
		subchunk.setPermutation(x & 0xf, yl & 0xf, z & 0xf, permutation, 0); // 0 = Solids, 1 = Liquids or Logged
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

	protected getSubChunk(index: number): SubChunk {
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
		return this.subchunks[index]!;
	}

	public getSubChunkSendCount(): number {
		// Loop through each sub chunk.
		let count = 0;
		for (let index = Chunk.MAX_SUB_CHUNKS - 1; index >= 0; index--) {
			// Check if the sub chunk is empty.
			if (this.subchunks[index]!.isEmpty()) {
				count++;
			} else break;
		}

		return Chunk.MAX_SUB_CHUNKS - count;
	}

	public serialize(): Buffer {
		// Create a new stream.
		const stream = new BinaryStream();

		// Write 4 empty subchunks
		// This eliminates the -64 to 0 y coordinate bug
		/*
		for (let i = 0; i < 4; i++) {
			stream.writeUint8(8);
			stream.writeUint8(0);
		}*/

		// Serialize each sub chunk.
		for (let index = 0; index < this.getSubChunkSendCount(); ++index) {
			this.subchunks[index]!.serialize(stream);
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

	public static deserialize(x: number, z: number, buffer: Buffer): Chunk {
		// Create a new stream.
		const stream = new BinaryStream(buffer);

		// Deserialize each sub chunk.
		const subchunks: Array<SubChunk> = Array.from(
			{ length: Chunk.MAX_SUB_CHUNKS },
			() => new SubChunk()
		);
		for (let index = 0; index < Chunk.MAX_SUB_CHUNKS; ++index) {
			if (stream.binary[stream.offset] !== 8) break;
			subchunks[index] = SubChunk.deserialize(stream);
		}

		// Return the chunk.
		return new Chunk(x, z, subchunks);
	}
}
