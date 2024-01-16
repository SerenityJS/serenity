import type { Buffer } from 'node:buffer';
import { BinaryStream } from '@serenityjs/binarystream';
import { SubChunk } from './SubChunk';

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

	public setBlock(layer: number, x: number, y: number, z: number, id: number): void {
		const subChunk = this.getSubChunk(y >> 4);
		subChunk.setBlock(layer, x, y & 0xf, z, id);
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

		console.log(16 - topEmpty);

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
