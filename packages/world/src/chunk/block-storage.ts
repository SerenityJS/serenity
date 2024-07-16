import { Endianness, type BinaryStream } from "@serenityjs/binarystream";
import { BlockPermutation, BlockIdentifier } from "@serenityjs/block";
import { CompoundTag } from "@serenityjs/nbt";

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
	public static serialize(
		storage: BlockStorage,
		stream: BinaryStream,
		nbt = false
	): void {
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

		// Write the palette length based on if the palette is stored in NBT.
		// If the palette is stored in NBT, we write it as an integer.
		if (nbt) stream.writeInt32(storage.palette.length, Endianness.Little);
		else stream.writeZigZag(storage.palette.length);

		// Iterate over the palette.
		for (const state of storage.palette) {
			// Check if the palette is stored in NBT.
			if (nbt) {
				// Get the block permutation.
				const permutation = BlockPermutation.permutations.get(state);

				// Check if the permutation exists.
				if (!permutation)
					throw new Error(`Unknown permutation state: ${state}`);

				// Serialize the permutation state to NBT.
				const nbt = BlockPermutation.toNbt(permutation);

				// Write the NBT to the stream.
				CompoundTag.write(stream, nbt);
			} else {
				// Write the state to the stream
				stream.writeZigZag(state);
			}
		}
	}

	/**
	 * Deserializes the block storage from a binary stream.
	 *
	 * @param stream The binary stream to read from.
	 * @returns The block storage.
	 */
	public static deserialize(stream: BinaryStream, nbt = false): BlockStorage {
		// Read the palette and flag.
		const paletteAndFlag = stream.readByte();

		// Check if the palette is using runtime IDs.
		const _isRuntime = (paletteAndFlag & 1) !== 0;

		// if (isRuntime) throw new Error("Runtime palette is not supported yet.");
		const bitsPerBlock = paletteAndFlag >> 1;
		const blocksPerWord = Math.floor(32 / bitsPerBlock);
		const wordsPerChunk = Math.ceil(4096 / blocksPerWord);

		const words = Array.from<number>({ length: wordsPerChunk });
		for (let index = 0; index < wordsPerChunk; index++) {
			words[index] = stream.readInt32(Endianness.Little);
		}

		// Read the palette size based on if the palette is stored in NBT.
		// If the palette is stored in NBT, we read it as an integer.
		const paletteSize = nbt
			? stream.readInt32(Endianness.Little)
			: stream.readZigZag();

		// Create the palette based on the palette size.
		// Iterate over the palette size reading the states.
		const palette = Array.from<number>({ length: paletteSize });
		for (let index = 0; index < paletteSize; index++) {
			// Check if the palette is stored in NBT.
			if (nbt) {
				// Read the permutation state nbt.
				const nbt = CompoundTag.read(stream);

				// Get the block permutation from the state nbt.
				const permutation = BlockPermutation.fromNbt(nbt);

				// Check if the permutation exists
				if (!permutation)
					throw new Error(`Unknown permutation state: ${nbt.valueOf(true)}`);

				// Add the state to the palette.
				palette[index] = permutation.network;
			} else {
				palette[index] = stream.readZigZag();
			}
		}

		// Create the blocks array.
		const blocks = Array.from<number>({ length: 4096 });
		let position = 0;

		// Iterate over the words and convert them to blocks.
		for (let index = 0; index < wordsPerChunk; index++) {
			// Get the word from the words array.
			const word = words[index] as number;

			// Iterate over the blocks in the word.
			for (let offset = 0; offset < blocksPerWord; offset++) {
				// Get the state from the word.
				const state =
					(word >> ((position % blocksPerWord) * bitsPerBlock)) &
					((1 << bitsPerBlock) - 1);

				// Calculate the x, y, and z coordinates based on the position.
				const x = (position >> 8) & 0xf;
				const y = position & 0xf;
				const z = (position >> 4) & 0xf;

				// Add the state to the blocks array.
				blocks[BlockStorage.getIndex(x, y, z)] = state;
				position++;
			}
		}

		// Return the block storage.
		return new BlockStorage(palette, blocks);
	}
}

export { BlockStorage };
