import type { BinaryStream } from '@serenityjs/binarystream';
import { Endianness } from '@serenityjs/binarystream';
import type { BlockPermutation } from './block';

export class SubChunkLayer {
	public static readonly MAX_X = 16;
	public static readonly MAX_Y = 16;
	public static readonly MAX_Z = 16;
	public static readonly MAX_SIZE = 16 * 16 * 16;

	/**
	 * Blocks voxel areay 16*16*16
	 */
	protected readonly blocks: (BlockPermutation | null | undefined)[];

	/**
	 * Palette mapping is used to map used Permutations
	 */
	protected readonly paletteMapping = new Map<BlockPermutation, number>();

	/**
	 * Number of not empty blocks, empty when zero
	 */
	protected notEmptyCount: bigint = 0n;

	/**
	 * Used with serialization
	 */
	protected readonly defaultPermutation;
	public constructor(defaultPermutation: BlockPermutation) {
		this.defaultPermutation = defaultPermutation;
		this.blocks = Array.from({ length: new.target.MAX_SIZE });
	}

	public static getIndex(bx: number, by: number, bz: number): number {
		return ((bx & 0xf) << 8) | ((bz & 0xf) << 4) | (by & 0xf);
	}

	public isEmpty(): boolean {
		return this.notEmptyCount === 0n;
	}

	public setBlock(bx: number, by: number, bz: number, p?: BlockPermutation): void {
		const index = SubChunkLayer.getIndex(bx, by, bz);
		let permutation = p;

		// defualt permutation should be mapped to undefined
		if (permutation === this.defaultPermutation) permutation = undefined;

		// if permutation is same as before just do nothing
		const oldPermutation = this.blocks[index];
		if (oldPermutation === permutation) return;

		// If permutation is empty or defualt it cleans that space
		if (permutation === undefined) this.notEmptyCount--;
		else {
			// When permutation is not empty we increase a paletteDefinitions and notEmptyCount
			const count = this.paletteMapping.get(permutation) ?? 0;
			this.paletteMapping.set(permutation, count + 1);
			this.notEmptyCount++;
		}

		// if old permutation wasn't undefined we updates states if palettes
		if (oldPermutation) {
			const count = this.paletteMapping.get(oldPermutation) ?? 0;
			if (count <= 1) this.paletteMapping.delete(oldPermutation);
			else this.paletteMapping.set(oldPermutation, count - 1);
		}

		this.blocks[index] = permutation;
	}

	public getBlock(bx: number, by: number, bz: number): BlockPermutation {
		// Get the index of the block.
		// Which is the index of the palette.
		return this.blocks[SubChunkLayer.getIndex(bx, by, bz)] ?? this.defaultPermutation;
	}

	public serialize(stream: BinaryStream): void {
		// Calculate the bits per block.
		// Which is the log2 of the palette length.
		let bitsPerBlock = Math.ceil(Math.log2(this.paletteMapping.size)) + 1; // Defualt must be always included

		// Using this palete for mapping a permutations to palete indexes
		const palette = new Map<BlockPermutation, number>();
		// Skiping Zero for defualt permutation
		let index = 1;
		for (const [k, v] of this.paletteMapping.entries()) palette.set(k, index++);

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
				const state = palette.get(this.blocks[position++] as BlockPermutation) ?? 0;
				word |= state << (bitsPerBlock * block);
			}

			stream.writeInt32(word, Endianness.Little);
		}

		// Write the palette length.
		// And each runtime ID in the palette.
		stream.writeZigZag(palette.size + 1);
		// Adding defualt 0 permutation
		stream.writeZigZag(this.defaultPermutation.runtimeId);
		// Serializing palette
		for (const permutation of palette.keys()) stream.writeZigZag(permutation.runtimeId);
	}
}
export class SubChunk {
	public readonly version: number;
	public readonly layers: SubChunkLayer[];
	public readonly defaultPermutation: BlockPermutation;
	public constructor(defualtPermutation: BlockPermutation, version?: number) {
		this.version = version ?? 8;
		this.layers = [];
		this.defaultPermutation = defualtPermutation;
	}

	public isEmpty(): boolean {
		// Loop through each storage.
		for (const storage of this.layers) {
			// Check if the storage is empty.
			if (!storage.isEmpty()) {
				// The sub chunk is not empty.
				return false;
			}
		}

		// The sub chunk is empty.
		return true;
	}

	public getLayer(index: number): SubChunkLayer {
		// Check if the storage exists.
		if (!this.layers[index]) {
			// Create a new storage.
			for (let i = 0; i <= index; i++) {
				if (!this.layers[i]) this.layers[i] = new SubChunkLayer(this.defaultPermutation);
			}
		}

		// Return the storage.
		return this.layers[index];
	}

	public setBlock(bx: number, by: number, bz: number, permutation?: BlockPermutation, layer?: number): void {
		// Get the storage.
		const storage = this.getLayer(layer ?? 0);

		// Set the block.
		storage.setBlock(bx, by, bz, permutation);
	}

	public getBlock(bx: number, by: number, bz: number, layer: number): BlockPermutation {
		// Get the storage.
		const storage = this.getLayer(layer);

		// Get the block.
		return storage.getBlock(bx, by, bz);
	}

	public serialize(stream: BinaryStream): void {
		// Write the version.
		stream.writeUint8(this.version);

		// Write the storage count.
		stream.writeUint8(this.layers.length);

		// Loop through each storage and serialize it.
		for (const storage of this.layers) {
			storage.serialize(stream);
		}
	}
}
