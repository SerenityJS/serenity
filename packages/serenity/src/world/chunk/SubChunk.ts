import type { BinaryStream } from '@serenityjs/binarystream';
import { BlockStorage } from './BlockStorage';
import type { BlockPermutation } from './block';

/**
 * Represents a sub chunk.
 */
export class SubChunk {
	public readonly version: number;
	public readonly layers: BlockStorage[];

	/**
	 * Creates a new sub chunk.
	 *
	 * @param version The version of the sub chunk.
	 * @param layers The layers of the sub chunk.
	 */
	public constructor(version?: number, layers?: BlockStorage[]) {
		this.version = version ?? 8;
		this.layers = layers ?? [];
	}

	/**
	 * Checks if the sub chunk is empty.
	 *
	 * @returns True if the sub chunk is empty, false otherwise.
	 */
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

	/**
	 * Gets the block storage at the given index.
	 *
	 * @param index The index of the storage.
	 * @returns The block storage.
	 */
	public getLayer(index: number): BlockStorage {
		// Check if the storage exists.
		if (!this.layers[index]) {
			// Create a new storage.
			for (let i = 0; i <= index; i++) {
				if (!this.layers[i]) this.layers[i] = new BlockStorage();
			}
		}

		// Return the storage.
		return this.layers[index];
	}

	/**
	 * Gets the block permutation at the given coordinates.
	 *
	 * @param bx The x coordinate of the block.
	 * @param by The y coordinate of the block.
	 * @param bz The z coordinate of the block.
	 * @param layer The storage layer type. (0 = Normal Blocks, 1 = Water Logged Blocks)
	 * @returns The block permutation.
	 */
	public getPermutation(bx: number, by: number, bz: number, layer: number): BlockPermutation {
		// Get the storage.
		const storage = this.getLayer(layer);

		// Get the block.
		return storage.getPermutation(bx, by, bz);
	}

	/**
	 * Sets the block permutation at the given coordinates.
	 *
	 * @param bx The x coordinate of the block.
	 * @param by The y coordinate of the block.
	 * @param bz The z coordinate of the block.
	 * @param permutation The block permutation.
	 * @param layer The storage layer type. (0 = Normal Blocks, 1 = Water Logged Blocks)
	 */
	public setPermutation(bx: number, by: number, bz: number, permutation: BlockPermutation, layer?: number): void {
		// Get the storage.
		const storage = this.getLayer(layer ?? 0);

		// Set the block.
		storage.setPermutation(bx, by, bz, permutation);
	}

	/**
	 * Serializes the sub chunk.
	 *
	 * @param stream The binary stream to write to.
	 */
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

	/**
	 * Deserializes the sub chunk.
	 *
	 * @param stream The binary stream to read from.
	 */
	public static deserialize(stream: BinaryStream): SubChunk {
		// Read the version.
		const version = stream.readUint8();

		// Read the storage count.
		const count = stream.readUint8();

		// Loop through each storage and deserialize it.
		const layers: BlockStorage[] = [];
		for (let i = 0; i < count; i++) {
			layers.push(BlockStorage.deserialize(stream));
		}

		// Return the sub chunk.
		return new SubChunk(version, layers);
	}
}
