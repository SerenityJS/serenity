import type { BinaryStream } from '@serenityjs/binarystream';
import { BlockStorage } from './BlockStorage';

class SubChunk {
	public readonly storages: BlockStorage[];

	public constructor(storages?: BlockStorage[]) {
		this.storages = storages ?? [];
	}

	public isEmpty(): boolean {
		for (const storage of this.storages) {
			if (!storage.isEmpty()) {
				return false;
			}
		}

		return true;
	}

	public getStorage(layer: number): BlockStorage {
		if (this.storages[layer] === undefined) {
			this.storages[layer] = new BlockStorage();
		}

		return this.storages[layer];
	}

	public setBlock(layer: number, x: number, y: number, z: number, id: number): void {
		const storage = this.getStorage(layer);
		storage.setBlock(x, y, z, id);
	}

	public serialize(stream: BinaryStream): void {
		stream.writeUint8(8);
		stream.writeUint8(this.storages.length);
		for (const storage of this.storages) {
			storage.serialize(stream);
		}
	}
}

export { SubChunk };
