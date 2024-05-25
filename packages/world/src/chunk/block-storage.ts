import { Endianness, type BinaryStream } from "@serenityjs/binarystream";
import { BlockPermutation, BlockIdentifier } from "@serenityjs/block";

// TODO: Add logged blocks, light blocks, and biomes.

/**
 * Represents a block storage.
 */
class BlockStorage {
	/**
	 * The maximum chunk size in the x direction.
	 */
	public static readonly MAX_X = 16;

	/**
	 * The maximum chunk size in the y direction.
	 */
	public static readonly MAX_Y = 16;

	/**
	 * The maximum chunk size in the z direction.
	 */
	public static readonly MAX_Z = 16;

	/**
	 * The total maximum chunk size.
	 */
	public static readonly MAX_SIZE = 16 * 16 * 16;

	/**
	 * The palette of the storage.
	 */
	public readonly palette: Array<number>;

	/**
	 * The blocks of the storage.
	 */
	public readonly blocks: Array<number>;

	/**
	 * The air value of the storage.
	 */
	public readonly air: number;

	/**
	 * Creates a new block storage.
	 *
	 * @param blocks The optional blocks.
	 * @param palette The optional palette.
	 */
	public constructor(palette?: Array<number>, blocks?: Array<number>) {
		// Find the air value.
		const permutation = BlockPermutation.resolve(BlockIdentifier.Air);
		this.air = permutation.network;

		// Assign the palette.
		// When we create chunks, we will provide the palette with the current air value.
		this.palette = palette ?? [this.air];

		// Create the block storage.
		this.blocks =
			blocks ?? Array.from({ length: BlockStorage.MAX_SIZE }, () => 0);
	}

	/**
	 * Checks if the block storage is empty.
	 */
	public isEmpty(): boolean {
		return this.palette.length === 1 && this.palette[0] === this.air;
	}

	/**
	 * Gets the block state at the given coordinates.
	 *
	 * @param bx The x coordinate of the block.
	 * @param by The y coordinate of the block.
	 * @param bz The z coordinate of the block.
	 * @returns The block state.
	 */
	public getState(bx: number, by: number, bz: number): number {
		// Calculate the index.
		const index = BlockStorage.getIndex(bx, by, bz);

		// Get the palette index.
		const paletteIndex = this.blocks[index] ?? 0;

		// Return the block.
		return this.palette[paletteIndex] ?? this.air;
	}

	/**
	 * Sets the block state at the given coordinates.
	 *
	 * @param bx The x coordinate of the block.
	 * @param by The y coordinate of the block.
	 * @param bz The z coordinate of the block.
	 * @param state The block state.
	 */
	public setState(bx: number, by: number, bz: number, state: number): void {
		// Check if the state exists in the palette.
		let paletteIndex = this.palette.indexOf(state);
		if (paletteIndex === -1) {
			// Add the state to the palette.
			paletteIndex = this.palette.push(state) - 1;
		}

		// Set the block state.
		this.blocks[BlockStorage.getIndex(bx, by, bz)] = paletteIndex;
	}

	/**
	 * Calculates the index of the block position.
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
	 * Serializes the block storage to a binary stream.
	 *
	 * @param stream The binary stream to write to.
	 */
	public static serialize(storage: BlockStorage, stream: BinaryStream): void {
		// Calculate the bits per block.
		// Which is the log2 of the palette length.
		let bitsPerBlock = Math.ceil(Math.log2(storage.palette.length));

		// Add padding to the bits per block if needed.
		switch (bitsPerBlock) {
			case 0: {
				bitsPerBlock = 1;
				break;
			}
			case 1:
			case 2:
			case 3:
			case 4:
			case 5:
			case 6: {
				break;
			}
			case 7:
			case 8: {
				bitsPerBlock = 8;
				break;
			}
			default: {
				bitsPerBlock = 16;
				break;
			}
		}

		// Write the bits per block.
		stream.writeByte((bitsPerBlock << 1) | 1);

		// Calculate the blocks per word & words per block.
		const blocksPerWord = Math.floor(32 / bitsPerBlock);
		const wordsPerBlock = Math.ceil(4096 / blocksPerWord);

		// Iterate over the words.
		for (let w = 0; w < wordsPerBlock; w++) {
			// Prepare the word.
			let word = 0;

			// Iterate over the blocks.
			for (let block = 0; block < blocksPerWord; block++) {
				// Calculate the block index.
				word |=
					(storage.blocks[w * blocksPerWord + block] ??
						0 & ((1 << bitsPerBlock) - 1)) <<
					(bitsPerBlock * block);
			}

			// Write the word to the stream.
			stream.writeInt32(word, Endianness.Little);
		}

		// Write the palette length.
		stream.writeZigZag(storage.palette.length);

		// Iterate over the palette.
		for (const state of storage.palette) {
			// Write the state to the stream.
			stream.writeZigZag(state);
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
		const wordsPerBlock = Math.ceil(4096 / blocksPerWord);

		// Read the blocks.
		const palette: Array<number> = [];
		for (let w = 0; w < wordsPerBlock; w++) {
			// Read the word from the stream.
			const word = stream.readInt32(Endianness.Little);

			// Iterate over the blocks.
			for (let block = 0; block < blocksPerWord; block++) {
				// Calculate the block index.
				const index = w * blocksPerWord + block;

				// Calculate the state.
				const state =
					(word >> (bitsPerBlock * block)) & ((1 << bitsPerBlock) - 1);

				// Add the state to the palette.
				palette[index] = state;
			}
		}

		// Prepare the palette.
		const blocks: Array<number> = [];

		// Read the palette length.
		const blocksLength = stream.readZigZag();

		// Iterate over the palette.
		for (let index = 0; index < blocksLength; index++) {
			// Read the state from the stream.
			const state = stream.readZigZag();

			// Add the state to the palette.
			blocks.push(state);
		}

		// Return the block storage.
		return new BlockStorage(blocks, palette);
	}
}

export { BlockStorage };
