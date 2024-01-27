import type { Buffer } from 'node:buffer';
import type { Vec2f } from '@serenityjs/bedrock-protocol';
import { BinaryStream } from '@serenityjs/binarystream';
import { SubChunk } from './SubChunk';

class ChunkColumn {
	public static readonly MAX_SUB_CHUNKS = 16;

	public readonly x: number;
	public readonly z: number;
	public readonly subchunks: SubChunk[];

	public constructor(x: number, z: number, subchunks?: SubChunk[]) {
		this.x = x;
		this.z = z;
		this.subchunks = subchunks ?? Array.from({ length: ChunkColumn.MAX_SUB_CHUNKS }, () => new SubChunk());
	}

	public static getHash(x: number, z: number): bigint {
		return ((BigInt(x) & 0xffffffffn) << 32n) | (BigInt(z) & 0xffffffffn);
	}

	public static fromHash(hash: bigint): Vec2f {
		return {
			x: Number(hash >> 32n),
			z: Number(hash & 0xffffffffn),
		};
	}

	public getSubChunk(index: number): SubChunk {
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

	public setBlock(x: number, y: number, z: number, runtimeId: number): void {
		// Get the sub chunk.
		const subchunk = this.getSubChunk(y >> 4);

		// Set the block.
		subchunk.setBlock(x & 0xf, y & 0xf, z & 0xf, runtimeId, 0); // 0 = Solids, 1 = Liquids or Logged
	}

	public getBlock(x: number, y: number, z: number): number {
		// Get the sub chunk.
		const subchunk = this.getSubChunk(y >> 4);

		// Get the block.
		return subchunk.getBlock(x & 0xf, y & 0xf, z & 0xf, 0); // 0 = Solids, 1 = Liquids or Logged
	}

	public getSubChunkSendCount(): number {
		// Loop through each sub chunk.
		let count = 0;
		for (let i = ChunkColumn.MAX_SUB_CHUNKS - 1; i >= 0; i--) {
			// Check if the sub chunk is empty.
			if (this.subchunks[i].isEmpty()) {
				count++;
			} else {
				break;
			}
		}

		return ChunkColumn.MAX_SUB_CHUNKS - count;
	}

	public serialize(): Buffer {
		// Create a new stream.
		const stream = new BinaryStream();

		// Write 4 empty subchunks
		// This eliminates the -64 to 0 y coordinate bug
		for (let i = 0; i < 4; i++) {
			stream.writeUint8(8);
			stream.writeUint8(0);
		}

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
}

export { ChunkColumn };
