import type { MappedBlock } from './Mapper';
import type { BlockPermutation } from './Permutation';

class BlockType {
	protected readonly version: number;

	public readonly identifier: string;

	public readonly permutations: BlockPermutation[];

	public constructor(version: number, identifier: string) {
		this.version = version;
		this.identifier = identifier;
		this.permutations = [];
	}

	public getDefaultPermutation(): BlockPermutation {
		return this.permutations[0];
	}
}

export { BlockType };
