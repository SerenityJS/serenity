import { Endianness, type BinaryStream } from '@serenityjs/binarystream';

class BlockStorage {
	public readonly palette: number[];
	public readonly blocks: number[];

	public constructor(palette?: number[], blocks?: number[]) {
		this.palette = palette ?? [-158];
		this.blocks = blocks ?? Array.from({ length: 4_096 }, () => 0);
	}

	public static getIndex(bx: number, by: number, bz: number): number {
		return (bx << 8) | (bz << 4) | by;
	}

	public static checkBounds(bx: number, by: number, bz: number): boolean {
		return bx >= 0 && bx < 16 && by >= 0 && by < 16 && bz >= 0 && bz < 16;
	}

	public isEmpty(): boolean {
		return this.palette.length === 1;
	}

	public setBlock(bx: number, by: number, bz: number, id: number): void {
		const paletteIndex = this.palette.indexOf(id);
		if (paletteIndex === -1) {
			this.palette.push(id);
			this.blocks[BlockStorage.getIndex(bx, by, bz)] = this.palette.length - 1;
		} else {
			this.blocks[BlockStorage.getIndex(bx, by, bz)] = paletteIndex;
		}
	}

	public getBlock(bx: number, by: number, bz: number): number {
		const blockIndex = BlockStorage.getIndex(bx, by, bz);
		const paletteIndex = this.blocks[blockIndex];
		return this.palette[paletteIndex];
	}

	public serialize(stream: BinaryStream): void {
		let bitsPerBlock = Math.ceil(Math.log2(this.palette.length));
		switch (bitsPerBlock) {
			case 0:
				bitsPerBlock = 1;
				break;
			case 1:
			case 2:
			case 3:
			case 4:
			case 5:
			case 6:
				break;
			case 7:
			case 8:
				bitsPerBlock = 8;
				break;
			default:
				bitsPerBlock = 16;
				break;
		}

		stream.writeUint8((bitsPerBlock << 1) | 1);

		const blocksPerWord = Math.floor(32 / bitsPerBlock);
		const wordsPerChunk = Math.ceil(4_096 / blocksPerWord);

		let pos = 0;
		for (let i = 0; i < wordsPerChunk; i++) {
			let word = 0;
			for (let block = 0; block < blocksPerWord; block++) {
				if (pos >= 4_096) {
					break;
				}

				const state = this.blocks[pos++];
				word |= state << (block * bitsPerBlock);
			}

			stream.writeInt32(word, Endianness.Little);
		}

		stream.writeVarInt(this.palette.length);
		for (const val of this.palette) {
			stream.writeZigZag(val);
		}
	}
}

export { BlockStorage };
