import type { BinaryStream } from '@serenityjs/binarystream';
import { BlockStorage } from './BlockStorage';

class SubChunk {
	public readonly version: number;
	public readonly storages: BlockStorage[];

	public constructor(version?: number, storages?: BlockStorage[]) {
		this.version = version ?? 8;
		this.storages = storages ?? [];
	}

	public isEmpty(): boolean {
		// Loop through each storage.
		for (const storage of this.storages) {
			// Check if the storage is empty.
			if (!storage.isEmpty()) {
				// The sub chunk is not empty.
				return false;
			}
		}

		// The sub chunk is empty.
		return true;
	}

	public getStorage(index: number): BlockStorage {
		// Check if the storage exists.
		if (!this.storages[index]) {
			// Create a new storage.
			for (let i = 0; i <= index; i++) {
				if (!this.storages[i]) {
					this.storages[i] = new BlockStorage();
				}
			}
		}

		// Return the storage.
		return this.storages[index];
	}

	public setBlock(bx: number, by: number, bz: number, runtimeId: number, layer: number): void {
		// Get the storage.
		const storage = this.getStorage(layer);

		// Set the block.
		storage.setBlock(bx, by, bz, runtimeId);
	}

	public getBlock(bx: number, by: number, bz: number, layer: number): number {
		// Get the storage.
		const storage = this.getStorage(layer);

		// Get the block.
		return storage.getBlock(bx, by, bz);
	}

	public serialize(stream: BinaryStream): void {
		// Write the version.
		stream.writeUint8(this.version);

		// Write the storage count.
		stream.writeUint8(this.storages.length);

		// Loop through each storage and serialize it.
		for (const storage of this.storages) {
			storage.serialize(stream);
		}
	}
}

export { SubChunk };
