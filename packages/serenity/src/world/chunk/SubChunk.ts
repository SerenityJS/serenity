import type { BinaryStream } from '@serenityjs/binarystream';

// NOTE: This is a temporary implementation of the subchunk class.
// I do not believe this is the best way to implement this, but it works for now.
// I'm not smart enough to figure out how to implement this properly at the moment lol.

class SubChunk {
	public readonly blocks: number[];

	public constructor(blocks?: number[]) {
		this.blocks = blocks ?? Array.from({ length: 4_096 }, () => 0);
	}

	public static getIndexOf(bx: number, by: number, bz: number): number {
		return (bx << 8) | (bz << 4) | by;
	}

	public isEmpty(): boolean {
		for (const block of this.blocks) {
			if (block !== 0) {
				return false;
			}
		}

		return true;
	}

	public setBlock(bx: number, by: number, bz: number, id: number): number {
		const index = SubChunk.getIndexOf(bx, by, bz);
		this.blocks[index] = id;

		return index;
	}

	public getBlock(bx: number, by: number, bz: number): number {
		const index = SubChunk.getIndexOf(bx, by, bz);

		return this.blocks[index];
	}

	public serialize(stream: BinaryStream): void {
		stream.writeUint8(0); // Layer id? 0 = solid, 1 = liquid
		stream.write(this.blocks);
	}
}

export { SubChunk };
