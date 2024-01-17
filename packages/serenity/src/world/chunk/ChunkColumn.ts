import type { Buffer } from 'node:buffer';
import { BinaryStream } from '@serenityjs/binarystream';
import { SubChunk } from './SubChunk';

// Note: This is a temporary implementation of the chunk column class.
// I do not believe this is the best way to implement this, but it works for now.
// I'm not smart enough to figure out how to implement this properly at the moment lol.

class ChunkColumn {
	public readonly x: number;
	public readonly z: number;
	public readonly subchunks: SubChunk[];

	public constructor(x: number, z: number, subchunks?: SubChunk[]) {
		this.x = x;
		this.z = z;
		this.subchunks = subchunks ?? Array.from({ length: 16 }, () => new SubChunk());
	}

	public getSubChunk(index: number): SubChunk {
		if (index < 0 || index > 16) {
			throw new Error(`Invalid subchunk height: ${index}`);
		}

		if (this.subchunks[index] === undefined) {
			this.subchunks[index] = new SubChunk();
		}

		return this.subchunks[index];
	}

	public setBlock(x: number, y: number, z: number, id: number): void {
		const subChunk = this.getSubChunk(y >> 4);
		subChunk.setBlock(x, y & 0xf, z, id);
	}

	public getBlock(x: number, y: number, z: number): number {
		const subChunk = this.getSubChunk(y >> 4);
		return subChunk.getBlock(x, y & 0xf, z);
	}

	public getSubChunkSendCount(): number {
		let topEmpty = 0;
		for (let ci = 16 - 1; ci >= 0; ci--) {
			if (this.subchunks[ci].isEmpty()) {
				topEmpty++;
			} else {
				break;
			}
		}

		return 16 - topEmpty;
	}

	public serialize(): Buffer {
		const stream = new BinaryStream();

		// for (let y = 0; y < 4; ++y) {
		// 	stream.writeByte(8); // subchunk version 8
		// 	stream.writeByte(0); // 0 layers (all air)
		// }

		for (let i = 0; i < this.getSubChunkSendCount(); ++i) {
			this.subchunks[i].serialize(stream);
		}

		for (let i = 0; i < 24; i++) {
			stream.writeByte(0); // fake biome palette, non persistent
			stream.writeVarInt(1 << 1); // plains
		}

		stream.writeByte(0); // border ?

		return stream.getBuffer();
	}
}

export { ChunkColumn };
