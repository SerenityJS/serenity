import { Endianness, type BinaryStream } from '@serenityjs/binarystream';
import { BlockPermutation } from './block/Permutation';

// TODO: Add logged blocks, light blocks, and biomes.

/**
 * Represents a block storage.
 */
class BlockStorage {
	public static readonly MAX_X = 16;
	public static readonly MAX_Y = 16;
	public static readonly MAX_Z = 16;
	public static readonly MAX_SIZE = 16 * 16 * 16;

	protected readonly air: BlockPermutation;

	public readonly blocks: number[];
	public readonly palette: BlockPermutation[];

	/**
	 * Creates a new block storage.
	 *
	 * @param blocks The optional blocks.
	 * @param palette The optional palette.
	 */
	public constructor(blocks?: number[], palette?: BlockPermutation[]) {
		this.air = BlockPermutation.resolve('minecraft:air')!;
		this.blocks = blocks ?? Array.from({ length: new.target.MAX_SIZE }, () => 0);
		this.palette = palette ?? [this.air];
	}

	/**
	 * Calculates the index of the block.
	 *
	 * @param bx The x coordinate of the block.
	 * @param by The y coordinate of the block.
	 * @param bz The z coordinate of the block.
	 * @returns The index of the block.
	 */
	public static getIndex(bx: number, by: number, bz: number): number {
		return ((bx & 0xf) << 8) | ((bz & 0xf) << 4) | (by & 0xf);
	}

	/**
	 * Checks if the storage is empty.
	 *
	 * @returns True if the storage is empty, false otherwise.
	 */
	public isEmpty(): boolean {
		return this.palette.length === 1 && this.palette[0] === this.air;
	}

	/**
	 * Gets the block permutation at the given coordinates.
	 *
	 * @param bx The x coordinate of the block.
	 * @param by The y coordinate of the block.
	 * @param bz The z coordinate of the block.
	 * @returns The block permutation.
	 */
	public getPermutation(bx: number, by: number, bz: number): BlockPermutation {
		// Calculate the index.
		const index = BlockStorage.getIndex(bx, by, bz);

		// Get the palette index.
		const paletteIndex = this.blocks[index];

		// Return the block.
		return this.palette[paletteIndex];
	}

	/**
	 * Sets the block permutation at the given coordinates.
	 *
	 * @param bx The x coordinate of the block.
	 * @param by The y coordinate of the block.
	 * @param bz The z coordinate of the block.
	 * @param permutation The block permutation.
	 */
	public setPermutation(bx: number, by: number, bz: number, permutation: BlockPermutation): void {
		// Check if the permutation is in the palette.
		let paletteIndex = this.palette.indexOf(permutation);
		if (paletteIndex === -1) {
			// Add the permutation to the palette.
			paletteIndex = this.palette.push(permutation) - 1;
		}

		// Set the block.
		this.blocks[BlockStorage.getIndex(bx, by, bz)] = paletteIndex;
	}

	/**
	 * Serializes the block storage to a binary stream.
	 *
	 * @param stream The binary stream to write to.
	 */
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
		for (let w = 0; w < wordsPerBlock; w++) {
			let word = 0;
			for (let block = 0; block < blocksPerWord; block++) {
				word |= (this.blocks[w * blocksPerWord + block] & ((1 << bitsPerBlock) - 1)) << (bitsPerBlock * block);
			}

			stream.writeInt32(word, Endianness.Little);
		}

		// Write the palette.
		stream.writeZigZag(this.palette.length);
		for (const permutation of this.palette) {
			stream.writeZigZag(permutation.getRuntimeId());
		}
	}

	/**
	 * Deserializes the block storage from a binary stream.
	 *
	 * @param stream The binary stream to read from.
	 * @returns The block storage.
	 */
	public static deserialize(stream: BinaryStream): BlockStorage {
		// Read the bits per block.
		const bitsPerBlock = stream.readByte() >> 1;

		// Calculate the blocks per word & words per block.
		const blocksPerWord = Math.floor(32 / bitsPerBlock);
		const wordsPerBlock = Math.ceil(4_096 / blocksPerWord);

		// Read the blocks.
		const blocks: number[] = [];
		for (let w = 0; w < wordsPerBlock; w++) {
			const word = stream.readInt32(Endianness.Little);
			for (let block = 0; block < blocksPerWord; block++) {
				blocks.push((word >> (bitsPerBlock * block)) & ((1 << bitsPerBlock) - 1));
			}
		}

		// Read the palette.
		const palette: BlockPermutation[] = [];
		const paletteLength = stream.readZigZag();
		for (let i = 0; i < paletteLength; i++) {
			palette.push(BlockPermutation.resolveByRuntimeId(stream.readZigZag()));
		}

		// Return the block storage.
		return new BlockStorage(blocks, palette);
	}
}

export { BlockStorage };
