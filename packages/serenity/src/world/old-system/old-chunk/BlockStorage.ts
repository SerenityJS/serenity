import { Endianness, type BinaryStream } from '@serenityjs/binarystream';

class BlockStorage {
	public static readonly MAX_X = 16;
	public static readonly MAX_Y = 16;
	public static readonly MAX_Z = 16;

	public readonly palette: number[];
	public readonly blocks: number[];

	public constructor(palette?: number[], blocks?: number[]) {
		this.palette = palette ?? [11_881]; // Air
		this.blocks =
			blocks ?? Array.from({ length: BlockStorage.MAX_X * BlockStorage.MAX_Y * BlockStorage.MAX_Z }, () => 0);
	}

	public static getIndex(bx: number, by: number, bz: number): number {
		return (bx << 8) | (bz << 4) | by;
	}

	public isEmpty(): boolean {
		// Check if the palette length is only 1.
		// This means that the palette only contains air.
		return this.palette.length === 1;
	}

	public setBlock(bx: number, by: number, bz: number, runtimeId: number): void {
		// Check if the block is already in the palette.
		let paletteIndex = this.palette.indexOf(runtimeId);
		if (paletteIndex === -1) {
			// Add the runtime ID to the palette.
			paletteIndex = this.palette.push(runtimeId) - 1;
		}

		// Get the index of the block.
		const blockIndex = BlockStorage.getIndex(bx, by, bz);

		// Set the block according to the index.
		// Setting the data as the index of the palette.
		this.blocks[blockIndex] = paletteIndex;
	}

	public getBlock(bx: number, by: number, bz: number): number {
		// Get the index of the block.
		// Which is the index of the palette.
		const blockIndex = this.blocks[BlockStorage.getIndex(bx, by, bz)];

		// Get the runtime ID from the palette.
		// Return the runtime ID.
		return this.palette[blockIndex];
	}

	public serialize(stream: BinaryStream): void {
		// Calculate the bits per block.
		// Which is the log2 of the palette length.
		let bitsPerBlock = Math.ceil(Math.log2(this.palette.length));

		// Add padding to the bits per block if needed.
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

		// Write the bits per block.
		stream.writeByte((bitsPerBlock << 1) | 1);

		// Calculate the blocks per word & words per block.
		const blocksPerWord = Math.floor(32 / bitsPerBlock);
		const wordsPerBlock = Math.ceil(4_096 / blocksPerWord);

		// Write the word to the stream.
		let position = 0;
		for (let w = 0; w < wordsPerBlock; w++) {
			let word = 0;
			for (let block = 0; block < blocksPerWord; block++) {
				const state = this.blocks[position++];
				word |= state << (bitsPerBlock * block);
			}

			stream.writeInt32(word, Endianness.Little);
		}

		// Write the palette length.
		// And each runtime ID in the palette.
		stream.writeZigZag(this.palette.length);
		for (const runtimeId of this.palette) {
			stream.writeZigZag(runtimeId);
		}
	}
}

export { BlockStorage };
