import type { Buffer } from 'node:buffer';
import { ChunkCoords } from '@serenityjs/bedrock-protocol';
import { BinaryStream } from '@serenityjs/binaryutils';
import { SubChunk } from './SubChunk.js';
import type { BlockPermutation } from './block/index.js';

export class Chunk {
	public static readonly MAX_SUB_CHUNKS = 20;

	protected readonly subchunks: SubChunk[];

	public readonly x: number;
	public readonly z: number;

	public constructor(x: number, z: number, subchunks?: SubChunk[]) {
		this.x = x;
		this.z = z;
		this.subchunks = subchunks ?? Array.from({ length: Chunk.MAX_SUB_CHUNKS }, () => new SubChunk());
	}

	public getPermutation(x: number, y: number, z: number): BlockPermutation {
		const yl = y + 64;
		// Get the sub chunk.
		const subchunk = this.getSubChunk(yl >> 4);

		// Get the block.
		return subchunk.getPermutation(x & 0xf, yl & 0xf, z & 0xf, 0); // 0 = Solids, 1 = Liquids or Logged
	}

	public setPermutation(x: number, y: number, z: number, permutation: BlockPermutation): void {
		const yl = y + 64;
		// Get the sub chunk.
		const subchunk = this.getSubChunk(yl >> 4);

		// Set the block.
		subchunk.setPermutation(x & 0xf, yl & 0xf, z & 0xf, permutation, 0); // 0 = Solids, 1 = Liquids or Logged
	}

	public static getHash(x: number, z: number): bigint {
		return ((BigInt(x) & 0xffffffffn) << 32n) | (BigInt(z) & 0xffffffffn);
	}

	public static fromHash(hash: bigint): ChunkCoords {
		return new ChunkCoords(Number(hash >> 32n), Number(hash & 0xffffffffn));
	}

	public getHash(): bigint {
		return Chunk.getHash(this.x, this.z);
	}

	protected getSubChunk(index: number): SubChunk {
		// Check if the sub chunk exists.
		if (!this.subchunks[index]) {
			// Create a new sub chunk.
			for (let i = 0; i <= index; i++) {
				if (!this.subchunks[i]) {
					this.subchunks[i] = new SubChunk();
				}
			}
		}

		// Return the sub chunk.
		return this.subchunks[index];
	}

	public getSubChunkSendCount(): number {
		// Loop through each sub chunk.
		let count = 0;
		for (let i = Chunk.MAX_SUB_CHUNKS - 1; i >= 0; i--) {
			// Check if the sub chunk is empty.
			if (this.subchunks[i].isEmpty()) {
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
		for (let i = 0; i < this.getSubChunkSendCount(); ++i) {
			this.subchunks[i].serialize(stream);
		}

		// Biomes?
		for (let i = 0; i < 24; i++) {
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
		const subchunks: SubChunk[] = Array.from({ length: Chunk.MAX_SUB_CHUNKS }, () => new SubChunk());
		for (let i = 0; i < Chunk.MAX_SUB_CHUNKS; ++i) {
			if (stream.binary[stream.offset] !== 8) break;
			subchunks[i] = SubChunk.deserialize(stream);
		}

		// Return the chunk.
		return new Chunk(x, z, subchunks);
	}
}
